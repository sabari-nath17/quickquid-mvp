"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { applyToSubJob } from "@/app/actions/applications";
import { Send } from "lucide-react";

export function SubJobApplyButton({ subJobId, disabled }: { subJobId: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await applyToSubJob(subJobId, coverLetter);
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

  if (disabled) {
    return <span className="text-xs text-muted-foreground">Sign in to apply</span>;
  }

  return (
    <div className="space-y-2">
      <Button size="sm" variant={open ? "outline" : "default"} onClick={() => setOpen(!open)} className="gap-1">
        <Send className="w-3.5 h-3.5" />
        {open ? "Cancel" : "Apply"}
      </Button>
      {open && (
        <div className="w-64 space-y-2">
          <textarea
            className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            placeholder="Why are you a great fit? (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button size="sm" onClick={handleSubmit} disabled={isPending} className="w-full">
            {isPending ? "Submitting…" : "Submit"}
          </Button>
        </div>
      )}
    </div>
  );
}
