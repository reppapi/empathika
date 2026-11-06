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

export type PaketData = {
  id: string | number;
  judulId?: string | number;
  nama: string;
  kategori: string;
  deskripsi: string;
  bannerUrl?: string;
  waktu: string;
  jenisAkses: JenisAkses;
  harga: string;
  numericHarga?: number;
  status: StatusPaket;
  jumlahSoal: number;
  modeJudul?: "baru" | "ada";
  soalList?: Soal[];
  interpretasiList?: Interpretasi[];
  updatedAt?: string;
};

export type AdminPsikotesPeserta = {
  id: string | number;
  nama: string;
  noHp: string;
  paket: string;
  tanggal: string;
  status: string;
  skor: string;
  jenisAkses: string;
  usia?: number | null;
  jenisKelamin?: string | null;
  totalSkor?: number | null;
  hasil?: {
    id: string;
    grade: string;
    judul: string;
    deskripsi: string;
    makna?: string;
    tips?: any;
    tanggal_selesai?: string;
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

export type AdminPsikotesPaketListItem = {
  id: number;
  nama: string;
  image: string;
  kategori: string;
  harga: string;
  jumlahSoal: number;
  waktu: string;
  status: string;
};

