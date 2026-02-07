import { useState } from "react";
import { Camera, Lock, TrendingUp, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";

type RecordType = "snapshot" | "rule" | "forecast";

const typeConfig = {
  snapshot: { label: "Snapshot", icon: Camera, color: "text-primary" },
  rule: { label: "Rule", icon: Lock, color: "text-quantra-purple" },
  forecast: { label: "Forecast", icon: TrendingUp, color: "text-quantra-teal" },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSnapshot: (label: string, payload: Record<string, unknown>) => Promise<unknown>;
  onCreateRule: (ruleText: string) => Promise<unknown>;
  onCreateForecast: (
    label: string,
    metric: "Total Balance" | "Savings" | "Expenses",
    horizonMonths: number
  ) => Promise<unknown>;
}

const CreateVaultRecordDialog = ({
  open,
  onOpenChange,
  onCreateSnapshot,
  onCreateRule,
  onCreateForecast,
}: Props) => {
  const [recordType, setRecordType] = useState<RecordType>("snapshot");
  const [creating, setCreating] = useState(false);

  // Snapshot fields
  const [snapTemplate, setSnapTemplate] = useState("Total Balance");
  const [snapBalance, setSnapBalance] = useState("");
  const [snapIncome, setSnapIncome] = useState("");
  const [snapExpenses, setSnapExpenses] = useState("");

  // Rule fields
  const [ruleName, setRuleName] = useState("");
  const [ruleType, setRuleType] = useState("Maintain minimum balance");
  const [ruleValue, setRuleValue] = useState("");

  // Forecast fields
  const [forecastName, setForecastName] = useState("");
  const [forecastHorizon, setForecastHorizon] = useState("12");
  const [forecastMetric, setForecastMetric] = useState<"Total Balance" | "Savings" | "Expenses">("Total Balance");

  const { totalBalance, monthlyIncome, monthlyExpenseTotal } = useData();

  const resetFields = () => {
    setSnapTemplate("Total Balance");
    setSnapBalance("");
    setSnapIncome("");
    setSnapExpenses("");
    setRuleName("");
    setRuleType("Maintain minimum balance");
    setRuleValue("");
    setForecastName("");
    setForecastHorizon("12");
    setForecastMetric("Total Balance");
  };

  const isValid = (): boolean => {
    if (recordType === "snapshot") {
      return true; // defaults from demo data
    }
    if (recordType === "rule") {
      return ruleName.trim().length > 0;
    }
    if (recordType === "forecast") {
      return forecastName.trim().length > 0;
    }
    return false;
  };

  const handleCreate = async () => {
    if (!isValid()) return;
    setCreating(true);

    try {
      if (recordType === "snapshot") {
        const label = snapTemplate === "Custom" ? "Custom Snapshot" : snapTemplate;
        const payload: Record<string, unknown> = {
          label,
          period: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          totalBalance: snapBalance ? parseFloat(snapBalance) : totalBalance,
          monthlyIncome: snapIncome ? parseFloat(snapIncome) : monthlyIncome,
          monthlyExpenses: snapExpenses ? parseFloat(snapExpenses) : monthlyExpenseTotal,
          capturedAt: new Date().toISOString(),
        };
        await onCreateSnapshot(label, payload);
      } else if (recordType === "rule") {
        const ruleText = ruleValue
          ? `${ruleName} — ${ruleType}: ${ruleValue}`
          : ruleName;
        await onCreateRule(ruleText);
      } else {
        await onCreateForecast(
          forecastName,
          forecastMetric,
          parseInt(forecastHorizon)
        );
      }

      resetFields();
      onOpenChange(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create Vault Record
          </DialogTitle>
          <DialogDescription>
            Choose a record type and fill in the details. It will be hashed and stored.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* ── Type Selector (segmented) ──────────────────────── */}
          <div className="flex rounded-lg border border-border bg-muted/50 p-1">
            {(["snapshot", "rule", "forecast"] as RecordType[]).map((type) => {
              const cfg = typeConfig[type];
              const Icon = cfg.icon;
              const active = recordType === type;
              return (
                <button
                  key={type}
                  onClick={() => setRecordType(type)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    active
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? cfg.color : ""}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* ── Snapshot Fields ─────────────────────────────────── */}
          {recordType === "snapshot" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Snapshot Template
                </label>
                <Select value={snapTemplate} onValueChange={setSnapTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Total Balance">Total Balance</SelectItem>
                    <SelectItem value="Monthly Budget">Monthly Budget</SelectItem>
                    <SelectItem value="Savings Summary">Savings Summary</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Balance ($)
                  </label>
                  <Input
                    type="number"
                    placeholder={totalBalance.toLocaleString()}
                    value={snapBalance}
                    onChange={(e) => setSnapBalance(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Income ($)
                  </label>
                  <Input
                    type="number"
                    placeholder={monthlyIncome.toLocaleString()}
                    value={snapIncome}
                    onChange={(e) => setSnapIncome(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Expenses ($)
                  </label>
                  <Input
                    type="number"
                    placeholder={monthlyExpenseTotal.toLocaleString()}
                    value={snapExpenses}
                    onChange={(e) => setSnapExpenses(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Leave blank to use current demo values. Hash will be computed from the payload.
              </p>
            </div>
          )}

          {/* ── Rule Fields ────────────────────────────────────── */}
          {recordType === "rule" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Rule Name
                </label>
                <Input
                  placeholder='e.g. "Maintain $2,000 minimum balance"'
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Rule Type
                </label>
                <Select value={ruleType} onValueChange={setRuleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maintain minimum balance">Maintain minimum balance</SelectItem>
                    <SelectItem value="Savings rate target">Savings rate target</SelectItem>
                    <SelectItem value="Spending cap by category">Spending cap by category</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Target Value (e.g. $2000, 20%, $300)
                </label>
                <Input
                  placeholder="e.g. $2,000"
                  value={ruleValue}
                  onChange={(e) => setRuleValue(e.target.value)}
                  maxLength={50}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Rule will be hashed and locked immediately. You can archive it later but not edit.
              </p>
            </div>
          )}

          {/* ── Forecast Fields ────────────────────────────────── */}
          {recordType === "forecast" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Forecast Name
                </label>
                <Input
                  placeholder='e.g. "12-month balance forecast"'
                  value={forecastName}
                  onChange={(e) => setForecastName(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Horizon
                  </label>
                  <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Metric
                  </label>
                  <Select value={forecastMetric} onValueChange={(v) => setForecastMetric(v as typeof forecastMetric)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Total Balance">Total Balance</SelectItem>
                      <SelectItem value="Savings">Savings</SelectItem>
                      <SelectItem value="Expenses">Expenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Baseline and scenario projections will be generated and hashed. Status starts as "Tracking".
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValid() || creating}
            className="gap-1.5"
          >
            {creating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Create record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVaultRecordDialog;
