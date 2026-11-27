import { DaftarHargaItem } from "../types/booking.types"

export const DEFAULT_DAFTAR_HARGA: DaftarHargaItem[] = [
  {
    id: "psikolog",
    title: "Psikolog",
    weekday: "-",
    weekend: "-",
    description:
      "Psikolog adalah tenaga profesional yang memiliki kewenangan untuk melakukan asesmen dan memberikan intervensi klinis.",
  },
  {
    id: "konselor",
    title: "Konselor",
    weekday: "-",
    weekend: "-",
    description:
      "Konselor adalah tenaga konseling terarah untuk mendampingi isu-isu kehidupan harian dan relasi.",
  },
  {
    id: "peer",
    title: "Peer Konselor",
    weekday: "-",
    weekend: "-",
    description:
      "Peer konselor adalah teman sebaya yang dilatih untuk memberikan dukungan emosional tanpa stigma.",
  },
]
