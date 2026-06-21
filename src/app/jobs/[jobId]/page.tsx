import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, MapPin, Clock, Briefcase, Users, CheckCircle2, ShieldCheck,
  Phone, Star, TrendingUp, Eye, Globe,
} from "lucide-react";
import {
  getClientStats, compactMoney, JOB_LABELS, formatPay, timeAgo,
} from "@/lib/client-stats";
import { ApplyButton } from "@/app/worker/jobs/apply-button";
import { CopyLink } from "@/app/worker/referrals/copy-link";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await getSession();

  const job = await prisma.jobRequirement.findUnique({
    where: { id: jobId },
    include: {
      user: { select: { id: true, name: true, email: true, country: true, paymentVerified: true, phoneVerified: true, createdAt: true } },
      _count: { select: { applications: true } },
      applications: { select: { status: true } },
    },
  });

  if (!job || job.isSynthetic) notFound();

  // Worker context (for the apply panel)
  let worker: { id: string; isVerified: boolean; skills: string[]; portfolioProjects: { id: string; title: string }[] } | null = null;
  let alreadyApplied = false;
  if (session?.role === "WORKER") {
    const w = await prisma.workerProfile.findUnique({
      where: { userId: session.id },
      include: { portfolioProjects: { select: { id: true, title: true }, orderBy: { createdAt: "desc" } } },
    });
    if (w) {
      worker = { id: w.id, isVerified: w.isVerified, skills: w.skills, portfolioProjects: w.portfolioProjects };
      alreadyApplied = !!(await prisma.jobApplication.findUnique({
        where: { jobId_workerId: { jobId, workerId: w.id } },
        select: { id: true },
      }));
    }
  }

  const stats = await getClientStats(job.user.id);
  const otherJobs = await prisma.jobRequirement.findMany({
    where: { userId: job.user.id, isSynthetic: false, id: { not: jobId } },
    select: { id: true, title: true, paymentType: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Activity on this job
  const proposals = job._count.applications;
  const interviewing = job.applications.filter((a) => a.status === "SHORTLISTED").length;
  const hires = job.applications.filter((a) => a.status === "HIRED").length;

  const matchingSkills = worker
    ? job.skills.filter((s) => worker!.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase()))
    : [];
  const hasMatch = matchingSkills.length > 0;

  const clientName = job.user.name ?? job.user.email;
  const memberSince = new Date(job.user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3420";
  const proto = host.includes("localhost") ? "http" : "https";
  const shareUrl = `${proto}://${host}/jobs/${jobId}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href={session?.role === "WORKER" ? "/worker/jobs" : "/"} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            {job.category && <Badge variant="outline" className="text-xs mb-2">{job.category}</Badge>}
            <h1 className="text-2xl font-bold text-foreground font-heading">{job.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />Posted {timeAgo(new Date(job.createdAt))}</span>
              <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" />{job.geofenceRing === "CLOUD" ? "Remote / Worldwide" : `${job.geofenceRing.charAt(0)}${job.geofenceRing.slice(1).toLowerCase()} ring`}</span>
            </div>
          </div>

          {/* Summary */}
          <Section title="Job Summary">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </Section>

          {/* Contract info */}
          <Section title="Contract Information">
            <div className="grid sm:grid-cols-2 gap-3">
              <Fact icon={TrendingUp} label="Pay" value={formatPay(job)} />
              <Fact icon={Briefcase} label="Project type" value={JOB_LABELS.projectType[job.projectType]} />
              <Fact icon={Clock} label="Weekly workload" value={JOB_LABELS.weeklyHours[job.weeklyHours]} />
              <Fact icon={Clock} label="Duration" value={job.durationType ? JOB_LABELS.durationType[job.durationType] : "Not specified"} />
              <Fact icon={Star} label="Experience" value={JOB_LABELS.experienceLevel[job.experienceLevel]} />
              <Fact icon={Users} label="Freelancers needed" value={String(job.freelancersNeeded)} />
            </div>
          </Section>

          {/* Skills */}
          <Section title="Skills & Expertise">
            <p className="text-xs font-medium text-foreground mb-1.5">Mandatory</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.skills.map((s) => {
                const m = worker?.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase());
                return <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-medium ${m ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{s}</span>;
              })}
            </div>
            {job.niceToHaveSkills.length > 0 && (
              <>
                <p className="text-xs font-medium text-foreground mb-1.5">Nice to have</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.niceToHaveSkills.map((s) => <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">{s}</span>)}
                </div>
              </>
            )}
          </Section>

          {/* Preferred qualifications */}
          {job.preferredQualifications && (
            <Section title="Preferred Qualifications">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.preferredQualifications}</p>
            </Section>
          )}

          {/* Activity */}
          <Section title="Activity on this Job">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ActivityStat label="Proposals" value={proposals} />
              <ActivityStat label="Interviewing" value={interviewing} />
              <ActivityStat label="Hired" value={hires} />
              <ActivityStat label="Last viewed" value={job.lastViewedByClientAt ? timeAgo(new Date(job.lastViewedByClientAt)) : "—"} small />
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Apply */}
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-lg font-bold text-foreground font-heading">{formatPay(job)}</p>
            <p className="text-xs text-muted-foreground mb-3">{JOB_LABELS.experienceLevel[job.experienceLevel]} · {JOB_LABELS.projectType[job.projectType]}</p>
            {session?.role === "WORKER" ? (
              alreadyApplied ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">Applied ✓</span>
              ) : (
                <ApplyButton
                  jobId={job.id}
                  jobTitle={job.title}
                  paymentType={job.paymentType}
                  budgetMin={job.budgetMin}
                  budgetMax={job.budgetMax}
                  portfolio={worker?.portfolioProjects ?? []}
                  disabled={!worker?.isVerified || !hasMatch}
                  disabledReason={!worker?.isVerified ? "Verify your profile to apply" : !hasMatch ? "No matching skills" : undefined}
                />
              )
            ) : session?.role === "CLIENT" && job.user.id === session.id ? (
              <Link href={`/client/jobs/${job.id}/applicants`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                <Users className="w-4 h-4" /> View {proposals} applicant{proposals !== 1 ? "s" : ""}
              </Link>
            ) : (
              <Link href="/sign-in" className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Sign in to apply</Link>
            )}
          </div>

          {/* About the client */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground font-heading mb-3">About the Client</h3>
            <div className="space-y-2 text-xs">
              <Row label={job.user.paymentVerified ? "Payment verified" : "Payment unverified"} ok={job.user.paymentVerified} icon={ShieldCheck} />
              <Row label={job.user.phoneVerified ? "Phone verified" : "Phone unverified"} ok={job.user.phoneVerified} icon={Phone} />
              <div className="pt-2 border-t border-border space-y-1.5">
                {job.user.country && <KV k="Location" v={job.user.country} />}
                <KV k="Member since" v={memberSince} />
                <KV k="Jobs posted" v={String(stats.jobsPosted)} />
                <KV k="Hire rate" v={`${stats.hireRate}%`} />
                <KV k="Open jobs" v={String(stats.openJobs)} />
                <KV k="Total hires" v={String(stats.totalHires)} />
                <KV k="Active hires" v={String(stats.activeHires)} />
                <KV k="Total spent" v={stats.totalSpent > 0 ? compactMoney(stats.totalSpent) : "—"} />
                {stats.avgClientRating !== null && (
                  <KV k="Client rating" v={`${stats.avgClientRating.toFixed(1)} ★`} />
                )}
              </div>
            </div>
          </div>

          {/* Share */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground font-heading mb-2">Share this job</h3>
            <CopyLink url={shareUrl} />
          </div>

          {/* Other jobs by client */}
          {otherJobs.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground font-heading mb-2">Other open jobs by this client</h3>
              <div className="space-y-2">
                {otherJobs.map((j) => (
                  <Link key={j.id} href={`/jobs/${j.id}`} className="block text-xs text-foreground hover:text-primary">
                    {j.title} <span className="text-muted-foreground">· {j.paymentType === "HOURLY" ? "Hourly" : "Fixed"}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground font-heading mb-3">{title}</h2>
      {children}
    </div>
  );
}
function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <div><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-sm font-medium text-foreground">{value}</p></div>
    </div>
  );
}
function ActivityStat({ label, value, small }: { label: string; value: number | string; small?: boolean }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 text-center">
      <p className={`font-bold text-foreground font-heading ${small ? "text-xs" : "text-xl"}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
function Row({ label, ok, icon: Icon }: { label: string; ok: boolean; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-3.5 h-3.5 ${ok ? "text-green-600" : "text-muted-foreground"}`} />
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      {ok && <CheckCircle2 className="w-3 h-3 text-green-600" />}
    </div>
  );
}
function KV({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="text-foreground font-medium">{v}</span></div>;
}
