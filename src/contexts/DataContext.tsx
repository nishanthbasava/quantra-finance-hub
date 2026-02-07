import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { getSeedInfo, toggleLockSeed, regenerateSeed, type SeedInfo } from "@/lib/rng";
import { generatePersona, generateTransactions, computeBaseline, type Persona, type AggregatedBaseline } from "@/data/syntheticEngine";
import type { Transaction } from "@/data/transactionData";

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

  // Build nested map: category → subcategory → subsubcategory
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
  transactions: Transaction[];
  allCategories: string[];
  allAccounts: string[];
  // Sankey
  sankeyCategories: Category[];
  totalExpenses: number;
  // Simulation baseline
  baseline: AggregatedBaseline;
  // Dashboard metrics
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenseTotal: number;
  cashFlow: number;
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

  // Generate persona from profile seed (stable across sessions)
  const persona = useMemo(() => generatePersona(seedInfo.profileSeed), [seedInfo.profileSeed]);

  // Generate transactions from session seed (varies per load)
  const transactions = useMemo(
    () => generateTransactions(persona, seedInfo.sessionSeed),
    [persona, seedInfo.sessionSeed]
  );

  // Derived data
  const allCategories = useMemo(
    () => [...new Set(transactions.map(t => t.category))],
    [transactions]
  );
  const allAccounts = useMemo(
    () => [...new Set(transactions.map(t => t.account))],
    [transactions]
  );

  // Sankey aggregation
  const { sankeyCategories, totalExpenses } = useMemo(
    () => {
      const result = aggregateToSankey(transactions);
      return { sankeyCategories: result.categories, totalExpenses: result.totalExpenses };
    },
    [transactions]
  );

  // Simulation baseline
  const baseline = useMemo(
    () => computeBaseline(transactions, persona),
    [transactions, persona]
  );

  // Dashboard metrics
  const { totalBalance, monthlyIncome, monthlyExpenseTotal, cashFlow } = useMemo(() => {
    return {
      totalBalance: baseline.balance,
      monthlyIncome: baseline.monthlyIncome,
      monthlyExpenseTotal: baseline.monthlyExpenses,
      cashFlow: baseline.monthlyIncome - baseline.monthlyExpenses,
    };
  }, [baseline]);

  const onToggleLock = useCallback(() => {
    toggleLockSeed();
    setSeedInfo(getSeedInfo());
  }, []);

  const onRegenerate = useCallback(() => {
    regenerateSeed();
  }, []);

  const value: DataContextType = {
    transactions,
    allCategories,
    allAccounts,
    sankeyCategories,
    totalExpenses,
    baseline,
    totalBalance,
    monthlyIncome,
    monthlyExpenseTotal,
    cashFlow,
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
