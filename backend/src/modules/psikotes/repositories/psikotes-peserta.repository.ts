/** Sub-repository pencarian peserta dan manajemen retensi berkala data psikotes */
import type { PrismaClient } from '@prisma/client'
import type { PesertaQueryInput } from '../psikotes.schema'
import { formatIndonesianPhone } from '../../../utils'
import { determineKategoriPeserta } from './peserta-kategori.helper'

export class PsikotesPesertaRepository {
  constructor(private prisma: PrismaClient) {}

  async findPeserta(params?: PesertaQueryInput) {

    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    // Filter retensi 3 bulan (90 hari):
    // - Jika sudah selesai tes: tanggal_selesai >= cutoffDate
    // - Jika belum selesai tes: createdAt >= cutoffDate
    const nonExpiredFilter = {
      OR: [
        { hasil_tes: { tanggal_selesai: { gte: cutoffDate } } },
        {
          hasil_tes: null,
          createdAt: { gte: cutoffDate },
        },
      ],
    }

    const biroFilter = params?.id_biro
      ? [
          {
            OR: [
              { client: { id_biro: params.id_biro } },
              { transaksi: { id_biro_tenant: params.id_biro } },
            ],
          },
        ]
      : []

    // 1. Filter: HANYA peserta berbayar resmi (memiliki transaksi atau hasil tes/peserta & bukan tamu anonim)
    const where: any = {
      paket: {
        jenis_akses: 'BERBAYAR',
      },
      client: {
        nama: { not: 'Tamu Anonim' },
      },
      OR: [
        { id_transaksi: { not: null } },
        { hasil_tes: { isNot: null } },
        { peserta_psikotes: { isNot: null } },
      ],
      AND: [nonExpiredFilter, ...biroFilter],
    }

    if (params?.search) {
      where.AND.push({
        OR: [
          { client: { nama: { contains: params.search, mode: 'insensitive' } } },
          { client: { no_telepon: { contains: params.search, mode: 'insensitive' } } },
          { paket: { judul: { contains: params.search, mode: 'insensitive' } } },
        ],
      })
    }

    if (params?.id_paket) {
      where.id_paket = params.id_paket
    }




    const baseCountWhere: any = {
      paket: { is: { jenis_akses: 'BERBAYAR' } },
      client: {
        is: {
          nama: { not: 'Tamu Anonim' },
        },
      },
      OR: [
        { id_transaksi: { not: null } },
        { hasil_tes: { isNot: null } },
        { peserta_psikotes: { isNot: null } },
      ],
      AND: [nonExpiredFilter, ...biroFilter],
    }

    const [totalBerbayar, totalSelesai, totalMenungguReview, totalGratis, items] = await Promise.all([
      this.prisma.bookingPsikotes.count({
        where: baseCountWhere,
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          ...baseCountWhere,
          status_pengerjaan: 'SELESAI',
        },
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          ...baseCountWhere,
          status_pengerjaan: 'MENUNGGU_REVIEW',
        },
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          paket: { is: { jenis_akses: 'GRATIS' } },
          hasil_tes: { isNot: null },
          client: {
            is: {
              nama: { not: 'Tamu Anonim' },
            },
          },
          ...(biroFilter.length > 0 ? { AND: biroFilter } : {}),
        },
      }),
      this.prisma.bookingPsikotes.findMany({
        where,
        include: {
          client: {
            include: {
              biro: {
                select: {
                  id: true,
                  nama_biro: true,
                },
              },
            },
          },
          paket: {
            select: {
              id: true,
              judul: true,
              jenis_akses: true,
              harga: true,
              perlu_review_psikolog: true,
            },
          },
          transaksi: {
            include: {
              biro_tenant: {
                select: {
                  id: true,
                  nama_biro: true,
                },
              },
            },
          },
          peserta_psikotes: true,
          psikolog: {
            select: {
              id: true,
              nama_gelar: true,
              kategori: true,
              foto: true,
              account: {
                select: {
                  no_telepon: true,
                  email: true,
                },
              },
            },
          },
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

    // 2. Tampilkan setiap booking transaksi secara mandiri berdasarkan ID booking unik:
    // Jika ada 2 orang atau lebih mendaftar dengan nomor telepon yang sama (misal keluarga/anak yang didaftarkan orang tua)
    // atau 1 orang mendaftar beberapa kali dengan transaksi berbeda, seluruh data tetap tampil sebagai baris mandiri.
    const seenBookingIds = new Set<string>()
    const filteredItems: typeof items = []

    for (const b of items) {
      if (!b.client || b.client.nama === 'Tamu Anonim') continue
      if (!seenBookingIds.has(b.id)) {
        seenBookingIds.add(b.id)
        filteredItems.push(b)
      }
    }

    const claimedRows = filteredItems.length > 0 ? await this.prisma.$queryRawUnsafe<Array<{ id: string; claimed_at: Date | null }>>(
      `SELECT id, claimed_at FROM "booking_psikotes" WHERE id = ANY($1::text[])`,
      filteredItems.map((b) => b.id)
    ) : []
    const claimedMap = new Map(claimedRows.map((r) => [r.id, r.claimed_at]))

    const addWorkingDays = (startDate: Date, workingDays: number): Date => {
      const result = new Date(startDate.getTime())
      let added = 0
      if (result.getDay() === 0) {
        result.setDate(result.getDate() + 1)
      }
      while (added < workingDays) {
        result.setDate(result.getDate() + 1)
        if (result.getDay() !== 0) {
          added++
        }
      }
      return result
    }

    return {
      summary: {
        total_peserta: totalBerbayar + totalGratis,
        total_gratis: totalGratis,
        total_berbayar: totalBerbayar,
        total_selesai: totalSelesai,
        total_menunggu_review: totalMenungguReview,
      },
      items: filteredItems.map((b) => {
        const tglPengerjaan = b.hasil_tes?.tanggal_selesai || b.createdAt
        const batasReview = addWorkingDays(new Date(tglPengerjaan), 3)

        return {
          id: b.id,
          id_paket: b.id_paket,
          nama_paket: b.paket.judul,
          kode_akses: b.kode_akses || (b.transaksi as any)?.kode_transaksi || null,
          jenis_akses: b.paket.jenis_akses === 'GRATIS' ? 'Gratis' : 'Berbayar',
          harga: b.paket.harga,
          nama_peserta: (b as any).peserta_psikotes?.nama_lengkap || b.client.nama,
          no_hp: formatIndonesianPhone(
            (b as any).peserta_psikotes?.no_telepon ||
            (b as any).peserta_psikotes?.no_telepon_orang_tua ||
            b.client.no_telepon ||
            '—'
          ),
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
          tanggal: tglPengerjaan,
          tanggal_pengerjaan: tglPengerjaan,
          batas_review: batasReview,
        status: (() => {
          const isDass = Boolean(
            b.paket?.judul?.toLowerCase().includes('dass') ||
            b.paket?.judul?.toLowerCase().includes('depresi, kecemasan, dan stres')
          )
          const effectivePerluReview = !isDass && Boolean(
            (b.paket as any)?.perlu_review_psikolog ||
            b.paket?.judul?.toLowerCase().includes('mcmi')
          )
          if (effectivePerluReview && b.status_pengerjaan === 'MENUNGGU_REVIEW') {
            return 'Menunggu Review'
          }
          if (b.status_pengerjaan === 'SELESAI' || b.hasil_tes) {
            return 'Selesai'
          }
          return 'Menunggu Pengerjaan'
        })(),
        status_pengerjaan: (() => {
          const isDass = Boolean(
            b.paket?.judul?.toLowerCase().includes('dass') ||
            b.paket?.judul?.toLowerCase().includes('depresi, kecemasan, dan stres')
          )
          if (isDass && b.hasil_tes) return 'SELESAI'
          return b.status_pengerjaan
        })(),
        perlu_review_psikolog:
          !(
            b.paket?.judul?.toLowerCase().includes('dass') ||
            b.paket?.judul?.toLowerCase().includes('depresi, kecemasan, dan stres')
          ) && Boolean((b.paket as any).perlu_review_psikolog),
        id_biro: (b.client as any)?.id_biro || (b.transaksi as any)?.id_biro_tenant || null,
        nama_biro: (b.client as any)?.biro?.nama_biro || (b.transaksi as any)?.biro_tenant?.nama_biro || 'Empathika (Pusat)',
        is_biro: Boolean((b.client as any)?.biro?.nama_biro || (b.transaksi as any)?.biro_tenant?.nama_biro),
        nama_pemesan: b.client?.nama || null,
        no_hp_pemesan: b.client?.no_telepon ? formatIndonesianPhone(b.client.no_telepon) : null,
        is_pembeli_berbeda: Boolean(
          (b as any).peserta_psikotes?.nama_lengkap &&
          b.client?.nama &&
          (b as any).peserta_psikotes.nama_lengkap.trim().toLowerCase() !== b.client.nama.trim().toLowerCase()
        ),
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
                tanggal_selesai: b.hasil_tes.tanggal_selesai,
                detail_skor: b.hasil_tes.detail_skor,
                catatan_psikolog: (b.hasil_tes as any).catatan_psikolog || null,
                rekomendasi_psikolog: (b.hasil_tes as any).rekomendasi_psikolog || null,
                draft_saved_at: (b.hasil_tes as any)?.draft_saved_at || null,
                tanggal_review: (b.hasil_tes as any).tanggal_review || null,
              }
            })()
          : null,
        id_psikolog: b.id_psikolog,
        claimed_at: b.id_psikolog ? (claimedMap.get(b.id) || b.updatedAt) : null,
        psikolog: (b as any).psikolog
          ? {
              id: (b as any).psikolog.id,
              nama: (b as any).psikolog.nama_gelar,
              nama_gelar: (b as any).psikolog.nama_gelar,
              kategori: (b as any).psikolog.kategori,
              foto: (b as any).psikolog.foto || null,
              no_telepon: (b as any).psikolog.account?.no_telepon || null,
              email: (b as any).psikolog.account?.email || null,
            }
          : null,
        }
      }),
    }
  }


  async cleanupOldAnonymousGuests(daysOld: number = 60) {
    this.purgeExpiredPsikotesData().catch(() => {})

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
          await tx.client.delete({ where: { id: cId } }).catch(() => { })
        }
      }

      return {
        deletedCount: res.count,
        message: `Berhasil membersihkan ${res.count} riwayat pengerjaan tamu anonim yang lebih dari ${daysOld} hari.`,
      }
    })
  }

  /**
   * Pembersihan berkala (Hard Delete / Auto-purge) data pengerjaan psikotes, tiket akses, dan peserta berbayar
   * yang usianya telah melewati batas masa berlaku 3 bulan (90 hari).
   * - Tes Selesai: dihitung 90 hari sejak tanggal_selesai hasil tes.
   * - Tiket Belum Selesai / Kedaluwarsa: dihitung 90 hari sejak createdAt booking.
   * Menghapus secara permanen record hasil_tes, peserta_psikotes, jawaban_psikotes, dan booking_psikotes.
   */

  async purgeExpiredPsikotesData(daysOld: number = 90) {
    try {
      if (
        typeof this.prisma?.bookingPsikotes?.findMany !== 'function' ||
        typeof this.prisma?.$transaction !== 'function'
      ) {
        return { deletedCount: 0 }
      }

      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

      const expiredBookings = await this.prisma.bookingPsikotes.findMany({
        where: {
          paket: { jenis_akses: 'BERBAYAR' },
          OR: [
            {
              hasil_tes: {
                tanggal_selesai: { lt: cutoffDate },
              },
            },
            {
              hasil_tes: null,
              createdAt: { lt: cutoffDate },
            },
          ],
        },
        select: { id: true },
      })

      if (expiredBookings.length === 0) {
        return { deletedCount: 0 }
      }

      const bookingIds = expiredBookings.map((b) => b.id)

      return await this.prisma.$transaction(async (tx) => {
        await tx.hasilTes.deleteMany({ where: { id_booking: { in: bookingIds } } })
        await tx.pesertaPsikotes.deleteMany({ where: { id_booking: { in: bookingIds } } })
        await tx.jawabanPsikotes.deleteMany({ where: { id_booking: { in: bookingIds } } })
        const res = await tx.bookingPsikotes.deleteMany({ where: { id: { in: bookingIds } } })
        return { deletedCount: res.count }
      }, { maxWait: 10000, timeout: 25000 })
    } catch (err) {
      console.error('[purgeExpiredPsikotesData] Gagal membersihkan data psikotes kedaluwarsa:', err)
      return { deletedCount: 0 }
    }
  }

}
