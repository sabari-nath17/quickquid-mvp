"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { applyToJob } from "@/app/actions/applications";
import { Send, ChevronDown, ChevronUp } from "lucide-react";

interface ApplyButtonProps {
  jobId: string;
  jobTitle: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function ApplyButton({ jobId, jobTitle, disabled, disabledReason }: ApplyButtonProps) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await applyToJob(jobId, coverLetter);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setOpen(false);
      }
    });
  }

  if (success) {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
        Applied ✓
      </span>
    );
  }

  return (
    <div className="space-y-2">
      {disabled ? (
        <div className="text-xs text-muted-foreground text-right max-w-[160px]">
          {disabledReason}
        </div>
      ) : (
        <>
          <Button
            size="sm"
            variant={open ? "outline" : "default"}
            onClick={() => setOpen(!open)}
            className="gap-1"
          >
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            {open ? "Cancel" : "Apply"}
          </Button>
          {open && (
            <div className="w-72 space-y-2 mt-2">
              <textarea
                className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="Cover letter (optional) — why are you a great fit?"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                maxLength={2000}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button size="sm" onClick={handleSubmit} disabled={isPending} className="w-full gap-1">
                <Send className="w-3.5 h-3.5" />
                {isPending ? "Submitting…" : "Submit Application"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
