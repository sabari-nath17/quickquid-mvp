import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Link2 } from "lucide-react";
import { MatchCreateForm } from "./match-create-form";
import { IntroduceButton } from "./introduce-button";

export default async function MatchmakingPage() {
  await requireAdmin().catch(() => redirect("/sign-in"));

  const [verifiedWorkers, jobRequirements, connections] = await Promise.all([
    prisma.workerProfile.findMany({
      where: { isVerified: true },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.jobRequirement.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.matchmakingConnection.findMany({
      include: {
        worker: { include: { user: { select: { name: true, email: true } } } },
        job: { include: { user: { select: { name: true, email: true } } } },
        introducedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const introduced = connections.filter((c) => c.introducedAt);
  const pending = connections.filter((c) => !c.introducedAt);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground font-heading">
          Matchmaking Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          Create connections between verified workers and client jobs, then make deliberate introductions.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Create new match */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                Create a Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verifiedWorkers.length === 0 || jobRequirements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {verifiedWorkers.length === 0
                    ? "No verified workers yet. Approve workers in Triage first."
                    : "No job requirements yet. Clients need to post jobs first."}
                </p>
              ) : (
                <MatchCreateForm
                  workers={verifiedWorkers.map((w) => ({
                    id: w.id,
                    name: w.user.name ?? w.user.email,
                    skills: w.skills,
                  }))}
                  jobs={jobRequirements.map((j) => ({
                    id: j.id,
                    title: j.title,
                    clientName: j.user.name ?? j.user.email,
                    skills: j.skills,
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Connections list */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pending introductions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground font-heading">
                Awaiting Introduction
              </h2>
              {pending.length > 0 && (
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                  {pending.length} pending
                </Badge>
              )}
            </div>
            {pending.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No pending matches. Create a match to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pending.map((conn) => (
                  <Card key={conn.id} className="border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-2 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-foreground">
                              {conn.worker.user.name ?? conn.worker.user.email}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium text-foreground truncate">
                              {conn.job.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Client: {conn.job.user.name ?? conn.job.user.email}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {conn.worker.skills.slice(0, 3).map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <IntroduceButton connectionId={conn.id} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Introduced */}
          {introduced.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-foreground font-heading">
                  Introductions Made
                </h2>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  {introduced.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {introduced.map((conn) => (
                  <Card key={conn.id} className="border-green-200 bg-green-50/20">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <span className="font-semibold text-foreground">
                              {conn.worker.user.name ?? conn.worker.user.email}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium text-foreground truncate">
                              {conn.job.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground pl-6">
                            Client: {conn.job.user.name ?? conn.job.user.email} ·
                            Introduced{" "}
                            {conn.introducedAt
                              ? new Date(conn.introducedAt).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric", year: "numeric" }
                                )
                              : "—"}
                            {conn.introducedBy?.name && (
                              <> by {conn.introducedBy.name}</>
                            )}
                          </p>
                        </div>
                        <Badge className="shrink-0 bg-green-100 text-green-700 border-green-200">
                          Introduced
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
