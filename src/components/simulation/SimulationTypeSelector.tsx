import { SIMULATION_TYPES, SimulationType } from "@/data/simulationData";
import { cn } from "@/lib/utils";

interface Props {
  value: SimulationType;
  onChange: (type: SimulationType) => void;
}

const SimulationTypeSelector = ({ value, onChange }: Props) => (
  <div className="flex flex-wrap gap-1.5">
    {SIMULATION_TYPES.map((t) => (
      <button
        key={t.value}
        onClick={() => onChange(t.value)}
        className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
          value === t.value
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-secondary text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/30"
        )}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default SimulationTypeSelector;
