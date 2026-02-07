import { useState, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { useLLMChat, type LLMResponse } from "@/hooks/useLLMChat";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

const suggestions = [
  "Break down food spending",
  "Compare with last month",
  "Find unexpected charges",
];

const PromptBar = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const { sankeyCategories, totalExpenses, timeRange, monthlyIncome, monthlyExpenseTotal, cashFlow } = useData();

  const context = useMemo(() => ({
    page: "dashboard" as const,
    mockData: {
      timeRange,
      totalExpenses,
      monthlyIncome,
      monthlyExpenseTotal,
      cashFlow,
      categories: sankeyCategories.map(c => ({
        name: c.name,
        amount: c.amount,
        children: c.children.map(s => ({ name: s.name, amount: s.amount })),
      })),
    },
  }), [sankeyCategories, totalExpenses, timeRange, monthlyIncome, monthlyExpenseTotal, cashFlow]);

  const handleResponse = useCallback((res: LLMResponse) => {
    setResponse(res.assistantMessage);
  }, []);

  const { isLoading, sendMessage } = useLLMChat({
    context,
    onResponse: handleResponse,
  });

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    toast.info("Agent is working…");
    sendMessage(trimmed);
    setInput("");
  }, [input, isLoading, sendMessage]);

  const handleSuggestion = useCallback((text: string) => {
    if (isLoading) return;
    toast.info("Agent is working…");
    sendMessage(text);
  }, [isLoading, sendMessage]);

  return (
    <div className="sticky bottom-6 z-40 mx-auto w-full max-w-2xl px-4">
      <div className="quantra-prompt-bar p-3">
        {/* Response area */}
        {response && (
          <div className="px-3 pb-3 mb-2 border-b border-border/30">
            <div className="text-sm text-foreground leading-relaxed space-y-1">
              {response.split("\n").map((line, i) => (
                <p key={i}>{renderBold(line)}</p>
              ))}
            </div>
            <button
              onClick={() => setResponse(null)}
              className="text-[10px] text-muted-foreground hover:text-foreground mt-2 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 px-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ask about your finances…"
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="quantra-gradient-bg h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:opacity-40"
          >
            {isLoading ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 pt-3 pb-1 overflow-x-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              disabled={isLoading}
              className="quantra-chip whitespace-nowrap disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default PromptBar;
