// =====================================================================
// transaksi.config.ts
// Konfigurasi terpusat untuk sistem transaksi & pembayaran Empathika.
// Semua angka dan aturan bisnis yang bisa berubah disimpan di sini.
// =====================================================================

// ── Pembagian porsi sesi (dari harga dasar, bukan dari total klien bayar) ──
// Offline: psikolog 60%, Empathika 40%
// Online : psikolog 50%, Empathika 50%
export const PERSEN_PSIKOLOG: Record<'OFFLINE' | 'ONLINE', number> = {
  OFFLINE: 60,
  ONLINE: 50,
}

// ── DP / Nominal yang ditahan saat pembatalan/klien tidak hadir ──
// Nominal tetap Rp150.000, berlaku berapa pun harga sesi.
export const DP_NOMINAL = 150_000

// ── Komisi Biro ──
// TODO: Isi setelah ada keputusan bisnis. Saat ini 0 (tidak ada komisi).
// Persen komisi dihitung dari harga dasar sesi.
export const KOMISI_BIRO_PERSEN = 0 // TODO: tentukan persentase komisi biro

// Mode komisi biro:
//   'ditambah_ke_client'  → komisi dibebankan ke client di atas harga sesi (default saat ini)
//   'dipotong_empathika'  → komisi dipotong dari porsi Empathika (psikolog tidak berkurang)
// TODO: Konfirmasi ke pemilik bisnis mode mana yang berlaku.
export const KOMISI_BIRO_MODE: 'ditambah_ke_client' | 'dipotong_empathika' = 'ditambah_ke_client'

// ── Fee Xendit (placeholder, isi dari dashboard/dokumentasi Xendit) ──
// TODO: Isi tarif aktual dari dashboard Xendit. Semua nilai 0 adalah placeholder.
// Semua nominal dalam rupiah (integer).
// Perlu dikonfirmasi apakah sudah termasuk PPN.
export const XENDIT_FEE: Record<string, { tipe: 'persen' | 'flat'; nilai: number }> = {
  QRIS:          { tipe: 'persen', nilai: 0 }, // TODO: isi % fee QRIS Xendit (mis. 0.7%)
  E_WALLET:      { tipe: 'persen', nilai: 0 }, // TODO: isi % fee e-wallet Xendit (mis. 1.5%)
  TRANSFER_BANK: { tipe: 'flat',   nilai: 0 }, // TODO: isi nominal fee VA Xendit (mis. 4000)
  DEFAULT:       { tipe: 'flat',   nilai: 0 }, // Fallback jika metode tidak dikenali
}

// Fee payout keluar per transfer (nominal tetap, beda dari fee masuk)
// TODO: Isi tarif aktual payout Xendit per transfer.
export const XENDIT_PAYOUT_FLAT = 0 // TODO: isi nominal fee payout Xendit (mis. 25000)

// ── Perlakuan saat DP hangus / refund ──
// TODO: Konfirmasi ke pemilik bisnis:
//   - apakah biaya layanan dikembalikan ke client saat refund?
//   - apakah komisi biro tetap dibayarkan jika DP hangus?
// Default sementara berdasarkan keputusan awal:
export const DP_HANGUS_CONFIG = {
  // Biaya layanan (fee Xendit) TIDAK dikembalikan karena sudah terpotong oleh Xendit
  kembalikanBiayaLayanan: false, // TODO: konfirmasi
  // Komisi biro TIDAK dibayarkan jika transaksi berakhir DP hangus
  bayarKomisiBiroPadaDPHangus: false, // TODO: konfirmasi
} as const
