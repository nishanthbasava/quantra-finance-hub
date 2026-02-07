import { Camera, Lock, TrendingUp, Anchor, ShieldCheck, Archive } from "lucide-react";
import type { VaultActivityEvent } from "@/lib/xrplVault/types";

const typeIconMap: Record<VaultActivityEvent["type"], React.ReactNode> = {
  snapshot: <Camera className="h-3.5 w-3.5" />,
  rule: <Lock className="h-3.5 w-3.5" />,
  forecast: <TrendingUp className="h-3.5 w-3.5" />,
};

const actionIconMap: Record<string, React.ReactNode> = {
  verified: <ShieldCheck className="h-3.5 w-3.5" />,
  anchored: <Anchor className="h-3.5 w-3.5" />,
  archived: <Archive className="h-3.5 w-3.5" />,
};

const dotColorMap: Record<VaultActivityEvent["type"], string> = {
  snapshot: "bg-primary text-primary-foreground",
  rule: "bg-quantra-purple text-white",
  forecast: "bg-quantra-teal text-white",
};

interface Props {
  events: VaultActivityEvent[];
}

const VaultTimeline = ({ events }: Props) => {
  // Show most recent 10 events
  const visible = events.slice(0, 10);

  return (
    <div className="quantra-card px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">Activity Log</h3>
        <span className="text-xs text-muted-foreground">{events.length} events</span>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No activity yet. Create a snapshot or rule to get started.
        </p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-5">
            {visible.map((entry) => {
              const dateStr = new Date(entry.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const icon = actionIconMap[entry.action] ?? typeIconMap[entry.type];

              return (
                <div key={entry.id} className="flex items-start gap-4 relative">
                  <div
                    className={`relative z-10 flex items-center justify-center h-[30px] w-[30px] rounded-full shrink-0 ${dotColorMap[entry.type]}`}
                  >
                    {icon}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-foreground leading-snug">{entry.summary}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultTimeline;
