import type { FastifyInstance } from 'fastify'
import { KerjaSamaRepository } from './kerja-sama.repository'
import type {
  CreatePengajuanInput,
  GetPengajuanQuery,
  UpdatePengajuanStatusInput,
  CreateProgramInput,
  UpdateProgramInput,
  UpdateFormulirInput,
} from './kerja-sama.schema'
import type { StatusPengajuanKerjaSama } from '@prisma/client'

const DEFAULT_PROGRAMS: CreateProgramInput[] = [
  {
    slug: 'mahasiswa',
    title: 'Empathika untuk Mahasiswa',
    short_name: 'Mahasiswa',
    deskripsi: 'Pendampingan kesehatan mental mahasiswa, peer counselor club, manajemen stres akademik, dan persiapan transisi karir.',
    pelatihan_title: 'Pelatihan Peer Counselor & Manajemen Stres Kampus',
    pelatihan_deskripsi: 'Membekali perwakilan mahasiswa dan BEM dengan keterampilan dasar konseling sebaya (peer counseling) serta teknik coping stress saat menghadapi masa skripsi dan transisi karir.',
    pelatihan_image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    mitra_title: 'Empathika x BEM Universitas Padjadjaran',
    mitra_deskripsi: 'Penyelenggaraan Pekan Kesehatan Mental Kampus diikuti lebih dari 850 mahasiswa dengan sesi konseling massal dan webinar resiliensi.',
    mitra_image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
    warna_tema: 'from-purple-500 to-indigo-600',
    status: 'AKTIF',
    urutan: 1,
  },
  {
    slug: 'sekolah',
    title: 'Empathika untuk Sekolah',
    short_name: 'Sekolah',
    deskripsi: 'Program bimbingan konseling komprehensif, parenting workshop, asesmen minat bakat, dan pencegahan bullying.',
    pelatihan_title: 'Workshop Parenting Positif & Pencegahan Bullying',
    pelatihan_deskripsi: 'Sesi edukasi interaktif bagi guru BK dan orang tua siswa untuk membangun komunikasi hangat serta mendeteksi dini masalah emosi remaja.',
    pelatihan_image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    mitra_title: 'Empathika x SMA Taruna Bangsa',
    mitra_deskripsi: 'Pemeriksaan psikologis minat bakat untuk 240 siswa kelas XII serta pendampingan pemilihan jurusan perkuliahan.',
    mitra_image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    warna_tema: 'from-blue-500 to-cyan-600',
    status: 'AKTIF',
    urutan: 2,
  },
  {
    slug: 'perusahaan',
    title: 'Empathika untuk Perusahaan',
    short_name: 'Perusahaan',
    deskripsi: 'Employee Assistance Program (EAP), manajemen burnout karyawan, asesmen kompetensi, dan pelatihan kepemimpinan empatik.',
    pelatihan_title: 'Pelatihan Psychological First Aid & EAP Workplace',
    pelatihan_deskripsi: 'Membantu HR dan team leader mendeteksi gejala burnout, depresi kerja, serta mengelola beban kerja secara manusiawi dan produktif.',
    pelatihan_image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    mitra_title: 'Empathika x PT Sinergi Digital Nusantara',
    mitra_deskripsi: 'Implementasi program konseling privat karyawan rutin setiap bulan untuk 150 staf serta seminar bulanan work-life balance.',
    mitra_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    warna_tema: 'from-emerald-500 to-teal-600',
    status: 'AKTIF',
    urutan: 3,
  },
  {
    slug: 'komunitas',
    title: 'Empathika untuk Komunitas',
    short_name: 'Komunitas',
    deskripsi: 'Support group berfasilitator psikolog, kampanye literasi kesehatan jiwa, dan kolaborasi aktivasi sosial.',
    pelatihan_title: 'Training Fasilitator Support Group Komunitas',
    pelatihan_deskripsi: 'Membekali pengurus komunitas dengan kode etik dasar pendampingan kelompok sebaya dan etika penanganan krisis mental.',
    pelatihan_image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
    mitra_title: 'Empathika x Komunitas Peduli Jiwa Muda',
    mitra_deskripsi: 'Penyelenggaraan 12 sesi support group tematik gratis dan kampanye media sosial menjangkau lebih dari 50.000 audiens.',
    mitra_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
    warna_tema: 'from-amber-500 to-orange-600',
    status: 'AKTIF',
    urutan: 4,
  },
  {
    slug: 'instansi',
    title: 'Empathika untuk Instansi Pemerintah',
    short_name: 'Instansi',
    deskripsi: 'Peningkatan kapasitas psikologis aparatur, pemetaan psikososial masyarakat, dan program pemulihan pasca-bencana.',
    pelatihan_title: 'Workshop Pelayanan Publik Berbasis Empati & Regulasi Emosi',
    pelatihan_deskripsi: 'Meningkatkan ketahanan mental aparatur sipil dalam melayani masyarakat rentan dan mengelola stres kerja di garda depan.',
    pelatihan_image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
    mitra_title: 'Empathika x Dinas Sosial Jawa Barat',
    mitra_deskripsi: 'Pelatihan penanganan psikososial trauma pasca-bencana untuk 60 pekerja sosial dan relawan bencana.',
    mitra_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    warna_tema: 'from-rose-500 to-red-600',
    status: 'AKTIF',
    urutan: 5,
  },
  {
    slug: 'rumah-sakit',
    title: 'Empathika untuk Rumah Sakit',
    short_name: 'Rumah Sakit',
    deskripsi: 'Pendampingan psikologis pasien kronis, dukungan mental tenaga medis (nakes), serta konseling keluarga rawat inap.',
    pelatihan_title: 'Resiliensi Mental Tenaga Kesehatan & Caregiver',
    pelatihan_deskripsi: 'Pelatihan khusus mengatasi compassion fatigue dan trauma sekunder bagi dokter, perawat, dan keluarga pendamping pasien.',
    pelatihan_image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    mitra_title: 'Empathika x RS Al-Islam',
    mitra_deskripsi: 'Layanan telemedicine psikologi terpadu untuk pasien pasca pemulihan penyakit berat dan pendampingan keluarga.',
    mitra_image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    warna_tema: 'from-pink-400 to-rose-500',
    status: 'AKTIF',
    urutan: 6,
  },
]

