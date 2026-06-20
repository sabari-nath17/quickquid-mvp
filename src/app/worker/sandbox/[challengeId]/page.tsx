import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SandboxForm } from "./sandbox-form";

interface Props {
  params: Promise<{ challengeId: string }>;
}

export default async function ChallengePage({ params }: Props) {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const { challengeId } = await params;

  const [challenge, profile] = await Promise.all([
    prisma.sandboxChallenge.findUnique({ where: { id: challengeId } }),
    prisma.workerProfile.findUnique({ where: { userId: session.id } }),
  ]);

  if (!challenge || !profile) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <SandboxForm
        challenge={{
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          skillCategory: challenge.skillCategory,
          timeLimit: challenge.timeLimit,
          questions: challenge.questions as unknown as import("./sandbox-form").Question[],
        }}
        workerId={profile.id}
      />
    </div>
  );
}
