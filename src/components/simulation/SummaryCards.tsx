import { ForecastMetric } from "@/data/simulationData";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryData {
  best: { month: string; value: number };
  worst: { month: string; value: number };
  endDelta: number;
  scenarioName: string;
}

interface Props {
  data: SummaryData | null;
  metric: ForecastMetric;
}

const SummaryCards = ({ data, metric }: Props) => {
  if (!data) return null;

  const format = (v: number) => (metric === "savings" ? `${v}%` : `$${Math.abs(v).toLocaleString()}`);

  const cards = [
    {
      label: "Best month",
      value: format(data.best.value),
      sub: data.best.month,
      icon: TrendingUp,
      color: "text-quantra-green",
    },
    {
      label: "Worst month",
      value: format(data.worst.value),
      sub: data.worst.month,
      icon: TrendingDown,
      color: "text-quantra-red",
    },
    {
      label: "End-of-period delta",
      value: `${data.endDelta >= 0 ? "+" : "−"}${format(data.endDelta)}`,
      sub: `vs. baseline (${data.scenarioName})`,
      icon: ArrowUpDown,
      color: data.endDelta >= 0 ? "text-quantra-green" : "text-quantra-red",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <Card className="quantra-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
              <p className={`text-lg font-bold tabular-nums ${c.color}`}>{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
