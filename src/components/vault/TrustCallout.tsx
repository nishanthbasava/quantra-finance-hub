import { ShieldCheck } from "lucide-react";

const TrustCallout = () => (
  <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-5 flex items-start gap-4">
    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0 mt-0.5">
      <ShieldCheck className="h-4.5 w-4.5 text-primary" />
    </div>
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-1">Your data stays private</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">
        XRPL Vault stores cryptographic proofs, not raw financial data. No transactions or personal
        details are exposed. Only you can verify your records.
      </p>
    </div>
  </div>
);

export default TrustCallout;
