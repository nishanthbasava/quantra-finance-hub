import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLLMChat, type LLMResponse } from "@/hooks/useLLMChat";
import type { ScenarioInputs, SimulationType, ForecastMetric } from "@/data/simulationData";
import { useData } from "@/contexts/DataContext";

interface Props {
  onSubmit: (text: string) => boolean;
  simulationType: SimulationType;
  metric: ForecastMetric;
  scenarioCount: number;
}

const NLPInput = ({ onSubmit, simulationType, metric, scenarioCount }: Props) => {
  const [text, setText] = useState("");
  const { baseline } = useData();

  const context = useMemo(() => ({
    page: "simulation" as const,
    mockData: {
      currentSimulationType: simulationType,
      currentMetric: metric,
      scenarioCount,
      baseline: {
        monthlyIncome: baseline.monthlyIncome,
        monthlyExpenses: baseline.monthlyExpenses,
        diningOut: baseline.diningOut,
        rideshare: baseline.rideshare,
        groceries: baseline.groceries,
        subscriptions: baseline.subscriptions.map(s => s.name),
      },
    },
  }), [simulationType, metric, scenarioCount, baseline]);

  const handleResponse = useCallback((res: LLMResponse) => {
    // Check if the LLM returned a parsed scenario action
    const applyAction = res.actions.find(a => a.type === "apply_scenario");
    if (applyAction && applyAction.spec.parsed) {
      toast.success("Scenario parsed by AI and added");
      setText("");
    } else {
      // Fallback: show the explanation
      toast.info(res.assistantMessage.slice(0, 120));
    }
  }, []);

  const { isLoading, sendMessage } = useLLMChat({
    context,
    onResponse: handleResponse,
  });

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;

    // Try local NLP parser first (instant)
    const localSuccess = onSubmit(text.trim());
    if (localSuccess) {
      toast.success("Scenario added from description");
      setText("");
      return;
    }

    // Fall back to LLM for more complex parsing
    toast.info("Agent is working…");
    sendMessage(text.trim());
  }, [text, onSubmit, sendMessage]);

  return (
    <div className="quantra-card rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-quantra-purple" />
        <span className="text-xs text-muted-foreground font-medium">Describe a scenario in plain English</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder='Example: Cut dining out by $25/week and cancel Spotify.'
          disabled={isLoading}
          className="h-9 text-sm flex-1"
        />
        <Button
          onClick={handleSubmit}
          size="sm"
          variant="secondary"
          className="gap-1.5 shrink-0"
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? (
            <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {isLoading ? "Parsing…" : "Parse"}
        </Button>
      </div>
    </div>
  );
};

export default NLPInput;
