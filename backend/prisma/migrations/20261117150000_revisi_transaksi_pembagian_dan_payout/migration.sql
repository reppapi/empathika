-- CreateEnum
CREATE TYPE "StatusPayout" AS ENUM ('BELUM_DICAIRKAN', 'DIPROSES', 'BERHASIL', 'GAGAL');

-- CreateEnum
CREATE TYPE "TipePenerima" AS ENUM ('PSIKOLOG', 'BIRO', 'EMPATHIKA');

-- CreateEnum
CREATE TYPE "AlasanPembagian" AS ENUM ('SESI_NORMAL', 'DP_HANGUS');

-- AlterTable biros
ALTER TABLE "biros" ADD COLUMN "bank_code" TEXT,
ADD COLUMN "nomor_rekening" TEXT,
ADD COLUMN "nama_pemilik_rek" TEXT;

-- AlterTable psikologs
ALTER TABLE "psikologs" ADD COLUMN "bank_code" TEXT,
ADD COLUMN "nomor_rekening" TEXT,
ADD COLUMN "nama_pemilik_rek" TEXT;

-- AlterTable transaksis
ALTER TABLE "transaksis" ADD COLUMN "id_biro_tenant" TEXT,
ADD COLUMN "harga_dasar" DECIMAL(12,2),
ADD COLUMN "biaya_layanan" DECIMAL(12,2),
ADD COLUMN "komisi_biro" DECIMAL(12,2),
ADD COLUMN "nominal_ditahan" DECIMAL(12,2),
ADD COLUMN "nominal_dikembalikan" DECIMAL(12,2),
ADD COLUMN "alasan_penahanan" TEXT;

-- CreateTable pembagian_transaksi
CREATE TABLE "pembagian_transaksi" (
    "id" TEXT NOT NULL,
    "id_transaksi" TEXT NOT NULL,
    "penerima_tipe" "TipePenerima" NOT NULL,
    "penerima_id" TEXT,
    "jumlah" DECIMAL(12,2) NOT NULL,
    "alasan" "AlasanPembagian" NOT NULL DEFAULT 'SESI_NORMAL',
    "status" "StatusPayout" NOT NULL DEFAULT 'BELUM_DICAIRKAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembagian_transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable payouts
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "id_pembagian" TEXT NOT NULL,
    "id_biro" TEXT,
    "xendit_payout_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "jumlah" DECIMAL(12,2) NOT NULL,
    "fee_payout" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "StatusPayout" NOT NULL DEFAULT 'BELUM_DICAIRKAN',
    "error_message" TEXT,
    "attempted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pembagian_transaksi_id_transaksi_idx" ON "pembagian_transaksi"("id_transaksi");
CREATE INDEX "pembagian_transaksi_status_idx" ON "pembagian_transaksi"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_xendit_payout_id_key" ON "payouts"("xendit_payout_id");
CREATE UNIQUE INDEX "payouts_idempotency_key_key" ON "payouts"("idempotency_key");
CREATE INDEX "payouts_id_pembagian_idx" ON "payouts"("id_pembagian");
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- AddForeignKey
ALTER TABLE "transaksis" ADD CONSTRAINT "transaksis_id_biro_tenant_fkey" FOREIGN KEY ("id_biro_tenant") REFERENCES "biros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembagian_transaksi" ADD CONSTRAINT "pembagian_transaksi_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_id_pembagian_fkey" FOREIGN KEY ("id_pembagian") REFERENCES "pembagian_transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_id_biro_fkey" FOREIGN KEY ("id_biro") REFERENCES "biros"("id") ON DELETE SET NULL ON UPDATE CASCADE;
