import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionFiltersBar from "@/components/transactions/TransactionFiltersBar";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionDrawer from "@/components/transactions/TransactionDrawer";
import InsightCommandBar, { type InsightCommand } from "@/components/transactions/InsightCommandBar";
import InsightChartCard from "@/components/transactions/InsightChartCard";
import type { Transaction } from "@/data/transactionData";

const Transactions = () => {
  const { filters, setFilters, sortField, sortDir, toggleSort, filtered } = useTransactions();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [activeInsights, setActiveInsights] = useState<InsightCommand[]>([]);

  const handleCommand = useCallback((cmd: InsightCommand) => {
    setActiveInsights((prev) => {
      if (prev.includes(cmd)) return prev;
      return [...prev, cmd];
    });
  }, []);

  const dismissInsight = useCallback((cmd: InsightCommand) => {
    setActiveInsights((prev) => prev.filter((c) => c !== cmd));
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-16">
      {/* Header */}
      <section className="pt-12 pb-8 px-6 max-w-6xl mx-auto animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
          Transactions
        </h1>
        <p className="text-muted-foreground text-sm">
          Explore every transaction behind your cash flow.
        </p>
      </section>

      {/* Command bar */}
      <section className="max-w-6xl mx-auto px-6 mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <InsightCommandBar
          onCommand={handleCommand}
          filters={filters as unknown as Record<string, unknown>}
          transactionCount={filtered.length}
        />
      </section>

      {/* Insight charts */}
      {activeInsights.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {activeInsights.map((cmd) => (
                <InsightChartCard
                  key={cmd}
                  command={cmd}
                  transactions={filtered}
                  onDismiss={() => dismissInsight(cmd)}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-6 mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <TransactionFiltersBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
        />
      </section>

      {/* Table */}
      <section className="max-w-6xl mx-auto px-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <TransactionTable
          transactions={filtered}
          sortField={sortField}
          sortDir={sortDir}
          onToggleSort={toggleSort}
          onRowClick={setSelectedTx}
        />
      </section>

      {/* Detail drawer */}
      <TransactionDrawer
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};

export default Transactions;
