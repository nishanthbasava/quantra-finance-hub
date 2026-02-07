import { createContext, useContext, useState, useMemo, useCallback, useRef, useEffect, type ReactNode } from "react";
import { getSeedInfo, toggleLockSeed, regenerateSeed, type SeedInfo } from "@/lib/rng";
import { computeBaseline, type AggregatedBaseline } from "@/data/syntheticEngine";
import { getDemoData } from "@/data/demoDataStore";
import type { Transaction } from "@/data/transactionData";
import type { BalanceSnapshot } from "@/quant/types";

// ─── Time Range ─────────────────────────────────────────────────────────────

export type TimeRange = "7d" | "30d" | "90d" | "ytd" | "all";

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "ytd", label: "Year to Date" },
  { value: "all", label: "All Time" },
];

function getStoredTimeRange(): TimeRange {
  const stored = localStorage.getItem("quantra_time_range");
  if (stored && TIME_RANGE_OPTIONS.some(o => o.value === stored)) return stored as TimeRange;
  return "90d";
}

function getDateCutoff(range: TimeRange): string | null {
  const now = new Date();
  switch (range) {
    case "7d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d.toISOString().slice(0, 10);
    }
    case "30d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d.toISOString().slice(0, 10);
    }
    case "90d":
      return null; // no filter — all generated data is 90 days
    case "ytd":
      return `${now.getFullYear()}-01-01`;
    case "all":
      return null;
  }
}

function getTimeRangeDays(range: TimeRange): number {
  switch (range) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "ytd": {
      const now = new Date();
      const jan1 = new Date(now.getFullYear(), 0, 1);
      return Math.ceil((now.getTime() - jan1.getTime()) / 86400000);
    }
    case "all": return 365;
  }
}

// ─── Sankey Aggregation ─────────────────────────────────────────────────────

export interface SubSubCategory {
  name: string;
  amount: number;
}

export interface SubCategory {
  name: string;
  amount: number;
  children: SubSubCategory[];
}

