"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  employmentSchema,
  educationSchema,
  certificationSchema,
  languageSchema,
} from "@/lib/validations";

async function getWorker(userId: string) {
  return prisma.workerProfile.findUnique({ where: { userId } });
}

function refresh(workerId: string) {
  revalidatePath("/worker/credentials");
  revalidatePath(`/worker/profile/${workerId}`);
}

/* ---------- Employment ---------- */
export async function addEmployment(data: {
  title: string; company: string; startDate: string; endDate?: string; isCurrent: boolean; description?: string;
}) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Not authorized" };
  const worker = await getWorker(session.id);
  if (!worker) return { error: "Profile not found" };

  const parsed = employmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.employmentHistory.create({
    data: {
      workerId: worker.id,
      title: parsed.data.title,
      company: parsed.data.company,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.isCurrent || !parsed.data.endDate ? null : new Date(parsed.data.endDate),
      isCurrent: parsed.data.isCurrent,
      description: parsed.data.description ?? null,
    },
  });
  refresh(worker.id);
  return { success: true };
}

export async function deleteEmployment(id: string) {
  const session = await requireAuth();
  const worker = await getWorker(session.id);
  if (!worker) return { error: "Not authorized" };
  const row = await prisma.employmentHistory.findUnique({ where: { id } });
  if (!row || row.workerId !== worker.id) return { error: "Not your record" };
  await prisma.employmentHistory.delete({ where: { id } });
  refresh(worker.id);
  return { success: true };
}

/* ---------- Education ---------- */
export async function addEducation(data: {
  institution: string; degree?: string; fieldOfStudy?: string; startYear?: number; endYear?: number;
}) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Not authorized" };
  const worker = await getWorker(session.id);
  if (!worker) return { error: "Profile not found" };

  const parsed = educationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.education.create({
    data: {
      workerId: worker.id,
      institution: parsed.data.institution,
      degree: parsed.data.degree ?? null,
      fieldOfStudy: parsed.data.fieldOfStudy ?? null,
      startYear: parsed.data.startYear ?? null,
      endYear: parsed.data.endYear ?? null,
    },
  });
  refresh(worker.id);
  return { success: true };
}

export async function deleteEducation(id: string) {
  const session = await requireAuth();
  const worker = await getWorker(session.id);
  if (!worker) return { error: "Not authorized" };
  const row = await prisma.education.findUnique({ where: { id } });
  if (!row || row.workerId !== worker.id) return { error: "Not your record" };
  await prisma.education.delete({ where: { id } });
  refresh(worker.id);
  return { success: true };
}

/* ---------- Certifications ---------- */
export async function addCertification(data: {
  name: string; provider: string; issueYear?: number; credentialUrl?: string;
}) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Not authorized" };
  const worker = await getWorker(session.id);
  if (!worker) return { error: "Profile not found" };

  const parsed = certificationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.certification.create({
    data: {
      workerId: worker.id,
      name: parsed.data.name,
      provider: parsed.data.provider,
      issueYear: parsed.data.issueYear ?? null,
      credentialUrl: parsed.data.credentialUrl || null,
    },
  });
  refresh(worker.id);
  return { success: true };
}

export async function deleteCertification(id: string) {
  const session = await requireAuth();
  const worker = await getWorker(session.id);
  if (!worker) return { error: "Not authorized" };
  const row = await prisma.certification.findUnique({ where: { id } });
  if (!row || row.workerId !== worker.id) return { error: "Not your record" };
  await prisma.certification.delete({ where: { id } });
  refresh(worker.id);
  return { success: true };
}

/* ---------- Languages ---------- */
export async function addLanguage(data: { name: string; proficiency: string }) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Not authorized" };
  const worker = await getWorker(session.id);
  if (!worker) return { error: "Profile not found" };

  const parsed = languageSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.workerLanguage.findUnique({
    where: { workerId_name: { workerId: worker.id, name: parsed.data.name } },
  });
  if (existing) return { error: "You already added this language" };

  await prisma.workerLanguage.create({
    data: { workerId: worker.id, name: parsed.data.name, proficiency: parsed.data.proficiency },
  });
  refresh(worker.id);
  return { success: true };
}

export async function deleteLanguage(id: string) {
  const session = await requireAuth();
  const worker = await getWorker(session.id);
  if (!worker) return { error: "Not authorized" };
  const row = await prisma.workerLanguage.findUnique({ where: { id } });
  if (!row || row.workerId !== worker.id) return { error: "Not your record" };
  await prisma.workerLanguage.delete({ where: { id } });
  refresh(worker.id);
  return { success: true };
}
