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

export const INITIAL_KERJASAMA_ITEMS: KerjaSamaItem[] = [
  {
    id: "1",
    slug: "mahasiswa",
    title: "Empathika untuk Mahasiswa",
    shortName: "Mahasiswa",
    description: "Pendampingan kesehatan mental mahasiswa, peer counselor club, manajemen stres akademik, dan persiapan transisi karir.",
    pelatihanTitle: "Pelatihan Peer Counselor & Manajemen Stres Kampus",
    pelatihanDeskripsi: "Membekali perwakilan mahasiswa dan BEM dengan keterampilan dasar konseling sebaya (peer counseling) serta teknik coping stress saat menghadapi masa skripsi dan transisi karir.",
    pelatihanImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
    mitraTitle: "Empathika x BEM Universitas Padjadjaran",
    mitraDeskripsi: "Penyelenggaraan Pekan Kesehatan Mental Kampus diikuti lebih dari 850 mahasiswa dengan sesi konseling massal dan webinar resiliensi.",
    mitraImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
    color: "from-purple-500 to-indigo-600",
    status: "AKTIF",
    urutan: 1,
  },
  {
    id: "2",
    slug: "sekolah",
    title: "Empathika untuk Sekolah",
    shortName: "Sekolah",
    description: "Program bimbingan konseling komprehensif, parenting workshop, asesmen minat bakat, dan pencegahan bullying.",
    pelatihanTitle: "Workshop Parenting Positif & Pencegahan Bullying",
    pelatihanDeskripsi: "Sesi edukasi interaktif bagi guru BK dan orang tua siswa untuk membangun komunikasi hangat serta mendeteksi dini masalah emosi remaja.",
    pelatihanImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
    mitraTitle: "Empathika x SMA Taruna Bangsa",
    mitraDeskripsi: "Pemeriksaan psikologis minat bakat untuk 240 siswa kelas XII serta pendampingan pemilihan jurusan perkuliahan.",
    mitraImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800",
    color: "from-blue-500 to-cyan-600",
    status: "AKTIF",
    urutan: 2,
  },
  {
    id: "3",
    slug: "komunitas",
    title: "Empathika untuk Komunitas",
    shortName: "Komunitas",
    description: "Ruang aman bercerita (support group), edukasi kesehatan mental grassroot, dan kampanye sadar diri bersama penggerak komunitas.",
    pelatihanTitle: "Support Group Facilitation Training",
    pelatihanDeskripsi: "Pelatihan fasilitator kelompok dukungan bagi komunitas non-profit agar mampu mengelola sesi curhat kelompok secara etis dan aman.",
    pelatihanImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
    mitraTitle: "Empathika x Youth Mental Health Indo",
    mitraDeskripsi: "Rangkaian 12 sesi online circle sharing mingguan untuk pemuda rentan stres perkotaan dengan psikolog pendamping.",
    mitraImage: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
    color: "from-amber-500 to-orange-600",
    status: "AKTIF",
    urutan: 3,
  },
  {
    id: "4",
    slug: "perusahaan",
    title: "Empathika untuk Perusahaan",
    shortName: "Perusahaan",
    description: "Employee Assistance Program (EAP), manajemen burnout karyawan, kepemimpinan empatik, dan asesmen psikologi rekrutmen.",
    pelatihanTitle: "Corporate Burnout Prevention & Mindful Leadership",
    pelatihanDeskripsi: "Modul pelatihan eksekutif dan HR untuk mengenali tanda kelelahan mental pada tim serta strategi menjaga work-life balance berkinerja tinggi.",
    pelatihanImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800",
    mitraTitle: "Empathika x PT Astra Otoparts",
    mitraDeskripsi: "Paket konsultasi psikologis confidential 1-on-1 bagi karyawan serta survey kesehatan mental tahunan perusahaan.",
    mitraImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    color: "from-emerald-500 to-teal-600",
    status: "AKTIF",
    urutan: 4,
  },
  {
    id: "5",
    slug: "pemerintah",
    title: "Empathika untuk Pemerintah",
    shortName: "Pemerintah",
    description: "Konsultasi kebijakan sosial-kesehatan mental, pendampingan trauma healing pasca bencana, dan training ASN berempati.",
    pelatihanTitle: "Psikososial First Aid & Pelayanan Publik Berempati",
    pelatihanDeskripsi: "Peningkatan kapasitas petugas frontliner dinas sosial dan aparatur sipil dalam merespons aduan warga dengan pendekatan humanis.",
    pelatihanImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
    mitraTitle: "Empathika x Dinas Kesehatan Kota Bandung",
    mitraDeskripsi: "Program posko konseling keliling di 5 puskesmas percontohan dengan ribuan konsultasi warga tertangani.",
    mitraImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800",
    color: "from-rose-500 to-red-600",
    status: "AKTIF",
    urutan: 5,
  },
  {
    id: "6",
    slug: "rumah-sakit",
    title: "Empathika untuk Rumah Sakit",
    shortName: "Rumah Sakit",
    description: "Pendampingan psikologis pasien kronis, dukungan mental tenaga medis (nakes), serta konseling keluarga rawat inap.",
    pelatihanTitle: "Resiliensi Mental Tenaga Kesehatan & Caregiver",
    pelatihanDeskripsi: "Pelatihan khusus mengatasi compassion fatigue dan trauma sekunder bagi dokter, perawat, dan keluarga pendamping pasien.",
    pelatihanImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    mitraTitle: "Empathika x RS Al-Islam",
    mitraDeskripsi: "Layanan telemedicine psikologi terpadu untuk pasien pasca pemulihan penyakit berat dan pendampingan keluarga.",
    mitraImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    color: "from-pink-400 to-rose-500",
    status: "AKTIF",
    urutan: 6,
  },
]

