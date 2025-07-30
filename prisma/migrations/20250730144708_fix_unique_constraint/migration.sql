/*
  Warnings:

  - A unique constraint covering the columns `[submissionId]` on the table `DecisionAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DecisionAssignment_submissionId_chairRoleId_key";

-- CreateIndex
CREATE UNIQUE INDEX "DecisionAssignment_submissionId_key" ON "DecisionAssignment"("submissionId");
