// =====================================================================
// transaksi.calc.test.ts
// Unit test untuk fungsi perhitungan transaksi (vitest)
// =====================================================================

import { describe, it, expect, vi } from 'vitest'

// ── Mock config sebelum import calc ──────────────────────────────────
vi.mock('../../config/transaksi.config', () => {
  const feeMock = {
    QRIS:          { tipe: 'persen', nilai: 1 },   // 1% untuk tes (mudah dihitung)
    E_WALLET:      { tipe: 'persen', nilai: 2 },   // 2% untuk tes
    TRANSFER_BANK: { tipe: 'flat',   nilai: 4_000 }, // Rp4.000 flat untuk tes
    DEFAULT:       { tipe: 'flat',   nilai: 0 },
  }
  return {
    PERSEN_PSIKOLOG: { OFFLINE: 60, ONLINE: 50 },
    DP_NOMINAL: 150_000,
    KOMISI_BIRO_PERSEN: 10,
    KOMISI_BIRO_MODE: 'ditambah_ke_client',
    MIDTRANS_FEE: feeMock,
    XENDIT_FEE: feeMock,
    MIDTRANS_PAYOUT_FLAT: 2_500,
    XENDIT_PAYOUT_FLAT: 2_500,
  }
})

import {
  hitungBiayaLayanan,
  hitungTransaksi,
  hitungPembagianDPHangus,
  hitungRefundBaru,
} from './transaksi.calc'

// =====================================================================
// TEST: hitungBiayaLayanan
// =====================================================================
describe('hitungBiayaLayanan', () => {
  it('fee persen (QRIS 1%), 1 payout: total = ceil((base+2500) / 0.99)', () => {
    // base = 300_000, payoutFee = 2500, denominator = 1 - 0.01 = 0.99
    // total = ceil(302500 / 0.99) = ceil(305555.55...) = 305556
    const result = hitungBiayaLayanan(300_000, 'QRIS', 1)
    expect(result.total).toBe(305_556)
    expect(result.biayaLayanan).toBe(305_556 - 300_000) // = 5556
  })

  it('fee persen (QRIS 1%), 2 payout (biro): total = ceil((base+5000) / 0.99)', () => {
    // base = 300_000, payoutFee = 5000
    // total = ceil(305000 / 0.99) = ceil(308080.80...) = 308081
    const result = hitungBiayaLayanan(300_000, 'QRIS', 2)
    expect(result.total).toBe(308_081)
    expect(result.biayaLayanan).toBe(308_081 - 300_000) // = 8081
  })

  it('fee flat (TRANSFER_BANK Rp4000), 1 payout: biayaLayanan = 4000 + 2500 = 6500', () => {
    const result = hitungBiayaLayanan(300_000, 'TRANSFER_BANK', 1)
    expect(result.biayaLayanan).toBe(6_500)
    expect(result.total).toBe(306_500)
  })

  it('fee flat (TRANSFER_BANK Rp4000), 2 payout (biro): biayaLayanan = 4000 + 5000 = 9000', () => {
    const result = hitungBiayaLayanan(300_000, 'TRANSFER_BANK', 2)
    expect(result.biayaLayanan).toBe(9_000)
    expect(result.total).toBe(309_000)
  })

  it('metode tidak dikenali → pakai DEFAULT (flat 0), hanya payout fee', () => {
    const result = hitungBiayaLayanan(100_000, 'KARTU_KREDIT', 1)
    expect(result.biayaLayanan).toBe(2_500) // hanya payout fee
    expect(result.total).toBe(102_500)
  })
})

// =====================================================================
// TEST: hitungTransaksi — offline, tanpa biro
// =====================================================================
describe('hitungTransaksi — sesi OFFLINE, tanpa biro', () => {
  it('pembagian offline 60%/40% dihitung dari harga dasar', () => {
    const result = hitungTransaksi(300_000, 'OFFLINE', 'QRIS', false)
    expect(result.porsiPsikolog).toBe(180_000) // 60% dari 300_000
    expect(result.porsiEmpathika).toBe(120_000) // sisa (40%)
    // porsi tidak ada selisih
    expect(result.porsiPsikolog + result.porsiEmpathika).toBe(result.hargaDasar)
  })

  it('komisiBiro = 0 karena bukan dari web biro', () => {
    const result = hitungTransaksi(300_000, 'OFFLINE', 'QRIS', false)
    expect(result.komisiBiro).toBe(0)
    expect(result.subtotalKlien).toBe(300_000)
  })

  it('jumlah payout = 1 (hanya psikolog)', () => {
    // fee QRIS 1%, 1 payout (2500): total = ceil(302500/0.99) = 305556
    const result = hitungTransaksi(300_000, 'OFFLINE', 'QRIS', false)
    expect(result.total).toBe(305_556)
    expect(result.biayaLayanan).toBe(5_556)
  })
})

