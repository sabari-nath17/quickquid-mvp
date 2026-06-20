import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationBadges } from "@/components/shared/verification-badge";
import { Cpu, Clock, CheckCircle2, RotateCcw } from "lucide-react";

export default async function SandboxPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
    include: { sandboxSubmissions: true },
  });

  if (!profile) redirect("/worker/onboarding");

  const challenges = await prisma.sandboxChallenge.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const submissionMap = new Map(
    profile.sandboxSubmissions.map((s) => [s.challengeId, s])
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Skill Sandbox</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">
          Prove your skills
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Complete skill challenges to earn verification badges. A score of 70+ earns
          the <strong>Skill Verified</strong> badge, which boosts your visibility
          to clients.
        </p>
      </div>

      {/* Score card */}
      {profile.sandboxScore !== null && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-5xl font-bold text-primary font-heading">
                  {profile.sandboxScore}
                  <span className="text-2xl text-primary/60">/100</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Best Sandbox Score</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Your Badges
                </p>
                <VerificationBadges badges={profile.verificationBadges as string[]} />
                {profile.sandboxScore >= 70 && (
                  <div className="flex items-center gap-1.5 text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Skill Verified badge earned
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenges grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => {
          const qs = Array.isArray(challenge.questions) ? challenge.questions : [];
          const submission = submissionMap.get(challenge.id);
          return (
            <Card key={challenge.id} className="border-border">
              <CardContent className="pt-5 pb-5 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {challenge.skillCategory}
                  </Badge>
                  {submission && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs shrink-0">
                      {submission.score ?? 0}/100
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-foreground font-heading text-sm mb-1 leading-snug">
                  {challenge.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 flex-1">
                  {qs.length} questions
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  {challenge.timeLimit} min
                </div>
                {submission ? (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 w-full">
                    <Link href={`/worker/sandbox/${challenge.id}`}>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retake
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/worker/sandbox/${challenge.id}`}>
                      Start Challenge
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Cpu className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-foreground font-heading mb-1">
              No challenges yet
            </p>
            <p className="text-sm text-muted-foreground">
              Admin will add skill challenges soon. Check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
