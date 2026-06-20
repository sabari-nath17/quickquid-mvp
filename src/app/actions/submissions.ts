"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workSubmissionSchema } from "@/lib/validations";

export async function submitWork(connectionId: string, data: {
  title: string;
  description?: string;
  fileUrl?: string;
  isPreview: boolean;
}) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Only workers can submit work" };

  const parsed = workSubmissionSchema.safeParse({
    ...data,
    fileUrl: data.fileUrl || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const connection = await prisma.matchmakingConnection.findUnique({
    where: { id: connectionId },
    include: { worker: true },
  });
  if (!connection) return { error: "Connection not found" };
  if (connection.worker.userId !== session.id) return { error: "Not your contract" };

  await prisma.workSubmission.create({
    data: {
      connectionId,
      workerId: connection.workerId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      fileUrl: parsed.data.fileUrl || null,
      isPreview: parsed.data.isPreview,
    },
  });

  revalidatePath(`/worker/contract/${connectionId}`);
  revalidatePath(`/client/contract/${connectionId}`);
  return { success: true };
}

export async function approveSubmission(submissionId: string) {
  const session = await requireAuth();
  if (session.role !== "CLIENT") return { error: "Only clients can approve submissions" };

  const submission = await prisma.workSubmission.findUnique({
    where: { id: submissionId },
    include: { connection: { include: { job: true } } },
  });
  if (!submission) return { error: "Submission not found" };
  if (submission.connection.job.userId !== session.id) return { error: "Not your contract" };

  await prisma.workSubmission.update({
    where: { id: submissionId },
    data: { isApproved: true },
  });

  revalidatePath(`/client/contract/${submission.connectionId}`);
  revalidatePath(`/worker/contract/${submission.connectionId}`);
  return { success: true };
}

export async function createSubJob(
  connectionId: string,
  data: { title: string; description: string; skills: string[]; budget?: string }
) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Only workers can post sub-jobs" };

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) return { error: "Profile not found" };

  const connection = await prisma.matchmakingConnection.findUnique({
    where: { id: connectionId },
  });
  if (!connection || connection.workerId !== worker.id) return { error: "Not your contract" };

  if (!data.title?.trim() || !data.description?.trim() || !data.skills?.length) {
    return { error: "Title, description, and at least one skill are required" };
  }

  const subJob = await prisma.subJob.create({
    data: {
      parentConnectionId: connectionId,
      postedById: worker.id,
      title: data.title.trim(),
      description: data.description.trim(),
      skills: data.skills,
      budget: data.budget || null,
      isPublic: true,
    },
  });

  revalidatePath(`/worker/contract/${connectionId}`);
  revalidatePath("/worker/network");
  return { success: true, subJobId: subJob.id };
}
