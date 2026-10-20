export type SoalOption = { text: string; bobot: string };

export type Soal = { id: number; tipe: string; teks: string; pilihan: SoalOption[] };

export type Tip = { title: string; desc: string };

export type Interpretasi = {
  id: number;
  min: string;
  max: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  makna: string;
  saran: Tip[];
  kekuatanUtama?: string[];
  blindspots?: string[];
  lingkunganOptimal?: string[];
};

export type JenisAkses = "Gratis" | "Berbayar";
export type StatusPaket = "Aktif" | "Draf";

export type PaketDetailItem = {
  id: number;
  judulId: number;
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
  soalList: Soal[];
  interpretasiList: Interpretasi[];
  updatedAt?: string;
};

export type JudulPsikotesItem = {
  id: number;
  judul: string;
  kategori: string;
  deskripsi: string;
  image: string;
  paketList: PaketDetailItem[];
};

export type PaketData = {
  id: number;
  judulId?: number;
  nama: string;
  kategori: string;
  deskripsi: string;
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
  id: number;
  nama: string;
  noHp: string;
  paket: string;
  tanggal: string;
  status: string;
  skor: string;
  jenisAkses: string;
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

