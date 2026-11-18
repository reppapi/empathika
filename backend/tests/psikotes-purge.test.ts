import { describe, it, expect, vi } from 'vitest'
import { PsikotesRepository } from '../src/modules/psikotes/psikotes.repository'

describe('Psikotes Purge & 3-Month Retention Lifecycle', () => {
  it('purgeExpiredPsikotesData: menghapus booking, hasil_tes, peserta_psikotes, jawaban_psikotes untuk data > 90 hari', async () => {
    const deletedBookingIds = ['booking-old-1', 'booking-old-2']

    const mockPrisma: any = {
      bookingPsikotes: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'booking-old-1' },
          { id: 'booking-old-2' },
        ]),
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      hasilTes: {
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      pesertaPsikotes: {
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      jawabanPsikotes: {
        deleteMany: vi.fn().mockResolvedValue({ count: 50 }),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return callback(mockPrisma)
      }),
    }

    const repo = new PsikotesRepository(mockPrisma)
    const result = await repo.purgeExpiredPsikotesData(90)

    expect(result.deletedCount).toBe(2)
    expect(mockPrisma.bookingPsikotes.findMany).toHaveBeenCalledTimes(1)
    expect(mockPrisma.hasilTes.deleteMany).toHaveBeenCalledWith({
      where: { id_booking: { in: deletedBookingIds } },
    })
    expect(mockPrisma.pesertaPsikotes.deleteMany).toHaveBeenCalledWith({
      where: { id_booking: { in: deletedBookingIds } },
    })
    expect(mockPrisma.jawabanPsikotes.deleteMany).toHaveBeenCalledWith({
      where: { id_booking: { in: deletedBookingIds } },
    })
    expect(mockPrisma.bookingPsikotes.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: deletedBookingIds } },
    })
  })

  it('purgeExpiredPsikotesData: tidak melakukan delete jika tidak ada data kedaluwarsa', async () => {
    const mockPrisma: any = {
      bookingPsikotes: {
        findMany: vi.fn().mockResolvedValue([]),
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn(),
    }

    const repo = new PsikotesRepository(mockPrisma)
    const result = await repo.purgeExpiredPsikotesData(90)

    expect(result.deletedCount).toBe(0)
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('findPeserta: otomatis menambahkan filter retensi 3 bulan (90 hari) pada query', async () => {
    const mockPrisma: any = {
      bookingPsikotes: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
      $transaction: vi.fn(),
    }

    const repo = new PsikotesRepository(mockPrisma)
    vi.spyOn(repo, 'purgeExpiredPsikotesData').mockResolvedValue({ deletedCount: 0 })

    await repo.findPeserta({ page: 1, limit: 10 })

    expect(repo.purgeExpiredPsikotesData).toHaveBeenCalledTimes(1)
    expect(mockPrisma.bookingPsikotes.findMany).toHaveBeenCalledTimes(1)

    const findManyArg = mockPrisma.bookingPsikotes.findMany.mock.calls[0][0]
    expect(findManyArg.where.AND).toBeDefined()
    expect(findManyArg.where.AND.length).toBeGreaterThanOrEqual(1)

    // Periksa bahwa nonExpiredFilter ada di mana tanggal_selesai atau createdAt dicek
    const hasExpiryCheck = findManyArg.where.AND.some((cond: any) =>
      Array.isArray(cond.OR) &&
      cond.OR.some((sub: any) => sub.hasil_tes?.tanggal_selesai?.gte || sub.createdAt?.gte)
    )
    expect(hasExpiryCheck).toBe(true)
  })

  it('getHasilByBookingId: menolak akses klien (410) jika hasil tes lebih dari 90 hari', async () => {
    const expiredDate = new Date(Date.now() - 95 * 24 * 60 * 60 * 1000) // 95 hari lalu

    const mockBooking = {
      id: 'b-expired',
      paket: { jenis_akses: 'GRATIS' },
      hasil_tes: {
        total_skor: 10,
        detail_skor: null,
        tanggal_selesai: expiredDate,
      },
    }

    const mockPrisma: any = {
      bookingPsikotes: {
        findFirst: vi.fn().mockResolvedValue(mockBooking),
        findMany: vi.fn().mockResolvedValue([]),
      },
    }

    const repo = new PsikotesRepository(mockPrisma)
    await expect(repo.getHasilByBookingId('b-expired')).rejects.toMatchObject({
      statusCode: 410,
      message: expect.stringContaining('3 bulan'),
    })
  })
})

