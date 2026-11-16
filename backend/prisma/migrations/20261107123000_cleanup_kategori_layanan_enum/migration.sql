-- Step 1: Update existing layanans that might have legacy categories to KONSULTASI
UPDATE "layanans" 
SET "kategori" = 'KONSULTASI' 
WHERE "kategori"::text IN ('PSIKOTES', 'PELATIHAN_PEER_HELPER', 'EVENT');

-- Step 2: Create new clean enum type with only active official service categories
CREATE TYPE "KategoriLayanan_new" AS ENUM ('KONSULTASI', 'WORKSHOP', 'SEMINAR', 'ASESMEN');

-- Step 3: Alter column to use new enum type
ALTER TABLE "layanans" 
ALTER COLUMN "kategori" TYPE "KategoriLayanan_new" 
USING ("kategori"::text::"KategoriLayanan_new");

-- Step 4: Drop old enum type
DROP TYPE "KategoriLayanan";

-- Step 5: Rename new enum type to KategoriLayanan
ALTER TYPE "KategoriLayanan_new" RENAME TO "KategoriLayanan";

