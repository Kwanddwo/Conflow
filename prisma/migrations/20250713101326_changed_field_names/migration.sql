/*
  Warnings:

  - You are about to drop the column `camera_ready_file_name` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `camera_ready_file_path` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `paper_file_name` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `paper_file_path` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `primary_area` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `secondary_areas` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `submitted_at` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `submitted_by` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `secondaryArea` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submittedById` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_submitted_by_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "camera_ready_file_name",
DROP COLUMN "camera_ready_file_path",
DROP COLUMN "paper_file_name",
DROP COLUMN "paper_file_path",
DROP COLUMN "primary_area",
DROP COLUMN "secondary_areas",
DROP COLUMN "submitted_at",
DROP COLUMN "submitted_by",
ADD COLUMN     "cameraReadyFilename" TEXT,
ADD COLUMN     "cameraReadyFilepath" TEXT,
ADD COLUMN     "paperFileName" TEXT,
ADD COLUMN     "paperFilePath" TEXT,
ADD COLUMN     "secondaryArea" TEXT NOT NULL,
ADD COLUMN     "submittedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
