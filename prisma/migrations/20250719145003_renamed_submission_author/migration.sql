/*
  Warnings:

  - You are about to drop the `SubmissonAuthor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubmissonAuthor" DROP CONSTRAINT "SubmissonAuthor_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissonAuthor" DROP CONSTRAINT "SubmissonAuthor_userId_fkey";

-- DropTable
DROP TABLE "SubmissonAuthor";

-- CreateTable
CREATE TABLE "SubmissionAuthor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "isCorresponding" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "SubmissionAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionAuthor_submissionId_email_key" ON "SubmissionAuthor"("submissionId", "email");

-- AddForeignKey
ALTER TABLE "SubmissionAuthor" ADD CONSTRAINT "SubmissionAuthor_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAuthor" ADD CONSTRAINT "SubmissionAuthor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