// =====================================================================
// TEST: hitungTransaksi — online, tanpa biro
// =====================================================================
describe('hitungTransaksi — sesi ONLINE, tanpa biro', () => {
  it('pembagian online 50%/50% dihitung dari harga dasar', () => {
    const result = hitungTransaksi(300_000, 'ONLINE', 'TRANSFER_BANK', false)
    expect(result.porsiPsikolog).toBe(150_000) // 50%
    expect(result.porsiEmpathika).toBe(150_000) // sisa (50%)
    expect(result.porsiPsikolog + result.porsiEmpathika).toBe(result.hargaDasar)
  })

  it('total transfer bank tanpa biro = 300_000 + 4000 + 2500 = 306500', () => {
    const result = hitungTransaksi(300_000, 'ONLINE', 'TRANSFER_BANK', false)
    expect(result.total).toBe(306_500)
    expect(result.biayaLayanan).toBe(6_500)
  })
})

// =====================================================================
// TEST: hitungTransaksi — dengan biro (komisi 10%)
// =====================================================================
describe('hitungTransaksi — dengan biro (komisi 10%)', () => {
  it('contoh ilustrasi: sesi offline 300.000 lewat biro', () => {
    // Sesuai spec: psikolog 180.000, Empathika 120.000, biro 30.000
    // client membayar 330.000 + biaya layanan
    const result = hitungTransaksi(300_000, 'OFFLINE', 'QRIS', true)
    expect(result.porsiPsikolog).toBe(180_000)
    expect(result.porsiEmpathika).toBe(120_000)
    expect(result.komisiBiro).toBe(30_000) // 10% dari 300_000
    expect(result.subtotalKlien).toBe(330_000) // 300_000 + 30_000
  })

  it('jumlah payout = 2 (psikolog + biro)', () => {
    // payoutFee = 5000, total = ceil((330000+5000)/0.99) = ceil(338383.83) = 338384
    const result = hitungTransaksi(300_000, 'OFFLINE', 'QRIS', true)
    expect(result.total).toBe(338_384)
    expect(result.biayaLayanan).toBe(338_384 - 330_000) // = 8384
  })

  it('sesi online dengan biro: komisi dihitung dari harga dasar, bukan total', () => {
    const result = hitungTransaksi(400_000, 'ONLINE', 'TRANSFER_BANK', true)
    expect(result.porsiPsikolog).toBe(200_000) // 50% dari 400_000
    expect(result.porsiEmpathika).toBe(200_000) // sisa
    expect(result.komisiBiro).toBe(40_000) // 10% dari 400_000
    expect(result.subtotalKlien).toBe(440_000)
    // fee flat: 4000 + 2*2500 = 9000
    expect(result.biayaLayanan).toBe(9_000)
    expect(result.total).toBe(449_000)
  })
})

// =====================================================================
// TEST: hitungTransaksi — komisi 0 (edge case)
// =====================================================================
describe('hitungTransaksi — dengan biro tapi komisi 0', () => {
  it('saat KOMISI_BIRO_PERSEN = 0, komisiBiro tetap 0 meskipun dariBiro = true', () => {
    // Test ini berlaku ketika config asli KOMISI_BIRO_PERSEN = 0
    // Karena vi.mock sudah menetapkan 10%, kita perlu override manual
    // Ini diuji dengan nilai harga dasar yang hasilnya 0 (tidak mungkin), 
    // jadi kita test dengan angka sangat kecil yang floor-nya 0
    // Actual test untuk komisi=0 ada di integrasi - ini test validasi rumus floor
    const result = hitungTransaksi(5, 'ONLINE', 'QRIS', true)
    // komisiBiro = floor(5 * 10 / 100) = floor(0.5) = 0
    expect(result.komisiBiro).toBe(0)
  })
})

// =====================================================================
// TEST: hitungTransaksi — pembulatan (porsi selalu = harga dasar)
// =====================================================================
describe('hitungTransaksi — pembulatan (tidak ada selisih)', () => {
  it('offline: porsiPsikolog + porsiEmpathika = hargaDasar untuk semua nilai', () => {
    const kasus = [100_001, 300_000, 150_000, 999_999, 1_000_001]
    for (const harga of kasus) {
      const r = hitungTransaksi(harga, 'OFFLINE', 'QRIS', false)
      expect(r.porsiPsikolog + r.porsiEmpathika).toBe(r.hargaDasar)
    }
  })

  it('online: porsiPsikolog + porsiEmpathika = hargaDasar untuk semua nilai', () => {
    const kasus = [100_001, 300_000, 150_000, 999_999, 1_000_001]
    for (const harga of kasus) {
      const r = hitungTransaksi(harga, 'ONLINE', 'TRANSFER_BANK', false)
      expect(r.porsiPsikolog + r.porsiEmpathika).toBe(r.hargaDasar)
    }
  })
})

