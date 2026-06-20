import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Sparkles } from "lucide-react";
import { WorkerForm } from "./worker-form";

export default async function WorkerOnboardingPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Worker Onboarding</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">
          {profile ? "Update your profile" : "Complete your profile"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Your profile will be reviewed by our admin team before you can be
          matched with clients. Please provide accurate, professional information.
        </p>
        {profile && (
          <div className="mt-3">
            {profile.status === "PENDING" && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                Pending Review
              </Badge>
            )}
            {profile.status === "VERIFIED" && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                ✓ Verified
              </Badge>
            )}
            {profile.status === "REJECTED" && (
              <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                Rejected — please update and resubmit
              </Badge>
            )}
            {profile.verificationNotes && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-muted rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Admin note:</span>{" "}
                  <span className="text-muted-foreground">{profile.verificationNotes}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <WorkerForm
        existing={
          profile
            ? {
                linkedinUrl: profile.linkedinUrl,
                portfolioUrls: profile.portfolioUrls,
                skills: profile.skills,
                bio: profile.bio,
                experienceText: profile.experienceText,
                avatarUrl: profile.avatarUrl,
                title: profile.title,
                hourlyRate: profile.hourlyRate,
              }
            : null
        }
      />
    </div>
  );
}
