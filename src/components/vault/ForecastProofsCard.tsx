import { TrendingUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VaultForecastProof } from "@/lib/xrplVault/types";

const outcomeStyles: Record<VaultForecastProof["status"], string> = {
  tracking: "bg-quantra-blue/10 text-quantra-blue",
  exceeded: "bg-quantra-green/10 text-quantra-green",
  missed: "bg-quantra-red/10 text-quantra-red",
};

interface Props {
  forecasts: VaultForecastProof[];
  onCompare: (forecast: VaultForecastProof) => void;
}

const ForecastProofsCard = ({ forecasts, onCompare }: Props) => (
  <div className="quantra-card p-0 overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-3 px-6 pt-6 pb-4">
      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-quantra-teal/10">
        <TrendingUp className="h-4.5 w-4.5 text-quantra-teal" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">Forecast Proofs</h3>
        <p className="text-xs text-muted-foreground">Track projections against real outcomes</p>
      </div>
    </div>

    {/* Entries */}
    <div className="divide-y divide-border/50">
      {forecasts.map((fc) => {
        const dateStr = new Date(fc.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        return (
          <div key={fc.id} className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{fc.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Created {dateStr}</p>
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className={`text-[11px] font-medium border-0 capitalize ${outcomeStyles[fc.status]}`}
                >
                  {fc.status}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground shrink-0 gap-1.5"
              onClick={() => onCompare(fc)}
            >
              <ExternalLink className="h-3 w-3" />
              Compare
            </Button>
          </div>
        );
      })}
    </div>
  </div>
);

export default ForecastProofsCard;
