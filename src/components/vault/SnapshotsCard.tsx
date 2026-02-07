import { Camera, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VaultSnapshot } from "@/data/vaultData";

interface Props {
  snapshots: VaultSnapshot[];
}

const SnapshotsCard = ({ snapshots }: Props) => (
  <div className="quantra-card p-0 overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-3 px-6 pt-6 pb-4">
      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
        <Camera className="h-4.5 w-4.5 text-primary" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">Verified Snapshots</h3>
        <p className="text-xs text-muted-foreground">Immutable records of your financial state</p>
      </div>
    </div>

    {/* Entries */}
    <div className="divide-y divide-border/50">
      {snapshots.map((snap) => (
        <div key={snap.id} className="px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {snap.label} — {snap.period}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{snap.timestamp}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="gap-1 text-[11px] font-medium bg-quantra-green/10 text-quantra-green border-0">
                <ShieldCheck className="h-3 w-3" />
                {snap.status}
              </Badge>
              <span className="text-[11px] font-mono text-muted-foreground/70">{snap.hash}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground shrink-0 gap-1.5">
            <ExternalLink className="h-3 w-3" />
            Details
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default SnapshotsCard;
