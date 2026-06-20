"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { reviewApplication, hireApplicant } from "@/app/actions/applications";
import { CheckCircle2, XCircle, Star } from "lucide-react";
import Link from "next/link";

interface ApplicantActionsProps {
  applicationId: string;
  currentStatus: string;
  workerVerified: boolean;
}

export function ApplicantActions({ applicationId, currentStatus, workerVerified }: ApplicantActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hiredConnectionId, setHiredConnectionId] = useState<string | null>(null);

  function handleReview(status: "SHORTLISTED" | "REJECTED") {
    setError(null);
    startTransition(async () => {
      const result = await reviewApplication(applicationId, status);
      if (result.error) setError(result.error);
    });
  }

  function handleHire() {
    setError(null);
    startTransition(async () => {
      const result = await hireApplicant(applicationId);
      if (result.error) {
        setError(result.error);
      } else if (result.connectionId) {
        setHiredConnectionId(result.connectionId);
      }
    });
  }

  if (hiredConnectionId) {
    return (
      <Link
        href={`/client/contract/${hiredConnectionId}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium border border-green-200 hover:bg-green-200 transition-colors"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        View Contract
      </Link>
    );
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
          <Button
            size="sm"
            onClick={handleHire}
            disabled={isPending || !workerVerified}
            className="gap-1"
            title={!workerVerified ? "Worker must be verified to hire" : undefined}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Hire
          </Button>
        )}
      </div>
      {!workerVerified && (currentStatus === "SHORTLISTED" || currentStatus === "PENDING") && (
        <p className="text-[10px] text-muted-foreground">Worker not yet verified — cannot hire</p>
      )}
    </div>
  );
}
