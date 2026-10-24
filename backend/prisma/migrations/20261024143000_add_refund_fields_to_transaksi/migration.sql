-- AlterTable
ALTER TABLE "transaksis" ADD COLUMN "refund_at" TIMESTAMP(3),
ADD COLUMN "refund_reason" TEXT,
ADD COLUMN "refund_by_admin" TEXT,
ADD COLUMN "refund_amount" DECIMAL(12,2);
