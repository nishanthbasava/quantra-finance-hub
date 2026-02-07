import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";

export type InsightCommand =
  | "spending_by_category"
  | "top_merchants"
  | "subscriptions_breakdown"
  | "daily_spend";

interface InsightCommandBarProps {
  onCommand: (cmd: InsightCommand) => void;
}

const suggestions: { label: string; command: InsightCommand }[] = [
  { label: "Show spending by category", command: "spending_by_category" },
  { label: "Top merchants this month", command: "top_merchants" },
  { label: "Subscriptions breakdown", command: "subscriptions_breakdown" },
  { label: "Daily spend over time", command: "daily_spend" },
];

const InsightCommandBar = ({ onCommand }: InsightCommandBarProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = useCallback(() => {
    const q = input.toLowerCase().trim();
    if (q.includes("category") || q.includes("spending")) {
      onCommand("spending_by_category");
    } else if (q.includes("merchant") || q.includes("top")) {
      onCommand("top_merchants");
    } else if (q.includes("subscription")) {
      onCommand("subscriptions_breakdown");
    } else if (q.includes("daily") || q.includes("time") || q.includes("trend")) {
      onCommand("daily_spend");
    } else {
      onCommand("spending_by_category");
    }
    setInput("");
  }, [input, onCommand]);

  return (
    <div className="space-y-3">
      {/* Command input */}
      <div className="relative">
        <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ask or generate insights from transactions…"
          className="w-full pl-10 pr-4 py-3 text-sm bg-card border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all shadow-sm"
        />
      </div>

      {/* Suggestion pills */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.command}
            onClick={() => onCommand(s.command)}
            className="quantra-chip text-xs hover:border-primary/40 hover:text-foreground"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InsightCommandBar;
