-- CreateIndex
CREATE INDEX "ReviewAssignment_submissionId_idx" ON "ReviewAssignment"("submissionId");

-- CreateIndex
CREATE INDEX "ReviewAssignment_reviewerRoleId_idx" ON "ReviewAssignment"("reviewerRoleId");

-- CreateIndex
CREATE INDEX "ReviewAssignment_assignedByRoleId_idx" ON "ReviewAssignment"("assignedByRoleId");
