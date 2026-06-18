/*
  Warnings:

  - You are about to drop the column `candidateBackground` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `candidateBranch` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `candidateCgpa` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `candidateGradYear` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `cgpaCutoff` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `finalOutcome` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `isOnCampus` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `roleLevel` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `season` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `branch` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cgpa` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gradYear` on the `User` table. All the data in the column will be lost.
  - Added the required column `roleLevelId` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Interview_companyId_roleLevel_year_idx";

-- DropIndex
DROP INDEX "Interview_roleLevel_idx";

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "candidateBackground",
DROP COLUMN "candidateBranch",
DROP COLUMN "candidateCgpa",
DROP COLUMN "candidateGradYear",
DROP COLUMN "cgpaCutoff",
DROP COLUMN "finalOutcome",
DROP COLUMN "isOnCampus",
DROP COLUMN "roleLevel",
DROP COLUMN "season",
DROP COLUMN "source",
ADD COLUMN     "roleLevelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "branch",
DROP COLUMN "cgpa",
DROP COLUMN "gradYear";

-- DropEnum
DROP TYPE "Branch";

-- DropEnum
DROP TYPE "FinalOutcome";

-- DropEnum
DROP TYPE "RoleLevel";

-- DropEnum
DROP TYPE "Season";

-- CreateTable
CREATE TABLE "RoleLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleLevel_name_key" ON "RoleLevel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoleLevel_slug_key" ON "RoleLevel"("slug");

-- CreateIndex
CREATE INDEX "Interview_companyId_roleLevelId_year_idx" ON "Interview"("companyId", "roleLevelId", "year");

-- CreateIndex
CREATE INDEX "Interview_roleLevelId_idx" ON "Interview"("roleLevelId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_roleLevelId_fkey" FOREIGN KEY ("roleLevelId") REFERENCES "RoleLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
