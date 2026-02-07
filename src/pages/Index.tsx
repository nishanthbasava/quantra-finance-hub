import MetricCard from "@/components/MetricCard";
import SankeyDiagram from "@/components/SankeyDiagram";
import PromptBar from "@/components/PromptBar";
import { useData, TIME_RANGE_OPTIONS } from "@/contexts/DataContext";

const Dashboard = () => {
  const { totalBalance, monthlyIncome, monthlyExpenseTotal, cashFlow, timeRange } = useData();

  const cashFlowPct = monthlyExpenseTotal > 0
    ? ((cashFlow / monthlyExpenseTotal) * 100).toFixed(1)
    : "0.0";

  const rangeLabel = TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label ?? "Last 90 Days";
  const subtitle = timeRange === "90d" ? "Monthly avg" : rangeLabel;

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-28">
      {/* Hero */}
      <section className="pt-16 pb-10 text-center animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
          Turn financial data into decisions.
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Get a clear view of your finances with AI-powered analytics. Ask Quantra anything.
        </p>
      </section>

      {/* Metrics Row */}
      <section className="mx-auto max-w-4xl px-6 mb-10" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <MetricCard
            title="Total Balance"
            value={`$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          />
          <MetricCard
            title="Income"
            value={`+$${monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            subtitle={subtitle}
            valueColor="text-quantra-green"
          />
          <MetricCard
            title="Expenses"
            value={`−$${monthlyExpenseTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            subtitle={subtitle}
            valueColor="text-quantra-red"
          />
          <MetricCard
            title="Cash Flow"
            value={`${cashFlow >= 0 ? "+" : ""}$${Math.abs(cashFlow).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            badge={`${cashFlow >= 0 ? "+" : ""}${cashFlowPct}%`}
            badgeColor={cashFlow >= 0 ? "text-quantra-green" : "text-quantra-red"}
            subtitle="monthly net"
          />
        </div>
      </section>

      {/* Sankey Diagram */}
      <section className="mx-auto max-w-4xl px-6 mb-10 animate-fade-in" style={{ animationDelay: "0.25s" }}>
        <SankeyDiagram />
      </section>

      {/* Prompt Bar */}
      <PromptBar />
    </div>
  );
};

export default Dashboard;
