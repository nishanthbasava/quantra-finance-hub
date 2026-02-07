import { Search } from "lucide-react";

const suggestions = [
  "Break down food spending",
  "Compare with last month",
  "Find unexpected charges",
];

const PromptBar = () => {
  return (
    <div className="sticky bottom-6 z-40 mx-auto w-full max-w-2xl px-4">
      <div className="quantra-prompt-bar p-3">
        <div className="flex items-center gap-3 px-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Ask about your finances…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button className="quantra-gradient-bg h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-primary-foreground shadow-md transition-transform hover:scale-105">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 pt-3 pb-1 overflow-x-auto">
          {suggestions.map((s) => (
            <button key={s} className="quantra-chip whitespace-nowrap">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptBar;
