"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validations";

export async function sendMessage(connectionId: string, content: string) {
  const session = await requireAuth();

  const parsed = messageSchema.safeParse({ content });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const connection = await prisma.matchmakingConnection.findUnique({
    where: { id: connectionId },
    include: { worker: true, job: true },
  });
  if (!connection) return { error: "Connection not found" };

  const isWorker = connection.worker.userId === session.id;
  const isClient = connection.job.userId === session.id;
  const isAdmin = session.role === "ADMIN";

  if (!isWorker && !isClient && !isAdmin) {
    return { error: "You are not part of this contract" };
  }

  await prisma.message.create({
    data: {
      connectionId,
      senderId: session.id,
      content: parsed.data.content,
    },
  });

  revalidatePath(`/messages/${connectionId}`);
  return { success: true };
}
