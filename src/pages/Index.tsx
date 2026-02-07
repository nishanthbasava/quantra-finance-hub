import MetricCard from "@/components/MetricCard";
import SankeyDiagram from "@/components/SankeyDiagram";
import PromptBar from "@/components/PromptBar";

const Dashboard = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] pb-28">
      {/* Hero */}
      <section className="pt-16 pb-10 text-center animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
          Track your money.
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Get a clear view of your finances. Ask Quantra anything.
        </p>
      </section>

      {/* Metrics Row */}
      <section className="mx-auto max-w-4xl px-6 mb-10" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <MetricCard title="Total Balance" value="$20,543.21" />
          <MetricCard
            title="Income"
            value="+$5,260.00"
            subtitle="This month"
            valueColor="text-quantra-green"
          />
          <MetricCard
            title="Expenses"
            value="−$2,750.42"
            subtitle="This month"
            valueColor="text-quantra-red"
          />
          <MetricCard
            title="Cash Flow"
            value="+$2,509.58"
            badge="+21.4%"
            badgeColor="text-quantra-green"
            subtitle="since last month"
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
