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
};

export type PaketData = {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string;
  waktu: string;
  jenisAkses: string;
  harga: string;
  status: string;
  jumlahSoal: number;
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
