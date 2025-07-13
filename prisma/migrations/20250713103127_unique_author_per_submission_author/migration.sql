/*
  Warnings:

  - A unique constraint covering the columns `[submissionId,email]` on the table `SubmissonAuthor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SubmissonAuthor_submissionId_email_key" ON "SubmissonAuthor"("submissionId", "email");
