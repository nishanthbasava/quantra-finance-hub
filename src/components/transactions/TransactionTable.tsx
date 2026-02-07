import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Transaction } from "@/data/transactionData";
import type { SortField, SortDir } from "@/hooks/useTransactions";

interface TransactionTableProps {
  transactions: Transaction[];
  sortField: SortField;
  sortDir: SortDir;
  onToggleSort: (field: SortField) => void;
  onRowClick: (t: Transaction) => void;
}

const SortIcon = ({ field, active, dir }: { field: SortField; active: boolean; dir: SortDir }) => {
  if (!active) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />;
  return dir === "asc"
    ? <ArrowUp className="w-3 h-3 text-foreground" />
    : <ArrowDown className="w-3 h-3 text-foreground" />;
};

const TransactionTable = ({ transactions, sortField, sortDir, onToggleSort, onRowClick }: TransactionTableProps) => {
  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="quantra-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 sticky top-0 z-10">
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => onToggleSort("date")}
              >
                <span className="inline-flex items-center gap-1.5">
                  Date <SortIcon field="date" active={sortField === "date"} dir={sortDir} />
                </span>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Merchant
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Account
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => onToggleSort("amount")}
              >
                <span className="inline-flex items-center gap-1.5 justify-end">
                  Amount <SortIcon field="amount" active={sortField === "amount"} dir={sortDir} />
                </span>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                onClick={() => onRowClick(t)}
                className="border-b border-border/30 hover:bg-muted/20 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(t.date)}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {t.merchant}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {t.category}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {t.account}
                </td>
                <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${t.type === "income" ? "text-quantra-green" : "text-foreground"}`}>
                  {t.type === "income" ? "+" : "−"}${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                    t.type === "income"
                      ? "bg-quantra-green/10 text-quantra-green"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {t.type}
                  </span>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No transactions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
