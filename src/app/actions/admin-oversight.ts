"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VerificationBadge } from "@prisma/client";
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
  portfolios: {
    jane: ["portfolio-jane-001", "portfolio-jane-002"],
    arjun: ["portfolio-arjun-001", "portfolio-arjun-002"],
    priya: ["portfolio-priya-001"],
  },
  employment: {
    jane: ["emp-jane-001", "emp-jane-002"],
    arjun: ["emp-arjun-001", "emp-arjun-002"],
    priya: ["emp-priya-001"],
  },
  education: {
    jane: ["edu-jane-001"],
    arjun: ["edu-arjun-001"],
    priya: ["edu-priya-001"],
  },
  certifications: {
    jane: ["cert-jane-001", "cert-jane-002"],
    arjun: ["cert-arjun-001"],
  },
  sandboxSubmissions: ["sandbox-jane-react", "sandbox-jane-design", "sandbox-jane-content"],
  applications: ["app-jane-job1", "app-arjun-job2", "app-kiran-job1"],
  subJob: "subjob-jane-001",
  workSubmission: "submission-jane-001",
  commissionLedger: "ledger-milestone-001",
};

export async function seedDemoData(): Promise<{ success?: boolean; error?: string; message?: string }> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { error: "Not authorized" };

  const workerPass = await bcrypt.hash("worker123!", 12);
  const clientPass = await bcrypt.hash("client123!", 12);

  // ── Users ──────────────────────────────────────────────────────────────────
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
    update: { referredById: jane.id },
    create: { email: "kiran@mobile.com", name: "Kiran Dev", password: workerPass, role: "WORKER", referredById: jane.id },
  });
  const acme = await prisma.user.upsert({
    where: { email: "acme@company.com" },
    update: {},
    create: { email: "acme@company.com", name: "Acme Corp", password: clientPass, role: "CLIENT" },
  });

  // ── Worker profiles (full fields) ─────────────────────────────────────────
  const janeProfileData = {
    linkedinUrl: "https://linkedin.com/in/janesmith-dev",
    portfolioUrls: ["https://github.com/janesmith", "https://janesmith.dev"],
    skills: ["React", "TypeScript", "Node.js", "UI/UX", "Figma", "REST APIs", "PostgreSQL", "Next.js"],
    bio: "Full-stack developer with 4 years building clean, fast React applications for early-stage startups and scale-ups. I care about DX as much as UX.",
    experienceText: "Led front-end at a SaaS startup (Series A) building a real-time analytics dashboard used by 200+ clients. Prior to that, freelanced for 2 years building REST APIs, mobile-first UIs, and internal tooling for SMBs in Kochi and Bengaluru.",
    isVerified: true, status: "VERIFIED" as const,
    verificationBadges: ["KYC_VERIFIED", "SKILL_VERIFIED"] as VerificationBadge[],
    sandboxScore: 96, fillRate: 98.5, hoursTrained: 1200,
    standbyStatus: "AVAILABLE" as const, tier: "PRO" as const,
    title: "Full-Stack React & Node.js Developer",
    hourlyRate: 1800,
    location: "Kochi, Kerala",
    timezone: "Asia/Kolkata",
    availabilityStatus: "AVAILABLE_NOW" as const,
    weeklyAvailability: "THIRTY_PLUS" as const,
    openToContractHire: true,
    responseTime: "within 2 hours",
    idVerified: true,
    phoneVerified: true,
  };
  const janeProfile = await prisma.workerProfile.upsert({
    where: { userId: jane.id },
    update: janeProfileData,
    create: { userId: jane.id, ...janeProfileData },
  });

  const arjunProfileData = {
    linkedinUrl: "https://linkedin.com/in/arjunnair",
    portfolioUrls: ["https://behance.net/arjun", "https://arjunnair.design"],
    skills: ["UI/UX Design", "Figma", "Branding", "Illustration", "Webflow", "Motion Design", "Design Systems"],
    bio: "Product designer who makes complex things feel simple. I've shipped design systems for 3 funded startups and a dozen freelance projects.",
    experienceText: "3 years freelancing across brand identity, product design, and motion graphics. Clients include a healthtech startup (Bengaluru), a D2C food brand (Kochi), and multiple European agencies. I run a weekly design critique newsletter with 1,200 subscribers.",
    isVerified: true, status: "VERIFIED" as const,
    verificationBadges: ["KYC_VERIFIED", "SKILL_VERIFIED"] as VerificationBadge[],
    sandboxScore: 91, fillRate: 100, hoursTrained: 900,
    standbyStatus: "AVAILABLE" as const, tier: "ELITE" as const,
    title: "Senior Product Designer & Brand Strategist",
    hourlyRate: 2200,
    location: "Kozhikode, Kerala",
    timezone: "Asia/Kolkata",
    availabilityStatus: "OPEN_TO_OFFERS" as const,
    weeklyAvailability: "LESS_THAN_30" as const,
    openToContractHire: false,
    responseTime: "within 4 hours",
    idVerified: true,
    phoneVerified: true,
  };
  const arjunProfile = await prisma.workerProfile.upsert({
    where: { userId: arjun.id },
    update: arjunProfileData,
    create: { userId: arjun.id, ...arjunProfileData },
  });

  const priyaProfileData = {
    linkedinUrl: "https://linkedin.com/in/priyamenon",
    portfolioUrls: ["https://medium.com/@priya", "https://priyawrites.com"],
    skills: ["Content Writing", "SEO", "Copywriting", "Email Marketing", "Research", "B2B SaaS", "Social Media"],
    bio: "Content strategist who turns complex ideas into words that educate and convert. 5 years writing for SaaS, e-commerce, and B2B brands.",
    experienceText: "Built content strategy for a B2B SaaS startup from 0 to 50K monthly organic visitors in 14 months. Managed a team of 3 writers. Also write email sequences, case studies, and product copy — anything long-form and conversion-focused.",
    isVerified: true, status: "VERIFIED" as const,
    verificationBadges: ["KYC_VERIFIED", "SQUAD_VOUCHED"] as VerificationBadge[],
    sandboxScore: 88, fillRate: 97.2, hoursTrained: 600,
    standbyStatus: "BUSY" as const, tier: "PRO" as const,
    title: "B2B Content Strategist & SEO Writer",
    hourlyRate: 1200,
    location: "Thrissur, Kerala",
    timezone: "Asia/Kolkata",
    availabilityStatus: "OPEN_TO_OFFERS" as const,
    weeklyAvailability: "AS_NEEDED" as const,
    openToContractHire: false,
    responseTime: "same day",
    idVerified: true,
    phoneVerified: false,
  };
  const priyaProfile = await prisma.workerProfile.upsert({
    where: { userId: priya.id },
    update: priyaProfileData,
    create: { userId: priya.id, ...priyaProfileData },
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
      title: "Mobile App Developer (Flutter & React Native)",
      location: "Kochi, Kerala",
      timezone: "Asia/Kolkata",
    },
  });

  // ── Service packages ───────────────────────────────────────────────────────
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

  // ── Jobs ───────────────────────────────────────────────────────────────────
  const job1 = await prisma.jobRequirement.upsert({
    where: { id: DEMO_IDS.jobs[0] },
    update: {},
    create: {
      id: DEMO_IDS.jobs[0], userId: acme.id,
      title: "React Developer for Marketing Dashboard",
      description: "Build a marketing analytics dashboard with data visualisations and REST API integrations. 2–3 weeks part-time.",
      skills: ["React", "TypeScript", "REST APIs"],
      budget: "₹40,000–₹60,000", budgetMin: 40000, budgetMax: 60000,
      timeline: "2–3 weeks", geofenceRing: "CLOUD",
    },
  });
  const job2 = await prisma.jobRequirement.upsert({
    where: { id: DEMO_IDS.jobs[1] },
    update: {},
    create: {
      id: DEMO_IDS.jobs[1], userId: acme.id,
      title: "Brand Identity for Café Launch",
      description: "Logo, colour palette, menu design, and social kit for a new café in Kochi.",
      skills: ["Branding", "Figma", "Illustration"],
      budget: "₹15,000–₹25,000", budgetMin: 15000, budgetMax: 25000,
      timeline: "1 week", geofenceRing: "CORE", lat: 9.9312, lng: 76.2673,
    },
  });

  // ── Connection (Jane → Job1, revealed) ────────────────────────────────────
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

  // ── Blind connection (Arjun → Job2, for Merit Board demo) ─────────────────
  const blindConn = await prisma.matchmakingConnection.upsert({
    where: { workerId_jobId: { workerId: arjunProfile.id, jobId: job2.id } },
    update: {},
    create: {
      workerId: arjunProfile.id, jobId: job2.id,
      isAnonymous: true,
    },
  });
  void blindConn;

  // ── Milestones ─────────────────────────────────────────────────────────────
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

  // ── Commission ledger for approved milestone ───────────────────────────────
  await prisma.commissionLedger.upsert({
    where: { milestoneId: DEMO_IDS.milestones[0] },
    update: {},
    create: {
      id: DEMO_IDS.commissionLedger,
      milestoneId: DEMO_IDS.milestones[0],
      grossAmount: 15000, platformFee: 1200, isPaid: true,
      paidAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  // ── Work submission (shows in contract view) ───────────────────────────────
  await prisma.workSubmission.upsert({
    where: { id: DEMO_IDS.workSubmission },
    update: {},
    create: {
      id: DEMO_IDS.workSubmission,
      connectionId: conn.id, workerId: janeProfile.id,
      title: "Dashboard wireframe — preview",
      description: "First-pass layout. Full Figma file shared on approval.",
      fileUrl: "https://figma.com/file/demo-link",
      isPreview: true, isApproved: true,
    },
  });

  // ── Messages in the Jane–Acme thread ──────────────────────────────────────
  const existingMsgs = await prisma.message.count({ where: { connectionId: conn.id } });
  if (existingMsgs === 0) {
    await prisma.message.createMany({
      data: [
        { connectionId: conn.id, senderId: acme.id, content: "Hi Jane! Really excited to get started on this dashboard project. The brief looks great.", createdAt: new Date(Date.now() - 4 * 86400000) },
        { connectionId: conn.id, senderId: jane.id, content: "Thanks Acme! I've reviewed the requirements — I'll start with the data models and API schema today. Should have a Figma wireframe to you by tomorrow.", createdAt: new Date(Date.now() - 4 * 86400000 + 600000) },
        { connectionId: conn.id, senderId: acme.id, content: "Perfect. Can we include a date-range filter on the main chart?", createdAt: new Date(Date.now() - 3 * 86400000) },
        { connectionId: conn.id, senderId: jane.id, content: "Absolutely — date range filter, team filter, and a CSV export are all in scope for the Standard milestone. I'll include it in the wireframe.", createdAt: new Date(Date.now() - 3 * 86400000 + 300000) },
        { connectionId: conn.id, senderId: jane.id, content: "Wireframe is ready — I've shared a preview submission above. Let me know if you'd like any layout changes before I move to code.", createdAt: new Date(Date.now() - 2 * 86400000) },
        { connectionId: conn.id, senderId: acme.id, content: "Looks clean! Approved. Go ahead and start building 🚀", createdAt: new Date(Date.now() - 2 * 86400000 + 1800000) },
      ],
    });
  }

  // ── Portfolio projects ─────────────────────────────────────────────────────
  await prisma.portfolioProject.upsert({
    where: { id: DEMO_IDS.portfolios.jane[0] },
    update: {},
    create: {
      id: DEMO_IDS.portfolios.jane[0],
      workerId: janeProfile.id,
      title: "Acme Analytics Dashboard",
      description: "Real-time marketing analytics platform built with Next.js and Recharts. Includes date-range filters, CSV export, team-based access control, and REST API integrations with HubSpot and Google Analytics.",
      role: "Lead Developer",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Recharts"],
      projectUrl: "https://github.com/janesmith/acme-dashboard",
    },
  });
  await prisma.portfolioProject.upsert({
    where: { id: DEMO_IDS.portfolios.jane[1] },
    update: {},
    create: {
      id: DEMO_IDS.portfolios.jane[1],
      workerId: janeProfile.id,
      title: "LMS Mobile App (React Native)",
      description: "Learning management system for a Kerala-based ed-tech startup. Features video streaming, quiz engine, progress tracking, and offline mode.",
      role: "Full-Stack Developer",
      skills: ["React Native", "Node.js", "Firebase", "TypeScript"],
      projectUrl: "https://github.com/janesmith/lms-app",
    },
  });
  await prisma.portfolioProject.upsert({
    where: { id: DEMO_IDS.portfolios.arjun[0] },
    update: {},
    create: {
      id: DEMO_IDS.portfolios.arjun[0],
      workerId: arjunProfile.id,
      title: "MedFlow — Healthcare App Design",
      description: "End-to-end product design for a telemedicine app. Covers patient onboarding, appointment booking, video consult UI, and a doctor-side dashboard. Design system in Figma with 300+ components.",
      role: "Lead Designer",
      skills: ["Figma", "UI/UX Design", "Design Systems", "Prototyping"],
      projectUrl: "https://behance.net/arjun/medflow",
    },
  });
  await prisma.portfolioProject.upsert({
    where: { id: DEMO_IDS.portfolios.arjun[1] },
    update: {},
    create: {
      id: DEMO_IDS.portfolios.arjun[1],
      workerId: arjunProfile.id,
      title: "Bloom — D2C Brand Identity",
      description: "Full brand identity for a Kochi-based organic food startup. Logo, typography, packaging design, social media templates, and Webflow marketing site.",
      role: "Brand Designer",
      skills: ["Branding", "Illustration", "Webflow", "Figma"],
      projectUrl: "https://behance.net/arjun/bloom",
    },
  });
  await prisma.portfolioProject.upsert({
    where: { id: DEMO_IDS.portfolios.priya[0] },
    update: {},
    create: {
      id: DEMO_IDS.portfolios.priya[0],
      workerId: priyaProfile.id,
      title: "SaaS SEO Content Programme",
      description: "Built and executed a 6-month content strategy for a B2B SaaS startup, growing organic traffic from 3K to 53K monthly visitors. Includes keyword clusters, pillar pages, and a link-building playbook.",
      role: "Content Strategist",
      skills: ["SEO", "Content Writing", "Research", "B2B SaaS"],
      projectUrl: "https://medium.com/@priya/saas-seo-case-study",
    },
  });

  // ── Employment history ─────────────────────────────────────────────────────
  await prisma.employmentHistory.upsert({
    where: { id: DEMO_IDS.employment.jane[0] },
    update: {},
    create: {
      id: DEMO_IDS.employment.jane[0], workerId: janeProfile.id,
      title: "Senior Frontend Engineer", company: "Sprintly (Series A SaaS)",
      startDate: new Date("2022-06-01"), endDate: new Date("2024-01-31"), isCurrent: false,
      description: "Led front-end development of a real-time project management tool. Migrated legacy jQuery codebase to React 18 with TypeScript. Reduced bundle size by 42%.",
    },
  });
  await prisma.employmentHistory.upsert({
    where: { id: DEMO_IDS.employment.jane[1] },
    update: {},
    create: {
      id: DEMO_IDS.employment.jane[1], workerId: janeProfile.id,
      title: "Freelance Web Developer", company: "Self-employed",
      startDate: new Date("2024-02-01"), isCurrent: true,
      description: "Building dashboards, REST APIs, and mobile-first UIs for SMBs across India. 12+ projects delivered.",
    },
  });
  await prisma.employmentHistory.upsert({
    where: { id: DEMO_IDS.employment.arjun[0] },
    update: {},
    create: {
      id: DEMO_IDS.employment.arjun[0], workerId: arjunProfile.id,
      title: "Product Designer", company: "Healthify (Healthtech Startup)",
      startDate: new Date("2021-03-01"), endDate: new Date("2023-08-31"), isCurrent: false,
      description: "Designed core patient-facing flows for a telemedicine app with 100K+ users. Owned the design system (Figma) used across Android, iOS, and web.",
    },
  });
  await prisma.employmentHistory.upsert({
    where: { id: DEMO_IDS.employment.arjun[1] },
    update: {},
    create: {
      id: DEMO_IDS.employment.arjun[1], workerId: arjunProfile.id,
      title: "Freelance Brand Designer", company: "Self-employed",
      startDate: new Date("2023-09-01"), isCurrent: true,
      description: "Brand identity, product design, and motion graphics for startups and agencies. Clients across India, UK, and Germany.",
    },
  });
  await prisma.employmentHistory.upsert({
    where: { id: DEMO_IDS.employment.priya[0] },
    update: {},
    create: {
      id: DEMO_IDS.employment.priya[0], workerId: priyaProfile.id,
      title: "Content Strategist", company: "CloudDesk (B2B SaaS)",
      startDate: new Date("2020-01-01"), isCurrent: true,
      description: "Built content strategy from scratch. Grew organic blog traffic from 3K to 53K/month in 14 months. Managed a team of 3 writers and a freelance network.",
    },
  });

  // ── Education ──────────────────────────────────────────────────────────────
  await prisma.education.upsert({
    where: { id: DEMO_IDS.education.jane[0] },
    update: {},
    create: {
      id: DEMO_IDS.education.jane[0], workerId: janeProfile.id,
      institution: "College of Engineering, Trivandrum",
      degree: "B.Tech", fieldOfStudy: "Computer Science & Engineering",
      startYear: 2018, endYear: 2022,
    },
  });
  await prisma.education.upsert({
    where: { id: DEMO_IDS.education.arjun[0] },
    update: {},
    create: {
      id: DEMO_IDS.education.arjun[0], workerId: arjunProfile.id,
      institution: "National Institute of Design, Ahmedabad",
      degree: "B.Des", fieldOfStudy: "Communication Design",
      startYear: 2017, endYear: 2021,
    },
  });
  await prisma.education.upsert({
    where: { id: DEMO_IDS.education.priya[0] },
    update: {},
    create: {
      id: DEMO_IDS.education.priya[0], workerId: priyaProfile.id,
      institution: "Christ University, Bengaluru",
      degree: "BA", fieldOfStudy: "English Literature & Journalism",
      startYear: 2016, endYear: 2019,
    },
  });

  // ── Certifications ─────────────────────────────────────────────────────────
  await prisma.certification.upsert({
    where: { id: DEMO_IDS.certifications.jane[0] },
    update: {},
    create: {
      id: DEMO_IDS.certifications.jane[0], workerId: janeProfile.id,
      name: "AWS Certified Developer – Associate",
      provider: "Amazon Web Services", issueYear: 2023,
      credentialUrl: "https://aws.amazon.com/certification/certified-developer-associate/",
    },
  });
  await prisma.certification.upsert({
    where: { id: DEMO_IDS.certifications.jane[1] },
    update: {},
    create: {
      id: DEMO_IDS.certifications.jane[1], workerId: janeProfile.id,
      name: "Meta Front-End Developer Professional Certificate",
      provider: "Coursera / Meta", issueYear: 2022,
      credentialUrl: "https://coursera.org/professional-certificates/meta-front-end-developer",
    },
  });
  await prisma.certification.upsert({
    where: { id: DEMO_IDS.certifications.arjun[0] },
    update: {},
    create: {
      id: DEMO_IDS.certifications.arjun[0], workerId: arjunProfile.id,
      name: "Google UX Design Certificate",
      provider: "Coursera / Google", issueYear: 2021,
      credentialUrl: "https://grow.google/certificates/ux-design/",
    },
  });

  // ── Languages ──────────────────────────────────────────────────────────────
  for (const [name, proficiency] of [
    ["English", "NATIVE_OR_BILINGUAL"], ["Malayalam", "NATIVE_OR_BILINGUAL"], ["Hindi", "CONVERSATIONAL"],
  ] as const) {
    await prisma.workerLanguage.upsert({
      where: { workerId_name: { workerId: janeProfile.id, name } },
      update: {}, create: { workerId: janeProfile.id, name, proficiency },
    });
  }
  for (const [name, proficiency] of [
    ["English", "FLUENT"], ["Malayalam", "NATIVE_OR_BILINGUAL"], ["Tamil", "BASIC"],
  ] as const) {
    await prisma.workerLanguage.upsert({
      where: { workerId_name: { workerId: arjunProfile.id, name } },
      update: {}, create: { workerId: arjunProfile.id, name, proficiency },
    });
  }
  for (const [name, proficiency] of [
    ["English", "FLUENT"], ["Malayalam", "NATIVE_OR_BILINGUAL"], ["Tamil", "CONVERSATIONAL"],
  ] as const) {
    await prisma.workerLanguage.upsert({
      where: { workerId_name: { workerId: priyaProfile.id, name } },
      update: {}, create: { workerId: priyaProfile.id, name, proficiency },
    });
  }

  // ── Sandbox submissions (Jane has completed all 3 challenges) ─────────────
  await prisma.sandboxSubmission.upsert({
    where: { workerId_challengeId: { workerId: janeProfile.id, challengeId: DEMO_IDS.challenges[0] } },
    update: {},
    create: {
      workerId: janeProfile.id, challengeId: DEMO_IDS.challenges[0],
      answers: { q1: 0, q2: 0, q3: "Use React.memo, virtualization (react-window), and avoid re-renders by stabilising references.", q4: 0, q5: "Create a useDebounce hook with useEffect and a timeout that returns the debounced value." },
      score: 96, gradedAt: new Date(Date.now() - 7 * 86400000),
    },
  });
  await prisma.sandboxSubmission.upsert({
    where: { workerId_challengeId: { workerId: janeProfile.id, challengeId: DEMO_IDS.challenges[1] } },
    update: {},
    create: {
      workerId: janeProfile.id, challengeId: DEMO_IDS.challenges[1],
      answers: { q1: 0, q2: 0, q3: "I start with a blank state that communicates value — e.g., 'Add your first metric' with a ghost chart outline.", q4: 0, q5: "Progressive disclosure reveals complexity only when needed, like showing advanced filter options only after a user clicks 'More filters'." },
      score: 88, gradedAt: new Date(Date.now() - 7 * 86400000),
    },
  });
  await prisma.sandboxSubmission.upsert({
    where: { workerId_challengeId: { workerId: janeProfile.id, challengeId: DEMO_IDS.challenges[2] } },
    update: {},
    create: {
      workerId: janeProfile.id, challengeId: DEMO_IDS.challenges[2],
      answers: { q1: 0, q2: "Fresh roasts, zero wait — order Bloom Coffee delivered to your door in 30 minutes. Sourced from Coorg, brewed your way.", q3: 0, q4: 0, q5: "I'd map content to the funnel: awareness (SEO blogs), consideration (case studies, webinars), decision (trials, comparison pages)." },
      score: 72, gradedAt: new Date(Date.now() - 7 * 86400000),
    },
  });

  // ── Job applications ───────────────────────────────────────────────────────
  await prisma.jobApplication.upsert({
    where: { id: DEMO_IDS.applications[0] },
    update: {},
    create: {
      id: DEMO_IDS.applications[0],
      jobId: job1.id, workerId: janeProfile.id,
      coverLetter: "Hi, I've built 3 similar dashboards — most recently for a Series A SaaS with 200 daily active users. Happy to share the Figma and live demo.",
      rateType: "FIXED", proposedRate: 55000, estimatedDays: 18,
      status: "HIRED", appliedAt: new Date(Date.now() - 8 * 86400000),
    },
  });
  await prisma.jobApplication.upsert({
    where: { id: DEMO_IDS.applications[1] },
    update: {},
    create: {
      id: DEMO_IDS.applications[1],
      jobId: job2.id, workerId: arjunProfile.id,
      coverLetter: "Brand identity is my core specialty. I've done 12+ logo + brand kits for F&B businesses. Would love to show you the Bloom café case study.",
      rateType: "FIXED", proposedRate: 20000, estimatedDays: 7,
      status: "PENDING", appliedAt: new Date(Date.now() - 2 * 86400000),
    },
  });
  const kiranProfile = await prisma.workerProfile.findUnique({ where: { userId: kiran.id } });
  if (kiranProfile) {
    await prisma.jobApplication.upsert({
      where: { id: DEMO_IDS.applications[2] },
      update: {},
      create: {
        id: DEMO_IDS.applications[2],
        jobId: job1.id, workerId: kiranProfile.id,
        coverLetter: "I'm a mobile developer but I have strong React skills too — happy to help with the dashboard.",
        rateType: "FIXED", proposedRate: 45000, estimatedDays: 21,
        status: "PENDING", appliedAt: new Date(Date.now() - 5 * 86400000),
      },
    });
  }

  // ── Review (Acme reviews Jane after first milestone) ──────────────────────
  await prisma.review.upsert({
    where: { connectionId: conn.id },
    update: {},
    create: {
      connectionId: conn.id, workerId: janeProfile.id, clientId: acme.id,
      rating: 5,
      qualityRating: 5, communicationRating: 5, professionalismRating: 5,
      reliabilityRating: 5, flexibilityRating: 4,
      comment: "Jane delivered the wireframe ahead of schedule and the code quality is exceptional. She asked exactly the right questions upfront and required zero micromanagement. Would hire again immediately.",
    },
  });

  // ── Sub-job (Jane posts a testing role from her contract) ─────────────────
  await prisma.subJob.upsert({
    where: { id: DEMO_IDS.subJob },
    update: {},
    create: {
      id: DEMO_IDS.subJob,
      parentConnectionId: conn.id, postedById: janeProfile.id,
      title: "Frontend Testing & QA — Marketing Dashboard",
      description: "Need someone to write Playwright E2E tests and manual test the dashboard across browsers and screen sizes. 2–3 days max.",
      skills: ["Testing", "Playwright", "QA", "React"],
      budget: "8,000", isPublic: true,
    },
  });

  // ── Standby assignments ────────────────────────────────────────────────────
  await prisma.standbyAssignment.upsert({
    where: { jobId_workerId: { jobId: job1.id, workerId: arjunProfile.id } },
    update: {},
    create: { jobId: job1.id, workerId: arjunProfile.id, isActive: true },
  });
  await prisma.standbyAssignment.upsert({
    where: { jobId_workerId: { jobId: job2.id, workerId: priyaProfile.id } },
    update: {},
    create: { jobId: job2.id, workerId: priyaProfile.id, isActive: true },
  });

  // ── Squad ──────────────────────────────────────────────────────────────────
  const squad = await prisma.squad.upsert({
    where: { id: DEMO_IDS.squad },
    update: {},
    create: { id: DEMO_IDS.squad, name: "Kochi Creatives", description: "Full-stack team: dev + design + copy. We ship complete products.", sharedReputationScore: 97 },
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

  // ── Sandbox challenges ─────────────────────────────────────────────────────
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

  // ── Merchant offers ────────────────────────────────────────────────────────
  for (const [i, offer] of [
    { merchantName: "Café Arabica", category: "Food & Drink", description: "15% off all beverages for verified QuickQuid freelancers", discountPercent: 15, address: "MG Road, Kochi", lat: 9.9312, lng: 76.2673 },
    { merchantName: "Print Zone", category: "Services", description: "20% off printing & binding for portfolios and presentations", discountPercent: 20, address: "Ernakulam North, Kochi", lat: 9.9425, lng: 76.2609 },
    { merchantName: "FitSpace Gym", category: "Health & Fitness", description: "Free first month membership for KYC-verified workers", discountPercent: 100, address: "Vyttila, Kochi", lat: 9.9587, lng: 76.2970 },
  ].entries()) {
    await prisma.merchantOffer.upsert({
      where: { id: DEMO_IDS.offers[i] },
      update: {},
      create: { id: DEMO_IDS.offers[i], ...offer },
    });
  }

  revalidatePath("/admin/oversight");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/triage");
  revalidatePath("/admin/matchmaking");
  revalidatePath("/admin/standby");
  revalidatePath("/client/catalog");
  revalidatePath("/client/board");
  revalidatePath("/client/talent");
  return { success: true, message: "Demo data seeded — workers, clients, portfolios, credentials, messages, applications, and more." };
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