export const INITIAL_PENGAJUAN_KERJASAMA: PengajuanKerjaSama[] = [
  {
    id: "p1",
    tanggal: "11 Okt 2026",
    namaInstansi: "Institut Teknologi Bandung (HIMATIKA)",
    kategori: "Mahasiswa",
    namaPIC: "Fajar Ramadhan",
    email: "fajar.ramadhan@itb.ac.id",
    telepon: "081299887766",
    pesan: "Ingin mengajukan webinar manajemen stres menghadapi tugas akhir dan ujian semester bagi mahasiswa tingkat 3-4.",
    status: "Menunggu",
    tipeFormulir: "lainnya",
    formTitle: "Formulir Kerjasama Lainnya",
    jawabanDetail: {
      "Nama Lengkap / PIC": "Fajar Ramadhan",
      "Nama Institusi / Organisasi": "Institut Teknologi Bandung (HIMATIKA)",
      "Nomor WhatsApp": "081299887766",
      "Tipe Institusi": "Sekolah / Universitas",
      "Tipe Formulir": "Formulir Kerjasama Lainnya",
      "Bentuk Kolaborasi yang Diajukan": "Penyelenggaraan Webinar / Event Kolaboratif",
      "Target Audiens Kegiatan": "Pelajar & Mahasiswa",
      "Linimasa / Rencana Waktu Pelaksanaan": "Pertengahan November 2026",
      "Catatan / Kebutuhan Tambahan": "Estimasi 250 mahasiswa hadir via Zoom",
    },
  },
  {
    id: "p2",
    tanggal: "09 Okt 2026",
    namaInstansi: "PT Ruang Solusi Teknologi",
    kategori: "Perusahaan",
    namaPIC: "Siti Rahmawati (HRD)",
    email: "hr@ruangsolusi.co.id",
    telepon: "081388776655",
    pesan: "Tertarik dengan paket in house training burnout prevention untuk karyawan remote kami.",
    status: "Dihubungi",
    tipeFormulir: "in-house-training",
    formTitle: "Formulir Kerjasama In House Training",
    jawabanDetail: {
      "Nama Lengkap / PIC": "Siti Rahmawati (HRD)",
      "Nama Institusi / Organisasi": "PT Ruang Solusi Teknologi",
      "Nomor WhatsApp": "081388776655",
      "Tipe Institusi": "Perusahaan / Korporasi",
      "Tipe Formulir": "Formulir Kerjasama In House Training",
      "Topik Pelatihan yang Diminati": "Manajemen Stres Kerja & Burnout Prevention",
      "Durasi / Format Pelatihan": "Half Day Workshop (3 - 4 Jam)",
      "Estimasi Jumlah Peserta Pelatihan": "30 - 80 Orang",
      "Rencana Waktu & Lokasi Kegiatan": "Awal Desember 2026 via Zoom Hybrid",
      "Catatan / Kebutuhan Tambahan": "Karyawan remote sering burnout dan butuh ice breaking mindful",
    },
  },
  {
    id: "p3",
    tanggal: "05 Okt 2026",
    namaInstansi: "SMA Negeri 3 Cimahi",
    kategori: "Sekolah",
    namaPIC: "Drs. Hendra Gunawan",
    email: "bk.sman3cimahi@sch.id",
    telepon: "085211223344",
    pesan: "Permohonan asesmen minat dan bakat penjurusan untuk 320 siswa angkatan baru tahun ajaran berjalan.",
    status: "Disetujui",
    tipeFormulir: "asesmen",
    formTitle: "Formulir Kerjasama Asesmen dan Tes",
    jawabanDetail: {
      "Nama Lengkap / PIC": "Drs. Hendra Gunawan",
      "Nama Institusi / Organisasi": "SMA Negeri 3 Cimahi",
      "Nomor WhatsApp": "085211223344",
      "Tipe Institusi": "Sekolah / Universitas",
      "Tipe Formulir": "Formulir Kerjasama Asesmen dan Tes",
      "Layanan Asesmen / Tes yang Dibutuhkan": "Asesmen Minat & Bakat (Jurusan/Karir)",
      "Estimasi Jumlah Peserta Tes": "> 300 Peserta",
      "Format Pelaksanaan": "Tatap Muka (Offline di Lokasi)",
      "Target Waktu / Bulan Pelaksanaan": "November 2026 di Aula SMAN 3 Cimahi",
      "Catatan / Kebutuhan Tambahan": "Butuh psikolog pendamping saat pembagian hasil tes ke orang tua",
    },
  },
]

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
  if (typeof window === "undefined") return INITIAL_KERJASAMA_ITEMS
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_KERJASAMA_ITEMS)
    if (!saved) return INITIAL_KERJASAMA_ITEMS
    const parsed = JSON.parse(saved)
    // Pastikan program rumah-sakit tidak hilang dari cache lokal
    if (Array.isArray(parsed) && !parsed.some((it: any) => it.slug === "rumah-sakit")) {
      const rs = INITIAL_KERJASAMA_ITEMS.find((it) => it.slug === "rumah-sakit")
      if (rs) {
        parsed.push(rs)
        localStorage.setItem(LOCAL_STORAGE_KEY_KERJASAMA_ITEMS, JSON.stringify(parsed))
      }
    }
    return parsed
  } catch {
    return INITIAL_KERJASAMA_ITEMS
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
  if (typeof window === "undefined") return INITIAL_PENGAJUAN_KERJASAMA
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_KERJASAMA_LEADS)
    return saved ? JSON.parse(saved) : INITIAL_PENGAJUAN_KERJASAMA
  } catch {
    return INITIAL_PENGAJUAN_KERJASAMA
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
