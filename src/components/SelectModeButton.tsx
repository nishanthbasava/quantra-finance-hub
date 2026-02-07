import { motion, AnimatePresence } from "framer-motion";
import { MousePointerClick, X } from "lucide-react";
import { useSelection } from "@/contexts/SelectionContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const SelectModeButton = () => {
  const { selectMode, toggleSelectMode, totalSelected, clearAll } = useSelection();
  const prevMode = useRef(selectMode);

  useEffect(() => {
    if (selectMode && !prevMode.current) {
      toast("Select items to analyze in Workspace", {
        duration: 3000,
        className: "!bg-card !text-foreground !border-quantra-select/40",
      });
    }
    prevMode.current = selectMode;
  }, [selectMode]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Counter + clear */}
      <AnimatePresence>
        {totalSelected > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className="flex items-center gap-2 rounded-full bg-card border border-border/60 shadow-lg px-3 py-1.5"
          >
            <span className="text-xs font-semibold text-foreground">
              {totalSelected} selected
            </span>
            <button
              onClick={clearAll}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main toggle button */}
      <motion.button
        onClick={toggleSelectMode}
        whileTap={{ scale: 0.92 }}
        className={`relative h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          selectMode
            ? "bg-quantra-select text-quantra-select-foreground shadow-quantra-select/30"
            : "bg-card text-muted-foreground border border-border/60 hover:text-foreground hover:shadow-md"
        }`}
        aria-label={selectMode ? "Exit select mode" : "Enter select mode"}
      >
        {selectMode ? (
          <X className="h-5 w-5" />
        ) : (
          <MousePointerClick className="h-5 w-5" />
        )}

        {/* Pulse ring when active */}
        {selectMode && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-quantra-select"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default SelectModeButton;
