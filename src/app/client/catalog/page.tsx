import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, Zap, Star } from "lucide-react";

const tierLabel = (n: string) => n.charAt(0) + n.slice(1).toLowerCase();

export default async function ClientCatalogPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const packages = await prisma.servicePackage.findMany({
    where: { isActive: true, worker: { isVerified: true } },
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
    take: 60,
  });

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

      {packages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No service packages available yet</p>
          <p className="text-sm mt-1">Verified freelancers are still building out their catalogs.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const startingPrice = pkg.tiers.length ? Math.min(...pkg.tiers.map((t) => t.price)) : 0;
            const fastestDelivery = pkg.tiers.length ? Math.min(...pkg.tiers.map((t) => t.deliveryDays)) : 0;
            const isLightning = fastestDelivery > 0 && fastestDelivery <= 1;
            const workerName = pkg.worker.user.name ?? pkg.worker.user.email;
            const ratings = pkg.worker.reviews;
            const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null;

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
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <Badge variant="outline" className="text-[10px] w-fit mb-2">{pkg.category}</Badge>
                  <h3 className="text-sm font-semibold text-foreground font-heading leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {pkg.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0 overflow-hidden">
                      {pkg.worker.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pkg.worker.avatarUrl} alt={workerName} className="w-full h-full object-cover" />
                      ) : (
                        workerName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{workerName}</span>
                    {avg !== null && (
                      <span className="ml-auto flex items-center gap-0.5 text-xs text-foreground shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {avg.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">From</span>
                    <span className="text-sm font-bold text-foreground font-heading">
                      ₹{startingPrice.toLocaleString("en-IN")}
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
