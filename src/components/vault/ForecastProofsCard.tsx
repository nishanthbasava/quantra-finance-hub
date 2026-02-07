import { TrendingUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ForecastProof } from "@/data/vaultData";

const outcomeStyles: Record<ForecastProof["outcome"], string> = {
  Tracking: "bg-quantra-blue/10 text-quantra-blue",
  Exceeded: "bg-quantra-green/10 text-quantra-green",
  Missed: "bg-quantra-red/10 text-quantra-red",
};

interface Props {
  forecasts: ForecastProof[];
}

const ForecastProofsCard = ({ forecasts }: Props) => (
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
      {forecasts.map((fc) => (
        <div key={fc.id} className="px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{fc.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Created {fc.forecastDate}</p>
            <div className="mt-2">
              <Badge
                variant="secondary"
                className={`text-[11px] font-medium border-0 ${outcomeStyles[fc.outcome]}`}
              >
                {fc.outcome}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground shrink-0 gap-1.5">
            <ExternalLink className="h-3 w-3" />
            Compare
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default ForecastProofsCard;
