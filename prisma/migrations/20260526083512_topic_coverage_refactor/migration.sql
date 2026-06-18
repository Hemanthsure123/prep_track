/*
  Warnings:

  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_roundId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionTopic" DROP CONSTRAINT "QuestionTopic_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionTopic" DROP CONSTRAINT "QuestionTopic_topicId_fkey";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "QuestionTopic";

-- DropTable
DROP TABLE "Topic";

-- DropEnum
DROP TYPE "Difficulty";

-- DropEnum
DROP TYPE "QuestionCategory";

-- DropEnum
DROP TYPE "SolvedStatus";

-- CreateTable
CREATE TABLE "TopicArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "topicAreaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicCoverage" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "topicAreaId" TEXT NOT NULL,
    "subTopicCount" INTEGER NOT NULL DEFAULT 0,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TopicCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubTopicEntry" (
    "id" TEXT NOT NULL,
    "topicCoverageId" TEXT NOT NULL,
    "subTopicId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "exactQuestionText" TEXT,
    "referenceUrl" TEXT,

    CONSTRAINT "SubTopicEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicArea_name_key" ON "TopicArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TopicArea_slug_key" ON "TopicArea"("slug");

-- CreateIndex
CREATE INDEX "TopicArea_sortOrder_idx" ON "TopicArea"("sortOrder");

-- CreateIndex
CREATE INDEX "SubTopic_topicAreaId_idx" ON "SubTopic"("topicAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "SubTopic_slug_topicAreaId_key" ON "SubTopic"("slug", "topicAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "SubTopic_name_topicAreaId_key" ON "SubTopic"("name", "topicAreaId");

-- CreateIndex
CREATE INDEX "TopicCoverage_roundId_orderIndex_idx" ON "TopicCoverage"("roundId", "orderIndex");

-- CreateIndex
CREATE INDEX "TopicCoverage_topicAreaId_idx" ON "TopicCoverage"("topicAreaId");

-- CreateIndex
CREATE INDEX "SubTopicEntry_topicCoverageId_orderIndex_idx" ON "SubTopicEntry"("topicCoverageId", "orderIndex");

-- CreateIndex
CREATE INDEX "SubTopicEntry_subTopicId_idx" ON "SubTopicEntry"("subTopicId");

-- AddForeignKey
ALTER TABLE "SubTopic" ADD CONSTRAINT "SubTopic_topicAreaId_fkey" FOREIGN KEY ("topicAreaId") REFERENCES "TopicArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCoverage" ADD CONSTRAINT "TopicCoverage_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCoverage" ADD CONSTRAINT "TopicCoverage_topicAreaId_fkey" FOREIGN KEY ("topicAreaId") REFERENCES "TopicArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTopicEntry" ADD CONSTRAINT "SubTopicEntry_topicCoverageId_fkey" FOREIGN KEY ("topicCoverageId") REFERENCES "TopicCoverage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTopicEntry" ADD CONSTRAINT "SubTopicEntry_subTopicId_fkey" FOREIGN KEY ("subTopicId") REFERENCES "SubTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
