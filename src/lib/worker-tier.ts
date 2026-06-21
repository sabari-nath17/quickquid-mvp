// Seller tier ladder — advancement is gated on verified RELIABILITY (fill-rate, rating,
// completed contracts), never on raw earnings volume. This is the QuickQuid trust ladder.

export type WorkerTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface TierInputs {
  completedContracts: number;
  avgRating: number | null;
  fillRate: number;
}

interface TierDef {
  tier: WorkerTier;
  label: string;
  color: string; // tailwind classes for badge
  minCompleted: number;
  minFillRate: number;
  minRating: number; // 0 = no rating requirement
}

const LADDER: TierDef[] = [
  { tier: "BRONZE", label: "Bronze", color: "bg-amber-100 text-amber-800 border-amber-300", minCompleted: 0, minFillRate: 0, minRating: 0 },
  { tier: "SILVER", label: "Silver", color: "bg-slate-100 text-slate-700 border-slate-300", minCompleted: 3, minFillRate: 80, minRating: 3.5 },
  { tier: "GOLD", label: "Gold", color: "bg-yellow-100 text-yellow-800 border-yellow-300", minCompleted: 10, minFillRate: 90, minRating: 4.2 },
  { tier: "PLATINUM", label: "Platinum", color: "bg-violet-100 text-violet-700 border-violet-300", minCompleted: 25, minFillRate: 95, minRating: 4.6 },
];

function meets(def: TierDef, input: TierInputs): boolean {
  if (input.completedContracts < def.minCompleted) return false;
  if (input.fillRate < def.minFillRate) return false;
  if (def.minRating > 0 && (input.avgRating ?? 0) < def.minRating) return false;
  return true;
}

export interface TierResult {
  current: TierDef;
  next: TierDef | null;
  /** 0–100 progress toward the next tier, based on the limiting requirement */
  progress: number;
  /** human-readable list of what's still needed for the next tier */
  remaining: string[];
}

export function computeWorkerTier(input: TierInputs): TierResult {
  let currentIndex = 0;
  for (let i = LADDER.length - 1; i >= 0; i--) {
    if (meets(LADDER[i], input)) {
      currentIndex = i;
      break;
    }
  }

  const current = LADDER[currentIndex];
  const next = LADDER[currentIndex + 1] ?? null;

  if (!next) {
    return { current, next: null, progress: 100, remaining: [] };
  }

  const ratios: number[] = [
    next.minCompleted > 0 ? input.completedContracts / next.minCompleted : 1,
    next.minFillRate > 0 ? input.fillRate / next.minFillRate : 1,
    next.minRating > 0 ? (input.avgRating ?? 0) / next.minRating : 1,
  ];
  const progress = Math.max(0, Math.min(100, Math.round(Math.min(...ratios) * 100)));

  const remaining: string[] = [];
  if (input.completedContracts < next.minCompleted) {
    remaining.push(`${next.minCompleted - input.completedContracts} more completed contract(s)`);
  }
  if (input.fillRate < next.minFillRate) {
    remaining.push(`fill rate ≥ ${next.minFillRate}% (currently ${input.fillRate.toFixed(0)}%)`);
  }
  if (next.minRating > 0 && (input.avgRating ?? 0) < next.minRating) {
    remaining.push(`rating ≥ ${next.minRating} (currently ${(input.avgRating ?? 0).toFixed(1)})`);
  }

  return { current, next, progress, remaining };
}
