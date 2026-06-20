import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, Star, User } from "lucide-react";
import { ComplianceTracker } from "@/components/shared/compliance-tracker";
import { MilestoneTracker } from "@/components/shared/milestone-tracker";
import { FeeTransparencyWidget } from "@/components/shared/fee-transparency-widget";
import { ReviewForm } from "./review-form";

export default async function ContractPage({
  params,
  searchParams,
}: {
  params: Promise<{ connectionId: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const { connectionId } = await params;
  const { demo } = await searchParams;

  const connection = await prisma.matchmakingConnection.findUnique({
    where: { id: connectionId },
    include: {
      worker: { include: { user: true } },
      job: true,
      introducedBy: { select: { name: true } },
      milestones: {
        include: { commissionEntry: true },
        orderBy: { createdAt: "asc" },
      },
      review: true,
    },
  });

  if (!connection || connection.job.userId !== session.id) redirect("/client/dashboard");

  const workerName = connection.worker.user.name ?? connection.worker.user.email;
  const totalValue = connection.milestones.reduce((s, m) => s + m.amount, 0);

  const statusConfig = {
    PENDING_CONTACT: { label: "Pending Contact", className: "text-amber-600 border-amber-300 bg-amber-50" },
    IN_PROGRESS: { label: "In Progress", className: "text-blue-700 border-blue-300 bg-blue-50" },
    COMPLETED: { label: "Completed", className: "text-green-700 border-green-300 bg-green-50" },
  };
  const statusBadge = statusConfig[connection.connectionStatus] ?? statusConfig.PENDING_CONTACT;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href="/client/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold font-heading shrink-0">
            {workerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground font-heading">{workerName}</h1>
              <Badge variant="outline" className={`text-xs gap-1 ${statusBadge.className}`}>
                {connection.connectionStatus === "IN_PROGRESS" && <Clock className="w-3 h-3" />}
                {connection.connectionStatus === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                {statusBadge.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {connection.job.title}
            </p>
            {connection.contractStartDate && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Contract started{" "}
                {new Date(connection.contractStartDate).toLocaleDateString("en-IN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
        {connection.introducedBy?.name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            Introduced by {connection.introducedBy.name}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Compliance tracker */}
          <div>
            <h2 className="text-base font-semibold text-foreground font-heading mb-3">Contract Status</h2>
            <ComplianceTracker
              contractStartDate={connection.contractStartDate}
              demoMode={demo === "compliance"}
            />
          </div>

          {/* Milestones */}
          <div>
            <h2 className="text-base font-semibold text-foreground font-heading mb-3">Milestones</h2>
            {connection.milestones.length === 0 ? (
              <div className="bg-muted/30 rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">No milestones yet.</p>
                <p className="text-xs text-muted-foreground">Add milestones to track deliverables and payments.</p>
              </div>
            ) : (
              <MilestoneTracker
                milestones={connection.milestones.map((m) => ({
                  ...m,
                  commissionEntry: m.commissionEntry
                    ? { platformFee: m.commissionEntry.platformFee, isPaid: m.commissionEntry.isPaid }
                    : null,
                }))}
                role="CLIENT"
                connectionId={connection.id}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <FeeTransparencyWidget amount={totalValue || 50000} />

          <div className="bg-white rounded-xl border border-border p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Contract Details</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job</span>
                <span className="text-foreground font-medium truncate max-w-[140px]">{connection.job.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Introduced</span>
                <span className="text-foreground">
                  {connection.introducedAt
                    ? new Date(connection.introducedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value</span>
                <span className="text-foreground font-semibold">₹{totalValue.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform (8%)</span>
                <span className="text-primary font-medium">₹{Math.round(totalValue * 0.08).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-3 border border-border">
            <strong className="text-foreground">Honour system:</strong> Payments happen directly between you and the worker (UPI, bank transfer, etc.). QuickQuid logs milestones and collects 8% commission on completion.
          </div>

          {/* Review section — shown once worker is introduced */}
          {connection.introducedAt && (
            connection.review ? (
              <div className="bg-white rounded-xl border border-border p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Your Review</h3>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= connection.review!.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-none text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1 self-center">
                    {connection.review.rating}/5
                  </span>
                </div>
                {connection.review.comment && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {connection.review.comment}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground/60">
                  Submitted {new Date(connection.review.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ) : (
              <ReviewForm connectionId={connection.id} workerName={workerName} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
