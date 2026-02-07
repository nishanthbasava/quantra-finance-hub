// ─── Quant Service ──────────────────────────────────────────────────────────
// Cached wrapper around the quant engine. Memoizes by input hash.

import { runQuantModel } from "@/quant/quantEngine";
import type { QuantInputs, QuantOutputs, QuantMetric, ScenarioDefinition } from "@/quant/types";
import type { Transaction } from "@/data/transactionData";
import type { BalanceSnapshot } from "@/quant/types";

// ─── Cache ──────────────────────────────────────────────────────────────────

interface CacheKey {
  metric: QuantMetric;
  timeRangeDays: number;
  scenarioHash: string;
  dataSeed: number;
}

function hashCacheKey(key: CacheKey): string {
  return `${key.metric}|${key.timeRangeDays}|${key.scenarioHash}|${key.dataSeed}`;
}

function hashScenario(scenario?: ScenarioDefinition): string {
  if (!scenario) return "none";
  return `${scenario.type}:${JSON.stringify(scenario.params)}`;
}

const cache = new Map<string, QuantOutputs>();
const MAX_CACHE_SIZE = 50;

function evictIfNeeded() {
  if (cache.size > MAX_CACHE_SIZE) {
    // Remove oldest entries (first inserted)
    const keysToRemove = [...cache.keys()].slice(0, cache.size - MAX_CACHE_SIZE + 10);
    for (const k of keysToRemove) cache.delete(k);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export interface GetQuantOutputsParams {
  metric: QuantMetric;
  timeRangeDays: number;
  transactions: Transaction[];
  balances: BalanceSnapshot[];
  scenario?: ScenarioDefinition;
  dataSeed: number;
}

export async function getQuantOutputs(params: GetQuantOutputsParams): Promise<QuantOutputs> {
  const cacheKey: CacheKey = {
    metric: params.metric,
    timeRangeDays: params.timeRangeDays,
    scenarioHash: hashScenario(params.scenario),
    dataSeed: params.dataSeed,
  };

  const hash = hashCacheKey(cacheKey);
  const cached = cache.get(hash);
  if (cached) return cached;

  const input: QuantInputs = {
    timeRangeDays: params.timeRangeDays,
    transactions: params.transactions,
    balances: params.balances,
    scenario: params.scenario,
    metric: params.metric,
  };

  const result = await runQuantModel(input);

  evictIfNeeded();
  cache.set(hash, result);

  return result;
}

/** Clear the entire cache (useful on data regeneration) */
export function clearQuantCache(): void {
  cache.clear();
}
