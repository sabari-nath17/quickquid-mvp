import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Users, MessageSquare, Package } from "lucide-react";
import { AdminApplicationActions } from "./admin-application-actions";

export default async function AdminApplicationsPage() {
  await requireAdmin().catch(() => redirect("/sign-in"));

  const [applications, messageCount, submissionCount] = await Promise.all([
    prisma.jobApplication.findMany({
      include: {
        job: { include: { user: { select: { name: true, email: true } } } },
        worker: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { appliedAt: "desc" },
      take: 100,
    }),
    prisma.message.count(),
    prisma.workSubmission.count(),
  ]);

  const statusConfig = {
    PENDING: { label: "Pending", className: "text-amber-600 border-amber-300 bg-amber-50" },
    SHORTLISTED: { label: "Shortlisted", className: "text-blue-700 border-blue-300 bg-blue-50" },
    REJECTED: { label: "Rejected", className: "text-red-600 border-red-200 bg-red-50" },
    HIRED: { label: "Hired", className: "text-green-700 border-green-300 bg-green-100" },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Admin Oversight</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Platform Activity</h1>
        <p className="text-muted-foreground mt-2">Monitor all applications, messages, and work submissions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground font-heading">{applications.length}</p>
          <p className="text-xs text-muted-foreground">Total Applications</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <MessageSquare className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground font-heading">{messageCount}</p>
          <p className="text-xs text-muted-foreground">Messages Sent</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <Package className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground font-heading">{submissionCount}</p>
          <p className="text-xs text-muted-foreground">Work Submissions</p>
        </div>
      </div>

      <h2 className="text-base font-semibold text-foreground font-heading mb-4">All Job Applications</h2>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const cfg = statusConfig[app.status];
            const workerName = app.worker.user.name ?? app.worker.user.email;
            const clientName = app.job.user.name ?? app.job.user.email;

            return (
              <div key={app.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-foreground font-heading">
                        {app.job.title}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>
                        Worker: <span className="text-foreground font-medium">{workerName}</span>
                        {!app.worker.isVerified && (
                          <span className="ml-1 text-amber-600">(unverified)</span>
                        )}
                      </span>
                      <span>Client: <span className="text-foreground font-medium">{clientName}</span></span>
                      <span>
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {app.coverLetter && (
                      <p className="text-xs text-muted-foreground italic mt-1.5 line-clamp-2">
                        &ldquo;{app.coverLetter}&rdquo;
                      </p>
                    )}
                  </div>
                  {app.status !== "HIRED" && (
                    <AdminApplicationActions
                      applicationId={app.id}
                      currentStatus={app.status}
                      workerVerified={app.worker.isVerified}
                    />
                  )}
                  {app.status === "HIRED" && (
                    <span className="text-xs text-green-700 font-medium">Hired ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Messages oversight link */}
      <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Message Monitoring</h3>
        <p className="text-xs text-muted-foreground mb-3">
          All messages between workers and clients are logged. View any conversation from the contract pages.
        </p>
        <div className="flex gap-3">
          <Link
            href="/admin/matchmaking"
            className="text-xs text-primary hover:underline font-medium"
          >
            View All Contracts →
          </Link>
          <Link
            href="/admin/triage"
            className="text-xs text-primary hover:underline font-medium"
          >
            Worker Triage Queue →
          </Link>
        </div>
      </div>
    </div>
  );
}
