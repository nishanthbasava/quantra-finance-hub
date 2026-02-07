// ─── XRPL Vault Demo Seed Data ──────────────────────────────────────────────
// Generates initial vault objects matching the existing UI demo data.

import { hashPayload } from "./crypto";
import type {
  VaultSnapshot,
  VaultRule,
  VaultForecastProof,
  VaultActivityEvent,
} from "./types";

function uid(): string {
  return crypto.randomUUID();
}

/** Generate demo baseline/scenario arrays for forecast charting */
function generateForecastArrays(
  months: number,
  base: number,
  growthRate: number
): { baseline: number[]; scenario: number[] } {
  const baseline: number[] = [];
  const scenario: number[] = [];
  let b = base;
  let s = base;
  for (let i = 0; i < months; i++) {
    baseline.push(Math.round(b));
    scenario.push(Math.round(s));
    b += b * 0.02; // 2% monthly growth
    s += s * growthRate;
  }
  return { baseline, scenario };
}

export async function generateSeedData(): Promise<{
  snapshots: VaultSnapshot[];
  rules: VaultRule[];
  forecasts: VaultForecastProof[];
  events: VaultActivityEvent[];
}> {
  // ── Snapshots ────────────────────────────────────────────────
  const snapPayloads = [
    {
      label: "Total Balance",
      period: "April 2024",
      totalBalance: 14280.5,
      savings: 5200,
      checking: 9080.5,
      createdAt: "2024-04-28T11:42:00Z",
    },
    {
      label: "Monthly Budget",
      period: "March 2024",
      income: 6500,
      expenses: 4820,
      netSavings: 1680,
      createdAt: "2024-03-31T21:15:00Z",
    },
    {
      label: "Savings Summary",
      period: "February 2024",
      totalSavings: 4800,
      monthlyContribution: 850,
      savingsRate: 0.22,
      createdAt: "2024-02-29T15:08:00Z",
    },
  ];

  const snapshots: VaultSnapshot[] = await Promise.all(
    snapPayloads.map(async (p) => {
      const { label, createdAt, ...payloadData } = p;
      const payload = { label, ...payloadData };
      const hash = await hashPayload(payload);
      return {
        id: uid(),
        label,
        createdAt,
        payload,
        hash,
        verified: true,
      };
    })
  );

  // ── Rules ────────────────────────────────────────────────────
  const ruleTexts = [
    { text: "Maintain $2,000 minimum balance", date: "2024-04-15T10:00:00Z", status: "active" as const },
    { text: "Savings rate ≥ 20%", date: "2024-03-10T10:00:00Z", status: "active" as const },
    { text: "Monthly dining cap $300", date: "2024-01-20T10:00:00Z", status: "archived" as const },
  ];

  const rules: VaultRule[] = await Promise.all(
    ruleTexts.map(async (r) => {
      const hash = await hashPayload({ ruleText: r.text, createdAt: r.date });
      return {
        id: uid(),
        label: r.text,
        createdAt: r.date,
        ruleText: r.text,
        status: r.status,
        locked: true as const,
        hash,
      };
    })
  );

  // ── Forecasts ────────────────────────────────────────────────
  const fcDefs = [
    {
      label: "12-month balance forecast",
      date: "2024-01-15T10:00:00Z",
      metric: "Total Balance" as const,
      horizon: 12,
      base: 12000,
      growth: 0.03,
      status: "tracking" as const,
    },
    {
      label: "6-month savings projection",
      date: "2024-02-01T10:00:00Z",
      metric: "Savings" as const,
      horizon: 6,
      base: 4200,
      growth: 0.04,
      status: "exceeded" as const,
    },
    {
      label: "Q1 expense forecast",
      date: "2023-12-15T10:00:00Z",
      metric: "Expenses" as const,
      horizon: 3,
      base: 4500,
      growth: 0.01,
      status: "missed" as const,
    },
  ];

  const forecasts: VaultForecastProof[] = await Promise.all(
    fcDefs.map(async (fc) => {
      const { baseline, scenario } = generateForecastArrays(fc.horizon, fc.base, fc.growth);
      const baselineHash = await hashPayload(baseline);
      const scenarioHash = await hashPayload(scenario);
      const hash = await hashPayload({
        metric: fc.metric,
        horizonMonths: fc.horizon,
        baselineHash,
        scenarioHash,
      });
      return {
        id: uid(),
        label: fc.label,
        createdAt: fc.date,
        metric: fc.metric,
        horizonMonths: fc.horizon,
        baselineHash,
        scenarioHash,
        hash,
        status: fc.status,
        baselineData: baseline,
        scenarioData: scenario,
      };
    })
  );

  // ── Events ───────────────────────────────────────────────────
  const events: VaultActivityEvent[] = [];

  // Snapshot events
  for (const snap of snapshots) {
    events.push({
      id: uid(),
      type: "snapshot",
      action: "created",
      createdAt: snap.createdAt,
      refId: snap.id,
      summary: `Snapshot recorded — ${snap.label}`,
    });
    events.push({
      id: uid(),
      type: "snapshot",
      action: "verified",
      createdAt: snap.createdAt,
      refId: snap.id,
      summary: `Snapshot verified — ${snap.label}`,
    });
  }

  // Rule events
  for (const rule of rules) {
    events.push({
      id: uid(),
      type: "rule",
      action: "created",
      createdAt: rule.createdAt,
      refId: rule.id,
      summary: `Rule created — ${rule.label}`,
    });
    events.push({
      id: uid(),
      type: "rule",
      action: "locked",
      createdAt: rule.createdAt,
      refId: rule.id,
      summary: `Rule locked — ${rule.label}`,
    });
    if (rule.status === "archived") {
      events.push({
        id: uid(),
        type: "rule",
        action: "archived",
        createdAt: rule.createdAt,
        refId: rule.id,
        summary: `Rule archived — ${rule.label}`,
      });
    }
  }

  // Forecast events
  for (const fc of forecasts) {
    events.push({
      id: uid(),
      type: "forecast",
      action: "created",
      createdAt: fc.createdAt,
      refId: fc.id,
      summary: `Forecast created — ${fc.label}`,
    });
    if (fc.status !== "tracking") {
      events.push({
        id: uid(),
        type: "forecast",
        action: "evaluated",
        createdAt: fc.createdAt,
        refId: fc.id,
        summary: `Forecast evaluated (${fc.status}) — ${fc.label}`,
      });
    }
  }

  // Sort events newest first
  events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { snapshots, rules, forecasts, events };
}
