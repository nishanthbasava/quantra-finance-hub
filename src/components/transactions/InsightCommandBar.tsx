import { useState, useCallback, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useLLMChat, type LLMResponse } from "@/hooks/useLLMChat";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

export type InsightCommand =
  | "spending_by_category"
  | "top_merchants"
  | "subscriptions_breakdown"
  | "daily_spend";

interface InsightCommandBarProps {
  onCommand: (cmd: InsightCommand) => void;
  filters?: Record<string, unknown>;
  transactionCount?: number;
}

const suggestions: { label: string; command: InsightCommand }[] = [
  { label: "Show spending by category", command: "spending_by_category" },
  { label: "Top merchants this month", command: "top_merchants" },
  { label: "Subscriptions breakdown", command: "subscriptions_breakdown" },
  { label: "Daily spend over time", command: "daily_spend" },
];

const InsightCommandBar = ({ onCommand, filters, transactionCount }: InsightCommandBarProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const { timeRange } = useData();

  const context = useMemo(() => ({
    page: "transactions" as const,
    filters: { ...filters, timeRange },
    mockData: { transactionCount: transactionCount ?? 0 },
  }), [filters, timeRange, transactionCount]);

  const handleResponse = useCallback((res: LLMResponse) => {
    setResponse(res.assistantMessage);

    // Try to auto-detect command from response
    const lower = res.assistantMessage.toLowerCase();
    if (lower.includes("category") || lower.includes("spending by")) {
      onCommand("spending_by_category");
    } else if (lower.includes("merchant") || lower.includes("top")) {
      onCommand("top_merchants");
    } else if (lower.includes("subscription")) {
      onCommand("subscriptions_breakdown");
    } else if (lower.includes("daily") || lower.includes("trend") || lower.includes("time")) {
      onCommand("daily_spend");
    }
  }, [onCommand]);

  const { isLoading, sendMessage } = useLLMChat({
    context,
    onResponse: handleResponse,
  });

  const handleSubmit = useCallback(() => {
    const q = input.trim();
    if (!q || isLoading) return;

    // First try local keyword matching for instant charts
    const lower = q.toLowerCase();
    if (lower.includes("category") || lower.includes("spending")) {
      onCommand("spending_by_category");
    } else if (lower.includes("merchant") || lower.includes("top")) {
      onCommand("top_merchants");
    } else if (lower.includes("subscription")) {
      onCommand("subscriptions_breakdown");
    } else if (lower.includes("daily") || lower.includes("time") || lower.includes("trend")) {
      onCommand("daily_spend");
    }

    // Also send to LLM for richer insights
    toast.info("Agent is working…");
    sendMessage(q);
    setInput("");
  }, [input, isLoading, onCommand, sendMessage]);

  return (
    <div className="space-y-3">
      {/* LLM response */}
      {response && (
        <div className="p-3 rounded-xl bg-card border border-border/60 text-sm text-foreground leading-relaxed">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-quantra-purple shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              {response.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
          <button
            onClick={() => setResponse(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground mt-2 ml-6 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Command input */}
      <div className="relative">
        <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={isLoading}
          placeholder={isLoading ? "Agent is working…" : "Ask or generate insights from transactions…"}
          className="w-full pl-10 pr-4 py-3 text-sm bg-card border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all shadow-sm disabled:opacity-50"
        />
        {isLoading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          </div>
        )}
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
