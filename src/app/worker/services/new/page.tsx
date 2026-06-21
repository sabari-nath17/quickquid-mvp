import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PackageForm } from "./package-form";

export default async function NewServicePackagePage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) redirect("/worker/onboarding");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/worker/services"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to My Services
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">New Service Package</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Package your skills as a product</h1>
        <p className="text-muted-foreground mt-2">
          Clients order directly from a clean catalog — no bidding. Offer up to three tiers.
        </p>
      </div>

      {!worker.isVerified && (
        <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
          Your profile must be verified before a package goes live. You can draft it now — it&apos;ll publish once you&apos;re verified.
        </div>
      )}

      <PackageForm />
    </div>
  );
}
