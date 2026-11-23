-- AlterEnum
ALTER TYPE "StatusPembayaran" ADD VALUE 'HANGUS';

-- AlterEnum
ALTER TYPE "AlasanPembagian" ADD VALUE 'REFUND_POTONGAN_30';
ALTER TYPE "AlasanPembagian" ADD VALUE 'SESI_HANGUS';

-- AlterTable
ALTER TABLE "pembagian_transaksi" ADD COLUMN "tanggal_dibayarkan" TIMESTAMP(3),
ADD COLUMN "dibayarkan_oleh" TEXT,
ADD COLUMN "catatan_pembayaran" TEXT;
