"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

const DEMO_EMAILS = ["jane@dev.com", "arjun@design.com", "priya@write.com", "kiran@mobile.com", "acme@company.com"];
const DEMO_IDS = {
  squad: "squad-kochi-001",
  challenges: ["challenge-react-001", "challenge-design-001", "challenge-content-001"],
  jobs: ["seed-job-001", "seed-job-002"],
  milestones: ["milestone-001", "milestone-002", "milestone-003"],
  offers: ["offer-001", "offer-002", "offer-003"],
  packages: ["seed-pkg-jane-001", "seed-pkg-arjun-001", "seed-pkg-priya-001"],
};

export async function seedDemoData(): Promise<{ success?: boolean; error?: string; message?: string }> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { error: "Not authorized" };

  const workerPass = await bcrypt.hash("worker123!", 12);
  const clientPass = await bcrypt.hash("client123!", 12);

  // Users
  const jane = await prisma.user.upsert({
    where: { email: "jane@dev.com" },
    update: {},
    create: { email: "jane@dev.com", name: "Jane Smith", password: workerPass, role: "WORKER" },
  });
  const arjun = await prisma.user.upsert({
    where: { email: "arjun@design.com" },
    update: {},
    create: { email: "arjun@design.com", name: "Arjun Nair", password: workerPass, role: "WORKER" },
  });
  const priya = await prisma.user.upsert({
    where: { email: "priya@write.com" },
    update: {},
    create: { email: "priya@write.com", name: "Priya Menon", password: workerPass, role: "WORKER" },
  });
  const kiran = await prisma.user.upsert({
    where: { email: "kiran@mobile.com" },
    update: {},
    create: { email: "kiran@mobile.com", name: "Kiran Dev", password: workerPass, role: "WORKER" },
  });
  const acme = await prisma.user.upsert({
    where: { email: "acme@company.com" },
    update: {},
    create: { email: "acme@company.com", name: "Acme Corp", password: clientPass, role: "CLIENT" },
  });

  // Worker profiles with tiers
  const janeProfile = await prisma.workerProfile.upsert({
    where: { userId: jane.id },
    update: {},
    create: {
      userId: jane.id,
      linkedinUrl: "https://linkedin.com/in/janesmith-dev",
      portfolioUrls: ["https://github.com/janesmith", "https://janesmith.dev"],
      skills: ["React", "TypeScript", "Node.js", "UI/UX", "Figma"],
      bio: "Full-stack developer with a focus on clean, fast React apps.",
      experienceText: "2 contracts at early-stage startups. Built SaaS dashboards, REST APIs, and mobile-first UIs.",
      isVerified: true, status: "VERIFIED",
      verificationBadges: ["KYC_VERIFIED", "SKILL_VERIFIED"],
      sandboxScore: 96, fillRate: 98.5, hoursTrained: 1200,
      standbyStatus: "AVAILABLE", tier: "PRO",
    },
  });
  const arjunProfile = await prisma.workerProfile.upsert({
    where: { userId: arjun.id },
    update: {},
    create: {
      userId: arjun.id,
      linkedinUrl: "https://linkedin.com/in/arjunnair",
      portfolioUrls: ["https://behance.net/arjun"],
      skills: ["UI/UX Design", "Figma", "Branding", "Illustration", "Webflow"],
      bio: "Product designer who makes complex things feel simple.",
      experienceText: "3 years freelancing in brand identity, product design, and motion graphics.",
      isVerified: true, status: "VERIFIED",
      verificationBadges: ["KYC_VERIFIED", "SKILL_VERIFIED"],
      sandboxScore: 91, fillRate: 100, hoursTrained: 900,
      standbyStatus: "AVAILABLE", tier: "ELITE",
    },
  });
  const priyaProfile = await prisma.workerProfile.upsert({
    where: { userId: priya.id },
    update: {},
    create: {
      userId: priya.id,
      linkedinUrl: "https://linkedin.com/in/priyamenon",
      portfolioUrls: ["https://medium.com/@priya"],
      skills: ["Content Writing", "SEO", "Copywriting", "Email Marketing", "Research"],
      bio: "Content strategist who turns ideas into words that convert.",
      experienceText: "5 years writing for SaaS, e-commerce, and B2B brands.",
      isVerified: true, status: "VERIFIED",
      verificationBadges: ["KYC_VERIFIED", "SQUAD_VOUCHED"],
      sandboxScore: 88, fillRate: 97.2, hoursTrained: 600,
      standbyStatus: "BUSY", tier: "PRO",
    },
  });
  await prisma.workerProfile.upsert({
    where: { userId: kiran.id },
    update: {},
    create: {
      userId: kiran.id,
      linkedinUrl: "https://linkedin.com/in/kirandev",
      portfolioUrls: ["https://github.com/kirandev"],
      skills: ["Flutter", "React Native", "iOS", "Android", "Firebase"],
      bio: "Mobile developer building cross-platform apps that feel native.",
      experienceText: "Published 4 apps on App Store and Play Store. Freelancing since 2022.",
      isVerified: false, status: "PENDING",
      verificationBadges: [], fillRate: 100, hoursTrained: 0,
      standbyStatus: "OFFLINE", tier: "BASIC",
    },
  });

  // Service packages (for the catalog demo)
  await prisma.servicePackage.upsert({
    where: { id: DEMO_IDS.packages[0] },
    update: {},
    create: {
      id: DEMO_IDS.packages[0],
      workerId: janeProfile.id,
      title: "Full-Stack React Dashboard",
      description: "Custom analytics dashboard with charts, filters, API integrations, and responsive design. Production-ready code with full handoff.",
      category: "Web Development",
      skills: ["React", "TypeScript", "Node.js", "REST APIs"],
      isActive: true,
      tiers: {
        create: [
          { name: "BASIC", price: 15000, deliveryDays: 7, revisions: 1, description: "Single-page dashboard", features: ["3 chart types", "Static data", "Mobile-responsive", "Source code"] },
          { name: "STANDARD", price: 35000, deliveryDays: 14, revisions: 2, description: "Multi-page with live data", features: ["8 chart types", "REST API integration", "Auth-protected routes", "Filters & search", "Deployment support"] },
          { name: "PREMIUM", price: 75000, deliveryDays: 30, revisions: 5, description: "Full-featured SaaS product", features: ["Unlimited charts", "Real-time updates", "Role-based access", "CSV/PDF export", "3 months support"] },
        ],
      },
    },
  });
  await prisma.servicePackage.upsert({
    where: { id: DEMO_IDS.packages[1] },
    update: {},
    create: {
      id: DEMO_IDS.packages[1],
      workerId: arjunProfile.id,
      title: "Brand Identity Design Package",
      description: "Complete brand identity from logo to social kit. Strategic, distinctive, and ready for digital and print.",
      category: "Design",
      skills: ["Branding", "Figma", "Illustration", "Webflow"],
      isActive: true,
      tiers: {
        create: [
          { name: "BASIC", price: 8000, deliveryDays: 5, revisions: 2, description: "Logo + colour palette", features: ["3 logo concepts", "Colour palette", "PNG & SVG files"] },
          { name: "STANDARD", price: 20000, deliveryDays: 10, revisions: 3, description: "Full brand kit", features: ["Logo + typography", "Business card", "Social media kit", "Brand guidelines PDF"] },
          { name: "PREMIUM", price: 45000, deliveryDays: 21, revisions: 5, description: "Complete brand system", features: ["Everything in Standard", "Pitch deck template", "Merchandise mockups", "Webflow landing page"] },
        ],
      },
    },
  });
  await prisma.servicePackage.upsert({
    where: { id: DEMO_IDS.packages[2] },
    update: {},
    create: {
      id: DEMO_IDS.packages[2],
      workerId: priyaProfile.id,
      title: "SEO Content Writing Service",
      description: "Research-backed, conversion-focused content that ranks. Every piece optimised for E-E-A-T and your target audience.",
      category: "Content Writing",
      skills: ["SEO", "Copywriting", "Research", "Email Marketing"],
      isActive: true,
      tiers: {
        create: [
          { name: "BASIC", price: 3000, deliveryDays: 3, revisions: 1, description: "1 SEO article (1000 words)", features: ["Keyword research", "1 article", "Meta description", "1 revision"] },
          { name: "STANDARD", price: 8000, deliveryDays: 7, revisions: 2, description: "4-article content pack", features: ["Content strategy", "4 articles (800–1200 words)", "Internal linking", "2 revisions each"] },
          { name: "PREMIUM", price: 20000, deliveryDays: 14, revisions: 3, description: "Full content marketing sprint", features: ["10 articles", "Email sequence (5 emails)", "Social media captions", "Monthly content calendar"] },
        ],
      },
    },
  });

  // Jobs
  const job1 = await prisma.jobRequirement.upsert({
    where: { id: DEMO_IDS.jobs[0] },
    update: {},
    create: {
      id: DEMO_IDS.jobs[0],
      userId: acme.id,
      title: "React Developer for Marketing Dashboard",
      description: "Build a marketing analytics dashboard with data visualisations and REST API integrations. 2–3 weeks part-time.",
      skills: ["React", "TypeScript", "REST APIs"],
      budget: "₹40,000–₹60,000", budgetMin: 40000, budgetMax: 60000,
      timeline: "2–3 weeks", geofenceRing: "CLOUD",
    },
  });
  await prisma.jobRequirement.upsert({
    where: { id: DEMO_IDS.jobs[1] },
    update: {},
    create: {
      id: DEMO_IDS.jobs[1],
      userId: acme.id,
      title: "Brand Identity for Café Launch",
      description: "Logo, colour palette, menu design, and social kit for a new café in Kochi.",
      skills: ["Branding", "Figma", "Illustration"],
      budget: "₹15,000–₹25,000", budgetMin: 15000, budgetMax: 25000,
      timeline: "1 week", geofenceRing: "CORE", lat: 9.9312, lng: 76.2673,
    },
  });

  // Connection & milestones
  const conn = await prisma.matchmakingConnection.upsert({
    where: { workerId_jobId: { workerId: janeProfile.id, jobId: job1.id } },
    update: {},
    create: {
      workerId: janeProfile.id, jobId: job1.id,
      isAnonymous: false, identityRevealedAt: new Date(),
      introducedAt: new Date(Date.now() - 5 * 86400000),
      introducedById: admin.id,
      connectionStatus: "IN_PROGRESS",
      contractStartDate: new Date(Date.now() - 4 * 86400000),
    },
  });

  await prisma.milestone.upsert({
    where: { id: DEMO_IDS.milestones[0] },
    update: {},
    create: {
      id: DEMO_IDS.milestones[0], connectionId: conn.id,
      title: "Project Setup & Data Models", amount: 15000, status: "APPROVED",
      clientConfirmedAt: new Date(Date.now() - 3 * 86400000),
      workerConfirmedAt: new Date(Date.now() - 3 * 86400000),
      dueDate: new Date(Date.now() - 2 * 86400000),
    },
  });
  await prisma.milestone.upsert({
    where: { id: DEMO_IDS.milestones[1] },
    update: {},
    create: {
      id: DEMO_IDS.milestones[1], connectionId: conn.id,
      title: "Dashboard Charts & Filters", amount: 25000, status: "DELIVERED",
      workerConfirmedAt: new Date(Date.now() - 86400000),
      dueDate: new Date(Date.now() + 86400000),
    },
  });
  await prisma.milestone.upsert({
    where: { id: DEMO_IDS.milestones[2] },
    update: {},
    create: {
      id: DEMO_IDS.milestones[2], connectionId: conn.id,
      title: "Final Polish & Handoff", amount: 20000, status: "PENDING",
      dueDate: new Date(Date.now() + 7 * 86400000),
    },
  });

  // Squad
  const squad = await prisma.squad.upsert({
    where: { id: DEMO_IDS.squad },
    update: {},
    create: { id: DEMO_IDS.squad, name: "Kochi Creatives", description: "Full-stack team: dev + design + copy.", sharedReputationScore: 97 },
  });
  await prisma.squadMembership.upsert({
    where: { squadId_userId: { squadId: squad.id, userId: jane.id } },
    update: {}, create: { squadId: squad.id, userId: jane.id, role: "LEAD" },
  });
  await prisma.squadMembership.upsert({
    where: { squadId_userId: { squadId: squad.id, userId: arjun.id } },
    update: {}, create: { squadId: squad.id, userId: arjun.id, role: "MEMBER" },
  });
  await prisma.squadMembership.upsert({
    where: { squadId_userId: { squadId: squad.id, userId: priya.id } },
    update: {}, create: { squadId: squad.id, userId: priya.id, role: "CONTRIBUTOR" },
  });

  // Sandbox challenges
  await prisma.sandboxChallenge.upsert({
    where: { id: DEMO_IDS.challenges[0] },
    update: {},
    create: {
      id: DEMO_IDS.challenges[0], title: "React Component Architecture",
      description: "Test your React knowledge with real-world component design questions.",
      skillCategory: "React", timeLimit: 20,
      questions: [
        { id: "q1", text: "What is the purpose of the useCallback hook?", type: "mcq", options: ["To memoize a function reference between renders", "To run side effects after render", "To manage component state", "To fetch data from an API"], correct: 0 },
        { id: "q2", text: "Which pattern best avoids prop drilling for deeply nested components?", type: "mcq", options: ["React Context API", "Passing props through every level", "Using global variables", "Storing state in localStorage"], correct: 0 },
        { id: "q3", text: "Describe how you would optimise a large list rendering in React.", type: "text" },
        { id: "q4", text: "What is the key difference between useMemo and useCallback?", type: "mcq", options: ["useMemo memoizes a value; useCallback memoizes a function", "They are identical", "useCallback memoizes a value; useMemo memoizes a function", "useMemo is only for class components"], correct: 0 },
        { id: "q5", text: "How would you implement a custom hook for debounced search?", type: "text" },
      ],
    },
  });
  await prisma.sandboxChallenge.upsert({
    where: { id: DEMO_IDS.challenges[1] },
    update: {},
    create: {
      id: DEMO_IDS.challenges[1], title: "UI/UX Design Principles",
      description: "Evaluate your design thinking and visual decision-making skills.",
      skillCategory: "UI/UX Design", timeLimit: 15,
      questions: [
        { id: "q1", text: "What is the minimum touch target size recommended by Apple HIG?", type: "mcq", options: ["44×44 pt", "32×32 pt", "56×56 pt", "24×24 pt"], correct: 0 },
        { id: "q2", text: "What does WCAG AA require for normal text contrast ratio?", type: "mcq", options: ["4.5:1", "3:1", "7:1", "2:1"], correct: 0 },
        { id: "q3", text: "Describe your process for designing an empty state for a dashboard.", type: "text" },
        { id: "q4", text: "Which spacing system does Material Design use?", type: "mcq", options: ["8dp grid", "6px grid", "10px grid", "4px grid"], correct: 0 },
        { id: "q5", text: "What is progressive disclosure and when would you use it?", type: "text" },
      ],
    },
  });
  await prisma.sandboxChallenge.upsert({
    where: { id: DEMO_IDS.challenges[2] },
    update: {},
    create: {
      id: DEMO_IDS.challenges[2], title: "Content Strategy & SEO",
      description: "Assess your copywriting and content marketing fundamentals.",
      skillCategory: "Content Writing", timeLimit: 15,
      questions: [
        { id: "q1", text: "What is the ideal meta description length for SEO?", type: "mcq", options: ["150–160 characters", "50–70 characters", "200–250 characters", "Under 100 characters"], correct: 0 },
        { id: "q2", text: "Write a 2-sentence value proposition for a local café launching delivery.", type: "text" },
        { id: "q3", text: "What does E-E-A-T stand for in Google's quality guidelines?", type: "mcq", options: ["Experience, Expertise, Authoritativeness, Trustworthiness", "Engagement, Efficiency, Authority, Traffic", "Education, Experience, Analytics, Targeting", "None of the above"], correct: 0 },
        { id: "q4", text: "Which headline is more likely to convert?", type: "mcq", options: ["B — specific and benefit-driven", "A — clean and minimal", "They are equivalent", "Depends on the font"], correct: 0 },
        { id: "q5", text: "How would you structure a content calendar for a B2B SaaS launch?", type: "text" },
      ],
    },
  });

  // Merchant offers
  for (const [i, offer] of [
    { merchantName: "Café Arabica", category: "Food & Drink", description: "15% off all beverages for verified QuickQuid freelancers", discountPercent: 15, address: "MG Road, Kochi", lat: 9.9312, lng: 76.2673 },
    { merchantName: "Print Zone", category: "Services", description: "20% off printing & binding for portfolios", discountPercent: 20, address: "Ernakulam North, Kochi", lat: 9.9425, lng: 76.2609 },
    { merchantName: "FitSpace Gym", category: "Health & Fitness", description: "Free first month membership for KYC-verified workers", discountPercent: 100, address: "Vyttila, Kochi", lat: 9.9587, lng: 76.2970 },
  ].entries()) {
    await prisma.merchantOffer.upsert({
      where: { id: DEMO_IDS.offers[i] },
      update: {},
      create: { id: DEMO_IDS.offers[i], ...offer },
    });
  }

  revalidatePath("/admin/oversight");
  revalidatePath("/client/catalog");
  return { success: true, message: "Demo data seeded — 4 workers, 1 client, 3 service packages, 2 jobs" };
}

export async function clearDemoData(): Promise<{ success?: boolean; error?: string; message?: string }> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { error: "Not authorized" };

  // Delete demo users — cascades to profiles, packages, jobs, connections, etc.
  await prisma.user.deleteMany({ where: { email: { in: DEMO_EMAILS } } });

  // Delete standalone seeded records (no user FK)
  await prisma.sandboxChallenge.deleteMany({ where: { id: { in: DEMO_IDS.challenges } } });
  await prisma.merchantOffer.deleteMany({ where: { id: { in: DEMO_IDS.offers } } });
  await prisma.squad.deleteMany({ where: { id: DEMO_IDS.squad } });

  revalidatePath("/admin/oversight");
  revalidatePath("/client/catalog");
  return { success: true, message: "Demo data removed" };
}
