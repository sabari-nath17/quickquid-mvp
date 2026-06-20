"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, Truck, Plus, IndianRupee } from "lucide-react";
import { deliverMilestone, approveMilestone, startMilestone, addMilestone } from "@/app/actions/milestones";

type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "DELIVERED" | "APPROVED";

interface MilestoneItem {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  status: MilestoneStatus;
  clientConfirmedAt?: Date | null;
  workerConfirmedAt?: Date | null;
  dueDate?: Date | null;
  commissionEntry?: { platformFee: number; isPaid: boolean } | null;
}

interface MilestoneTrackerProps {
  milestones: MilestoneItem[];
  role: "CLIENT" | "WORKER";
  connectionId: string;
}

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; icon: React.ReactNode; className: string }> = {
  PENDING: {
    label: "Pending",
    icon: <Circle className="w-4 h-4" />,
    className: "text-muted-foreground border-border bg-muted/40",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: <Clock className="w-4 h-4 text-blue-500" />,
    className: "text-blue-700 border-blue-300 bg-blue-50",
  },
  DELIVERED: {
    label: "Delivered",
    icon: <Truck className="w-4 h-4 text-amber-500" />,
    className: "text-amber-700 border-amber-300 bg-amber-50",
  },
  APPROVED: {
    label: "Approved",
    icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
    className: "text-green-700 border-green-300 bg-green-50",
  },
};

export function MilestoneTracker({ milestones, role, connectionId }: MilestoneTrackerProps) {
  const [isPending, startTransition] = useTransition();
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addDue, setAddDue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const approvedAmount = milestones
    .filter((m) => m.status === "APPROVED")
    .reduce((sum, m) => sum + m.amount, 0);

  function handleAction(fn: () => Promise<{ error?: string; success?: boolean }>) {
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
    });
  }

  async function handleAddMilestone() {
    const fd = new FormData();
    fd.set("title", addTitle);
    fd.set("description", addDesc);
    fd.set("amount", addAmount);
    if (addDue) fd.set("dueDate", addDue);
    const res = await addMilestone(connectionId, fd);
    if (res?.error) { setError(res.error); return; }
    setAddingMilestone(false);
    setAddTitle(""); setAddDesc(""); setAddAmount(""); setAddDue("");
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {milestones.filter((m) => m.status === "APPROVED").length}/{milestones.length} milestones approved
        </span>
        <span className="font-medium text-foreground">
          ₹{approvedAmount.toLocaleString("en-IN")} / ₹{totalAmount.toLocaleString("en-IN")} paid
        </span>
      </div>

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
      )}

      {/* Milestone list */}
      <div className="space-y-3">
        {milestones.map((m, i) => {
          const cfg = STATUS_CONFIG[m.status];
          return (
            <div key={m.id} className="relative pl-6">
              {/* Timeline line */}
              {i < milestones.length - 1 && (
                <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border" />
              )}
              {/* Dot */}
              <div className="absolute left-0 top-1 w-[18px] h-[18px] rounded-full border-2 border-border bg-background flex items-center justify-center">
                {m.status === "APPROVED" && <div className="w-2 h-2 rounded-full bg-green-500" />}
                {m.status === "IN_PROGRESS" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                {m.status === "DELIVERED" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
              </div>

              <div className="bg-white border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">{m.title}</p>
                    {m.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3" />{m.amount.toLocaleString("en-IN")}
                    </span>
                    <Badge variant="outline" className={`text-[11px] gap-1 ${cfg.className}`}>
                      {cfg.icon}{cfg.label}
                    </Badge>
                  </div>
                </div>

                {m.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    Due {new Date(m.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}

                {m.commissionEntry && (
                  <div className="flex items-center gap-1.5 text-xs text-green-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Platform fee: ₹{m.commissionEntry.platformFee.toLocaleString("en-IN")}
                    {m.commissionEntry.isPaid ? " (paid)" : " (pending)"}
                  </div>
                )}

                {/* Actions */}
                {role === "WORKER" && m.status === "PENDING" && (
                  <Button size="sm" variant="outline" className="text-xs h-7" disabled={isPending}
                    onClick={() => handleAction(() => startMilestone(m.id))}>
                    Start Work
                  </Button>
                )}
                {role === "WORKER" && m.status === "IN_PROGRESS" && (
                  <Button size="sm" className="text-xs h-7 gap-1" disabled={isPending}
                    onClick={() => handleAction(() => deliverMilestone(m.id))}>
                    <Truck className="w-3 h-3" /> Mark Delivered
                  </Button>
                )}
                {role === "CLIENT" && m.status === "DELIVERED" && (
                  <Button size="sm" className="text-xs h-7 gap-1 bg-green-600 hover:bg-green-700" disabled={isPending}
                    onClick={() => handleAction(() => approveMilestone(m.id))}>
                    <CheckCircle2 className="w-3 h-3" /> Approve & Confirm UPI Payment
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add milestone */}
      {role === "CLIENT" && (
        <div className="pl-6">
          {!addingMilestone ? (
            <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => setAddingMilestone(true)}>
              <Plus className="w-3 h-3" /> Add Milestone
            </Button>
          ) : (
            <div className="bg-white border border-primary/30 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">New Milestone</p>
              <input
                placeholder="Title*"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <textarea
                placeholder="Description (optional)"
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                rows={2}
                className="w-full border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount (₹)*"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="flex-1 border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="date"
                  value={addDue}
                  onChange={(e) => setAddDue(e.target.value)}
                  className="flex-1 border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="text-xs h-7" onClick={handleAddMilestone} disabled={isPending}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setAddingMilestone(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
