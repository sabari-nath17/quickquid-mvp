import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Pencil,
  Globe,
  ExternalLink,
  FileText,
  AlertCircle,
  Star,
  TrendingUp,
  Zap,
  Users,
  FlaskConical,
  MessageCircle,
  Briefcase,
} from "lucide-react";
import { TierLadder } from "@/components/shared/tier-ladder";
import { PromoBanner } from "@/components/shared/promo-banner";

const connectionStatusLabel: Record<string, { label: string; color: string }> = {
  PENDING_CONTACT: { label: "Pending Contact", color: "text-amber-600 border-amber-300 bg-amber-50" },
  IN_PROGRESS:     { label: "In Progress",     color: "text-blue-600 border-blue-300 bg-blue-50" },
  COMPLETED:       { label: "Completed",       color: "text-green-700 border-green-300 bg-green-50" },
};

export default async function WorkerDashboardPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
    include: {
      connections: {
        include: {
          job: { include: { user: true } },
          milestones: { include: { commissionEntry: true } },
          review: true,
        },
        orderBy: { createdAt: "desc" },
      },
      jobApplications: {
        orderBy: { appliedAt: "desc" },
        take: 5,
        include: { job: true },
      },
    },
  });

  const introductions = profile?.connections.filter((c) => c.introducedAt) ?? [];

  const reviews = introductions.flatMap((c) => c.review ? [c.review] : []);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  const completedContracts =
    profile?.connections.filter((c) => c.milestones.some((m) => m.status === "APPROVED")).length ?? 0;

  const totalEarned = profile?.connections
    .flatMap((c) => c.milestones)
    .filter((m) => m.status === "APPROVED")
    .reduce((sum, m) => sum + m.amount, 0) ?? 0;

  const commissionDue = profile?.connections
    .flatMap((c) => c.milestones)
    .flatMap((m) => m.commissionEntry ? [m.commissionEntry] : [])
    .filter((l) => !l.isPaid)
    .reduce((sum, l) => sum + l.platformFee, 0) ?? 0;

  const badgeLabels: Record<string, { label: string; color: string }> = {
    KYC_VERIFIED:  { label: "KYC Verified",  color: "bg-blue-50 text-blue-700 border-blue-200" },
    SKILL_VERIFIED:{ label: "Skill Verified", color: "bg-green-50 text-green-700 border-green-200" },
    SQUAD_VOUCHED: { label: "Squad Vouched",  color: "bg-violet-50 text-violet-700 border-violet-200" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={session.name ?? ""}
              className="w-14 h-14 rounded-full object-cover border-2 border-border shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary font-heading shrink-0">
              {(session.name ?? session.email).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">
              Welcome, {session.name?.split(" ")[0] ?? "there"}
            </h1>
            {profile?.title && (
              <p className="text-sm text-muted-foreground mt-0.5">{profile.title}</p>
            )}
            {!profile?.title && (
              <p className="text-muted-foreground mt-0.5 text-sm">Your QuickQuid worker dashboard</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" className="gap-2">
            <Link href="/worker/jobs">
              <Briefcase className="w-4 h-4" />
              Find Jobs
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/worker/onboarding">
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats row */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Sandbox Score</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">
                {profile.sandboxScore != null ? `${profile.sandboxScore}/100` : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Fill Rate</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">
                {profile.fillRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Introductions</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">{introductions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-violet-500" />
                <span className="text-xs text-muted-foreground">Hours Logged</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">
                {profile.hoursTrained.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Client Rating</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">
                {avgRating != null ? `${avgRating.toFixed(1)} ★` : "—"}
              </p>
              {reviews.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {profile?.isVerified && (
        <PromoBanner
          id="worker-services-2026"
          message="Turn your skills into a fixed-price package clients can order directly."
          ctaLabel="Create a package"
          ctaHref="/worker/services/new"
        />
      )}

      {/* Seller tier ladder */}
      {profile && (
        <div className="mb-8">
          <TierLadder
            inputs={{ completedContracts, avgRating, fillRate: profile.fillRate }}
          />
        </div>
      )}

      {/* Status Card */}
      <div className="mb-8">
        {!profile ? (
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-primary/40 mb-4" />
              <h2 className="text-lg font-semibold text-foreground font-heading mb-2">
                Complete your profile
              </h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                Submit your LinkedIn, portfolio, and experience to get reviewed by our admin team.
              </p>
              <Button asChild>
                <Link href="/worker/onboarding">Start Onboarding</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  {profile.status === "VERIFIED"     && <CheckCircle2 className="w-8 h-8 text-green-500" />}
                  {profile.status === "PENDING"      && <Clock className="w-8 h-8 text-amber-500" />}
                  {profile.status === "UNDER_REVIEW" && <Clock className="w-8 h-8 text-blue-500" />}
                  {profile.status === "REJECTED"     && <XCircle className="w-8 h-8 text-red-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {profile.status === "VERIFIED" && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">Verified ✓</Badge>
                    )}
                    {profile.status === "PENDING" && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Pending Review</Badge>
                    )}
                    {profile.status === "UNDER_REVIEW" && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Under Review</Badge>
                    )}
                    {profile.status === "REJECTED" && (
                      <Badge variant="destructive">Rejected</Badge>
                    )}
                    {(profile.verificationBadges as string[]).map((b) => (
                      <Badge key={b} variant="outline" className={`text-xs ${badgeLabels[b]?.color ?? ""}`}>
                        {badgeLabels[b]?.label ?? b}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile.status === "VERIFIED"     && "Your profile is live. You may receive client introductions."}
                    {profile.status === "PENDING"      && "Our team is reviewing your application. Typical review time: 24–48 hours."}
                    {profile.status === "UNDER_REVIEW" && "An admin is actively reviewing your application."}
                    {profile.status === "REJECTED"     && "Your application was not approved. Update your profile and resubmit."}
                  </p>
                  {profile.verificationNotes && (
                    <div className="mt-3 p-3 rounded-lg bg-muted text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-foreground">Admin feedback: </span>
                          <span className="text-muted-foreground">{profile.verificationNotes}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Globe className="w-4 h-4" />
                  LinkedIn Profile
                </a>
                {profile.portfolioUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    Portfolio {profile.portfolioUrls.length > 1 ? i + 1 : ""}
                  </a>
                ))}
              </div>

              {profile.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              )}

              {profile.status !== "VERIFIED" && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href="/worker/sandbox">
                      <FlaskConical className="w-3.5 h-3.5" />
                      Take Skill Test
                    </Link>
                  </Button>
                  <span className="text-xs text-muted-foreground">Score 70+ to earn Skill-Verified badge</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Earnings Tracker */}
      {introductions.length > 0 && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Earnings Tracker (Honour System)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold font-heading text-foreground">
                  ₹{totalEarned.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Approved</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-amber-600">
                  ₹{commissionDue.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Commission Due (8%)</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-green-600">
                  ₹{(totalEarned - commissionDue).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Take-Home</p>
              </div>
            </div>
            {commissionDue > 0 && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                You have ₹{commissionDue.toLocaleString("en-IN")} in platform commission due. Pay via UPI to admin@quickquid.com.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      {(profile?.jobApplications.length ?? 0) > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground font-heading">Recent Applications</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/worker/applications">View all →</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {profile!.jobApplications.map((app) => {
              const statusColors = {
                PENDING: "text-amber-600 border-amber-300 bg-amber-50",
                SHORTLISTED: "text-blue-700 border-blue-300 bg-blue-50",
                REJECTED: "text-red-600 border-red-200 bg-red-50",
                HIRED: "text-green-700 border-green-300 bg-green-100",
              };
              return (
                <Card key={app.id} className="border-border">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground truncate flex-1">{app.job.title}</p>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[app.status]}`}>
                        {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Introductions */}
      {introductions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground font-heading mb-4">Your Introductions</h2>
          <div className="space-y-3">
            {introductions.map((conn) => {
              const statusInfo = connectionStatusLabel[conn.connectionStatus] ?? connectionStatusLabel.PENDING_CONTACT;
              return (
                <Card key={conn.id} className="border-green-200 bg-green-50/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm">{conn.job.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Posted by {conn.job.user.name ?? conn.job.user.email}
                        </p>
                        {conn.job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {conn.job.skills.slice(0, 4).map((s) => (
                              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge className="bg-green-100 text-green-700 border-green-200">Introduced</Badge>
                        <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                        <div className="flex gap-1.5 mt-1">
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
                            <Link href={`/messages/${conn.id}`}>
                              <MessageCircle className="w-3 h-3" />
                              Chat
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                            <Link href={`/worker/contract/${conn.id}`}>Contract →</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                    {conn.milestones.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Milestones</p>
                        <div className="space-y-1">
                          {conn.milestones.map((m) => (
                            <div key={m.id} className="flex items-center justify-between text-xs">
                              <span className="text-foreground truncate mr-2">{m.title}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-muted-foreground">₹{m.amount.toLocaleString("en-IN")}</span>
                                <Badge variant="outline" className={`text-[10px] py-0 ${
                                  m.status === "APPROVED"    ? "bg-green-50 text-green-700 border-green-200" :
                                  m.status === "DELIVERED"   ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  m.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {m.status === "IN_PROGRESS" ? "In Progress" : m.status === "APPROVED" ? "Approved" : m.status === "DELIVERED" ? "Delivered" : "Pending"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      Introduced{" "}
                      {conn.introducedAt
                        ? new Date(conn.introducedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                    {conn.review && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= conn.review!.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-none text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">Client review</span>
                        </div>
                        {conn.review.comment && (
                          <p className="text-xs text-muted-foreground italic">
                            &ldquo;{conn.review.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
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
