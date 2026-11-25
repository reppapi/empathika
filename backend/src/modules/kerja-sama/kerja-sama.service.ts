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
      {
        id: 'q_proposal',
        label: 'Upload Proposal Kerja Sama (Opsional)',
        key: 'proposalKerjaSama',
        type: 'file',
        placeholder: 'Pilih file proposal (PDF, DOC, DOCX, maks 15MB)',
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

  async deletePengajuan(id: string, hard = false) {
    const result = await this.repo.deletePengajuan(id, hard)
    return {
      success: true,
      message: hard
        ? 'Data pengajuan kerja sama berhasil dihapus permanen dari database.'
        : 'Data pengajuan kerja sama berhasil diarsipkan (soft-deleted). Audit trail tetap tersimpan aman.',
      data: result,
    }
  }

  async restorePengajuan(id: string) {
    const result = await this.repo.restorePengajuan(id)
    return {
      success: true,
      message: 'Data pengajuan kerja sama berhasil dipulihkan dari arsip.',
      data: result,
    }
  }

  // ── 2. Program Kerja Sama ───────────────────────────────────────────────────

  async getAllPrograms() {
    const list = await this.repo.findAllPrograms()

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
