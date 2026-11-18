// =====================================================================
// invoice.helper.ts
// Fungsi pembantu pembentuk teks pesan WhatsApp invoice dan normalisasi
// nomor WA. Fungsi ini dipakai oleh service (BE) dan dapat di-import
// dari FE jika dibutuhkan untuk pratinjau di sisi klien.
// =====================================================================

import { Decimal } from '@prisma/client/runtime/library'

export interface InvoiceData {
  nomor: string
  tanggal_terbit: Date
  tanggal_bayar?: Date | null
  nama_client: string
  judul_layanan: string
  nama_psikolog: string
  tanggal_sesi: Date
  jenis_sesi: string // "ONLINE" | "OFFLINE"
  harga: Decimal | number
  metode_bayar: string
  no_wa_client?: string | null
  // Rincian pembayaran
  harga_dasar?: Decimal | number | null
  biaya_layanan?: Decimal | number | null
  komisi_biro?: Decimal | number | null
  nominal_ditahan?: Decimal | number | null
  nominal_dikembalikan?: Decimal | number | null
  // Bidang tambahan spesifik tipe transaksi (Psikotes, Konseling, Event)
  tipe_transaksi?: 'PSIKOTES' | 'KONSULTASI' | 'EVENT' | string
  kode_akses?: string | null
  id_paket?: string | null
  nama_peserta?: string | null
  masa_berlaku_hari?: number
}

// ── Format Rupiah (tanpa desimal, pemisah ribuan) ──────────────────────
export function formatRupiahInvoice(amount: Decimal | number): string {
  const num = typeof amount === 'number' ? amount : Number(amount)
  return 'Rp' + num.toLocaleString('id-ID')
}

// ── Format Tanggal Indonesia  e.g. "24 Oktober 2026" ──────────────────
export function formatTanggalIndonesia(date: Date): string {
  const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  // Konversi ke WIB (UTC+7)
  const wib = toWIB(date)
  return `${wib.day} ${MONTHS[wib.month]} ${wib.year}`
}

// ── Format Tanggal + Jam WIB  e.g. "24 Oktober 2026, 09:00 WIB" ───────
export function formatTanggalJamWIB(date: Date): string {
  const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  const wib = toWIB(date)
  const jam = pad2(wib.hours) + ':' + pad2(wib.minutes)
  return `${wib.day} ${MONTHS[wib.month]} ${wib.year}, ${jam} WIB`
}

// ── Format label metode pembayaran ────────────────────────────────────
export function formatMetodeBayar(metode: string): string {
  const map: Record<string, string> = {
    TRANSFER_BANK: 'Transfer Bank',
    E_WALLET: 'E-Wallet',
    QRIS: 'QRIS',
  }
  return map[metode] ?? metode
}

// ── Format label jenis sesi ───────────────────────────────────────────
function formatJenisSesi(jenis: string): string {
  const j = jenis.toUpperCase()
  if (j === 'ONLINE') return 'Online'
  if (j === 'OFFLINE') return 'Offline'
  return jenis
}

