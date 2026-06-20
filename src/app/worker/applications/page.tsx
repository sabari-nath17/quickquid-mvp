import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle2, XCircle, Briefcase } from "lucide-react";

const statusConfig = {
  PENDING: {
    label: "Under Review",
    className: "text-amber-600 border-amber-300 bg-amber-50",
    icon: Clock,
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "text-blue-700 border-blue-300 bg-blue-50",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Not Selected",
    className: "text-red-600 border-red-200 bg-red-50",
    icon: XCircle,
  },
  HIRED: {
    label: "Hired",
    className: "text-green-700 border-green-300 bg-green-100",
    icon: CheckCircle2,
  },
};

export default async function WorkerApplicationsPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) redirect("/worker/onboarding");

  const applications = await prisma.jobApplication.findMany({
    where: { workerId: worker.id },
    include: {
      job: { include: { user: { select: { name: true } } } },
    },
    orderBy: { appliedAt: "desc" },
  });

  const connections = await prisma.matchmakingConnection.findMany({
    where: { workerId: worker.id },
    select: { jobId: true, id: true },
  });
  const connectedJobIds = new Map(connections.map((c) => [c.jobId, c.id]));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">My Applications</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Applications</h1>
        <p className="text-muted-foreground mt-2">
          Track the status of all your job applications.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No applications yet</p>
          <p className="text-sm mt-1">
            <Link href="/worker/jobs" className="text-primary underline">
              Browse open jobs
            </Link>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const cfg = statusConfig[app.status];
            const Icon = cfg.icon;
            const connectionId = connectedJobIds.get(app.jobId);

            return (
              <div key={app.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-semibold text-foreground font-heading truncate">
                        {app.job.title}
                      </span>
                      <Badge variant="outline" className={`text-[10px] gap-1 ${cfg.className}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Applied{" "}
                      {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {app.coverLetter && (
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        &ldquo;{app.coverLetter}&rdquo;
                      </p>
                    )}
                  </div>
                  {connectionId && (
                    <Link
                      href={`/worker/contract/${connectionId}`}
                      className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                      View Contract →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
