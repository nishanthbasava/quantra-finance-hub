// ─── XRPL Vault Types ───────────────────────────────────────────────────────

export interface VaultSnapshot {
  id: string;
  label: string;
  createdAt: string; // ISO timestamp
  payload: Record<string, unknown>; // the financial data that was snapshotted
  hash: string; // SHA-256 hex of canonical payload
  verified: boolean;
  xrplTxHash?: string;
  signer?: string;
}

export interface VaultRule {
  id: string;
  label: string;
  createdAt: string;
  ruleText: string;
  status: "active" | "archived";
  locked: true; // always true once created (POC)
  hash: string;
  xrplTxHash?: string;
}

export interface VaultForecastProof {
  id: string;
  label: string;
  createdAt: string;
  metric: "Total Balance" | "Savings" | "Expenses";
  horizonMonths: number;
  baselineHash: string;
  scenarioHash: string;
  hash: string; // SHA-256 of { metric, horizonMonths, baselineHash, scenarioHash }
  status: "tracking" | "exceeded" | "missed";
  baselineData?: number[]; // actual arrays for charting
  scenarioData?: number[];
  xrplTxHash?: string;
  compareUrl?: string;
}

export type VaultEventAction =
  | "created"
  | "locked"
  | "verified"
  | "anchored"
  | "evaluated"
  | "archived";

export interface VaultActivityEvent {
  id: string;
  type: "snapshot" | "rule" | "forecast";
  action: VaultEventAction;
  createdAt: string;
  refId: string; // references snapshot/rule/forecast id
  summary: string;
}

export interface VaultState {
  snapshots: VaultSnapshot[];
  rules: VaultRule[];
  forecasts: VaultForecastProof[];
  events: VaultActivityEvent[];
}
