/** Definisi tipe TypeScript untuk manajemen paket tes, interpretasi, dan peserta psikotes di admin. */
export type SoalOption = { text: string; bobot: string };

export type Soal = { id: string | number; tipe: string; teks: string; pilihan: SoalOption[] };

export type Tip = { title: string; desc: string };

export type Interpretasi = {
  id: string | number;
  min: string;
  max: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  makna?: string;
  saran: Tip[];
  kekuatanUtama?: string[];
  blindspots?: string[];
  lingkunganOptimal?: string[];
  judulKekuatan?: string;
  judulBlindspots?: string;
  judulLingkungan?: string;
};

export type JenisAkses = "Gratis" | "Berbayar";
export type StatusPaket = "Aktif" | "Draf";

export type PaketDetailItem = {
  id: string | number;
  judulId: string | number;
  namaJudul: string;
  kategori: string;
  deskripsi: string;
  bannerUrl?: string;
  jenisAkses: JenisAkses;
  harga: string;
  numericHarga: number;
  waktu: string;
  status: StatusPaket;
  jumlahSoal: number;
  soalList?: Soal[];
  interpretasiList: Interpretasi[];
  updatedAt?: string;
  pesertaCount?: number;
};

export type JudulPsikotesItem = {
  id: string | number;
  judul: string;
  kategori: string;
  deskripsi: string;
  image: string;
  paketList: PaketDetailItem[];
};

export type AdminPsikotesPeserta = {
  id: string | number;
  idPaket?: string | null;
  kodeAkses?: string | null;
  nama: string;
  noHp: string;
  paket: string;
  tanggal: string;
  rawTanggal?: string;
  status: string;
  status_pengerjaan?: string | null;
  perlu_review_psikolog?: boolean;
  skor: string;
  jenisAkses: string;
  usia?: number | null;
  jenisKelamin?: string | null;
  totalSkor?: number | null;
  namaPemesan?: string | null;
  noHpPemesan?: string | null;
  isPembeliBerbeda?: boolean;
  hasil?: {
    id: string;
    grade: string;
    judul: string;
    deskripsi: string;
    makna?: string;
    tips?: any;
    tanggal_selesai?: string;
    detail_skor?: any;
    catatan_psikolog?: string | null;
    rekomendasi_psikolog?: string | null;
    file_laporan_url?: string | null;
    draft_saved_at?: string | null;
    tanggal_review?: string | null;
  } | null;
  namaBiro?: string | null;
  nama_biro?: string | null;
  is_biro?: boolean;
  id_psikolog?: string | null;
  claimed_at?: string | null;
  wa_sent_at?: string | null;
  is_wa_sent?: boolean;
  psikolog?: {
    id?: string;
    nama?: string;
    nama_gelar?: string;
    kategori?: string;
    foto?: string | null;
    no_telepon?: string | null;
    email?: string | null;
  } | null;
  peserta?: {
    id?: string;
    nama_lengkap?: string;
    jenis_kelamin?: string;
    tempat_lahir?: string | null;
    tanggal_lahir?: string | null;
    usia?: number | null;
    kategori_peserta?: string | null;
    nama_orang_tua?: string | null;
    no_telepon_orang_tua?: string | null;
    pendidikan?: string | null;
    pekerjaan?: string | null;
    status_pernikahan?: string | null;
  } | null;
};

export type AdminPsikologOption = {
  id: string;
  nama_gelar: string;
  kategori?: string;
  spesialisasi?: string;
  foto?: string | null;
  status?: string;
};

