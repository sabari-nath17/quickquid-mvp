"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createSquad(formData: FormData) {
  const session = await requireAuth().catch(() => null);
  if (!session || session.role !== "WORKER") {
    return { error: "You must be a verified worker to create a squad." };
  }

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
  });
  if (!profile || profile.status !== "VERIFIED") {
    return { error: "Only verified workers can create squads." };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { error: "Squad name is required." };

  const squad = await prisma.squad.create({
    data: {
      name,
      description,
      members: {
        create: { userId: session.id, role: "LEAD" },
      },
    },
  });

  redirect("/worker/squads");
}

export async function inviteToSquad(
  squadId: string,
  inviteeEmail: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireAuth().catch(() => null);
  if (!session || session.role !== "WORKER") {
    return { error: "Unauthorized." };
  }

  const membership = await prisma.squadMembership.findUnique({
    where: { squadId_userId: { squadId, userId: session.id } },
  });
  if (!membership || membership.role !== "LEAD") {
    return { error: "Only the squad lead can invite members." };
  }

  const invitee = await prisma.user.findUnique({
    where: { email: inviteeEmail },
    include: { workerProfile: true },
  });
  if (!invitee || invitee.role !== "WORKER") {
    return { error: "No worker found with that email." };
  }
  if (!invitee.workerProfile || invitee.workerProfile.status !== "VERIFIED") {
    return { error: "That worker is not yet verified." };
  }

  const existing = await prisma.squadMembership.findUnique({
    where: { squadId_userId: { squadId, userId: invitee.id } },
  });
  if (existing) return { error: "That worker is already in this squad." };

  await prisma.squadMembership.create({
    data: { squadId, userId: invitee.id, role: "MEMBER" },
  });

  return { success: true };
}
