"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

interface Question {
  id: string;
  type: "mcq" | "text";
  correct?: number;
}

export async function submitSandboxAnswers(
  workerId: string,
  challengeId: string,
  answers: Record<string, string>
): Promise<{ score: number; error?: string }> {
  const challenge = await prisma.sandboxChallenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) return { score: 0, error: "Challenge not found." };

  const questions = challenge.questions as unknown as Question[];
  let earned = 0;
  let maxPossible = 0;

  for (const q of questions) {
    if (q.type === "mcq") {
      maxPossible += 20;
      const submitted = parseInt(answers[q.id] ?? "-1", 10);
      if (submitted === q.correct) earned += 20;
    } else {
      maxPossible += 10;
      if (answers[q.id]?.trim().length > 10) earned += 10;
    }
  }

  const score = maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 0;

  // Upsert submission
  await prisma.sandboxSubmission.upsert({
    where: { workerId_challengeId: { workerId, challengeId } },
    update: { answers, score, gradedAt: new Date() },
    create: { workerId, challengeId, answers, score, gradedAt: new Date() },
  });

  // Update sandbox score on profile (take the best score across all submissions)
  const allSubmissions = await prisma.sandboxSubmission.findMany({
    where: { workerId },
    select: { score: true },
  });
  const bestScore = Math.max(...allSubmissions.map((s) => s.score ?? 0));

  const profile = await prisma.workerProfile.findUnique({ where: { id: workerId } });
  const currentBadges = (profile?.verificationBadges ?? []) as string[];
  const newBadges =
    bestScore >= 70 && !currentBadges.includes("SKILL_VERIFIED")
      ? [...currentBadges, "SKILL_VERIFIED"]
      : currentBadges;

  await prisma.workerProfile.update({
    where: { id: workerId },
    data: {
      sandboxScore: bestScore,
      verificationBadges: newBadges as never,
    },
  });

  revalidatePath("/worker/sandbox");
  revalidatePath("/worker/dashboard");

  return { score };
}
