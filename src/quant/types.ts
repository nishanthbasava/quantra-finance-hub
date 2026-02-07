// ─── Shared Quant Types ─────────────────────────────────────────────────────

import type { Transaction } from "@/data/transactionData";

export interface TimeSeriesPoint {
  date: string; // ISO date (yyyy-mm-dd) or month label
  value: number;
}

export interface BalanceSnapshot {
  date: string; // yyyy-mm-dd
  balance: number;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  type: "budgeting" | "habits" | "subscriptions" | "one-time" | "income";
  params: Record<string, unknown>;
}

export type QuantMetric =
  | "total_balance"
  | "cash_flow"
  | "expenses"
  | "income"
  | "savings_rate";

export interface QuantInputs {
  timeRangeDays: number;
  transactions: Transaction[];
  balances: BalanceSnapshot[];
  scenario?: ScenarioDefinition;
  metric: QuantMetric;
}

export interface QuantOutputs {
  metric: QuantMetric;
  baseline: TimeSeriesPoint[];
  scenarios: { id: string; name: string; series: TimeSeriesPoint[] }[];
  insights: {
    bestMonth?: { date: string; value: number };
    worstMonth?: { date: string; value: number };
    endDelta?: number;
  };
  diagnostics: {
    modelName: string;
    confidence: number;
    lastRunMs: number;
  };
}
