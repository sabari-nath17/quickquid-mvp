"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { workerApprovalSchema } from "@/lib/validations";

export async function approveOrRejectWorker(
  workerId: string,
  formData: FormData
) {
  const admin = await requireAdmin();

  const raw = {
    status: formData.get("status") as string,
    verificationNotes: (formData.get("verificationNotes") as string) || undefined,
  };

  const parsed = workerApprovalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const isApproving = parsed.data.status === "VERIFIED";

  // Fetch current badges to add KYC_VERIFIED on approval
  let badgeUpdate = {};
  if (isApproving) {
    const existing = await prisma.workerProfile.findUnique({
      where: { id: workerId },
      select: { verificationBadges: true },
    });
    const currentBadges = (existing?.verificationBadges ?? []) as string[];
    if (!currentBadges.includes("KYC_VERIFIED")) {
      badgeUpdate = { verificationBadges: [...currentBadges, "KYC_VERIFIED"] as never };
    }
  }

  await prisma.workerProfile.update({
    where: { id: workerId },
    data: {
      status: parsed.data.status,
      isVerified: isApproving,
      // Admin approval implies the identity + phone were checked during review.
      idVerified: isApproving,
      phoneVerified: isApproving,
      verificationNotes: parsed.data.verificationNotes ?? null,
      ...badgeUpdate,
    },
  });

  revalidatePath("/admin/triage");
  return { success: true };
}

export async function createMatch(workerId: string, jobId: string) {
  await requireAdmin();

  const existing = await prisma.matchmakingConnection.findUnique({
    where: { workerId_jobId: { workerId, jobId } },
  });

  if (existing) {
    return { error: "A connection between this worker and job already exists." };
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId },
  });
  if (!worker?.isVerified) {
    return { error: "Worker must be verified before matching." };
  }

  await prisma.matchmakingConnection.create({
    data: { workerId, jobId },
  });

  revalidatePath("/admin/matchmaking");
  return { success: true };
}

export async function introduceWorkerToClient(connectionId: string) {
  const admin = await requireAdmin();

  const connection = await prisma.matchmakingConnection.findUnique({
    where: { id: connectionId },
    include: {
      worker: { include: { user: true } },
      job: { include: { user: true } },
    },
  });

  if (!connection) {
    return { error: "Connection not found." };
  }

  if (connection.introducedAt) {
    return { error: "This worker has already been introduced to this client." };
  }

  await prisma.matchmakingConnection.update({
    where: { id: connectionId },
    data: {
      introducedAt: new Date(),
      introducedById: admin.id,
      isAnonymous: false,
      identityRevealedAt: new Date(),
      connectionStatus: "PENDING_CONTACT",
      contractStartDate: new Date(),
    },
  });

  revalidatePath("/admin/matchmaking");
  revalidatePath("/client/talent");
  revalidatePath("/client/board");
  revalidatePath("/client/dashboard");
  return { success: true };
}
