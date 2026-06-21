"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { servicePackageSchema, serviceOrderSchema } from "@/lib/validations";

const FAST_TRACK_RATE = 0.25; // +25% of tier price for fast-track delivery

export async function createServicePackage(data: {
  title: string;
  description: string;
  category: string;
  skills: string[];
  coverImageUrl?: string;
  tiers: Array<{
    name: "BASIC" | "STANDARD" | "PREMIUM";
    price: number;
    deliveryDays: number;
    revisions: number;
    description?: string;
    features: string[];
  }>;
}) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Only workers can create service packages" };

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) return { error: "Complete your worker profile first" };
  if (!worker.isVerified) {
    return { error: "Your profile must be verified before you can publish a service package" };
  }

  const parsed = servicePackageSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // tier names must be unique within a package
  const names = parsed.data.tiers.map((t) => t.name);
  if (new Set(names).size !== names.length) {
    return { error: "Each pricing tier (Basic/Standard/Premium) can only be used once" };
  }

  const pkg = await prisma.servicePackage.create({
    data: {
      workerId: worker.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      skills: parsed.data.skills,
      coverImageUrl: parsed.data.coverImageUrl || null,
      tiers: {
        create: parsed.data.tiers.map((t) => ({
          name: t.name,
          price: t.price,
          deliveryDays: t.deliveryDays,
          revisions: t.revisions,
          description: t.description ?? null,
          features: t.features,
        })),
      },
    },
  });

  revalidatePath("/worker/services");
  revalidatePath("/client/catalog");
  return { success: true, packageId: pkg.id };
}

export async function togglePackageActive(packageId: string) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Not authorized" };

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) return { error: "Profile not found" };

  const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
  if (!pkg || pkg.workerId !== worker.id) return { error: "Not your package" };

  await prisma.servicePackage.update({
    where: { id: packageId },
    data: { isActive: !pkg.isActive },
  });

  revalidatePath("/worker/services");
  revalidatePath("/client/catalog");
  return { success: true };
}

export async function placeOrder(
  packageId: string,
  data: { tierId: string; fastTrack: boolean; requirements?: string }
) {
  const session = await requireAuth();
  if (session.role !== "CLIENT") return { error: "Only clients can place orders" };

  const parsed = serviceOrderSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const pkg = await prisma.servicePackage.findUnique({
    where: { id: packageId },
    include: { tiers: true },
  });
  if (!pkg || !pkg.isActive) return { error: "Package not found or no longer available" };

  const tier = pkg.tiers.find((t) => t.id === parsed.data.tierId);
  if (!tier) return { error: "Selected tier not found" };

  const fastTrackFee = parsed.data.fastTrack ? Math.round(tier.price * FAST_TRACK_RATE) : 0;

  const order = await prisma.serviceOrder.create({
    data: {
      packageId: pkg.id,
      tierId: tier.id,
      clientId: session.id,
      workerId: pkg.workerId,
      fastTrack: parsed.data.fastTrack,
      fastTrackFee,
      requirements: parsed.data.requirements ?? null,
    },
  });

  revalidatePath("/client/orders");
  revalidatePath("/worker/services");
  return { success: true, orderId: order.id };
}

export async function respondToOrder(orderId: string, accept: boolean) {
  const session = await requireAuth();
  if (session.role !== "WORKER") return { error: "Only the worker can respond to an order" };

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!worker) return { error: "Profile not found" };

  const order = await prisma.serviceOrder.findUnique({
    where: { id: orderId },
    include: { package: true, tier: true },
  });
  if (!order || order.workerId !== worker.id) return { error: "Not your order" };
  if (order.status !== "PENDING") return { error: "This order has already been responded to" };

  if (!accept) {
    await prisma.serviceOrder.update({
      where: { id: orderId },
      data: { status: "DECLINED" },
    });
    revalidatePath("/worker/services");
    revalidatePath("/client/orders");
    return { success: true };
  }

  // Accept → synthesize a job requirement + connection + initial milestone so the order
  // flows into the exact same contract/chat/milestone/review machinery as a normal hire.
  const total = order.tier.price + order.fastTrackFee;
  const deliveryDays = order.fastTrack
    ? Math.max(1, Math.ceil(order.tier.deliveryDays / 2))
    : order.tier.deliveryDays;
  const dueDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);

  const connectionId = await prisma.$transaction(async (tx) => {
    const job = await tx.jobRequirement.create({
      data: {
        userId: order.clientId,
        title: order.package.title,
        description: order.requirements
          ? `${order.package.description}\n\nClient requirements: ${order.requirements}`
          : order.package.description,
        skills: order.package.skills,
        budget: `₹${total.toLocaleString("en-IN")}`,
        budgetMin: total,
        budgetMax: total,
        timeline: `${deliveryDays} day${deliveryDays !== 1 ? "s" : ""}`,
        isSynthetic: true,
      },
    });

    const connection = await tx.matchmakingConnection.create({
      data: {
        workerId: order.workerId,
        jobId: job.id,
        isAnonymous: false,
        introducedAt: new Date(),
        connectionStatus: "IN_PROGRESS",
        contractStartDate: new Date(),
      },
    });

    await tx.milestone.create({
      data: {
        connectionId: connection.id,
        title: `${order.tier.name.charAt(0) + order.tier.name.slice(1).toLowerCase()} package delivery`,
        description: order.fastTrack ? "Fast-track delivery selected." : null,
        amount: total,
        status: "IN_PROGRESS",
        dueDate,
      },
    });

    await tx.serviceOrder.update({
      where: { id: orderId },
      data: { status: "IN_PROGRESS", connectionId: connection.id },
    });

    return connection.id;
  });

  revalidatePath("/worker/services");
  revalidatePath("/client/orders");
  return { success: true, connectionId };
}
