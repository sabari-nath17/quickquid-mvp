import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldAlert, Users } from "lucide-react";
import { AddStandbyForm, TriggerReplacementButton } from "./standby-actions";

const statusDot: Record<string, string> = {
  AVAILABLE: "bg-green-500",
  BUSY: "bg-amber-400",
  OFFLINE: "bg-gray-300",
};

export default async function StandbyBenchPage() {
  await requireAdmin().catch(() => redirect("/sign-in"));

  const jobs = await prisma.jobRequirement.findMany({
    include: {
      user: { select: { name: true, email: true } },
      standbyAssignments: {
        where: { isActive: true },
        include: {
          worker: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const allVerifiedWorkers = await prisma.workerProfile.findMany({
    where: { isVerified: true },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading">Standby Bench</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Assign pre-verified backup workers to active jobs. Trigger replacement in under 2 hours.
            </p>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No jobs posted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const assignedIds = new Set(job.standbyAssignments.map((a) => a.workerId));
            const available = allVerifiedWorkers
              .filter((w) => !assignedIds.has(w.id))
              .map((w) => ({ id: w.id, name: w.user.name ?? w.user.email }));

            return (
              <Card key={job.id} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-base font-heading">{job.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Client: {job.user.name ?? job.user.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {job.standbyAssignments.length} on bench
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {job.standbyAssignments.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Bench
                      </p>
                      {job.standbyAssignments.map((a) => {
                        const workerName = a.worker.user.name ?? a.worker.user.email;
                        const initials = workerName.slice(0, 2).toUpperCase();
                        return (
                          <div key={a.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                              {initials}
                            </div>
                            <span className="text-sm text-foreground flex-1">{workerName}</span>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[a.worker.standbyStatus] ?? "bg-gray-300"}`} />
                            <span className="text-xs text-muted-foreground">{a.worker.standbyStatus}</span>
                            <Badge variant="outline" className="text-xs">{a.worker.fillRate}% fill</Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No bench workers assigned yet.</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                    <AddStandbyForm jobId={job.id} workers={available} />
                    {job.standbyAssignments.length > 0 && (
                      <TriggerReplacementButton jobId={job.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
