"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { reviewApplication } from "@/app/actions/applications";
import { CheckCircle2, XCircle, Star, Send } from "lucide-react";
import Link from "next/link";

interface ApplicantActionsProps {
  applicationId: string;
  jobId: string;
  currentStatus: string;
  workerVerified: boolean;
}

export function ApplicantActions({ applicationId, jobId, currentStatus, workerVerified }: ApplicantActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleReview(status: "SHORTLISTED" | "REJECTED") {
    setError(null);
    startTransition(async () => {
      const result = await reviewApplication(applicationId, status);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      {error && <p className="text-xs text-destructive text-right">{error}</p>}
      <div className="flex gap-2">
        {currentStatus === "PENDING" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReview("SHORTLISTED")}
            disabled={isPending}
            className="gap-1 text-blue-700 border-blue-300 hover:bg-blue-50"
          >
            <Star className="w-3 h-3" />
            Shortlist
          </Button>
        )}
        {currentStatus !== "REJECTED" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReview("REJECTED")}
            disabled={isPending}
            className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="w-3 h-3" />
            Reject
          </Button>
        )}
        {(currentStatus === "SHORTLISTED" || currentStatus === "PENDING") && (
          workerVerified ? (
            <Button size="sm" asChild className="gap-1">
              <Link href={`/client/jobs/${jobId}/applicants/${applicationId}/offer`}>
                <Send className="w-3.5 h-3.5" />
                Send Offer
              </Link>
            </Button>
          ) : (
            <Button size="sm" disabled className="gap-1" title="Worker must be verified to hire">
              <Send className="w-3.5 h-3.5" />
              Send Offer
            </Button>
          )
        )}
      </div>
      {!workerVerified && (currentStatus === "SHORTLISTED" || currentStatus === "PENDING") && (
        <p className="text-[10px] text-muted-foreground">Worker not yet verified — cannot hire</p>
      )}
    </div>
  );
}
