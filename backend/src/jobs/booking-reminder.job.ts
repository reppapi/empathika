// Cron job opsional: kirim reminder H-1 sebelum sesi konsultasi
// Jalankan dengan node-cron atau BullMQ

// import cron from 'node-cron'
// import { mailer } from '../lib/mailer'
// import { prisma } from '../lib/prisma'

export async function sendBookingReminders() {
  // TODO: Query booking yang jadwalnya besok
  // const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  // const bookings = await prisma.booking.findMany({
  //   where: { jadwalTanggal: { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) }, status: 'CONFIRMED' },
  //   include: { user: true, psikolog: true },
  // })
  // for (const booking of bookings) {
  //   await mailer.sendBookingConfirmation(booking.user.email, { ... })
  // }
  console.log('[Job] sendBookingReminders executed')
}

// Jalankan setiap hari jam 08:00
// cron.schedule('0 8 * * *', sendBookingReminders)
