import type { Metadata } from "next"
import TentangKamiClient from "@/features/tentang-kami/components/client/TentangKamiClient"

export const metadata: Metadata = {
  title: "Tentang Kami - Empathika",
  description:
    "Ruang yang hadir untuk menemani setiap langkah dalam memahami diri dan terus bertumbuh. Kenali visi, nilai, dan tim profesional Empathika.",
}

export default function TentangKamiPage() {
  return <TentangKamiClient />
}
