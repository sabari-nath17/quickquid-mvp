import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Users, Briefcase, FileText, ShoppingBag, Package, MessageSquare,
  Upload, Network, Star, Activity, MessageCircle,
} from "lucide-react";
import {
  SuspendToggle, PackageVisibilityToggle, RemoveReviewButton, CancelOrderButton, MockDataPanel,
} from "./oversight-actions";

const tierLabel = (n: string) => n.charAt(0) + n.slice(1).toLowerCase();
const short = (s: string, n = 60) => (s.length > n ? s.slice(0, n) + "…" : s);

export default async function AdminOversightPage() {
  await requireAdmin().catch(() => redirect("/sign-in"));

  const [
    counts,
    users,
    packages,
    orders,
    reviews,
    messages,
    submissions,
    subJobs,
  ] = await Promise.all([
    Promise.all([
      prisma.user.count(),
      prisma.workerProfile.count(),
      prisma.jobRequirement.count(),
      prisma.jobApplication.count(),
      prisma.serviceOrder.count(),
      prisma.servicePackage.count(),
      prisma.message.count(),
      prisma.workSubmission.count(),
      prisma.subJob.count(),
      prisma.review.count(),
      prisma.matchmakingConnection.count({ where: { introducedAt: { not: null } } }),
    ]),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isSuspended: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.servicePackage.findMany({
      include: { worker: { include: { user: { select: { name: true, email: true } } } }, _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.serviceOrder.findMany({
      include: {
        package: { select: { title: true } },
        tier: { select: { name: true, price: true } },
        client: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.review.findMany({
      include: { worker: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.message.findMany({
      include: { sender: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.workSubmission.findMany({
      include: { worker: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.subJob.findMany({
      include: { postedBy: { include: { user: { select: { name: true, email: true } } } }, _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const [
    userCount, workerCount, jobCount, appCount, orderCount, pkgCount,
    msgCount, subCount, subJobCount, reviewCount, introCount,
  ] = counts;

  const stats = [
    { label: "Users", value: userCount, icon: Users },
    { label: "Workers", value: workerCount, icon: Users },
    { label: "Jobs", value: jobCount, icon: Briefcase },
    { label: "Applications", value: appCount, icon: FileText },
    { label: "Orders", value: orderCount, icon: ShoppingBag },
    { label: "Packages", value: pkgCount, icon: Package },
    { label: "Messages", value: msgCount, icon: MessageSquare },
    { label: "Submissions", value: subCount, icon: Upload },
    { label: "Sub-jobs", value: subJobCount, icon: Network },
    { label: "Reviews", value: reviewCount, icon: Star },
    { label: "Introductions", value: introCount, icon: Activity },
  ];

  const orderStatusColor: Record<string, string> = {
    PENDING: "text-amber-600 border-amber-300 bg-amber-50",
    IN_PROGRESS: "text-blue-700 border-blue-300 bg-blue-50",
    COMPLETED: "text-green-700 border-green-300 bg-green-100",
    DECLINED: "text-red-600 border-red-200 bg-red-50",
    CANCELLED: "text-muted-foreground border-border bg-muted",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Admin Oversight</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Platform Command Center</h1>
        <p className="text-muted-foreground mt-2">
          Full visibility and control over every action on QuickQuid — users, packages, orders, messages, submissions, and reviews.
        </p>
      </div>

      {/* Demo data toggle */}
      <div className="mb-8">
        <MockDataPanel />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-border p-3 text-center">
              <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground font-heading">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Users */}
      <Section title="Users" icon={Users} subtitle="Suspend bad actors — suspension logs them out everywhere instantly.">
        <div className="divide-y divide-border">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground truncate">{u.name ?? u.email}</span>
                  <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                  {u.isSuspended && (
                    <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50">Suspended</Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
              </div>
              {u.role !== "ADMIN" && <SuspendToggle userId={u.id} suspended={u.isSuspended} />}
            </div>
          ))}
        </div>
      </Section>

      {/* Service packages */}
      <Section title="Service Packages" icon={Package} subtitle="Hide non-compliant listings from the catalog.">
        <div className="divide-y divide-border">
          {packages.length === 0 ? <Empty text="No packages yet" /> : packages.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/catalog/${p.id}`} className="text-sm font-medium text-foreground hover:text-primary truncate">{p.title}</Link>
                  {p.isActive ? (
                    <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">Live</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Hidden</Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {p.worker.user.name ?? p.worker.user.email} · {p._count.orders} order(s)
                </p>
              </div>
              <PackageVisibilityToggle packageId={p.id} isActive={p.isActive} />
            </div>
          ))}
        </div>
      </Section>

      {/* Orders */}
      <Section title="Service Orders" icon={ShoppingBag} subtitle="Cancel orders that violate policy.">
        <div className="divide-y divide-border">
          {orders.length === 0 ? <Empty text="No orders yet" /> : orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground truncate">{o.package.title}</span>
                  <Badge variant="outline" className={`text-[10px] ${orderStatusColor[o.status] ?? ""}`}>
                    {o.status.charAt(0) + o.status.slice(1).toLowerCase().replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {tierLabel(o.tier.name)} ₹{o.tier.price.toLocaleString("en-IN")} · {o.client.name ?? o.client.email}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {o.connectionId && (
                  <Link href={`/messages/${o.connectionId}`} className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-0.5">
                    <MessageCircle className="w-3 h-3" /> Monitor
                  </Link>
                )}
                {o.status !== "COMPLETED" && o.status !== "CANCELLED" && o.status !== "DECLINED" && (
                  <CancelOrderButton orderId={o.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Messages */}
      <Section title="Recent Messages" icon={MessageSquare} subtitle="Every conversation is logged and readable by admin.">
        <div className="divide-y divide-border">
          {messages.length === 0 ? <Empty text="No messages yet" /> : messages.map((m) => (
            <div key={m.id} className="py-2.5">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-foreground">{m.sender.role === "ADMIN" ? "Admin" : (m.sender.name ?? m.sender.email)}</span>
                <Badge variant="outline" className="text-[9px]">{m.sender.role}</Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{short(m.content, 120)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Reviews */}
      <Section title="Reviews" icon={Star} subtitle="Remove abusive or fraudulent reviews.">
        <div className="divide-y divide-border">
          {reviews.length === 0 ? <Empty text="No reviews yet" /> : reviews.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/30"}`} />
                  ))}
                  <span className="text-[11px] text-muted-foreground ml-1">for {r.worker.user.name ?? r.worker.user.email}</span>
                </div>
                {r.comment && <p className="text-xs text-muted-foreground mt-0.5">{short(r.comment, 100)}</p>}
              </div>
              <RemoveReviewButton reviewId={r.id} />
            </div>
          ))}
        </div>
      </Section>

      {/* Submissions + sub-jobs read-only */}
      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Work Submissions" icon={Upload}>
          <div className="divide-y divide-border">
            {submissions.length === 0 ? <Empty text="No submissions yet" /> : submissions.map((s) => (
              <div key={s.id} className="py-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground truncate">{s.title}</span>
                  {s.isPreview && <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50">Preview</Badge>}
                  {s.isApproved && <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">Approved</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground">{s.worker.user.name ?? s.worker.user.email}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Sub-Jobs (Chain Network)" icon={Network}>
          <div className="divide-y divide-border">
            {subJobs.length === 0 ? <Empty text="No sub-jobs yet" /> : subJobs.map((sj) => (
              <div key={sj.id} className="py-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground truncate">{sj.title}</span>
                  <span className="text-[11px] text-muted-foreground">{sj._count.applications} applicant(s)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">by {sj.postedBy.user.name ?? sj.postedBy.user.email}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title, icon: Icon, subtitle, children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="text-base font-semibold text-foreground font-heading">{title}</h2>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
      <div className="bg-white rounded-xl border border-border px-4">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground py-4 text-center">{text}</p>;
}
