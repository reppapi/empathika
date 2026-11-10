-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StatusPengerjaan') THEN
        CREATE TYPE "StatusPengerjaan" AS ENUM ('BELUM_MULAI', 'SELESAI');
    END IF;
END $$;

-- AlterTable: Tambahkan kode_akses dan status_pengerjaan ke booking_psikotes
ALTER TABLE "booking_psikotes" ADD COLUMN IF NOT EXISTS "kode_akses" TEXT;
ALTER TABLE "booking_psikotes" ADD COLUMN IF NOT EXISTS "status_pengerjaan" "StatusPengerjaan" NOT NULL DEFAULT 'BELUM_MULAI';

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "booking_psikotes_kode_akses_key" ON "booking_psikotes"("kode_akses");

-- Sinkronkan data lama: booking yang sudah memiliki hasil_tes otomatis diset SELESAI
UPDATE "booking_psikotes"
SET "status_pengerjaan" = 'SELESAI'
WHERE "id" IN (SELECT "id_booking" FROM "hasil_tes");

