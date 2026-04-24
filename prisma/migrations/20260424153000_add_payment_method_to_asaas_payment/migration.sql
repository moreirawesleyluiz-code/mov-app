-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD');

-- AlterTable
ALTER TABLE "AsaasPayment"
ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PIX';
