import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, Briefcase, ArrowRight, ShieldAlert, MessageCircle } from "lucide-react";

export default async function ClientDashboardPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const [jobs, introductions] = await Promise.all([
    prisma.jobRequirement.findMany({
      where: { userId: session.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.matchmakingConnection.findMany({
      where: {
        introducedAt: { not: null },
        job: { userId: session.id },
      },
      include: {
        worker: {
          include: {
            user: true,
            standbyAssignments: { where: { isActive: true } },
          },
        },
        job: true,
      },
      orderBy: { introducedAt: "desc" },
      take: 5,
    }),
  ]);

  const activeContracts = introductions.filter((c) => c.connectionStatus === "IN_PROGRESS");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            Welcome, {session.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Your QuickQuid client dashboard</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/client/post-job">
            <Plus className="w-4 h-4" />
            Post a Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground font-heading">{jobs.length}</p>
                <p className="text-sm text-muted-foreground">Jobs Posted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground font-heading">{introductions.length}</p>
                <p className="text-sm text-muted-foreground">Introductions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Browse all talent</p>
              <p className="text-xs text-muted-foreground">View workers introduced to you</p>
              <Button asChild size="sm" className="mt-1 gap-1 w-fit">
                <Link href="/client/talent">
                  View Talent
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs with applicants */}
      {jobs.some((j) => j._count.applications > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground font-heading mb-4">Job Applications</h2>
          <div className="space-y-2">
            {jobs.filter((j) => j._count.applications > 0).map((job) => (
              <Card key={job.id} className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="shrink-0 gap-1">
                      <Link href={`/client/jobs/${job.id}/applicants`}>
                        <Users className="w-3 h-3" />
                        Review
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active contracts with chat links */}
      {introductions.filter((c) => c.connectionStatus === "IN_PROGRESS").length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground font-heading mb-4">Active Contracts</h2>
          <div className="space-y-2">
            {introductions.filter((c) => c.connectionStatus === "IN_PROGRESS").map((conn) => (
              <Card key={conn.id} className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {conn.worker.user.name ?? "Worker"} — {conn.job.title}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild className="gap-1">
                        <Link href={`/messages/${conn.id}`}>
                          <MessageCircle className="w-3 h-3" />
                          Chat
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/client/contract/${conn.id}`}>Contract →</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent introductions */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground font-heading">Recent Introductions</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/client/talent">View all →</Link>
          </Button>
        </div>
        {introductions.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-foreground font-heading mb-2">No introductions yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                Post a job requirement and our admin team will match you with verified talent.
              </p>
              <Button asChild>
                <Link href="/client/post-job">Post your first job</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {introductions.map((conn) => (
              <Card key={conn.id} className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {(conn.worker.user.name ?? "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {conn.worker.user.name ?? "Unnamed Worker"}
                        </p>
                        <p className="text-xs text-muted-foreground">For: {conn.job.title}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {conn.worker.skills.slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className="bg-green-100 text-green-700 border-green-200">Introduced</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conn.introducedAt ? new Date(conn.introducedAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Project Continuity / Standby Bench */}
      {activeContracts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground font-heading mb-4">Project Continuity</h2>
          <div className="space-y-3">
            {activeContracts.map((conn) => {
              const standbyCount = conn.worker.standbyAssignments.length;
              return (
                <Card key={conn.id} className="border-border">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${standbyCount > 0 ? "bg-green-50" : "bg-muted"}`}>
                        <ShieldAlert className={`w-5 h-5 ${standbyCount > 0 ? "text-green-600" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{conn.job.title}</p>
                        {standbyCount > 0 ? (
                          <p className="text-xs text-green-700 font-medium mt-0.5">
                            Standby Bench Active — {standbyCount} pre-verified backup{standbyCount !== 1 ? "s" : ""}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5">No standby workers assigned yet</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
