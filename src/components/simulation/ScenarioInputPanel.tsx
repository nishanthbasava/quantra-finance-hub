import { ScenarioInputs, BudgetingInputs, HabitInputs, SubscriptionInputs, OneTimeInputs, IncomeInputs, BUDGET_PRESETS, DEFAULT_SUBSCRIPTIONS } from "@/data/simulationData";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  inputs: ScenarioInputs;
  onUpdate: <T extends ScenarioInputs["data"]>(updater: (prev: T) => T) => void;
}

const ScenarioInputPanel = ({ inputs, onUpdate }: Props) => {
  switch (inputs.type) {
    case "budgeting":
      return <BudgetingPanel data={inputs.data} onUpdate={onUpdate} />;
    case "habits":
      return <HabitsPanel data={inputs.data} onUpdate={onUpdate} />;
    case "subscriptions":
      return <SubscriptionsPanel data={inputs.data} onUpdate={onUpdate} />;
    case "one-time":
      return <OneTimePanel data={inputs.data} onUpdate={onUpdate} />;
    case "income":
      return <IncomePanel data={inputs.data} onUpdate={onUpdate} />;
  }
};

// ─── Budgeting ──────────────────────────────────────────────────────────────

function BudgetingPanel({ data, onUpdate }: { data: BudgetingInputs; onUpdate: Props["onUpdate"] }) {
  const selectPreset = (preset: BudgetingInputs["preset"]) => {
    const p = BUDGET_PRESETS.find(b => b.value === preset)!;
    onUpdate<BudgetingInputs>(() => ({ preset: p.value, needs: p.needs, wants: p.wants, savings: p.savings }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Preset</Label>
        <div className="flex flex-wrap gap-1.5">
          {BUDGET_PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => selectPreset(p.value)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs border transition-all",
                data.preset === p.value
                  ? "bg-primary/10 border-primary/40 text-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <SliderField label="Needs" value={data.needs} suffix="%" onChange={v => onUpdate<BudgetingInputs>(prev => ({ ...prev, preset: "custom", needs: v }))} max={80} />
      <SliderField label="Wants" value={data.wants} suffix="%" onChange={v => onUpdate<BudgetingInputs>(prev => ({ ...prev, preset: "custom", wants: v }))} max={80} />
      <SliderField label="Savings" value={data.savings} suffix="%" onChange={v => onUpdate<BudgetingInputs>(prev => ({ ...prev, preset: "custom", savings: v }))} max={80} />
    </div>
  );
}

// ─── Habits ─────────────────────────────────────────────────────────────────

function HabitsPanel({ data, onUpdate }: { data: HabitInputs; onUpdate: Props["onUpdate"] }) {
  return (
    <div className="space-y-4">
      <SliderField label="Reduce dining out" value={data.reduceDiningOut} prefix="$" suffix="/wk" max={100}
        onChange={v => onUpdate<HabitInputs>(prev => ({ ...prev, reduceDiningOut: v }))} />
      <SliderField label="Cap rideshare to" value={data.capRideshare} prefix="$" suffix="/mo" max={300}
        onChange={v => onUpdate<HabitInputs>(prev => ({ ...prev, capRideshare: v }))} />
      <SliderField label="Increase groceries" value={data.increaseGroceries} prefix="$" suffix="/mo" max={200}
        onChange={v => onUpdate<HabitInputs>(prev => ({ ...prev, increaseGroceries: v }))} />
    </div>
  );
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

function SubscriptionsPanel({ data, onUpdate }: { data: SubscriptionInputs; onUpdate: Props["onUpdate"] }) {
  const toggle = (name: string) => {
    onUpdate<SubscriptionInputs>(prev => ({
      ...prev,
      toggles: { ...prev.toggles, [name]: !prev.toggles[name] },
    }));
  };

  return (
    <div className="space-y-2.5">
      {DEFAULT_SUBSCRIPTIONS.map(sub => (
        <div key={sub.name} className="flex items-center justify-between py-1">
          <div className="flex flex-col">
            <span className="text-sm text-foreground">{sub.name}</span>
            <span className="text-xs text-muted-foreground">${sub.cost}/mo</span>
          </div>
          <Switch
            checked={data.toggles[sub.name] ?? true}
            onCheckedChange={() => toggle(sub.name)}
          />
        </div>
      ))}
    </div>
  );
}

// ─── One-Time ───────────────────────────────────────────────────────────────

function OneTimePanel({ data, onUpdate }: { data: OneTimeInputs; onUpdate: Props["onUpdate"] }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Purchase Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            type="number"
            value={data.amount}
            onChange={e => onUpdate<OneTimeInputs>(prev => ({ ...prev, amount: Number(e.target.value) || 0 }))}
            className="pl-7"
          />
        </div>
      </div>
      <SliderField label="In month" value={data.month} suffix="" min={1} max={10}
        onChange={v => onUpdate<OneTimeInputs>(prev => ({ ...prev, month: v }))} />
    </div>
  );
}

// ─── Income ─────────────────────────────────────────────────────────────────

function IncomePanel({ data, onUpdate }: { data: IncomeInputs; onUpdate: Props["onUpdate"] }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Monthly Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            type="number"
            value={data.amount}
            onChange={e => onUpdate<IncomeInputs>(prev => ({ ...prev, amount: Number(e.target.value) || 0 }))}
            className="pl-7"
          />
        </div>
      </div>
      <SliderField label="Starting month" value={data.startMonth} suffix="" min={1} max={10}
        onChange={v => onUpdate<IncomeInputs>(prev => ({ ...prev, startMonth: v }))} />
    </div>
  );
}

// ─── Shared Slider ──────────────────────────────────────────────────────────

function SliderField({ label, value, onChange, min = 0, max = 100, prefix = "", suffix = "" }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs font-medium text-foreground tabular-nums">{prefix}{value}{suffix}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={1}
        className="w-full"
      />
    </div>
  );
}

export default ScenarioInputPanel;
