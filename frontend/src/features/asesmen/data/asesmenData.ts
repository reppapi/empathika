export interface AsesmenPackage {
  id: string
  title: string
  shortTitle: string
  subtitle: string
  tagline: string
  description: string
  image: string
  badgeColor: string
  weekday: string
  weekend: string
  onlinePrice: string
  duration: string
  questions: string
  targetAudience: string
  onlineBenefits: string[]
  offlineBenefits: string[]
  guidelines: string[]
}

// Data murni dibangun secara dinamis dari database layanan backend
export const ASESMEN_PACKAGES: AsesmenPackage[] = []

/**
 * Membangun objek AsesmenPackage murni dari record layanan database backend
 */
export function buildAsesmenPackageFromLayanan(item: any): AsesmenPackage {
  const id = String(item?.id || "")
  const title = (item?.nama || item?.layanan || "Layanan Asesmen").trim()
  const desc = (item?.deskripsi || "").trim()
  const lines = desc.split("\n").map((l: string) => l.trim()).filter(Boolean)
  const subtitle = lines[0] || "Pemeriksaan psikologis terstandar bersama tim profesional Empathika."
  const tagline = lines.length > 1 ? lines[1] : title

  const image =
    item?.banner_url ||
    item?.bannerUrl ||
    (Array.isArray(item?.foto_kegiatan) && item.foto_kegiatan[0]) ||
    (Array.isArray(item?.tarif_tenaga_ahli?.foto_kegiatan) && item.tarif_tenaga_ahli.foto_kegiatan[0]) ||
    "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&q=80"

  const t = item?.tarif_tenaga_ahli || {}
  const metodeLower = String(item?.metode || "").toLowerCase().trim()
  const isOnlyOnline = metodeLower.includes("online") && !metodeLower.includes("offline")

  const onlineNum = Number(
    item?.tarif_asesmen?.online ??
    t?.asesmen?.online ??
    t?.online ??
    (isOnlyOnline ? item?.harga_weekday : 0)
  ) || 0

  const offlineWkNum = Number(
    item?.tarif_asesmen?.offline_weekday ??
    t?.asesmen?.offline?.weekday ??
    t?.offline?.weekday ??
    item?.harga_weekday ??
    0
  ) || 0

  const offlineWkndNum = Number(
    item?.tarif_asesmen?.offline_weekend ??
    t?.asesmen?.offline?.weekend ??
    t?.offline?.weekend ??
    item?.harga_weekend ??
    0
  ) || 0

  const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`

  const customOnlineBenefits = t?.manfaat_online || t?.manfaat
  const customOfflineBenefits = t?.manfaat_offline || t?.manfaat

  return {
    id,
    title,
    shortTitle: title,
    subtitle,
    tagline,
    description: desc || subtitle,
    image,
    badgeColor: "bg-purple-100 text-[#561269] border-purple-200",
    weekday: formatRp(offlineWkNum),
    weekend: formatRp(offlineWkndNum),
    onlinePrice: formatRp(onlineNum),
    duration: "45 - 60 Menit",
    questions: "Tes Psikometri Terstandar",
    targetAudience: "Individu, Siswa, Mahasiswa, & Profesional",
    onlineBenefits:
      Array.isArray(customOnlineBenefits) && customOnlineBenefits.length > 0
        ? customOnlineBenefits
        : [
            "Laporan Hasil Psikogram Digital (PDF) Terverifikasi",
            "Rekomendasi Arahan Personal & Evaluasi Potensi Diri",
            "Analisis Profil & Kecenderungan Karakter / Kompetensi",
            "Pengerjaan Fleksibel secara Daring dari Mana Saja",
          ],
    offlineBenefits:
      Array.isArray(customOfflineBenefits) && customOfflineBenefits.length > 0
        ? customOfflineBenefits
        : [
            "Sesi Tatap Muka Langsung di Ruang Konseling Klinik",
            "Pemberian Alat & Lembar Pemeriksaan Psikometri Fisik Terstandar",
            "Wawancara & Observasi Klinis Langsung Bersama Asesor Profesional",
            "Laporan Hasil Cetak Resmi & Sesi Penjelasan Hasil",
          ],
    guidelines: [
      "Siapkan perangkat laptop/komputer dengan koneksi internet yang stabil untuk pengerjaan online.",
      "Jawablah seluruh pernyataan secara jujur dan spontan sesuai dengan kondisi diri Anda yang sebenarnya.",
      "Seluruh data dan hasil evaluasi asesmen dijamin kerahasiaannya sesuai Kode Etik Psikologi.",
    ],
  }
}

