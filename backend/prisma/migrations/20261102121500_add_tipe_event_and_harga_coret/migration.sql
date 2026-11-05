-- CreateEnum
CREATE TYPE "TipeEvent" AS ENUM ('ONLINE', 'OFFLINE');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "harga_coret" DECIMAL(12,2),
ADD COLUMN     "link_meet" TEXT,
ADD COLUMN     "link_wa" TEXT,
ADD COLUMN     "tipe_event" "TipeEvent" NOT NULL DEFAULT 'ONLINE';

