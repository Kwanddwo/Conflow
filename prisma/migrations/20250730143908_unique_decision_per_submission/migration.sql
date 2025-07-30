/*
  Warnings:

  - A unique constraint covering the columns `[submissionId,chairRoleId]` on the table `DecisionAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DecisionAssignment_submissionId_chairRoleId_key" ON "DecisionAssignment"("submissionId", "chairRoleId");
