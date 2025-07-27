-- CreateEnum
CREATE TYPE "RecStatus" AS ENUM ('REVISION', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Reviews" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignmentId" TEXT NOT NULL,
    "recommendation" "RecStatus" NOT NULL,
    "overallEvaluation" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reviews_submissionId_idx" ON "Reviews"("submissionId");

-- CreateIndex
CREATE INDEX "Reviews_assignmentId_idx" ON "Reviews"("assignmentId");

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ReviewAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
