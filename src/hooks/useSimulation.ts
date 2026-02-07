import { useState, useCallback, useMemo, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import {
  Scenario,
  ScenarioInputs,
  SimulationType,
  ForecastMetric,
  SCENARIO_COLORS,
  parseNLPScenario,
  type SimulationBaseline,
} from "@/data/simulationData";
import { getQuantOutputs } from "@/services/quantService";
import type { QuantMetric, QuantOutputs, ScenarioDefinition } from "@/quant/types";

let idCounter = 0;

// ─── Metric Mapping ─────────────────────────────────────────────────────────

const METRIC_MAP: Record<ForecastMetric, QuantMetric> = {
  balance: "total_balance",
  cashflow: "cash_flow",
  expenses: "expenses",
  savings: "savings_rate",
};

// ─── Default Inputs ─────────────────────────────────────────────────────────

function getDefaultInputs(type: SimulationType, bl: SimulationBaseline): ScenarioInputs {
  switch (type) {
    case "budgeting":
      return { type: "budgeting", data: { preset: "50/30/20", needs: 50, wants: 30, savings: 20 } };
    case "habits":
      return { type: "habits", data: { reduceDiningOut: 0, capRideshare: bl.rideshare, increaseGroceries: 0 } };
    case "subscriptions": {
      const toggles: Record<string, boolean> = {};
      bl.subscriptions.forEach(sub => { toggles[sub.name] = true; });
      return { type: "subscriptions", data: { toggles } };
    }
    case "one-time":
      return { type: "one-time", data: { amount: 500, month: 3 } };
    case "income":
      return { type: "income", data: { amount: 500, startMonth: 1 } };
  }
}

// ─── Convert Scenario to ScenarioDefinition ─────────────────────────────────

function toScenarioDefinition(scenario: Scenario): ScenarioDefinition {
  return {
    id: scenario.id,
    name: scenario.name,
    type: scenario.inputs.type,
    params: { ...scenario.inputs.data } as unknown as Record<string, unknown>,
  };
}

// ─── Suggestion Generator (from quant insights) ────────────────────────────

function generateQuantSuggestions(
  scenarios: Scenario[],
  quantResults: Map<string, QuantOutputs>,
  bl: SimulationBaseline
): string[] {
  const suggestions: string[] = [];

  // Pull insights from quant outputs
  for (const [, output] of quantResults) {
    if (output.insights.endDelta !== undefined && output.insights.endDelta !== 0) {
      const direction = output.insights.endDelta > 0 ? "gain" : "lose";
      const metricLabel = output.metric === "savings_rate" ? "savings rate" : output.metric.replace(/_/g, " ");
      suggestions.push(
        `This scenario could ${direction} ~$${Math.abs(Math.round(output.insights.endDelta)).toLocaleString()} in ${metricLabel} vs baseline`
      );
    }
    if (output.insights.bestMonth) {
      suggestions.push(
        `Peak performance expected in ${output.insights.bestMonth.date}`
      );
    }
  }

  // Scenario-specific suggestions
  for (const s of scenarios) {
    switch (s.inputs.type) {
      case "subscriptions": {
        const subData = s.inputs.data;
        const cancelled = bl.subscriptions.filter(
          sub => subData.toggles[sub.name] === false
        );
        if (cancelled.length > 0) {
          const total = cancelled.reduce((a, c) => a + c.cost, 0);
          suggestions.push(`Cancelling ${cancelled.map(c => c.name).join(", ")} saves ~$${total.toFixed(0)}/mo`);
        }
        break;
      }
      case "habits": {
        const d = s.inputs.data;
        if (d.reduceDiningOut > 0) {
          suggestions.push(`Cutting dining out by $${d.reduceDiningOut}/wk saves ~$${(d.reduceDiningOut * 4).toFixed(0)}/mo`);
        }
        break;
      }
      case "budgeting": {
        const d = s.inputs.data;
        suggestions.push(`${d.savings}% savings rate targets ~$${Math.round(bl.monthlyIncome * d.savings / 100)}/mo saved`);
        break;
      }
      case "income": {
        const d = s.inputs.data;
        suggestions.push(`Extra $${d.amount}/mo starting month ${d.startMonth} adds ~$${d.amount * (10 - d.startMonth + 1)} over the forecast`);
        break;
      }
      case "one-time": {
        const d = s.inputs.data;
        suggestions.push(`One-time $${d.amount} purchase in month ${d.month} temporarily reduces your balance`);
        break;
      }
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Try adjusting your budget allocations to see the impact on savings",
      "Consider which subscriptions provide the most value",
      "Small habit changes compound over time"
    );
  }

  return suggestions.slice(0, 5);
}

// ─── Question Generator ─────────────────────────────────────────────────────

function generateQuestion(scenarios: Scenario[], metric: ForecastMetric): string {
  if (scenarios.length === 0) {
    return "What area of your spending would you like to optimize first?";
  }
  const questions: Record<ForecastMetric, string[]> = {
    balance: [
      "Do you want to prioritize stability or maximum growth?",
      "What's your target balance by end of year?",
    ],
    cashflow: [
      "Should we optimize for consistent monthly cash flow?",
      "Are there months where you expect irregular expenses?",
    ],
    expenses: [
      "Which expense categories feel least essential to you?",
      "Would you prefer gradual or aggressive expense cuts?",
    ],
    savings: [
      "What savings rate feels sustainable long-term?",
      "Should we optimize for end-of-semester cash?",
    ],
  };
  const pool = questions[metric];
  return pool[scenarios.length % pool.length];
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSimulation() {
  const { baseline, transactions, balances, timeRangeDays, seedInfo } = useData();

  const [simulationType, setSimulationType] = useState<SimulationType>("budgeting");
  const [scenarioName, setScenarioName] = useState("Scenario A");
  const [currentInputs, setCurrentInputs] = useState<ScenarioInputs>(getDefaultInputs("budgeting", baseline));
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [metric, setMetric] = useState<ForecastMetric>("balance");

  // Quant engine results
  const [quantBaseline, setQuantBaseline] = useState<QuantOutputs | null>(null);
  const [quantScenarios, setQuantScenarios] = useState<Map<string, QuantOutputs>>(new Map());

  const quantMetric = METRIC_MAP[metric];

  // Run quant engine for baseline whenever metric/data changes
  useEffect(() => {
    let cancelled = false;

    getQuantOutputs({
      metric: quantMetric,
      timeRangeDays,
      transactions,
      balances,
      dataSeed: seedInfo.sessionSeed,
    }).then(result => {
      if (!cancelled) setQuantBaseline(result);
    });

    return () => { cancelled = true; };
  }, [quantMetric, timeRangeDays, transactions, balances, seedInfo.sessionSeed]);

  // Run quant engine for each scenario
  useEffect(() => {
    let cancelled = false;

    if (scenarios.length === 0) {
      setQuantScenarios(new Map());
      return;
    }

    const promises = scenarios.map(async s => {
      const result = await getQuantOutputs({
        metric: quantMetric,
        timeRangeDays,
        transactions,
        balances,
        scenario: toScenarioDefinition(s),
        dataSeed: seedInfo.sessionSeed,
      });
      return [s.id, result] as const;
    });

    Promise.all(promises).then(results => {
      if (!cancelled) {
        setQuantScenarios(new Map(results));
      }
    });

    return () => { cancelled = true; };
  }, [scenarios, quantMetric, timeRangeDays, transactions, balances, seedInfo.sessionSeed]);

  const handleTypeChange = useCallback((type: SimulationType) => {
    setSimulationType(type);
    setCurrentInputs(getDefaultInputs(type, baseline));
  }, [baseline]);

  const updateInputs = useCallback(<T extends ScenarioInputs["data"]>(updater: (prev: T) => T) => {
    setCurrentInputs(prev => ({
      ...prev,
      data: updater(prev.data as T),
    } as ScenarioInputs));
  }, []);

  const addScenario = useCallback(() => {
    if (scenarios.length >= 4) return;
    const newScenario: Scenario = {
      id: `scenario-${++idCounter}`,
      name: scenarioName,
      inputs: currentInputs,
      color: SCENARIO_COLORS[scenarios.length % SCENARIO_COLORS.length],
    };
    setScenarios(prev => [...prev, newScenario]);
    setScenarioName(`Scenario ${String.fromCharCode(65 + scenarios.length + 1)}`);
  }, [scenarios, scenarioName, currentInputs]);

  const removeScenario = useCallback((id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  }, []);

  const resetAll = useCallback(() => {
    setScenarios([]);
    setCurrentInputs(getDefaultInputs(simulationType, baseline));
    setScenarioName("Scenario A");
  }, [simulationType, baseline]);

  const addFromNLP = useCallback((text: string): boolean => {
    const parsed = parseNLPScenario(text, baseline);
    if (!parsed || scenarios.length >= 4) return false;
    const newScenario: Scenario = {
      id: `scenario-${++idCounter}`,
      name: `"${text.slice(0, 30)}${text.length > 30 ? "…" : ""}"`,
      inputs: parsed,
      color: SCENARIO_COLORS[scenarios.length % SCENARIO_COLORS.length],
    };
    setScenarios(prev => [...prev, newScenario]);
    return true;
  }, [scenarios, baseline]);

  // Build forecast data from quant outputs
  const forecastData = useMemo(() => {
    if (!quantBaseline || quantBaseline.baseline.length === 0) {
      // Fallback: empty chart
      return [];
    }

    return quantBaseline.baseline.map((bp, i) => {
      const point: Record<string, number | string> = {
        month: bp.date,
        Baseline: bp.value,
      };

      // Add scenario series from quant results
      for (const s of scenarios) {
        const qResult = quantScenarios.get(s.id);
        if (qResult && qResult.scenarios.length > 0 && qResult.scenarios[0].series[i]) {
          point[s.name] = qResult.scenarios[0].series[i].value;
        }
      }

      return point;
    });
  }, [quantBaseline, quantScenarios, scenarios]);

  // Summary cards from quant insights
  const summaryCards = useMemo(() => {
    if (scenarios.length === 0 || quantScenarios.size === 0) return null;

    const lastScenario = scenarios[scenarios.length - 1];
    const qResult = quantScenarios.get(lastScenario.id);
    if (!qResult || qResult.scenarios.length === 0) return null;

    const series = qResult.scenarios[0].series;
    const best = series.reduce((max, p) => (p.value > max.value ? p : max), series[0]);
    const worst = series.reduce((min, p) => (p.value < min.value ? p : min), series[0]);

    return {
      best: { month: best.date, value: best.value },
      worst: { month: worst.date, value: worst.value },
      endDelta: qResult.insights.endDelta ?? 0,
      scenarioName: lastScenario.name,
    };
  }, [scenarios, quantScenarios]);

  // Suggestions from quant insights + rule-based
  const suggestions = useMemo(
    () => generateQuantSuggestions(scenarios, quantScenarios, baseline),
    [scenarios, quantScenarios, baseline]
  );

  const question = useMemo(() => generateQuestion(scenarios, metric), [scenarios, metric]);

  return {
    simulationType,
    setSimulationType: handleTypeChange,
    scenarioName,
    setScenarioName,
    currentInputs,
    updateInputs,
    scenarios,
    addScenario,
    removeScenario,
    resetAll,
    addFromNLP,
    metric,
    setMetric,
    forecastData,
    summaryCards,
    suggestions,
    question,
  };
}
