"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { approveSubmission } from "@/app/actions/submissions";
import { CheckCircle2 } from "lucide-react";

export function SubmissionApproveButton({ submissionId }: { submissionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveSubmission(submissionId);
      if (result.error) setError(result.error);
      else setApproved(true);
    });
  }

  if (approved) {
    return <span className="text-xs text-green-700 font-medium">Approved ✓</span>;
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        size="sm"
        variant="outline"
        onClick={handleApprove}
        disabled={isPending}
        className="h-7 text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50"
      >
        <CheckCircle2 className="w-3 h-3" />
        Approve
      </Button>
    </div>
  );
}
