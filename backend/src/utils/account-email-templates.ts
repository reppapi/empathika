// File: backend/src/utils/account-email-templates.ts
import { mailer } from "../lib/mailer"

export const accountMailService = {
  sendEmailChangeVerification: async (params: {
    toNewEmail: string
    nama: string
    verificationUrl: string
    expiresInMinutes: number
  }) => {
    return mailer.send({
      to: params.toNewEmail,
      subject: "Konfirmasi Perubahan Alamat Email - Empathika",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h2 style="color: #561269;">Konfirmasi Perubahan Email</h2>
          <p>Halo <strong>${params.nama}</strong>,</p>
          <p>Kami menerima permintaan untuk mengubah alamat email akun Psikolog Anda di Empathika ke alamat email ini.</p>
          <p>Silakan klik tautan verifikasi di bawah ini untuk mengonfirmasi perubahan email:</p>
          <p style="margin: 24px 0;">
            <a href="${params.verificationUrl}" style="background-color: #561269; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Konfirmasi Email Saya
            </a>
          </p>
          <p>Tautan ini berlaku selama <strong>${params.expiresInMinutes} menit</strong>. Jika Anda tidak pernah meminta perubahan ini, Anda dapat mengabaikan email ini dengan aman.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #888;">Empathika Layanan Psikologi</p>
        </div>
      `,
    })
  },

  sendEmailChangeAlertToOldEmail: async (params: {
    toOldEmail: string
    nama: string
    newEmailMasked: string
  }) => {
    return mailer.send({
      to: params.toOldEmail,
      subject: "[Peringatan Keamanan] Permintaan Perubahan Email Akun Empathika",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h2 style="color: #c53030;">Pemberitahuan Keamanan Akun</h2>
          <p>Halo <strong>${params.nama}</strong>,</p>
          <p>Kami mendeteksi adanya permintaan pergantian email akun Psikolog Empathika Anda ke alamat baru (<strong>${params.newEmailMasked}</strong>).</p>
          <p>Email verifikasi telah dikirimkan ke alamat email baru tersebut. Email Anda saat ini belum berubah sampai verifikasi berhasil diselesaikan.</p>
          <p><strong>Bukan Anda yang meminta ini?</strong> Harap segera hubungi Tim Admin Empathika atau login untuk segera mengganti kata sandi akun Anda.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #888;">Empathika Layanan Psikologi</p>
        </div>
      `,
    })
  },

  sendEmailChangedConfirmation: async (params: {
    toOldEmail: string
    nama: string
  }) => {
    return mailer.send({
      to: params.toOldEmail,
      subject: "Alamat Email Akun Empathika Berhasil Diperbarui",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h2 style="color: #561269;">Email Akun Telah Berubah</h2>
          <p>Halo <strong>${params.nama}</strong>,</p>
          <p>Pemberitahuan ini mengonfirmasi bahwa alamat email akun Empathika Anda telah resmi diperbarui. Anda tidak lagi dapat login menggunakan alamat email ini.</p>
          <p>Jika tindakan ini dilakukan tanpa izin Anda, segera hubungi dukungan Empathika.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #888;">Empathika Layanan Psikologi</p>
        </div>
      `,
    })
  },

  sendPasswordChangedNotification: async (params: {
    toEmail: string
    nama: string
  }) => {
    return mailer.send({
      to: params.toEmail,
      subject: "[Keamanan] Kata Sandi Akun Empathika Telah Diubah",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h2 style="color: #561269;">Perubahan Kata Sandi Berhasil</h2>
          <p>Halo <strong>${params.nama}</strong>,</p>
          <p>Kata sandi akun Empathika Anda baru saja berhasil diubah. Seluruh sesi aktif di perangkat lain telah dinonaktifkan demi keamanan.</p>
          <p>Jika Anda tidak merasa melakukan perubahan ini, segera hubungi Administrator Empathika untuk mengamankan akun Anda.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #888;">Empathika Layanan Psikologi</p>
        </div>
      `,
    })
  },
}
