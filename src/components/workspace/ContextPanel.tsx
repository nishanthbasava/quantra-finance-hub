import { AnimatePresence, motion } from "framer-motion";
import { useSelection } from "@/contexts/SelectionContext";
import ContextCard from "./ContextCard";

const ContextPanel = () => {
  const { selectedNodes, selectedTransactions, removeNode, removeTransaction, clearAll, totalSelected } = useSelection();

  if (totalSelected === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No items selected. Use <span className="font-medium text-foreground">Select Mode</span> on the Dashboard or Transactions page to pick items for analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Context · {totalSelected} item{totalSelected !== 1 && "s"}
        </span>
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Clear all
        </button>
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {Array.from(selectedNodes.values()).map((node) => {
            const path = node.id.replace(/>/g, " → ");
            const depthLabels = ["Category", "Subcategory", "Merchant"];
            return (
              <ContextCard
                key={`node-${node.id}`}
                type="node"
                label={node.label}
                sublabel={path}
                badge={depthLabels[node.depth] ?? "Node"}
                onRemove={() => removeNode(node.id)}
              />
            );
          })}

          {Array.from(selectedTransactions.values()).map((tx) => (
            <ContextCard
              key={`tx-${tx.id}`}
              type="transaction"
              label={tx.merchant}
              sublabel={`$${tx.amount.toFixed(2)} · ${tx.category}`}
              badge="Transaction"
              onRemove={() => removeTransaction(tx.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ContextPanel;
