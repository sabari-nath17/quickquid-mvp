"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function assignStandby(jobId: string, workerId: string) {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.$transaction([
      prisma.standbyAssignment.upsert({
        where: { jobId_workerId: { jobId, workerId } },
        update: { isActive: true },
        create: { jobId, workerId },
      }),
      prisma.workerProfile.update({
        where: { id: workerId },
        data: {
          isOnStandby: true,
          standbyStatus: "AVAILABLE",
        },
      }),
    ]);

    revalidatePath("/admin/standby");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to assign standby worker" };
  }
}

export async function triggerReplacement(jobId: string) {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const assignment = await prisma.standbyAssignment.findFirst({
    where: {
      jobId,
      isActive: true,
      worker: { standbyStatus: "AVAILABLE" },
    },
    include: {
      worker: { include: { user: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!assignment) {
    return { error: "No standby workers available" };
  }

  return {
    worker: {
      name: assignment.worker.user.name ?? assignment.worker.user.email,
      fillRate: assignment.worker.fillRate,
    },
  };
}
