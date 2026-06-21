import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, Gift, TrendingUp } from "lucide-react";
import { CopyLink } from "./copy-link";

export default async function ReferralsPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { referralCode: true },
  });

  const referrals = await prisma.user.findMany({
    where: { referredById: session.id },
    select: { name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3420";
  const proto = host.includes("localhost") ? "http" : "https";
  const referralUrl = `${proto}://${host}/sign-up?ref=${user?.referralCode ?? ""}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Campus Ambassador</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Grow the network</h1>
        <p className="text-muted-foreground mt-2">
          Invite peers to QuickQuid. Every sign-up through your link is attributed to you — build your ambassador chain.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground font-heading">{referrals.length}</p>
          <p className="text-xs text-muted-foreground">People referred</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground font-heading">
            {referrals.filter((r) => r.role === "WORKER").length}
          </p>
          <p className="text-xs text-muted-foreground">Freelancers joined</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-xl border border-border p-5 mb-8">
        <h2 className="text-sm font-semibold text-foreground font-heading mb-1">Your invite link</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Share this anywhere — WhatsApp, Instagram, campus groups.
        </p>
        <CopyLink url={referralUrl} />
      </div>

      {/* Referred list */}
      <h2 className="text-base font-semibold text-foreground font-heading mb-3">Your referrals</h2>
      {referrals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No referrals yet — share your link to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {referrals.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{r.name ?? r.email}</p>
                <p className="text-xs text-muted-foreground">
                  {r.role.charAt(0) + r.role.slice(1).toLowerCase()} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <span className="text-xs font-medium text-green-600">Joined ✓</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
