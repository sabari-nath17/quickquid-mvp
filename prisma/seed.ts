import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL ?? "postgresql://sabarinathsa@localhost:5432/quickquid_mvp?schema=public";
const adapter = new PrismaPg(connectionString);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const workerPassword = await bcrypt.hash("worker123!", 12);
  const clientPassword = await bcrypt.hash("client123!", 12);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@quickquid.com" },
    update: {},
    create: {
      email: "admin@quickquid.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Workers
  const jane = await prisma.user.upsert({
    where: { email: "jane@dev.com" },
    update: {},
    create: { email: "jane@dev.com", name: "Jane Smith", password: workerPassword, role: "WORKER" },
  });
  const arjun = await prisma.user.upsert({
    where: { email: "arjun@design.com" },
    update: {},
    create: { email: "arjun@design.com", name: "Arjun Nair", password: workerPassword, role: "WORKER" },
  });
  const priya = await prisma.user.upsert({
    where: { email: "priya@write.com" },
    update: {},
    create: { email: "priya@write.com", name: "Priya Menon", password: workerPassword, role: "WORKER" },
  });
  const kiran = await prisma.user.upsert({
    where: { email: "kiran@mobile.com" },
    update: {},
    create: { email: "kiran@mobile.com", name: "Kiran Dev", password: workerPassword, role: "WORKER" },
  });

  // Worker profiles
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
      isVerified: true,
      status: "VERIFIED",
      verificationBadges: ["KYC_VERIFIED", "SKILL_VERIFIED"],
      sandboxScore: 96,
      standbyStatus: "AVAILABLE",
      fillRate: 98.5,
      hoursTrained: 1200,
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
      isVerified: true,
      status: "VERIFIED",
      verificationBadges: ["KYC_VERIFIED", "SKILL_VERIFIED"],
      sandboxScore: 91,
      standbyStatus: "AVAILABLE",
      fillRate: 100,
      hoursTrained: 900,
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
      experienceText: "5 years writing for SaaS, e-commerce, and B2B brands. Bylines in YourStory and TechCrunch.",
      isVerified: true,
      status: "VERIFIED",
      verificationBadges: ["KYC_VERIFIED", "SQUAD_VOUCHED"],
      sandboxScore: 88,
      standbyStatus: "BUSY",
      fillRate: 97.2,
      hoursTrained: 600,
    },
  });

  const kiranProfile = await prisma.workerProfile.upsert({
    where: { userId: kiran.id },
    update: {},
    create: {
      userId: kiran.id,
      linkedinUrl: "https://linkedin.com/in/kirandev",
      portfolioUrls: ["https://github.com/kirandev"],
      skills: ["Flutter", "React Native", "iOS", "Android", "Firebase"],
      bio: "Mobile developer building cross-platform apps that feel native.",
      experienceText: "Published 4 apps on App Store and Play Store. Freelancing since 2022.",
      isVerified: false,
      status: "PENDING",
      verificationBadges: [],
      sandboxScore: null,
      standbyStatus: "OFFLINE",
      fillRate: 100,
      hoursTrained: 0,
    },
  });

  // Sandbox challenges
  const reactChallenge = await prisma.sandboxChallenge.upsert({
    where: { id: "challenge-react-001" },
    update: {},
    create: {
      id: "challenge-react-001",
      title: "React Component Architecture",
      description: "Test your React knowledge with real-world component design questions.",
      skillCategory: "React",
      timeLimit: 20,
      questions: [
        {
          id: "q1",
          text: "What is the purpose of the useCallback hook?",
          type: "mcq",
          options: [
            "To memoize a function reference between renders",
            "To run side effects after render",
            "To manage component state",
            "To fetch data from an API",
          ],
          correct: 0,
        },
        {
          id: "q2",
          text: "Which pattern best avoids prop drilling for deeply nested components?",
          type: "mcq",
          options: [
            "React Context API",
            "Passing props through every level",
            "Using global variables",
            "Storing state in localStorage",
          ],
          correct: 0,
        },
        {
          id: "q3",
          text: "Describe how you would optimise a large list rendering in React.",
          type: "text",
        },
        {
          id: "q4",
          text: "What is the key difference between useMemo and useCallback?",
          type: "mcq",
          options: [
            "useMemo memoizes a value; useCallback memoizes a function",
            "They are identical",
            "useCallback memoizes a value; useMemo memoizes a function",
            "useMemo is only for class components",
          ],
          correct: 0,
        },
        {
          id: "q5",
          text: "How would you implement a custom hook for debounced search?",
          type: "text",
        },
      ],
    },
  });

  const designChallenge = await prisma.sandboxChallenge.upsert({
    where: { id: "challenge-design-001" },
    update: {},
    create: {
      id: "challenge-design-001",
      title: "UI/UX Design Principles",
      description: "Evaluate your design thinking and visual decision-making skills.",
      skillCategory: "UI/UX Design",
      timeLimit: 15,
      questions: [
        {
          id: "q1",
          text: "What is the minimum touch target size recommended by Apple HIG?",
          type: "mcq",
          options: ["44×44 pt", "32×32 pt", "56×56 pt", "24×24 pt"],
          correct: 0,
        },
        {
          id: "q2",
          text: "What does WCAG AA require for normal text contrast ratio?",
          type: "mcq",
          options: ["4.5:1", "3:1", "7:1", "2:1"],
          correct: 0,
        },
        {
          id: "q3",
          text: "Describe your process for designing an empty state for a dashboard.",
          type: "text",
        },
        {
          id: "q4",
          text: "Which spacing system does Material Design use?",
          type: "mcq",
          options: ["8dp grid", "6px grid", "10px grid", "4px grid"],
          correct: 0,
        },
        {
          id: "q5",
          text: "What is progressive disclosure and when would you use it?",
          type: "text",
        },
      ],
    },
  });

  await prisma.sandboxChallenge.upsert({
    where: { id: "challenge-content-001" },
    update: {},
    create: {
      id: "challenge-content-001",
      title: "Content Strategy & SEO",
      description: "Assess your copywriting and content marketing fundamentals.",
      skillCategory: "Content Writing",
      timeLimit: 15,
      questions: [
        {
          id: "q1",
          text: "What is the ideal meta description length for SEO?",
          type: "mcq",
          options: ["150–160 characters", "50–70 characters", "200–250 characters", "Under 100 characters"],
          correct: 0,
        },
        {
          id: "q2",
          text: "Write a 2-sentence value proposition for a local café launching delivery.",
          type: "text",
        },
        {
          id: "q3",
          text: "What does E-E-A-T stand for in Google's quality guidelines?",
          type: "mcq",
          options: [
            "Experience, Expertise, Authoritativeness, Trustworthiness",
            "Engagement, Efficiency, Authority, Traffic",
            "Education, Experience, Analytics, Targeting",
            "None of the above",
          ],
          correct: 0,
        },
        {
          id: "q4",
          text: "Which headline is more likely to convert? A: 'Our Platform' or B: 'Ship 3× faster with automated QA'",
          type: "mcq",
          options: ["B — specific and benefit-driven", "A — clean and minimal", "They are equivalent", "Depends on the font"],
          correct: 0,
        },
        {
          id: "q5",
          text: "How would you structure a content calendar for a B2B SaaS launch?",
          type: "text",
        },
      ],
    },
  });

  // Squad
  const squad = await prisma.squad.upsert({
    where: { id: "squad-kochi-001" },
    update: {},
    create: {
      id: "squad-kochi-001",
      name: "Kochi Creatives",
      description: "Full-stack team: dev + design + copy. We ship complete products.",
      sharedReputationScore: 97,
    },
  });

  await prisma.squadMembership.upsert({
    where: { squadId_userId: { squadId: squad.id, userId: jane.id } },
    update: {},
    create: { squadId: squad.id, userId: jane.id, role: "LEAD" },
  });
  await prisma.squadMembership.upsert({
    where: { squadId_userId: { squadId: squad.id, userId: arjun.id } },
    update: {},
    create: { squadId: squad.id, userId: arjun.id, role: "MEMBER" },
  });
  await prisma.squadMembership.upsert({
    where: { squadId_userId: { squadId: squad.id, userId: priya.id } },
    update: {},
    create: { squadId: squad.id, userId: priya.id, role: "CONTRIBUTOR" },
  });

  // Client
  const acme = await prisma.user.upsert({
    where: { email: "acme@company.com" },
    update: {},
    create: { email: "acme@company.com", name: "Acme Corp", password: clientPassword, role: "CLIENT" },
  });

  // Jobs
  const job1 = await prisma.jobRequirement.upsert({
    where: { id: "seed-job-001" },
    update: {},
    create: {
      id: "seed-job-001",
      userId: acme.id,
      title: "React Developer for Marketing Dashboard",
      description: "Build a marketing analytics dashboard with data visualisations and REST API integrations. 2–3 weeks part-time.",
      skills: ["React", "TypeScript", "REST APIs"],
      budget: "₹40,000–₹60,000",
      budgetMin: 40000,
      budgetMax: 60000,
      timeline: "2–3 weeks",
      geofenceRing: "CLOUD",
    },
  });

  const job2 = await prisma.jobRequirement.upsert({
    where: { id: "seed-job-002" },
    update: {},
    create: {
      id: "seed-job-002",
      userId: acme.id,
      title: "Brand Identity for Café Launch",
      description: "Logo, colour palette, menu design, and social kit for a new café in Kochi.",
      skills: ["Branding", "Figma", "Illustration"],
      budget: "₹15,000–₹25,000",
      budgetMin: 15000,
      budgetMax: 25000,
      timeline: "1 week",
      geofenceRing: "CORE",
      lat: 9.9312,
      lng: 76.2673,
    },
  });

  // Connection: Jane ↔ Job1 (introduced)
  const conn = await prisma.matchmakingConnection.upsert({
    where: { workerId_jobId: { workerId: janeProfile.id, jobId: job1.id } },
    update: {},
    create: {
      workerId: janeProfile.id,
      jobId: job1.id,
      isAnonymous: false,
      identityRevealedAt: new Date(),
      introducedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      introducedById: admin.id,
      connectionStatus: "IN_PROGRESS",
      contractStartDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Milestones for that connection
  const m1 = await prisma.milestone.upsert({
    where: { id: "milestone-001" },
    update: {},
    create: {
      id: "milestone-001",
      connectionId: conn.id,
      title: "Project Setup & Data Models",
      description: "Set up Next.js project, database schema, and mock data pipeline.",
      amount: 15000,
      status: "APPROVED",
      clientConfirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      workerConfirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.commissionLedger.upsert({
    where: { milestoneId: m1.id },
    update: {},
    create: {
      milestoneId: m1.id,
      grossAmount: 15000,
      platformFee: 1200,
      isPaid: true,
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.milestone.upsert({
    where: { id: "milestone-002" },
    update: {},
    create: {
      id: "milestone-002",
      connectionId: conn.id,
      title: "Dashboard Charts & Filters",
      description: "Build all chart components with live filter controls.",
      amount: 25000,
      status: "DELIVERED",
      workerConfirmedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.milestone.upsert({
    where: { id: "milestone-003" },
    update: {},
    create: {
      id: "milestone-003",
      connectionId: conn.id,
      title: "Final Polish & Handoff",
      description: "Responsive fixes, Storybook docs, and deployment.",
      amount: 20000,
      status: "PENDING",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Standby assignments for job1
  await prisma.standbyAssignment.upsert({
    where: { jobId_workerId: { jobId: job1.id, workerId: arjunProfile.id } },
    update: {},
    create: { jobId: job1.id, workerId: arjunProfile.id },
  });
  await prisma.standbyAssignment.upsert({
    where: { jobId_workerId: { jobId: job1.id, workerId: priyaProfile.id } },
    update: {},
    create: { jobId: job1.id, workerId: priyaProfile.id },
  });

  // Blind match: Arjun ↔ Job2 (anonymous)
  await prisma.matchmakingConnection.upsert({
    where: { workerId_jobId: { workerId: arjunProfile.id, jobId: job2.id } },
    update: {},
    create: {
      workerId: arjunProfile.id,
      jobId: job2.id,
      isAnonymous: true,
      introducedAt: null,
      connectionStatus: "PENDING_CONTACT",
    },
  });

  // Merchant offers
  await prisma.merchantOffer.upsert({
    where: { id: "offer-001" },
    update: {},
    create: {
      id: "offer-001",
      merchantName: "Café Arabica",
      category: "Food & Drink",
      description: "15% off all beverages for verified QuickQuid freelancers",
      discountPercent: 15,
      address: "MG Road, Kochi, Kerala",
      lat: 9.9312,
      lng: 76.2673,
    },
  });

  await prisma.merchantOffer.upsert({
    where: { id: "offer-002" },
    update: {},
    create: {
      id: "offer-002",
      merchantName: "Print Zone",
      category: "Services",
      description: "20% off printing & binding for portfolios and presentations",
      discountPercent: 20,
      address: "Ernakulam North, Kochi",
      lat: 9.9425,
      lng: 76.2609,
    },
  });

  await prisma.merchantOffer.upsert({
    where: { id: "offer-003" },
    update: {},
    create: {
      id: "offer-003",
      merchantName: "FitSpace Gym",
      category: "Health & Fitness",
      description: "Free first month membership for KYC-verified workers",
      discountPercent: 100,
      address: "Vyttila, Kochi",
      lat: 9.9587,
      lng: 76.2970,
    },
  });

  console.log("✅ Seed complete");
  console.log("");
  console.log("Accounts:");
  console.log("  Admin:    admin@quickquid.com / admin123!");
  console.log("  Worker:   jane@dev.com / worker123! (Verified, SKILL_VERIFIED)");
  console.log("  Worker:   arjun@design.com / worker123! (Verified, SKILL_VERIFIED)");
  console.log("  Worker:   priya@write.com / worker123! (Verified, SQUAD_VOUCHED)");
  console.log("  Worker:   kiran@mobile.com / worker123! (Pending)");
  console.log("  Client:   acme@company.com / client123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
