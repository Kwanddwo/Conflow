/*
  Warnings:

  - You are about to drop the column `overallEvaluation` on the `Decision` table. All the data in the column will be lost.
  - You are about to drop the column `overallScore` on the `Decision` table. All the data in the column will be lost.
  - You are about to drop the column `recommendation` on the `Decision` table. All the data in the column will be lost.
  - Added the required column `reviewDecision` to the `Decision` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DecStatus" AS ENUM ('ACCEPT', 'MAJOR_REVISION', 'MINOR_REVISION', 'REJECT');

-- AlterTable
ALTER TABLE "Decision" DROP COLUMN "overallEvaluation",
DROP COLUMN "overallScore",
DROP COLUMN "recommendation",
ADD COLUMN     "reviewDecision" "DecStatus" NOT NULL;
