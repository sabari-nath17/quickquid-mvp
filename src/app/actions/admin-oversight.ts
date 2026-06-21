"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function suspendUser(userId: string, suspend: boolean) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { error: "Not authorized" };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return { error: "User not found" };
  if (user.role === "ADMIN") return { error: "Admin accounts cannot be suspended" };

  await prisma.user.update({ where: { id: userId }, data: { isSuspended: suspend } });

  revalidatePath("/admin/oversight");
  return { success: true };
}

export async function adminSetPackageVisibility(packageId: string, isActive: boolean) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { error: "Not authorized" };

  const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
  if (!pkg) return { error: "Package not found" };

  await prisma.servicePackage.update({ where: { id: packageId }, data: { isActive } });

  revalidatePath("/admin/oversight");
  revalidatePath("/client/catalog");
  return { success: true };
}

export async function adminRemoveReview(reviewId: string) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { error: "Not authorized" };

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return { error: "Review not found" };

  await prisma.review.delete({ where: { id: reviewId } });

  revalidatePath("/admin/oversight");
  return { success: true };
}

export async function adminCancelOrder(orderId: string) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { error: "Not authorized" };

  const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found" };
  if (order.status === "COMPLETED") return { error: "Completed orders cannot be cancelled" };

  await prisma.serviceOrder.update({ where: { id: orderId }, data: { status: "CANCELLED" } });

  revalidatePath("/admin/oversight");
  revalidatePath("/client/orders");
  return { success: true };
}
