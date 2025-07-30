/*
  Warnings:

  - A unique constraint covering the columns `[submissionId]` on the table `Decision` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Decision_submissionId_key" ON "Decision"("submissionId");
