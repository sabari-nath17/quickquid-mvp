import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, ArrowLeft } from "lucide-react";
import { JobForm } from "./job-form";

export default async function PostJobPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const pastJobs = await prisma.jobRequirement.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      connections: {
        where: { introducedAt: { not: null } },
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href="/client/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Job Requirement</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">
          Describe your needs
        </h1>
        <p className="text-muted-foreground mt-2">
          Tell us what you&apos;re looking for and our admin team will match you
          with the right verified talent.
        </p>
      </div>

      <JobForm />

      {/* Past jobs */}
      {pastJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-foreground font-heading mb-4">
            Your Previous Posts
          </h2>
          <div className="space-y-3">
            {pastJobs.map((job) => (
              <Card key={job.id} className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground text-sm">{job.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {job.connections.length > 0 && (
                      <Badge className="shrink-0 bg-green-100 text-green-700 border-green-200">
                        {job.connections.length} match{job.connections.length !== 1 ? "es" : ""}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