export interface Category {
  name: string;
  amount: number;
  color: string;
  children: SubCategory[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Shopping": "hsl(260, 50%, 65%)",
  "Food": "hsl(170, 65%, 48%)",
  "Travel": "hsl(200, 70%, 55%)",
  "Bills & Utilities": "hsl(215, 45%, 55%)",
  "Subscriptions": "hsl(185, 55%, 50%)",
  "Other": "hsl(210, 20%, 70%)",
  "Income": "hsl(155, 65%, 42%)",
};

function aggregateToSankey(transactions: Transaction[]): { categories: Category[]; totalExpenses: number } {
  const expenses = transactions.filter(t => t.type === "expense");

  const catMap = new Map<string, Map<string, Map<string, number>>>();

  for (const t of expenses) {
    const [cat, sub, subsub] = [t.category, t.subcategory, t.subsubcategory];

    if (!catMap.has(cat)) catMap.set(cat, new Map());
    const subMap = catMap.get(cat)!;

    if (!subMap.has(sub)) subMap.set(sub, new Map());
    const subsubMap = subMap.get(sub)!;

    subsubMap.set(subsub, (subsubMap.get(subsub) ?? 0) + t.amount);
  }

  const categories: Category[] = [];

  for (const [catName, subMap] of catMap) {
    const children: SubCategory[] = [];

    for (const [subName, subsubMap] of subMap) {
      const subChildren: SubSubCategory[] = [];
      let subAmount = 0;

      for (const [subsubName, amount] of subsubMap) {
        const rounded = Math.round(amount * 100) / 100;
        subChildren.push({ name: subsubName, amount: rounded });
        subAmount += rounded;
      }

      subChildren.sort((a, b) => b.amount - a.amount);
      children.push({ name: subName, amount: Math.round(subAmount * 100) / 100, children: subChildren });
    }

    children.sort((a, b) => b.amount - a.amount);
    const catAmount = children.reduce((s, c) => s + c.amount, 0);
    categories.push({
      name: catName,
      amount: Math.round(catAmount * 100) / 100,
      color: CATEGORY_COLORS[catName] ?? "hsl(210, 20%, 70%)",
      children,
    });
  }

  categories.sort((a, b) => b.amount - a.amount);
  const totalExpenses = Math.round(categories.reduce((s, c) => s + c.amount, 0) * 100) / 100;

  return { categories, totalExpenses };
}

// ─── Context Type ───────────────────────────────────────────────────────────

interface DataContextType {
  // All generated transactions (unfiltered)
  transactions: Transaction[];
  // Filtered by time range
  filteredTransactions: Transaction[];
  // Daily balance snapshots
  balances: BalanceSnapshot[];
  allCategories: string[];
  allAccounts: string[];
  // Sankey (derived from filtered)
  sankeyCategories: Category[];
  totalExpenses: number;
  // Simulation baseline (from all data)
  baseline: AggregatedBaseline;
  // Dashboard metrics (from filtered)
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenseTotal: number;
  cashFlow: number;
  // Time range
  timeRange: TimeRange;
  timeRangeDays: number;
  setTimeRange: (range: TimeRange) => void;
  isUpdating: boolean;
  // Seed info
  seedInfo: SeedInfo;
  isLocked: boolean;
  onToggleLock: () => void;
  onRegenerate: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: ReactNode }) {
  const [seedInfo, setSeedInfo] = useState<SeedInfo>(getSeedInfo);
  const [timeRange, setTimeRangeState] = useState<TimeRange>(getStoredTimeRange);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Generate demo data including balances
  const demoData = useMemo(
    () => getDemoData(seedInfo),
    [seedInfo]
  );
  const { transactions, balances } = demoData;

  // Derived persona + baseline from demoData
  const persona = demoData.persona;

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    const cutoff = getDateCutoff(timeRange);
    if (!cutoff) return transactions;
    return transactions.filter(t => t.date >= cutoff);
  }, [transactions, timeRange]);

  // Derived data (from filtered)
  const allCategories = useMemo(
    () => [...new Set(filteredTransactions.map(t => t.category))],
    [filteredTransactions]
  );
  const allAccounts = useMemo(
    () => [...new Set(filteredTransactions.map(t => t.account))],
    [filteredTransactions]
  );

  // Sankey aggregation (from filtered)
  const { sankeyCategories, totalExpenses } = useMemo(() => {
    const result = aggregateToSankey(filteredTransactions);
    return { sankeyCategories: result.categories, totalExpenses: result.totalExpenses };
  }, [filteredTransactions]);

  // Simulation baseline (from ALL data for stable forecasting)
  const baseline = useMemo(
    () => computeBaseline(transactions, persona),
    [transactions, persona]
  );

  // Time range days for quant engine
  const timeRangeDays = useMemo(() => getTimeRangeDays(timeRange), [timeRange]);

  // Dashboard metrics (from filtered data, normalized to monthly)
  const { totalBalance, monthlyIncome, monthlyExpenseTotal, cashFlow } = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === "expense");
    const income = filteredTransactions.filter(t => t.type === "income");
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    const totalInc = income.reduce((s, t) => s + t.amount, 0);

    // Determine days in range for monthly normalization
    const dates = filteredTransactions.map(t => t.date).sort();
    const daysInRange = dates.length > 0
      ? Math.max(1, Math.ceil((new Date(dates[dates.length - 1]).getTime() - new Date(dates[0]).getTime()) / 86400000) + 1)
      : 30;
    const monthFactor = 30 / daysInRange;

    const monthlyInc = Math.round(totalInc * monthFactor);
    const monthlyExp = Math.round(totalExp * monthFactor);

    return {
      totalBalance: baseline.balance,
      monthlyIncome: monthlyInc,
      monthlyExpenseTotal: monthlyExp,
      cashFlow: monthlyInc - monthlyExp,
    };
  }, [filteredTransactions, baseline]);

  // Time range setter with shimmer effect
  const setTimeRange = useCallback((range: TimeRange) => {
    localStorage.setItem("quantra_time_range", range);
    setIsUpdating(true);

    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(() => {
      setTimeRangeState(range);
      setIsUpdating(false);
    }, 300);
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    };
  }, []);

  const onToggleLock = useCallback(() => {
    toggleLockSeed();
    setSeedInfo(getSeedInfo());
  }, []);

  const onRegenerate = useCallback(() => {
    regenerateSeed();
  }, []);

  const value: DataContextType = {
    transactions,
    filteredTransactions,
    balances,
    allCategories,
    allAccounts,
    sankeyCategories,
    totalExpenses,
    baseline,
    totalBalance,
    monthlyIncome,
    monthlyExpenseTotal,
    cashFlow,
    timeRange,
    timeRangeDays,
    setTimeRange,
    isUpdating,
    seedInfo,
    isLocked: seedInfo.isLocked,
    onToggleLock,
    onRegenerate,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
