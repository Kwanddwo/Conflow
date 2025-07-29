-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_assignmentId_fkey";

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ReviewAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
