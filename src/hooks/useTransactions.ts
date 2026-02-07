import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";

export type SortField = "date" | "amount";
export type SortDir = "asc" | "desc";

export interface TransactionFilters {
  search: string;
  category: string | null;
  account: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export function useTransactions() {
  const { transactions } = useData();

  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    category: null,
    account: null,
    dateFrom: null,
    dateTo: null,
  });
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.subcategory.toLowerCase().includes(q)
      );
    }
    if (filters.category) {
      result = result.filter((t) => t.category === filters.category);
    }
    if (filters.account) {
      result = result.filter((t) => t.account === filters.account);
    }
    if (filters.dateFrom) {
      result = result.filter((t) => t.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((t) => t.date <= filters.dateTo!);
    }

    result.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "date") return mul * a.date.localeCompare(b.date);
      return mul * (a.amount - b.amount);
    });

    return result;
  }, [transactions, filters, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return { filters, setFilters, sortField, sortDir, toggleSort, filtered };
}
