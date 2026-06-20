import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Briefcase, ArrowRight, MapPin } from "lucide-react";

const geofenceBadge: Record<string, { label: string; className: string }> = {
  CORE: { label: "Core (0–2km)", className: "bg-blue-50 text-blue-700 border-blue-200" },
  TRANSIT: { label: "Transit (2–5km)", className: "bg-amber-50 text-amber-700 border-amber-200" },
  CLOUD: { label: "Remote", className: "bg-gray-50 text-gray-600 border-gray-200" },
};

export default async function AdminJobsPage() {
  await requireAdmin().catch(() => redirect("/sign-in"));

  const jobs = await prisma.jobRequirement.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { connections: true } },
      standbyAssignments: { where: { isActive: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading">Job Ingestion Stream</h1>
            <p className="text-muted-foreground text-sm mt-0.5">All client job postings — match workers from here.</p>
          </div>
        </div>
      </div>

      {/* Filter pills (static) */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["All", "CORE", "TRANSIT", "CLOUD"].map((f) => (
          <span
            key={f}
            className="px-3 py-1 rounded-full text-xs font-medium border border-border bg-white text-muted-foreground cursor-default"
          >
            {f === "CORE" ? "Core (0–2km)" : f === "TRANSIT" ? "Transit (2–5km)" : f === "CLOUD" ? "Remote" : "All"}
          </span>
        ))}
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No jobs posted yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const gf = geofenceBadge[job.geofenceRing] ?? geofenceBadge.CLOUD;
            return (
              <Card key={job.id} className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-foreground text-sm font-heading">{job.title}</p>
                        <Badge variant="outline" className={`text-[11px] gap-1 ${gf.className}`}>
                          <MapPin className="w-2.5 h-2.5" />
                          {gf.label}
                        </Badge>
                        {job._count.connections > 0 && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-[11px]">
                            {job._count.connections} match{job._count.connections !== 1 ? "es" : ""}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {job.user.name ?? job.user.email} ·{" "}
                        {job.budgetMin && job.budgetMax
                          ? `₹${job.budgetMin.toLocaleString()}–₹${job.budgetMax.toLocaleString()}`
                          : job.budget ?? "Budget TBD"}{" "}
                        · {job.timeline ?? "Timeline TBD"} ·{" "}
                        {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 5).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{job.skills.length - 5}</span>
                        )}
                      </div>
                    </div>
                    <Button asChild size="sm" className="shrink-0 gap-1.5">
                      <Link href="/admin/matchmaking">
                        Match Worker
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
