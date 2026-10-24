-- CreateEnum
CREATE TYPE "StatusPengirimanInvoice" AS ENUM ('BELUM_DIKIRIM', 'DIKIRIM', 'GAGAL');

-- CreateTable
CREATE TABLE "invoices" (
    "id"             TEXT NOT NULL,
    "nomor"          TEXT NOT NULL,
    "id_transaksi"   TEXT NOT NULL,
    "nama_client"    TEXT NOT NULL,
    "no_wa_client"   TEXT,
    "nama_psikolog"  TEXT NOT NULL,
    "judul_layanan"  TEXT NOT NULL,
    "tanggal_sesi"   TIMESTAMP(3) NOT NULL,
    "jenis_sesi"     TEXT NOT NULL,
    "harga"          DECIMAL(12,2) NOT NULL,
    "metode_bayar"   TEXT NOT NULL,
    "tanggal_bayar"  TIMESTAMP(3),
    "tanggal_terbit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_kirim"   "StatusPengirimanInvoice" NOT NULL DEFAULT 'BELUM_DIKIRIM',
    "sent_at"        TIMESTAMP(3),
    "sent_by_admin"  TEXT,
    "gagal_alasan"   TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (concurrency-safe unique constraints)
CREATE UNIQUE INDEX "invoices_nomor_key" ON "invoices"("nomor");
CREATE UNIQUE INDEX "invoices_id_transaksi_key" ON "invoices"("id_transaksi");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_id_transaksi_fkey"
    FOREIGN KEY ("id_transaksi") REFERENCES "transaksis"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
