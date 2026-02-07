import { motion, AnimatePresence } from "framer-motion";
import { totalExpenses } from "./sankeyData";

interface SankeyTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  amount: number;
  color: string;
  isSub: boolean;
  parentName: string;
}

const SankeyTooltip = ({ visible, x, y, label, amount, color, isSub, parentName }: SankeyTooltipProps) => {
  const pct = ((amount / totalExpenses) * 100).toFixed(1);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 4 }}
          transition={{ duration: 0.15 }}
          className="absolute pointer-events-none z-50"
          style={{ left: x, top: y }}
        >
          <div className="bg-popover border border-border rounded-lg shadow-lg px-4 py-3 min-w-[160px]">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-semibold text-foreground">
                {label}
              </span>
            </div>
            {isSub && (
              <p className="text-[11px] text-muted-foreground mb-1">
                in {parentName}
              </p>
            )}
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-base font-bold text-foreground">
                ${amount.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {pct}% of total
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SankeyTooltip;