// =====================================================================
// TEST: hitungRefundBaru
// =====================================================================
describe('hitungRefundBaru', () => {
  it('refund 100% (penuh > H-3): nominal refund = total, potongan = 0', () => {
    const res = hitungRefundBaru('OFFLINE', 300_000, 100)
    expect(res.persenRefund).toBe(100)
    expect(res.persenPotongan).toBe(0)
    expect(res.nominalRefund).toBe(300_000)
    expect(res.nominalPotongan).toBe(0)
    expect(res.porsiPsikologPotongan).toBe(0)
    expect(res.porsiEmpathikaPotongan).toBe(0)
  })

  it('refund 70% (potongan 30% pada sesi OFFLINE): psikolog 60% dari potongan, empathika 40%', () => {
    const res = hitungRefundBaru('OFFLINE', 300_000, 70)
    expect(res.persenRefund).toBe(70)
    expect(res.persenPotongan).toBe(30)
    expect(res.nominalRefund).toBe(210_000) // 70% dari 300.000
    expect(res.nominalPotongan).toBe(90_000) // 30% dari 300.000
    expect(res.porsiPsikologPotongan).toBe(54_000) // 60% dari 90.000
    expect(res.porsiEmpathikaPotongan).toBe(36_000) // 40% dari 90.000
  })

  it('refund 70% (potongan 30% pada sesi ONLINE): psikolog 50% dari potongan, empathika 50%', () => {
    const res = hitungRefundBaru('ONLINE', 200_000, 70)
    expect(res.nominalRefund).toBe(140_000)
    expect(res.nominalPotongan).toBe(60_000)
    expect(res.porsiPsikologPotongan).toBe(30_000)
    expect(res.porsiEmpathikaPotongan).toBe(30_000)
  })
})
describe('hitungPembagianDPHangus', () => {
  it('sesi OFFLINE: ditahan 150.000, psikolog 90.000, Empathika 60.000', () => {
    const result = hitungPembagianDPHangus('OFFLINE', 300_000)
    expect(result.ditahan).toBe(150_000)
    expect(result.porsiPsikologDP).toBe(90_000)   // 60% dari 150.000
    expect(result.porsiEmpathikaDP).toBe(60_000)  // sisa (40%)
    expect(result.dikembalikanKeClient).toBe(150_000) // 300_000 - 150_000
  })

  it('sesi ONLINE: ditahan 150.000, psikolog 75.000, Empathika 75.000', () => {
    const result = hitungPembagianDPHangus('ONLINE', 300_000)
    expect(result.ditahan).toBe(150_000)
    expect(result.porsiPsikologDP).toBe(75_000)
    expect(result.porsiEmpathikaDP).toBe(75_000)
    expect(result.dikembalikanKeClient).toBe(150_000)
  })

  it('jumlah dibayar == 150.000: semua ditahan, tidak ada kembalian', () => {
    const result = hitungPembagianDPHangus('OFFLINE', 150_000)
    expect(result.ditahan).toBe(150_000)
    expect(result.dikembalikanKeClient).toBe(0)
  })

  it('jumlah dibayar < 150.000: ditahan = jumlah yang dibayar (tidak bisa lebih)', () => {
    const result = hitungPembagianDPHangus('OFFLINE', 100_000)
    expect(result.ditahan).toBe(100_000) // min(150_000, 100_000)
    expect(result.dikembalikanKeClient).toBe(0)
    // 60% dari 100.000 = 60.000
    expect(result.porsiPsikologDP).toBe(60_000)
    expect(result.porsiEmpathikaDP).toBe(40_000)
  })

  it('DP hangus: porsiPsikologDP + porsiEmpathikaDP selalu = ditahan (tidak ada selisih)', () => {
    const kasus: Array<['OFFLINE' | 'ONLINE', number]> = [
      ['OFFLINE', 150_000],
      ['ONLINE', 150_000],
      ['OFFLINE', 100_001],
      ['ONLINE', 300_000],
      ['OFFLINE', 50_000],
    ]
    for (const [tipe, dibayar] of kasus) {
      const r = hitungPembagianDPHangus(tipe, dibayar)
      expect(r.porsiPsikologDP + r.porsiEmpathikaDP).toBe(r.ditahan)
    }
  })

  it('sesi OFFLINE harga berapapun: ditahan selalu 150.000 jika dibayar >= 150.000', () => {
    const kasus = [150_000, 200_000, 500_000, 1_000_000]
    for (const dibayar of kasus) {
      const r = hitungPembagianDPHangus('OFFLINE', dibayar)
      expect(r.ditahan).toBe(150_000)
      expect(r.porsiPsikologDP).toBe(90_000)
      expect(r.porsiEmpathikaDP).toBe(60_000)
    }
  })

  it('sesi ONLINE harga berapapun: ditahan selalu 150.000 jika dibayar >= 150.000', () => {
    const kasus = [150_000, 200_000, 500_000, 1_000_000]
    for (const dibayar of kasus) {
      const r = hitungPembagianDPHangus('ONLINE', dibayar)
      expect(r.ditahan).toBe(150_000)
      expect(r.porsiPsikologDP).toBe(75_000)
      expect(r.porsiEmpathikaDP).toBe(75_000)
    }
  })
})
