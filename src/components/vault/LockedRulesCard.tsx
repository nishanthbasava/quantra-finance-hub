import { Lock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VaultRule } from "@/data/vaultData";

interface Props {
  rules: VaultRule[];
}

const LockedRulesCard = ({ rules }: Props) => (
  <div className="quantra-card p-0 overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-3 px-6 pt-6 pb-4">
      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-quantra-purple/10">
        <Lock className="h-4.5 w-4.5 text-quantra-purple" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">Locked Rules</h3>
        <p className="text-xs text-muted-foreground">Financial commitments you've sealed</p>
      </div>
    </div>

    {/* Entries */}
    <div className="divide-y divide-border/50">
      {rules.map((rule) => (
        <div key={rule.id} className="px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{rule.description}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Created {rule.dateCreated}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className={`gap-1 text-[11px] font-medium border-0 ${
                  rule.status === "Active"
                    ? "bg-quantra-green/10 text-quantra-green"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {rule.status}
              </Badge>
              <Badge variant="outline" className="gap-1 text-[11px] font-medium">
                <Lock className="h-2.5 w-2.5" />
                Locked
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground shrink-0 gap-1.5">
            <ExternalLink className="h-3 w-3" />
            History
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default LockedRulesCard;
