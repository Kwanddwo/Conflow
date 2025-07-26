/*
  Warnings:

  - You are about to drop the column `conferenceRoleId` on the `ReviewAssignment` table. All the data in the column will be lost.
  - Added the required column `assignedByRoleId` to the `ReviewAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewerRoleId` to the `ReviewAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReviewAssignment" DROP CONSTRAINT "ReviewAssignment_assignedById_fkey";

-- DropForeignKey
ALTER TABLE "ReviewAssignment" DROP CONSTRAINT "ReviewAssignment_conferenceRoleId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewAssignment" DROP CONSTRAINT "ReviewAssignment_reviewerId_fkey";

-- AlterTable
ALTER TABLE "ReviewAssignment" DROP COLUMN "conferenceRoleId",
ADD COLUMN     "assignedByRoleId" TEXT NOT NULL,
ADD COLUMN     "reviewerRoleId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ConferenceRoleEntries_role_idx" ON "ConferenceRoleEntries"("role");

-- CreateIndex
CREATE INDEX "ConferenceRoleEntries_userId_idx" ON "ConferenceRoleEntries"("userId");

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_reviewerRoleId_fkey" FOREIGN KEY ("reviewerRoleId") REFERENCES "ConferenceRoleEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_assignedByRoleId_fkey" FOREIGN KEY ("assignedByRoleId") REFERENCES "ConferenceRoleEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