// ── Pembentuk teks pesan WhatsApp invoice ─────────────────────────────
// Dipakai oleh endpoint BE dan oleh komponen pratinjau di FE.
// Menghasilkan string siap kirim dengan format WhatsApp (*bold*, baris baru).
export function buildInvoiceWhatsAppText(data: InvoiceData): string {
  const tanggalTerbit = formatTanggalIndonesia(data.tanggal_terbit)
  const tanggalBayar = data.tanggal_bayar
    ? formatTanggalIndonesia(data.tanggal_bayar)
    : '-'
  const totalBayar = formatRupiahInvoice(data.harga)
  const metodeBayar = formatMetodeBayar(data.metode_bayar)

  // ── 1. KHUSUS TRANSAKSI PSIKOTES ─────────────────────────────────────
  if (data.tipe_transaksi === 'PSIKOTES') {
    const kodeTiket = data.kode_akses || data.nomor
    const linkTes = data.id_paket
      ? `https://empathika.id/psikotes/${data.id_paket}`
      : `https://empathika.id/psikotes`

    const lines = [
      `*BUKTI PEMBAYARAN & INVOICE PSIKOTES EMPATHIKA*`,
      ``,
      `No. Invoice   : ${data.nomor}`,
      `Tanggal Terbit: ${tanggalTerbit}`,
      `Tanggal Bayar : ${tanggalBayar}`,
      `---`,
      ``,
      `*Data Pembeli*`,
      `Nama : ${data.nama_client}`,
      ...(data.no_wa_client ? [`WhatsApp : ${data.no_wa_client}`] : []),
      ...(data.nama_peserta && data.nama_peserta !== data.nama_client ? [`Nama Peserta Tes : ${data.nama_peserta}`] : []),
      ``,
      `*Rincian Paket Asesmen*`,
      `Paket Psikotes : ${data.judul_layanan}`,
      `Akses Pengerjaan: 1x Asesmen Mandiri (Online)`,
      `Kode Tiket Akses: *${kodeTiket}*`,
      `Masa Berlaku   : Tanpa Batas Waktu (Dapat dikerjakan kapan saja)`,
      ``,
      `---`,
      ``,
      `*Total Bayar : ${totalBayar}*`,
      `Metode Bayar : ${metodeBayar}`,
      `Status       : Lunas`,
      ``,
      `---`,
      ``,
      `*Petunjuk Memulai Tes:*`,
      `1. Buka tautan paket: ${linkTes}`,
      `2. Klik *"Sudah bayar? Masukkan kode akses di sini"*`,
      `3. Masukkan Kode Tiket: *${kodeTiket}* dan nomor WhatsApp yang terdaftar`,
      `4. Selesaikan pengerjaan tes, laporan hasil & dokumen PDF resmi langsung dapat diunduh`,
      ``,
      `---`,
      ``,
      `*Ketentuan Layanan:*`,
      `• Tiket pengerjaan & akses hasil tes aktif tanpa batas waktu.`,
      `• Pembelian paket digital psikotes online bersifat final dan tidak dapat dibatalkan atau di-refund.`,
      ``,
      `---`,
      ``,
      `Empathika Layanan Psikologi`,
      `Jl. Cikutra No.312, Neglasari, Kec. Cibeunying Kaler`,
      `Kota Bandung, Jawa Barat 41024`,
      `Kontak: 0878-7878-5498`,
      ``,
      `_Dokumen ini diterbitkan otomatis oleh sistem Empathika._`,
    ]

    return lines.join('\n')
  }

  // ── 2. KHUSUS TRANSAKSI EVENT / WORKSHOP / WEBINAR ──────────────────
  if (data.tipe_transaksi === 'EVENT') {
    const jadwal = formatTanggalJamWIB(data.tanggal_sesi)
    const lines = [
      `*BUKTI PEMBAYARAN & TIKET EVENT EMPATHIKA*`,
      ``,
      `No. Invoice   : ${data.nomor}`,
      `Tanggal Terbit: ${tanggalTerbit}`,
      `Tanggal Bayar : ${tanggalBayar}`,
      `---`,
      ``,
      `*Data Peserta*`,
      `Nama     : ${data.nama_client}`,
      ...(data.no_wa_client ? [`WhatsApp : ${data.no_wa_client}`] : []),
      ``,
      `*Rincian Event*`,
      `Event    : ${data.judul_layanan}`,
      `Pemateri : ${data.nama_psikolog}`,
      `Jadwal   : ${jadwal}`,
      ``,
      `---`,
      ``,
      `*Total Bayar : ${totalBayar}*`,
      `Metode Bayar : ${metodeBayar}`,
      `Status       : Lunas (Tiket Terkonfirmasi)`,
      ``,
      `---`,
      ``,
      `*Ketentuan Event:*`,
      `• Tiket pendaftaran event/workshop/webinar ini berlaku sah untuk peserta terdaftar.`,
      `• Pendaftaran bersifat final dan tidak dapat dibatalkan ataupun di-refund.`,
      `• Tautan/link pertemuan daring maupun panduan kehadiran akan dikirimkan kembali oleh admin pada hari pelaksanaan (Hari-H).`,
      ``,
      `---`,
      ``,
      `Empathika Layanan Psikologi`,
      `Jl. Cikutra No.312, Neglasari, Kec. Cibeunying Kaler`,
      `Kota Bandung, Jawa Barat 41024`,
      `Kontak: 0878-7878-5498`,
      ``,
      `_Dokumen ini diterbitkan otomatis oleh sistem Empathika._`,
    ]

    return lines.join('\n')
  }

  // ── 3. KHUSUS SESI KONSELING & ASESMEN OFFLINE ────────────────────────
  const jadwal = formatTanggalJamWIB(data.tanggal_sesi)
  const jenisSesi = formatJenisSesi(data.jenis_sesi)

  const rincianBiayaLines = []
  if (data.harga_dasar) {
    rincianBiayaLines.push(`Harga Sesi    : ${formatRupiahInvoice(data.harga_dasar)}`)
    if (data.komisi_biro && Number(data.komisi_biro) > 0) {
      rincianBiayaLines.push(`Biaya Biro    : ${formatRupiahInvoice(data.komisi_biro)}`)
    }
    if (data.biaya_layanan && Number(data.biaya_layanan) > 0) {
      rincianBiayaLines.push(`Biaya Layanan : ${formatRupiahInvoice(data.biaya_layanan)}`)
    }
  }

  const lines = [
    `*INVOICE EMPATHIKA LAYANAN PSIKOLOGI*`,
    ``,
    `No. Invoice   : ${data.nomor}`,
    `Tanggal Terbit: ${tanggalTerbit}`,
    `Tanggal Bayar : ${tanggalBayar}`,
    `---`,
    ``,
    `*Data Klien*`,
    `Nama : ${data.nama_client}`,
    ``,
    `*Rincian Layanan*`,
    `Layanan  : ${data.judul_layanan}`,
    `Psikolog : ${data.nama_psikolog}`,
    `Jadwal   : ${jadwal} (${jenisSesi})`,
    ``,
    `---`,
    ``,
    `*Rincian Pembayaran*`,
    ...(rincianBiayaLines.length > 0 ? rincianBiayaLines : []),
    `*Total Bayar : ${totalBayar}*`,
    `Metode Bayar : ${metodeBayar}`,
    `Status       : Lunas`,
    ``,
    `---`,
    ``,
    `*Syarat dan Ketentuan Konseling EMPATHIKA*`,
    ``,
    `1. Biaya reservasi sebesar Rp 150.000 digunakan untuk mengamankan jadwal konseling Anda dan mendukung kebutuhan operasional layanan. Biaya ini sudah termasuk dalam total pembayaran Anda.`,
    ``,
    `2. Mohon hadir tepat waktu agar sesi berjalan optimal. Jika Anda terlambat, sesi tetap berakhir sesuai jadwal yang telah ditentukan agar tidak mengganggu jadwal klien berikutnya.`,
    ``,
    `3. Jika Anda berhalangan hadir, mohon beri tahu kami sebelumnya. Apabila klien tidak hadir tanpa pemberitahuan, biaya reservasi sebesar Rp 150.000 tidak dapat dikembalikan karena jadwal tersebut sudah dicadangkan untuk Anda.`,
    ``,
    `4. Jadwal sesi dapat diubah (reschedule) paling lambat 3 jam sebelum sesi dimulai, dengan maksimal dua kali perubahan.`,
    ``,
    `5. Perubahan jadwal yang mendadak dapat memengaruhi ketersediaan psikolog. Karena itu, jadwal pengganti bisa lebih lama dari yang direncanakan atau ditangani oleh psikolog yang berbeda, sesuai kesepakatan bersama.`,
    ``,
    `6. Jika Anda mengajukan pengembalian dana (refund), biaya reservasi sebesar Rp 150.000 tidak termasuk dalam pengembalian. Sisa pembayaran akan dikembalikan kepada Anda sepenuhnya.`,
    ``,
    `---`,
    ``,
    `Empathika Layanan Psikologi`,
    `Jl. Cikutra No.312, Neglasari, Kec. Cibeunying Kaler`,
    `Kota Bandung, Jawa Barat 41024`,
    `Kontak: 0878-7878-5498`,
    ``,
    `_Dokumen ini diterbitkan otomatis oleh sistem Empathika._`,
  ]

  return lines.join('\n')
}

