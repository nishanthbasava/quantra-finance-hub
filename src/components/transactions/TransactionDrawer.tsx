import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/data/transactionData";

interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDrawer = ({ transaction, onClose }: TransactionDrawerProps) => {
  return (
    <AnimatePresence>
      {transaction && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 shadow-2xl overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-foreground">Transaction Details</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Amount hero */}
              <div className="mb-8 text-center">
                <p className={`text-4xl font-bold tracking-tight ${
                  transaction.type === "income" ? "text-quantra-green" : "text-foreground"
                }`}>
                  {transaction.type === "income" ? "+" : "−"}$
                  {transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{transaction.merchant}</p>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <DetailRow label="Date" value={new Date(transaction.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} />
                <DetailRow label="Merchant" value={transaction.merchant} />
                <DetailRow label="Account" value={transaction.account} />
                <DetailRow label="Type" value={transaction.type === "income" ? "Income" : "Expense"} />

                {/* Category path */}
                <div className="pt-4 border-t border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Category Path
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[transaction.category, transaction.subcategory, transaction.subsubcategory].map((segment, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <span className="text-muted-foreground/40">→</span>}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          i === 2
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {segment}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default TransactionDrawer;
