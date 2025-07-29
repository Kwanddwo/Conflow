-- CreateTable
CREATE TABLE "DecisionAssignment" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "chairRoleId" TEXT NOT NULL,
    "assignedByRoleId" TEXT NOT NULL,

    CONSTRAINT "DecisionAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DecisionAssignment_submissionId_idx" ON "DecisionAssignment"("submissionId");

-- CreateIndex
CREATE INDEX "DecisionAssignment_chairRoleId_idx" ON "DecisionAssignment"("chairRoleId");

-- CreateIndex
CREATE INDEX "DecisionAssignment_assignedByRoleId_idx" ON "DecisionAssignment"("assignedByRoleId");

-- AddForeignKey
ALTER TABLE "DecisionAssignment" ADD CONSTRAINT "DecisionAssignment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionAssignment" ADD CONSTRAINT "DecisionAssignment_chairRoleId_fkey" FOREIGN KEY ("chairRoleId") REFERENCES "ConferenceRoleEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionAssignment" ADD CONSTRAINT "DecisionAssignment_assignedByRoleId_fkey" FOREIGN KEY ("assignedByRoleId") REFERENCES "ConferenceRoleEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
