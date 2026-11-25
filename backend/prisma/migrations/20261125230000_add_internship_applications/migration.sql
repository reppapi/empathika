-- CreateTable
CREATE TABLE IF NOT EXISTS "internship_applications" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "positionTitle" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "universitas" TEXT NOT NULL,
    "jurusan" TEXT,
    "semester" TEXT,
    "cvUrl" TEXT,
    "portfolioUrl" TEXT,
    "jawaban" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "catatanAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_applications_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "internship_positions" ADD COLUMN IF NOT EXISTS "questions" JSONB NOT NULL DEFAULT '[]'::jsonb;
