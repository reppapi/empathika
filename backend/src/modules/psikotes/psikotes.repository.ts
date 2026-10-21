import type { PrismaClient } from '@prisma/client'
import type { CreatePsikotesInput, UpdatePsikotesInput, PsikotesQueryInput } from './psikotes.schema'

export class PsikotesRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params?: PsikotesQueryInput) {
    const where: any = {}

    if (params?.search) {
      where.OR = [
        { judul: { contains: params.search, mode: 'insensitive' } },
        { deskripsi: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    if (params?.jenis_akses) {
      where.jenis_akses = params.jenis_akses
    }

    const includeDraft = params?.include_draft === true || params?.include_draft === 'true'
    if (params?.status === 'ALL' || includeDraft) {
      // Tampilkan semua status tanpa filter
    } else if (params?.status) {
      where.status = params.status
    } else {
      // Default: Hanya paket PUBLISHED yang tampil ke publik
      where.status = 'PUBLISHED'
    }

    return this.prisma.paketPsikotes.findMany({
      where,
      include: {
        soal_psikotes: {
          include: {
            pilihan_jawaban: true,
          },
          orderBy: { urutan: 'asc' },
        },
        interpretasi_psikotes: true,
        _count: {
          select: {
            booking_psikotes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string, allowDraft: boolean = false) {
    const where: any = { id }
    if (!allowDraft) {
      where.status = 'PUBLISHED'
    }

    return this.prisma.paketPsikotes.findFirst({
      where,
      include: {
        soal_psikotes: {
          include: {
            pilihan_jawaban: true,
          },
          orderBy: { urutan: 'asc' },
        },
        interpretasi_psikotes: true,
        _count: {
          select: {
            booking_psikotes: true,
          },
        },
      },
    })
  }

  async create(data: CreatePsikotesInput) {
    return this.prisma.paketPsikotes.create({
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi || null,
        banner_url: data.banner_url || null,
        jenis_akses: data.jenis_akses || 'GRATIS',
        harga: data.harga ?? 0,
        status: data.status || 'PUBLISHED',
        benefits: data.benefits ?? null,
        soal_psikotes:
          data.soal_psikotes && data.soal_psikotes.length > 0
            ? {
                create: data.soal_psikotes.map((s, idx) => ({
                  urutan: s.urutan ?? idx + 1,
                  pertanyaan: s.pertanyaan,
                  pilihan_jawaban: {
                    create: s.pilihan_jawaban.map((p, pIdx) => ({
                      label: p.label || String.fromCharCode(65 + pIdx),
                      teks_jawaban: p.teks_jawaban,
                      bobot: p.bobot ?? 0,
                    })),
                  },
                })),
              }
            : undefined,
        interpretasi_psikotes:
          data.interpretasi_psikotes && data.interpretasi_psikotes.length > 0
            ? {
                create: data.interpretasi_psikotes.map((i, iIdx) => ({
                  min_skor: i.min_skor,
                  max_skor: i.max_skor,
                  grade: i.grade || `Kategori ${iIdx + 1}`,
                  judul: i.judul,
                  deskripsi: i.deskripsi,
                  makna: i.makna ?? null,
                  tips: i.tips ?? null,
                })),
              }
            : undefined,
      },
      include: {
        soal_psikotes: {
          include: {
            pilihan_jawaban: true,
          },
          orderBy: { urutan: 'asc' },
        },
        interpretasi_psikotes: true,
      },
    })
  }

  async update(id: string, data: UpdatePsikotesInput) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.paketPsikotes.findUnique({ where: { id } })
      if (!existing) {
        throw new Error('Paket psikotes tidak ditemukan')
      }

      await tx.paketPsikotes.update({
        where: { id },
        data: {
          ...(data.judul !== undefined ? { judul: data.judul } : {}),
          ...(data.deskripsi !== undefined ? { deskripsi: data.deskripsi } : {}),
          ...(data.banner_url !== undefined ? { banner_url: data.banner_url } : {}),
          ...(data.jenis_akses !== undefined ? { jenis_akses: data.jenis_akses } : {}),
          ...(data.harga !== undefined ? { harga: data.harga } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.benefits !== undefined ? { benefits: data.benefits } : {}),
        },
      })

      if (data.soal_psikotes !== undefined) {
        await tx.soalPsikotes.deleteMany({ where: { id_paket: id } })
        if (data.soal_psikotes.length > 0) {
          for (const [idx, s] of data.soal_psikotes.entries()) {
            await tx.soalPsikotes.create({
              data: {
                id_paket: id,
                urutan: s.urutan ?? idx + 1,
                pertanyaan: s.pertanyaan,
                pilihan_jawaban: {
                  create: s.pilihan_jawaban.map((p, pIdx) => ({
                    label: p.label || String.fromCharCode(65 + pIdx),
                    teks_jawaban: p.teks_jawaban,
                    bobot: p.bobot ?? 0,
                  })),
                },
              },
            })
          }
        }
      }

      if (data.interpretasi_psikotes !== undefined) {
        await tx.interpretasiPsikotes.deleteMany({ where: { id_paket: id } })
        if (data.interpretasi_psikotes.length > 0) {
          for (const [iIdx, i] of data.interpretasi_psikotes.entries()) {
            await tx.interpretasiPsikotes.create({
              data: {
                id_paket: id,
                min_skor: i.min_skor,
                max_skor: i.max_skor,
                grade: i.grade || `Kategori ${iIdx + 1}`,
                judul: i.judul,
                deskripsi: i.deskripsi,
                makna: i.makna ?? null,
                tips: i.tips ?? null,
              },
            })
          }
        }
      }

      return tx.paketPsikotes.findUnique({
        where: { id },
        include: {
          soal_psikotes: {
            include: { pilihan_jawaban: true },
            orderBy: { urutan: 'asc' },
          },
          interpretasi_psikotes: true,
        },
      })
    })
  }

  async delete(id: string) {
    return this.prisma.paketPsikotes.delete({
      where: { id },
    })
  }
}
