// =====================================================================
// invoice.repository.ts
// Akses database untuk model Invoice.
// Menggunakan Prisma transaction untuk memastikan atomicity saat
// generate nomor invoice baru (mencegah duplicate number race condition).
// =====================================================================

import type { PrismaClient, Prisma, StatusPengirimanInvoice } from '@prisma/client'

export interface CreateInvoiceData {
  nomor: string
  id_transaksi: string
  nama_client: string
  no_wa_client?: string | null
  nama_psikolog: string
  judul_layanan: string
  tanggal_sesi: Date
  jenis_sesi: string
  harga: Prisma.Decimal | number
  metode_bayar: string
  tanggal_bayar?: Date | null
}

export class InvoiceRepository {
  constructor(private prisma: PrismaClient) {}

  // ── Cek apakah invoice sudah ada untuk transaksi ini ──────────────
  async findByTransaksiId(id_transaksi: string) {
    return this.prisma.invoice.findUnique({
      where: { id_transaksi },
    })
  }

  async findByNomor(nomor: string) {
    return this.prisma.invoice.findUnique({
      where: { nomor },
    })
  }

  async findById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
    })
  }

  // ── Hitung jumlah invoice pada tanggal tertentu (WIB) ────────────
  // Dipakai untuk generate nomor urut XXXX pada format INV-YYYYMMDD-XXXX.
  // Menghitung invoice yang sudah ada dengan prefix nomor tersebut.
  async countByDatePrefix(datePrefix: string): Promise<number> {
    // datePrefix format: "INV-YYYYMMDD"
    return this.prisma.invoice.count({
      where: {
        nomor: {
          startsWith: datePrefix,
        },
      },
    })
  }

  // ── Buat invoice baru dalam DB transaction ────────────────────────
  // Menggunakan Prisma $transaction untuk atomic insert + prevent race condition.
  // Jika nomor sudah ada (unique constraint violation), error akan ter-throw
  // dan caller bisa retry dengan nomor berikutnya.
  async create(data: CreateInvoiceData) {
    return this.prisma.invoice.create({ data })
  }

  // ── Update status pengiriman WA ───────────────────────────────────
  async updateStatusKirim(
    id: string,
    status: StatusPengirimanInvoice,
    adminName: string,
    gagalAlasan?: string | null
  ) {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status_kirim: status,
        sent_at: status === 'DIKIRIM' ? new Date() : undefined,
        sent_by_admin: status === 'DIKIRIM' ? adminName : undefined,
        gagal_alasan: gagalAlasan ?? null,
      },
    })
  }

  // ── Ambil semua invoice dengan data transaksi (untuk listing) ─────
  async findAll() {
    return this.prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }
}
