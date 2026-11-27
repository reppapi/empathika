// =====================================================================
// transaksi.calc.ts
// Pure functions untuk perhitungan harga, biaya layanan, pembagian
// porsi, dan DP hangus.
// Semua nilai config diambil dari transaksi.config.ts — tidak ada
// angka literal di sini selain untuk logika (mis. 100 untuk persen).
// =====================================================================

import {
  PERSEN_PSIKOLOG,
  KOMISI_BIRO_PERSEN,
  KOMISI_BIRO_MODE,
  MIDTRANS_FEE,
  MIDTRANS_PAYOUT_FLAT,
} from '../../config/transaksi.config'

// ── Tipe dasar ────────────────────────────────────────────────────────
export type TipeSesi = 'OFFLINE' | 'ONLINE'

export interface HasilBiayaLayanan {
  biayaLayanan: number // Nominal biaya layanan (fee payment gateway, dibulatkan ke atas)
  total: number        // Total yang dibayar client (harga dasar + komisi biro + biaya layanan)
}

export interface HasilTransaksi {
  hargaDasar: number       // Harga sesi yang tercantum
  komisiBiro: number       // Komisi untuk biro (0 jika bukan dari web biro)
  subtotalKlien: number    // hargaDasar + komisiBiro (sebelum biaya layanan)
  biayaLayanan: number     // Fee payment gateway yang ditanggung client
  total: number            // Total akhir yang dibayar client
  porsiPsikolog: number    // Bagian psikolog dari harga dasar
  porsiEmpathika: number   // Bagian Empathika dari harga dasar (sisa setelah psikolog)
}

export interface HasilDPHangus {
  ditahan: number              // Nominal yang ditahan (min(DP_NOMINAL, jumlahDibayar))
  porsiPsikologDP: number      // Bagian psikolog dari nominal yang ditahan
  porsiEmpathikaDP: number     // Bagian Empathika dari nominal yang ditahan (sisa)
  dikembalikanKeClient: number // Sisa yang dikembalikan ke client
}

// ── Fungsi 1: Hitung biaya layanan (fee payment gateway) ──────────────
// Menerima subtotal klien (harga dasar + komisi biro) dan jumlah payout,
// mengembalikan { biayaLayanan, total }.
// Prinsip: fee persen dihitung dengan pembagian (1 - p/100) agar total
// sudah mencakup fee tanpa selisih. Semua nominal integer.
export function hitungBiayaLayanan(
  subtotalKlien: number,
  metodePembayaran: string,
  jumlahPayout: number
): HasilBiayaLayanan {
  const feeMap = MIDTRANS_FEE || {}
  const feeConfig = feeMap[metodePembayaran?.toUpperCase()] ?? feeMap['DEFAULT'] ?? { tipe: 'flat', nilai: 0 }
  const payoutFee = (MIDTRANS_PAYOUT_FLAT || 0) * jumlahPayout

  let total: number
  let biayaLayanan: number

  if (feeConfig.tipe === 'persen') {
    const p = feeConfig.nilai
    if (p <= 0) {
      // Tidak ada fee persen, hanya fee payout flat
      biayaLayanan = payoutFee
      total = subtotalKlien + biayaLayanan
    } else {
      // ceil((subtotal + payoutFee) / (1 - p/100))
      total = Math.ceil((subtotalKlien + payoutFee) / (1 - p / 100))
      biayaLayanan = total - subtotalKlien
    }
  } else {
    // Fee flat per metode
    biayaLayanan = feeConfig.nilai + payoutFee
    total = subtotalKlien + biayaLayanan
  }

  return { biayaLayanan, total }
}

// ── Fungsi 2: Hitung seluruh komponen transaksi ───────────────────────
// tipeSesi: 'OFFLINE' | 'ONLINE'
// metodePembayaran: key dari XENDIT_FEE (QRIS, E_WALLET, TRANSFER_BANK)
// dariBiro: true jika booking berasal dari web tenant biro
export function hitungTransaksi(
  hargaDasar: number,
  tipeSesi: TipeSesi,
  metodePembayaran: string,
  dariBiro: boolean
): HasilTransaksi {
  // Pembagian dari harga dasar (bukan dari total)
  const persenPsik = PERSEN_PSIKOLOG[tipeSesi]
  const porsiPsikolog = Math.floor(hargaDasar * persenPsik / 100)
  const porsiEmpathika = hargaDasar - porsiPsikolog // porsi terakhir = sisa (menghindari selisih)

  // Komisi biro (hanya jika dariBiro dan mode ditambah_ke_client)
  let komisiBiro = 0
  if (dariBiro) {
    if (KOMISI_BIRO_MODE === 'ditambah_ke_client') {
      komisiBiro = Math.floor(hargaDasar * KOMISI_BIRO_PERSEN / 100)
    }
    // Mode 'dipotong_empathika': komisiBiro tetap 0 di sini (tidak dibebankan ke client),
    // potongan dilakukan saat distribusi porsi Empathika
  }

  const subtotalKlien = hargaDasar + komisiBiro
  const jumlahPayout = dariBiro ? 2 : 1 // 1 payout ke psikolog, +1 ke biro jika ada

  const { biayaLayanan, total } = hitungBiayaLayanan(subtotalKlien, metodePembayaran, jumlahPayout)

  return {
    hargaDasar,
    komisiBiro,
    subtotalKlien,
    biayaLayanan,
    total,
    porsiPsikolog,
    porsiEmpathika,
  }
}

export interface HasilRefundBaru {
  totalDibayar: number
  persenRefund: number
  persenPotongan: number
  nominalRefund: number
  nominalPotongan: number
  porsiPsikologPotongan: number
  porsiEmpathikaPotongan: number
}

// ── Fungsi 3: Hitung refund sesuai aturan baru (100% atau Potongan 30%) ──
export function hitungRefundBaru(
  tipeSesi: TipeSesi,
  totalDibayar: number,
  persenRefund: number // 100 atau 70
): HasilRefundBaru {
  const persenPotongan = 100 - persenRefund
  const nominalRefund = Math.floor((totalDibayar * persenRefund) / 100)
  const nominalPotongan = totalDibayar - nominalRefund

  const persenPsik = PERSEN_PSIKOLOG[tipeSesi]
  const porsiPsikologPotongan = Math.floor((nominalPotongan * persenPsik) / 100)
  const porsiEmpathikaPotongan = nominalPotongan - porsiPsikologPotongan

  return {
    totalDibayar,
    persenRefund,
    persenPotongan,
    nominalRefund,
    nominalPotongan,
    porsiPsikologPotongan,
    porsiEmpathikaPotongan,
  }
}

// Kompatibilitas mundur
export function hitungPembagianDPHangus(
  tipeSesi: TipeSesi,
  jumlahDibayar: number
): HasilDPHangus {
  const ditahan = Math.min(0, jumlahDibayar)
  const persenPsik = PERSEN_PSIKOLOG[tipeSesi]
  const porsiPsikologDP = Math.floor(ditahan * persenPsik / 100)
  const porsiEmpathikaDP = ditahan - porsiPsikologDP
  const dikembalikanKeClient = jumlahDibayar - ditahan

  return {
    ditahan,
    porsiPsikologDP,
    porsiEmpathikaDP,
    dikembalikanKeClient,
  }
}
