import { Scenario, SimulationType, ScenarioInputs } from "@/data/simulationData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, RotateCcw, X } from "lucide-react";
import SimulationTypeSelector from "./SimulationTypeSelector";
import ScenarioInputPanel from "./ScenarioInputPanel";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  simulationType: SimulationType;
  onTypeChange: (type: SimulationType) => void;
  scenarioName: string;
  onNameChange: (name: string) => void;
  currentInputs: ScenarioInputs;
  onUpdateInputs: <T extends ScenarioInputs["data"]>(updater: (prev: T) => T) => void;
  scenarios: Scenario[];
  onAddScenario: () => void;
  onRemoveScenario: (id: string) => void;
  onReset: () => void;
}

const ScenarioBuilder = ({
  simulationType,
  onTypeChange,
  scenarioName,
  onNameChange,
  currentInputs,
  onUpdateInputs,
  scenarios,
  onAddScenario,
  onRemoveScenario,
  onReset,
}: Props) => {
  return (
    <Card className="quantra-card h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-foreground">Build a scenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Simulation type */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">What to simulate</Label>
          <SimulationTypeSelector value={simulationType} onChange={onTypeChange} />
        </div>

        {/* Dynamic inputs */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Scenario inputs</Label>
          <ScenarioInputPanel inputs={currentInputs} onUpdate={onUpdateInputs} />
        </div>

        {/* Scenario name + add */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Scenario name</Label>
            <Input
              value={scenarioName}
              onChange={e => onNameChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onAddScenario}
              disabled={scenarios.length >= 4}
              size="sm"
              className="flex-1 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add to comparison
            </Button>
            <Button onClick={onReset} variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>

        {/* Active scenarios */}
        {scenarios.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Label className="text-xs text-muted-foreground block">Active scenarios</Label>
            <AnimatePresence mode="popLayout">
              {scenarios.map(s => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-foreground truncate max-w-[140px]">{s.name}</span>
                  </div>
                  <button onClick={() => onRemoveScenario(s.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScenarioBuilder;
