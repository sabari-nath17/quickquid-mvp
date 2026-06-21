"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "@/lib/auth";
import { signUpSchema, signInSchema } from "@/lib/validations";

export async function signUp(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as string,
  };
  const refCode = (formData.get("ref") as string)?.trim() || null;

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Campus-ambassador referral attribution
  let referredById: string | null = null;
  if (refCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: refCode },
      select: { id: true },
    });
    referredById = referrer?.id ?? null;
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, referredById },
  });

  await createSession(user.id);

  if (role === "WORKER") redirect("/worker/onboarding");
  if (role === "CLIENT") redirect("/client/dashboard");
  redirect("/");
}

export async function signIn(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);

  if (user.role === "WORKER") redirect("/worker/dashboard");
  if (user.role === "CLIENT") redirect("/client/dashboard");
  if (user.role === "ADMIN") redirect("/admin/dashboard");
  redirect("/");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
