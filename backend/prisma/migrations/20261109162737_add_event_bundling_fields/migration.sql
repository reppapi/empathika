-- AlterTable
ALTER TABLE "events" ADD COLUMN "harga_bundling" DECIMAL(12,2),
ADD COLUMN "kuota_tiket_bundling" INTEGER DEFAULT 2,
ADD COLUMN "nama_bundling" TEXT;

