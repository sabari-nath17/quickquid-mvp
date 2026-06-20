"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { reviewApplication, hireApplicant } from "@/app/actions/applications";
import { CheckCircle2, XCircle, Star } from "lucide-react";

export function AdminApplicationActions({
  applicationId,
  currentStatus,
  workerVerified,
}: {
  applicationId: string;
  currentStatus: string;
  workerVerified: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handle(action: "shortlist" | "reject" | "hire") {
    setError(null);
    startTransition(async () => {
      if (action === "hire") {
        const result = await hireApplicant(applicationId);
        if (result.error) setError(result.error);
        else setDone(true);
      } else {
        const result = await reviewApplication(
          applicationId,
          action === "shortlist" ? "SHORTLISTED" : "REJECTED"
        );
        if (result.error) setError(result.error);
        else setDone(true);
      }
    });
  }

  if (done) return <span className="text-xs text-green-700 font-medium">Updated ✓</span>;

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-1.5">
        {currentStatus === "PENDING" && (
          <Button size="sm" variant="outline" onClick={() => handle("shortlist")} disabled={isPending}
            className="h-7 text-xs gap-1 text-blue-700 border-blue-300 hover:bg-blue-50">
            <Star className="w-3 h-3" /> Shortlist
          </Button>
        )}
        {currentStatus !== "REJECTED" && (
          <Button size="sm" variant="outline" onClick={() => handle("reject")} disabled={isPending}
            className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50">
            <XCircle className="w-3 h-3" /> Reject
          </Button>
        )}
        {(currentStatus === "SHORTLISTED" || currentStatus === "PENDING") && workerVerified && (
          <Button size="sm" onClick={() => handle("hire")} disabled={isPending}
            className="h-7 text-xs gap-1">
            <CheckCircle2 className="w-3 h-3" /> Hire
          </Button>
        )}
      </div>
    </div>
  );
}
