import { useSimulation } from "@/hooks/useSimulation";
import ScenarioBuilder from "@/components/simulation/ScenarioBuilder";
import ForecastChart from "@/components/simulation/ForecastChart";
import SummaryCards from "@/components/simulation/SummaryCards";
import SuggestedActions from "@/components/simulation/SuggestedActions";
import QuantraAsks from "@/components/simulation/QuantraAsks";
import NLPInput from "@/components/simulation/NLPInput";

const Simulation = () => {
  const sim = useSimulation();

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-20">
      {/* Header */}
      <section className="pt-14 pb-8 text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
          Simulation
        </h1>
        <p className="text-lg text-muted-foreground mb-1">Predict your money.</p>
        <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
          Compare scenarios, forecast outcomes, and explore tradeoffs.
        </p>
      </section>

      {/* Two-Panel Layout */}
      <section className="mx-auto max-w-6xl px-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Left: Builder */}
          <div className="space-y-4">
            <ScenarioBuilder
              simulationType={sim.simulationType}
              onTypeChange={sim.setSimulationType}
              scenarioName={sim.scenarioName}
              onNameChange={sim.setScenarioName}
              currentInputs={sim.currentInputs}
              onUpdateInputs={sim.updateInputs}
              scenarios={sim.scenarios}
              onAddScenario={sim.addScenario}
              onRemoveScenario={sim.removeScenario}
              onReset={sim.resetAll}
            />
            <NLPInput
              onSubmit={sim.addFromNLP}
              simulationType={sim.simulationType}
              metric={sim.metric}
              scenarioCount={sim.scenarios.length}
            />
          </div>

          {/* Right: Output */}
          <div className="space-y-5">
            <ForecastChart
              metric={sim.metric}
              onMetricChange={sim.setMetric}
              forecastData={sim.forecastData}
              scenarios={sim.scenarios}
            />
            <SummaryCards data={sim.summaryCards} metric={sim.metric} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SuggestedActions suggestions={sim.suggestions} />
              <QuantraAsks question={sim.question} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Simulation;
