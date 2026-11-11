-- AlterTable: Tambahkan no_telepon ke peserta_psikotes
ALTER TABLE "peserta_psikotes" ADD COLUMN IF NOT EXISTS "no_telepon" TEXT;

-- Sinkronkan data lama jika ada: salin nomor dari no_telepon_orang_tua jika no_telepon masih kosong
UPDATE "peserta_psikotes"
SET "no_telepon" = "no_telepon_orang_tua"
WHERE "no_telepon" IS NULL AND "no_telepon_orang_tua" IS NOT NULL;

-- Sinkronkan kategori_peserta lama berdasarkan kolom usia jika masih kosong
UPDATE "peserta_psikotes"
SET "kategori_peserta" = CASE
  WHEN "usia" IS NOT NULL AND "usia" < 12 THEN 'ANAK'
  WHEN "usia" IS NOT NULL AND "usia" <= 17 THEN 'REMAJA'
  WHEN "usia" IS NOT NULL AND "usia" >= 18 THEN 'DEWASA'
  ELSE "kategori_peserta"
END
WHERE "kategori_peserta" IS NULL AND "usia" IS NOT NULL;

