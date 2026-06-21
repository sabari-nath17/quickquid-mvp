import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, MapPin, Zap, Laptop, Wrench, HardHat } from "lucide-react";
import { ApplyButton } from "./apply-button";

const COLLAR_TABS = [
  { key: "ALL", label: "All Work", icon: Briefcase },
  { key: "WHITE", label: "Digital", icon: Laptop },
  { key: "GREY", label: "Field-Tech", icon: Wrench },
  { key: "BLUE", label: "On-Site", icon: HardHat },
] as const;

const COLLAR_META: Record<string, { label: string; accent: string; chip: string }> = {
  WHITE: { label: "Digital", accent: "border-l-blue-400", chip: "bg-blue-50 text-blue-700 border-blue-200" },
  GREY: { label: "Field-Tech", accent: "border-l-slate-400", chip: "bg-slate-100 text-slate-700 border-slate-200" },
  BLUE: { label: "On-Site", accent: "border-l-amber-400", chip: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default async function WorkerJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ collar?: string }>;
}) {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const { collar } = await searchParams;
  const activeCollar = collar && ["WHITE", "GREY", "BLUE"].includes(collar) ? collar : "ALL";

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
  });

  const jobs = await prisma.jobRequirement.findMany({
    where: activeCollar !== "ALL" ? { collarType: activeCollar as "WHITE" | "GREY" | "BLUE" } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      _count: { select: { applications: true } },
    },
  });

  const appliedJobIds = worker
    ? new Set(
        (
          await prisma.jobApplication.findMany({
            where: { workerId: worker.id },
            select: { jobId: true },
          })
        ).map((a) => a.jobId)
      )
    : new Set<string>();

  const workerSkills = worker?.skills.map((s) => s.toLowerCase()) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Job Board</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Open Opportunities</h1>
        <p className="text-muted-foreground mt-2">
          Browse jobs posted by clients. You must match at least one required skill to apply.
        </p>
        {!worker?.isVerified && (
          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
            Your profile must be verified before you can apply to jobs.{" "}
            <Link href="/worker/onboarding" className="font-medium underline">
              Complete your profile →
            </Link>
          </div>
        )}
      </div>

      {/* Intent router — separates work categories so digital projects never sit beside manual shifts */}
      <div className="flex flex-wrap gap-2 mb-6">
        {COLLAR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCollar === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.key === "ALL" ? "/worker/jobs" : `/worker/jobs?collar=${tab.key}`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No jobs posted yet</p>
          <p className="text-sm mt-1">Check back soon — clients are posting new opportunities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const jobSkills = job.skills.map((s) => s.toLowerCase());
            const matchingSkills = job.skills.filter((s) =>
              workerSkills.includes(s.toLowerCase())
            );
            const matchPct = workerSkills.length > 0
              ? Math.round((matchingSkills.length / job.skills.length) * 100)
              : 0;
            const hasMatch = matchingSkills.length > 0;
            const alreadyApplied = appliedJobIds.has(job.id);
            const collarMeta = COLLAR_META[job.collarType] ?? COLLAR_META.WHITE;
            // Polymorphic layout: digital work leads with skills; field/on-site work leads with location + timing.
            const isFieldWork = job.collarType !== "WHITE";

            const metaRow = (
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                {job.budget && (
                  <span className="font-medium text-foreground">{job.budget}</span>
                )}
                {job.timeline && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {job.timeline}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.geofenceRing.charAt(0) + job.geofenceRing.slice(1).toLowerCase()}
                </span>
                <span>{job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}</span>
              </div>
            );

            const skillRow = (
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => {
                  const isMatch = workerSkills.includes(skill.toLowerCase());
                  return (
                    <span
                      key={skill}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        isMatch ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            );

            return (
              <div
                key={job.id}
                className={`bg-white rounded-xl border border-border border-l-4 ${collarMeta.accent} p-5 hover:border-primary/30 transition-colors`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-base font-semibold text-foreground font-heading">
                        {job.title}
                      </h2>
                      <Badge variant="outline" className={`text-[10px] ${collarMeta.chip}`}>
                        {collarMeta.label}
                      </Badge>
                      {hasMatch && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          {matchPct}% match
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {job.description}
                    </p>
                    {/* Field/on-site work prioritizes where & when; digital work prioritizes skills */}
                    {isFieldWork ? (
                      <div className="space-y-3">
                        {metaRow}
                        {skillRow}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {skillRow}
                        {metaRow}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {alreadyApplied ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                        Applied ✓
                      </span>
                    ) : (
                      <ApplyButton
                        jobId={job.id}
                        jobTitle={job.title}
                        disabled={!worker?.isVerified || !hasMatch}
                        disabledReason={
                          !worker?.isVerified
                            ? "Verify your profile to apply"
                            : !hasMatch
                            ? "No matching skills"
                            : undefined
                        }
                      />
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
