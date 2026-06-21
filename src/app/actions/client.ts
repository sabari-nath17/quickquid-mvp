"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jobRequirementSchema } from "@/lib/validations";

export async function submitJobRequirement(formData: FormData) {
  const session = await requireAuth();

  if (session.role !== "CLIENT") {
    return { error: "Only clients can post job requirements." };
  }

  const skillsRaw = formData.get("skills") as string;
  const niceToHaveRaw = formData.get("niceToHaveSkills") as string;
  const durationRaw = (formData.get("durationType") as string) || "";

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    skills: skillsRaw
      ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    niceToHaveSkills: niceToHaveRaw
      ? niceToHaveRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    category: (formData.get("category") as string) || undefined,
    collarType: (formData.get("collarType") as string) || "WHITE",
    paymentType: (formData.get("paymentType") as string) || "FIXED",
    experienceLevel: (formData.get("experienceLevel") as string) || "INTERMEDIATE",
    projectType: (formData.get("projectType") as string) || "ONE_TIME",
    durationType: durationRaw || undefined,
    weeklyHours: (formData.get("weeklyHours") as string) || "TBD",
    freelancersNeeded: (formData.get("freelancersNeeded") as string) || "1",
    preferredQualifications: (formData.get("preferredQualifications") as string) || undefined,
    budgetMin: formData.get("budgetMin") as string,
    budgetMax: formData.get("budgetMax") as string,
    timeline: (formData.get("timeline") as string) || undefined,
  };

  const parsed = jobRequirementSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { budgetMin, budgetMax, ...rest } = parsed.data;

  await prisma.jobRequirement.create({
    data: {
      userId: session.id,
      ...rest,
      budgetMin,
      budgetMax,
      budget: `₹${budgetMin.toLocaleString("en-IN")}–₹${budgetMax.toLocaleString("en-IN")}`,
    },
  });

  revalidatePath("/client/dashboard");
  redirect("/client/dashboard");
}
