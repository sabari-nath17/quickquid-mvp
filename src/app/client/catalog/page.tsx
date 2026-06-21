import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, Zap, Star } from "lucide-react";
import { CatalogFilters } from "./catalog-filters";

const tierLabel = (n: string) => n.charAt(0) + n.slice(1).toLowerCase();

export default async function ClientCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const category = sp.category ?? "";
  const minPrice = sp.minPrice ? parseInt(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? parseInt(sp.maxPrice) : undefined;
  const delivery = sp.delivery ? parseInt(sp.delivery) : undefined;
  const level = sp.level ?? "";
  const sort = sp.sort ?? "";

  // Fetch distinct categories for filter dropdown
  const categoryRows = await prisma.servicePackage.findMany({
    where: { isActive: true, worker: { isVerified: true } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categories = categoryRows.map((r) => r.category);

  // Build keyword where clause
  const keywordFilter = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { category: { contains: q, mode: "insensitive" as const } },
          { skills: { has: q } },
        ],
      }
    : {};

  const packages = await prisma.servicePackage.findMany({
    where: {
      isActive: true,
      worker: { isVerified: true, ...(level ? { tier: level as "BASIC" | "PRO" | "ELITE" } : {}) },
      ...(category ? { category } : {}),
      ...keywordFilter,
    },
    include: {
      tiers: { orderBy: { price: "asc" } },
      worker: {
        include: {
          user: { select: { name: true, email: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  // Compute derived fields and apply price/delivery filters in JS
  type PkgWithDerived = (typeof packages)[number] & {
    minTierPrice: number;
    fastestDelivery: number;
    avgRating: number | null;
  };

  let results: PkgWithDerived[] = packages.map((pkg) => {
    const prices = pkg.tiers.map((t) => t.price);
    const days = pkg.tiers.map((t) => t.deliveryDays);
    const ratings = pkg.worker.reviews;
    return {
      ...pkg,
      minTierPrice: prices.length ? Math.min(...prices) : 0,
      fastestDelivery: days.length ? Math.min(...days) : 999,
      avgRating: ratings.length
        ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
        : null,
    };
  });

  if (minPrice !== undefined) results = results.filter((p) => p.minTierPrice >= minPrice);
  if (maxPrice !== undefined) results = results.filter((p) => p.minTierPrice <= maxPrice);
  if (delivery !== undefined) results = results.filter((p) => p.fastestDelivery <= delivery);

  // Sort
  switch (sort) {
    case "rating":
      results.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
      break;
    case "price_asc":
      results.sort((a, b) => a.minTierPrice - b.minTierPrice);
      break;
    case "price_desc":
      results.sort((a, b) => b.minTierPrice - a.minTierPrice);
      break;
    case "delivery":
      results.sort((a, b) => a.fastestDelivery - b.fastestDelivery);
      break;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Service Catalog</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Order vetted talent directly</h1>
        <p className="text-muted-foreground mt-2">
          Fixed-scope packages from verified freelancers. Pick a tier and order — no bidding, no back-and-forth.
        </p>
      </div>

      <CatalogFilters
        categories={categories}
        totalCount={results.length}
        defaults={{ q, category, minPrice: sp.minPrice ?? "", maxPrice: sp.maxPrice ?? "", delivery: sp.delivery ?? "", level, sort }}
      />

      {results.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No services match your filters</p>
          <p className="text-sm mt-1">Try broadening your search or clearing some filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((pkg) => {
            const isLightning = pkg.fastestDelivery > 0 && pkg.fastestDelivery <= 1;
            const workerName = pkg.worker.user.name ?? pkg.worker.user.email;

            return (
              <Link
                key={pkg.id}
                href={`/catalog/${pkg.id}`}
                className="group bg-white rounded-xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-md transition-all flex flex-col"
              >
                {/* Cover */}
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                  {pkg.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pkg.coverImageUrl} alt={pkg.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LayoutGrid className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                  {isLightning && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-semibold shadow-sm">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      Lightning
                    </span>
                  )}
                  {pkg.worker.tier && pkg.worker.tier !== "BASIC" && (
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${
                      pkg.worker.tier === "ELITE"
                        ? "bg-violet-600 text-white"
                        : "bg-blue-500 text-white"
                    }`}>
                      {tierLabel(pkg.worker.tier)}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <Badge variant="outline" className="text-[10px] w-fit mb-2">{pkg.category}</Badge>
                  <h3 className="text-sm font-semibold text-foreground font-heading leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {pkg.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-3 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0 overflow-hidden">
                      {pkg.worker.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pkg.worker.avatarUrl} alt={workerName} className="w-full h-full object-cover" />
                      ) : (
                        workerName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{workerName}</span>
                    {pkg.avgRating !== null && (
                      <span className="ml-auto flex items-center gap-0.5 text-xs text-foreground shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {pkg.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Tier pills */}
                  {pkg.tiers.length > 0 && (
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {pkg.tiers.map((tier) => (
                        <span key={tier.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {tierLabel(tier.name)}: ₹{tier.price.toLocaleString("en-IN")} · {tier.deliveryDays}d
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Starting from</span>
                    <span className="text-sm font-bold text-foreground font-heading">
                      ₹{pkg.minTierPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
