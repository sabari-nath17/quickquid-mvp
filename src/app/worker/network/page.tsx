import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Network, Zap } from "lucide-react";
import { SubJobApplyButton } from "./sub-job-apply-button";

export default async function WorkerNetworkPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });

  const subJobs = await prisma.subJob.findMany({
    where: { isPublic: true },
    include: {
      postedBy: { include: { user: { select: { name: true } } } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const appliedSubJobIds = worker
    ? new Set(
        (
          await prisma.subJobApplication.findMany({
            where: { workerId: worker.id },
            select: { subJobId: true },
          })
        ).map((a) => a.subJobId)
      )
    : new Set<string>();

  const workerSkills = worker?.skills.map((s) => s.toLowerCase()) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Chain Network</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Sub-Job Network</h1>
        <p className="text-muted-foreground mt-2">
          Collaborate with lead freelancers. These are sub-jobs posted by workers on active contracts.
        </p>
      </div>

      {subJobs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Network className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No sub-jobs available yet</p>
          <p className="text-sm mt-1">Lead freelancers will post tasks here as contracts progress.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subJobs.map((subJob) => {
            const matchingSkills = subJob.skills.filter((s) =>
              workerSkills.includes(s.toLowerCase())
            );
            const hasMatch = matchingSkills.length > 0;
            const alreadyApplied = appliedSubJobIds.has(subJob.id);
            const postedByName = subJob.postedBy.user.name ?? "A freelancer";
            const isOwnSubJob = worker?.id === subJob.postedById;

            return (
              <div
                key={subJob.id}
                className="bg-white rounded-xl border border-border p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-base font-semibold text-foreground font-heading">
                        {subJob.title}
                      </h2>
                      {hasMatch && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          {matchingSkills.length} skill match
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Posted by <span className="text-foreground font-medium">{postedByName}</span>
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {subJob.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {subJob.skills.map((skill) => {
                        const isMatch = workerSkills.includes(skill.toLowerCase());
                        return (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isMatch
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {subJob.budget && (
                        <span className="font-semibold text-foreground">₹{subJob.budget}</span>
                      )}
                      <span>{subJob._count.applications} applicant{subJob._count.applications !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isOwnSubJob ? (
                      <span className="text-xs text-muted-foreground">Your sub-job</span>
                    ) : alreadyApplied ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                        Applied ✓
                      </span>
                    ) : (
                      <SubJobApplyButton subJobId={subJob.id} disabled={!worker} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
