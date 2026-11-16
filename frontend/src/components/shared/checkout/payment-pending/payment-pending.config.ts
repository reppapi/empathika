export type PaymentPendingType = "konseling" | "event" | "psikotes"

export interface PendingConfig {
  tanggalLabel: string
  waktuLabel: string
  totalLabel: string
  showStepper: boolean
  successHref: string
  checkoutHref: string
  warningText: string
  waitingSubtext: string
  checkingSubtext: string
  defaultJudul: string
  defaultSubjudul: string
  defaultHarga: string
  defaultTanggal: string
  defaultWaktu: string
}

export const CONFIGS: Record<PaymentPendingType, PendingConfig> = {
  konseling: {
    tanggalLabel: "TANGGAL KONSULTASI",
    waktuLabel: "WAKTU KONSULTASI",
    totalLabel: "TOTAL BIAYA",
    showStepper: true,
    successHref: "/konseling/success",
    checkoutHref: "/konseling/bayar",
    warningText:
      "Jangan tutup halaman ini. Setelah proses transfer dilakukan, sistem akan mengkonfirmasi status jadwal konsultasi Anda.",
    waitingSubtext: "Silakan selesaikan pembayaran sesi konsultasi",
    checkingSubtext: "Sistem sedang memverifikasi pembayaran Anda. Mohon tunggu beberapa saat.",
    defaultJudul: "Layanan Konsultasi",
    defaultSubjudul: "Psikolog Profesional Empathika",
    defaultHarga: "Rp 150.000",
    defaultTanggal: "31/08",
    defaultWaktu: "13:30",
  },
  event: {
    tanggalLabel: "TANGGAL ACARA",
    waktuLabel: "WAKTU ACARA",
    totalLabel: "TOTAL TAGIHAN",
    showStepper: false,
    successHref: "/event/success",
    checkoutHref: "/event/checkout",
    warningText:
      "Jangan tutup halaman ini. Setelah proses transfer dilakukan, sistem akan mengkonfirmasi status tiket Anda.",
    waitingSubtext: "Silakan selesaikan pembayaran sebelum waktu habis",
    checkingSubtext: "Sistem sedang memverifikasi dana transfer Anda. Mohon tunggu beberapa saat.",
    defaultJudul: "Workshop SEFT",
    defaultSubjudul: "Spiritual Emotional Freedom Technique",
    defaultHarga: "Rp 200.000",
    defaultTanggal: "05/09",
    defaultWaktu: "09:00",
  },
  psikotes: {
    tanggalLabel: "TANGGAL TRANSAKSI",
    waktuLabel: "WAKTU TRANSAKSI",
    totalLabel: "TOTAL TAGIHAN",
    showStepper: false,
    successHref: "/psikotes/success",
    checkoutHref: "/psikotes/checkout",
    warningText:
      "Jangan tutup halaman ini. Setelah proses transfer dilakukan, sistem akan mengkonfirmasi status transaksi Anda.",
    waitingSubtext: "Silakan selesaikan pembayaran sebelum waktu habis",
    checkingSubtext: "Sistem sedang memverifikasi transaksi Anda. Mohon tunggu beberapa saat.",
    defaultJudul: "Paket Psikotes",
    defaultSubjudul: "",
    defaultHarga: "Rp 50.000",
    defaultTanggal: "05/09",
    defaultWaktu: "09:00",
  },
}
