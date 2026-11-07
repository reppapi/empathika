-- CreateTable
CREATE TABLE IF NOT EXISTS "event_dokumentasi" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_dokumentasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "event_dokumentasi_foto" (
    "id" TEXT NOT NULL,
    "id_event_dokumentasi" TEXT NOT NULL,
    "foto_url" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_dokumentasi_foto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'event_dokumentasi_foto_id_event_dokumentasi_fkey'
    ) THEN
        ALTER TABLE "event_dokumentasi_foto" ADD CONSTRAINT "event_dokumentasi_foto_id_event_dokumentasi_fkey" FOREIGN KEY ("id_event_dokumentasi") REFERENCES "event_dokumentasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

