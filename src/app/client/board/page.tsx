import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WorkerCard } from "@/components/shared/worker-card";
import { BlindCandidateCard } from "@/components/shared/blind-candidate-card";
import { EyeOff, Users, Zap } from "lucide-react";

export default async function MeritBoardPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const connections = await prisma.matchmakingConnection.findMany({
    where: { job: { userId: session.id } },
    include: {
      worker: { include: { user: true } },
      job: true,
    },
    orderBy: [
      { worker: { sandboxScore: "desc" } },
      { createdAt: "desc" },
    ],
  });

  const blind = connections.filter((c) => c.isAnonymous);
  const revealed = connections.filter((c) => !c.isAnonymous && c.introducedAt);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-heading mb-2">Merit Board</h1>
        <p className="text-muted-foreground max-w-xl">
          Candidates ranked by sandbox score. Names and photos are hidden during blind evaluation — revealed only after admin makes the introduction.
        </p>
      </div>

      {connections.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-foreground font-heading mb-2">No candidates yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Post a job and our admin team will match verified candidates to your requirements.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {blind.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <EyeOff className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground font-heading">Blind Evaluation</h2>
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                  {blind.length} candidate{blind.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blind.map((conn) => (
                  <BlindCandidateCard
                    key={conn.id}
                    connection={{
                      id: conn.id,
                      worker: {
                        candidateCode: conn.worker.candidateCode,
                        sandboxScore: conn.worker.sandboxScore,
                        skills: conn.worker.skills,
                        fillRate: conn.worker.fillRate,
                        hoursTrained: conn.worker.hoursTrained,
                        verificationBadges: conn.worker.verificationBadges,
                      },
                      job: { title: conn.job.title },
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {revealed.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-green-600" />
                <h2 className="text-lg font-semibold text-foreground font-heading">Introduced Talent</h2>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  {revealed.length} introduced
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {revealed.map((conn) => (
                  <WorkerCard
                    key={conn.id}
                    name={conn.worker.user.name ?? conn.worker.user.email}
                    bio={conn.worker.bio}
                    skills={conn.worker.skills}
                    isVerified={conn.worker.isVerified}
                    linkedinUrl={conn.worker.linkedinUrl}
                    portfolioUrls={conn.worker.portfolioUrls}
                    showContact
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
