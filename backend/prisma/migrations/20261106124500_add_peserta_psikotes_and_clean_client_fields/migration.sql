-- AlterTable: Hapus kolom demografis dari clients (dipusatkan ke peserta_psikotes untuk tes psikologi)
ALTER TABLE "clients" DROP COLUMN IF EXISTS "tempat_lahir";
ALTER TABLE "clients" DROP COLUMN IF EXISTS "tanggal_lahir";
ALTER TABLE "clients" DROP COLUMN IF EXISTS "pendidikan";
ALTER TABLE "clients" DROP COLUMN IF EXISTS "pekerjaan";
ALTER TABLE "clients" DROP COLUMN IF EXISTS "status_pernikahan";

-- CreateTable: peserta_psikotes
CREATE TABLE IF NOT EXISTS "peserta_psikotes" (
    "id" TEXT NOT NULL,
    "id_booking" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "jenis_kelamin" TEXT NOT NULL,
    "tempat_lahir" TEXT,
    "tanggal_lahir" TIMESTAMP(3),
    "usia" INTEGER,
    "kategori_peserta" TEXT,
    "nama_orang_tua" TEXT,
    "no_telepon_orang_tua" TEXT,
    "pendidikan" TEXT,
    "pekerjaan" TEXT,
    "status_pernikahan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "peserta_psikotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "peserta_psikotes_id_booking_key" ON "peserta_psikotes"("id_booking");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'peserta_psikotes_id_booking_fkey'
    ) THEN
        ALTER TABLE "peserta_psikotes" ADD CONSTRAINT "peserta_psikotes_id_booking_fkey" FOREIGN KEY ("id_booking") REFERENCES "booking_psikotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

