import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { SquadCard } from "@/components/shared/squad-card";
import { ArrowLeft, Users } from "lucide-react";

export default async function AdminSquadsPage() {
  await requireAdmin().catch(() => redirect("/sign-in"));

  const squads = await prisma.squad.findMany({
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
    orderBy: { sharedReputationScore: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-3xl font-bold text-foreground font-heading">Squads</h1>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          {squads.length} total
        </Badge>
      </div>

      {squads.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No squads formed yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {squads.map((squad) => (
            <SquadCard key={squad.id} squad={squad} />
          ))}
        </div>
      )}
    </div>
  );
}
