// ─── useVault Hook ──────────────────────────────────────────────────────────
// Central state management for the XRPL Vault feature.

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  VaultState,
  VaultSnapshot,
  VaultRule,
  VaultForecastProof,
  VaultActivityEvent,
} from "@/lib/xrplVault/types";
import { loadVaultState, saveVaultState } from "@/lib/xrplVault/storage";
import { hashPayload, verifyHash } from "@/lib/xrplVault/crypto";
import { anchorHashToXRPL } from "@/lib/xrplVault/xrpl";
import { generateSeedData } from "@/lib/xrplVault/seedData";

const EMPTY_STATE: VaultState = {
  snapshots: [],
  rules: [],
  forecasts: [],
  events: [],
};

function uid(): string {
  return crypto.randomUUID();
}

function nowISO(): string {
  return new Date().toISOString();
}

export function useVault() {
  const [state, setState] = useState<VaultState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  // ── Hydrate from storage or seed ─────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = loadVaultState();
    if (stored && stored.snapshots.length > 0) {
      setState(stored);
      setLoading(false);
    } else {
      generateSeedData().then((seed) => {
        const newState: VaultState = {
          snapshots: seed.snapshots,
          rules: seed.rules,
          forecasts: seed.forecasts,
          events: seed.events,
        };
        setState(newState);
        saveVaultState(newState);
        setLoading(false);
      });
    }
  }, []);

  // ── Persist on change (skip initial) ─────────────────────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!loading) {
      saveVaultState(state);
    }
  }, [state, loading]);

  // ── Helper: add event ────────────────────────────────────────
  const addEvent = useCallback(
    (
      type: VaultActivityEvent["type"],
      action: VaultActivityEvent["action"],
      refId: string,
      summary: string
    ) => {
      const event: VaultActivityEvent = {
        id: uid(),
        type,
        action,
        createdAt: nowISO(),
        refId,
        summary,
      };
      setState((prev) => ({
        ...prev,
        events: [event, ...prev.events],
      }));
    },
    []
  );

  // ── Snapshots ────────────────────────────────────────────────

  const createSnapshot = useCallback(
    async (label: string, payload: Record<string, unknown>) => {
      const hash = await hashPayload(payload);
      const snap: VaultSnapshot = {
        id: uid(),
        label,
        createdAt: nowISO(),
        payload,
        hash,
        verified: false,
      };
      setState((prev) => ({
        ...prev,
        snapshots: [snap, ...prev.snapshots],
      }));
      addEvent("snapshot", "created", snap.id, `Snapshot recorded — ${label}`);
      return snap;
    },
    [addEvent]
  );

  const verifySnapshot = useCallback(
    async (id: string) => {
      const snap = state.snapshots.find((s) => s.id === id);
      if (!snap) return false;

      const valid = await verifyHash(snap.payload, snap.hash);
      if (valid) {
        setState((prev) => ({
          ...prev,
          snapshots: prev.snapshots.map((s) =>
            s.id === id ? { ...s, verified: true } : s
          ),
        }));
        addEvent("snapshot", "verified", id, `Snapshot verified — ${snap.label}`);
      }
      return valid;
    },
    [state.snapshots, addEvent]
  );

  // ── Rules ────────────────────────────────────────────────────

  const createRule = useCallback(
    async (ruleText: string) => {
      const createdAt = nowISO();
      const hash = await hashPayload({ ruleText, createdAt });
      const rule: VaultRule = {
        id: uid(),
        label: ruleText,
        createdAt,
        ruleText,
        status: "active",
        locked: true,
        hash,
      };
      setState((prev) => ({
        ...prev,
        rules: [rule, ...prev.rules],
      }));
      addEvent("rule", "created", rule.id, `Rule created — ${ruleText}`);
      addEvent("rule", "locked", rule.id, `Rule locked — ${ruleText}`);
      return rule;
    },
    [addEvent]
  );

  const archiveRule = useCallback(
    (id: string) => {
      const rule = state.rules.find((r) => r.id === id);
      if (!rule || rule.status === "archived") return;

      setState((prev) => ({
        ...prev,
        rules: prev.rules.map((r) =>
          r.id === id ? { ...r, status: "archived" as const } : r
        ),
      }));
      addEvent("rule", "archived", id, `Rule archived — ${rule.label}`);
    },
    [state.rules, addEvent]
  );

  // ── Forecasts ────────────────────────────────────────────────

  const evaluateForecast = useCallback(
    (id: string, newStatus: "tracking" | "exceeded" | "missed") => {
      const fc = state.forecasts.find((f) => f.id === id);
      if (!fc) return;

      setState((prev) => ({
        ...prev,
        forecasts: prev.forecasts.map((f) =>
          f.id === id ? { ...f, status: newStatus } : f
        ),
      }));
      addEvent(
        "forecast",
        "evaluated",
        id,
        `Forecast evaluated (${newStatus}) — ${fc.label}`
      );
    },
    [state.forecasts, addEvent]
  );

  // ── XRPL Anchoring ──────────────────────────────────────────

  const anchorItem = useCallback(
    async (
      type: "snapshot" | "rule" | "forecast",
      id: string
    ) => {
      let hash = "";
      let label = "";

      if (type === "snapshot") {
        const snap = state.snapshots.find((s) => s.id === id);
        if (!snap) return;
        hash = snap.hash;
        label = snap.label;
      } else if (type === "rule") {
        const rule = state.rules.find((r) => r.id === id);
        if (!rule) return;
        hash = rule.hash;
        label = rule.label;
      } else {
        const fc = state.forecasts.find((f) => f.id === id);
        if (!fc) return;
        hash = fc.hash;
        label = fc.label;
      }

      const result = await anchorHashToXRPL(hash);

      setState((prev) => {
        if (type === "snapshot") {
          return {
            ...prev,
            snapshots: prev.snapshots.map((s) =>
              s.id === id ? { ...s, xrplTxHash: result.txHash } : s
            ),
          };
        }
        if (type === "rule") {
          return {
            ...prev,
            rules: prev.rules.map((r) =>
              r.id === id ? { ...r, xrplTxHash: result.txHash } : r
            ),
          };
        }
        return {
          ...prev,
          forecasts: prev.forecasts.map((f) =>
            f.id === id ? { ...f, xrplTxHash: result.txHash } : f
          ),
        };
      });

      addEvent(type, "anchored", id, `Anchored to XRPL — ${label}`);
      return result.txHash;
    },
    [state, addEvent]
  );

  return {
    ...state,
    loading,
    createSnapshot,
    verifySnapshot,
    createRule,
    archiveRule,
    evaluateForecast,
    anchorItem,
  };
}
