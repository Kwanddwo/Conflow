/*
  Warnings:

  - You are about to drop the `PrimaryResearchArea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecondaryResearchArea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ConferenceResearchAreas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `researchAreas` to the `Conference` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SecondaryResearchArea" DROP CONSTRAINT "SecondaryResearchArea_primaryResearchAreaId_fkey";

-- DropForeignKey
ALTER TABLE "_ConferenceResearchAreas" DROP CONSTRAINT "_ConferenceResearchAreas_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConferenceResearchAreas" DROP CONSTRAINT "_ConferenceResearchAreas_B_fkey";

-- AlterTable
ALTER TABLE "Conference" ADD COLUMN     "researchAreas" JSONB NOT NULL;

-- DropTable
DROP TABLE "PrimaryResearchArea";

-- DropTable
DROP TABLE "SecondaryResearchArea";

-- DropTable
DROP TABLE "_ConferenceResearchAreas";
