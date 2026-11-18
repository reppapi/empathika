-- AlterEnum: Tambah status MENUNGGU_REVIEW ke StatusPengerjaan
ALTER TYPE "StatusPengerjaan" ADD VALUE IF NOT EXISTS 'MENUNGGU_REVIEW';

-- AlterTable: Tambah perlu_review_psikolog ke paket_psikotes
ALTER TABLE "paket_psikotes" ADD COLUMN IF NOT EXISTS "perlu_review_psikolog" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Tambah id_psikolog ke booking_psikotes
ALTER TABLE "booking_psikotes" ADD COLUMN IF NOT EXISTS "id_psikolog" TEXT;

-- AlterTable: Tambah catatan_psikolog, rekomendasi_psikolog, dan tanggal_review ke hasil_tes
ALTER TABLE "hasil_tes" ADD COLUMN IF NOT EXISTS "catatan_psikolog" TEXT;
ALTER TABLE "hasil_tes" ADD COLUMN IF NOT EXISTS "rekomendasi_psikolog" TEXT;
ALTER TABLE "hasil_tes" ADD COLUMN IF NOT EXISTS "tanggal_review" TIMESTAMP(3);

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'booking_psikotes_id_psikolog_fkey'
    ) THEN
        ALTER TABLE "booking_psikotes" ADD CONSTRAINT "booking_psikotes_id_psikolog_fkey" FOREIGN KEY ("id_psikolog") REFERENCES "psikologs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

