import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import {
  Star, Globe, ExternalLink, CheckCircle2, Trophy, MapPin, Briefcase,
  GraduationCap, Award, Languages, ShieldCheck, Phone, Zap, Clock,
} from "lucide-react";
import { TierLadder } from "@/components/shared/tier-ladder";
import { LocalTime } from "@/components/shared/local-time";

const AVAIL: Record<string, { label: string; cls: string }> = {
  AVAILABLE_NOW: { label: "Available now", cls: "bg-green-100 text-green-700 border-green-200" },
  OPEN_TO_OFFERS: { label: "Open to offers", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  NOT_AVAILABLE: { label: "Not available", cls: "bg-muted text-muted-foreground border-border" },
};
const WEEKLY: Record<string, string> = {
  AS_NEEDED: "As needed — open to offers",
  LESS_THAN_30: "Less than 30 hrs/week",
  THIRTY_PLUS: "More than 30 hrs/week",
  FULL_TIME: "Full time (40 hrs/week)",
};
const PROF: Record<string, string> = {
  BASIC: "Basic", CONVERSATIONAL: "Conversational", FLUENT: "Fluent", NATIVE_OR_BILINGUAL: "Native / Bilingual",
};

function compactMoney(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L+`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K+`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default async function WorkerProfilePage({
  params,
}: {
  params: Promise<{ workerId: string }>;
}) {
  const { workerId } = await params;
  await getSession();

  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
      connections: { include: { milestones: true } },
      portfolioProjects: { orderBy: { createdAt: "desc" } },
      employmentHistory: { orderBy: { startDate: "desc" } },
      education: { orderBy: { endYear: "desc" } },
      certifications: { orderBy: { createdAt: "desc" } },
      languages: { orderBy: { name: "asc" } },
    },
  });

  if (!worker) notFound();

  const name = worker.user.name ?? worker.user.email;
  const initials = name.slice(0, 2).toUpperCase();
  const avgRating = worker.reviews.length
    ? worker.reviews.reduce((s, r) => s + r.rating, 0) / worker.reviews.length
    : null;

  // Lifetime stats
  const approvedMilestones = worker.connections.flatMap((c) => c.milestones).filter((m) => m.status === "APPROVED");
  const totalEarnings = approvedMilestones.reduce((s, m) => s + m.amount, 0);
  const completedContracts = worker.connections.filter((c) => c.milestones.some((m) => m.status === "APPROVED")).length;
  const totalHours = worker.hoursTrained;

  // Job success score (derived): blends rating + fill-rate
  const jobSuccess =
    avgRating !== null ? Math.round(((avgRating / 5) * 0.7 + (worker.fillRate / 100) * 0.3) * 100) : null;

  const subParams = [
    { key: "qualityRating", label: "Quality" },
    { key: "communicationRating", label: "Communication" },
    { key: "professionalismRating", label: "Professionalism" },
    { key: "reliabilityRating", label: "Reliability" },
    { key: "flexibilityRating", label: "Flexibility" },
  ] as const;
  const subAverages: { label: string; avg: number }[] = [];
  for (const p of subParams) {
    const vals = worker.reviews.map((r) => r[p.key]).filter((v): v is number => typeof v === "number");
    if (vals.length) subAverages.push({ label: p.label, avg: vals.reduce((s, v) => s + v, 0) / vals.length });
  }

  const badgeConfig: Record<string, { label: string; className: string }> = {
    KYC_VERIFIED: { label: "KYC Verified", className: "bg-blue-50 text-blue-700 border-blue-200" },
    SKILL_VERIFIED: { label: "Skill Verified", className: "bg-purple-50 text-purple-700 border-purple-200" },
    SQUAD_VOUCHED: { label: "Squad Vouched", className: "bg-green-50 text-green-700 border-green-200" },
  };
  const avail = AVAIL[worker.availabilityStatus] ?? AVAIL.OPEN_TO_OFFERS;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          {worker.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={worker.avatarUrl} alt={name} className="w-24 h-24 rounded-full object-cover border-2 border-border shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary font-heading shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-foreground font-heading">{name}</h1>
              {worker.isVerified && (
                <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </Badge>
              )}
              <TierLadder inputs={{ completedContracts, avgRating, fillRate: worker.fillRate }} compact />
              <Badge variant="outline" className={`text-xs ${avail.cls}`}>{avail.label}</Badge>
            </div>
            {worker.title && <p className="text-base text-foreground mb-1">{worker.title}</p>}
            <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
              {worker.location && (
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{worker.location}</span>
              )}
              {worker.timezone && <LocalTime timezone={worker.timezone} />}
              {worker.hourlyRate && (
                <span className="font-semibold text-foreground">₹{worker.hourlyRate.toLocaleString("en-IN")}/hr</span>
              )}
              {jobSuccess !== null && (
                <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                  <Zap className="w-3.5 h-3.5" />{jobSuccess}% Job Success
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {worker.verificationBadges.map((badge) => {
                const cfg = badgeConfig[badge];
                return (
                  <Badge key={badge} variant="outline" className={`text-xs gap-1 ${cfg.className}`}>
                    <CheckCircle2 className="w-2.5 h-2.5" />{cfg.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lifetime stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
          <Stat label="Total earned" value={totalEarnings > 0 ? compactMoney(totalEarnings) : "—"} />
          <Stat label="Contracts" value={String(completedContracts)} />
          <Stat label="Hours logged" value={totalHours.toLocaleString("en-IN")} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          {/* About */}
          {(worker.bio || worker.experienceText) && (
            <Card title="About">
              {worker.bio && <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-3">{worker.bio}</p>}
              {worker.experienceText && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{worker.experienceText}</p>}
            </Card>
          )}

          {/* Employment */}
          {worker.employmentHistory.length > 0 && (
            <Card title="Employment History" icon={Briefcase}>
              <div className="space-y-4">
                {worker.employmentHistory.map((e) => (
                  <div key={e.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-foreground">{e.title}</p>
                    <p className="text-xs text-primary">{e.company}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(e.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} –{" "}
                      {e.isCurrent ? "Present" : e.endDate ? new Date(e.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                    </p>
                    {e.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{e.description}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Portfolio */}
          {worker.portfolioProjects.length > 0 && (
            <Card title={`Portfolio (${worker.portfolioProjects.length})`}>
              <div className="grid sm:grid-cols-2 gap-4">
                {worker.portfolioProjects.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border overflow-hidden flex flex-col">
                    {p.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.title} className="w-full aspect-[16/9] object-cover" />
                    )}
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-sm font-medium text-foreground">{p.title}</p>
                      {p.role && <p className="text-[11px] text-primary">{p.role}</p>}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                      {p.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.skills.map((s) => (
                            <span key={s} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">{s}</span>
                          ))}
                        </div>
                      )}
                      {p.projectUrl && (
                        <a href={p.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-2">
                          <ExternalLink className="w-3 h-3" />View project
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Education + Certifications */}
          {(worker.education.length > 0 || worker.certifications.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-5">
              {worker.education.length > 0 && (
                <Card title="Education" icon={GraduationCap}>
                  <div className="space-y-3">
                    {worker.education.map((e) => (
                      <div key={e.id}>
                        <p className="text-sm font-medium text-foreground">{e.institution}</p>
                        <p className="text-xs text-muted-foreground">{[e.degree, e.fieldOfStudy].filter(Boolean).join(", ")}</p>
                        {(e.startYear || e.endYear) && (
                          <p className="text-[11px] text-muted-foreground">{e.startYear ?? ""}–{e.endYear ?? ""}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {worker.certifications.length > 0 && (
                <Card title="Certifications" icon={Award}>
                  <div className="space-y-3">
                    {worker.certifications.map((c) => (
                      <div key={c.id}>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.provider}{c.issueYear ? ` · ${c.issueYear}` : ""}</p>
                        {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline">View credential</a>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Reviews */}
          {worker.reviews.length > 0 && (
            <Card title={`Client Reviews (${worker.reviews.length})`}>
              <div className="space-y-4">
                {worker.reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <TierLadder inputs={{ completedContracts, avgRating, fillRate: worker.fillRate }} />

          {/* Work preference */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground font-heading mb-2">Work Preference</h3>
            <p className="text-xs text-muted-foreground">{WEEKLY[worker.weeklyAvailability] ?? "As needed"}</p>
            {worker.openToContractHire && <p className="text-xs text-muted-foreground mt-1">Open to contract-to-hire</p>}
            {worker.responseTime && (
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Responds {worker.responseTime}
              </p>
            )}
          </div>

          {/* Verification */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground font-heading mb-2">Verifications</h3>
            <div className="space-y-1.5 text-xs">
              <VerifyRow icon={ShieldCheck} label="ID" ok={worker.idVerified} />
              <VerifyRow icon={Phone} label="Phone" ok={worker.phoneVerified} />
              <VerifyRow icon={CheckCircle2} label="Admin review" ok={worker.isVerified} />
            </div>
          </div>

          {/* Languages */}
          {worker.languages.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground font-heading mb-2 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-primary" /> Languages
              </h3>
              <div className="space-y-1">
                {worker.languages.map((l) => (
                  <p key={l.id} className="text-xs text-foreground">
                    {l.name} <span className="text-muted-foreground">— {PROF[l.proficiency] ?? l.proficiency}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Rating breakdown */}
          {subAverages.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground font-heading mb-3">Rating Breakdown</h3>
              <div className="space-y-2.5">
                {subAverages.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium text-foreground">{s.avg.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(s.avg / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground font-heading mb-3">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {worker.skills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{skill}</span>
              ))}
            </div>
          </div>

          {/* External links */}
          {worker.portfolioUrls.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground font-heading mb-3">Links</h3>
              <div className="space-y-2">
                {worker.portfolioUrls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline truncate">
                    <ExternalLink className="w-3 h-3 shrink-0" />{url.replace(/^https?:\/\//, "")}
                  </a>
                ))}
              </div>
            </div>
          )}

          {worker.linkedinUrl && (
            <a href={worker.linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/5 text-[#0A66C2] text-sm font-medium hover:bg-[#0A66C2]/10 transition-colors">
              <Globe className="w-4 h-4" />LinkedIn Profile
            </a>
          )}

          <p className="text-[11px] text-muted-foreground text-center">
            Member since {new Date(worker.user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            {worker.sandboxScore !== null && (
              <> · <span className="inline-flex items-center gap-0.5"><Trophy className="w-3 h-3 text-primary" />Sandbox {worker.sandboxScore}</span></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground font-heading mb-3 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-foreground font-heading">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function VerifyRow({ icon: Icon, label, ok }: { icon: React.ComponentType<{ className?: string }>; label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Icon className="w-3.5 h-3.5" />{label}</span>
      {ok ? (
        <span className="text-green-700 font-medium inline-flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />Verified</span>
      ) : (
        <span className="text-muted-foreground">Not verified</span>
      )}
    </div>
  );
}
