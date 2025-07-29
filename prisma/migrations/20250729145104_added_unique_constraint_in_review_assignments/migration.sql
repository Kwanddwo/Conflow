/*
  Warnings:

  - A unique constraint covering the columns `[submissionId,reviewerRoleId]` on the table `ReviewAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReviewAssignment_submissionId_reviewerRoleId_key" ON "ReviewAssignment"("submissionId", "reviewerRoleId");
