"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { applyToJob } from "@/app/actions/applications";
import { Send, ChevronUp, FolderGit2 } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
}

interface ApplyButtonProps {
  jobId: string;
  jobTitle: string;
  paymentType: "FIXED" | "HOURLY";
  budgetMin: number | null;
  budgetMax: number | null;
  portfolio: PortfolioItem[];
  disabled?: boolean;
  disabledReason?: string;
}

export function ApplyButton({
  jobId,
  paymentType,
  budgetMin,
  budgetMax,
  portfolio,
  disabled,
  disabledReason,
}: ApplyButtonProps) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [rateType, setRateType] = useState<"FIXED" | "HOURLY">(paymentType);
  const [proposedRate, setProposedRate] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [availabilityHours, setAvailabilityHours] = useState("");
  const [attachIds, setAttachIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleAttach(id: string) {
    setAttachIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await applyToJob(jobId, {
        coverLetter: coverLetter || undefined,
        rateType,
        proposedRate: proposedRate ? Number(proposedRate) : undefined,
        estimatedDays: estimatedDays ? Number(estimatedDays) : undefined,
        availabilityHours: availabilityHours ? Number(availabilityHours) : undefined,
        attachmentIds: attachIds,
      });
      if (result.error) setError(result.error);
      else { setSuccess(true); setOpen(false); }
    });
  }

  if (success) {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
        Applied ✓
      </span>
    );
  }

  if (disabled) {
    return <div className="text-xs text-muted-foreground text-right max-w-[160px]">{disabledReason}</div>;
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1">
        <Send className="w-3.5 h-3.5" />
        Apply
      </Button>
    );
  }

  return (
    <div className="w-80 space-y-3 bg-white rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Submit a proposal</h4>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Rate type */}
      <div>
        <label className="text-xs font-medium text-foreground">Payment terms</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {(["FIXED", "HOURLY"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRateType(t)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                rateType === t ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {t === "FIXED" ? "Fixed price" : "Hourly"}
            </button>
          ))}
        </div>
      </div>

      {/* Proposed rate */}
      <div>
        <label className="text-xs font-medium text-foreground">
          {rateType === "FIXED" ? "Your bid (₹ total)" : "Your rate (₹/hr)"}
        </label>
        <input
          type="number"
          min={1}
          value={proposedRate}
          onChange={(e) => setProposedRate(e.target.value)}
          placeholder={rateType === "FIXED" ? "e.g. 25000" : "e.g. 600"}
          className="w-full mt-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {(budgetMin || budgetMax) && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Client budget: ₹{(budgetMin ?? 0).toLocaleString("en-IN")}–₹{(budgetMax ?? 0).toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* Duration + availability */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-foreground">Est. days</label>
          <input
            type="number"
            min={1}
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
            placeholder="14"
            className="w-full mt-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground">Hrs/week</label>
          <input
            type="number"
            min={1}
            max={168}
            value={availabilityHours}
            onChange={(e) => setAvailabilityHours(e.target.value)}
            placeholder="20"
            className="w-full mt-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Cover letter */}
      <div>
        <label className="text-xs font-medium text-foreground">Cover letter</label>
        <textarea
          className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          placeholder="Why you're the right fit…"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          maxLength={2000}
        />
      </div>

      {/* Attach portfolio */}
      {portfolio.length > 0 ? (
        <div>
          <label className="text-xs font-medium text-foreground flex items-center gap-1">
            <FolderGit2 className="w-3 h-3" />
            Attach portfolio projects
          </label>
          <div className="mt-1 space-y-1 max-h-28 overflow-y-auto">
            {portfolio.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={attachIds.includes(p.id)} onChange={() => toggleAttach(p.id)} />
                {p.title}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground">
          Tip: add work to your{" "}
          <a href="/worker/portfolio" className="text-primary underline">portfolio</a> to attach it here.
        </p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button size="sm" onClick={handleSubmit} disabled={isPending} className="w-full gap-1">
        <Send className="w-3.5 h-3.5" />
        {isPending ? "Submitting…" : "Submit Proposal"}
      </Button>
    </div>
  );
}
