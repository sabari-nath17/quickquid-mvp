import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BadgeCheck } from "lucide-react";
import { CredentialsManager } from "./credentials-manager";

export default async function CredentialsPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
    include: {
      employmentHistory: { orderBy: { startDate: "desc" } },
      education: { orderBy: { endYear: "desc" } },
      certifications: { orderBy: { createdAt: "desc" } },
      languages: { orderBy: { name: "asc" } },
    },
  });
  if (!worker) redirect("/worker/onboarding");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BadgeCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Credentials</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Experience &amp; Credentials</h1>
        <p className="text-muted-foreground mt-1">
          Add your work history, education, certifications, and languages — they appear on your public profile.
        </p>
        <Link href={`/worker/profile/${worker.id}`} className="text-sm text-primary hover:underline mt-2 inline-block">
          View public profile →
        </Link>
      </div>

      <CredentialsManager
        employment={worker.employmentHistory.map((e) => ({
          id: e.id, title: e.title, company: e.company,
          startDate: e.startDate.toISOString(), endDate: e.endDate?.toISOString() ?? null,
          isCurrent: e.isCurrent, description: e.description,
        }))}
        education={worker.education.map((e) => ({
          id: e.id, institution: e.institution, degree: e.degree, fieldOfStudy: e.fieldOfStudy,
          startYear: e.startYear, endYear: e.endYear,
        }))}
        certifications={worker.certifications.map((c) => ({
          id: c.id, name: c.name, provider: c.provider, issueYear: c.issueYear, credentialUrl: c.credentialUrl,
        }))}
        languages={worker.languages.map((l) => ({ id: l.id, name: l.name, proficiency: l.proficiency }))}
      />
    </div>
  );
}
