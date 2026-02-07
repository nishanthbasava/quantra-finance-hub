import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
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
import { useData } from "@/contexts/DataContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    label: string,
    payload: Record<string, unknown>
  ) => Promise<unknown>;
}

const CreateSnapshotDialog = ({ open, onOpenChange, onCreate }: Props) => {
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const { totalBalance, monthlyIncome, monthlyExpenseTotal, cashFlow } =
    useData();

  const handleCreate = async () => {
    if (!label.trim()) return;
    setCreating(true);

    const now = new Date();
    const payload: Record<string, unknown> = {
      label: label.trim(),
      period: now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      totalBalance,
      monthlyIncome,
      monthlyExpenses: monthlyExpenseTotal,
      cashFlow,
      capturedAt: now.toISOString(),
    };

    await onCreate(label.trim(), payload);
    setLabel("");
    setCreating(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Create Snapshot
          </DialogTitle>
          <DialogDescription>
            Capture the current financial state as a verified record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Label
            </label>
            <Input
              placeholder="e.g. Monthly Summary"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          <div className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 space-y-1">
            <p>This will capture:</p>
            <p>
              • Balance: $
              {totalBalance.toLocaleString()}
            </p>
            <p>
              • Income: $
              {monthlyIncome.toLocaleString()}/mo
            </p>
            <p>
              • Expenses: $
              {monthlyExpenseTotal.toLocaleString()}/mo
            </p>
            <p>
              • Cash Flow: $
              {cashFlow.toLocaleString()}/mo
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!label.trim() || creating}
            className="gap-1.5"
          >
            {creating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            Create & Hash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSnapshotDialog;
