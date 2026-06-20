"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deliverMilestone(milestoneId: string) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Not authorized" };

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { connection: { include: { worker: true } } },
  });
  if (!milestone) return { error: "Milestone not found" };
  if (milestone.connection.worker.userId !== session.id) return { error: "Not your milestone" };
  if (milestone.status !== "IN_PROGRESS") return { error: "Milestone is not in progress" };

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: "DELIVERED", workerConfirmedAt: new Date() },
  });

  revalidatePath(`/worker/dashboard`);
  revalidatePath(`/worker/contract/${milestone.connectionId}`);
  revalidatePath(`/client/contract/${milestone.connectionId}`);
  return { success: true };
}

export async function approveMilestone(milestoneId: string) {
  const session = await requireAuth();
  if (session.role !== "CLIENT") return { error: "Not authorized" };

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { connection: { include: { job: true } } },
  });
  if (!milestone) return { error: "Milestone not found" };
  if (milestone.connection.job.userId !== session.id) return { error: "Not your contract" };
  if (milestone.status !== "DELIVERED") return { error: "Milestone not yet delivered" };

  const platformFee = Math.round(milestone.amount * 0.08);

  await prisma.$transaction([
    prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: "APPROVED", clientConfirmedAt: new Date() },
    }),
    prisma.commissionLedger.create({
      data: {
        milestoneId,
        grossAmount: milestone.amount,
        platformFee,
        isPaid: false,
      },
    }),
  ]);

  revalidatePath(`/client/contract/${milestone.connectionId}`);
  return { success: true };
}

export async function addMilestone(connectionId: string, formData: FormData) {
  const session = await requireAuth();
  if (session.role !== "CLIENT") return { error: "Not authorized" };

  const connection = await prisma.matchmakingConnection.findUnique({
    where: { id: connectionId },
    include: { job: true },
  });
  if (!connection || connection.job.userId !== session.id) return { error: "Not your contract" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || undefined;
  const amountStr = formData.get("amount") as string;
  const dueDateStr = formData.get("dueDate") as string;

  if (!title) return { error: "Title is required" };
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) return { error: "Invalid amount" };

  await prisma.milestone.create({
    data: {
      connectionId,
      title,
      description,
      amount,
      status: "PENDING",
      dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
    },
  });

  revalidatePath(`/client/contract/${connectionId}`);
  return { success: true };
}

export async function startMilestone(milestoneId: string) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Not authorized" };

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { connection: { include: { worker: true } } },
  });
  if (!milestone) return { error: "Milestone not found" };
  if (milestone.connection.worker.userId !== session.id) return { error: "Not your milestone" };
  if (milestone.status !== "PENDING") return { error: "Milestone already started" };

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: "IN_PROGRESS" },
  });

  revalidatePath(`/client/contract/${milestone.connectionId}`);
  revalidatePath(`/worker/contract/${milestone.connectionId}`);
  revalidatePath(`/worker/dashboard`);
  return { success: true };
}
