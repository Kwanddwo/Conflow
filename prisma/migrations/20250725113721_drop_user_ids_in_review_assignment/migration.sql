/*
  Warnings:

  - You are about to drop the column `assignedById` on the `ReviewAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `reviewerId` on the `ReviewAssignment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ReviewAssignment_submissionId_reviewerId_key";

-- AlterTable
ALTER TABLE "ReviewAssignment" DROP COLUMN "assignedById",
DROP COLUMN "reviewerId";
