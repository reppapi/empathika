-- AlterTable: Tambahkan no_telepon ke peserta_psikotes
ALTER TABLE "peserta_psikotes" ADD COLUMN IF NOT EXISTS "no_telepon" TEXT;

-- Sinkronkan data lama jika ada: salin nomor dari no_telepon_orang_tua jika no_telepon masih kosong
UPDATE "peserta_psikotes"
SET "no_telepon" = "no_telepon_orang_tua"
WHERE "no_telepon" IS NULL AND "no_telepon_orang_tua" IS NOT NULL;

