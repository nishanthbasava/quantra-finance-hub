// ─── Quant Engine ────────────────────────────────────────────────────────────
// Deterministic forecast model using exponential smoothing + seasonality.
// Pure TypeScript, no external deps. Targets <50ms on demo data.

import { SeededRNG } from "@/lib/rng";
import type { Transaction } from "@/data/transactionData";
import type {
  QuantInputs,
  QuantOutputs,
  QuantMetric,
  TimeSeriesPoint,
  BalanceSnapshot,
  ScenarioDefinition,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Group transactions by month key "YYYY-MM" */
function groupByMonth(txns: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  for (const t of txns) {
    const key = t.date.slice(0, 7); // yyyy-mm
    const arr = map.get(key);
    if (arr) arr.push(t);
    else map.set(key, [t]);
  }
  return map;
}

/** Get sorted month keys from transactions */
function getMonthKeys(txns: Transaction[]): string[] {
  const set = new Set<string>();
  for (const t of txns) set.add(t.date.slice(0, 7));
  return [...set].sort();
}

/** Format month key to short label */
function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return labels[parseInt(m) - 1] ?? m;
}

/** Advance a month key by N months */
function advanceMonth(key: string, n: number): string {
  const [y, m] = key.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

// ─── Metric Extraction ──────────────────────────────────────────────────────

interface MonthlyMetrics {
  income: number;
  expenses: number;
  cashFlow: number;
  balance: number;
  savingsRate: number;
}

function computeMonthlyMetrics(
  monthlyTxns: Map<string, Transaction[]>,
  months: string[],
  balances: BalanceSnapshot[]
): Map<string, MonthlyMetrics> {
  const result = new Map<string, MonthlyMetrics>();

  // Build a balance lookup by month
  const balanceByMonth = new Map<string, number>();
  for (const snap of balances) {
    const key = snap.date.slice(0, 7);
    balanceByMonth.set(key, snap.balance); // last snapshot of month wins
  }

  let runningBalance = balanceByMonth.get(months[0]) ?? 15000;

  for (const month of months) {
    const txns = monthlyTxns.get(month) ?? [];
    const income = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const cashFlow = income - expenses;
    runningBalance += cashFlow;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    result.set(month, {
      income: Math.round(income),
      expenses: Math.round(expenses),
      cashFlow: Math.round(cashFlow),
      balance: Math.round(runningBalance),
      savingsRate: Math.round(savingsRate * 10) / 10,
    });
  }

  return result;
}

function extractMetricSeries(
  metrics: Map<string, MonthlyMetrics>,
  months: string[],
  metric: QuantMetric
): number[] {
  return months.map(m => {
    const v = metrics.get(m);
    if (!v) return 0;
    switch (metric) {
      case "total_balance": return v.balance;
      case "cash_flow": return v.cashFlow;
      case "expenses": return v.expenses;
      case "income": return v.income;
      case "savings_rate": return v.savingsRate;
    }
  });
}

// ─── Exponential Smoothing ──────────────────────────────────────────────────

function exponentialSmoothing(series: number[], alpha: number): number[] {
  if (series.length === 0) return [];
  const smoothed = [series[0]];
  for (let i = 1; i < series.length; i++) {
    smoothed.push(alpha * series[i] + (1 - alpha) * smoothed[i - 1]);
  }
  return smoothed;
}

/** Simple rolling mean */
function rollingMean(series: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < series.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

// ─── Trend Estimation ───────────────────────────────────────────────────────

function estimateTrend(series: number[]): { slope: number; intercept: number } {
  const n = series.length;
  if (n < 2) return { slope: 0, intercept: series[0] ?? 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += series[i];
    sumXY += i * series[i];
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope: isFinite(slope) ? slope : 0, intercept: isFinite(intercept) ? intercept : series[0] ?? 0 };
}

// ─── Seasonality ────────────────────────────────────────────────────────────

function computeSeasonality(series: number[], smoothed: number[]): number[] {
  if (series.length === 0) return [];
  // Seasonal component = raw - smoothed
  return series.map((v, i) => v - smoothed[i]);
}

// ─── Scenario Delta Computation ─────────────────────────────────────────────

interface ScenarioDelta {
  monthlyExpenseDelta: number;
  monthlyIncomeDelta: number;
  oneTimeMonth?: number;
  oneTimeAmount?: number;
}

function computeScenarioDelta(
  scenario: ScenarioDefinition,
  baselineMonthlyIncome: number,
  baselineMonthlyExpenses: number,
  baselineSubscriptions: { name: string; cost: number }[],
  baselineRideshare: number
): ScenarioDelta {
  const p = scenario.params;

  switch (scenario.type) {
    case "budgeting": {
      const needs = (p.needs as number) ?? 50;
      const wants = (p.wants as number) ?? 30;
      const targetExpenses = baselineMonthlyIncome * ((needs + wants) / 100);
      return { monthlyExpenseDelta: baselineMonthlyExpenses - targetExpenses, monthlyIncomeDelta: 0 };
    }
    case "habits": {
      const reduceDining = (p.reduceDiningOut as number) ?? 0;
      const capRideshare = (p.capRideshare as number) ?? baselineRideshare;
      const increaseGroceries = (p.increaseGroceries as number) ?? 0;
      const saving = reduceDining * 4 + Math.max(0, baselineRideshare - capRideshare) - increaseGroceries;
      return { monthlyExpenseDelta: saving, monthlyIncomeDelta: 0 };
    }
    case "subscriptions": {
      const toggles = (p.toggles as Record<string, boolean>) ?? {};
      const saved = baselineSubscriptions.reduce(
        (acc, sub) => acc + (toggles[sub.name] === false ? sub.cost : 0), 0
      );
      return { monthlyExpenseDelta: saved, monthlyIncomeDelta: 0 };
    }
    case "one-time": {
      return {
        monthlyExpenseDelta: 0,
        monthlyIncomeDelta: 0,
        oneTimeMonth: (p.month as number) ?? 3,
        oneTimeAmount: (p.amount as number) ?? 500,
      };
    }
    case "income": {
      return {
        monthlyExpenseDelta: 0,
        monthlyIncomeDelta: (p.amount as number) ?? 500,
        oneTimeMonth: (p.startMonth as number) ?? 1,
      };
    }
  }
}

// ─── Forecast Engine ────────────────────────────────────────────────────────

const FORECAST_HORIZON = 10; // months
const EXP_ALPHA = 0.35;
const ROLLING_WINDOW = 3;

export async function runQuantModel(input: QuantInputs): Promise<QuantOutputs> {
  const t0 = performance.now();

  const { transactions, balances, metric, scenario } = input;

  // 1. Decompose transactions by month
  const monthlyTxns = groupByMonth(transactions);
  const historicalMonths = getMonthKeys(transactions);

  if (historicalMonths.length === 0) {
    return emptyOutput(metric, t0);
  }

  // 2. Compute monthly metrics
  const monthlyMetrics = computeMonthlyMetrics(monthlyTxns, historicalMonths, balances);

  // 3. Extract metric series for analysis
  const rawSeries = extractMetricSeries(monthlyMetrics, historicalMonths, metric);

  // 4. Exponential smoothing
  const smoothed = exponentialSmoothing(rawSeries, EXP_ALPHA);

  // 5. Rolling mean for noise reduction
  const rolled = rollingMean(smoothed, ROLLING_WINDOW);

  // 6. Seasonality extraction
  const seasonal = computeSeasonality(rawSeries, rolled);

  // 7. Trend estimation
  const trend = estimateTrend(rolled);

  // 8. Seeded noise for variation
  const sessionSeed = hashNumbers(transactions.length, rawSeries.length, Math.round(trend.slope * 100));
  const rng = new SeededRNG(sessionSeed);

  // 9. Generate forecast months
  const lastMonth = historicalMonths[historicalMonths.length - 1];
  const forecastMonths: string[] = [];
  for (let i = 1; i <= FORECAST_HORIZON; i++) {
    forecastMonths.push(advanceMonth(lastMonth, i));
  }

  const allMonths = [...historicalMonths.slice(-3), ...forecastMonths]; // overlap for continuity

  // 10. Build baseline forecast
  const baselineLastVal = rolled[rolled.length - 1];
  const baselineSeries: TimeSeriesPoint[] = [];

  for (let i = 0; i < forecastMonths.length; i++) {
    const monthKey = forecastMonths[i];
    const trendVal = baselineLastVal + trend.slope * (i + 1);

    // Seasonal component: repeat from historical pattern
    const seasonalIdx = i % Math.max(1, seasonal.length);
    const seasonalBump = seasonal[seasonalIdx] * 0.5; // dampen historical seasonality

    // Seeded noise
    const noise = rng.normal(0, Math.abs(trend.slope) * 0.3 + baselineLastVal * 0.015);

    let forecastVal = trendVal + seasonalBump + noise;

    // Clamp: savings_rate to [-50, 100], others to >= 0 for balance/income/expenses
    if (metric === "savings_rate") {
      forecastVal = Math.max(-50, Math.min(100, forecastVal));
    } else if (metric !== "cash_flow") {
      forecastVal = Math.max(0, forecastVal);
    }

    baselineSeries.push({
      date: monthLabel(monthKey),
      value: Math.round(forecastVal * 100) / 100,
    });
  }

  // 11. Compute scenario series if provided
  const scenarioOutputs: QuantOutputs["scenarios"] = [];

  if (scenario) {
    // Get baseline aggregates for delta computation
    const avgIncome = rawSeries.length > 0
      ? extractMetricSeries(monthlyMetrics, historicalMonths, "income").reduce((a, b) => a + b, 0) / historicalMonths.length
      : 5000;
    const avgExpenses = rawSeries.length > 0
      ? extractMetricSeries(monthlyMetrics, historicalMonths, "expenses").reduce((a, b) => a + b, 0) / historicalMonths.length
      : 3500;

    // Extract subscription info from transactions
    const subTxns = transactions.filter(t => t.category === "Subscriptions" && t.type === "expense");
    const subMap = new Map<string, number>();
    for (const t of subTxns) {
      subMap.set(t.merchant, (subMap.get(t.merchant) ?? 0) + t.amount);
    }
    const subscriptions = [...subMap.entries()].map(([name, total]) => ({
      name,
      cost: Math.round((total / Math.max(1, historicalMonths.length)) * 100) / 100,
    }));

    const rideshareTotal = transactions
      .filter(t => t.subcategory === "Rideshare" && t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const monthlyRideshare = Math.round(rideshareTotal / Math.max(1, historicalMonths.length));

    const delta = computeScenarioDelta(scenario, avgIncome, avgExpenses, subscriptions, monthlyRideshare);

    const scenarioSeries: TimeSeriesPoint[] = baselineSeries.map((bp, i) => {
      let val = bp.value;

      // Apply monthly deltas
      switch (metric) {
        case "total_balance":
          val += (delta.monthlyExpenseDelta + delta.monthlyIncomeDelta) * (i + 1);
          if (delta.oneTimeMonth !== undefined && delta.oneTimeAmount !== undefined) {
            if (scenario.type === "one-time" && i + 1 >= delta.oneTimeMonth) {
              val -= delta.oneTimeAmount;
            }
          }
          if (scenario.type === "income" && delta.oneTimeMonth !== undefined && i + 1 >= delta.oneTimeMonth) {
            // Income delta already in monthlyIncomeDelta for months past start
          }
          break;
        case "cash_flow":
          val += delta.monthlyExpenseDelta + delta.monthlyIncomeDelta;
          if (scenario.type === "one-time" && delta.oneTimeMonth !== undefined && delta.oneTimeAmount !== undefined) {
            if (i + 1 === delta.oneTimeMonth) val -= delta.oneTimeAmount;
          }
          break;
        case "expenses":
          val -= delta.monthlyExpenseDelta;
          if (scenario.type === "one-time" && delta.oneTimeMonth !== undefined && delta.oneTimeAmount !== undefined) {
            if (i + 1 === delta.oneTimeMonth) val += delta.oneTimeAmount;
          }
          break;
        case "income":
          if (scenario.type === "income" && delta.oneTimeMonth !== undefined && i + 1 >= delta.oneTimeMonth) {
            val += delta.monthlyIncomeDelta;
          }
          break;
        case "savings_rate": {
          const adjExpenses = avgExpenses - delta.monthlyExpenseDelta;
          const adjIncome = avgIncome + delta.monthlyIncomeDelta;
          val = adjIncome > 0 ? ((adjIncome - adjExpenses) / adjIncome) * 100 : 0;
          val = Math.round(val * 10) / 10;
          break;
        }
      }

      return { date: bp.date, value: Math.round(val * 100) / 100 };
    });

    scenarioOutputs.push({
      id: scenario.id,
      name: scenario.name,
      series: scenarioSeries,
    });
  }

  // 12. Compute insights
  const insightSeries = scenarioOutputs.length > 0 ? scenarioOutputs[0].series : baselineSeries;
  const bestMonth = insightSeries.reduce((best, p) => p.value > best.value ? p : best, insightSeries[0]);
  const worstMonth = insightSeries.reduce((worst, p) => p.value < worst.value ? p : worst, insightSeries[0]);
  const endDelta = scenarioOutputs.length > 0
    ? scenarioOutputs[0].series[scenarioOutputs[0].series.length - 1].value - baselineSeries[baselineSeries.length - 1].value
    : 0;

  // 13. Compute confidence based on data quality
  const dataPoints = historicalMonths.length;
  const confidence = Math.min(0.95, 0.4 + dataPoints * 0.12);

  const lastRunMs = Math.round((performance.now() - t0) * 100) / 100;

  const output: QuantOutputs = {
    metric,
    baseline: baselineSeries,
    scenarios: scenarioOutputs,
    insights: {
      bestMonth: bestMonth ? { date: bestMonth.date, value: bestMonth.value } : undefined,
      worstMonth: worstMonth ? { date: worstMonth.date, value: worstMonth.value } : undefined,
      endDelta,
    },
    diagnostics: {
      modelName: "quantra-ets-v1",
      confidence,
      lastRunMs,
    },
  };

  // Debug logging
  if (typeof window !== "undefined" && (window as any).__QUANT_DEBUG__) {
    console.group(`[QuantEngine] ${metric}`);
    console.log("Model:", output.diagnostics.modelName);
    console.log("Confidence:", (output.diagnostics.confidence * 100).toFixed(1) + "%");
    console.log("Runtime:", output.diagnostics.lastRunMs + "ms");
    console.log("Historical months:", historicalMonths.length);
    console.log("Trend slope:", trend.slope.toFixed(2));
    if (scenario) {
      const delta = computeScenarioDelta(
        scenario,
        extractMetricSeries(monthlyMetrics, historicalMonths, "income").reduce((a, b) => a + b, 0) / historicalMonths.length,
        extractMetricSeries(monthlyMetrics, historicalMonths, "expenses").reduce((a, b) => a + b, 0) / historicalMonths.length,
        [], 0
      );
      console.log("Scenario transforms:", delta);
    }
    console.log("Baseline (last 3):", baselineSeries.slice(-3));
    console.groupEnd();
  }

  return output;
}

// ─── Empty output for edge case ─────────────────────────────────────────────

function emptyOutput(metric: QuantMetric, t0: number): QuantOutputs {
  return {
    metric,
    baseline: [],
    scenarios: [],
    insights: {},
    diagnostics: {
      modelName: "quantra-ets-v1",
      confidence: 0,
      lastRunMs: Math.round((performance.now() - t0) * 100) / 100,
    },
  };
}

/** Simple numeric hash for seeding */
function hashNumbers(...nums: number[]): number {
  let h = 0;
  for (const n of nums) {
    h = ((h << 5) - h + Math.round(n)) | 0;
  }
  return Math.abs(h) >>> 0;
}
