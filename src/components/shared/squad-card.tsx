import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star } from "lucide-react";

type SquadRole = "LEAD" | "MEMBER" | "CONTRIBUTOR";

interface SquadMember {
  role: SquadRole;
  user: {
    name: string | null;
    email: string;
    workerProfile?: { skills: string[] } | null;
  };
}

interface SquadCardProps {
  squad: {
    id: string;
    name: string;
    description: string | null;
    sharedReputationScore: number;
    members: SquadMember[];
  };
  isLead?: boolean;
}

const roleLabel: Record<SquadRole, string> = {
  LEAD: "Lead",
  MEMBER: "Member",
  CONTRIBUTOR: "Contributor",
};

const roleColor: Record<SquadRole, string> = {
  LEAD: "bg-primary text-primary-foreground",
  MEMBER: "bg-muted-foreground/20 text-foreground",
  CONTRIBUTOR: "bg-muted text-muted-foreground",
};

export function SquadCard({ squad, isLead }: SquadCardProps) {
  const allSkills = Array.from(
    new Set(squad.members.flatMap((m) => m.user.workerProfile?.skills ?? []))
  );
  const visibleSkills = allSkills.slice(0, 6);
  const extraSkills = allSkills.length - visibleSkills.length;

  return (
    <Card className="border-border">
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground font-heading text-sm">
                  {squad.name}
                </h3>
                {isLead && (
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 px-1.5 py-0">
                    Lead
                  </Badge>
                )}
              </div>
              {squad.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {squad.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 shrink-0">
            <Star className="w-3 h-3 text-green-600 fill-current" />
            <span className="text-xs font-semibold text-green-700">
              {squad.sharedReputationScore.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Members */}
        <div className="flex items-center gap-1.5 mb-3">
          {squad.members.map((member, i) => {
            const name = member.user.name ?? member.user.email;
            const initials = name.slice(0, 2).toUpperCase();
            return (
              <div key={i} className="relative group">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${roleColor[member.role]}`}
                  title={`${name} — ${roleLabel[member.role]}`}
                >
                  {initials}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10">
                  <div className="bg-foreground text-background text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap">
                    {name} · {roleLabel[member.role]}
                  </div>
                </div>
              </div>
            );
          })}
          <span className="text-xs text-muted-foreground ml-1">
            {squad.members.length} member{squad.members.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Skills */}
        {visibleSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {extraSkills > 0 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{extraSkills} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
