import { Search, ChevronDown } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import type { TransactionFilters } from "@/hooks/useTransactions";

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (f: TransactionFilters) => void;
  resultCount: number;
}

const TransactionFiltersBar = ({ filters, onChange, resultCount }: TransactionFiltersBarProps) => {
  const { allCategories, allAccounts } = useData();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search merchant or category…"
          className="w-full pl-9 pr-4 py-2 text-sm bg-secondary/50 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
        />
      </div>

      {/* Category filter */}
      <div className="relative">
        <select
          value={filters.category ?? ""}
          onChange={(e) => onChange({ ...filters, category: e.target.value || null })}
          className="appearance-none pl-3 pr-8 py-2 text-sm bg-secondary/50 border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
        >
          <option value="">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Account filter */}
      <div className="relative">
        <select
          value={filters.account ?? ""}
          onChange={(e) => onChange({ ...filters, account: e.target.value || null })}
          className="appearance-none pl-3 pr-8 py-2 text-sm bg-secondary/50 border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
        >
          <option value="">All Accounts</option>
          {allAccounts.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Result count */}
      <span className="text-xs text-muted-foreground ml-auto">
        {resultCount} transaction{resultCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
};

export default TransactionFiltersBar;
