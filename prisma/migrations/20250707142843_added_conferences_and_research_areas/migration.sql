-- CreateEnum
CREATE TYPE "ConferenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PrimaryResearchArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PrimaryResearchArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecondaryResearchArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryResearchAreaId" TEXT NOT NULL,

    CONSTRAINT "SecondaryResearchArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conference" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locationVenue" TEXT NOT NULL,
    "locationCity" TEXT NOT NULL,
    "locationCountry" TEXT NOT NULL,
    "callForPapers" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "abstractDeadline" TIMESTAMP(3) NOT NULL,
    "submissionDeadline" TIMESTAMP(3) NOT NULL,
    "cameraReadyDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ConferenceStatus" NOT NULL DEFAULT 'PENDING',
    "mainChairId" TEXT NOT NULL,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConferenceChairs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConferenceChairs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConferenceReviewers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConferenceReviewers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConferenceResearchAreas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConferenceResearchAreas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrimaryResearchArea_name_key" ON "PrimaryResearchArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SecondaryResearchArea_name_key" ON "SecondaryResearchArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Conference_acronym_key" ON "Conference"("acronym");

-- CreateIndex
CREATE INDEX "_ConferenceChairs_B_index" ON "_ConferenceChairs"("B");

-- CreateIndex
CREATE INDEX "_ConferenceReviewers_B_index" ON "_ConferenceReviewers"("B");

-- CreateIndex
CREATE INDEX "_ConferenceResearchAreas_B_index" ON "_ConferenceResearchAreas"("B");

-- AddForeignKey
ALTER TABLE "SecondaryResearchArea" ADD CONSTRAINT "SecondaryResearchArea_primaryResearchAreaId_fkey" FOREIGN KEY ("primaryResearchAreaId") REFERENCES "PrimaryResearchArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conference" ADD CONSTRAINT "Conference_mainChairId_fkey" FOREIGN KEY ("mainChairId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferenceChairs" ADD CONSTRAINT "_ConferenceChairs_A_fkey" FOREIGN KEY ("A") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferenceChairs" ADD CONSTRAINT "_ConferenceChairs_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferenceReviewers" ADD CONSTRAINT "_ConferenceReviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferenceReviewers" ADD CONSTRAINT "_ConferenceReviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferenceResearchAreas" ADD CONSTRAINT "_ConferenceResearchAreas_A_fkey" FOREIGN KEY ("A") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferenceResearchAreas" ADD CONSTRAINT "_ConferenceResearchAreas_B_fkey" FOREIGN KEY ("B") REFERENCES "PrimaryResearchArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
