import { useState } from "react";
import { TrendingUp, Copy, Check, Anchor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { VaultForecastProof } from "@/lib/xrplVault/types";

const statusStyles: Record<VaultForecastProof["status"], string> = {
  tracking: "bg-quantra-blue/10 text-quantra-blue",
  exceeded: "bg-quantra-green/10 text-quantra-green",
  missed: "bg-quantra-red/10 text-quantra-red",
};

interface Props {
  forecast: VaultForecastProof | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEvaluate: (id: string, status: "tracking" | "exceeded" | "missed") => void;
  onAnchor: (type: "forecast", id: string) => Promise<string | undefined>;
}

const ForecastCompareModal = ({
  forecast,
  open,
  onOpenChange,
  onEvaluate,
  onAnchor,
}: Props) => {
  const [copied, setCopied] = useState(false);
  const [anchoring, setAnchoring] = useState(false);

  if (!forecast) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(forecast.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnchor = async () => {
    setAnchoring(true);
    await onAnchor("forecast", forecast.id);
    setAnchoring(false);
  };

  // Build chart data from baseline/scenario arrays
  const chartData = (forecast.baselineData ?? []).map((b, i) => ({
    month: `M${i + 1}`,
    Baseline: b,
    Scenario: forecast.scenarioData?.[i] ?? 0,
  }));

  const formattedDate = new Date(forecast.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-quantra-teal" />
            {forecast.label}
          </DialogTitle>
          <DialogDescription>
            {forecast.metric} · {forecast.horizonMonths}-month horizon · Created{" "}
            {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Chart */}
          {chartData.length > 0 && (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="Baseline"
                    stroke="hsl(var(--quantra-blue))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Scenario"
                    stroke="hsl(var(--quantra-teal))"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Hashes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Baseline Hash
              </label>
              <code className="block mt-1 text-[11px] font-mono bg-muted px-2 py-1.5 rounded text-foreground truncate">
                {forecast.baselineHash}
              </code>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Scenario Hash
              </label>
              <code className="block mt-1 text-[11px] font-mono bg-muted px-2 py-1.5 rounded text-foreground truncate">
                {forecast.scenarioHash}
              </code>
            </div>
          </div>

          {/* Proof Hash */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Proof Hash
            </label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded-md break-all text-foreground">
                {forecast.hash}
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
              className={`text-xs font-medium border-0 capitalize ${statusStyles[forecast.status]}`}
            >
              {forecast.status}
            </Badge>
          </div>

          {/* XRPL Tx */}
          {forecast.xrplTxHash && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                XRPL Transaction
              </label>
              <code className="block mt-1 text-xs font-mono bg-muted px-3 py-2 rounded-md break-all text-foreground">
                {forecast.xrplTxHash}
              </code>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => onEvaluate(forecast.id, "exceeded")}
              variant="outline"
              size="sm"
              className="text-xs gap-1"
            >
              Mark Exceeded
            </Button>
            <Button
              onClick={() => onEvaluate(forecast.id, "missed")}
              variant="outline"
              size="sm"
              className="text-xs gap-1"
            >
              Mark Missed
            </Button>
            <Button
              onClick={() => onEvaluate(forecast.id, "tracking")}
              variant="outline"
              size="sm"
              className="text-xs gap-1"
            >
              Mark Tracking
            </Button>
            {!forecast.xrplTxHash && (
              <Button
                onClick={handleAnchor}
                disabled={anchoring}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
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

export default ForecastCompareModal;
