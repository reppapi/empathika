import {
  KerjaSamaItem,
  KerjaSamaPageConfig,
  PengajuanKerjaSama,
  FormulirConfigItem,
} from "../types"

export const LOCAL_STORAGE_KEY_KERJASAMA_ITEMS = "empathika_kerjasama_items"
export const LOCAL_STORAGE_KEY_KERJASAMA_CONFIG = "empathika_kerjasama_config"
export const LOCAL_STORAGE_KEY_KERJASAMA_LEADS = "empathika_kerjasama_leads"
export const LOCAL_STORAGE_KEY_KERJASAMA_FORMS = "empathika_kerjasama_forms"

export const INITIAL_KERJASAMA_CONFIG: KerjaSamaPageConfig = {
  heroTitle: "Bangun Kolaborasi",
  heroHighlight: "Bersama Empathika!",
  heroDescription1:
    "Empathika membuka ruang sinergi bagi institusi pendidikan, korporasi, komunitas, hingga instansi pemerintah untuk menciptakan ekosistem kesehatan mental yang inklusif, profesional, dan berdampak nyata bagi kesejahteraan psikologis masyarakat.",
  heroBannerImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
  heroDescription2:
    "Kami menyediakan berbagai format kemitraan mulai dari asesmen psikologis terstandar, workshop & pelatihan kesehatan mental, konseling kemitraan, hingga program employee assistance program (EAP) yang dirancang khusus sesuai kebutuhan organisasi Anda.",
  footerCallout:
    "Punya ide kolaborasi lainnya? Empathika terbuka untuk berbagai ide dan bentuk kolaborasi yang dapat memberikan manfaat bagi masyarakat. Mari bersama-sama menciptakan ruang yang mendukung kesehatan dan kesejahteraan psikologis. Hubungi contact person kami dan mari berkolaborasi bersama Empathika.",
  kontak: {
    email: "partnership@empathika.com",
    whatsapp: "+62 878-7878-5498",
    formInHouseTraining: "https://forms.gle/empathika-inhousetraining",
    formAsesmen: "https://forms.gle/empathika-asesmen-psikologi",
    formAffiliate: "https://wa.me/6287878785498?text=Halo%20Empathika,%20saya%20tertarik%20dengan%20program%20Affiliate",
    formLainnya: "https://forms.gle/empathika-kerjasama-lainnya",
  },
}

export const INITIAL_KERJASAMA_ITEMS: KerjaSamaItem[] = []

export const INITIAL_PENGAJUAN_KERJASAMA: PengajuanKerjaSama[] = []

// Helper pembersih nomor WhatsApp ke format internasional 62xxx
export function getCleanWhatsAppNumber(raw?: string): string {
  if (!raw) return "6287878785498"
  // Jika masih ada nomor dummy lama, langsung override ke nomor resmi
  if (raw.includes("82123456789") || raw.includes("821-2345")) {
    return "6287878785498"
  }
  const digits = raw.replace(/\D/g, "")
  if (!digits) return "6287878785498"
  if (digits.startsWith("0")) return "62" + digits.slice(1)
  if (digits.startsWith("62")) return digits
  return "62" + digits
}

