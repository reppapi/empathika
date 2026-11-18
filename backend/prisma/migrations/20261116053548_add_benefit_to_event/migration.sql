/*
  Warnings:

  - You are about to drop the column `makna` on the `interpretasi_psikotes` table. All the data in the column will be lost.
  - You are about to drop the column `benefits` on the `paket_psikotes` table. All the data in the column will be lost.
  - You are about to drop the column `deskripsi` on the `paket_psikotes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_booking,id_soal_psikotes]` on the table `jawaban_psikotes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_paket,urutan]` on the table `soal_psikotes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "hasil_tes" DROP CONSTRAINT "hasil_tes_id_interpretasi_fkey";

-- AlterTable
ALTER TABLE "alat_ukurs" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "booking_events" ADD COLUMN     "jumlah_peserta" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nama_peserta_tambahan" JSONB;

-- AlterTable
ALTER TABLE "event_dokumentasi" ADD COLUMN     "kategori" TEXT NOT NULL DEFAULT 'KOLABORASI';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "benefit" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "paket_bundling" JSONB;

-- AlterTable
ALTER TABLE "hasil_tes" ALTER COLUMN "id_interpretasi" DROP NOT NULL;

-- AlterTable
ALTER TABLE "interpretasi_psikotes" DROP COLUMN "makna";

-- AlterTable
ALTER TABLE "layanans" ADD COLUMN     "tarif_tenaga_ahli" JSONB;

-- AlterTable
ALTER TABLE "paket_psikotes" DROP COLUMN "benefits",
DROP COLUMN "deskripsi";

-- AlterTable
ALTER TABLE "peserta_psikotes" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "interpretasi_psikotes_id_paket_idx" ON "interpretasi_psikotes"("id_paket");

-- CreateIndex
CREATE UNIQUE INDEX "jawaban_psikotes_id_booking_id_soal_psikotes_key" ON "jawaban_psikotes"("id_booking", "id_soal_psikotes");

-- CreateIndex
CREATE INDEX "pilihan_jawabans_id_soal_idx" ON "pilihan_jawabans"("id_soal");

-- CreateIndex
CREATE INDEX "soal_psikotes_id_paket_idx" ON "soal_psikotes"("id_paket");

-- CreateIndex
CREATE UNIQUE INDEX "soal_psikotes_id_paket_urutan_key" ON "soal_psikotes"("id_paket", "urutan");

-- AddForeignKey
ALTER TABLE "paket_psikotes" ADD CONSTRAINT "paket_psikotes_id_alat_ukur_fkey" FOREIGN KEY ("id_alat_ukur") REFERENCES "alat_ukurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_tes" ADD CONSTRAINT "hasil_tes_id_interpretasi_fkey" FOREIGN KEY ("id_interpretasi") REFERENCES "interpretasi_psikotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
