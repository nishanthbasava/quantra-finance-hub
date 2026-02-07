import { useState, useCallback, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import {
  Scenario,
  ScenarioInputs,
  SimulationType,
  ForecastMetric,
  BudgetingInputs,
  HabitInputs,
  SubscriptionInputs,
  OneTimeInputs,
  IncomeInputs,
  SCENARIO_COLORS,
  generateBaseline,
  generateScenarioForecast,
  generateSuggestions,
  generateQuestion,
  parseNLPScenario,
  type SimulationBaseline,
} from "@/data/simulationData";

let idCounter = 0;

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

export function useSimulation() {
  const { baseline } = useData();

  const [simulationType, setSimulationType] = useState<SimulationType>("budgeting");
  const [scenarioName, setScenarioName] = useState("Scenario A");
  const [currentInputs, setCurrentInputs] = useState<ScenarioInputs>(getDefaultInputs("budgeting", baseline));
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [metric, setMetric] = useState<ForecastMetric>("balance");

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

  const forecastData = useMemo(() => {
    const baselineData = generateBaseline(metric, baseline);
    const scenarioLines = scenarios.map(s => ({
      scenario: s,
      data: generateScenarioForecast(s, metric, baseline),
    }));

    return baselineData.map((bp, i) => {
      const point: Record<string, number | string> = { month: bp.month, Baseline: bp.value };
      scenarioLines.forEach(({ scenario, data }) => {
        point[scenario.name] = data[i].value;
      });
      return point;
    });
  }, [scenarios, metric, baseline]);

  const summaryCards = useMemo(() => {
    if (scenarios.length === 0) return null;
    const lastScenario = scenarios[scenarios.length - 1];
    const data = generateScenarioForecast(lastScenario, metric, baseline);
    const baselineData = generateBaseline(metric, baseline);

    const best = data.reduce((max, p) => (p.value > max.value ? p : max), data[0]);
    const worst = data.reduce((min, p) => (p.value < min.value ? p : min), data[0]);
    const endDelta = data[data.length - 1].value - baselineData[baselineData.length - 1].value;

    return { best, worst, endDelta, scenarioName: lastScenario.name };
  }, [scenarios, metric, baseline]);

  const suggestions = useMemo(() => generateSuggestions(scenarios, baseline), [scenarios, baseline]);
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
