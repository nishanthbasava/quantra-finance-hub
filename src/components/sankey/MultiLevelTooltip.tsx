import { motion, AnimatePresence } from "framer-motion";
import { useData } from "@/contexts/DataContext";

interface MultiLevelTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  amount: number;
  color: string;
  parentAmount: number | null;
  depth: number;
}

const MultiLevelTooltip = ({
  visible,
  x,
  y,
  label,
  amount,
  color,
  parentAmount,
  depth,
}: MultiLevelTooltipProps) => {
  const { totalExpenses } = useData();
  const pctTotal = ((amount / totalExpenses) * 100).toFixed(1);
  const pctParent = parentAmount ? ((amount / parentAmount) * 100).toFixed(1) : null;

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
          <div className="bg-popover border border-border rounded-lg shadow-lg px-4 py-3 min-w-[170px]">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-semibold text-foreground">
                {label}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-base font-bold text-foreground">
                  ${amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{pctTotal}% of total</span>
                {pctParent && depth > 0 && (
                  <span className="border-l border-border pl-3">{pctParent}% of parent</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MultiLevelTooltip;
