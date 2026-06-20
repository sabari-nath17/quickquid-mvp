import { ShieldCheck, Cpu, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type BadgeType = "KYC_VERIFIED" | "SKILL_VERIFIED" | "SQUAD_VOUCHED";

const BADGE_CONFIG: Record<BadgeType, { icon: React.ReactNode; label: string; className: string }> = {
  KYC_VERIFIED: {
    icon: <ShieldCheck className="w-3 h-3" />,
    label: "KYC Verified",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SKILL_VERIFIED: {
    icon: <Cpu className="w-3 h-3" />,
    label: "Skill Verified",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  SQUAD_VOUCHED: {
    icon: <Users className="w-3 h-3" />,
    label: "Squad Vouched",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

export function VerificationBadge({ badge }: { badge: BadgeType }) {
  const config = BADGE_CONFIG[badge];
  if (!config) return null;
  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 ${config.className}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}

export function VerificationBadges({ badges }: { badges: string[] }) {
  if (!badges?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <VerificationBadge key={b} badge={b as BadgeType} />
      ))}
    </div>
  );
}
