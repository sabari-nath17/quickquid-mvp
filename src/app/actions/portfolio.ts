"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { portfolioProjectSchema } from "@/lib/validations";

export async function createPortfolioProject(data: {
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  role?: string;
  skills: string[];
}) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Only workers can add portfolio projects" };

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) return { error: "Complete your worker profile first" };

  const parsed = portfolioProjectSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.portfolioProject.create({
    data: {
      workerId: worker.id,
      title: parsed.data.title,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
      projectUrl: parsed.data.projectUrl || null,
      role: parsed.data.role ?? null,
      skills: parsed.data.skills,
    },
  });

  revalidatePath("/worker/portfolio");
  revalidatePath(`/worker/profile/${worker.id}`);
  return { success: true };
}

export async function deletePortfolioProject(projectId: string) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Not authorized" };

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) return { error: "Profile not found" };

  const project = await prisma.portfolioProject.findUnique({ where: { id: projectId } });
  if (!project || project.workerId !== worker.id) return { error: "Not your project" };

  await prisma.portfolioProject.delete({ where: { id: projectId } });

  revalidatePath("/worker/portfolio");
  revalidatePath(`/worker/profile/${worker.id}`);
  return { success: true };
}
