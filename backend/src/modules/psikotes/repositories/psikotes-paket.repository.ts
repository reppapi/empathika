/** Sub-repository pengelolaan Paket dan Soal Psikotes */
import type { PrismaClient } from '@prisma/client'
import type {
  CreatePsikotesInput,
  UpdatePsikotesInput,
  PsikotesQueryInput,
} from '../psikotes.schema'
import { getAlatUkur } from '../alat-ukur'

export class PsikotesPaketRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params?: PsikotesQueryInput) {
    const where: any = {}

    if (params?.search) {
      where.OR = [
        { judul: { contains: params.search, mode: 'insensitive' } },
        { tentang_tes: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    if (params?.jenis_akses) {
      where.jenis_akses = params.jenis_akses
    }

    const includeDraft = params?.include_draft === true || params?.include_draft === 'true'
    if (params?.status === 'ALL' || includeDraft) {
      // Tampilkan semua status tanpa filter
    } else if (params?.status) {
      const s = String(params.status).trim()
      if (s.toUpperCase() === 'PUBLISHED' || s.toUpperCase() === 'AKTIF') {
        where.status = {
          in: ['PUBLISHED', 'published', 'AKTIF', 'aktif'],
        }
      } else if (s.toUpperCase() === 'DRAFT' || s.toUpperCase() === 'DRAF') {
        where.status = {
          in: ['DRAFT', 'draft', 'DRAF', 'draf'],
        }
      } else {
        where.status = {
          in: [s, s.toUpperCase(), s.toLowerCase()],
        }
      }
    } else {
      // Default: Hanya paket PUBLISHED atau AKTIF yang tampil ke publik
      where.status = { in: ['PUBLISHED', 'published', 'AKTIF', 'aktif'] }
    }

    const rawList = await this.prisma.paketPsikotes.findMany({
      where,
      include: {
        soal_psikotes: {
          include: {
            pilihan_jawaban: {
              orderBy: { label: 'asc' },
            },
          },
          orderBy: { urutan: 'asc' },
        },
        interpretasi_psikotes: true,
        alat_ukur: true,
        _count: {
          select: {
            booking_psikotes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Kembalikan data paket apa adanya (1 paket = 1 jenis akses mandiri)
    return rawList
  }

  async findById(id: string, allowDraft: boolean = false) {
    const where: any = { id }
    if (!allowDraft) {
      where.status = {
        in: ['PUBLISHED', 'published', 'AKTIF', 'aktif'],
      }
    }

    const item = await this.prisma.paketPsikotes.findFirst({
      where,
      include: {
        soal_psikotes: {
          include: {
            pilihan_jawaban: {
              orderBy: { label: 'asc' },
            },
          },
          orderBy: { urutan: 'asc' },
        },
        interpretasi_psikotes: {
          orderBy: { min_skor: 'asc' },
        },
        alat_ukur: true,
        _count: {
          select: {
            booking_psikotes: true,
          },
        },
      },
    })

    if (!item) return null

    // Lengkapi metadata dinamis alat ukur (instruksi, target usia, periode, pengembang, dimensi, referensi)
    if (item.alat_ukur) {
      const modul = getAlatUkur(item.alat_ukur.kode)
      if (modul) {
        const alatUkurObj = item.alat_ukur as Record<string, any>
        const cfg = modul.config as any
        alatUkurObj.instruksi = cfg.instruksi
        alatUkurObj.instruksiSingkat = cfg.instruksiSingkat || cfg.instruksi
        alatUkurObj.targetUsia = cfg.targetUsia
        alatUkurObj.periode = cfg.periode
        alatUkurObj.pengembang = cfg.pengembang || null
        alatUkurObj.tahun = cfg.tahun || null
        alatUkurObj.tujuan = cfg.tujuan || null
        alatUkurObj.targetResponden = cfg.targetResponden || cfg.targetUsia || null
        alatUkurObj.referensi = cfg.referensi || null
        alatUkurObj.rentangSkorTotal = cfg.rentangSkorTotal || null
        alatUkurObj.cutoff = cfg.cutoff || null
        alatUkurObj.dimensiList = cfg.dimensiList || null
        alatUkurObj.aturanSkoring = cfg.aturanSkoring || null
      }
    }

    // Agregasi statistik aktual peserta untuk paket ini dari database
    const statusCounts = await this.prisma.bookingPsikotes.groupBy({
      by: ['status_pengerjaan'],
      where: { id_paket: item.id },
      _count: { _all: true },
    })

    let tesSelesai = 0
    let tesSedangBerlangsung = 0
    for (const sc of statusCounts) {
      if (sc.status_pengerjaan === 'SELESAI') {
        tesSelesai += sc._count._all
      } else {
        tesSedangBerlangsung += sc._count._all
      }
    }
    const totalPeserta = tesSelesai + tesSedangBerlangsung

    return {
      ...item,
      statistik: {
        total_peserta: totalPeserta,
        tes_selesai: tesSelesai,
        tes_sedang_berlangsung: tesSedangBerlangsung,
      },
    }
  }

  async create(data: CreatePsikotesInput) {
    return this.prisma.paketPsikotes.create({
      data: {
        judul: data.judul,
        tentang_tes: data.tentang_tes || null,
        banner_url: data.banner_url || null,
        jenis_akses: data.jenis_akses || 'GRATIS',
        harga: data.harga ?? 0,
        status: data.status || 'PUBLISHED',
        soal_psikotes:
          data.soal_psikotes && data.soal_psikotes.length > 0
            ? {
              create: data.soal_psikotes.map((s, idx) => ({
                urutan: s.urutan ?? idx + 1,
                pertanyaan: s.pertanyaan || `Pertanyaan ${idx + 1}`,
                pilihan_jawaban: {
                  create: (s.pilihan_jawaban || []).map((p, pIdx) => ({
                    label: p.label || String.fromCharCode(65 + pIdx),
                    teks_jawaban: p.teks_jawaban || `Pilihan ${pIdx + 1}`,
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
                min_skor: i.min_skor ?? 0,
                max_skor: i.max_skor ?? 0,
                grade: i.grade || `Kategori ${iIdx + 1}`,
                judul: i.judul || `Interpretasi ${iIdx + 1}`,
                deskripsi: i.deskripsi || '',
              })),
            }
            : undefined,
      },
      include: {
        soal_psikotes: {
          include: {
            pilihan_jawaban: {
              orderBy: { label: 'asc' },
            },
          },
          orderBy: { urutan: 'asc' },
        },
        interpretasi_psikotes: true,
        alat_ukur: true,
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
          ...(data.tentang_tes !== undefined ? { tentang_tes: data.tentang_tes } : {}),
          ...(data.banner_url !== undefined ? { banner_url: data.banner_url } : {}),
          ...(data.jenis_akses !== undefined ? { jenis_akses: data.jenis_akses } : {}),
          ...(data.harga !== undefined ? { harga: data.harga } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
        },
      })

      if (data.soal_psikotes !== undefined) {
        const hasJawaban = await tx.jawabanPsikotes.findFirst({
          where: { soal_psikotes: { id_paket: id } },
        })

        if (!hasJawaban) {
          await tx.soalPsikotes.deleteMany({ where: { id_paket: id } })
          if (data.soal_psikotes.length > 0) {
            for (const [idx, s] of data.soal_psikotes.entries()) {
              await tx.soalPsikotes.create({
                data: {
                  id_paket: id,
                  urutan: s.urutan ?? idx + 1,
                  pertanyaan: s.pertanyaan || `Pertanyaan ${idx + 1}`,
                  pilihan_jawaban: {
                    create: (s.pilihan_jawaban || []).map((p, pIdx) => ({
                      label: p.label || String.fromCharCode(65 + pIdx),
                      teks_jawaban: p.teks_jawaban || `Pilihan ${pIdx + 1}`,
                      bobot: p.bobot ?? 0,
                    })),
                  },
                },
              })
            }
          }
        } else {
          // Jika ada riwayat jawaban peserta, perbarui pertanyaan dan pilihan yang ada in-place agar FK tidak terlanggar
          const existingSoals = await tx.soalPsikotes.findMany({
            where: { id_paket: id },
            include: { pilihan_jawaban: true },
            orderBy: { urutan: 'asc' },
          })

          for (const [idx, s] of data.soal_psikotes.entries()) {
            const existingSoal = existingSoals[idx]
            if (existingSoal) {
              await tx.soalPsikotes.update({
                where: { id: existingSoal.id },
                data: {
                  pertanyaan: s.pertanyaan || `Pertanyaan ${idx + 1}`,
                  urutan: s.urutan ?? idx + 1,
                },
              })

              for (const [pIdx, p] of (s.pilihan_jawaban || []).entries()) {
                const existingPilihan = existingSoal.pilihan_jawaban[pIdx]
                if (existingPilihan) {
                  await tx.pilihanJawaban.update({
                    where: { id: existingPilihan.id },
                    data: {
                      teks_jawaban: p.teks_jawaban || `Pilihan ${pIdx + 1}`,
                      bobot: p.bobot ?? 0,
                      label: p.label || String.fromCharCode(65 + pIdx),
                    },
                  })
                } else {
                  await tx.pilihanJawaban.create({
                    data: {
                      id_soal: existingSoal.id,
                      teks_jawaban: p.teks_jawaban || `Pilihan ${pIdx + 1}`,
                      bobot: p.bobot ?? 0,
                      label: p.label || String.fromCharCode(65 + pIdx),
                    },
                  })
                }
              }
            } else {
              await tx.soalPsikotes.create({
                data: {
                  id_paket: id,
                  urutan: s.urutan ?? idx + 1,
                  pertanyaan: s.pertanyaan || `Pertanyaan ${idx + 1}`,
                  pilihan_jawaban: {
                    create: (s.pilihan_jawaban || []).map((p, pIdx) => ({
                      label: p.label || String.fromCharCode(65 + pIdx),
                      teks_jawaban: p.teks_jawaban || `Pilihan ${pIdx + 1}`,
                      bobot: p.bobot ?? 0,
                    })),
                  },
                },
              })
            }
          }
        }
      }

      if (data.interpretasi_psikotes !== undefined) {
        const hasHasil = await tx.hasilTes.findFirst({
          where: { interpretasi: { id_paket: id } },
        })

        if (!hasHasil) {
          await tx.interpretasiPsikotes.deleteMany({ where: { id_paket: id } })
          if (data.interpretasi_psikotes.length > 0) {
            for (const [iIdx, i] of data.interpretasi_psikotes.entries()) {
              await tx.interpretasiPsikotes.create({
                data: {
                  id_paket: id,
                  min_skor: i.min_skor ?? 0,
                  max_skor: i.max_skor ?? 0,
                  grade: i.grade || `Kategori ${iIdx + 1}`,
                  judul: i.judul || `Interpretasi ${iIdx + 1}`,
                  deskripsi: i.deskripsi || '',
                },
              })
            }
          }
        } else {
          // Jika ada riwayat hasil tes, perbarui interpretasi in-place agar relasi FK tidak terlanggar
          const existingInters = await tx.interpretasiPsikotes.findMany({
            where: { id_paket: id },
            orderBy: { min_skor: 'asc' },
          })

          for (const [iIdx, i] of data.interpretasi_psikotes.entries()) {
            const existingInter = existingInters[iIdx]
            if (existingInter) {
              await tx.interpretasiPsikotes.update({
                where: { id: existingInter.id },
                data: {
                  min_skor: i.min_skor ?? 0,
                  max_skor: i.max_skor ?? 0,
                  grade: i.grade || `Kategori ${iIdx + 1}`,
                  judul: i.judul || `Interpretasi ${iIdx + 1}`,
                  deskripsi: i.deskripsi || '',
                },
              })
            } else {
              await tx.interpretasiPsikotes.create({
                data: {
                  id_paket: id,
                  min_skor: i.min_skor ?? 0,
                  max_skor: i.max_skor ?? 0,
                  grade: i.grade || `Kategori ${iIdx + 1}`,
                  judul: i.judul || `Interpretasi ${iIdx + 1}`,
                  deskripsi: i.deskripsi || '',
                },
              })
            }
          }
        }
      }

      return tx.paketPsikotes.findUnique({
        where: { id },
        include: {
          soal_psikotes: {
            include: {
              pilihan_jawaban: {
                orderBy: { label: 'asc' },
              },
            },
            orderBy: { urutan: 'asc' },
          },
          interpretasi_psikotes: true,
          alat_ukur: true,
        },
      })
    })
  }

  async delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Dapatkan semua booking psikotes untuk paket ini
      const bookings = await tx.bookingPsikotes.findMany({
        where: { id_paket: id },
        select: { id: true },
      })
      const bookingIds = bookings.map((b) => b.id)

      // 2. Hapus hasil_tes dan jawaban_psikotes dari booking yang bersangkutan
      if (bookingIds.length > 0) {
        await tx.hasilTes.deleteMany({
          where: { id_booking: { in: bookingIds } },
        })
        await tx.jawabanPsikotes.deleteMany({
          where: { id_booking: { in: bookingIds } },
        })
        // 3. Hapus booking_psikotes
        await tx.bookingPsikotes.deleteMany({
          where: { id: { in: bookingIds } },
        })
      }

      // 4. Dapatkan semua soal_psikotes untuk paket ini
      const soals = await tx.soalPsikotes.findMany({
        where: { id_paket: id },
        select: { id: true },
      })
      const soalIds = soals.map((s) => s.id)

      // 5. Hapus pilihan_jawaban dari soal-soal tersebut
      if (soalIds.length > 0) {
        await tx.pilihanJawaban.deleteMany({
          where: { id_soal: { in: soalIds } },
        })
        // 6. Hapus soal_psikotes
        await tx.soalPsikotes.deleteMany({
          where: { id: { in: soalIds } },
        })
      }

      // 7. Hapus interpretasi_psikotes
      await tx.interpretasiPsikotes.deleteMany({
        where: { id_paket: id },
      })

      // 8. Hapus paket_psikotes
      return tx.paketPsikotes.delete({
        where: { id },
      })
    })
  }

}
