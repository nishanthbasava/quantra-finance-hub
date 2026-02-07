import { useState } from "react";
import { ShieldCheck, Copy, Check, Anchor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { VaultSnapshot } from "@/lib/xrplVault/types";

interface Props {
  snapshot: VaultSnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (id: string) => Promise<boolean>;
  onAnchor: (type: "snapshot", id: string) => Promise<string | undefined>;
}

const SnapshotDetailModal = ({
  snapshot,
  open,
  onOpenChange,
  onVerify,
  onAnchor,
}: Props) => {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [anchoring, setAnchoring] = useState(false);

  if (!snapshot) return null;

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    const result = await onVerify(snapshot.id);
    setVerifyResult(result);
    setVerifying(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snapshot.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnchor = async () => {
    setAnchoring(true);
    await onAnchor("snapshot", snapshot.id);
    setAnchoring(false);
  };

  const formattedDate = new Date(snapshot.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-quantra-green" />
            {snapshot.label}
          </DialogTitle>
          <DialogDescription>{formattedDate}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Hash */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              SHA-256 Hash
            </label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded-md break-all text-foreground">
                {snapshot.hash}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-quantra-green" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Payload Preview */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Payload
            </label>
            <pre className="mt-1 text-xs font-mono bg-muted px-3 py-2 rounded-md overflow-auto max-h-40 text-foreground">
              {JSON.stringify(snapshot.payload, null, 2)}
            </pre>
          </div>

          {/* Verification Status */}
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className={`text-xs font-medium border-0 ${
                snapshot.verified
                  ? "bg-quantra-green/10 text-quantra-green"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {snapshot.verified ? "Verified" : "Unverified"}
            </Badge>
            {verifyResult === true && (
              <span className="text-xs text-quantra-green font-medium">
                ✓ Hash matches payload
              </span>
            )}
            {verifyResult === false && (
              <span className="text-xs text-quantra-red font-medium">
                ✗ Hash mismatch!
              </span>
            )}
          </div>

          {/* XRPL Tx Hash */}
          {snapshot.xrplTxHash && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                XRPL Transaction
              </label>
              <code className="block mt-1 text-xs font-mono bg-muted px-3 py-2 rounded-md break-all text-foreground">
                {snapshot.xrplTxHash}
              </code>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {!snapshot.verified && (
              <Button
                onClick={handleVerify}
                disabled={verifying}
                size="sm"
                className="gap-1.5"
              >
                {verifying ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                Verify
              </Button>
            )}
            {!snapshot.xrplTxHash && (
              <Button
                onClick={handleAnchor}
                disabled={anchoring}
                variant="outline"
                size="sm"
                className="gap-1.5"
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

export default SnapshotDetailModal;
