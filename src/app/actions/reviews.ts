"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function submitReview(
  connectionId: string,
  data: {
    rating: number;
    qualityRating?: number;
    communicationRating?: number;
    professionalismRating?: number;
    reliabilityRating?: number;
    flexibilityRating?: number;
    comment?: string;
  }
) {
  const session = await requireAuth();
  if (session.role !== "CLIENT") return { error: "Not authorized" };

  const parsed = reviewSchema.safeParse({ ...data, comment: data.comment || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const connection = await prisma.matchmakingConnection.findUnique({
    where: { id: connectionId },
    include: { job: true, review: true },
  });

  if (!connection || connection.job.userId !== session.id)
    return { error: "Connection not found" };
  if (!connection.introducedAt)
    return { error: "Worker has not been introduced yet" };
  if (connection.review)
    return { error: "You have already submitted a review" };

  await prisma.review.create({
    data: {
      connectionId,
      workerId: connection.workerId,
      clientId: session.id,
      rating: parsed.data.rating,
      qualityRating: parsed.data.qualityRating ?? null,
      communicationRating: parsed.data.communicationRating ?? null,
      professionalismRating: parsed.data.professionalismRating ?? null,
      reliabilityRating: parsed.data.reliabilityRating ?? null,
      flexibilityRating: parsed.data.flexibilityRating ?? null,
      comment: parsed.data.comment ?? null,
    },
  });

  revalidatePath(`/client/contract/${connectionId}`);
  revalidatePath(`/worker/dashboard`);
  return { success: true };
}
