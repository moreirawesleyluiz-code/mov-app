-- AlterTable
ALTER TABLE "Voucher" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "section" TEXT,
    "answerValue" TEXT NOT NULL,
    "answerLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompatibilityProfile" (
    "userId" TEXT NOT NULL,
    "axesJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompatibilityProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PartnerRestaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "statusLabel" TEXT NOT NULL DEFAULT 'ativo',
    "partnerType" TEXT NOT NULL DEFAULT 'restaurant',
    "regionKey" TEXT,
    "city" TEXT,
    "neighborhood" TEXT,
    "address" TEXT,
    "locationNotes" TEXT,
    "environmentType" TEXT,
    "houseStyle" TEXT,
    "experienceTypesJson" TEXT,
    "curationTagsJson" TEXT,
    "audienceProfileJson" TEXT,
    "priceTiersJson" TEXT NOT NULL,
    "estimatedTicketCents" INTEGER,
    "seatsPerTableMax" INTEGER NOT NULL DEFAULT 6,
    "tableCapacity" INTEGER NOT NULL DEFAULT 10,
    "acceptsDietaryJson" TEXT,
    "dietaryFlexibility" TEXT NOT NULL DEFAULT 'moderada',
    "cuisineCategories" TEXT,
    "availabilityKeysJson" TEXT,
    "operationalTimezoneIana" TEXT,
    "scheduleJson" TEXT,
    "premiumLevel" TEXT NOT NULL DEFAULT 'standard',
    "fitLightTables" INTEGER NOT NULL DEFAULT 55,
    "fitDeepTables" INTEGER NOT NULL DEFAULT 55,
    "fitPremiumExperience" INTEGER NOT NULL DEFAULT 50,
    "fitFirstEncounter" INTEGER NOT NULL DEFAULT 60,
    "fitExtrovertedGroup" INTEGER NOT NULL DEFAULT 55,
    "fitIntimateGroup" INTEGER NOT NULL DEFAULT 55,
    "internalContact" TEXT,
    "operationalNotes" TEXT,
    "curadoriaNotes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerRestaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminCuratedTable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "eventId" TEXT,
    "partnerRestaurantId" TEXT,
    "allocationMetaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminCuratedTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminCuratedTableMember" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminCuratedTableMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventExperienceFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rating" INTEGER,
    "answersJson" TEXT,
    "comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventExperienceFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyReport" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "eventId" TEXT,
    "reportedUserId" TEXT,
    "reportedPersonRef" TEXT,
    "evidenceLinksJson" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "OnboardingAnswer_userId_idx" ON "OnboardingAnswer"("userId");

-- CreateIndex
CREATE INDEX "OnboardingAnswer_section_idx" ON "OnboardingAnswer"("section");

-- CreateIndex
CREATE INDEX "OnboardingAnswer_questionId_idx" ON "OnboardingAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingAnswer_userId_questionId_key" ON "OnboardingAnswer"("userId", "questionId");

-- CreateIndex
CREATE INDEX "AdminCuratedTable_eventId_partnerRestaurantId_idx" ON "AdminCuratedTable"("eventId", "partnerRestaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminCuratedTableMember_userId_key" ON "AdminCuratedTableMember"("userId");

-- CreateIndex
CREATE INDEX "AdminCuratedTableMember_tableId_idx" ON "AdminCuratedTableMember"("tableId");

-- CreateIndex
CREATE INDEX "EventExperienceFeedback_eventId_createdAt_idx" ON "EventExperienceFeedback"("eventId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventExperienceFeedback_userId_eventId_key" ON "EventExperienceFeedback"("userId", "eventId");

-- CreateIndex
CREATE INDEX "SafetyReport_reporterUserId_createdAt_idx" ON "SafetyReport"("reporterUserId", "createdAt");

-- CreateIndex
CREATE INDEX "SafetyReport_eventId_idx" ON "SafetyReport"("eventId");

-- CreateIndex
CREATE INDEX "SafetyReport_status_idx" ON "SafetyReport"("status");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingAnswer" ADD CONSTRAINT "OnboardingAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilityProfile" ADD CONSTRAINT "CompatibilityProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminCuratedTable" ADD CONSTRAINT "AdminCuratedTable_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminCuratedTable" ADD CONSTRAINT "AdminCuratedTable_partnerRestaurantId_fkey" FOREIGN KEY ("partnerRestaurantId") REFERENCES "PartnerRestaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminCuratedTableMember" ADD CONSTRAINT "AdminCuratedTableMember_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "AdminCuratedTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminCuratedTableMember" ADD CONSTRAINT "AdminCuratedTableMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventExperienceFeedback" ADD CONSTRAINT "EventExperienceFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventExperienceFeedback" ADD CONSTRAINT "EventExperienceFeedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
