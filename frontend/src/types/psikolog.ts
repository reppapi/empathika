// frontend/src/types/psikolog.ts

// ==========================================
// 1. TIPE ASLI DARI DATABASE PRISMA
// ==========================================
export interface Spesialisasi {
  id: string;
  nama: string;
}

export interface JadwalSlot {
  id: string;
  id_psikolog: string;
  tanggal: string; // Akan berupa ISO string saat di-fetch ke frontend
  jam_mulai: string;
  jam_selesai: string;
  status: 'TERSEDIA' | 'SUDAH_DIBOOKING' | 'TIDAK_TERSEDIA';
}

export interface Psikolog {
  id: string;
  id_spesialisasi: string;
  nama_gelar: string;
  email: string;
  no_str: string | null;
  foto: string | null;
  bio: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  jumlah_sesi: number;
  tarif_per_jam: number; 
  
  // Relasi (Biasanya di-include saat fetching Prisma)
  spesialisasi?: Spesialisasi;
  jadwal_slot?: JadwalSlot[];
}

export interface PsikologFilter {
  id_spesialisasi?: string;
  hargaMin?: number;
  hargaMax?: number;
  search?: string;
}

// ==========================================
// 2. TIPE KHUSUS UNTUK KEBUTUHAN UI FRONTEND
// ==========================================
export type KategoriProfesional = 'semua' | 'psikolog' | 'konselor';

// Karena DB tidak menyimpan info online/offline pada jadwal, kita buat struktur UI
export interface JadwalUI {
  waktu: string;
  tipe: 'online' | 'offline';
}

export interface PsikologUI extends Psikolog {
  category?: KategoriProfesional; // Opsional agar kompatibel dengan data API Prisma
  experienceYears?: string;       // Opsional (fallback otomatis jika dari DB)
  labelJadwal?: string;           // Opsional
  jadwalTersedia?: JadwalUI[];    // Opsional
  quote?: string;                 // Quote / Prinsip / Fun fact tentang diri
  instagram?: string;             // Username instagram
  jenisKelamin?: string;          // Jenis kelamin
  pendidikanText?: string;        // Institusi pendidikan
  keahlian?: string[];            // Area keahlian / fokus topik konseling
}