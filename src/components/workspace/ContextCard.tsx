import { X } from "lucide-react";
import { motion } from "framer-motion";

interface ContextCardProps {
  type: "node" | "transaction";
  label: string;
  sublabel: string;
  badge: string;
  onRemove: () => void;
}

const ContextCard = ({ type, label, sublabel, badge, onRemove }: ContextCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.92 }}
    transition={{ duration: 0.2 }}
    className="group relative flex items-start gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 text-sm shadow-sm"
  >
    <div className="min-w-0 flex-1">
      <p className="font-medium text-foreground truncate">{label}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">{sublabel}</p>
    </div>

    <span
      className={`shrink-0 mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
        type === "node"
          ? "bg-quantra-select/15 text-quantra-select"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {badge}
    </span>

    <button
      onClick={onRemove}
      className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
      aria-label="Remove"
    >
      <X className="h-2.5 w-2.5" />
    </button>
  </motion.div>
);

export default ContextCard;
