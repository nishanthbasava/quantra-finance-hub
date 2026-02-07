import { Scenario, ForecastMetric, FORECAST_METRICS } from "@/data/simulationData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useMemo } from "react";

interface Props {
  metric: ForecastMetric;
  onMetricChange: (m: ForecastMetric) => void;
  forecastData: Record<string, number | string>[];
  scenarios: Scenario[];
}

const ForecastChart = ({ metric, onMetricChange, forecastData, scenarios }: Props) => {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      Baseline: { label: "Baseline", color: "hsl(var(--muted-foreground))" },
    };
    scenarios.forEach(s => {
      config[s.name] = { label: s.name, color: s.color };
    });
    return config;
  }, [scenarios]);

  const metricLabel = FORECAST_METRICS.find(m => m.value === metric)?.label ?? metric;
  const formatValue = (v: number) => {
    if (metric === "savings") return `${v}%`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <Card className="quantra-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground">Forecast</CardTitle>
        <Select value={metric} onValueChange={v => onMetricChange(v as ForecastMetric)}>
          <SelectTrigger className="w-[170px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORECAST_METRICS.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
          <LineChart data={forecastData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
              tickFormatter={v => metric === "savings" ? `${v}%` : `$${(v / 1000).toFixed(0)}k`}
              width={45}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Month: ${label}`}
                  formatter={(value, name) => (
                    <span className="font-mono text-xs">{formatValue(value as number)}</span>
                  )}
                />
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Baseline"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 4 }}
            />
            {scenarios.map(s => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.name}
                stroke={s.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;
