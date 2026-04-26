-- Bootstrap inicial do schema PostgreSQL antes das migrations incrementais.
-- Mantém AsaasPayment sem `paymentMethod` e sem colunas de voucher,
-- para que as migrations seguintes possam alterá-la normalmente.

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT,
  "image" TEXT,
  "bio" TEXT,
  "city" TEXT DEFAULT 'São Paulo',
  "appProfileJson" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "isTestUser" BOOLEAN NOT NULL DEFAULT false,
  "adminNotes" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_isTestUser_deletedAt_role_idx" ON "User"("isTestUser", "deletedAt", "role");

CREATE TABLE "Event" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3),
  "venueName" TEXT,
  "venueAddress" TEXT,
  "priceCents" INTEGER NOT NULL DEFAULT 0,
  "memberOnly" BOOLEAN NOT NULL DEFAULT false,
  "capacity" INTEGER,
  "imageUrl" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "planCode" TEXT NOT NULL DEFAULT 'SE_MOV',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "renewsAt" TIMESTAMP(3),
  "canceledAt" TIMESTAMP(3),
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

CREATE TABLE "EventRegistration" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'confirmed',
  "regionKey" TEXT,
  "dinnerLanguages" TEXT,
  "dinnerBudgetTiers" TEXT,
  "dietaryRestrictions" BOOLEAN NOT NULL DEFAULT false,
  "dietaryTypes" TEXT,
  "availabilitySlotsJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EventRegistration_userId_eventId_key" ON "EventRegistration"("userId", "eventId");

CREATE TABLE "AsaasPayment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "regionKey" TEXT NOT NULL,
  "asaasCustomerId" TEXT NOT NULL,
  "asaasPaymentId" TEXT NOT NULL,
  "asaasStatus" TEXT NOT NULL,
  "valueCents" INTEGER NOT NULL,
  "externalReference" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AsaasPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AsaasPayment_asaasPaymentId_key" ON "AsaasPayment"("asaasPaymentId");
CREATE UNIQUE INDEX "AsaasPayment_externalReference_key" ON "AsaasPayment"("externalReference");
CREATE INDEX "AsaasPayment_userId_eventId_idx" ON "AsaasPayment"("userId", "eventId");
CREATE INDEX "AsaasPayment_asaasPaymentId_idx" ON "AsaasPayment"("asaasPaymentId");
CREATE INDEX "AsaasPayment_asaasStatus_idx" ON "AsaasPayment"("asaasStatus");

ALTER TABLE "Subscription"
ADD CONSTRAINT "Subscription_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventRegistration"
ADD CONSTRAINT "EventRegistration_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventRegistration"
ADD CONSTRAINT "EventRegistration_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Event"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AsaasPayment"
ADD CONSTRAINT "AsaasPayment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AsaasPayment"
ADD CONSTRAINT "AsaasPayment_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Event"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
