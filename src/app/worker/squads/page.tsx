import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { SquadCard } from "@/components/shared/squad-card";
import { InviteForm } from "./invite-form";
import { Plus, Users } from "lucide-react";

const memberInclude = {
  include: {
    members: {
      include: {
        user: {
          select: {
            name: true,
            email: true,
            workerProfile: { select: { skills: true } },
          },
        },
      },
    },
  },
} as const;

export default async function WorkerSquadsPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const myMemberships = await prisma.squadMembership.findMany({
    where: { userId: session.id },
    include: {
      squad: memberInclude,
    },
  });

  const mySquadIds = myMemberships.map((m) => m.squad.id);

  const otherSquads = await prisma.squad.findMany({
    where: mySquadIds.length > 0 ? { id: { notIn: mySquadIds } } : {},
    ...memberInclude,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Squads</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            My Squads
          </h1>
          <p className="text-muted-foreground mt-1">
            Form cross-functional teams and bid on enterprise briefs together.
          </p>
        </div>
        <Button asChild size="sm" className="gap-2 shrink-0">
          <Link href="/worker/squads/new">
            <Plus className="w-4 h-4" />
            Create Squad
          </Link>
        </Button>
      </div>

      {/* My Squads */}
      {myMemberships.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-primary/60" />
          </div>
          <h3 className="font-semibold text-foreground font-heading mb-2">
            Not in any squad yet
          </h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-sm">
            Create your own squad or wait to be invited by a lead.
          </p>
          <Button asChild size="sm">
            <Link href="/worker/squads/new">Create a Squad</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {myMemberships.map((membership) => {
            const isLead = membership.role === "LEAD";
            return (
              <div key={membership.squad.id}>
                <SquadCard squad={membership.squad} isLead={isLead} />
                {isLead && (
                  <div className="mt-2 px-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      Invite a verified worker by email:
                    </p>
                    <InviteForm squadId={membership.squad.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Discover */}
      {otherSquads.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground font-heading mb-4">
            Discover Squads
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {otherSquads.map((squad) => (
              <SquadCard key={squad.id} squad={squad} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