const DEFAULT_FORMULIRS = [
  {
    slug: 'asesmen',
    title: 'Formulir Kemitraan Asesmen Psikologi',
    kategori_default: 'Sekolah / Universitas',
    deskripsi: 'Formulir resmi permohonan kemitraan pemeriksaan dan asesmen psikologis untuk siswa, mahasiswa, maupun calon karyawan.',
    pertanyaan_khusus: [
      {
        id: '1',
        label: 'Tujuan Pelaksanaan Asesmen',
        key: 'tujuanAsesmen',
        type: 'radio',
        options: ['Pemetaan Minat & Bakat', 'Kesiapan Masuk Sekolah / Kampus', 'Rekrutmen & Seleksi Karyawan', 'Evaluasi Kinerja & Potensi Promosi', 'Lainnya'],
        required: true,
      },
      {
        id: '2',
        label: 'Estimasi Jumlah Peserta Tes',
        key: 'estimasiPeserta',
        type: 'radio',
        options: ['Kurang dari 20 orang', '20 - 50 orang', '51 - 100 orang', '101 - 300 orang', 'Lebih dari 300 orang'],
        required: true,
      },
      {
        id: '3',
        label: 'Format Pelaksanaan yang Diinginkan',
        key: 'formatPelaksanaan',
        type: 'radio',
        options: ['Online Penuh (Web Psikotes)', 'Tatap Muka / On-site di Lokasi Mitra', 'Hybrid (Kombinasi Online & Offline)'],
        required: true,
      },
      {
        id: '4',
        label: 'Rencana Periode / Bulan Pelaksanaan',
        key: 'periodePelaksanaan',
        type: 'text',
        placeholder: 'Contoh: Pertengahan November 2026',
        required: true,
      },
    ],
  },
  {
    slug: 'in-house-training',
    title: 'Formulir In-House Training & Workshop',
    kategori_default: 'Perusahaan / Korporasi',
    deskripsi: 'Ajukan pelatihan interaktif dan seminar kesehatan mental khusus untuk meningkatkan kesejahteraan tim Anda.',
    pertanyaan_khusus: [
      {
        id: '1',
        label: 'Topik Utama Pelatihan',
        key: 'topikPelatihan',
        type: 'radio',
        options: ['Work-Life Balance & Manajemen Burnout', 'Pelatihan Peer Counselor / Pendamping Sebaya', 'Mindfulness & Regulasi Emosi di Tempat Kerja', 'Komunikasi Asertif & Resolusi Konflik', 'Lainnya'],
        required: true,
      },
      {
        id: '2',
        label: 'Sasaran Peserta',
        key: 'sasaranPeserta',
        type: 'radio',
        options: ['Seluruh Karyawan / Staf', 'Level Manajemen / Leader', 'Perwakilan Mahasiswa / BEM', 'Guru / Tenaga Pendidik', 'Orang Tua Siswa'],
        required: true,
      },
      {
        id: '3',
        label: 'Durasi Sesi yang Diharapkan',
        key: 'durasiPelatihan',
        type: 'radio',
        options: ['Webinar Singkat (1.5 - 2 Jam)', 'Half-day Workshop (3 - 4 Jam)', 'Full-day Training (6 - 8 Jam)', 'Program Serial (Beberapa Hari)'],
        required: true,
      },
      {
        id: '4',
        label: 'Metode Acara',
        key: 'metodeAcara',
        type: 'radio',
        options: ['Online via Zoom', 'Offline di Kantor / Kampus Mitra', 'Offline di Venue Pilihan'],
        required: true,
      },
    ],
  },
  {
    slug: 'lainnya',
    title: 'Formulir Penjajakan Kolaborasi Kemitraan',
    kategori_default: 'Komunitas / Organisasi',
    deskripsi: 'Sampaikan ide kolaborasi, program sosial, sponsorship, atau kemitraan strategis lainnya bersama Empathika.',
    pertanyaan_khusus: [
      {
        id: '1',
        label: 'Bentuk Kolaborasi yang Ditawarkan',
        key: 'bentukKolaborasi',
        type: 'radio',
        options: ['Media Partner / Kolaborasi Konten Edukasi', 'Program CSR / Bakti Sosial Kesehatan Mental', 'Penyediaan Ruang Konseling / Klinik Mitra', 'Pembicara / Narasumber Kegiatan', 'Lainnya'],
        required: true,
      },
      {
        id: '2',
        label: 'Target Audiens / Penerima Manfaat',
        key: 'targetAudiens',
        type: 'text',
        placeholder: 'Contoh: Remaja usia 15-24 tahun di Jawa Barat',
        required: true,
      },
      {
        id: '3',
        label: 'Garis Besar Ide & Ekspektasi',
        key: 'garisBesarIde',
        type: 'textarea',
        placeholder: 'Jelaskan secara singkat rencana program dan apa yang diharapkan dari Empathika...',
        required: false,
      },
    ],
  },
]

