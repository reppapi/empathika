import type { PrismaClient } from '@prisma/client'
import type {
  CreatePsikotesInput,
  UpdatePsikotesInput,
  PsikotesQueryInput,
  SubmitPsikotesInput,
  PesertaQueryInput,
} from './psikotes.schema'

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

    // Jika dipanggil oleh Admin (status ALL atau includeDraft), kembalikan data per record apa adanya
    if (params?.status === 'ALL' || includeDraft) {
      return rawList
    }

    // Untuk website publik/user:
    // Jika dalam 1 judul paket terdapat opsi Gratis dan Berbayar, satukan menjadi 1 card
    // di mana harga paket berbayar disematkan sehingga di dalam card/detail tetap ada pilihan gratis dan berbayar.
    const map = new Map<string, any>()

    for (const item of rawList) {
      const key = (item.judul || '').trim().toLowerCase()
      const existing = map.get(key)

      if (!existing) {
        map.set(key, { ...item })
      } else {
        // Jika ada varian gratis dan berbayar dalam 1 judul:
        // 1. Ambil harga dari paket berbayar jika existing masih 0
        if (Number(item.harga) > 0 && Number(existing.harga) === 0) {
          existing.harga = item.harga
        }
        // 2. Lengkapi soal jika existing kosong tapi item punya soal
        if ((!existing.soal_psikotes || existing.soal_psikotes.length === 0) && item.soal_psikotes && item.soal_psikotes.length > 0) {
          existing.soal_psikotes = item.soal_psikotes
        }
        // 3. Lengkapi interpretasi jika existing kosong
        if ((!existing.interpretasi_psikotes || existing.interpretasi_psikotes.length === 0) && item.interpretasi_psikotes && item.interpretasi_psikotes.length > 0) {
          existing.interpretasi_psikotes = item.interpretasi_psikotes
        }
        // 4. Lengkapi benefits jika existing kosong
        if (!existing.benefits && item.benefits) {
          existing.benefits = item.benefits
        }
        // 5. Lengkapi deskripsi dan banner jika existing kosong
        if (!existing.deskripsi && item.deskripsi) {
          existing.deskripsi = item.deskripsi
        }
        if (!existing.banner_url && item.banner_url) {
          existing.banner_url = item.banner_url
        }
      }
    }

    return Array.from(map.values())
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

    if (!item) return null

    // Cari paket pasangan dengan judul yang sama (misal versi gratis atau berbayar)
    const sibling = await this.prisma.paketPsikotes.findFirst({
      where: {
        id: { not: item.id },
        judul: { equals: item.judul.trim(), mode: 'insensitive' },
        status: allowDraft ? undefined : 'PUBLISHED',
      },
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

    if (sibling) {
      // Jika paket yang dibuka adalah Gratis dan ada versi Berbayar,
      // sematkan harga dari versi berbayar agar frontend menampilkan opsi Paket Berbayar di samping Akses Gratis
      if (Number(sibling.harga) > 0 && Number(item.harga) === 0) {
        item.harga = sibling.harga
      }

      // Lengkapi soal jika di paket ini kosong tetapi sibling punya soal
      if ((!item.soal_psikotes || item.soal_psikotes.length === 0) && sibling.soal_psikotes && sibling.soal_psikotes.length > 0) {
        item.soal_psikotes = sibling.soal_psikotes
      }

      // Lengkapi interpretasi jika di paket ini kosong
      if ((!item.interpretasi_psikotes || item.interpretasi_psikotes.length === 0) && sibling.interpretasi_psikotes && sibling.interpretasi_psikotes.length > 0) {
        item.interpretasi_psikotes = sibling.interpretasi_psikotes
      }

      // Lengkapi benefits jika kosong
      if (!item.benefits && sibling.benefits) {
        item.benefits = sibling.benefits
      }
    }

    return item
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
              pilihan_jawaban: true,
            },
          },
          interpretasi_psikotes: true,
        },
      })

      if (!paket) {
        throw new Error('Paket psikotes tidak ditemukan')
      }

      // Cari sibling dengan judul yang sama jika ada (untuk melengkapi soal/interpretasi antar varian gratis & berbayar)
      const sibling = await tx.paketPsikotes.findFirst({
        where: {
          id: { not: paket.id },
          judul: { equals: paket.judul.trim(), mode: 'insensitive' },
        },
        include: {
          soal_psikotes: {
            include: { pilihan_jawaban: true },
          },
          interpretasi_psikotes: true,
        },
      })

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
      if (sibling) {
        for (const soal of sibling.soal_psikotes) {
          for (const pil of soal.pilihan_jawaban) {
            if (!pilihanMap.has(pil.id)) {
              pilihanMap.set(pil.id, pil)
            }
          }
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

      // 3. Tentukan interpretasi hasil berdasarkan skor
      let matchedInterpretasi = null
      const interpretasiList = (paket.interpretasi_psikotes && paket.interpretasi_psikotes.length > 0)
        ? paket.interpretasi_psikotes
        : (sibling?.interpretasi_psikotes || [])

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

      // 4. Data Diri Klien (Gratis = selalu Tamu Anonim tanpa identitas, Berbayar = dengan data diri resmi)
      const isPaketGratis = paket.jenis_akses === 'GRATIS'
      const inputName = (!isPaketGratis && (input.klien?.nama?.trim() || input.nama?.trim())) || ''
      const inputPhone = (!isPaketGratis && (input.klien?.no_telepon?.trim() || input.no_telepon?.trim())) || ''
      let client = null

      if (inputName && inputName !== 'Tamu Anonim') {
        // Klien mengisi nama asli (peserta berbayar / pendaftar resmi)
        if (inputPhone) {
          client = await tx.client.findFirst({
            where: {
              no_telepon: inputPhone,
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

      // 5. Buat entri BookingPsikotes
      const booking = await tx.bookingPsikotes.create({
        data: {
          id_paket: targetBookingPaketId,
          id_client: client.id,
          id_transaksi: null, // Nullable untuk pengerjaan langsung
        },
      })

      // 6. Simpan seluruh butir jawaban ke tabel jawaban_psikotes
      if (jawabanToInsert.length > 0) {
        await tx.jawabanPsikotes.createMany({
          data: jawabanToInsert.map((j) => ({
            id_booking: booking.id,
            id_soal_psikotes: j.id_soal_psikotes,
            id_pilihan_jawaban: j.id_pilihan_jawaban,
            skor: j.skor,
          })),
        })
      }

      // 7. Simpan hasil penilaian akhir ke tabel hasil_tes
      const hasilTes = await tx.hasilTes.create({
        data: {
          id_booking: booking.id,
          id_interpretasi: matchedInterpretasi.id,
          total_skor: totalSkor,
          detail_skor: {
            total_soal: paket.soal_psikotes.length,
            soal_dijawab: jawabanToInsert.length,
          },
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
        total_skor: totalSkor,
        hasil: {
          id: hasilTes.id,
          grade: matchedInterpretasi.grade,
          judul: matchedInterpretasi.judul,
          deskripsi: matchedInterpretasi.deskripsi,
          makna: matchedInterpretasi.makna,
          tips: matchedInterpretasi.tips,
          tanggal_selesai: hasilTes.tanggal_selesai,
        },
      }
    })
  }

  async findPeserta(params?: PesertaQueryInput) {
    const where: any = {}

    if (params?.search) {
      where.OR = [
        { client: { nama: { contains: params.search, mode: 'insensitive' } } },
        { client: { no_telepon: { contains: params.search, mode: 'insensitive' } } },
        { paket: { judul: { contains: params.search, mode: 'insensitive' } } },
      ]
    }

    if (params?.id_paket) {
      where.id_paket = params.id_paket
    }

    if (params?.jenis_akses === 'GRATIS') {
      where.paket = {
        ...where.paket,
        jenis_akses: 'GRATIS',
      }
    } else if (params?.jenis_akses === 'ALL') {
      // Tidak memfilter jenis_akses
    } else {
      // Default: Hanya menampilkan peserta yang mengikuti psikotes berbayar
      where.paket = {
        ...where.paket,
        jenis_akses: 'BERBAYAR',
      }
    }

    const [totalSemua, totalGratis, totalBerbayar, totalSelesai, items] = await Promise.all([
      this.prisma.bookingPsikotes.count(),
      this.prisma.bookingPsikotes.count({
        where: {
          paket: { jenis_akses: 'GRATIS' },
        },
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          paket: { jenis_akses: 'BERBAYAR' },
        },
      }),
      this.prisma.hasilTes.count(),
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
          hasil_tes: {
            include: {
              interpretasi: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: params?.limit || 50,
        skip: ((params?.page || 1) - 1) * (params?.limit || 50),
      }),
    ])

    return {
      summary: {
        total_peserta: totalSemua,
        total_gratis: totalGratis,
        total_berbayar: totalBerbayar,
        total_selesai: totalSelesai,
      },
      items: items.map((b) => ({
        id: b.id,
        id_paket: b.id_paket,
        nama_paket: b.paket.judul,
        jenis_akses: b.paket.jenis_akses === 'GRATIS' ? 'Gratis' : 'Berbayar',
        harga: b.paket.harga,
        nama_peserta: b.client.nama,
        no_hp: b.client.no_telepon || '—',
        usia: b.client.usia,
        jenis_kelamin: b.client.jenis_kelamin,
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
              makna: b.hasil_tes.interpretasi?.makna || '—',
              tips: b.hasil_tes.interpretasi?.tips || [],
              tanggal_selesai: b.hasil_tes.tanggal_selesai,
            }
          : null,
      })),
    }
  }
}

