import nodemailer from 'nodemailer'
import { env } from '../config/env'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT ?? 587,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
})

interface MailOptions {
  to: string
  subject: string
  html: string
}

export const mailer = {
  send: async (options: MailOptions) => {
    // Jika SMTP User/Pass belum diset (mode dev/lokal), cetak preview dan URL verifikasi ke console terminal backend
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.log(`\n================== [MAILER DEV PREVIEW] ==================`)
      console.log(`Kepada   : ${options.to}`)
      console.log(`Subjek   : ${options.subject}`)
      
      // Ambil tautan verifikasi jika ada di dalam HTML
      const linkMatch = options.html.match(/href="([^"]+)"/)
      if (linkMatch && linkMatch[1]) {
        console.log(`🔗 LINK VERIFIKASI: ${linkMatch[1]}`)
      }
      console.log(`==========================================================\n`)
      return
    }

    return transporter.sendMail({
      from: env.EMAIL_FROM ?? 'noreply@empathika.id',
      ...options,
    })
  },

  sendBookingConfirmation: async (to: string, data: { nama: string; tanggal: string; psikolog: string }) => {
    return mailer.send({
      to,
      subject: 'Konfirmasi Booking Konsultasi - Empathika',
      html: `
        <h2>Booking Dikonfirmasi</h2>
        <p>Halo ${data.nama},</p>
        <p>Booking konsultasi Anda dengan <strong>${data.psikolog}</strong> pada <strong>${data.tanggal}</strong> telah dikonfirmasi.</p>
        <p>Terima kasih telah menggunakan Empathika.</p>
      `,
    })
  },
}
