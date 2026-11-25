-- CreateTable
CREATE TABLE IF NOT EXISTS "internship_positions" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "divisi" TEXT,
    "durasi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "workMode" TEXT NOT NULL,
    "kompensasi" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "deskripsi" TEXT,
    "responsibilities" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "qualifications" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "applyUrl" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_positions_pkey" PRIMARY KEY ("id")
);
