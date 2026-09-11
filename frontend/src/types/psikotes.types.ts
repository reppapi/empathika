export interface Psikotes {
  id: string
  nama: string
  deskripsi: string
  durasi: number // menit
  soal: {
    id: string
    text: string
    pilihan: { value: string; label: string }[]
  }[]
}

