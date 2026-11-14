/** Repository akses database Prisma untuk paket, soal, booking, peserta, tiket, dan hasil psikotes. */
import type { PrismaClient, MetodePembayaran, StatusPembayaran } from '@prisma/client'
import { generateOrderId, normalizePhoneNumber } from '../../utils'
import type {
  CreatePsikotesInput,
  UpdatePsikotesInput,
  PsikotesQueryInput,
  SubmitPsikotesInput,
  PesertaQueryInput,
  CreateBookingPsikotesInput,
  VerifyTicketInput,
} from './psikotes.schema'
import {
  getAlatUkur,
  hitungSkorAlatUkur,
} from './alat-ukur'
import { createHasilAccessToken, verifyHasilAccessToken } from './hasil-token'

export function determineKategoriPeserta(usia?: number | null): string | null {
  if (usia === undefined || usia === null || isNaN(Number(usia))) return null
  const numUsia = Number(usia)
  if (numUsia < 12) return 'ANAK'
  if (numUsia <= 17) return 'REMAJA'
  return 'DEWASA'
}

export class PsikotesRepository {
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
      where.status = params.status
    } else {
      // Default: Hanya paket PUBLISHED yang tampil ke publik
      where.status = 'PUBLISHED'
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
      where.status = 'PUBLISHED'
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
                  tips: i.tips ?? null,
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
                  tips: i.tips ?? null,
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
                  tips: i.tips ?? null,
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
                  tips: i.tips ?? null,
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

  async submit(idPaket: string, input: SubmitPsikotesInput) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validasi paket psikotes
      const paket = await tx.paketPsikotes.findUnique({
        where: { id: idPaket },
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

      if (!paket) {
        throw Object.assign(new Error('Paket psikotes tidak ditemukan'), { statusCode: 404 })
      }

      if (paket.status !== 'PUBLISHED') {
        throw Object.assign(
          new Error('Paket psikotes belum dipublikasikan atau sedang dinonaktifkan.'),
          { statusCode: 403 }
        )
      }

      // 2. Normalisasi format jawaban (baik array [{ id_soal, id_pilihan }] maupun record { [id_soal]: id_pilihan })
      const normalizedAnswers: Array<{ id_soal: string; id_pilihan: string }> = []
      if (Array.isArray(input.jawaban)) {
        for (const item of input.jawaban) {
          normalizedAnswers.push({ id_soal: item.id_soal, id_pilihan: item.id_pilihan })
        }
      } else if (typeof input.jawaban === 'object' && input.jawaban !== null) {
        for (const [id_soal, id_pilihan] of Object.entries(input.jawaban)) {
          normalizedAnswers.push({ id_soal, id_pilihan: String(id_pilihan) })
        }
      }

      if (!paket.soal_psikotes || paket.soal_psikotes.length === 0) {
        throw Object.assign(
          new Error('Paket tes ini belum memiliki daftar soal yang valid.'),
          { statusCode: 400 }
        )
      }

      // Buat lookup map soal & pilihan jawaban untuk bobot dan verifikasi integritas
      const validSoalIds = new Set(paket.soal_psikotes.map((s) => s.id))
      const pilihanMap = new Map<string, { id: string; id_soal: string; bobot: number; label: string }>()
      for (const soal of paket.soal_psikotes) {
        for (const pil of soal.pilihan_jawaban) {
          pilihanMap.set(pil.id, pil)
        }
      }

      let totalSkor = 0
      const seenSoalIds = new Set<string>()
      const jawabanToInsert: Array<{ id_soal_psikotes: string; id_pilihan_jawaban: string; skor: number }> = []

      for (const ans of normalizedAnswers) {
        if (!ans.id_soal || !ans.id_pilihan) {
          throw Object.assign(
            new Error('Setiap jawaban wajib menyertakan id_soal dan id_pilihan yang valid.'),
            { statusCode: 400 }
          )
        }
        if (!validSoalIds.has(ans.id_soal)) {
          throw Object.assign(
            new Error('Terdapat id_soal yang tidak termasuk dalam paket tes ini.'),
            { statusCode: 400 }
          )
        }
        if (seenSoalIds.has(ans.id_soal)) {
          throw Object.assign(
            new Error('Terdapat jawaban ganda untuk butir soal yang sama.'),
            { statusCode: 400 }
          )
        }
        const pil = pilihanMap.get(ans.id_pilihan)
        if (!pil || pil.id_soal !== ans.id_soal) {
          throw Object.assign(
            new Error('Pilihan jawaban tidak valid untuk butir soal yang dikirim.'),
            { statusCode: 400 }
          )
        }

        seenSoalIds.add(ans.id_soal)
        const skor = pil.bobot
        totalSkor += skor
        jawabanToInsert.push({
          id_soal_psikotes: ans.id_soal,
          id_pilihan_jawaban: ans.id_pilihan,
          skor,
        })
      }

      if (seenSoalIds.size !== paket.soal_psikotes.length) {
        throw Object.assign(
          new Error(
            `Semua pertanyaan harus dijawab sebelum submit (${seenSoalIds.size}/${paket.soal_psikotes.length} terjawab).`
          ),
          { statusCode: 400 }
        )
      }

      // Jika paket terhubung dengan alat ukur baku (Code-First / Hybrid), hitung skor & diagnosa dengan engine alat ukur
      let calculationResult: any = null
      if (paket.alat_ukur) {
        const jawabanMap: Record<number | string, number> = {}
        for (let idx = 0; idx < normalizedAnswers.length; idx++) {
          const ans = normalizedAnswers[idx]
          const pil = pilihanMap.get(ans.id_pilihan)
          const skor = pil ? pil.bobot : 0
          // Ambil urutan nomor soal dari database jika ada, atau fallback ke indeks
          const soalObj = paket.soal_psikotes.find((s) => s.id === ans.id_soal)
          const qNumMatch = ans.id_soal.match(/q-(\d+)/i) || ans.id_soal.match(/(\d+)$/)
          const qNum = soalObj?.urutan ?? (qNumMatch ? parseInt(qNumMatch[1], 10) : idx + 1)
          jawabanMap[qNum] = skor
        }
        if (input.dampak_aktivitas !== undefined && input.dampak_aktivitas !== null) {
          jawabanMap['difficulty'] = input.dampak_aktivitas
        }
        const mostDistressing =
          (input as any).peristiwaPalingMengganggu ||
          input.peristiwa_paling_mengganggu
        if (mostDistressing) {
          jawabanMap['peristiwa_paling_mengganggu'] = mostDistressing as any
          jawabanMap['peristiwaPalingMengganggu'] = mostDistressing as any
        }
        const otherEvent =
          (input as any).peristiwaLainnya ||
          input.peristiwa_lainnya
        if (otherEvent) {
          jawabanMap['peristiwa_lainnya'] = otherEvent as any
          jawabanMap['peristiwaLainnya'] = otherEvent as any
        }
        try {
          calculationResult = hitungSkorAlatUkur(paket.alat_ukur.kode, jawabanMap)
          if (calculationResult?.tanpaSkorTotal) {
            totalSkor = 0
          } else if (calculationResult && typeof calculationResult.totalSkor === 'number') {
            totalSkor = calculationResult.totalSkor
          }
        } catch (err: any) {
          if (err?.statusCode) {
            throw err
          }
          console.warn(`[PSIKOTES] Gagal hitung skor modul ${paket.alat_ukur.kode}:`, err)
        }
      }

      // 3. Tentukan interpretasi hasil berdasarkan skor
      let matchedInterpretasi: any = null
      if (calculationResult) {
        // Cari interpretasi yang cocok dari tabel DB jika ada
        const dbMatched = paket.interpretasi_psikotes.find(
          (i) => totalSkor >= i.min_skor && totalSkor <= i.max_skor
        )

        matchedInterpretasi = {
          id: dbMatched?.id || null,
          grade: dbMatched?.grade || calculationResult.grade || 'Hasil Tes',
          judul: dbMatched?.judul || calculationResult.kategori || 'Hasil Asesmen',
          deskripsi: dbMatched?.deskripsi || calculationResult.deskripsi || '',
          tips: (dbMatched as any)?.tips || calculationResult.saran || null,
        }
      } else {
        const interpretasiList = paket.interpretasi_psikotes || []

        if (interpretasiList.length > 0) {
          // Cari rentang persis
          matchedInterpretasi = interpretasiList.find(
            (i) => totalSkor >= i.min_skor && totalSkor <= i.max_skor
          )

          if (!matchedInterpretasi) {
            // Cari tier terdekat jika skor di luar min/max
            const sorted = [...interpretasiList].sort((a, b) => a.min_skor - b.min_skor)
            if (totalSkor < sorted[0].min_skor) {
              matchedInterpretasi = sorted[0]
            } else {
              matchedInterpretasi = sorted[sorted.length - 1]
            }
          }
        } else {
          // Buat 1 interpretasi default jika paket belum memiliki data interpretasi
          matchedInterpretasi = await tx.interpretasiPsikotes.create({
            data: {
              id_paket: paket.id,
              min_skor: 0,
              max_skor: 1000,
              grade: 'Hasil Umum',
              judul: 'Hasil Asesmen Psikotes',
              deskripsi: 'Tes telah diselesaikan dengan baik.',
            },
          })
        }
      }

      // 4. Cari apakah sudah ada entri BookingPsikotes yang dibuat saat transaksi/checkout (hasil_tes masih null)
      let booking: any = null
      const explicitBookingId = (
        (input as any).id_booking ||
        (input as any).bookingId ||
        (input as any).orderId ||
        (input as any).kode_akses ||
        ''
      ).trim()

      if (explicitBookingId) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(explicitBookingId)
        booking = await tx.bookingPsikotes.findFirst({
          where: isUuid
            ? {
                OR: [
                  { id: explicitBookingId },
                  { id_transaksi: explicitBookingId },
                  { kode_akses: { equals: explicitBookingId, mode: 'insensitive' } },
                ],
              }
            : {
                OR: [
                  { kode_akses: { equals: explicitBookingId, mode: 'insensitive' } },
                  { kode_akses: { equals: explicitBookingId.replace(/\s+/g, ''), mode: 'insensitive' } },
                  { transaksi: { kode_transaksi: { equals: explicitBookingId, mode: 'insensitive' } } },
                  { transaksi: { kode_transaksi: { equals: explicitBookingId.replace(/\s+/g, ''), mode: 'insensitive' } } },
                ],
              },
          include: { hasil_tes: true, client: true, transaksi: true },
        })

        if (booking && (booking.status_pengerjaan === 'SELESAI' || booking.hasil_tes)) {
          throw Object.assign(
            new Error('Tes untuk tiket ini sudah selesai dikerjakan dan tidak dapat diulang kembali.'),
            { statusCode: 400 }
          )
        }

        if (booking?.transaksi && booking.transaksi.status_pembayaran !== 'PAID') {
          throw Object.assign(
            new Error('Pembayaran tiket belum lunas. Selesaikan pembayaran terlebih dahulu sebelum mengirimkan jawaban tes.'),
            { statusCode: 400 }
          )
        }
      }

      // 4b. Resolusi Data Klien (Akun Pemesan / Kontak Transaksi)
      // JIKA booking sudah ada: gunakan Klien pembeli dari booking tanpa menimpa namanya dengan nama peserta tes
      const isPaketGratis = paket.jenis_akses === 'GRATIS'
      const inputName = (!isPaketGratis && ((input as any).peserta?.nama_lengkap?.trim() || input.klien?.nama?.trim() || input.nama?.trim())) || ''
      const rawPhone = (!isPaketGratis && ((input as any).peserta?.no_telepon_orang_tua?.trim() || input.klien?.no_telepon?.trim() || input.no_telepon?.trim())) || ''
      const inputPhone = normalizePhoneNumber(rawPhone) || rawPhone
      let client = booking?.client || null

      if (!client) {
        if (isPaketGratis) {
          // Tamu anonim (tes gratis): gunakan record Tamu Anonim agar tabel clients tidak terduplikasi
          client = await tx.client.findFirst({
            where: {
              nama: 'Tamu Anonim',
              no_telepon: null,
              id_biro: input.id_biro || null,
            },
          })

          if (!client) {
            client = await tx.client.create({
              data: {
                nama: 'Tamu Anonim',
                no_telepon: null,
                id_biro: input.id_biro || null,
              },
            })
          }
        } else {
          // Pendaftar berbayar mandiri tanpa booking awal
          if (inputPhone) {
            client = await tx.client.findFirst({
              where: {
                OR: [
                  { no_telepon: inputPhone },
                  ...(rawPhone ? [{ no_telepon: rawPhone }] : []),
                ],
                id_biro: input.id_biro || null,
              },
            })
          } else if (inputName) {
            client = await tx.client.findFirst({
              where: {
                nama: inputName,
                id_biro: input.id_biro || null,
              },
            })
          }

          if (!client) {
            client = await tx.client.create({
              data: {
                nama: inputName || 'Klien Psikotes',
                no_telepon: inputPhone || null,
                usia: input.klien?.usia || null,
                jenis_kelamin: input.klien?.jenis_kelamin || null,
                id_biro: input.id_biro || null,
              },
            })
          }
        }
      }

      // Tentukan target paket untuk booking:
      // Selalu hubungkan ke paket yang sedang dikerjakan (tidak dialihkan ke sibling paket berbayar)
      const targetBookingPaketId = paket.id

      // Jika belum ketemu dan bukan tamu anonim, cari booking terakhir milik klien ini untuk paket ini yang belum ada hasil_tes (status 'Berjalan')
      if ((!booking || booking.hasil_tes) && client && client.nama !== 'Tamu Anonim') {
        booking = await tx.bookingPsikotes.findFirst({
          where: {
            id_client: client.id,
            OR: [
              { id_paket: paket.id },
              { paket: { judul: { equals: paket.judul.trim(), mode: 'insensitive' } } },
            ],
            hasil_tes: null,
          },
          orderBy: { createdAt: 'desc' },
          include: { hasil_tes: true, client: true, transaksi: true },
        })
      }

      // Fallback tambahan: jika belum ketemu tapi ada nomor HP pembeli/peserta, cari booking berbayar terakhir yang belum ada hasil_tes
      if ((!booking || booking.hasil_tes) && inputPhone) {
        const digitsOnly = rawPhone.replace(/\D/g, '')
        booking = await tx.bookingPsikotes.findFirst({
          where: {
            OR: [
              { client: { no_telepon: inputPhone } },
              { client: { no_telepon: rawPhone } },
              ...(digitsOnly.length >= 8 ? [{ client: { no_telepon: digitsOnly } }] : []),
            ],
            hasil_tes: null,
          },
          orderBy: { createdAt: 'desc' },
          include: { hasil_tes: true, client: true, transaksi: true },
        })
      }

      // Jika ada booking berjalan yang sudah ada, klaim secara atomik agar tidak terjadi submit ganda bersamaan
      if (booking && !booking.hasil_tes) {
        if (booking.transaksi && booking.transaksi.status_pembayaran !== 'PAID') {
          throw Object.assign(
            new Error('Pembayaran tiket belum lunas. Selesaikan pembayaran terlebih dahulu sebelum mengirimkan jawaban tes.'),
            { statusCode: 400 }
          )
        }

        const claimResult = await tx.bookingPsikotes.updateMany({
          where: {
            id: booking.id,
            status_pengerjaan: { not: 'SELESAI' },
            hasil_tes: null,
          },
          data: {
            status_pengerjaan: 'SELESAI',
          },
        })

        if (claimResult.count === 0) {
          throw Object.assign(
            new Error('Tes untuk tiket ini sudah selesai dikerjakan dan tidak dapat diulang kembali.'),
            { statusCode: 400 }
          )
        }

        if (booking.id_paket !== targetBookingPaketId) {
          booking = await tx.bookingPsikotes.update({
            where: { id: booking.id },
            data: {
              id_paket: targetBookingPaketId,
              riwayat_kesehatan: (input as any).riwayat_kesehatan || booking.riwayat_kesehatan,
            },
          })
        } else if ((input as any).riwayat_kesehatan) {
          booking = await tx.bookingPsikotes.update({
            where: { id: booking.id },
            data: { riwayat_kesehatan: (input as any).riwayat_kesehatan },
          })
        }
      } else {
        // Buat entri BookingPsikotes baru jika memang belum pernah ada
        booking = await tx.bookingPsikotes.create({
          data: {
            id_paket: targetBookingPaketId,
            id_client: client.id,
            id_transaksi: null,
            riwayat_kesehatan: (input as any).riwayat_kesehatan || null,
            status_pengerjaan: 'SELESAI',
          },
        })
      }

      // 5b. Simpan/sinkronkan data peserta tes ke tabel peserta_psikotes jika bukan tamu anonim
      const pesertaSource = (input as any).peserta || input.klien || {}
      const namaPeserta = (input as any).peserta?.nama_lengkap || input.klien?.nama || inputName
      const usiaPeserta = pesertaSource.usia ?? client.usia ?? null
      const isUnderAge = usiaPeserta !== null && Number(usiaPeserta) < 18
      const kategoriOtomatis =
        pesertaSource.kategori_peserta ||
        determineKategoriPeserta(usiaPeserta)

      // Pemisahan data Anak/Remaja (<18) vs Dewasa (>=18) sesuai standar etika klinis:
      let namaOrangTua: string | null = null
      let noTeleponOrangTua: string | null = null
      let pekerjaan: string | null = null
      let statusPernikahan: string | null = null
      let noHpPeserta: string | null = null

      if (isUnderAge) {
        namaOrangTua = pesertaSource.nama_orang_tua || null
        noTeleponOrangTua =
          pesertaSource.no_telepon_orang_tua ||
          pesertaSource.whatsapp ||
          pesertaSource.no_telepon ||
          null
        noHpPeserta = pesertaSource.no_telepon || null
        pekerjaan = null
        statusPernikahan = null
      } else {
        namaOrangTua = null
        noTeleponOrangTua = null
        pekerjaan = pesertaSource.pekerjaan || null
        statusPernikahan = pesertaSource.status_pernikahan || null
        noHpPeserta =
          pesertaSource.no_telepon ||
          pesertaSource.whatsapp ||
          (input as any).no_telepon ||
          null
      }

      // 5b. Simpan profil peserta tes ke tabel peserta_psikotes (khusus pengerjaan resmi dengan data identitas)
      if (namaPeserta && (client.nama !== 'Tamu Anonim' || (input as any).peserta)) {
        await (tx as any).pesertaPsikotes.upsert({
          where: { id_booking: booking.id },
          create: {
            id_booking: booking.id,
            nama_lengkap: namaPeserta,
            no_telepon: noHpPeserta,
            jenis_kelamin: pesertaSource.jenis_kelamin || client.jenis_kelamin || 'Laki-laki',
            tempat_lahir: pesertaSource.tempat_lahir || null,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : null,
            usia: usiaPeserta,
            kategori_peserta: kategoriOtomatis,
            nama_orang_tua: namaOrangTua,
            no_telepon_orang_tua: noTeleponOrangTua,
            pendidikan: pesertaSource.pendidikan || null,
            pekerjaan: pekerjaan,
            status_pernikahan: statusPernikahan,
          },
          update: {
            nama_lengkap: namaPeserta,
            no_telepon: noHpPeserta ?? undefined,
            jenis_kelamin: pesertaSource.jenis_kelamin || client.jenis_kelamin || undefined,
            tempat_lahir: pesertaSource.tempat_lahir || undefined,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : undefined,
            usia: usiaPeserta ?? undefined,
            kategori_peserta: kategoriOtomatis || undefined,
            nama_orang_tua: namaOrangTua,
            no_telepon_orang_tua: noTeleponOrangTua,
            pendidikan: pesertaSource.pendidikan || undefined,
            pekerjaan: pekerjaan,
            status_pernikahan: statusPernikahan,
          },
        }).catch(() => {})
      }

      // 6. Simpan butir jawaban ke tabel jawaban_psikotes jika soal berasal dari database asli
      if (jawabanToInsert.length > 0) {
        const isRealDbQuestions = paket.soal_psikotes.some(
          (s) => s.id === jawabanToInsert[0].id_soal_psikotes && !s.id.includes('-q-')
        )

        if (isRealDbQuestions) {
          await tx.jawabanPsikotes.deleteMany({
            where: { id_booking: booking.id },
          })

          await tx.jawabanPsikotes.createMany({
            data: jawabanToInsert.map((j) => ({
              id_booking: booking.id,
              id_soal_psikotes: j.id_soal_psikotes,
              id_pilihan_jawaban: j.id_pilihan_jawaban,
              skor: j.skor,
            })),
          })
        }
      }

      // 7. Simpan hasil penilaian akhir ke tabel hasil_tes (upsert agar tidak terjadi duplicate key)
      const detailSkorPayload = calculationResult || {
        total_soal: paket.soal_psikotes.length,
        soal_dijawab: jawabanToInsert.length,
      }

      const hasilTes = await tx.hasilTes.upsert({
        where: { id_booking: booking.id },
        create: {
          id_booking: booking.id,
          id_interpretasi: matchedInterpretasi?.id || null,
          total_skor: totalSkor,
          detail_skor: detailSkorPayload,
          snapshot_jawaban: input.jawaban as any,
        },
        update: {
          id_interpretasi: matchedInterpretasi?.id || null,
          total_skor: totalSkor,
          detail_skor: detailSkorPayload,
          snapshot_jawaban: input.jawaban as any,
          tanggal_selesai: new Date(),
        },
        include: {
          interpretasi: true,
        },
      })

      // 7b. Tandai status pengerjaan tiket/booking menjadi SELESAI
      await tx.bookingPsikotes.update({
        where: { id: booking.id },
        data: {
          status_pengerjaan: 'SELESAI',
        },
      }).catch(() => {})

      return {
        id_booking: booking.id,
        access_token: createHasilAccessToken(booking.id),
        id_paket: paket.id,
        judul_paket: paket.judul,
        client: {
          id: client.id,
          nama: client.nama,
          no_telepon: client.no_telepon,
        },
        peserta: {
          nama_lengkap: namaPeserta,
          no_telepon: noHpPeserta,
          usia: usiaPeserta,
          jenis_kelamin: pesertaSource.jenis_kelamin || client.jenis_kelamin || null,
          kategori_peserta: kategoriOtomatis,
        },
        total_skor: totalSkor,
        detail_skor: detailSkorPayload,
        hasil: {
          id: hasilTes.id,
          grade: matchedInterpretasi.grade,
          judul: matchedInterpretasi.judul,
          deskripsi: matchedInterpretasi.deskripsi,
          tips: matchedInterpretasi.tips ?? null,
          tanggal_selesai: hasilTes.tanggal_selesai,
        },
      }
    })
  }

  async findPeserta(params?: PesertaQueryInput) {
    // 1. Filter: HANYA peserta berbayar resmi (memiliki transaksi & bukan tamu anonim)
    const where: any = {
      paket: {
        jenis_akses: 'BERBAYAR',
      },
      client: {
        nama: { not: 'Tamu Anonim' },
      },
      id_transaksi: { not: null },
    }

    if (params?.search) {
      where.AND = [
        {
          OR: [
            { client: { nama: { contains: params.search, mode: 'insensitive' } } },
            { client: { no_telepon: { contains: params.search, mode: 'insensitive' } } },
            { paket: { judul: { contains: params.search, mode: 'insensitive' } } },
          ],
        },
      ]
    }

    if (params?.id_paket) {
      where.id_paket = params.id_paket
    }

    const baseCountWhere: any = {
      paket: { is: { jenis_akses: 'BERBAYAR' } },
      client: { is: { nama: { not: 'Tamu Anonim' } } },
      id_transaksi: { not: null },
    }

    const [totalBerbayar, totalSelesai, totalGratis, items] = await Promise.all([
      this.prisma.bookingPsikotes.count({
        where: baseCountWhere,
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          ...baseCountWhere,
          hasil_tes: { isNot: null },
        },
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          paket: { is: { jenis_akses: 'GRATIS' } },
          hasil_tes: { isNot: null },
        },
      }),
      this.prisma.bookingPsikotes.findMany({
        where,
        include: {
          client: true,
          paket: {
            select: {
              id: true,
              judul: true,
              jenis_akses: true,
              harga: true,
            },
          },
          transaksi: true,
          peserta_psikotes: true,
          hasil_tes: {
            include: {
              interpretasi: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: params?.limit || 100,
        skip: ((params?.page || 1) - 1) * (params?.limit || 100),
      }),
    ])

    // 2. Deduplikasi tampilan per peserta & paket:
    // Urutan query adalah createdAt: 'desc'. Booking paling baru (pertama ditemui) mewakili status sesi terbaru klien.
    // Jika klien baru saja membayar, booking terbarunya berstatus 'Berjalan' (hasil_tes masih null).
    // Booking terbaru ini harus tampil di tabel, dan TIDAK BOLEH ditimpa/dibuang oleh hasil tes lama!
    const seenClientPaket = new Set<string>()
    const filteredItems: typeof items = []

    for (const b of items) {
      if (!b.client || b.client.nama === 'Tamu Anonim') continue
      const clientKey = (b.client.no_telepon || b.id_client).trim()
      const paketKey = b.paket.judul.trim().toLowerCase()
      const key = `${clientKey}_${paketKey}`

      if (!seenClientPaket.has(key)) {
        seenClientPaket.add(key)
        filteredItems.push(b)
      }
    }

    return {
      summary: {
        total_peserta: totalBerbayar + totalGratis,
        total_gratis: totalGratis,
        total_berbayar: totalBerbayar,
        total_selesai: totalSelesai,
      },
      items: filteredItems.map((b) => ({
        id: b.id,
        id_paket: b.id_paket,
        nama_paket: b.paket.judul,
        jenis_akses: b.paket.jenis_akses === 'GRATIS' ? 'Gratis' : 'Berbayar',
        harga: b.paket.harga,
        nama_peserta: (b as any).peserta_psikotes?.nama_lengkap || b.client.nama,
        no_hp: (b as any).peserta_psikotes?.no_telepon || (b as any).peserta_psikotes?.no_telepon_orang_tua || b.client.no_telepon || '—',
        usia: (b as any).peserta_psikotes?.usia ?? b.client.usia,
        jenis_kelamin: (b as any).peserta_psikotes?.jenis_kelamin || b.client.jenis_kelamin,
        peserta: (b as any).peserta_psikotes
          ? {
              ...(b as any).peserta_psikotes,
              kategori_peserta:
                (b as any).peserta_psikotes.kategori_peserta ||
                determineKategoriPeserta((b as any).peserta_psikotes.usia ?? b.client.usia),
            }
          : null,
        tanggal: b.createdAt,
        status: b.hasil_tes ? 'Selesai' : 'Berjalan',
        skor:
          b.hasil_tes?.interpretasi?.grade ||
          (b.hasil_tes
            ? (b.hasil_tes.detail_skor as any)?.tanpaSkorTotal
              ? (b.hasil_tes.detail_skor as any)?.grade || 'Profil 9 Skala PBQ'
              : `Skor: ${b.hasil_tes.total_skor}`
            : '—'),
        total_skor: (b.hasil_tes?.detail_skor as any)?.tanpaSkorTotal
          ? null
          : (b.hasil_tes?.total_skor ?? null),
        hasil: b.hasil_tes
          ? (() => {
              const ds =
                typeof b.hasil_tes.detail_skor === 'string'
                  ? JSON.parse(b.hasil_tes.detail_skor)
                  : (b.hasil_tes.detail_skor as any)
              const isNoTotal = Boolean(ds?.tanpaSkorTotal)
              return {
                id: b.hasil_tes.id,
                grade:
                  b.hasil_tes.interpretasi?.grade ||
                  (isNoTotal ? ds?.grade || 'Profil 9 Skala PBQ' : '—'),
                judul:
                  b.hasil_tes.interpretasi?.judul ||
                  (isNoTotal ? ds?.kategori || 'Profil Skor Mentah 9 Skala Kepribadian (PBQ)' : '—'),
                deskripsi:
                  b.hasil_tes.interpretasi?.deskripsi ||
                  (isNoTotal ? ds?.deskripsi || '—' : '—'),
                tips: (b.hasil_tes.interpretasi as any)?.tips || [],
                tanggal_selesai: b.hasil_tes.tanggal_selesai,
                detail_skor: b.hasil_tes.detail_skor,
              }
            })()
          : null,
      })),
    }
  }

  async createBooking(input: CreateBookingPsikotesInput) {
    return this.prisma.$transaction(async (tx) => {
      const rawPaketId = (input.id_paket || input.testId || '').trim()
      if (!rawPaketId) {
        throw Object.assign(new Error('ID paket psikotes wajib diisi'), { statusCode: 400 })
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawPaketId)

      // 1. Cari paket psikotes berdasarkan UUID, id, kode alat ukur, atau judul
      let paket = await tx.paketPsikotes.findFirst({
        where: (isUuid
          ? { id: rawPaketId }
          : {
              OR: [
                { id: rawPaketId },
                { alat_ukur: { kode: { equals: rawPaketId, mode: 'insensitive' as const } } },
                { alat_ukur: { kode: { contains: rawPaketId, mode: 'insensitive' as const } } },
                { judul: { equals: rawPaketId, mode: 'insensitive' as const } },
                { judul: { contains: rawPaketId, mode: 'insensitive' as const } },
                ...(rawPaketId.toLowerCase().includes('dass')
                  ? [
                      { alat_ukur: { kode: { contains: 'DASS', mode: 'insensitive' as const } } },
                      { judul: { contains: 'stres', mode: 'insensitive' as const } },
                      { judul: { contains: 'depresi', mode: 'insensitive' as const } },
                    ]
                  : []),
              ],
            }) as any,
      })

      if (!paket) {
        // Fallback: cari paket berbayar terbitan terbaru
        paket = await tx.paketPsikotes.findFirst({
          where: {
            OR: [
              { jenis_akses: 'BERBAYAR' },
              { status: 'PUBLISHED' },
            ],
          },
          orderBy: { createdAt: 'desc' },
        })
      }

      if (!paket) {
        throw Object.assign(
          new Error(`Paket psikotes dengan pengidentifikasi '${rawPaketId}' tidak ditemukan`),
          { statusCode: 404 }
        )
      }

      // Jika paket yang ditemukan berjenis GRATIS, periksa apakah ada varian BERBAYAR dengan judul yang sama
      if (paket.jenis_akses === 'GRATIS') {
        const berbayarVariant = await tx.paketPsikotes.findFirst({
          where: {
            judul: { equals: paket.judul.trim(), mode: 'insensitive' },
            jenis_akses: 'BERBAYAR',
          },
        })
        if (berbayarVariant) {
          paket = berbayarVariant
        }
      }

      if (paket.status !== 'PUBLISHED') {
        throw Object.assign(
          new Error('Paket psikotes ini belum dipublikasikan atau sedang dinonaktifkan.'),
          { statusCode: 403 }
        )
      }

      // 2. Normalisasi data Klien (Peserta)
      const inputName = (input.klien?.nama || input.nama || '').trim()
      const rawPhone = (input.klien?.no_telepon || input.no_telepon || '').trim()
      const inputPhone = normalizePhoneNumber(rawPhone) || rawPhone
      const inputEmail = (input.klien?.email || input.email || '').trim()
      const inputUsia = input.klien?.usia ?? null
      const inputGender = input.klien?.jenis_kelamin || null
      const idBiro = input.id_biro || null

      if (!inputName) {
        throw Object.assign(new Error('Nama lengkap peserta wajib diisi'), { statusCode: 400 })
      }

      let client = null
      if (inputPhone) {
        const digitsOnly = rawPhone.replace(/\D/g, '')
        client = await tx.client.findFirst({
          where: {
            OR: [
              { no_telepon: inputPhone },
              { no_telepon: rawPhone },
              ...(digitsOnly.length >= 8 ? [{ no_telepon: digitsOnly }] : []),
            ],
            ...(idBiro ? { id_biro: idBiro } : {}),
          },
        })
      }

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: inputName,
            no_telepon: inputPhone || null,
            usia: inputUsia,
            jenis_kelamin: inputGender,
            id_biro: idBiro,
          },
        })
      } else {
        await tx.client
          .update({
            where: { id: client.id },
            data: {
              nama: inputName || client.nama,
              usia: inputUsia ?? client.usia,
              jenis_kelamin: inputGender ?? client.jenis_kelamin,
            },
          })
          .catch(() => {})
      }

      // 3. Tentukan nominal biaya transaksi
      let nominal = Number(paket.harga)
      if ((!nominal || nominal <= 0) && input.harga && Number(input.harga) > 0) {
        nominal = Number(input.harga)
      }
      if (!nominal || nominal <= 0) {
        nominal = 50000 // default tarif paket berbayar jika paket belum terisi harga di database
      }

      // 4. Normalisasi metode pembayaran ke enum Prisma
      let metodePembayaranEnum: MetodePembayaran = 'QRIS'
      const rawMetode = (input.metode_pembayaran || 'QRIS').toUpperCase()
      if (rawMetode === 'TRANSFER_BANK' || rawMetode === 'BANK') {
        metodePembayaranEnum = 'TRANSFER_BANK'
      } else if (rawMetode === 'E_WALLET' || rawMetode === 'EWALLET') {
        metodePembayaranEnum = 'E_WALLET'
      } else {
        metodePembayaranEnum = 'QRIS'
      }

      // 5. Normalisasi status pembayaran ke enum Prisma
      const statusPembayaranEnum: StatusPembayaran =
        (input.status_pembayaran as StatusPembayaran) || 'PAID'

      // 6. Buat kode transaksi unik
      const kodeTransaksi = input.kode_transaksi || `PSI-${generateOrderId()}`

      // 7. Simpan Transaksi ke tabel transaksis
      const transaksi = await tx.transaksi.create({
        data: {
          id_client: client.id,
          kode_transaksi: kodeTransaksi,
          tipe_transaksi: 'PSIKOTES',
          subtotal: nominal,
          biaya_admin: 0,
          total: nominal,
          metode_pembayaran: metodePembayaranEnum,
          channel_pembayaran: input.channel_pembayaran || null,
          status_pembayaran: statusPembayaranEnum,
          tanggal_bayar: statusPembayaranEnum === 'PAID' ? new Date() : null,
          data_pembayaran: inputEmail ? JSON.stringify({ email: inputEmail }) : null,
        },
      })

      // 8. Cek apakah klien sudah memiliki booking aktif yang belum selesai (hasil_tes masih null)
      let booking: any = await tx.bookingPsikotes.findFirst({
        where: {
          id_paket: paket.id,
          id_client: client.id,
          hasil_tes: null,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (booking) {
        // Perbarui booking yang belum dikerjakan ini dengan transaksi yang baru
        booking = await tx.bookingPsikotes.update({
          where: { id: booking.id },
          data: {
            id_transaksi: transaksi.id,
            kode_akses: booking.kode_akses || kodeTransaksi,
            status_pengerjaan: 'BELUM_MULAI',
          },
          include: {
            paket: {
              select: {
                id: true,
                judul: true,
                jenis_akses: true,
                harga: true,
                banner_url: true,
              },
            },
            transaksi: true,
            client: true,
          },
        })
      } else {
        // Buat entri BookingPsikotes baru jika belum pernah ada booking aktif yang belum selesai
        booking = await tx.bookingPsikotes.create({
          data: {
            id_paket: paket.id,
            id_client: client.id,
            id_transaksi: transaksi.id,
            kode_akses: kodeTransaksi,
            status_pengerjaan: 'BELUM_MULAI',
          },
          include: {
            paket: {
              select: {
                id: true,
                judul: true,
                jenis_akses: true,
                harga: true,
                banner_url: true,
              },
            },
            transaksi: true,
            client: true,
          },
        })
      }

      // Simpan data peserta tes ke tabel peserta_psikotes HANYA jika input.peserta dikirim secara eksplisit
      // (Jangan mengisi peserta_psikotes memakai nama/kontak pembeli transaksi)
      const explicitPeserta = (input as any).peserta
      const pesertaSource = explicitPeserta || {}
      const namaPeserta = explicitPeserta?.nama_lengkap?.trim() || ''
      const usiaPeserta = pesertaSource.usia ?? inputUsia ?? null
      const isUnderAge = usiaPeserta !== null && Number(usiaPeserta) < 18
      const kategoriOtomatis =
        pesertaSource.kategori_peserta ||
        determineKategoriPeserta(usiaPeserta)

      // Pemisahan data Anak/Remaja (<18) vs Dewasa (>=18) sesuai standar etika klinis:
      let namaOrangTua: string | null = null
      let noTeleponOrangTua: string | null = null
      let pekerjaan: string | null = null
      let statusPernikahan: string | null = null
      let noHpPeserta: string | null = null

      if (isUnderAge) {
        namaOrangTua = pesertaSource.nama_orang_tua || null
        noTeleponOrangTua =
          pesertaSource.no_telepon_orang_tua ||
          pesertaSource.whatsapp ||
          pesertaSource.no_telepon ||
          null
        noHpPeserta = pesertaSource.no_telepon || null
        pekerjaan = null
        statusPernikahan = null
      } else {
        namaOrangTua = null
        noTeleponOrangTua = null
        pekerjaan = pesertaSource.pekerjaan || null
        statusPernikahan = pesertaSource.status_pernikahan || null
        noHpPeserta =
          pesertaSource.no_telepon ||
          pesertaSource.whatsapp ||
          (input as any).no_telepon ||
          null
      }

      if (namaPeserta) {
        await (tx as any).pesertaPsikotes.upsert({
          where: { id_booking: booking.id },
          create: {
            id_booking: booking.id,
            nama_lengkap: namaPeserta,
            no_telepon: noHpPeserta,
            jenis_kelamin: pesertaSource.jenis_kelamin || inputGender || 'Laki-laki',
            tempat_lahir: pesertaSource.tempat_lahir || null,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : null,
            usia: usiaPeserta,
            kategori_peserta: kategoriOtomatis,
            nama_orang_tua: namaOrangTua,
            no_telepon_orang_tua: noTeleponOrangTua,
            pendidikan: pesertaSource.pendidikan || null,
            pekerjaan: pekerjaan,
            status_pernikahan: statusPernikahan,
          },
          update: {
            nama_lengkap: namaPeserta,
            no_telepon: noHpPeserta ?? undefined,
            jenis_kelamin: pesertaSource.jenis_kelamin || inputGender || undefined,
            tempat_lahir: pesertaSource.tempat_lahir || undefined,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : undefined,
            usia: usiaPeserta ?? undefined,
            kategori_peserta: kategoriOtomatis || undefined,
            nama_orang_tua: namaOrangTua,
            no_telepon_orang_tua: noTeleponOrangTua,
            pendidikan: pesertaSource.pendidikan || undefined,
            pekerjaan: pekerjaan,
            status_pernikahan: statusPernikahan,
          },
        }).catch(() => {})
      }

      return {
        booking: {
          id: booking.id,
          id_paket: booking.id_paket,
          id_transaksi: booking.id_transaksi,
          id_client: booking.id_client,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        },
        transaksi: {
          id: transaksi.id,
          kode_transaksi: transaksi.kode_transaksi,
          tipe_transaksi: transaksi.tipe_transaksi,
          subtotal: Number(transaksi.subtotal),
          biaya_admin: Number(transaksi.biaya_admin),
          total: Number(transaksi.total),
          metode_pembayaran: transaksi.metode_pembayaran,
          channel_pembayaran: transaksi.channel_pembayaran,
          status_pembayaran: transaksi.status_pembayaran,
          tanggal_bayar: transaksi.tanggal_bayar,
        },
        paket: {
          id: booking.paket.id,
          judul: booking.paket.judul,
          jenis_akses: booking.paket.jenis_akses,
          harga: Number(booking.paket.harga),
          banner_url: booking.paket.banner_url,
        },
        client: {
          id: booking.client.id,
          nama: booking.client.nama,
          no_telepon: booking.client.no_telepon,
          email: inputEmail || null,
          usia: booking.client.usia,
          jenis_kelamin: booking.client.jenis_kelamin,
        },
      }
    })
  }

  /**
   * Pembersihan berkala data pengerjaan psikotes tamu anonim (Retention Lifecycle).
   * Hanya menghapus data tamu anonim gratis yang usianya lebih dari `daysOld` (default: 60 hari).
   * Data pengerjaan peserta berbayar resmi TIDAK PERNAH disentuh/dihapus.
   */
  async cleanupOldAnonymousGuests(daysOld: number = 60) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

    const oldGuestBookings = await this.prisma.bookingPsikotes.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        paket: { jenis_akses: 'GRATIS' },
        client: { nama: 'Tamu Anonim' },
        id_transaksi: null,
      },
      select: { id: true, id_client: true },
    })

    if (oldGuestBookings.length === 0) {
      return { deletedCount: 0, message: 'Tidak ada data tamu anonim lama yang perlu dibersihkan.' }
    }

    const bookingIds = oldGuestBookings.map((b) => b.id)
    const clientIds = Array.from(new Set(oldGuestBookings.map((b) => b.id_client)))

    return this.prisma.$transaction(async (tx) => {
      await tx.hasilTes.deleteMany({ where: { id_booking: { in: bookingIds } } })
      await tx.jawabanPsikotes.deleteMany({ where: { id_booking: { in: bookingIds } } })
      const res = await tx.bookingPsikotes.deleteMany({ where: { id: { in: bookingIds } } })

      // Bersihkan record client Tamu Anonim yang sudah tidak memiliki booking aktif
      for (const cId of clientIds) {
        const remaining = await tx.bookingPsikotes.count({ where: { id_client: cId } })
        if (remaining === 0) {
          await tx.client.delete({ where: { id: cId } }).catch(() => {})
        }
      }

      return {
        deletedCount: res.count,
        message: `Berhasil membersihkan ${res.count} riwayat pengerjaan tamu anonim yang lebih dari ${daysOld} hari.`,
      }
    })
  }

  async verifyTicket(input: VerifyTicketInput) {
    const rawKode = (input.kode_akses || '').trim()
    const cleanKode = rawKode.toUpperCase().replace(/\s+/g, '')
    const rawPhone = (input.no_telepon || '').trim()
    const cleanPhone = normalizePhoneNumber(rawPhone) || rawPhone
    const digitsOnly = rawPhone.replace(/\D/g, '')

    if (!rawKode || !rawPhone) {
      throw Object.assign(new Error('Kode akses dan nomor WhatsApp pembeli wajib diisi'), { statusCode: 400 })
    }

    // Cari booking psikotes berdasarkan kode_akses ATAU kode_transaksi
    const booking = await this.prisma.bookingPsikotes.findFirst({
      where: {
        OR: [
          { kode_akses: { equals: cleanKode, mode: 'insensitive' } },
          { kode_akses: { equals: rawKode, mode: 'insensitive' } },
          { transaksi: { kode_transaksi: { equals: cleanKode, mode: 'insensitive' } } },
          { transaksi: { kode_transaksi: { equals: rawKode, mode: 'insensitive' } } },
        ],
      },
      include: {
        paket: {
          select: {
            id: true,
            judul: true,
            jenis_akses: true,
            harga: true,
            banner_url: true,
          },
        },
        client: {
          select: {
            id: true,
            nama: true,
            no_telepon: true,
          },
        },
        peserta_psikotes: true,
        hasil_tes: {
          select: {
            id: true,
            total_skor: true,
            tanggal_selesai: true,
            detail_skor: true,
          },
        },
        transaksi: {
          select: {
            id: true,
            kode_transaksi: true,
            status_pembayaran: true,
            tanggal_bayar: true,
          },
        },
      },
    })

    if (!booking) {
      throw Object.assign(
        new Error(`Kode akses '${rawKode}' tidak ditemukan. Mohon periksa kembali kode tiket pada bukti pembayaran Anda.`),
        { statusCode: 404 }
      )
    }

    // Verifikasi kesesuaian nomor WhatsApp pembeli
    const clientPhone = (booking.client?.no_telepon || '').trim()
    const clientCleanPhone = normalizePhoneNumber(clientPhone) || clientPhone
    const clientDigits = clientPhone.replace(/\D/g, '')

    const isPhoneMatched =
      !clientPhone ||
      clientCleanPhone === cleanPhone ||
      clientPhone === rawPhone ||
      (digitsOnly.length >= 8 && clientDigits.includes(digitsOnly.slice(-8))) ||
      (clientDigits.length >= 8 && digitsOnly.includes(clientDigits.slice(-8)))

    if (!isPhoneMatched) {
      throw Object.assign(
        new Error('Nomor WhatsApp tidak cocok dengan nomor pembeli yang terdaftar pada tiket ini. Mohon masukkan nomor kontak yang digunakan saat pemesanan.'),
        { statusCode: 400 }
      )
    }

    if (booking.transaksi && booking.transaksi.status_pembayaran !== 'PAID') {
      throw Object.assign(
        new Error('Status pembayaran tiket belum lunas. Silakan selesaikan pembayaran terlebih dahulu sebelum mengerjakan tes.'),
        { statusCode: 400 }
      )
    }

    const isSelesai = booking.status_pengerjaan === 'SELESAI' || Boolean(booking.hasil_tes)

    // Tiket pengerjaan & akses arsip hasil tes aktif tanpa batas waktu (dapat dikerjakan & diakses kapan saja)

    const effectiveKode = booking.kode_akses || booking.transaksi?.kode_transaksi || rawKode
    const accessToken = createHasilAccessToken(booking.id)

    let redirectUrl = `/psikotes/${booking.id_paket}/mulai?bookingId=${booking.id}&orderId=${effectiveKode}&paket=berbayar&token=${encodeURIComponent(accessToken)}`

    if (isSelesai) {
      redirectUrl = `/psikotes/${booking.id_paket}/hasil?bookingId=${booking.id}&paket=berbayar&token=${encodeURIComponent(accessToken)}`
    }

    return {
      booking_id: booking.id,
      access_token: accessToken,
      kode_akses: effectiveKode,
      status_pengerjaan: isSelesai ? 'SELESAI' : 'BELUM_MULAI',
      test_id: booking.id_paket,
      judul_paket: booking.paket.judul,
      nama_pembeli: booking.client.nama,
      peserta: booking.peserta_psikotes
        ? {
            nama_lengkap: booking.peserta_psikotes.nama_lengkap,
            no_telepon: (booking.peserta_psikotes as any).no_telepon || (booking.peserta_psikotes as any).no_telepon_orang_tua || null,
            usia: booking.peserta_psikotes.usia,
            jenis_kelamin: booking.peserta_psikotes.jenis_kelamin,
            kategori_peserta:
              booking.peserta_psikotes.kategori_peserta ||
              determineKategoriPeserta(booking.peserta_psikotes.usia),
          }
        : null,
      hasil_tes: booking.hasil_tes,
      redirect_url: redirectUrl,
    }
  }

  /**
   * Mengambil data laporan hasil asesmen resmi terverifikasi murni dari database berdasarkan bookingId.
   * Melindungi dari manipulasi parameter URL (anti-tampering) dan mewajibkan HMAC token/Admin untuk paket berbayar.
   */
  async getHasilByBookingId(
    bookingId: string,
    options?: { accessToken?: string; isAdmin?: boolean }
  ) {
    const cleanId = (bookingId || '').trim()
    if (!cleanId) {
      throw Object.assign(new Error('ID pengerjaan atau tiket wajib diisi'), { statusCode: 400 })
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId)

    const booking = await this.prisma.bookingPsikotes.findFirst({
      where: isUuid
        ? { id: cleanId }
        : {
            OR: [
              { id: cleanId },
              { kode_akses: { equals: cleanId, mode: 'insensitive' as const } },
              { transaksi: { kode_transaksi: { equals: cleanId, mode: 'insensitive' as const } } },
            ],
          },
      include: {
        paket: {
          select: {
            id: true,
            judul: true,
            jenis_akses: true,
            harga: true,
            banner_url: true,
            tentang_tes: true,
            alat_ukur: {
              select: {
                id: true,
                kode: true,
                nama: true,
                kategori: true,
              },
            },
            interpretasi_psikotes: true,
          },
        },
        client: {
          select: {
            id: true,
            nama: true,
            no_telepon: true,
            usia: true,
            jenis_kelamin: true,
          },
        },
        peserta_psikotes: true,
        transaksi: {
          select: {
            id: true,
            kode_transaksi: true,
            status_pembayaran: true,
            tanggal_bayar: true,
          },
        },
        hasil_tes: {
          include: {
            interpretasi: true,
          },
        },
      },
    })

    if (!booking) {
      throw Object.assign(
        new Error(`Sesi pengerjaan atau tiket dengan ID '${cleanId}' tidak ditemukan di database.`),
        { statusCode: 404 }
      )
    }

    // Proteksi PII untuk paket berbayar: wajib menyertakan HMAC token terverifikasi atau kredensial Admin
    if (booking.paket.jenis_akses === 'BERBAYAR' && !options?.isAdmin) {
      const validToken = verifyHasilAccessToken(booking.id, options?.accessToken)
      if (!validToken) {
        throw Object.assign(
          new Error(
            'Akses laporan hasil asesmen berbayar memerlukan token verifikasi yang sah. Silakan masukkan kode tiket dan nomor WhatsApp pemesan di halaman detail tes.'
          ),
          { statusCode: 403 }
        )
      }
    }

    if (!booking.hasil_tes) {
      throw Object.assign(
        new Error('Hasil laporan asesmen belum tersedia karena tes belum diselesaikan.'),
        { statusCode: 400 }
      )
    }

    // Akses arsip hasil laporan asesmen aktif tanpa batas waktu

    const detailSkor = typeof booking.hasil_tes.detail_skor === 'string'
      ? JSON.parse(booking.hasil_tes.detail_skor)
      : booking.hasil_tes.detail_skor

    return {
      id_booking: booking.id,
      id_paket: booking.id_paket,
      kode_akses: booking.kode_akses || booking.transaksi?.kode_transaksi || null,
      status_pengerjaan: booking.status_pengerjaan,
      paket: booking.paket,
      client: booking.client,
      peserta: {
        nama_lengkap: booking.peserta_psikotes?.nama_lengkap || booking.client?.nama || 'Peserta Asesmen Empathika',
        no_telepon: (booking.peserta_psikotes as any)?.no_telepon || booking.peserta_psikotes?.no_telepon_orang_tua || booking.client?.no_telepon || null,
        usia: booking.peserta_psikotes?.usia ?? booking.client?.usia ?? null,
        kategori_peserta:
          booking.peserta_psikotes?.kategori_peserta ||
          determineKategoriPeserta(booking.peserta_psikotes?.usia ?? booking.client?.usia),
        jenis_kelamin: booking.peserta_psikotes?.jenis_kelamin || booking.client?.jenis_kelamin || null,
        tempat_lahir: booking.peserta_psikotes?.tempat_lahir || null,
        tanggal_lahir: booking.peserta_psikotes?.tanggal_lahir || null,
        pendidikan: booking.peserta_psikotes?.pendidikan || null,
        pekerjaan: booking.peserta_psikotes?.pekerjaan || null,
        status_pernikahan: booking.peserta_psikotes?.status_pernikahan || null,
        nama_orang_tua: booking.peserta_psikotes?.nama_orang_tua || null,
        no_telepon_orang_tua: booking.peserta_psikotes?.no_telepon_orang_tua || null,
      },
      hasil: {
        id: booking.hasil_tes.id,
        total_skor: booking.hasil_tes.total_skor,
        detail_skor: detailSkor,
        tanggal_selesai: booking.hasil_tes.tanggal_selesai,
        grade:
          booking.hasil_tes.interpretasi?.grade ||
          (detailSkor?.tanpaSkorTotal ? detailSkor?.grade || null : null),
        judul:
          booking.hasil_tes.interpretasi?.judul ||
          (detailSkor?.tanpaSkorTotal ? detailSkor?.kategori || null : null),
        deskripsi:
          booking.hasil_tes.interpretasi?.deskripsi ||
          (detailSkor?.tanpaSkorTotal ? detailSkor?.deskripsi || null : null),
        tips: (booking.hasil_tes.interpretasi as any)?.tips || null,
      },
    }
  }
}

