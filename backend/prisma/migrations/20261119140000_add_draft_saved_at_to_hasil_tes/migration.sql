-- AlterTable: Tambah draft_saved_at ke hasil_tes
ALTER TABLE "hasil_tes" ADD COLUMN IF NOT EXISTS "draft_saved_at" TIMESTAMP(3);

