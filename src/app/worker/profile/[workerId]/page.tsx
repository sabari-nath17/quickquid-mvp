import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { Star, Globe, ExternalLink, CheckCircle2, Trophy, Clock } from "lucide-react";

export default async function WorkerProfilePage({
  params,
}: {
  params: Promise<{ workerId: string }>;
}) {
  const { workerId } = await params;
  const session = await getSession();

  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!worker) notFound();

  const name = worker.user.name ?? worker.user.email;
  const initials = name.slice(0, 2).toUpperCase();
  const avgRating =
    worker.reviews.length > 0
      ? worker.reviews.reduce((s, r) => s + r.rating, 0) / worker.reviews.length
      : null;

  const badgeConfig: Record<string, { label: string; className: string }> = {
    KYC_VERIFIED: { label: "KYC Verified", className: "bg-blue-50 text-blue-700 border-blue-200" },
    SKILL_VERIFIED: { label: "Skill Verified", className: "bg-purple-50 text-purple-700 border-purple-200" },
    SQUAD_VOUCHED: { label: "Squad Vouched", className: "bg-green-50 text-green-700 border-green-200" },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          {worker.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={worker.avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-2 border-border shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary font-heading shrink-0">
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
            </div>
            {worker.title && (
              <p className="text-base text-muted-foreground mb-2">{worker.title}</p>
            )}
            <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground mb-3">
              {worker.hourlyRate && (
                <span className="font-semibold text-foreground">₹{worker.hourlyRate.toLocaleString("en-IN")}/hr</span>
              )}
              {avgRating !== null && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{avgRating.toFixed(1)}</span>
                  <span>({worker.reviews.length} review{worker.reviews.length !== 1 ? "s" : ""})</span>
                </span>
              )}
              {worker.sandboxScore !== null && (
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-primary" />
                  Sandbox: {worker.sandboxScore}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Member since{" "}
                {new Date(worker.user.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {worker.verificationBadges.map((badge) => {
                const cfg = badgeConfig[badge];
                return (
                  <Badge key={badge} variant="outline" className={`text-xs gap-1 ${cfg.className}`}>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {cfg.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          {/* Bio */}
          {worker.bio && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground font-heading mb-2">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{worker.bio}</p>
            </div>
          )}

          {/* Experience */}
          {worker.experienceText && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground font-heading mb-2">Experience</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{worker.experienceText}</p>
            </div>
          )}

          {/* Reviews */}
          {worker.reviews.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground font-heading mb-4">
                Client Reviews ({worker.reviews.length})
              </h2>
              <div className="space-y-4">
                {worker.reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-none text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Skills */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground font-heading mb-3">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {worker.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio links */}
          {worker.portfolioUrls.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground font-heading mb-3">Portfolio</h3>
              <div className="space-y-2">
                {worker.portfolioUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {url.replace(/^https?:\/\//, "")}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* LinkedIn */}
          {worker.linkedinUrl && (
            <a
              href={worker.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/5 text-[#0A66C2] text-sm font-medium hover:bg-[#0A66C2]/10 transition-colors"
            >
              <Globe className="w-4 h-4" />
              LinkedIn Profile
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
