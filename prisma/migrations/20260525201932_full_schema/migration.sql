/*
  Warnings:

  - You are about to drop the `HealthCheck` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RoleLevel" AS ENUM ('INTERN', 'SDE_1', 'SDE_2', 'SDE_3', 'FRONTEND_INTERN', 'FRONTEND_SDE', 'BACKEND_INTERN', 'BACKEND_SDE', 'FULLSTACK', 'DATA_ENGINEER', 'ML_ENGINEER', 'OTHER');

-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEM', 'AI_ML', 'OTHER');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SUMMER', 'WINTER', 'OFF_CYCLE');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('ONLINE', 'OFFLINE', 'ON_PAPER', 'GOOGLE_DOCS', 'CODING_PLATFORM', 'HYBRID');

-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('ONLINE_ASSESSMENT', 'TECHNICAL_1', 'TECHNICAL_2', 'TECHNICAL_3', 'SYSTEM_DESIGN', 'MANAGERIAL', 'HR', 'DIRECTOR', 'BEHAVIORAL', 'CODING_ROUND', 'OTHER');

-- CreateEnum
CREATE TYPE "RoundOutcome" AS ENUM ('CLEARED', 'REJECTED', 'PENDING', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "FinalOutcome" AS ENUM ('SELECTED', 'REJECTED', 'WAITLISTED', 'WITHDREW', 'IN_PROCESS');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('DSA', 'FRONTEND', 'BACKEND', 'DBMS', 'OPERATING_SYSTEMS', 'NETWORKING', 'SYSTEM_DESIGN', 'OOPS', 'CORE_CS', 'AI_ML', 'APTITUDE', 'BEHAVIORAL', 'SCENARIO', 'PROJECT_DISCUSSION', 'LINUX', 'COMMUNICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "SolvedStatus" AS ENUM ('SOLVED', 'PARTIAL', 'NOT_SOLVED', 'RAN_OUT_OF_TIME', 'SKIPPED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "branch" "Branch",
ADD COLUMN     "cgpa" DOUBLE PRECISION,
ADD COLUMN     "gradYear" INTEGER;

-- DropTable
DROP TABLE "HealthCheck";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roleLevel" "RoleLevel" NOT NULL,
    "year" INTEGER NOT NULL,
    "season" "Season" NOT NULL,
    "isOnCampus" BOOLEAN NOT NULL,
    "source" TEXT,
    "cgpaCutoff" DOUBLE PRECISION,
    "totalSelected" INTEGER,
    "candidateCgpa" DOUBLE PRECISION,
    "candidateBranch" "Branch",
    "candidateGradYear" INTEGER,
    "candidateBackground" TEXT,
    "finalOutcome" "FinalOutcome" NOT NULL,
    "biggestTip" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "roundName" TEXT NOT NULL,
    "roundType" "RoundType" NOT NULL,
    "durationMinutes" INTEGER,
    "mode" "InterviewMode" NOT NULL,
    "numInterviewers" INTEGER,
    "interviewStyle" TEXT,
    "outcome" "RoundOutcome" NOT NULL,
    "keyLearnings" TEXT,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "approach" TEXT,
    "timeGivenMin" INTEGER,
    "timeTakenMin" INTEGER,
    "solvedStatus" "SolvedStatus",
    "followUps" TEXT[],
    "referenceUrl" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTopic" (
    "questionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "QuestionTopic_pkey" PRIMARY KEY ("questionId","topicId")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT,
    "roundId" TEXT,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "userId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("userId","interviewId")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Interview_companyId_roleLevel_year_idx" ON "Interview"("companyId", "roleLevel", "year");

-- CreateIndex
CREATE INDEX "Interview_roleLevel_idx" ON "Interview"("roleLevel");

-- CreateIndex
CREATE INDEX "Interview_year_idx" ON "Interview"("year");

-- CreateIndex
CREATE INDEX "Interview_publishedAt_idx" ON "Interview"("publishedAt");

-- CreateIndex
CREATE INDEX "Round_interviewId_roundNumber_idx" ON "Round"("interviewId", "roundNumber");

-- CreateIndex
CREATE INDEX "Round_roundType_idx" ON "Round"("roundType");

-- CreateIndex
CREATE INDEX "Question_roundId_orderIndex_idx" ON "Question"("roundId", "orderIndex");

-- CreateIndex
CREATE INDEX "Question_category_difficulty_idx" ON "Question"("category", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_category_idx" ON "Topic"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_category_key" ON "Topic"("name", "category");

-- CreateIndex
CREATE INDEX "QuestionTopic_topicId_idx" ON "QuestionTopic"("topicId");

-- CreateIndex
CREATE INDEX "Asset_interviewId_idx" ON "Asset"("interviewId");

-- CreateIndex
CREATE INDEX "Asset_roundId_idx" ON "Asset"("roundId");

-- CreateIndex
CREATE INDEX "Bookmark_interviewId_idx" ON "Bookmark"("interviewId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTopic" ADD CONSTRAINT "QuestionTopic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTopic" ADD CONSTRAINT "QuestionTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
