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
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.prisma.pengajuanKerjaSama.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pengajuanKerjaSama.count({ where }),
    ])

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

  async deletePengajuan(id: string) {
    return this.prisma.pengajuanKerjaSama.delete({
      where: { id },
    })
  }

  async countPengajuanSummary() {
    const [total, menunggu, dihubungi, disetujui, ditolak] = await Promise.all([
      this.prisma.pengajuanKerjaSama.count(),
      this.prisma.pengajuanKerjaSama.count({ where: { status: 'MENUNGGU' } }),
      this.prisma.pengajuanKerjaSama.count({ where: { status: 'DIHUBUNGI' } }),
      this.prisma.pengajuanKerjaSama.count({ where: { status: 'DISETUJUI' } }),
      this.prisma.pengajuanKerjaSama.count({ where: { status: 'DITOLAK' } }),
    ])

    return { total, menunggu, dihubungi, disetujui, ditolak }
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
