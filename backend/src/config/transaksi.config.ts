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


// ── Komisi Biro ──
// TODO: Isi setelah ada keputusan bisnis. Saat ini 0 (tidak ada komisi).
// Persen komisi dihitung dari harga dasar sesi.
export const KOMISI_BIRO_PERSEN = 0 // TODO: tentukan persentase komisi biro

// Mode komisi biro:
//   'ditambah_ke_client'  → komisi dibebankan ke client di atas harga sesi (default saat ini)
//   'dipotong_empathika'  → komisi dipotong dari porsi Empathika (psikolog tidak berkurang)
// TODO: Konfirmasi ke pemilik bisnis mode mana yang berlaku.
export const KOMISI_BIRO_MODE: 'ditambah_ke_client' | 'dipotong_empathika' = 'ditambah_ke_client'

// ── Fee Midtrans ──
// Sesuai model bisnis: Biaya layanan sudah include / ditanggung dalam harga sesi,
// sehingga tidak ada biaya tambahan ke klien (nilai = 0).
export const MIDTRANS_FEE: Record<string, { tipe: 'persen' | 'flat'; nilai: number }> = {
  QRIS:          { tipe: 'persen', nilai: 0 },
  E_WALLET:      { tipe: 'persen', nilai: 0 },
  TRANSFER_BANK: { tipe: 'flat',   nilai: 0 },
  DEFAULT:       { tipe: 'flat',   nilai: 0 }, // Fallback jika metode tidak dikenali
}

// Fee payout keluar per transfer (nominal tetap)
export const MIDTRANS_PAYOUT_FLAT = 0


// ── Perlakuan saat DP hangus / refund ──
export const DP_HANGUS_CONFIG = {
  // Biaya layanan (fee payment gateway) TIDAK dikembalikan karena sudah terpotong oleh gateway
  kembalikanBiayaLayanan: false,
  // Komisi biro TIDAK dibayarkan jika transaksi berakhir DP hangus
  bayarKomisiBiroPadaDPHangus: false,
} as const
