import { X } from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import type { Transaction } from "@/data/transactionData";
import type { InsightCommand } from "./InsightCommandBar";

interface InsightChartCardProps {
  command: InsightCommand;
  transactions: Transaction[];
  onDismiss: () => void;
}

const CHART_COLORS = [
  "hsl(170, 65%, 48%)", // teal
  "hsl(260, 50%, 65%)", // purple
  "hsl(200, 70%, 55%)", // blue
  "hsl(215, 45%, 55%)", // steel
  "hsl(185, 55%, 50%)", // cyan
  "hsl(30, 80%, 55%)",  // orange
  "hsl(340, 60%, 60%)", // pink
  "hsl(210, 20%, 70%)", // gray
];

const chartTitle: Record<InsightCommand, string> = {
  spending_by_category: "Spending by Category",
  top_merchants: "Top Merchants This Month",
  subscriptions_breakdown: "Subscriptions Breakdown",
  daily_spend: "Daily Spend Over Time",
};

function getCategoryData(txns: Transaction[]) {
  const map = new Map<string, number>();
  txns.filter((t) => t.type === "expense").forEach((t) => {
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  });
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}

function getMerchantData(txns: Transaction[]) {
  const map = new Map<string, number>();
  txns.filter((t) => t.type === "expense").forEach((t) => {
    map.set(t.merchant, (map.get(t.merchant) ?? 0) + t.amount);
  });
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

function getSubsData(txns: Transaction[]) {
  const map = new Map<string, number>();
  txns
    .filter((t) => t.category === "Subscriptions" && t.type === "expense")
    .forEach((t) => {
      map.set(t.merchant, (map.get(t.merchant) ?? 0) + t.amount);
    });
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}

function getDailyData(txns: Transaction[]) {
  const map = new Map<string, number>();
  txns
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      map.set(t.date, (map.get(t.date) ?? 0) + t.amount);
    });
  return [...map.entries()]
    .map(([date, value]) => ({
      date: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(value * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const InsightChartCard = ({ command, transactions, onDismiss }: InsightChartCardProps) => {
  const renderChart = () => {
    switch (command) {
      case "spending_by_category": {
        const data = getCategoryData(transactions);
        return (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      case "top_merchants": {
        const data = getMerchantData(transactions);
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
              <RechartsTooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      }
      case "subscriptions_breakdown": {
        const data = getSubsData(transactions);
        return (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      case "daily_spend": {
        const data = getDailyData(transactions);
        return (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <RechartsTooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Spent"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS[2]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[2], r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="quantra-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-foreground">{chartTitle[command]}</h4>
        <button
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      {renderChart()}
    </motion.div>
  );
};

export default InsightChartCard;
