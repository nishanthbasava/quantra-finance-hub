import { Camera, ExternalLink, ShieldCheck, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VaultSnapshot } from "@/lib/xrplVault/types";

interface Props {
  snapshots: VaultSnapshot[];
  onDetails: (snapshot: VaultSnapshot) => void;
  onCreateNew: () => void;
}

const SnapshotsCard = ({ snapshots, onDetails, onCreateNew }: Props) => (
  <div className="quantra-card p-0 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-6 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
          <Camera className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Verified Snapshots</h3>
          <p className="text-xs text-muted-foreground">Immutable records of your financial state</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onCreateNew} className="gap-1 text-xs text-muted-foreground">
        <Plus className="h-3.5 w-3.5" />
        New
      </Button>
    </div>

    {/* Entries */}
    <div className="divide-y divide-border/50">
      {snapshots.map((snap) => {
        const dateStr = new Date(snap.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const shortHash = snap.hash.slice(0, 6) + "…" + snap.hash.slice(-4);

        return (
          <div key={snap.id} className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{snap.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className={`gap-1 text-[11px] font-medium border-0 ${
                    snap.verified
                      ? "bg-quantra-green/10 text-quantra-green"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {snap.verified ? "Verified" : "Unverified"}
                </Badge>
                <span className="text-[11px] font-mono text-muted-foreground/70">{shortHash}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground shrink-0 gap-1.5"
              onClick={() => onDetails(snap)}
            >
              <ExternalLink className="h-3 w-3" />
              Details
            </Button>
          </div>
        );
      })}
    </div>
  </div>
);

export default SnapshotsCard;
