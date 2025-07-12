-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "paper_file_path" DROP NOT NULL,
ALTER COLUMN "paper_file_name" DROP NOT NULL,
ALTER COLUMN "camera_ready_file_path" DROP NOT NULL,
ALTER COLUMN "camera_ready_file_name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SubmissonAuthor" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "SubmissonAuthor" ADD CONSTRAINT "SubmissonAuthor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
