export interface VaultSnapshot {
  id: string;
  label: string;
  period: string;
  timestamp: string;
  status: "Verified";
  hash: string;
}

export interface VaultRule {
  id: string;
  description: string;
  dateCreated: string;
  status: "Active" | "Archived";
}

export interface ForecastProof {
  id: string;
  label: string;
  forecastDate: string;
  outcome: "Tracking" | "Exceeded" | "Missed";
}

export interface VaultTimelineEntry {
  id: string;
  type: "snapshot" | "rule" | "forecast";
  description: string;
  timestamp: string;
}

export const demoSnapshots: VaultSnapshot[] = [
  {
    id: "snap-1",
    label: "Total Balance",
    period: "April 2024",
    timestamp: "Apr 28, 2024 · 11:42 AM",
    status: "Verified",
    hash: "0xA3f…7c1D",
  },
  {
    id: "snap-2",
    label: "Monthly Budget",
    period: "March 2024",
    timestamp: "Mar 31, 2024 · 9:15 PM",
    status: "Verified",
    hash: "0x8B2…e4F0",
  },
  {
    id: "snap-3",
    label: "Savings Summary",
    period: "February 2024",
    timestamp: "Feb 29, 2024 · 3:08 PM",
    status: "Verified",
    hash: "0x1D9…a2C8",
  },
];

export const demoRules: VaultRule[] = [
  {
    id: "rule-1",
    description: "Maintain $2,000 minimum balance",
    dateCreated: "Apr 15, 2024",
    status: "Active",
  },
  {
    id: "rule-2",
    description: "Savings rate ≥ 20%",
    dateCreated: "Mar 10, 2024",
    status: "Active",
  },
  {
    id: "rule-3",
    description: "Monthly dining cap $300",
    dateCreated: "Jan 20, 2024",
    status: "Archived",
  },
];

export const demoForecasts: ForecastProof[] = [
  {
    id: "fc-1",
    label: "12-month balance forecast",
    forecastDate: "Jan 2024",
    outcome: "Tracking",
  },
  {
    id: "fc-2",
    label: "6-month savings projection",
    forecastDate: "Feb 2024",
    outcome: "Exceeded",
  },
  {
    id: "fc-3",
    label: "Q1 expense forecast",
    forecastDate: "Dec 2023",
    outcome: "Missed",
  },
];

export const demoTimeline: VaultTimelineEntry[] = [
  {
    id: "tl-1",
    type: "snapshot",
    description: "Snapshot recorded — Total Balance, April 2024",
    timestamp: "Apr 28, 2024",
  },
  {
    id: "tl-2",
    type: "rule",
    description: "Budget rule locked — Maintain $2,000 minimum",
    timestamp: "Apr 15, 2024",
  },
  {
    id: "tl-3",
    type: "snapshot",
    description: "Snapshot recorded — Monthly Budget, March 2024",
    timestamp: "Mar 31, 2024",
  },
  {
    id: "tl-4",
    type: "rule",
    description: "Savings rule locked — Rate ≥ 20%",
    timestamp: "Mar 10, 2024",
  },
  {
    id: "tl-5",
    type: "forecast",
    description: "Forecast verified — 12-month balance projection",
    timestamp: "Mar 1, 2024",
  },
  {
    id: "tl-6",
    type: "snapshot",
    description: "Snapshot recorded — Savings Summary, February 2024",
    timestamp: "Feb 29, 2024",
  },
];
