import type { PrismaClient, MetodePembayaran, StatusPembayaran } from '@prisma/client'
import { generateOrderId, normalizePhoneNumber } from '../../utils'
import type {
  CreatePsikotesInput,
  UpdatePsikotesInput,
  PsikotesQueryInput,
  SubmitPsikotesInput,
  PesertaQueryInput,
  CreateBookingPsikotesInput,
} from './psikotes.schema'
import {
  hitungSkorAlatUkur,
} from './alat-ukur'

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

    const rawList = await this.prisma.paketPsikotes.findMany({
      where,
      include: {
        soal_psikotes: {
          include: {
            pilihan_jawaban: {
              orderBy: { bobot: 'asc' },
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
              orderBy: { bobot: 'asc' },
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
    })

    if (!item) return null

    return item
  }

  async create(data: CreatePsikotesInput) {
    return this.prisma.paketPsikotes.create({
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi || null,
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
              orderBy: { bobot: 'asc' },
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
          ...(data.deskripsi !== undefined ? { deskripsi: data.deskripsi } : {}),
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
                orderBy: { bobot: 'asc' },
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
                orderBy: { bobot: 'asc' },
              },
            },
            orderBy: { urutan: 'asc' },
          },
          interpretasi_psikotes: true,
        alat_ukur: true,
        },
      })

      if (!paket) {
        throw new Error('Paket psikotes tidak ditemukan')
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

      // Buat lookup map pilihan jawaban untuk bobot dan verifikasi
      const pilihanMap = new Map<string, { id: string; id_soal: string; bobot: number; label: string }>()
      for (const soal of paket.soal_psikotes) {
        for (const pil of soal.pilihan_jawaban) {
          pilihanMap.set(pil.id, pil)
        }
      }

      let totalSkor = 0
      const jawabanToInsert: Array<{ id_soal_psikotes: string; id_pilihan_jawaban: string; skor: number }> = []

      for (const ans of normalizedAnswers) {
        const pil = pilihanMap.get(ans.id_pilihan)
        const skor = pil ? pil.bobot : 0
        totalSkor += skor
        jawabanToInsert.push({
          id_soal_psikotes: ans.id_soal,
          id_pilihan_jawaban: ans.id_pilihan,
          skor,
        })
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
        try {
          calculationResult = hitungSkorAlatUkur(paket.alat_ukur.kode, jawabanMap)
          if (calculationResult && typeof calculationResult.totalSkor === 'number') {
            totalSkor = calculationResult.totalSkor
          }
        } catch (err) {
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

      // 4. Data Diri Klien (Gratis = selalu Tamu Anonim tanpa identitas, Berbayar = dengan data diri resmi)
      const isPaketGratis = paket.jenis_akses === 'GRATIS'
      const inputName = (!isPaketGratis && ((input as any).peserta?.nama_lengkap?.trim() || input.klien?.nama?.trim() || input.nama?.trim())) || ''
      const rawPhone = (!isPaketGratis && ((input as any).peserta?.no_telepon_orang_tua?.trim() || input.klien?.no_telepon?.trim() || input.no_telepon?.trim())) || ''
      const inputPhone = normalizePhoneNumber(rawPhone) || rawPhone
      let client = null

      if (inputName && inputName !== 'Tamu Anonim') {
        // Klien mengisi nama asli (peserta berbayar / pendaftar resmi)
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
        } else {
          client = await tx.client.findFirst({
            where: {
              nama: inputName,
              id_biro: input.id_biro || null,
            },
          })
        }

        if (client) {
          client = await tx.client.update({
            where: { id: client.id },
            data: {
              nama: inputName,
              no_telepon: inputPhone || client.no_telepon,
              usia: input.klien?.usia ?? client.usia,
              jenis_kelamin: input.klien?.jenis_kelamin ?? client.jenis_kelamin,
            },
          })
        } else {
          client = await tx.client.create({
            data: {
              nama: inputName,
              no_telepon: inputPhone || null,
              usia: input.klien?.usia || null,
              jenis_kelamin: input.klien?.jenis_kelamin || null,
              id_biro: input.id_biro || null,
            },
          })
        }
      } else if (inputPhone) {
        // Ada nomor HP tanpa nama spesifik
        client = await tx.client.findFirst({
          where: {
            no_telepon: inputPhone,
            id_biro: input.id_biro || null,
          },
        })

        if (!client) {
          client = await tx.client.create({
            data: {
              nama: 'Klien Psikotes',
              no_telepon: inputPhone,
              id_biro: input.id_biro || null,
            },
          })
        }
      } else {
        // Tamu anonim (tes gratis): gunakan record Tamu Anonim agar tabel clients tidak terduplikasi ribuan baris
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
      }

      // Tentukan target paket untuk booking:
      // Selalu hubungkan ke paket yang sedang dikerjakan (tidak dialihkan ke sibling paket berbayar)
      const targetBookingPaketId = paket.id

      // 5. Cari apakah sudah ada entri BookingPsikotes yang dibuat saat transaksi/checkout (hasil_tes masih null)
      let booking: any = null
      const explicitBookingId = ((input as any).id_booking || (input as any).bookingId || '').trim()

      if (explicitBookingId) {
        booking = await tx.bookingPsikotes.findUnique({
          where: { id: explicitBookingId },
          include: { hasil_tes: true },
        })
      }

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
        })
      }

      // Jika ada booking berjalan yang sudah ada, gunakan kembali booking tersebut (jangan buat row baru agar tidak double!)
      if (booking && !booking.hasil_tes) {
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
          },
        })
      }

      // 5b. Simpan/sinkronkan data peserta tes ke tabel peserta_psikotes jika bukan tamu anonim
      const pesertaSource = (input as any).peserta || input.klien || {}
      const namaPeserta = (input as any).peserta?.nama_lengkap || input.klien?.nama || inputName
      if (client.nama !== 'Tamu Anonim' && namaPeserta) {
        await (tx as any).pesertaPsikotes.upsert({
          where: { id_booking: booking.id },
          create: {
            id_booking: booking.id,
            nama_lengkap: namaPeserta,
            jenis_kelamin: pesertaSource.jenis_kelamin || client.jenis_kelamin || 'Laki-laki',
            tempat_lahir: pesertaSource.tempat_lahir || null,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : null,
            usia: pesertaSource.usia ?? client.usia ?? null,
            kategori_peserta: pesertaSource.kategori_peserta || null,
            nama_orang_tua: pesertaSource.nama_orang_tua || null,
            no_telepon_orang_tua: pesertaSource.no_telepon_orang_tua || null,
            pendidikan: pesertaSource.pendidikan || null,
            pekerjaan: pesertaSource.pekerjaan || null,
            status_pernikahan: pesertaSource.status_pernikahan || null,
          },
          update: {
            nama_lengkap: namaPeserta,
            jenis_kelamin: pesertaSource.jenis_kelamin || client.jenis_kelamin || undefined,
            tempat_lahir: pesertaSource.tempat_lahir || undefined,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : undefined,
            usia: pesertaSource.usia ?? client.usia ?? undefined,
            kategori_peserta: pesertaSource.kategori_peserta || undefined,
            nama_orang_tua: pesertaSource.nama_orang_tua || undefined,
            no_telepon_orang_tua: pesertaSource.no_telepon_orang_tua || undefined,
            pendidikan: pesertaSource.pendidikan || undefined,
            pekerjaan: pesertaSource.pekerjaan || undefined,
            status_pernikahan: pesertaSource.status_pernikahan || undefined,
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

      return {
        id_booking: booking.id,
        id_paket: paket.id,
        judul_paket: paket.judul,
        client: {
          id: client.id,
          nama: client.nama,
          no_telepon: client.no_telepon,
        },
        peserta: {
          nama_lengkap: namaPeserta,
          usia: pesertaSource.usia ?? client.usia ?? null,
          jenis_kelamin: pesertaSource.jenis_kelamin || client.jenis_kelamin || null,
          kategori_peserta: pesertaSource.kategori_peserta || null,
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

    const [totalBerbayar, totalSelesai, items] = await Promise.all([
      this.prisma.bookingPsikotes.count({
        where: baseCountWhere,
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          ...baseCountWhere,
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
        total_peserta: totalBerbayar,
        total_gratis: 0,
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
        no_hp: (b as any).peserta_psikotes?.no_telepon_orang_tua || b.client.no_telepon || '—',
        usia: (b as any).peserta_psikotes?.usia ?? b.client.usia,
        jenis_kelamin: (b as any).peserta_psikotes?.jenis_kelamin || b.client.jenis_kelamin,
        peserta: (b as any).peserta_psikotes || null,
        tanggal: b.createdAt,
        status: b.hasil_tes ? 'Selesai' : 'Berjalan',
        skor: b.hasil_tes?.interpretasi?.grade || (b.hasil_tes ? `Skor: ${b.hasil_tes.total_skor}` : '—'),
        total_skor: b.hasil_tes?.total_skor ?? null,
        hasil: b.hasil_tes
          ? {
              id: b.hasil_tes.id,
              grade: b.hasil_tes.interpretasi?.grade || '—',
              judul: b.hasil_tes.interpretasi?.judul || '—',
              deskripsi: b.hasil_tes.interpretasi?.deskripsi || '—',
              tips: (b.hasil_tes.interpretasi as any)?.tips || [],
              tanggal_selesai: b.hasil_tes.tanggal_selesai,
            }
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

      // 1. Cari paket psikotes berdasarkan UUID atau judul
      let paket = await tx.paketPsikotes.findFirst({
        where: isUuid
          ? { id: rawPaketId }
          : {
              OR: [
                { judul: { equals: rawPaketId, mode: 'insensitive' } },
                { judul: { contains: rawPaketId, mode: 'insensitive' } },
              ],
            },
      })

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

      // Simpan data peserta tes ke tabel peserta_psikotes jika ada nama peserta
      const pesertaSource = (input as any).peserta || input.klien || {}
      const namaPeserta = (input as any).peserta?.nama_lengkap || input.klien?.nama || input.nama
      if (namaPeserta) {
        await (tx as any).pesertaPsikotes.upsert({
          where: { id_booking: booking.id },
          create: {
            id_booking: booking.id,
            nama_lengkap: namaPeserta,
            jenis_kelamin: pesertaSource.jenis_kelamin || inputGender || 'Laki-laki',
            tempat_lahir: pesertaSource.tempat_lahir || null,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : null,
            usia: pesertaSource.usia ?? inputUsia ?? null,
            kategori_peserta: pesertaSource.kategori_peserta || null,
            nama_orang_tua: pesertaSource.nama_orang_tua || null,
            no_telepon_orang_tua: pesertaSource.no_telepon_orang_tua || null,
            pendidikan: pesertaSource.pendidikan || null,
            pekerjaan: pesertaSource.pekerjaan || null,
            status_pernikahan: pesertaSource.status_pernikahan || null,
          },
          update: {
            nama_lengkap: namaPeserta,
            jenis_kelamin: pesertaSource.jenis_kelamin || inputGender || undefined,
            tempat_lahir: pesertaSource.tempat_lahir || undefined,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : undefined,
            usia: pesertaSource.usia ?? inputUsia ?? undefined,
            kategori_peserta: pesertaSource.kategori_peserta || undefined,
            nama_orang_tua: pesertaSource.nama_orang_tua || undefined,
            no_telepon_orang_tua: pesertaSource.no_telepon_orang_tua || undefined,
            pendidikan: pesertaSource.pendidikan || undefined,
            pekerjaan: pesertaSource.pekerjaan || undefined,
            status_pernikahan: pesertaSource.status_pernikahan || undefined,
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
}

