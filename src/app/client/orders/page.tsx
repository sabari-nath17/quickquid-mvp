import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Zap } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Awaiting acceptance", className: "text-amber-600 border-amber-300 bg-amber-50" },
  ACCEPTED: { label: "Accepted", className: "text-blue-700 border-blue-300 bg-blue-50" },
  IN_PROGRESS: { label: "In progress", className: "text-blue-700 border-blue-300 bg-blue-50" },
  DELIVERED: { label: "Delivered", className: "text-amber-700 border-amber-300 bg-amber-50" },
  COMPLETED: { label: "Completed", className: "text-green-700 border-green-300 bg-green-100" },
  DECLINED: { label: "Declined", className: "text-red-600 border-red-200 bg-red-50" },
  CANCELLED: { label: "Cancelled", className: "text-muted-foreground border-border bg-muted" },
};

const tierLabel = (n: string) => n.charAt(0) + n.slice(1).toLowerCase();

export default async function ClientOrdersPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const orders = await prisma.serviceOrder.findMany({
    where: { clientId: session.id },
    include: {
      package: { include: { worker: { include: { user: { select: { name: true, email: true } } } } } },
      tier: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">My Orders</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Catalog Orders</h1>
        <p className="text-muted-foreground mt-2">Track packages you&apos;ve ordered from verified freelancers.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders yet</p>
          <p className="text-sm mt-1">
            <Link href="/client/catalog" className="text-primary underline">Browse the catalog</Link> to order a package.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] ?? statusConfig.PENDING;
            const total = order.tier.price + order.fastTrackFee;
            const workerName = order.package.worker.user.name ?? order.package.worker.user.email;
            return (
              <div key={order.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-foreground font-heading">{order.package.title}</span>
                      <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tierLabel(order.tier.name)} · {workerName} · ordered{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="font-semibold text-foreground">₹{total.toLocaleString("en-IN")}</span>
                      {order.fastTrack && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium">
                          <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                          Fast-track
                        </span>
                      )}
                    </div>
                  </div>
                  {order.connectionId && (
                    <Link
                      href={`/client/contract/${order.connectionId}`}
                      className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                      View Contract →
                    </Link>
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
