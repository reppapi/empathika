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
    if (!env.SMTP_HOST) {
      console.log('[Mailer] SMTP tidak dikonfigurasi, skip:', options.subject)
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
      html: 
        <h2>Booking Dikonfirmasi</h2>
        <p>Halo ,</p>
        <p>Booking konsultasi Anda dengan <strong></strong> pada <strong></strong> telah dikonfirmasi.</p>
        <p>Terima kasih telah menggunakan Empathika.</p>
      ,
    })
  },
}
