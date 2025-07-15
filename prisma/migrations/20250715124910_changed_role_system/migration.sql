/*
  Warnings:

  - You are about to drop the column `mainChairId` on the `Conference` table. All the data in the column will be lost.
  - You are about to drop the `_ConferenceChairs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ConferenceReviewers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ConferenceRole" AS ENUM ('MAIN_CHAIR', 'CHAIR', 'REVIEWER');

-- DropForeignKey
ALTER TABLE "Conference" DROP CONSTRAINT "Conference_mainChairId_fkey";

-- DropForeignKey
ALTER TABLE "_ConferenceChairs" DROP CONSTRAINT "_ConferenceChairs_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConferenceChairs" DROP CONSTRAINT "_ConferenceChairs_B_fkey";

-- DropForeignKey
ALTER TABLE "_ConferenceReviewers" DROP CONSTRAINT "_ConferenceReviewers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConferenceReviewers" DROP CONSTRAINT "_ConferenceReviewers_B_fkey";

-- AlterTable
ALTER TABLE "Conference" DROP COLUMN "mainChairId";

-- DropTable
DROP TABLE "_ConferenceChairs";

-- DropTable
DROP TABLE "_ConferenceReviewers";

-- CreateTable
CREATE TABLE "ConferenceRoleEntries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "role" "ConferenceRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConferenceRoleEntries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConferenceRoleEntries_conferenceId_role_idx" ON "ConferenceRoleEntries"("conferenceId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "ConferenceRoleEntries_userId_conferenceId_key" ON "ConferenceRoleEntries"("userId", "conferenceId");

-- AddForeignKey
ALTER TABLE "ConferenceRoleEntries" ADD CONSTRAINT "ConferenceRoleEntries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceRoleEntries" ADD CONSTRAINT "ConferenceRoleEntries_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
