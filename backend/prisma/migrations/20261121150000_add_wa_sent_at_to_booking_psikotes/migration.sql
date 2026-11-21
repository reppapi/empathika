-- AlterTable: Tambah kolom wa_sent_at ke booking_psikotes untuk melacak pengiriman laporan via WA oleh admin
ALTER TABLE "booking_psikotes" ADD COLUMN IF NOT EXISTS "wa_sent_at" TIMESTAMP(3);

