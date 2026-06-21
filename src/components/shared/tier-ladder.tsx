import { Trophy } from "lucide-react";
import { computeWorkerTier, type TierInputs } from "@/lib/worker-tier";

export function TierLadder({ inputs, compact = false }: { inputs: TierInputs; compact?: boolean }) {
  const { current, next, progress, remaining } = computeWorkerTier(inputs);

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${current.color}`}>
        <Trophy className="w-3 h-3" />
        {current.label}
      </span>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground font-heading flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-primary" />
          Seller Tier
        </h3>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.color}`}>
          {current.label}
        </span>
      </div>

      {next ? (
        <>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {progress}% to <span className="font-medium text-foreground">{next.label}</span>
          </p>
          {remaining.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {remaining.map((r) => (
                <li key={r} className="text-[11px] text-muted-foreground">• {r}</li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Top tier reached — you&apos;re among QuickQuid&apos;s most reliable freelancers.
        </p>
      )}
    </div>
  );
}
