"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { approveOrRejectWorker } from "@/app/actions/admin";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface TriageActionsProps {
  workerId: string;
}

export function TriageActions({ workerId }: TriageActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [notes, setNotes] = useState("");

  function handleApprove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("status", "VERIFIED");
      formData.set("verificationNotes", notes);
      const result = await approveOrRejectWorker(workerId, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Worker approved and added to the talent pool.");
        setApproveOpen(false);
        setNotes("");
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("status", "REJECTED");
      formData.set("verificationNotes", notes);
      const result = await approveOrRejectWorker(workerId, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Application rejected.");
        setRejectOpen(false);
        setNotes("");
      }
    });
  }

  return (
    <div className="flex gap-2 shrink-0">
      {/* Approve Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <Button
          size="sm"
          className="gap-1.5 bg-green-600 hover:bg-green-700 text-white border-0"
          onClick={() => setApproveOpen(true)}
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Approve Worker</DialogTitle>
            <DialogDescription>
              This worker will be added to the verified talent pool and can be
              matched with client job requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="approve-notes">Internal notes (optional)</Label>
              <Textarea
                id="approve-notes"
                placeholder="Any notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveOpen(false);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Approving..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={() => setRejectOpen(true)}
        >
          <XCircle className="w-4 h-4" />
          Reject
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Reject Application</DialogTitle>
            <DialogDescription>
              The worker will be notified that their application was not approved
              at this time. They may update and resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="reject-notes">Reason for rejection (shown to worker)</Label>
              <Textarea
                id="reject-notes"
                placeholder="e.g., Portfolio links are not accessible. Please update and resubmit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectOpen(false);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
