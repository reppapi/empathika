-- Migration: add_token_aktivasi_and_no_silp
-- Deskripsi:
--   1. Tambah kolom token_aktivasi & token_aktivasi_exp di tabel accounts
--   2. Ubah password menjadi nullable di tabel accounts
--   3. Ubah default aktif menjadi false di tabel accounts
--   4. Tambah kolom no_silp di tabel psikologs

-- ─────────────────────────────────────────────
-- 1. Tabel accounts: tambah token_aktivasi
-- ─────────────────────────────────────────────
ALTER TABLE "accounts"
  ADD COLUMN IF NOT EXISTS "token_aktivasi"     TEXT,
  ADD COLUMN IF NOT EXISTS "token_aktivasi_exp" TIMESTAMP(3);

-- Unique constraint untuk token_aktivasi
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'accounts_token_aktivasi_key'
  ) THEN
    ALTER TABLE "accounts"
      ADD CONSTRAINT "accounts_token_aktivasi_key" UNIQUE ("token_aktivasi");
  END IF;
END
$$;

-- ─────────────────────────────────────────────
-- 2. Tabel accounts: password nullable
-- ─────────────────────────────────────────────
ALTER TABLE "accounts"
  ALTER COLUMN "password" DROP NOT NULL;

-- ─────────────────────────────────────────────
-- 3. Tabel accounts: default aktif = false
-- ─────────────────────────────────────────────
ALTER TABLE "accounts"
  ALTER COLUMN "aktif" SET DEFAULT false;

-- ─────────────────────────────────────────────
-- 4. Tabel psikologs: tambah no_silp
-- ─────────────────────────────────────────────
ALTER TABLE "psikologs"
  ADD COLUMN IF NOT EXISTS "no_silp" TEXT;
