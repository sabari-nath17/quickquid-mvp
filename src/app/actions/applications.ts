"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobApplicationSchema } from "@/lib/validations";

export async function applyToJob(jobId: string, coverLetter: string) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Only workers can apply to jobs" };

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
  });
  if (!worker) return { error: "Complete your worker profile before applying" };
  if (!worker.isVerified) return { error: "Your profile must be verified before you can apply to jobs" };

  const job = await prisma.jobRequirement.findUnique({
    where: { id: jobId },
  });
  if (!job) return { error: "Job not found" };

  const matchingSkills = job.skills.filter((s) =>
    worker.skills.map((ws) => ws.toLowerCase()).includes(s.toLowerCase())
  );
  if (matchingSkills.length === 0) {
    return { error: "You must match at least one required skill to apply" };
  }

  const existing = await prisma.jobApplication.findUnique({
    where: { jobId_workerId: { jobId, workerId: worker.id } },
  });
  if (existing) return { error: "You have already applied to this job" };

  const parsed = jobApplicationSchema.safeParse({ coverLetter: coverLetter || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.jobApplication.create({
    data: {
      jobId,
      workerId: worker.id,
      coverLetter: parsed.data.coverLetter ?? null,
    },
  });

  revalidatePath("/worker/applications");
  revalidatePath("/worker/jobs");
  return { success: true };
}

export async function reviewApplication(applicationId: string, status: "SHORTLISTED" | "REJECTED") {
  const session = await requireAuth();
  if (session.role !== "CLIENT" && session.role !== "ADMIN") return { error: "Not authorized" };

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!application) return { error: "Application not found" };
  if (session.role === "CLIENT" && application.job.userId !== session.id) {
    return { error: "Not your job" };
  }

  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status },
  });

  revalidatePath(`/client/jobs/${application.jobId}/applicants`);
  revalidatePath(`/admin/applications`);
  return { success: true };
}

export async function hireApplicant(applicationId: string) {
  const session = await requireAuth();
  if (session.role !== "CLIENT" && session.role !== "ADMIN") return { error: "Not authorized" };

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { job: true, worker: true },
  });
  if (!application) return { error: "Application not found" };
  if (session.role === "CLIENT" && application.job.userId !== session.id) {
    return { error: "Not your job" };
  }
  if (!application.worker.isVerified) {
    return { error: "This worker has not been verified yet" };
  }

  const existingConnection = await prisma.matchmakingConnection.findUnique({
    where: { workerId_jobId: { workerId: application.workerId, jobId: application.jobId } },
  });

  let connectionId: string;
  if (existingConnection) {
    connectionId = existingConnection.id;
    if (!existingConnection.introducedAt) {
      await prisma.matchmakingConnection.update({
        where: { id: existingConnection.id },
        data: { introducedAt: new Date(), isAnonymous: false },
      });
    }
  } else {
    const conn = await prisma.matchmakingConnection.create({
      data: {
        workerId: application.workerId,
        jobId: application.jobId,
        isAnonymous: false,
        introducedAt: new Date(),
        connectionStatus: "IN_PROGRESS",
        contractStartDate: new Date(),
      },
    });
    connectionId = conn.id;
  }

  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status: "HIRED" },
  });

  revalidatePath(`/client/jobs/${application.jobId}/applicants`);
  revalidatePath(`/client/dashboard`);
  revalidatePath(`/worker/applications`);
  return { success: true, connectionId };
}

export async function applyToSubJob(subJobId: string, coverLetter: string) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Only workers can apply" };

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) return { error: "Complete your worker profile first" };

  const subJob = await prisma.subJob.findUnique({ where: { id: subJobId } });
  if (!subJob || !subJob.isPublic) return { error: "Sub-job not found or not open" };

  const existing = await prisma.subJobApplication.findUnique({
    where: { subJobId_workerId: { subJobId, workerId: worker.id } },
  });
  if (existing) return { error: "You have already applied" };

  await prisma.subJobApplication.create({
    data: { subJobId, workerId: worker.id, coverLetter: coverLetter || null },
  });

  revalidatePath("/worker/network");
  return { success: true };
}

export async function reviewSubJobApplication(
  subJobApplicationId: string,
  status: "SHORTLISTED" | "REJECTED" | "HIRED"
) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Only the sub-job poster can review applications" };

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) return { error: "Profile not found" };

  const application = await prisma.subJobApplication.findUnique({
    where: { id: subJobApplicationId },
    include: { subJob: true },
  });
  if (!application || application.subJob.postedById !== worker.id) {
    return { error: "Not authorized" };
  }

  await prisma.subJobApplication.update({
    where: { id: subJobApplicationId },
    data: { status },
  });

  revalidatePath(`/worker/contract/${application.subJob.parentConnectionId}`);
  return { success: true };
}
