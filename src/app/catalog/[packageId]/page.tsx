import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, CheckCircle2, Zap } from "lucide-react";
import { OrderPanel } from "./order-panel";

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;
  const session = await getSession();

  const pkg = await prisma.servicePackage.findUnique({
    where: { id: packageId },
    include: {
      tiers: { orderBy: { price: "asc" } },
      worker: {
        include: {
          user: { select: { name: true, email: true } },
          reviews: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      },
    },
  });

  if (!pkg) notFound();

  const workerName = pkg.worker.user.name ?? pkg.worker.user.email;
  const ratings = pkg.worker.reviews;
  const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null;
  const canOrder = session?.role === "CLIENT" && pkg.isActive;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href={session?.role === "CLIENT" ? "/client/catalog" : "/"}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Catalog
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Badge variant="outline" className="text-xs mb-3">{pkg.category}</Badge>
            <h1 className="text-2xl font-bold text-foreground font-heading leading-tight">{pkg.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              <Link
                href={`/worker/profile/${pkg.worker.id}`}
                className="flex items-center gap-2 group"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary overflow-hidden">
                  {pkg.worker.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pkg.worker.avatarUrl} alt={workerName} className="w-full h-full object-cover" />
                  ) : (
                    workerName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {workerName}
                </span>
              </Link>
              {pkg.worker.isVerified && (
                <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200 gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified
                </Badge>
              )}
              {avg !== null && (
                <span className="flex items-center gap-1 text-sm text-foreground">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {avg.toFixed(1)} ({ratings.length})
                </span>
              )}
            </div>
          </div>

          {pkg.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pkg.coverImageUrl}
              alt={pkg.title}
              className="w-full rounded-xl border border-border object-cover max-h-80"
            />
          )}

          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground font-heading mb-2">About this service</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{pkg.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {pkg.skills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Tier comparison matrix */}
          <div>
            <h2 className="text-base font-semibold text-foreground font-heading mb-3">Compare packages</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {pkg.tiers.map((tier) => {
                const isLightning = tier.deliveryDays <= 1;
                return (
                  <div key={tier.id} className="bg-white rounded-xl border border-border p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {tier.name.charAt(0) + tier.name.slice(1).toLowerCase()}
                      </span>
                      {isLightning && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                          <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          Lightning
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-foreground font-heading">
                      ₹{tier.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tier.deliveryDays} day{tier.deliveryDays !== 1 ? "s" : ""} · {tier.revisions} revision{tier.revisions !== 1 ? "s" : ""}
                    </p>
                    {tier.description && (
                      <p className="text-xs text-muted-foreground mt-2">{tier.description}</p>
                    )}
                    {tier.features.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
                            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews */}
          {ratings.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground font-heading mb-3">Recent reviews</h2>
              <div className="space-y-3">
                {ratings.map((r) => (
                  <div key={r.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: order panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {canOrder ? (
              <OrderPanel
                packageId={pkg.id}
                tiers={pkg.tiers.map((t) => ({
                  id: t.id,
                  name: t.name,
                  price: t.price,
                  deliveryDays: t.deliveryDays,
                  revisions: t.revisions,
                }))}
              />
            ) : (
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  {session?.role === "CLIENT"
                    ? "This package is not currently available."
                    : session
                    ? "Only client accounts can order packages."
                    : "Sign in as a client to order this package."}
                </p>
                {!session && (
                  <Link
                    href="/sign-in"
                    className="inline-block mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
