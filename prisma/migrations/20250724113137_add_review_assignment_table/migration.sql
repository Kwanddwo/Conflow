/*
  Warnings:

  - You are about to drop the column `conferenceRoleEntryId` on the `ReviewAssignment` table. All the data in the column will be lost.
  - Added the required column `conferenceRoleId` to the `ReviewAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReviewAssignment" DROP CONSTRAINT "ReviewAssignment_conferenceRoleEntryId_fkey";

-- AlterTable
ALTER TABLE "ReviewAssignment" DROP COLUMN "conferenceRoleEntryId",
ADD COLUMN     "conferenceRoleId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_conferenceRoleId_fkey" FOREIGN KEY ("conferenceRoleId") REFERENCES "ConferenceRoleEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
