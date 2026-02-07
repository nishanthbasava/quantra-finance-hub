import { useState } from "react";
import { Info, Plus, Loader2 } from "lucide-react";
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
import SnapshotDetailModal from "@/components/vault/SnapshotDetailModal";
import RuleHistoryModal from "@/components/vault/RuleHistoryModal";
import ForecastCompareModal from "@/components/vault/ForecastCompareModal";
import CreateSnapshotDialog from "@/components/vault/CreateSnapshotDialog";
import CreateRuleDialog from "@/components/vault/CreateRuleDialog";
import { useVault } from "@/hooks/useVault";
import type { VaultSnapshot, VaultRule, VaultForecastProof } from "@/lib/xrplVault/types";

const XRPLVault = () => {
  const vault = useVault();

  // Info dialog
  const [infoOpen, setInfoOpen] = useState(false);

  // Modal states
  const [selectedSnapshot, setSelectedSnapshot] = useState<VaultSnapshot | null>(null);
  const [selectedRule, setSelectedRule] = useState<VaultRule | null>(null);
  const [selectedForecast, setSelectedForecast] = useState<VaultForecastProof | null>(null);
  const [createSnapshotOpen, setCreateSnapshotOpen] = useState(false);
  const [createRuleOpen, setCreateRuleOpen] = useState(false);

  if (vault.loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          <SnapshotsCard
            snapshots={vault.snapshots}
            onDetails={(snap) => setSelectedSnapshot(snap)}
            onCreateNew={() => setCreateSnapshotOpen(true)}
          />
          <LockedRulesCard
            rules={vault.rules}
            onHistory={(rule) => setSelectedRule(rule)}
            onCreateNew={() => setCreateRuleOpen(true)}
          />
          <ForecastProofsCard
            forecasts={vault.forecasts}
            onCompare={(fc) => setSelectedForecast(fc)}
          />
        </div>
      </section>

      {/* Timeline + Trust */}
      <section
        className="mx-auto max-w-6xl px-6 mt-8 animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          <VaultTimeline events={vault.events} />
          <div className="space-y-5">
            <TrustCallout />

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

      {/* ── Modals ─────────────────────────────────────────────── */}

      {/* Snapshot Details */}
      <SnapshotDetailModal
        snapshot={selectedSnapshot}
        open={!!selectedSnapshot}
        onOpenChange={(open) => {
          if (!open) setSelectedSnapshot(null);
        }}
        onVerify={vault.verifySnapshot}
        onAnchor={vault.anchorItem}
      />

      {/* Rule History */}
      <RuleHistoryModal
        rule={selectedRule}
        open={!!selectedRule}
        onOpenChange={(open) => {
          if (!open) setSelectedRule(null);
        }}
        events={vault.events}
        onArchive={(id) => {
          vault.archiveRule(id);
        }}
        onAnchor={vault.anchorItem}
      />

      {/* Forecast Compare */}
      <ForecastCompareModal
        forecast={selectedForecast}
        open={!!selectedForecast}
        onOpenChange={(open) => {
          if (!open) setSelectedForecast(null);
        }}
        onEvaluate={vault.evaluateForecast}
        onAnchor={vault.anchorItem}
      />

      {/* Create Snapshot */}
      <CreateSnapshotDialog
        open={createSnapshotOpen}
        onOpenChange={setCreateSnapshotOpen}
        onCreate={vault.createSnapshot}
      />

      {/* Create Rule */}
      <CreateRuleDialog
        open={createRuleOpen}
        onOpenChange={setCreateRuleOpen}
        onCreate={vault.createRule}
      />
    </div>
  );
};

export default XRPLVault;
