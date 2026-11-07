import type { PrismaClient, Prisma } from '@prisma/client'
import type {
  CreateDokumentasiInput,
  UpdateDokumentasiInput,
  DokumentasiQueryInput,
} from './dokumentasi.schema'

export class DokumentasiRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(query?: DokumentasiQueryInput) {
    const page = query?.page ?? 1
    const limit = query?.limit ?? 20
    const skip = (page - 1) * limit

    const where: Prisma.EventDokumentasiWhereInput = {}

    if (query?.search && query.search.trim() !== '') {
      const q = query.search.trim()
      where.OR = [
        { judul: { contains: q, mode: 'insensitive' } },
        { deskripsi: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, items] = await Promise.all([
      this.prisma.eventDokumentasi.count({ where }),
      this.prisma.eventDokumentasi.findMany({
        where,
        include: {
          foto: {
            orderBy: { urutan: 'asc' },
          },
        },
        orderBy: { tanggal: 'desc' },
        skip,
        take: limit,
      }),
    ])

    const data = items.map((item) => ({
      ...item,
      jumlah_foto: item.foto.length,
      thumbnail: item.foto[0]?.foto_url ?? null,
    }))

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }

  async findById(id: string) {
    const item = await this.prisma.eventDokumentasi.findUnique({
      where: { id },
      include: {
        foto: {
          orderBy: { urutan: 'asc' },
        },
      },
    })

    if (!item) return null

    return {
      ...item,
      jumlah_foto: item.foto.length,
      thumbnail: item.foto[0]?.foto_url ?? null,
    }
  }

  async create(data: CreateDokumentasiInput) {
    const created = await this.prisma.eventDokumentasi.create({
      data: {
        judul: data.judul,
        tanggal: new Date(data.tanggal),
        deskripsi: data.deskripsi,
        foto: {
          create: (data.foto || []).map((f, idx) => ({
            foto_url: f.foto_url,
            urutan: f.urutan !== undefined ? f.urutan : idx,
          })),
        },
      },
      include: {
        foto: {
          orderBy: { urutan: 'asc' },
        },
      },
    })

    return {
      ...created,
      jumlah_foto: created.foto.length,
      thumbnail: created.foto[0]?.foto_url ?? null,
    }
  }

  async update(id: string, data: UpdateDokumentasiInput) {
    const updateData: Prisma.EventDokumentasiUpdateInput = {}

    if (data.judul !== undefined) updateData.judul = data.judul
    if (data.tanggal !== undefined) updateData.tanggal = new Date(data.tanggal)
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi

    if (data.foto !== undefined) {
      // Hapus relasi foto lama dan ganti dengan foto baru
      updateData.foto = {
        deleteMany: {},
        create: data.foto.map((f, idx) => ({
          foto_url: f.foto_url,
          urutan: f.urutan !== undefined ? f.urutan : idx,
        })),
      }
    }

    const updated = await this.prisma.eventDokumentasi.update({
      where: { id },
      data: updateData,
      include: {
        foto: {
          orderBy: { urutan: 'asc' },
        },
      },
    })

    return {
      ...updated,
      jumlah_foto: updated.foto.length,
      thumbnail: updated.foto[0]?.foto_url ?? null,
    }
  }

  async delete(id: string) {
    return this.prisma.eventDokumentasi.delete({
      where: { id },
      include: {
        foto: true,
      },
    })
  }
}