// ── Bangun URL wa.me dengan teks ter-URL-encode ───────────────────────
export function buildWhatsAppUrl(noWa: string, text: string): string {
  const normalizedNo = normalizeWhatsAppNumber(noWa)
  const encodedText = encodeURIComponent(text)
  return `https://wa.me/${normalizedNo}?text=${encodedText}`
}

// ── Normalisasi nomor WhatsApp ke format internasional (tanpa +) ──────
// Contoh: "0878-7878-5498" → "6287878785498"
//         "+62878..." → "62878..."
//         "62878..." → "62878..." (sudah benar)
export function normalizeWhatsAppNumber(raw: string): string {
  // Hapus semua karakter selain angka
  let num = raw.replace(/\D/g, '')

  if (num.startsWith('0')) {
    // 0878... → 6287...
    num = '62' + num.slice(1)
  } else if (!num.startsWith('62')) {
    // Angka tanpa kode negara – asumsikan Indonesia
    num = '62' + num
  }
  return num
}

// ── Validasi nomor WhatsApp ───────────────────────────────────────────
export function validateWhatsAppNumber(raw?: string | null): { valid: boolean; normalized?: string; error?: string } {
  if (!raw || raw.trim() === '') {
    return { valid: false, error: 'Nomor WhatsApp klien tidak tersedia. Pastikan data klien sudah lengkap.' }
  }
  const normalized = normalizeWhatsAppNumber(raw)
  if (normalized.length < 10 || normalized.length > 15) {
    return { valid: false, error: `Nomor WhatsApp tidak valid: "${raw}". Panjang nomor harus 10–15 digit.` }
  }
  return { valid: true, normalized }
}

// ── Utilitas internal ─────────────────────────────────────────────────
function pad2(n: number) {
  return String(n).padStart(2, '0')
}

interface WIBDate {
  day: number
  month: number // 0-indexed
  year: number
  hours: number
  minutes: number
}

// Konversi Date (UTC) ke komponen waktu WIB (UTC+7)
function toWIB(date: Date): WIBDate {
  // getTimezoneOffset bisa tidak reliable di Node; gunakan offset manual
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000
  const wibDate = new Date(date.getTime() + WIB_OFFSET_MS)
  return {
    day: wibDate.getUTCDate(),
    month: wibDate.getUTCMonth(),
    year: wibDate.getUTCFullYear(),
    hours: wibDate.getUTCHours(),
    minutes: wibDate.getUTCMinutes(),
  }
}
