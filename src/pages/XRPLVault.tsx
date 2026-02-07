import { useState } from "react";
import { Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import SnapshotsCard from "@/components/vault/SnapshotsCard";
import LockedRulesCard from "@/components/vault/LockedRulesCard";
import ForecastProofsCard from "@/components/vault/ForecastProofsCard";
import VaultTimeline from "@/components/vault/VaultTimeline";
import TrustCallout from "@/components/vault/TrustCallout";
import {
  demoSnapshots,
  demoRules,
  demoForecasts,
  demoTimeline,
} from "@/data/vaultData";

const XRPLVault = () => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-20">
      {/* Header */}
      <section className="pt-14 pb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            XRPL Vault
          </h1>
          <button
            onClick={() => setInfoOpen(true)}
            className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="What is XRPL Vault?"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
        <p className="text-lg text-muted-foreground mb-1">
          Lock in financial snapshots and rules — permanently and verifiably.
        </p>
      </section>

      {/* Info Modal */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>What is XRPL Vault?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-2">
              XRPL Vault records cryptographic proofs of your financial state so it can't be edited
              later. It doesn't store raw bank data — only verifiable hashes that prove your records
              existed at a specific point in time.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Vault Cards Grid */}
      <section
        className="mx-auto max-w-6xl px-6 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SnapshotsCard snapshots={demoSnapshots} />
          <LockedRulesCard rules={demoRules} />
          <ForecastProofsCard forecasts={demoForecasts} />
        </div>
      </section>

      {/* Timeline + Trust */}
      <section
        className="mx-auto max-w-6xl px-6 mt-8 animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          <VaultTimeline entries={demoTimeline} />
          <div className="space-y-5">
            <TrustCallout />

            {/* Disabled Action */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block w-full">
                  <Button
                    disabled
                    className="w-full gap-2 opacity-60"
                    size="lg"
                  >
                    <Plus className="h-4 w-4" />
                    Create new vault record
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Coming soon — enable verification after setup.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </section>
    </div>
  );
};

export default XRPLVault;
