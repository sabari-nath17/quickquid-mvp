import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus, Zap, Inbox } from "lucide-react";
import { OrderActions } from "./order-actions";
import { PackageActiveToggle } from "./package-active-toggle";

const tierLabel = (n: string) => n.charAt(0) + n.slice(1).toLowerCase();

export default async function WorkerServicesPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) redirect("/worker/onboarding");

  const [packages, pendingOrders] = await Promise.all([
    prisma.servicePackage.findMany({
      where: { workerId: worker.id },
      include: { tiers: { orderBy: { price: "asc" } }, _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceOrder.findMany({
      where: { workerId: worker.id, status: "PENDING" },
      include: {
        package: { select: { title: true } },
        tier: true,
        client: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">My Services</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Service Packages</h1>
          <p className="text-muted-foreground mt-1">Sell your skills as fixed-scope products.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/worker/services/new">
            <Plus className="w-4 h-4" />
            New Package
          </Link>
        </Button>
      </div>

      {/* Incoming orders */}
      {pendingOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-foreground font-heading mb-3 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-primary" />
            Incoming Orders
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">{pendingOrders.length}</Badge>
          </h2>
          <div className="space-y-3">
            {pendingOrders.map((order) => {
              const total = order.tier.price + order.fastTrackFee;
              return (
                <div key={order.id} className="bg-white rounded-xl border border-amber-200 bg-amber-50/30 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{order.package.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tierLabel(order.tier.name)} tier · from {order.client.name ?? order.client.email}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="font-semibold text-foreground">₹{total.toLocaleString("en-IN")}</span>
                        {order.fastTrack && (
                          <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium">
                            <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                            Fast-track (+₹{order.fastTrackFee.toLocaleString("en-IN")})
                          </span>
                        )}
                      </div>
                      {order.requirements && (
                        <p className="text-xs text-muted-foreground italic mt-1.5 line-clamp-2">
                          &ldquo;{order.requirements}&rdquo;
                        </p>
                      )}
                    </div>
                    <OrderActions orderId={order.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My packages */}
      {packages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No service packages yet</p>
          <p className="text-sm mt-1">Create your first package so clients can order directly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => {
            const minPrice = pkg.tiers.length ? Math.min(...pkg.tiers.map((t) => t.price)) : 0;
            return (
              <div key={pkg.id} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-semibold text-foreground font-heading">{pkg.title}</h3>
                      <Badge variant="outline" className="text-[10px]">{pkg.category}</Badge>
                      {pkg.isActive ? (
                        <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">Live</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">Hidden</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{pkg.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>From <span className="font-semibold text-foreground">₹{minPrice.toLocaleString("en-IN")}</span></span>
                      <span>{pkg.tiers.length} tier{pkg.tiers.length !== 1 ? "s" : ""}</span>
                      <span>{pkg._count.orders} order{pkg._count.orders !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/catalog/${pkg.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Preview →
                    </Link>
                    <PackageActiveToggle packageId={pkg.id} isActive={pkg.isActive} />
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
