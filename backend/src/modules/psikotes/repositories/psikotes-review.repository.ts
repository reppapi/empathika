/** Sub-repository antrean tinjauan telaah psikolog (Shared Pool, Klaim, Submit, Rilis) */
import type { PrismaClient } from '@prisma/client'
import type {
  ReviewPsikotesQueryInput,
  SubmitReviewPsikotesInput,
} from '../psikotes.schema'
import { formatIndonesianPhone } from '../../../utils'
import { purgeExpiredPsikotesData } from './retensi-psikotes.helper'

export class PsikotesReviewRepository {
  constructor(private prisma: PrismaClient) {}

  async getReviewList(params?: ReviewPsikotesQueryInput) {
    purgeExpiredPsikotesData(this.prisma).catch(() => {})

    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const nonExpiredFilter = {
      OR: [
        { hasil_tes: { tanggal_selesai: { gte: cutoffDate } } },
        {
          hasil_tes: null,
          createdAt: { gte: cutoffDate },
        },
      ],
    }

    const nonDassFilter: any = {
      NOT: [
        { paket: { judul: { contains: 'dass', mode: 'insensitive' } } },
        { paket: { judul: { contains: 'depresi, kecemasan, dan stres', mode: 'insensitive' } } },
      ],
    }

    const baseWhere: any = {
      OR: [
        { paket: { perlu_review_psikolog: true } },
        { status_pengerjaan: 'MENUNGGU_REVIEW' },
      ],
      hasil_tes: { isNot: null },
      AND: [nonExpiredFilter, nonDassFilter],
    }

    if (params?.status === 'MENUNGGU_REVIEW') {
      baseWhere.status_pengerjaan = 'MENUNGGU_REVIEW'
    } else if (params?.status === 'KOLAM_BERSAMA') {
      baseWhere.status_pengerjaan = 'MENUNGGU_REVIEW'
      baseWhere.id_psikolog = null
    } else if (params?.status === 'SEDANG_DITELAAH') {
      baseWhere.status_pengerjaan = 'MENUNGGU_REVIEW'
      baseWhere.id_psikolog = { not: null }
    } else if (params?.status === 'SELESAI') {
      baseWhere.status_pengerjaan = 'SELESAI'
    }

    if (params?.search) {
      const q = params.search.trim()
      baseWhere.AND.push({
        OR: [
          { client: { nama: { contains: q, mode: 'insensitive' } } },
          { peserta_psikotes: { nama_lengkap: { contains: q, mode: 'insensitive' } } },
          { kode_akses: { contains: q, mode: 'insensitive' } },
          { paket: { judul: { contains: q, mode: 'insensitive' } } },
          { transaksi: { kode_transaksi: { contains: q, mode: 'insensitive' } } },
        ],
      })
    }

    const [totalAntrean, kolamBersama, sedangDitelaah, selesaiReview, items] = await Promise.all([
      this.prisma.bookingPsikotes.count({
        where: {
          OR: [
            { paket: { perlu_review_psikolog: true } },
            { status_pengerjaan: 'MENUNGGU_REVIEW' },
          ],
          hasil_tes: { isNot: null },
          AND: [nonExpiredFilter, nonDassFilter],
        },
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          OR: [
            { paket: { perlu_review_psikolog: true } },
            { status_pengerjaan: 'MENUNGGU_REVIEW' },
          ],
          hasil_tes: { isNot: null },
          status_pengerjaan: 'MENUNGGU_REVIEW',
          id_psikolog: null,
          AND: [nonExpiredFilter, nonDassFilter],
        },
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          OR: [
            { paket: { perlu_review_psikolog: true } },
            { status_pengerjaan: 'MENUNGGU_REVIEW' },
          ],
          hasil_tes: { isNot: null },
          status_pengerjaan: 'MENUNGGU_REVIEW',
          id_psikolog: { not: null },
          AND: [nonExpiredFilter, nonDassFilter],
        },
      }),
      this.prisma.bookingPsikotes.count({
        where: {
          OR: [
            { paket: { perlu_review_psikolog: true } },
            { status_pengerjaan: 'MENUNGGU_REVIEW' },
          ],
          hasil_tes: { isNot: null },
          status_pengerjaan: 'SELESAI',
          AND: [nonExpiredFilter, nonDassFilter],
        },
      }),
      this.prisma.bookingPsikotes.findMany({
        where: baseWhere,
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
              id_account: true,
              nama_gelar: true,
              kategori: true,
              foto: true,
            },
          },
          hasil_tes: {
            include: {
              interpretasi: true,
            },
          },
        },
        orderBy: params?.status === 'MENUNGGU_REVIEW'
          ? [{ createdAt: 'asc' }]
          : [{ status_pengerjaan: 'asc' }, { createdAt: 'desc' }],
        take: params?.limit || 50,
        skip: ((params?.page || 1) - 1) * (params?.limit || 50),
      }),
    ])

    const claimedRows = items.length > 0 ? await this.prisma.$queryRawUnsafe<Array<{ id: string; claimed_at: Date | null }>>(
      `SELECT id, claimed_at FROM "booking_psikotes" WHERE id = ANY($1::text[])`,
      items.map((b) => b.id)
    ) : []
    const claimedMap = new Map(claimedRows.map((r) => [r.id, r.claimed_at]))

    return {
      summary: {
        total: totalAntrean,
        menunggu_review: kolamBersama + sedangDitelaah,
        kolam_bersama: kolamBersama,
        sedang_ditelaah: sedangDitelaah,
        selesai_review: selesaiReview,
      },
      items: items.map((b) => {
        const tglPengerjaan = b.hasil_tes?.tanggal_selesai || b.createdAt
        // Hitung deadline 3 hari kerja (Senin s.d. Sabtu, Minggu libur)
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
        const batasReview = addWorkingDays(new Date(tglPengerjaan), 3)

        const isClaimed = b.status_pengerjaan === 'MENUNGGU_REVIEW' && Boolean(b.id_psikolog)
        const lockAgeMs = b.updatedAt ? Date.now() - new Date(b.updatedAt).getTime() : 0
        const isStaleClaim = isClaimed && lockAgeMs > 24 * 60 * 60 * 1000

        return {
          id: b.id,
          id_paket: b.id_paket,
          id_psikolog: b.id_psikolog,
          is_claimed: isClaimed,
          claimed_at: b.id_psikolog ? (claimedMap.get(b.id) || b.updatedAt) : null,
          is_stale_claim: isStaleClaim,
          kode_akses: b.kode_akses || b.transaksi?.kode_transaksi || null,
          nama_paket: b.paket.judul,
          nama_biro: (b.client as any)?.biro?.nama_biro || (b.transaksi as any)?.biro_tenant?.nama_biro || 'Empathika (Pusat)',
          is_biro: Boolean((b.client as any)?.biro?.nama_biro || (b.transaksi as any)?.biro_tenant?.nama_biro),
          jenis_akses: b.paket.jenis_akses === 'GRATIS' ? 'Gratis' : 'Berbayar',
          nama_peserta: (b as any).peserta_psikotes?.nama_lengkap || b.client.nama,
          no_hp: formatIndonesianPhone(
            (b as any).peserta_psikotes?.no_telepon ||
              (b as any).peserta_psikotes?.no_telepon_orang_tua ||
              b.client.no_telepon ||
              '—'
          ),
          usia: (b as any).peserta_psikotes?.usia ?? b.client.usia,
          jenis_kelamin: (b as any).peserta_psikotes?.jenis_kelamin || b.client.jenis_kelamin,
          tanggal_pengerjaan: tglPengerjaan,
          batas_review: batasReview,
          status_pengerjaan: b.status_pengerjaan,
          perlu_review_psikolog: (b.paket as any).perlu_review_psikolog,
          catatan_psikolog: (b.hasil_tes as any)?.catatan_psikolog || null,
          rekomendasi_psikolog: (b.hasil_tes as any)?.rekomendasi_psikolog || null,
          draft_saved_at: (b.hasil_tes as any)?.draft_saved_at || null,
          tanggal_review: (b.hasil_tes as any)?.tanggal_review || null,
          psikolog: (b as any).psikolog
            ? {
                id: (b as any).psikolog.id,
                id_account: (b as any).psikolog.id_account,
                nama: (b as any).psikolog.nama_gelar,
                kategori: (b as any).psikolog.kategori,
                foto: (b as any).psikolog.foto,
              }
            : null,
          total_skor: b.hasil_tes?.total_skor,
          detail_skor: b.hasil_tes?.detail_skor
            ? (typeof b.hasil_tes.detail_skor === 'string'
                ? JSON.parse(b.hasil_tes.detail_skor)
                : b.hasil_tes.detail_skor)
            : null,
        }
      }),
    }
  }

  /**
   * Menyimpan verifikasi dan catatan telaah klinis psikolog untuk asesmen.
   */
  async submitReview(
    bookingId: string,
    input: SubmitReviewPsikotesInput,
    userId?: string,
    userRole?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookingPsikotes.findUnique({
        where: { id: bookingId },
        include: {
          hasil_tes: true,
          paket: true,
        },
      })

      if (!booking) {
        throw Object.assign(new Error('Data booking atau pengerjaan asesmen tidak ditemukan'), {
          statusCode: 404,
        })
      }

      if (!booking.hasil_tes) {
        throw Object.assign(
          new Error('Hasil tes belum tersedia. Peserta belum menyelesaikan asesmen.'),
          { statusCode: 400 }
        )
      }

      // Cari record psikolog yang valid di tabel psikolog
      let resolvedPsikologId: string | null = null

      // 1. Prioritas Utama: Jika caller memiliki sesi autentikasi, tautkan langsung ke profil psikolog miliknya (anti-impersonation)
      if (userId) {
        let found: any = null
        try {
          const rows = typeof tx.$queryRawUnsafe === 'function'
            ? await tx.$queryRawUnsafe<any[]>(
                `SELECT id, is_reviewer_psikotes FROM "psikologs" WHERE id = $1 OR id_account = $1 LIMIT 1`,
                userId
              )
            : null
          found = rows && rows[0] ? rows[0] : null
        } catch {
          found = null
        }
        if (!found) {
          found = await tx.psikolog.findFirst({
            where: {
              OR: [{ id_account: userId }, { id: userId }],
            },
            select: { id: true, ...({ is_reviewer_psikotes: true } as any) },
          })
        }
        if (found) {
          if (userRole !== 'ADMIN' && !found.is_reviewer_psikotes) {
            throw Object.assign(
              new Error(
                'Akses ditolak: Anda belum memiliki wewenang klinis sebagai Reviewer Psikotes. Hubungi Administrator Empathika untuk mengaktifkan hak review.'
              ),
              { statusCode: 403 }
            )
          }
          resolvedPsikologId = found.id
        }
      }

      // 2. Jika caller adalah ADMIN dan secara spesifik menugaskan psikolog tertentu
      if (!resolvedPsikologId && userRole === 'ADMIN' && input.id_psikolog) {
        const found = await tx.psikolog.findFirst({
          where: {
            OR: [{ id: input.id_psikolog }, { id_account: input.id_psikolog }],
          },
          select: { id: true },
        })
        if (found) resolvedPsikologId = found.id
      }

      // 3. Jika belum ditemukan, gunakan psikolog yang sudah tersimpan di booking sebelumnya
      if (!resolvedPsikologId && booking.id_psikolog) {
        const existing = await tx.psikolog.findUnique({
          where: { id: booking.id_psikolog },
          select: { id: true },
        })
        if (existing) resolvedPsikologId = existing.id
      }

      // 3.5. Proteksi Konflik Pengerjaan Antar Psikolog (Strict Lock Protection):
      if (booking.id_psikolog && resolvedPsikologId && booking.id_psikolog !== resolvedPsikologId) {
        if (userRole !== 'ADMIN') {
          const lockedPsi = await tx.psikolog.findUnique({
            where: { id: booking.id_psikolog },
            select: { nama_gelar: true },
          })
          throw Object.assign(
            new Error(
              `Tiket asesmen ini sedang aktif dikunci dan ditelaah oleh ${lockedPsi?.nama_gelar || 'rekan psikolog lain'}. Anda tidak dapat menimpa hasil telaah rekan Anda.`
            ),
            { statusCode: 409 }
          )
        }
      }

      // 4. KEPATUHAN ETIK & HUKUM SIPP:
      // Jika bukan draf (laporan resmi hendak diterbitkan), WAJIB ada identitas psikolog yang terverifikasi.
      // Dilarang keras menggunakan fallback acak psikolog pertama di database.
      if (!resolvedPsikologId && !input.is_draft) {
        throw Object.assign(
          new Error(
            'Laporan resmi hanya dapat diterbitkan oleh psikolog klinis yang terdaftar secara sah di sistem. Silakan periksa kredensial akun pemeriksa Anda.'
          ),
          { statusCode: 403 }
        )
      }

      // 1. Update HasilTes
      const now = new Date()
      const updatedHasil = await tx.hasilTes.update({
        where: { id: booking.hasil_tes.id },
        data: {
          catatan_psikolog: input.catatan_psikolog.trim(),
          rekomendasi_psikolog: input.rekomendasi_psikolog?.trim() || null,
          ...(input.is_draft
            ? ({ draft_saved_at: now } as any)
            : { tanggal_review: now }),
        },
      })

      // 2. Update BookingPsikotes: status_pengerjaan -> SELESAI jika bukan draft
      const targetStatus = input.is_draft ? booking.status_pengerjaan : 'SELESAI'
      const updatedBooking = await tx.bookingPsikotes.update({
        where: { id: booking.id },
        data: {
          status_pengerjaan: targetStatus,
          ...(resolvedPsikologId ? { id_psikolog: resolvedPsikologId } : {}),
        },
        include: {
          psikolog: {
            select: { id: true, nama_gelar: true },
          },
          hasil_tes: true,
          paket: true,
        },
      })

      return {
        booking: updatedBooking,
        hasil: updatedHasil,
      }
    })
  }

  /**
   * Mengklaim / mengunci tiket asesmen dari Kolam Bersama (Shared Pool) untuk psikolog yang bersangkutan.
   * Mencegah tumpang tindih pengerjaan (race condition) antar rekan psikolog.
   */
  async claimReviewTicket(bookingId: string, userId?: string, userRole?: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookingPsikotes.findUnique({
        where: { id: bookingId },
        include: {
          hasil_tes: true,
          psikolog: { select: { id: true, nama_gelar: true, kategori: true } },
        },
      })

      if (!booking) {
        throw Object.assign(new Error('Data booking atau tiket asesmen tidak ditemukan.'), { statusCode: 404 })
      }

      if (booking.status_pengerjaan === 'SELESAI') {
        throw Object.assign(new Error('Asesmen ini sudah selesai ditelaah dan diverifikasi.'), { statusCode: 400 })
      }

      // Resolusi profil psikolog yang melakukan klaim
      let resolvedPsikolog: any = null
      if (userId) {
        try {
          const rows = typeof tx.$queryRawUnsafe === 'function'
            ? await tx.$queryRawUnsafe<any[]>(
                `SELECT id, nama_gelar, kategori, is_reviewer_psikotes FROM "psikologs" WHERE id = $1 OR id_account = $1 LIMIT 1`,
                userId
              )
            : null
          resolvedPsikolog = rows && rows[0] ? rows[0] : null
        } catch {
          resolvedPsikolog = null
        }
        if (!resolvedPsikolog) {
          resolvedPsikolog = await tx.psikolog.findFirst({
            where: {
              OR: [{ id_account: userId }, { id: userId }],
            },
            select: { id: true, nama_gelar: true, kategori: true, ...({ is_reviewer_psikotes: true } as any) },
          })
        }
      }

      if (!resolvedPsikolog && userRole !== 'ADMIN') {
        throw Object.assign(
          new Error('Akses ditolak: Akun Anda tidak terhubung dengan profil psikolog resmi Empathika.'),
          { statusCode: 403 }
        )
      }

      if (userRole !== 'ADMIN' && resolvedPsikolog && !resolvedPsikolog.is_reviewer_psikotes) {
        throw Object.assign(
          new Error(
            'Akses ditolak: Anda belum memiliki wewenang klinis sebagai Reviewer Psikotes. Hubungi Administrator Empathika untuk mengaktifkan hak review.'
          ),
          { statusCode: 403 }
        )
      }

      const targetPsikologId = resolvedPsikolog?.id || booking.id_psikolog

      // Jika tiket sudah terkunci oleh psikolog lain (hanya ADMIN yang berhak mengalihkan):
      if (booking.id_psikolog && booking.id_psikolog !== targetPsikologId) {
        if (userRole !== 'ADMIN') {
          const claimedByName = booking.psikolog?.nama_gelar || 'rekan psikolog lain'
          throw Object.assign(
            new Error(
              `Tiket ini sedang aktif ditelaah oleh ${claimedByName}. Anda tidak dapat menimpa tiket yang sedang dikerjakan.`
            ),
            { statusCode: 409 }
          )
        }
      }

      // Kunci tiket atas nama psikolog ini
      const updated = await tx.bookingPsikotes.update({
        where: { id: bookingId },
        data: {
          id_psikolog: targetPsikologId,
        },
        include: {
          psikolog: { select: { id: true, nama_gelar: true, kategori: true, foto: true } },
        },
      })

      // Simpan waktu awal klaim tiket secara permanen jika belum ada
      if (typeof tx.$executeRawUnsafe === 'function') {
        try {
          await tx.$executeRawUnsafe(
            `UPDATE "booking_psikotes" SET "claimed_at" = COALESCE("claimed_at", NOW()) WHERE id = $1`,
            bookingId
          )
        } catch {}
      }

      let actualClaimedAt = updated.updatedAt
      if (typeof tx.$queryRawUnsafe === 'function') {
        try {
          const claimedRaw = await tx.$queryRawUnsafe<any[]>(
            `SELECT "claimed_at" FROM "booking_psikotes" WHERE id = $1 LIMIT 1`,
            bookingId
          )
          if (claimedRaw && claimedRaw[0]?.claimed_at) {
            actualClaimedAt = claimedRaw[0].claimed_at
          }
        } catch {}
      }

      return {
        id: updated.id,
        status_pengerjaan: updated.status_pengerjaan,
        is_claimed: true,
        claimed_by: updated.psikolog
          ? {
              id: updated.psikolog.id,
              nama: updated.psikolog.nama_gelar,
              nama_gelar: updated.psikolog.nama_gelar,
              kategori: updated.psikolog.kategori,
              foto: updated.psikolog.foto,
            }
          : null,
        claimed_at: actualClaimedAt,
      }
    })
  }

  /**
   * Mengembalikan tiket asesmen kembali ke Kolam Bersama (Shared Pool)
   * agar dapat ditinjau oleh 3 rekan psikolog lainnya.
   */
  async releaseReviewTicket(bookingId: string, userId?: string, userRole?: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookingPsikotes.findUnique({
        where: { id: bookingId },
        include: {
          psikolog: { select: { id: true, nama_gelar: true } },
        },
      })

      if (!booking) {
        throw Object.assign(new Error('Data booking atau tiket asesmen tidak ditemukan.'), { statusCode: 404 })
      }

      if (booking.status_pengerjaan === 'SELESAI') {
        throw Object.assign(new Error('Tidak dapat melepas tiket asesmen yang sudah selesai diterbitkan.'), {
          statusCode: 400,
        })
      }

      if (!booking.id_psikolog) {
        return {
          id: booking.id,
          message: 'Tiket sudah berada di Kolam Bersama.',
          is_claimed: false,
        }
      }

      // Validasi wewenang: hanya psikolog pemilik lock atau Admin yang boleh melepas tiket
      if (userRole !== 'ADMIN' && userId) {
        const callerPsi = await tx.psikolog.findFirst({
          where: { OR: [{ id_account: userId }, { id: userId }] },
          select: { id: true },
        })

        if (!callerPsi || callerPsi.id !== booking.id_psikolog) {
          throw Object.assign(
            new Error('Hanya psikolog yang sedang menelaah tiket ini atau Admin yang berhak mengembalikannya ke antrean bersama.'),
            { statusCode: 403 }
          )
        }
      }

      const updated = await tx.bookingPsikotes.update({
        where: { id: bookingId },
        data: {
          id_psikolog: null,
        },
      })

      if (typeof tx.$executeRawUnsafe === 'function') {
        try {
          await tx.$executeRawUnsafe(
            `UPDATE "booking_psikotes" SET "claimed_at" = NULL WHERE id = $1`,
            bookingId
          )
        } catch {}
      }

      return {
        id: updated.id,
        status_pengerjaan: updated.status_pengerjaan,
        is_claimed: false,
        claimed_by: null,
        message: 'Tiket berhasil dikembalikan ke Kolam Bersama (Shared Pool).',
      }
    })
  }
}
