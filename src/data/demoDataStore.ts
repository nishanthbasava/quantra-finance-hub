// ─── Demo Data Store ────────────────────────────────────────────────────────
// Single source of truth for the app's demo dataset.
// Wraps the synthetic engine and provides BalanceSnapshot[] alongside transactions.

import { getSeedInfo, type SeedInfo } from "@/lib/rng";
import { generatePersona, generateTransactions, computeBaseline, type Persona, type AggregatedBaseline } from "@/data/syntheticEngine";
import type { Transaction } from "@/data/transactionData";
import type { BalanceSnapshot } from "@/quant/types";

export interface DemoData {
  transactions: Transaction[];
  balances: BalanceSnapshot[];
  persona: Persona;
  baseline: AggregatedBaseline;
  seedInfo: SeedInfo;
}

/**
 * Generate the full demo dataset from seeds.
 * Each call with different seeds returns a different-but-coherent dataset.
 */
export function getDemoData(seedInfo?: SeedInfo): DemoData {
  const info = seedInfo ?? getSeedInfo();
  const persona = generatePersona(info.profileSeed);
  const transactions = generateTransactions(persona, info.sessionSeed);
  const baseline = computeBaseline(transactions, persona);

  // Compute daily balance snapshots from transactions
  const balances = computeBalanceSnapshots(transactions, baseline.balance);

  return { transactions, balances, persona, baseline, seedInfo: info };
}

/**
 * Build daily balance snapshots by replaying transactions forward.
 * Starting balance is estimated from the baseline.
 */
function computeBalanceSnapshots(
  transactions: Transaction[],
  estimatedBalance: number
): BalanceSnapshot[] {
  if (transactions.length === 0) return [];

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = sorted[0].date;
  const lastDate = sorted[sorted.length - 1].date;

  // Group net by date
  const dailyNet = new Map<string, number>();
  for (const t of sorted) {
    const net = t.type === "income" ? t.amount : -t.amount;
    dailyNet.set(t.date, (dailyNet.get(t.date) ?? 0) + net);
  }

  // Walk from first to last date, compute running balance
  // Start balance: estimated balance minus total net change
  const totalNet = [...dailyNet.values()].reduce((s, v) => s + v, 0);
  let balance = estimatedBalance - totalNet;

  const snapshots: BalanceSnapshot[] = [];
  const d = new Date(firstDate);
  const end = new Date(lastDate);

  while (d <= end) {
    const key = d.toISOString().slice(0, 10);
    balance += dailyNet.get(key) ?? 0;
    snapshots.push({ date: key, balance: Math.round(balance * 100) / 100 });
    d.setDate(d.getDate() + 1);
  }

  return snapshots;
}
