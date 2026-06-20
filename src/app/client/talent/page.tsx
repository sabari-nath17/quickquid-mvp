import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkerCard } from "@/components/shared/worker-card";
import { Badge } from "@/components/ui/badge";
import { Users, Lock } from "lucide-react";

export default async function ClientTalentPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const introductions = await prisma.matchmakingConnection.findMany({
    where: {
      introducedAt: { not: null },
      job: { userId: session.id },
    },
    include: {
      worker: { include: { user: true } },
      job: { select: { title: true, id: true } },
    },
    orderBy: { introducedAt: "desc" },
  });

  const grouped = introductions.reduce<Record<string, typeof introductions>>(
    (acc, conn) => {
      const key = conn.job.id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(conn);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-heading mb-2">
          Your Curated Talent
        </h1>
        <p className="text-muted-foreground">
          Workers personally introduced to you by the QuickQuid team. Contact
          details are unlocked — reach out directly to discuss your project.
        </p>
        {introductions.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{introductions.length} worker{introductions.length !== 1 ? "s" : ""} introduced to you</span>
          </div>
        )}
      </div>

      {introductions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-semibold text-foreground font-heading mb-2">
            No talent introduced yet
          </h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Post a job requirement and our admin team will review your needs and
            introduce you to the best-matched verified freelancers.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([jobId, conns]) => (
            <div key={jobId}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-foreground font-heading">
                  {conns[0].job.title}
                </h2>
                <Badge variant="outline" className="text-xs">
                  {conns.length} match{conns.length !== 1 ? "es" : ""}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {conns.map((conn) => (
                  <WorkerCard
                    key={conn.id}
                    name={conn.worker.user.name ?? "Anonymous"}
                    bio={conn.worker.bio}
                    skills={conn.worker.skills}
                    isVerified={conn.worker.isVerified}
                    linkedinUrl={conn.worker.linkedinUrl}
                    portfolioUrls={conn.worker.portfolioUrls}
                    showContact={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
