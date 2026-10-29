import type { PrismaClient, Prisma, StatusPengajuanKerjaSama } from '@prisma/client'
import type {
  CreatePengajuanInput,
  GetPengajuanQuery,
  CreateProgramInput,
  UpdateProgramInput,
  UpdateFormulirInput,
} from './kerja-sama.schema'

export class KerjaSamaRepository {
  constructor(private prisma: PrismaClient) {}

  // ── 1. Pengajuan Kerja Sama (Leads) ─────────────────────────────────────────

  async createPengajuan(data: CreatePengajuanInput) {
    return this.prisma.pengajuanKerjaSama.create({
      data: {
        nama_instansi: data.nama_instansi,
        nama_pic: data.nama_pic,
        email: data.email,
        no_telepon: data.no_telepon,
        kategori: data.kategori,
        tipe_formulir: data.tipe_formulir,
        pesan: data.pesan || null,
        jawaban_detail: data.jawaban_detail ? (data.jawaban_detail as any) : undefined,
        status: 'MENUNGGU',
      },
    })
  }

  async findRecentDuplicate(data: {
    nama_instansi: string
    no_telepon: string
    tipe_formulir: string
    withinSeconds?: number
  }) {
    const cutoff = new Date(Date.now() - (data.withinSeconds || 60) * 1000)
    return this.prisma.pengajuanKerjaSama.findFirst({
      where: {
        nama_instansi: { equals: data.nama_instansi, mode: 'insensitive' },
        no_telepon: data.no_telepon,
        tipe_formulir: data.tipe_formulir,
        createdAt: { gte: cutoff },
      },
    })
  }
  async findPengajuanList(query: GetPengajuanQuery) {
    const where: Prisma.PengajuanKerjaSamaWhereInput = {}

    if (query.status && query.status !== 'semua') {
      where.status = query.status as StatusPengajuanKerjaSama
    }

    if (query.kategori) {
      where.kategori = { contains: query.kategori, mode: 'insensitive' }
    }

    if (query.tipe_formulir) {
      where.tipe_formulir = query.tipe_formulir
    }

    if (query.search) {
      where.OR = [
        { nama_instansi: { contains: query.search, mode: 'insensitive' } },
        { nama_pic: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { no_telepon: { contains: query.search } },
      ]
    }

    const page = query.page || 1
    const limit = query.limit || 50

    const allMatching = await this.prisma.pengajuanKerjaSama.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Saring soft-delete secara otomatis kecuali jika include_deleted bernilai true
    const activeItems = query.include_deleted
      ? allMatching
      : allMatching.filter((item: any) => !item.jawaban_detail?._soft_deleted)

    const total = activeItems.length
    const skip = (page - 1) * limit
    const items = activeItems.slice(skip, skip + limit)

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }

  async findPengajuanById(id: string) {
    return this.prisma.pengajuanKerjaSama.findUnique({
      where: { id },
    })
  }

  async updatePengajuanStatus(id: string, status: StatusPengajuanKerjaSama, pesan?: string | null) {
    const data: Prisma.PengajuanKerjaSamaUpdateInput = {
      status,
    }
    if (pesan !== undefined) {
      data.pesan = pesan
    }
    return this.prisma.pengajuanKerjaSama.update({
      where: { id },
      data,
    })
  }

  /**
   * Soft-delete pengajuan secara default untuk menjaga audit trail dan compliance.
   * Gunakan hardDelete = true jika ingin menghapus permanen dari database.
   */
  async deletePengajuan(id: string, hardDelete = false) {
    if (hardDelete) {
      return this.prisma.pengajuanKerjaSama.delete({
        where: { id },
      })
    }

    const existing = await this.prisma.pengajuanKerjaSama.findUnique({ where: { id } })
    if (!existing) {
      throw Object.assign(new Error('Data pengajuan tidak ditemukan'), { statusCode: 404 })
    }

    const currentDetail = (existing.jawaban_detail as any) || {}
    const updatedDetail = {
      ...currentDetail,
      _soft_deleted: true,
      _deleted_at: new Date().toISOString(),
      _previous_status: existing.status,
    }

    return this.prisma.pengajuanKerjaSama.update({
      where: { id },
      data: {
        jawaban_detail: updatedDetail,
      },
    })
  }

  /**
   * Mengembalikan pengajuan kerja sama yang sebelumnya di-soft-delete (diarsipkan).
   */
  async restorePengajuan(id: string) {
    const existing = await this.prisma.pengajuanKerjaSama.findUnique({ where: { id } })
    if (!existing) {
      throw Object.assign(new Error('Data pengajuan tidak ditemukan'), { statusCode: 404 })
    }

    const currentDetail = (existing.jawaban_detail as any) || {}
    delete currentDetail._soft_deleted
    delete currentDetail._deleted_at

    return this.prisma.pengajuanKerjaSama.update({
      where: { id },
      data: {
        status: currentDetail._previous_status || existing.status,
        jawaban_detail: Object.keys(currentDetail).length > 0 ? currentDetail : undefined,
      },
    })
  }

  async countPengajuanSummary() {
    const all = await this.prisma.pengajuanKerjaSama.findMany()
    const active = all.filter((item: any) => !item.jawaban_detail?._soft_deleted)
    const diarsipkan = all.length - active.length

    return {
      total: active.length,
      menunggu: active.filter((item) => item.status === 'MENUNGGU').length,
      dihubungi: active.filter((item) => item.status === 'DIHUBUNGI').length,
      disetujui: active.filter((item) => item.status === 'DISETUJUI').length,
      ditolak: active.filter((item) => item.status === 'DITOLAK').length,
      diarsipkan,
    }
  }

  // ── 2. Program Kerja Sama ───────────────────────────────────────────────────

  async findAllPrograms() {
    return this.prisma.programKerjaSama.findMany({
      orderBy: [{ urutan: 'asc' }, { createdAt: 'asc' }],
    })
  }

  async findProgramByIdOrSlug(idOrSlug: string) {
    return this.prisma.programKerjaSama.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    })
  }

  async createProgram(data: CreateProgramInput) {
    return this.prisma.programKerjaSama.create({
      data: {
        slug: data.slug,
        title: data.title,
        short_name: data.short_name,
        deskripsi: data.deskripsi,
        pelatihan_title: data.pelatihan_title || null,
        pelatihan_deskripsi: data.pelatihan_deskripsi || null,
        pelatihan_image: data.pelatihan_image || null,
        mitra_title: data.mitra_title || null,
        mitra_deskripsi: data.mitra_deskripsi || null,
        mitra_image: data.mitra_image || null,
        warna_tema: data.warna_tema || null,
        status: data.status || 'AKTIF',
        urutan: data.urutan || 1,
      },
    })
  }

  async updateProgram(id: string, data: UpdateProgramInput) {
    return this.prisma.programKerjaSama.update({
      where: { id },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(data.title && { title: data.title }),
        ...(data.short_name && { short_name: data.short_name }),
        ...(data.deskripsi && { deskripsi: data.deskripsi }),
        ...(data.pelatihan_title !== undefined && { pelatihan_title: data.pelatihan_title }),
        ...(data.pelatihan_deskripsi !== undefined && { pelatihan_deskripsi: data.pelatihan_deskripsi }),
        ...(data.pelatihan_image !== undefined && { pelatihan_image: data.pelatihan_image }),
        ...(data.mitra_title !== undefined && { mitra_title: data.mitra_title }),
        ...(data.mitra_deskripsi !== undefined && { mitra_deskripsi: data.mitra_deskripsi }),
        ...(data.mitra_image !== undefined && { mitra_image: data.mitra_image }),
        ...(data.warna_tema !== undefined && { warna_tema: data.warna_tema }),
        ...(data.status && { status: data.status }),
        ...(data.urutan !== undefined && { urutan: data.urutan }),
      },
    })
  }

  async deleteProgram(id: string) {
    return this.prisma.programKerjaSama.delete({
      where: { id },
    })
  }

  // ── 3. Formulir Kerja Sama ──────────────────────────────────────────────────

  async findAllFormulir() {
    return this.prisma.formulirKerjaSama.findMany({
      orderBy: { createdAt: 'asc' },
    })
  }

  async findFormulirBySlug(slug: string) {
    return this.prisma.formulirKerjaSama.findUnique({
      where: { slug },
    })
  }

  async upsertFormulir(slug: string, data: UpdateFormulirInput) {
    const existing = await this.prisma.formulirKerjaSama.findUnique({ where: { slug } })
    if (existing) {
      return this.prisma.formulirKerjaSama.update({
        where: { slug },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.kategori_default && { kategori_default: data.kategori_default }),
          ...(data.deskripsi !== undefined && { deskripsi: data.deskripsi }),
          ...(data.pertanyaan_khusus && { pertanyaan_khusus: data.pertanyaan_khusus as any }),
        },
      })
    }

    return this.prisma.formulirKerjaSama.create({
      data: {
        slug,
        title: data.title || slug,
        kategori_default: data.kategori_default || 'Lainnya',
        deskripsi: data.deskripsi || null,
        pertanyaan_khusus: (data.pertanyaan_khusus || []) as any,
      },
    })
  }
}