// ── Helpers untuk Client & Admin ──
export function getKerjaSamaConfig(): KerjaSamaPageConfig {
  if (typeof window === "undefined") return INITIAL_KERJASAMA_CONFIG
  try {
    let adminPhone = ""
    let adminEmail = ""
    try {
      const savedAdmin = localStorage.getItem("empathika_admin_profile")
      if (savedAdmin) {
        const p = JSON.parse(savedAdmin)
        const rawPhone = p.noTelepon || p.no_telepon
        if (rawPhone && rawPhone !== "081234567890" && rawPhone !== "08123456789") {
          adminPhone = rawPhone
        }
        if (p.email) adminEmail = p.email
      }
    } catch {}

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_KERJASAMA_CONFIG)
    const parsed = saved ? JSON.parse(saved) : INITIAL_KERJASAMA_CONFIG

    const effectivePhone = adminPhone || (parsed?.kontak?.whatsapp && !parsed.kontak.whatsapp.includes("821-2345") && !parsed.kontak.whatsapp.includes("8212345") ? parsed.kontak.whatsapp : "+62 878-7878-5498")
    const cleanNumber = getCleanWhatsAppNumber(effectivePhone)

    const updatedConfig: KerjaSamaPageConfig = {
      ...parsed,
      kontak: {
        ...parsed.kontak,
        email: adminEmail || parsed.kontak?.email || "partnership@empathika.com",
        whatsapp: effectivePhone,
        formAffiliate: `https://wa.me/${cleanNumber}?text=Halo%20Empathika,%20saya%20tertarik%20dengan%20program%20Affiliate`,
      },
    }

    return updatedConfig
  } catch {
    return INITIAL_KERJASAMA_CONFIG
  }
}

export function saveKerjaSamaConfig(config: KerjaSamaPageConfig): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_KERJASAMA_CONFIG, JSON.stringify(config))
  } catch (err) {
    console.error("Gagal menyimpan config kerja sama:", err)
  }
}

export function getKerjaSamaItems(): KerjaSamaItem[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_KERJASAMA_ITEMS)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveKerjaSamaItems(items: KerjaSamaItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_KERJASAMA_ITEMS, JSON.stringify(items))
  } catch (err) {
    console.error("Gagal menyimpan items kerja sama:", err)
  }
}

export function getPengajuanKerjaSama(): PengajuanKerjaSama[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_KERJASAMA_LEADS)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function savePengajuanKerjaSama(leads: PengajuanKerjaSama[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_KERJASAMA_LEADS, JSON.stringify(leads))
  } catch (err) {
    console.error("Gagal menyimpan leads pengajuan kerja sama:", err)
  }
}

