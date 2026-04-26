-- Vouchers/Cupons V1
CREATE TABLE "Voucher" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountPercent" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "usageLimit" INTEGER,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

ALTER TABLE "AsaasPayment"
ADD COLUMN "voucherId" TEXT,
ADD COLUMN "voucherCode" TEXT,
ADD COLUMN "discountPercent" INTEGER,
ADD COLUMN "originalValueCents" INTEGER,
ADD COLUMN "discountedValueCents" INTEGER;

CREATE INDEX "AsaasPayment_voucherId_idx" ON "AsaasPayment"("voucherId");

CREATE TABLE "VoucherRedemption" (
  "id" TEXT NOT NULL,
  "voucherId" TEXT NOT NULL,
  "asaasPaymentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VoucherRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VoucherRedemption_asaasPaymentId_key" ON "VoucherRedemption"("asaasPaymentId");
CREATE INDEX "VoucherRedemption_voucherId_createdAt_idx" ON "VoucherRedemption"("voucherId", "createdAt");
CREATE INDEX "VoucherRedemption_userId_createdAt_idx" ON "VoucherRedemption"("userId", "createdAt");

ALTER TABLE "AsaasPayment"
ADD CONSTRAINT "AsaasPayment_voucherId_fkey"
FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VoucherRedemption"
ADD CONSTRAINT "VoucherRedemption_voucherId_fkey"
FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoucherRedemption"
ADD CONSTRAINT "VoucherRedemption_asaasPaymentId_fkey"
FOREIGN KEY ("asaasPaymentId") REFERENCES "AsaasPayment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoucherRedemption"
ADD CONSTRAINT "VoucherRedemption_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
