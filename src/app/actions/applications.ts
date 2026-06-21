"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobApplicationSchema } from "@/lib/validations";

export async function applyToJob(
  jobId: string,
  data: {
    coverLetter?: string;
    rateType?: "FIXED" | "HOURLY";
    proposedRate?: number;
    estimatedDays?: number;
    availabilityHours?: number;
    attachmentIds?: string[];
  }
) {
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

  const parsed = jobApplicationSchema.safeParse({
    coverLetter: data.coverLetter || undefined,
    rateType: data.rateType ?? "FIXED",
    proposedRate: data.proposedRate,
    estimatedDays: data.estimatedDays,
    availabilityHours: data.availabilityHours,
    attachmentIds: data.attachmentIds ?? [],
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Only attach portfolio projects the worker actually owns
  const ownedAttachments = parsed.data.attachmentIds.length
    ? await prisma.portfolioProject.findMany({
        where: { id: { in: parsed.data.attachmentIds }, workerId: worker.id },
        select: { id: true },
      })
    : [];

  await prisma.jobApplication.create({
    data: {
      jobId,
      workerId: worker.id,
      coverLetter: parsed.data.coverLetter ?? null,
      rateType: parsed.data.rateType,
      proposedRate: parsed.data.proposedRate ?? null,
      estimatedDays: parsed.data.estimatedDays ?? null,
      availabilityHours: parsed.data.availabilityHours ?? null,
      attachments: { connect: ownedAttachments.map((a) => ({ id: a.id })) },
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

export async function sendOffer(
  applicationId: string,
  data: {
    contractTitle: string;
    description?: string;
    rateType: "FIXED" | "HOURLY";
    fixedAmount?: number;
    hourlyRate?: number;
    weeklyLimit?: number;
    startDate?: string;
    agreed: boolean;
  }
) {
  const session = await requireAuth();
  if (session.role !== "CLIENT" && session.role !== "ADMIN") return { error: "Not authorized" };

  const { offerSchema } = await import("@/lib/validations");
  const parsed = offerSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const t = parsed.data;

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { job: true, worker: true },
  });
  if (!application) return { error: "Application not found" };
  if (session.role === "CLIENT" && application.job.userId !== session.id) return { error: "Not your job" };
  if (!application.worker.isVerified) return { error: "This worker has not been verified yet" };

  const initialAmount = t.rateType === "FIXED" ? t.fixedAmount! : t.hourlyRate! * t.weeklyLimit!;
  const start = t.startDate ? new Date(t.startDate) : new Date();

  const connectionId = await prisma.$transaction(async (tx) => {
    const existing = await tx.matchmakingConnection.findUnique({
      where: { workerId_jobId: { workerId: application.workerId, jobId: application.jobId } },
    });

    let connId: string;
    if (existing) {
      connId = existing.id;
      await tx.matchmakingConnection.update({
        where: { id: existing.id },
        data: {
          introducedAt: existing.introducedAt ?? new Date(),
          isAnonymous: false,
          connectionStatus: "IN_PROGRESS",
          contractStartDate: start,
          contractTitle: t.contractTitle,
          rateType: t.rateType,
          hourlyRate: t.rateType === "HOURLY" ? t.hourlyRate! : null,
          weeklyLimit: t.rateType === "HOURLY" ? t.weeklyLimit! : null,
        },
      });
    } else {
      const conn = await tx.matchmakingConnection.create({
        data: {
          workerId: application.workerId,
          jobId: application.jobId,
          isAnonymous: false,
          introducedAt: new Date(),
          connectionStatus: "IN_PROGRESS",
          contractStartDate: start,
          contractTitle: t.contractTitle,
          rateType: t.rateType,
          hourlyRate: t.rateType === "HOURLY" ? t.hourlyRate! : null,
          weeklyLimit: t.rateType === "HOURLY" ? t.weeklyLimit! : null,
        },
      });
      connId = conn.id;
    }

    await tx.milestone.create({
      data: {
        connectionId: connId,
        title: t.rateType === "HOURLY" ? "Week 1" : t.contractTitle,
        description: t.description ?? null,
        amount: initialAmount,
        status: "IN_PROGRESS",
      },
    });

    await tx.jobApplication.update({ where: { id: applicationId }, data: { status: "HIRED" } });
    return connId;
  });

  revalidatePath(`/client/jobs/${application.jobId}/applicants`);
  revalidatePath(`/client/dashboard`);
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
