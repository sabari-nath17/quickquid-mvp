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

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    skills: skillsRaw
      ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    collarType: (formData.get("collarType") as string) || "WHITE",
    budgetMin: formData.get("budgetMin") as string,
    budgetMax: formData.get("budgetMax") as string,
    timeline: (formData.get("timeline") as string) || undefined,
  };

  const parsed = jobRequirementSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { budgetMin, budgetMax, collarType, ...rest } = parsed.data;

  await prisma.jobRequirement.create({
    data: {
      userId: session.id,
      ...rest,
      collarType,
      budgetMin,
      budgetMax,
      budget: `₹${budgetMin.toLocaleString("en-IN")}–₹${budgetMax.toLocaleString("en-IN")}`,
    },
  });

  revalidatePath("/client/dashboard");
  redirect("/client/dashboard");
}