export const INITIAL_FORMULIR_CONFIGS: FormulirConfigItem[] = [
  {
    id: "f_asesmen",
    slug: "asesmen",
    title: "Formulir Kerjasama Asesmen dan Tes",
    categoryDefault: "Sekolah",
    description:
      "Layanan asesmen psikologi komprehensif, tes minat bakat, rekrutmen potensi kerja, serta evaluasi psikologis terstandar bersama psikolog Empathika.",
    pertanyaanKhusus: [
      {
        id: "q1",
        label: "Layanan Asesmen / Tes yang Dibutuhkan",
        key: "jenisAsesmen",
        type: "radio",
        options: [
          "Asesmen Minat & Bakat (Jurusan/Karir)",
          "Psikotes Rekrutmen & Seleksi Karyawan",
          "Tes Inteligensi & Potensi Akademik (TPA/IQ)",
          "Evaluasi Profil Kepribadian & Konseling Massal",
          "Layanan Asesmen Kustom Lainnya",
        ],
      },
      {
        id: "q2",
        label: "Estimasi Jumlah Peserta Tes",
        key: "jumlahPeserta",
        type: "radio",
        options: [
          "< 25 Peserta",
          "25 - 100 Peserta",
          "100 - 300 Peserta",
          "> 300 Peserta",
        ],
      },
      {
        id: "q3",
        label: "Format Pelaksanaan",
        key: "formatPelaksanaan",
        type: "radio",
        options: ["Online (Daring Penuh)", "Tatap Muka (Offline di Lokasi)", "Hybrid (Online & Offline)"],
      },
      {
        id: "q4",
        label: "Target Waktu / Bulan Pelaksanaan",
        key: "waktuPelaksanaan",
        type: "text",
        placeholder: "Contoh: Pertengahan November 2026 atau Akhir Semester",
      },
    ],
  },
  {
    id: "f_in_house",
    slug: "in-house-training",
    title: "Formulir Kerjasama In House Training",
    categoryDefault: "Perusahaan",
    description:
      "Program workshop, seminar interaktif, dan pelatihan kesehatan mental internal untuk meningkatkan resiliensi, produktivitas, serta well-being tim.",
    pertanyaanKhusus: [
      {
        id: "q1",
        label: "Topik Pelatihan yang Diminati",
        key: "topikPelatihan",
        type: "radio",
        options: [
          "Manajemen Stres Kerja & Burnout Prevention",
          "Mindful Leadership & Emotional Agility bagi Leader",
          "Komunikasi Empatik, Asertif & Resolusi Konflik",
          "Work-Life Harmony & Resiliensi Tim",
          "Topik Spesifik Sesuai Kebutuhan Internal",
        ],
      },
      {
        id: "q2",
        label: "Durasi / Format Pelatihan",
        key: "durasiPelatihan",
        type: "radio",
        options: [
          "Half Day Workshop (3 - 4 Jam)",
          "Full Day Workshop (6 - 8 Jam)",
          "Serial Workshop Mingguan / Bulanan",
          "Webinar Interaktif (1.5 - 2 Jam)",
        ],
      },
      {
        id: "q3",
        label: "Estimasi Jumlah Peserta Pelatihan",
        key: "jumlahPeserta",
        type: "radio",
        options: ["10 - 30 Orang (Intimate Group)", "30 - 80 Orang", "80 - 200 Orang", "> 200 Orang (All-Hands)"],
      },
      {
        id: "q4",
        label: "Rencana Waktu & Lokasi Kegiatan",
        key: "waktuPelaksanaan",
        type: "text",
        placeholder: "Contoh: Desember 2026 di Kantor Pusat Jakarta / Online Zoom",
      },
    ],
  },
  {
    id: "f_lainnya",
    slug: "lainnya",
    title: "Formulir Kerjasama Lainnya",
    categoryDefault: "Komunitas",
    description:
      "Empathika sangat terbuka dengan berbagai bentuk sinergi inovatif yang mendukung kesehatan dan kesejahteraan mental masyarakat.",
    pertanyaanKhusus: [
      {
        id: "q1",
        label: "Bentuk Kolaborasi yang Diajukan",
        key: "bentukKolaborasi",
        type: "radio",
        options: [
          "Media Partner & Publikasi Bersama",
          "Penyelenggaraan Webinar / Event Kolaboratif",
          "Program CSR & Pengabdian Masyarakat",
          "Riset, Penelitian & Pengadaan Narasumber",
          "Bentuk Kemitraan Kustom Lainnya",
        ],
      },
      {
        id: "q2",
        label: "Target Audiens Kegiatan",
        key: "targetAudiens",
        type: "radio",
        options: ["Pelajar & Mahasiswa", "Karyawan & Profesional", "Masyarakat Umum", "Keluarga & Orang Tua"],
      },
      {
        id: "q3",
        label: "Linimasa / Rencana Waktu Pelaksanaan",
        key: "waktuPelaksanaan",
        type: "text",
        placeholder: "Contoh: Bulan depan / Q1 2027",
      },
    ],
  },
]

export function getFormulirConfigs(): FormulirConfigItem[] {
  if (typeof window === "undefined") return INITIAL_FORMULIR_CONFIGS
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_KERJASAMA_FORMS)
    if (!saved) return INITIAL_FORMULIR_CONFIGS
    const parsed: FormulirConfigItem[] = JSON.parse(saved)
    const filtered = parsed.filter((item) => item.slug !== "affiliate")
    return filtered.length > 0 ? filtered : INITIAL_FORMULIR_CONFIGS
  } catch {
    return INITIAL_FORMULIR_CONFIGS
  }
}

export function saveFormulirConfigs(configs: FormulirConfigItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_KERJASAMA_FORMS, JSON.stringify(configs))
  } catch (err) {
    console.error("Gagal menyimpan form configs:", err)
  }
}
