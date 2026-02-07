import { useState } from "react";
import { Lock, Copy, Check, Anchor, Archive, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { VaultRule, VaultActivityEvent } from "@/lib/xrplVault/types";

interface Props {
  rule: VaultRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: VaultActivityEvent[];
  onArchive: (id: string) => void;
  onAnchor: (type: "rule", id: string) => Promise<string | undefined>;
}

const iconMap: Record<string, React.ReactNode> = {
  created: <Camera className="h-3 w-3" />,
  locked: <Lock className="h-3 w-3" />,
  archived: <Archive className="h-3 w-3" />,
  anchored: <Anchor className="h-3 w-3" />,
};

const RuleHistoryModal = ({
  rule,
  open,
  onOpenChange,
  events,
  onArchive,
  onAnchor,
}: Props) => {
  const [copied, setCopied] = useState(false);
  const [anchoring, setAnchoring] = useState(false);

  if (!rule) return null;

  const ruleEvents = events
    .filter((e) => e.refId === rule.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rule.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnchor = async () => {
    setAnchoring(true);
    await onAnchor("rule", rule.id);
    setAnchoring(false);
  };

  const formattedDate = new Date(rule.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-quantra-purple" />
            Rule History
          </DialogTitle>
          <DialogDescription>Created {formattedDate}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Rule Text */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rule
            </label>
            <p className="mt-1 text-sm font-medium text-foreground bg-muted px-3 py-2 rounded-md">
              {rule.ruleText}
            </p>
          </div>

          {/* Hash */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              SHA-256 Hash
            </label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded-md break-all text-foreground">
                {rule.hash}
              </code>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-quantra-green" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`text-xs font-medium border-0 ${
                rule.status === "active"
                  ? "bg-quantra-green/10 text-quantra-green"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {rule.status === "active" ? "Active" : "Archived"}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium gap-1">
              <Lock className="h-2.5 w-2.5" />
              Locked
            </Badge>
          </div>

          {/* XRPL Tx Hash */}
          {rule.xrplTxHash && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                XRPL Transaction
              </label>
              <code className="block mt-1 text-xs font-mono bg-muted px-3 py-2 rounded-md break-all text-foreground">
                {rule.xrplTxHash}
              </code>
            </div>
          )}

          {/* Activity Timeline */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              History
            </label>
            <div className="space-y-3 relative">
              {ruleEvents.length > 1 && (
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
              )}
              {ruleEvents.map((evt) => (
                <div key={evt.id} className="flex items-start gap-3 relative">
                  <div className="relative z-10 flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground shrink-0">
                    {iconMap[evt.action] ?? <Camera className="h-3 w-3" />}
                  </div>
                  <div>
                    <p className="text-xs text-foreground">{evt.summary}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(evt.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {rule.status === "active" && (
              <Button
                onClick={() => onArchive(rule.id)}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>
            )}
            {!rule.xrplTxHash && (
              <Button
                onClick={handleAnchor}
                disabled={anchoring}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                {anchoring ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Anchor className="h-3.5 w-3.5" />
                )}
                Anchor to XRPL
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleHistoryModal;
