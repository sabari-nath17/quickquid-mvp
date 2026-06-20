-- CreateEnum
CREATE TYPE "Role" AS ENUM ('WORKER', 'CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationBadge" AS ENUM ('KYC_VERIFIED', 'SKILL_VERIFIED', 'SQUAD_VOUCHED');

-- CreateEnum
CREATE TYPE "GeofenceRing" AS ENUM ('CORE', 'TRANSIT', 'CLOUD');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING_CONTACT', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DELIVERED', 'APPROVED');

-- CreateEnum
CREATE TYPE "SquadRole" AS ENUM ('LEAD', 'MEMBER', 'CONTRIBUTOR');

-- CreateEnum
CREATE TYPE "StandbyStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'WORKER',
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "portfolioUrls" TEXT[],
    "experienceText" TEXT,
    "skills" TEXT[],
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationNotes" TEXT,
    "verificationBadges" "VerificationBadge"[],
    "sandboxScore" INTEGER,
    "candidateCode" TEXT NOT NULL,
    "isOnStandby" BOOLEAN NOT NULL DEFAULT false,
    "standbyStatus" "StandbyStatus" NOT NULL DEFAULT 'OFFLINE',
    "fillRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "hoursTrained" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SandboxChallenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skillCategory" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SandboxChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SandboxSubmission" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SandboxSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Squad" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sharedReputationScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Squad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadMembership" (
    "id" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "SquadRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquadMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadBid" (
    "id" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquadBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequirement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "budget" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "timeline" TEXT,
    "geofenceRing" "GeofenceRing" NOT NULL DEFAULT 'CLOUD',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isAiScoped" BOOLEAN NOT NULL DEFAULT false,
    "aiTiers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchmakingConnection" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "identityRevealedAt" TIMESTAMP(3),
    "introducedAt" TIMESTAMP(3),
    "introducedById" TEXT,
    "connectionStatus" "ConnectionStatus" NOT NULL DEFAULT 'PENDING_CONTACT',
    "contractStartDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchmakingConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" INTEGER NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "clientConfirmedAt" TIMESTAMP(3),
    "workerConfirmedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionLedger" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandbyAssignment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StandbyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantOffer" (
    "id" TEXT NOT NULL,
    "merchantName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Food & Drink',
    "description" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL DEFAULT 9.9312,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT 76.2673,
    "qrCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantRedemption" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_userId_key" ON "WorkerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_candidateCode_key" ON "WorkerProfile"("candidateCode");

-- CreateIndex
CREATE INDEX "WorkerProfile_isVerified_idx" ON "WorkerProfile"("isVerified");

-- CreateIndex
CREATE INDEX "WorkerProfile_status_idx" ON "WorkerProfile"("status");

-- CreateIndex
CREATE INDEX "WorkerProfile_isOnStandby_idx" ON "WorkerProfile"("isOnStandby");

-- CreateIndex
CREATE INDEX "SandboxSubmission_workerId_idx" ON "SandboxSubmission"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "SandboxSubmission_workerId_challengeId_key" ON "SandboxSubmission"("workerId", "challengeId");

-- CreateIndex
CREATE INDEX "SquadMembership_userId_idx" ON "SquadMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SquadMembership_squadId_userId_key" ON "SquadMembership"("squadId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SquadBid_squadId_jobId_key" ON "SquadBid"("squadId", "jobId");

-- CreateIndex
CREATE INDEX "JobRequirement_userId_idx" ON "JobRequirement"("userId");

-- CreateIndex
CREATE INDEX "JobRequirement_geofenceRing_idx" ON "JobRequirement"("geofenceRing");

-- CreateIndex
CREATE INDEX "MatchmakingConnection_workerId_idx" ON "MatchmakingConnection"("workerId");

-- CreateIndex
CREATE INDEX "MatchmakingConnection_jobId_idx" ON "MatchmakingConnection"("jobId");

-- CreateIndex
CREATE INDEX "MatchmakingConnection_introducedAt_idx" ON "MatchmakingConnection"("introducedAt");

-- CreateIndex
CREATE INDEX "MatchmakingConnection_connectionStatus_idx" ON "MatchmakingConnection"("connectionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MatchmakingConnection_workerId_jobId_key" ON "MatchmakingConnection"("workerId", "jobId");

-- CreateIndex
CREATE INDEX "Milestone_connectionId_idx" ON "Milestone"("connectionId");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionLedger_milestoneId_key" ON "CommissionLedger"("milestoneId");

-- CreateIndex
CREATE INDEX "StandbyAssignment_jobId_idx" ON "StandbyAssignment"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "StandbyAssignment_jobId_workerId_key" ON "StandbyAssignment"("jobId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantOffer_qrCode_key" ON "MerchantOffer"("qrCode");

-- CreateIndex
CREATE INDEX "MerchantRedemption_offerId_idx" ON "MerchantRedemption"("offerId");

-- CreateIndex
CREATE INDEX "MerchantRedemption_workerId_idx" ON "MerchantRedemption"("workerId");

-- AddForeignKey
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxSubmission" ADD CONSTRAINT "SandboxSubmission_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxSubmission" ADD CONSTRAINT "SandboxSubmission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "SandboxChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMembership" ADD CONSTRAINT "SquadMembership_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMembership" ADD CONSTRAINT "SquadMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadBid" ADD CONSTRAINT "SquadBid_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadBid" ADD CONSTRAINT "SquadBid_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchmakingConnection" ADD CONSTRAINT "MatchmakingConnection_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchmakingConnection" ADD CONSTRAINT "MatchmakingConnection_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchmakingConnection" ADD CONSTRAINT "MatchmakingConnection_introducedById_fkey" FOREIGN KEY ("introducedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "MatchmakingConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionLedger" ADD CONSTRAINT "CommissionLedger_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandbyAssignment" ADD CONSTRAINT "StandbyAssignment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandbyAssignment" ADD CONSTRAINT "StandbyAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantRedemption" ADD CONSTRAINT "MerchantRedemption_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "MerchantOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
