// ─── Seeded Random Number Generator ─────────────────────────────────────────
// Uses mulberry32 algorithm for deterministic, reproducible random sequences

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0; // ensure unsigned 32-bit
  }

  /** Returns a float in [0, 1) */
  rand(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] inclusive */
  randInt(min: number, max: number): number {
    return Math.floor(this.rand() * (max - min + 1)) + min;
  }

  /** Returns a random float in [min, max) */
  randFloat(min: number, max: number): number {
    return min + this.rand() * (max - min);
  }

  /** Pick a random element from an array */
  choice<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.rand() * arr.length)];
  }

  /** Pick N unique random elements from an array */
  sample<T>(arr: readonly T[], n: number): T[] {
    const shuffled = this.shuffle([...arr]);
    return shuffled.slice(0, Math.min(n, arr.length));
  }

  /** Normal distribution via Box–Muller */
  normal(mean: number, std: number): number {
    const u1 = this.rand() || 0.0001; // avoid log(0)
    const u2 = this.rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * std;
  }

  /** Jitter a value by ±pct% */
  jitterPercent(value: number, pct: number): number {
    return value * (1 + (this.rand() - 0.5) * 2 * (pct / 100));
  }

  /** Round to 2 decimal places */
  jitterAmount(value: number, pct: number): number {
    return Math.round(this.jitterPercent(value, pct) * 100) / 100;
  }

  /** Returns true with probability p */
  chance(p: number): boolean {
    return this.rand() < p;
  }

  /** Fisher-Yates shuffle */
  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /** Weighted random choice */
  weightedChoice<T>(items: readonly T[], weights: readonly number[]): T {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = this.rand() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }
}

// ─── Seed Management ────────────────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface SeedInfo {
  profileSeed: number;
  sessionSeed: number;
  isLocked: boolean;
}

export function getSeedInfo(): SeedInfo {
  let raw = localStorage.getItem("quantra_profile_seed");
  if (!raw) {
    raw = String(Math.floor(Math.random() * 2147483647));
    localStorage.setItem("quantra_profile_seed", raw);
  }

  const profileSeed = parseInt(raw, 10);
  const isLocked = localStorage.getItem("quantra_lock_seed") === "true";

  // Variation bucket: changes hourly unless locked
  const variationBucket = isLocked
    ? "locked_demo"
    : new Date().toISOString().slice(0, 13).replace(/[-T:]/g, "");

  const sessionSeed = (profileSeed ^ hashString(variationBucket)) >>> 0;

  return { profileSeed, sessionSeed, isLocked };
}

export function toggleLockSeed(): void {
  const current = localStorage.getItem("quantra_lock_seed") === "true";
  localStorage.setItem("quantra_lock_seed", String(!current));
}

export function regenerateSeed(): void {
  localStorage.removeItem("quantra_profile_seed");
  localStorage.removeItem("quantra_lock_seed");
  window.location.reload();
}
