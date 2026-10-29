import type { FastifyInstance } from 'fastify'
import { BookingRepository } from '../modules/booking/booking.repository'

/**
 * Background Job untuk membersihkan sesi booking pending yang kedaluwarsa (> 30 menit)
 * dan mengembalikan status slot jadwal menjadi TERSEDIA secara otomatis.
 *
 * @param fastify Instance Fastify
 * @param intervalMinutes Interval eksekusi scheduler (default: tiap 10 menit)
 * @param maxAgeMinutes Batas kedaluwarsa sesi pending (default: 30 menit)
 */
export function startExpiredBookingCleanupJob(
  fastify: FastifyInstance,
  intervalMinutes: number = 10,
  maxAgeMinutes: number = 30
) {
  const repo = new BookingRepository(fastify.prisma)

  const runCleanup = async () => {
    try {
      const result = await repo.cancelExpiredPendingBookings(maxAgeMinutes)
      if (result.count > 0) {
        fastify.log.info(
          `[Job] Pembersihan otomatis: ${result.count} booking pending kedaluwarsa dibatalkan dan slot berhasil dikembalikan.`
        )
      }
    } catch (err: any) {
      fastify.log.error(`[Job] Gagal membersihkan booking pending kedaluwarsa: ${err.message}`)
    }
  }

  // 1. Jalankan pembersihan satu kali saat server pertama kali siap
  runCleanup()

  // 2. Pasang interval berkala (misal tiap 10 menit)
  const timer = setInterval(runCleanup, intervalMinutes * 60 * 1000)

  // 3. Bersihkan timer saat Fastify server shutdown agar tidak terjadi memory leak
  fastify.addHook('onClose', (_instance, done) => {
    clearInterval(timer)
    done()
  })

  fastify.log.info(
    `[Job] Background scheduler aktif: pembersihan booking pending kedaluwarsa otomatis berjalan setiap ${intervalMinutes} menit.`
  )
}