export class KerjaSamaService {
  private repo: KerjaSamaRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new KerjaSamaRepository(fastify.prisma)
  }

  // ── 1. Pengajuan Kerja Sama (Leads) ─────────────────────────────────────────

  async createPengajuan(input: CreatePengajuanInput) {
    // Cegah duplikasi submit berulang/spam dari instansi & kontak yang sama dalam 60 detik
    const duplicate = await this.repo.findRecentDuplicate({
      nama_instansi: input.nama_instansi,
      no_telepon: input.no_telepon,
      tipe_formulir: input.tipe_formulir,
      withinSeconds: 60,
    })

    if (duplicate) {
      return {
        success: true,
        message: 'Pengajuan kerja sama Anda sudah berhasil kami terima sebelumnya. Tim kami akan segera menghubungi Anda.',
        data: duplicate,
      }
    }

    const created = await this.repo.createPengajuan(input)
    return {
      success: true,
      message: 'Pengajuan kerja sama berhasil dikirim. Tim kami akan segera menghubungi Anda.',
      data: created,
    }
  }

  async getPengajuanList(query: GetPengajuanQuery) {
    const [result, summary] = await Promise.all([
      this.repo.findPengajuanList(query),
      this.repo.countPengajuanSummary(),
    ])

    return {
      success: true,
      summary,
      meta: result.meta,
      data: result.items,
    }
  }

  async getPengajuanById(id: string) {
    const item = await this.repo.findPengajuanById(id)
    if (!item) {
      throw Object.assign(new Error('Data pengajuan kerja sama tidak ditemukan'), { statusCode: 404 })
    }
    return {
      success: true,
      data: item,
    }
  }

  async updatePengajuanStatus(id: string, input: UpdatePengajuanStatusInput) {
    const updated = await this.repo.updatePengajuanStatus(
      id,
      input.status as StatusPengajuanKerjaSama,
      input.pesan
    )
    return {
      success: true,
      message: `Status pengajuan berhasil diperbarui menjadi ${input.status}.`,
      data: updated,
    }
  }

  async deletePengajuan(id: string) {
    await this.repo.deletePengajuan(id)
    return {
      success: true,
      message: 'Data pengajuan kerja sama berhasil dihapus.',
    }
  }

  // ── 2. Program Kerja Sama ───────────────────────────────────────────────────

  async getAllPrograms() {
    let list = await this.repo.findAllPrograms()

    // Auto-seed data awal jika tabel masih kosong
    if (list.length === 0) {
      for (const item of DEFAULT_PROGRAMS) {
        await this.repo.createProgram(item).catch(() => {})
      }
      list = await this.repo.findAllPrograms()
    }

    return {
      success: true,
      data: list,
    }
  }

  async getProgramByIdOrSlug(idOrSlug: string) {
    const item = await this.repo.findProgramByIdOrSlug(idOrSlug)
    if (!item) {
      throw Object.assign(new Error('Program kerja sama tidak ditemukan'), { statusCode: 404 })
    }
    return {
      success: true,
      data: item,
    }
  }

  async createProgram(input: CreateProgramInput) {
    const existing = await this.repo.findProgramByIdOrSlug(input.slug)
    if (existing) {
      throw Object.assign(new Error(`Program dengan slug '${input.slug}' sudah ada`), { statusCode: 400 })
    }
    const created = await this.repo.createProgram(input)
    return {
      success: true,
      message: 'Program kerja sama baru berhasil ditambahkan.',
      data: created,
    }
  }

  async updateProgram(id: string, input: UpdateProgramInput) {
    if (input.slug) {
      const existing = await this.repo.findProgramByIdOrSlug(input.slug)
      if (existing && existing.id !== id) {
        throw Object.assign(new Error(`Program dengan slug '${input.slug}' sudah ada`), { statusCode: 400 })
      }
    }
    const updated = await this.repo.updateProgram(id, input)
    return {
      success: true,
      message: 'Program kerja sama berhasil diperbarui.',
      data: updated,
    }
  }

  async deleteProgram(id: string) {
    await this.repo.deleteProgram(id)
    return {
      success: true,
      message: 'Program kerja sama berhasil dihapus.',
    }
  }

  // ── 3. Formulir Kerja Sama ──────────────────────────────────────────────────

  async getAllFormulir() {
    let list = await this.repo.findAllFormulir()

    // Auto-seed formulir default jika masih kosong
    if (list.length === 0) {
      for (const form of DEFAULT_FORMULIRS) {
        await this.repo.upsertFormulir(form.slug, form).catch(() => {})
      }
      list = await this.repo.findAllFormulir()
    }

    return {
      success: true,
      data: list,
    }
  }

  async getFormulirBySlug(slug: string) {
    let item = await this.repo.findFormulirBySlug(slug)
    if (!item) {
      const defaultForm = DEFAULT_FORMULIRS.find((f) => f.slug === slug)
      if (defaultForm) {
        item = await this.repo.upsertFormulir(slug, defaultForm)
      }
    }
    if (!item) {
      throw Object.assign(new Error(`Formulir dengan tipe '${slug}' tidak ditemukan`), { statusCode: 404 })
    }
    return {
      success: true,
      data: item,
    }
  }

  async updateFormulir(slug: string, input: UpdateFormulirInput) {
    const updated = await this.repo.upsertFormulir(slug, input)
    return {
      success: true,
      message: 'Konfigurasi formulir berhasil disimpan.',
      data: updated,
    }
  }
}
