// ─── XRPL Vault localStorage Persistence ────────────────────────────────────

import type { VaultState } from "./types";

const STORAGE_KEY = "quantra.vault.v1";

export function loadVaultState(): VaultState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VaultState;
  } catch {
    return null;
  }
}

export function saveVaultState(state: VaultState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save vault state:", e);
  }
}

export function clearVaultState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
