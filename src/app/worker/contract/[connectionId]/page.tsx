import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Package, Network } from "lucide-react";
import { MilestoneTracker } from "@/components/shared/milestone-tracker";
import { WorkSubmitForm } from "./work-submit-form";
import { SubJobForm } from "./sub-job-form";

export default async function WorkerContractPage({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const { connectionId } = await params;

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) redirect("/worker/onboarding");

  const connection = await prisma.matchmakingConnection.findUnique({
    where: { id: connectionId },
    include: {
      job: { include: { user: { select: { name: true, email: true } } } },
      milestones: {
        include: { commissionEntry: true },
        orderBy: { createdAt: "asc" },
      },
      submissions: { orderBy: { createdAt: "desc" } },
      subJobs: {
        include: { applications: { include: { worker: { include: { user: { select: { name: true, email: true } } } } } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!connection || connection.workerId !== worker.id) redirect("/worker/dashboard");

  const clientName = connection.job.user.name ?? connection.job.user.email;
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
        href="/worker/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-foreground font-heading">{connection.job.title}</h1>
            <Badge variant="outline" className={`text-xs ${statusBadge.className}`}>
              {statusBadge.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {connection.introducedAt
              ? `Client: ${clientName}`
              : "Client identity will be revealed after introduction"}
          </p>
        </div>
        <Link
          href={`/messages/${connectionId}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat with Client
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones */}
          <section>
            <h2 className="text-base font-semibold text-foreground font-heading mb-3">Milestones</h2>
            {connection.milestones.length === 0 ? (
              <div className="bg-muted/30 rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">No milestones set yet.</p>
                <p className="text-xs text-muted-foreground mt-1">The client will add milestones to track deliverables.</p>
              </div>
            ) : (
              <MilestoneTracker
                milestones={connection.milestones.map((m) => ({
                  ...m,
                  commissionEntry: m.commissionEntry
                    ? { platformFee: m.commissionEntry.platformFee, isPaid: m.commissionEntry.isPaid }
                    : null,
                }))}
                role="WORKER"
                connectionId={connection.id}
              />
            )}
          </section>

          {/* Work Submissions */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground font-heading flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Work Submissions
              </h2>
            </div>
            <WorkSubmitForm connectionId={connectionId} />

            {connection.submissions.length > 0 && (
              <div className="mt-4 space-y-3">
                {connection.submissions.map((sub) => (
                  <div key={sub.id} className="bg-muted/30 rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{sub.title}</p>
                        {sub.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{sub.description}</p>
                        )}
                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 block"
                          >
                            View file →
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {sub.isPreview && (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50">
                            Preview only
                          </Badge>
                        )}
                        {sub.isApproved && (
                          <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">
                            Approved ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(sub.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sub-jobs / Chain Network */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-foreground font-heading flex items-center gap-2">
                <Network className="w-4 h-4 text-primary" />
                Chain Network
              </h2>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Sub-contracting
              </Badge>
            </div>
            <SubJobForm connectionId={connectionId} />

            {connection.subJobs.length > 0 && (
              <div className="mt-4 space-y-3">
                {connection.subJobs.map((subJob) => (
                  <div key={subJob.id} className="bg-muted/30 rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{subJob.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{subJob.description}</p>
                      </div>
                      {subJob.budget && (
                        <span className="text-xs font-semibold text-foreground shrink-0">₹{subJob.budget}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {subJob.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                    {subJob.applications.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs font-medium text-foreground mb-2">
                          {subJob.applications.length} applicant{subJob.applications.length !== 1 ? "s" : ""}
                        </p>
                        <div className="space-y-2">
                          {subJob.applications.map((app) => (
                            <div key={app.id} className="flex items-center justify-between text-xs">
                              <span className="text-foreground">
                                {app.worker.user.name ?? app.worker.user.email}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  app.status === "HIRED"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : app.status === "REJECTED"
                                    ? "bg-red-50 text-red-600 border-red-200"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Contract Details</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job</span>
                <span className="text-foreground font-medium truncate max-w-[140px]">{connection.job.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-foreground">{statusBadge.label}</span>
              </div>
              {connection.contractStartDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span className="text-foreground">
                    {new Date(connection.contractStartDate).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value</span>
                <span className="text-foreground font-semibold">₹{totalValue.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your earnings (92%)</span>
                <span className="text-green-600 font-medium">
                  ₹{Math.round(totalValue * 0.92).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-3 border border-border">
            <strong className="text-foreground">Honour system:</strong> Payments happen directly (UPI, bank transfer). QuickQuid collects 8% platform fee on milestone approval.
          </div>

          <Link
            href={`/messages/${connectionId}`}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Open Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
