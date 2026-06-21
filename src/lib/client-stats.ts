import { prisma } from "@/lib/prisma";

export interface ClientStats {
  jobsPosted: number;
  openJobs: number;
  totalHires: number;
  activeHires: number;
  hireRate: number; // 0-100
  totalSpent: number;
  avgClientRating: number | null;
}

// Aggregate trust signals for a client (the "About the client" panel on Upwork).
export async function getClientStats(userId: string): Promise<ClientStats> {
  const jobs = await prisma.jobRequirement.findMany({
    where: { userId },
    select: {
      isSynthetic: true,
      connections: {
        select: {
          introducedAt: true,
          connectionStatus: true,
          milestones: { select: { amount: true, status: true } },
          review: { select: { rating: true } },
        },
      },
    },
  });

  const realJobs = jobs.filter((j) => !j.isSynthetic);
  const allConns = jobs.flatMap((j) => j.connections);
  const introduced = allConns.filter((c) => c.introducedAt);
  const active = allConns.filter((c) => c.connectionStatus === "IN_PROGRESS");
  const jobsWithHire = realJobs.filter((j) => j.connections.some((c) => c.introducedAt));
  const openJobs = realJobs.filter((j) => !j.connections.some((c) => c.introducedAt)).length;

  const totalSpent = allConns
    .flatMap((c) => c.milestones)
    .filter((m) => m.status === "APPROVED")
    .reduce((s, m) => s + m.amount, 0);

  const ratings = allConns.map((c) => c.review?.rating).filter((r): r is number => typeof r === "number");
  const avgClientRating = ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : null;

  return {
    jobsPosted: realJobs.length,
    openJobs,
    totalHires: introduced.length,
    activeHires: active.length,
    hireRate: realJobs.length ? Math.round((jobsWithHire.length / realJobs.length) * 100) : 0,
    totalSpent,
    avgClientRating,
  };
}

export function compactMoney(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export const JOB_LABELS = {
  weeklyHours: {
    LESS_THAN_30: "Less than 30 hrs/week",
    THIRTY_PLUS: "More than 30 hrs/week",
    TBD: "To be determined",
  } as Record<string, string>,
  durationType: {
    LESS_THAN_1_MONTH: "Less than 1 month",
    ONE_TO_3_MONTHS: "1 to 3 months",
    THREE_TO_6_MONTHS: "3 to 6 months",
    MORE_THAN_6_MONTHS: "More than 6 months",
  } as Record<string, string>,
  projectType: {
    ONE_TIME: "One-time project",
    ONGOING: "Ongoing project",
  } as Record<string, string>,
  experienceLevel: {
    ENTRY: "Entry level",
    INTERMEDIATE: "Intermediate",
    EXPERT: "Expert",
  } as Record<string, string>,
};

export function formatPay(job: {
  paymentType: string;
  budgetMin: number | null;
  budgetMax: number | null;
}): string {
  const lo = job.budgetMin ?? 0;
  const hi = job.budgetMax ?? 0;
  const range = lo === hi ? `₹${lo.toLocaleString("en-IN")}` : `₹${lo.toLocaleString("en-IN")}–₹${hi.toLocaleString("en-IN")}`;
  return job.paymentType === "HOURLY" ? `${range}/hr` : `${range} fixed`;
}

export function timeAgo(date: Date): string {
  const ms = Date.now() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}
