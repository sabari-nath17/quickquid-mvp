import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Link2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default async function AdminDashboardPage() {
  await requireAdmin().catch(() => redirect("/sign-in"));

  const [
    pendingCount,
    verifiedCount,
    jobCount,
    connectionCount,
    introductionCount,
    recentPending,
  ] = await Promise.all([
    prisma.workerProfile.count({ where: { status: "PENDING" } }),
    prisma.workerProfile.count({ where: { status: "VERIFIED" } }),
    prisma.jobRequirement.count(),
    prisma.matchmakingConnection.count(),
    prisma.matchmakingConnection.count({ where: { introducedAt: { not: null } } }),
    prisma.workerProfile.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            Admin Hub
          </h1>
          <p className="text-muted-foreground text-sm">QuickQuid Matchmaking Control Center</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          {
            label: "Pending Review",
            value: pendingCount,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50",
            urgent: pendingCount > 0,
          },
          {
            label: "Verified Workers",
            value: verifiedCount,
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            label: "Active Jobs",
            value: jobCount,
            icon: Briefcase,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Total Matches",
            value: connectionCount,
            icon: Link2,
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
          {
            label: "Introductions",
            value: introductionCount,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
          },
        ].map(({ label, value, icon: Icon, color, bg, urgent }) => (
          <Card key={label} className={urgent ? "border-amber-300 bg-amber-50/30" : ""}>
            <CardContent className="pt-5 pb-4">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground font-heading">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Triage Queue
              {pendingCount > 0 && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-300 ml-auto">
                  {pendingCount} pending
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Review and approve new worker applications before they enter the talent pool.
            </p>
            {recentPending.length > 0 && (
              <div className="space-y-2 mb-4">
                {recentPending.map((worker) => (
                  <div key={worker.id} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-medium">
                      {(worker.user.name ?? "?")[0].toUpperCase()}
                    </div>
                    <span className="text-foreground truncate">{worker.user.name ?? worker.user.email}</span>
                  </div>
                ))}
              </div>
            )}
            <Button asChild className="gap-2 w-full sm:w-auto">
              <Link href="/admin/triage">
                Open Triage Queue
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              Matchmaking Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Match verified workers with client job requirements and make deliberate introductions.
            </p>
            <div className="flex gap-2 mb-4">
              <div className="text-center px-3 py-2 bg-muted rounded-lg flex-1">
                <p className="text-lg font-bold text-foreground font-heading">{connectionCount}</p>
                <p className="text-xs text-muted-foreground">Matches Created</p>
              </div>
              <div className="text-center px-3 py-2 bg-green-50 rounded-lg flex-1">
                <p className="text-lg font-bold text-foreground font-heading">{introductionCount}</p>
                <p className="text-xs text-muted-foreground">Introduced</p>
              </div>
            </div>
            <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
              <Link href="/admin/matchmaking">
                Open Matchmaking
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
