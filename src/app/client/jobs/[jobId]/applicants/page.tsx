import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, CheckCircle2, XCircle, Briefcase } from "lucide-react";
import { ApplicantActions } from "./applicant-actions";

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const { jobId } = await params;

  const job = await prisma.jobRequirement.findUnique({
    where: { id: jobId },
  });
  if (!job || job.userId !== session.id) redirect("/client/dashboard");

  const applications = await prisma.jobApplication.findMany({
    where: { jobId },
    include: {
      worker: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  const statusConfig = {
    PENDING: { label: "Pending", className: "text-amber-600 border-amber-300 bg-amber-50" },
    SHORTLISTED: { label: "Shortlisted", className: "text-blue-700 border-blue-300 bg-blue-50" },
    REJECTED: { label: "Rejected", className: "text-red-600 border-red-200 bg-red-50" },
    HIRED: { label: "Hired", className: "text-green-700 border-green-300 bg-green-100" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/client/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{job.title}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Applicants
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {applications.length} worker{applications.length !== 1 ? "s" : ""} applied to this job
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No applicants yet</p>
          <p className="text-sm mt-1">Workers who match your required skills can apply here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const cfg = statusConfig[app.status];
            const workerName = app.worker.user.name ?? app.worker.user.email;
            const matchingSkills = job.skills.filter((s) =>
              app.worker.skills.map((ws) => ws.toLowerCase()).includes(s.toLowerCase())
            );
            const matchPct = Math.round((matchingSkills.length / job.skills.length) * 100);

            return (
              <div key={app.id} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold font-heading shrink-0">
                      {app.worker.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={app.worker.avatarUrl}
                          alt={workerName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        workerName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-semibold text-foreground font-heading">
                          {workerName}
                        </span>
                        <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>
                          {cfg.label}
                        </Badge>
                        {app.worker.isVerified && (
                          <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200 gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {app.worker.title && (
                        <p className="text-xs text-muted-foreground">{app.worker.title}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {app.worker.skills.slice(0, 6).map((skill) => {
                          const isMatch = job.skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase());
                          return (
                            <span
                              key={skill}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
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
                      <p className="text-xs text-primary font-medium mt-2">
                        {matchPct}% skill match ({matchingSkills.length}/{job.skills.length} skills)
                      </p>
                      {app.coverLetter && (
                        <blockquote className="mt-2 pl-2 border-l-2 border-border text-xs text-muted-foreground italic line-clamp-3">
                          {app.coverLetter}
                        </blockquote>
                      )}
                    </div>
                  </div>

                  {app.status !== "HIRED" && (
                    <ApplicantActions
                      applicationId={app.id}
                      currentStatus={app.status}
                      workerVerified={app.worker.isVerified}
                    />
                  )}
                  {app.status === "HIRED" && (
                    <div className="flex items-center gap-1 text-sm text-green-700 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Hired
                    </div>
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
