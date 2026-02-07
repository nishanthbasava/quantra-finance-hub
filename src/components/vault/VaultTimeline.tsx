import { Camera, Lock, TrendingUp } from "lucide-react";
import type { VaultTimelineEntry } from "@/data/vaultData";

const iconMap: Record<VaultTimelineEntry["type"], React.ReactNode> = {
  snapshot: <Camera className="h-3.5 w-3.5" />,
  rule: <Lock className="h-3.5 w-3.5" />,
  forecast: <TrendingUp className="h-3.5 w-3.5" />,
};

const dotColorMap: Record<VaultTimelineEntry["type"], string> = {
  snapshot: "bg-primary text-primary-foreground",
  rule: "bg-quantra-purple text-white",
  forecast: "bg-quantra-teal text-white",
};

interface Props {
  entries: VaultTimelineEntry[];
}

const VaultTimeline = ({ entries }: Props) => (
  <div className="quantra-card px-6 py-6">
    <h3 className="text-base font-semibold text-foreground mb-5">Activity Log</h3>

    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-5">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-4 relative">
            {/* Dot / Icon */}
            <div
              className={`relative z-10 flex items-center justify-center h-[30px] w-[30px] rounded-full shrink-0 ${dotColorMap[entry.type]}`}
            >
              {iconMap[entry.type]}
            </div>

            {/* Content */}
            <div className="pt-1">
              <p className="text-sm text-foreground leading-snug">{entry.description}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{entry.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default VaultTimeline;
