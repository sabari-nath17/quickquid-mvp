"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { workerProfileSchema, workerProfileExtendedSchema } from "@/lib/validations";

export async function submitWorkerProfile(formData: FormData) {
  const session = await requireAuth();

  if (session.role !== "WORKER") {
    return { error: "Only workers can submit profiles." };
  }

  const portfolioRaw = formData.get("portfolioUrls") as string;
  const skillsRaw = formData.get("skills") as string;

  const raw = {
    linkedinUrl: formData.get("linkedinUrl") as string,
    portfolioUrls: portfolioRaw
      ? portfolioRaw.split("\n").map((u) => u.trim()).filter(Boolean)
      : [],
    skills: skillsRaw
      ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    bio: formData.get("bio") as string || undefined,
    experienceText: formData.get("experienceText") as string,
  };

  const parsed = workerProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const extRaw = {
    avatarUrl: (formData.get("avatarUrl") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
    hourlyRate: formData.get("hourlyRate") ? Number(formData.get("hourlyRate")) : undefined,
    location: (formData.get("location") as string) || undefined,
    timezone: (formData.get("timezone") as string) || undefined,
    availabilityStatus: (formData.get("availabilityStatus") as string) || "OPEN_TO_OFFERS",
    weeklyAvailability: (formData.get("weeklyAvailability") as string) || "AS_NEEDED",
    openToContractHire: formData.get("openToContractHire") === "on" || formData.get("openToContractHire") === "true",
    responseTime: (formData.get("responseTime") as string) || undefined,
  };
  const parsedExt = workerProfileExtendedSchema.safeParse(extRaw);
  if (!parsedExt.success) {
    return { error: parsedExt.error.issues[0].message };
  }

  const ext = parsedExt.data;
  const existing = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
  });

  if (existing) {
    await prisma.workerProfile.update({
      where: { userId: session.id },
      data: {
        ...parsed.data,
        avatarUrl: ext.avatarUrl || existing.avatarUrl,
        title: ext.title ?? existing.title,
        hourlyRate: ext.hourlyRate ?? existing.hourlyRate,
        location: ext.location ?? existing.location,
        timezone: ext.timezone ?? existing.timezone,
        availabilityStatus: ext.availabilityStatus,
        weeklyAvailability: ext.weeklyAvailability,
        openToContractHire: ext.openToContractHire,
        responseTime: ext.responseTime ?? existing.responseTime,
        status: "PENDING",
        isVerified: false,
        verificationNotes: null,
      },
    });
  } else {
    await prisma.workerProfile.create({
      data: {
        userId: session.id,
        ...parsed.data,
        avatarUrl: ext.avatarUrl || null,
        title: ext.title || null,
        hourlyRate: ext.hourlyRate ?? null,
        location: ext.location || null,
        timezone: ext.timezone || null,
        availabilityStatus: ext.availabilityStatus,
        weeklyAvailability: ext.weeklyAvailability,
        openToContractHire: ext.openToContractHire,
        responseTime: ext.responseTime || null,
      },
    });
  }

  revalidatePath("/worker/dashboard");
  redirect("/worker/dashboard");
}
