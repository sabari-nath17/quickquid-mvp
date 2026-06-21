import { prisma } from "@/lib/prisma";
import { TickerRotator } from "./ticker-rotator";

// Live trust-signal ticker — derives recent, privacy-safe platform activity to convey
// marketplace liquidity. No PII beyond first names / generic role words.

function firstName(name: string | null, email: string): string {
  if (name) return name.split(" ")[0];
  return email.split("@")[0];
}

export async function TrustTicker() {
  const [verifiedCount, recentVerified, recentOrders, recentReviews, recentConnections] =
    await Promise.all([
      prisma.workerProfile.count({ where: { isVerified: true } }),
      prisma.workerProfile.findMany({
        where: { isVerified: true },
        select: { user: { select: { name: true, email: true } }, skills: true },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.serviceOrder.findMany({
        select: { tier: { select: { name: true } }, package: { select: { category: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.review.findMany({
        select: { rating: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.matchmakingConnection.count({ where: { introducedAt: { not: null } } }),
    ]);

  const events: string[] = [];

  if (verifiedCount > 0) events.push(`${verifiedCount} freelancers verified and ready to hire`);
  if (recentConnections > 0) events.push(`${recentConnections} introductions made by our team`);

  for (const w of recentVerified) {
    const skill = w.skills[0] ?? "talent";
    events.push(`${firstName(w.user.name, w.user.email)} was just verified · ${skill}`);
  }
  for (const o of recentOrders) {
    const tier = o.tier.name.charAt(0) + o.tier.name.slice(1).toLowerCase();
    events.push(`New ${tier} order in ${o.package.category}`);
  }
  for (const r of recentReviews) {
    events.push(`New ${r.rating}-star review just posted ★`);
  }

  if (events.length === 0) {
    events.push("Human-verified talent, ready when you are");
  }

  return <TickerRotator events={events} />;
}
