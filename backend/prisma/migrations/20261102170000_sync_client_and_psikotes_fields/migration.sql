-- AlterTable: Tambahkan field pendukung biodata klien
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "tempat_lahir" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "tanggal_lahir" TIMESTAMP(3);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pendidikan" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pekerjaan" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "status_pernikahan" TEXT;

-- AlterTable: Field tambahan psikotes & alat ukur
CREATE TABLE IF NOT EXISTS "alat_ukurs" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alat_ukurs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "alat_ukurs_kode_key" ON "alat_ukurs"("kode");

ALTER TABLE "paket_psikotes" ADD COLUMN IF NOT EXISTS "id_alat_ukur" TEXT;
ALTER TABLE "paket_psikotes" ADD COLUMN IF NOT EXISTS "tentang_tes" TEXT;
ALTER TABLE "hasil_tes" ADD COLUMN IF NOT EXISTS "snapshot_jawaban" JSONB;
ALTER TABLE "booking_psikotes" ADD COLUMN IF NOT EXISTS "riwayat_kesehatan" JSONB;

