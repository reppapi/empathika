-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "youtube" TEXT;

-- AlterTable
ALTER TABLE "paket_psikotes" ADD COLUMN     "benefits" JSONB;
