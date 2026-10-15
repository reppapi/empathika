import type { AdminPsikotesPaketListItem, AdminPsikotesPeserta } from "../types/adminPsikotes";

export const INITIAL_PESERTA_LIST: AdminPsikotesPeserta[] = [
  { id: 1, nama: "Budi Santoso", noHp: "081234567890", paket: "Tes Kepribadian (MBTI)", tanggal: "08 Okt 2026", status: "Selesai", skor: "Tipe: INTJ", jenisAkses: "Gratis" },
  { id: 2, nama: "Siti Aminah", noHp: "081298765432", paket: "Tes Minat Karier", tanggal: "07 Okt 2026", status: "Selesai", skor: "Kuat di Analitis", jenisAkses: "Berbayar" },
  { id: 3, nama: "Andi Saputra", noHp: "085612341234", paket: "Tes Tingkat Stres", tanggal: "07 Okt 2026", status: "Berjalan", skor: "-", jenisAkses: "Gratis" },
  { id: 4, nama: "Rina Wijaya", noHp: "081122334455", paket: "Tes Kecerdasan Emosional", tanggal: "06 Okt 2026", status: "Selesai", skor: "EQ: 120", jenisAkses: "Berbayar" },
];

export const INITIAL_PAKET_LIST: AdminPsikotesPaketListItem[] = [
  { id: 1, nama: "Tes Kepribadian (MBTI)", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=100&h=100", kategori: "Kepribadian", harga: "Rp 50.000", jumlahSoal: 60, waktu: "30 Menit", status: "Aktif" },
  { id: 2, nama: "Tes Minat Karier", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=100&h=100", kategori: "Karier", harga: "Rp 75.000", jumlahSoal: 45, waktu: "45 Menit", status: "Aktif" },
  { id: 3, nama: "Tes Tingkat Stres", image: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=100&h=100", kategori: "Klinis", harga: "Gratis", jumlahSoal: 20, waktu: "15 Menit", status: "Aktif" },
];
