import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (ruleText: string) => Promise<unknown>;
}

const CreateRuleDialog = ({ open, onOpenChange, onCreate }: Props) => {
  const [ruleText, setRuleText] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!ruleText.trim()) return;
    setCreating(true);
    await onCreate(ruleText.trim());
    setRuleText("");
    setCreating(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-quantra-purple" />
            Create Rule
          </DialogTitle>
          <DialogDescription>
            Define a financial commitment. It will be hashed and locked
            immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Rule Statement
          </label>
          <Input
            placeholder='e.g. "Maintain $2,000 minimum balance"'
            value={ruleText}
            onChange={(e) => setRuleText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <p className="text-[11px] text-muted-foreground mt-2">
            Once created, the rule text cannot be modified. You can only archive
            it later.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!ruleText.trim() || creating}
            className="gap-1.5"
          >
            {creating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            Create & Lock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRuleDialog;
