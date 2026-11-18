import type { PrismaClient } from '@prisma/client'

/**
 * Pembersihan otomatis data psikotes berbayar yang telah melewati batas masa retensi (default 90 hari / 3 bulan).
 * Menghapus relasi hasilTes, pesertaPsikotes, jawabanPsikotes, dan bookingPsikotes.
 */
export async function purgeExpiredPsikotesData(
  prisma: PrismaClient,
  daysOld: number = 90
): Promise<{ deletedCount: number }> {
  try {
    if (
      typeof prisma?.bookingPsikotes?.findMany !== 'function' ||
      typeof prisma?.$transaction !== 'function'
    ) {
      return { deletedCount: 0 }
    }

    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

    const expiredBookings = await prisma.bookingPsikotes.findMany({
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

    return await prisma.$transaction(
      async (tx) => {
        await tx.hasilTes.deleteMany({ where: { id_booking: { in: bookingIds } } })
        await tx.pesertaPsikotes.deleteMany({ where: { id_booking: { in: bookingIds } } })
        await tx.jawabanPsikotes.deleteMany({ where: { id_booking: { in: bookingIds } } })
        const res = await tx.bookingPsikotes.deleteMany({ where: { id: { in: bookingIds } } })
        return { deletedCount: res.count }
      },
      { maxWait: 10000, timeout: 25000 }
    )
  } catch (err) {
    console.error('[purgeExpiredPsikotesData] Gagal membersihkan data psikotes kedaluwarsa:', err)
    return { deletedCount: 0 }
  }
}

