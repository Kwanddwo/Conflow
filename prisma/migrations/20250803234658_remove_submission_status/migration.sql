/*
  Warnings:

  - You are about to drop the column `status` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "status";

-- DropEnum
DROP TYPE "SubmissionStatus";
