import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { OfferForm } from "./offer-form";

export default async function SendOfferPage({
  params,
}: {
  params: Promise<{ jobId: string; applicationId: string }>;
}) {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "CLIENT") redirect("/");

  const { jobId, applicationId } = await params;

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      job: { select: { title: true, userId: true } },
      worker: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!application || application.jobId !== jobId || application.job.userId !== session.id) {
    redirect("/client/dashboard");
  }
  if (!application.worker.isVerified) {
    redirect(`/client/jobs/${jobId}/applicants`);
  }

  const workerName = application.worker.user.name ?? application.worker.user.email;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/client/jobs/${jobId}/applicants`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to applicants
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Send className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Send Offer</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Hire {workerName}</h1>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-muted-foreground">For: {application.job.title}</p>
          {application.worker.isVerified && (
            <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200 gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />Verified
            </Badge>
          )}
        </div>
      </div>

      <OfferForm
        applicationId={application.id}
        defaultTitle={application.job.title}
        defaultRate={application.rateType}
        proposed={{ rate: application.proposedRate, rateType: application.rateType }}
      />
    </div>
  );
}
