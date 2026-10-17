-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'PSIKOLOG');

-- CreateEnum
CREATE TYPE "StatusBiro" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "JenisEvent" AS ENUM ('WEBINAR', 'WORKSHOP', 'SEMINAR');

-- CreateEnum
CREATE TYPE "StatusEvent" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "KategoriLayanan" AS ENUM ('KONSULTASI_INDIVIDU', 'KONSULTASI_PASANGAN', 'KONSULTASI_ANAK');

-- CreateEnum
CREATE TYPE "StatusBooking" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('TRANSFER_BANK', 'E_WALLET', 'CREDIT_CARD', 'QRIS');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "StatusPsikolog" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "JenisAksesPsikotes" AS ENUM ('GRATIS', 'BERBAYAR');

-- CreateEnum
CREATE TYPE "StatusSlot" AS ENUM ('TERSEDIA', 'SUDAH_DIBOOKING', 'TIDAK_TERSEDIA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "id_biro" TEXT,
    "nama" TEXT NOT NULL,
    "no_telepon" TEXT,
    "deskripsi_trauma" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biros" (
    "id" TEXT NOT NULL,
    "nama_biro" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "logoURI" TEXT,
    "warna_tema" TEXT,
    "alamat" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "status" "StatusBiro" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "biros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "jenis_event" "JenisEvent" NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jam_mulai" TIME NOT NULL,
    "durasi_menit" INTEGER NOT NULL,
    "lokasi" TEXT,
    "kuota" INTEGER NOT NULL,
    "harga" DECIMAL(12,2) NOT NULL,
    "banner_url" TEXT,
    "nama_pembicara" TEXT NOT NULL,
    "status" "StatusEvent" NOT NULL DEFAULT 'UPCOMING',

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layanans" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" "KategoriLayanan" NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "harga_weekday" DECIMAL(12,2) NOT NULL,
    "harga_weekend" DECIMAL(12,2) NOT NULL,
    "banner_url" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "layanans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spesialisasi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "spesialisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psikologs" (
    "id" TEXT NOT NULL,
    "id_spesialisasi" TEXT NOT NULL,
    "nama_gelar" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "no_str" TEXT,
    "foto" TEXT,
    "bio" TEXT,
    "status" "StatusPsikolog" NOT NULL DEFAULT 'ACTIVE',
    "jumlah_sesi" INTEGER NOT NULL DEFAULT 0,
    "tarif_per_jam" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "psikologs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal_slots" (
    "id" TEXT NOT NULL,
    "id_psikolog" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jam_mulai" TIME NOT NULL,
    "jam_selesai" TIME NOT NULL,
    "status" "StatusSlot" NOT NULL DEFAULT 'TERSEDIA',

    CONSTRAINT "jadwal_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonis" (
    "id" TEXT NOT NULL,
    "id_psikolog" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "anonim" BOOLEAN NOT NULL DEFAULT false,
    "nama_pemberi" TEXT,

    CONSTRAINT "testimonis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksis" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "biaya_admin" DECIMAL(12,2) NOT NULL,
    "metode_pembayaran" "MetodePembayaran" NOT NULL,
    "status_pembayaran" "StatusPembayaran" NOT NULL DEFAULT 'PENDING',
    "tanggal_bayar" TIMESTAMP(3),
    "data_pembayaran" TEXT,

    CONSTRAINT "transaksis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_konsultasi" (
    "id" TEXT NOT NULL,
    "kode_pesanan" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_layanan" TEXT NOT NULL,
    "id_jadwal" TEXT NOT NULL,
    "id_transaksi" TEXT NOT NULL,
    "deskripsi_trauma" TEXT,
    "status" "StatusBooking" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "booking_konsultasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_events" (
    "id" TEXT NOT NULL,
    "id_event" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_transaksi" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,

    CONSTRAINT "booking_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paket_psikotes" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "jenis_akses" "JenisAksesPsikotes" NOT NULL,
    "harga" DECIMAL(12,2) NOT NULL,
    "bannerURL" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deskripsi" TEXT,

    CONSTRAINT "paket_psikotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soal_psikotes" (
    "id" TEXT NOT NULL,
    "id_paket" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "pertanyaan" TEXT NOT NULL,

    CONSTRAINT "soal_psikotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilihan_jawabans" (
    "id" TEXT NOT NULL,
    "id_soal" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "teks_jawaban" TEXT NOT NULL,
    "bobot" INTEGER NOT NULL,

    CONSTRAINT "pilihan_jawabans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interpretasi_psikotes" (
    "id" TEXT NOT NULL,
    "id_paket" TEXT NOT NULL,
    "min_skor" INTEGER NOT NULL,
    "max_skor" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,

    CONSTRAINT "interpretasi_psikotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_psikotes" (
    "id" TEXT NOT NULL,
    "id_paket" TEXT NOT NULL,
    "id_transaksi" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_psikotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jawaban_psikotes" (
    "id" TEXT NOT NULL,
    "id_booking" TEXT NOT NULL,
    "id_soal_psikotes" TEXT NOT NULL,
    "id_pilihan_jawaban" TEXT NOT NULL,
    "skor" INTEGER NOT NULL,

    CONSTRAINT "jawaban_psikotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasil_tes" (
    "id" TEXT NOT NULL,
    "id_booking" TEXT NOT NULL,
    "id_interpretasi" TEXT NOT NULL,
    "total_skor" INTEGER NOT NULL,
    "tanggal_selesai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hasil_tes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artikel_blogs" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "waktu_baca_menit" INTEGER NOT NULL,
    "tanggal_terbit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlah_dilihat" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "artikel_blogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "biros_slug_key" ON "biros"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "psikologs_email_key" ON "psikologs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "booking_konsultasi_kode_pesanan_key" ON "booking_konsultasi"("kode_pesanan");

-- CreateIndex
CREATE UNIQUE INDEX "booking_konsultasi_id_jadwal_key" ON "booking_konsultasi"("id_jadwal");

-- CreateIndex
CREATE UNIQUE INDEX "booking_konsultasi_id_transaksi_key" ON "booking_konsultasi"("id_transaksi");

-- CreateIndex
CREATE UNIQUE INDEX "booking_events_id_transaksi_key" ON "booking_events"("id_transaksi");

-- CreateIndex
CREATE UNIQUE INDEX "booking_psikotes_id_transaksi_key" ON "booking_psikotes"("id_transaksi");

-- CreateIndex
CREATE UNIQUE INDEX "hasil_tes_id_booking_key" ON "hasil_tes"("id_booking");

-- CreateIndex
CREATE UNIQUE INDEX "artikel_blogs_slug_key" ON "artikel_blogs"("slug");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_biro_fkey" FOREIGN KEY ("id_biro") REFERENCES "biros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biros" ADD CONSTRAINT "biros_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psikologs" ADD CONSTRAINT "psikologs_id_spesialisasi_fkey" FOREIGN KEY ("id_spesialisasi") REFERENCES "spesialisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_slots" ADD CONSTRAINT "jadwal_slots_id_psikolog_fkey" FOREIGN KEY ("id_psikolog") REFERENCES "psikologs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonis" ADD CONSTRAINT "testimonis_id_psikolog_fkey" FOREIGN KEY ("id_psikolog") REFERENCES "psikologs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksis" ADD CONSTRAINT "transaksis_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_konsultasi" ADD CONSTRAINT "booking_konsultasi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_konsultasi" ADD CONSTRAINT "booking_konsultasi_id_layanan_fkey" FOREIGN KEY ("id_layanan") REFERENCES "layanans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_konsultasi" ADD CONSTRAINT "booking_konsultasi_id_jadwal_fkey" FOREIGN KEY ("id_jadwal") REFERENCES "jadwal_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_konsultasi" ADD CONSTRAINT "booking_konsultasi_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soal_psikotes" ADD CONSTRAINT "soal_psikotes_id_paket_fkey" FOREIGN KEY ("id_paket") REFERENCES "paket_psikotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pilihan_jawabans" ADD CONSTRAINT "pilihan_jawabans_id_soal_fkey" FOREIGN KEY ("id_soal") REFERENCES "soal_psikotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interpretasi_psikotes" ADD CONSTRAINT "interpretasi_psikotes_id_paket_fkey" FOREIGN KEY ("id_paket") REFERENCES "paket_psikotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_psikotes" ADD CONSTRAINT "booking_psikotes_id_paket_fkey" FOREIGN KEY ("id_paket") REFERENCES "paket_psikotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_psikotes" ADD CONSTRAINT "booking_psikotes_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_psikotes" ADD CONSTRAINT "booking_psikotes_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jawaban_psikotes" ADD CONSTRAINT "jawaban_psikotes_id_booking_fkey" FOREIGN KEY ("id_booking") REFERENCES "booking_psikotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jawaban_psikotes" ADD CONSTRAINT "jawaban_psikotes_id_soal_psikotes_fkey" FOREIGN KEY ("id_soal_psikotes") REFERENCES "soal_psikotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jawaban_psikotes" ADD CONSTRAINT "jawaban_psikotes_id_pilihan_jawaban_fkey" FOREIGN KEY ("id_pilihan_jawaban") REFERENCES "pilihan_jawabans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_tes" ADD CONSTRAINT "hasil_tes_id_booking_fkey" FOREIGN KEY ("id_booking") REFERENCES "booking_psikotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_tes" ADD CONSTRAINT "hasil_tes_id_interpretasi_fkey" FOREIGN KEY ("id_interpretasi") REFERENCES "interpretasi_psikotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
