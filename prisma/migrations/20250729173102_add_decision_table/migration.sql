-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignmentId" TEXT NOT NULL,
    "recommendation" "RecStatus" NOT NULL,
    "overallEvaluation" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Decision_assignmentId_key" ON "Decision"("assignmentId");

-- CreateIndex
CREATE INDEX "Decision_submissionId_idx" ON "Decision"("submissionId");

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "DecisionAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
