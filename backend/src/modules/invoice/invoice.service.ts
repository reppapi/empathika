// =====================================================================
// invoice.service.ts
// Business logic untuk penerbitan invoice, lazy generate, dan
// pembaruan status pengiriman WhatsApp.
// =====================================================================

import type { FastifyInstance } from 'fastify'
import { InvoiceRepository } from './invoice.repository'
import {
  buildInvoiceWhatsAppText,
  buildWhatsAppUrl,
  validateWhatsAppNumber,
  type InvoiceData,
} from './invoice.helper'

// Offset WIB untuk konversi tanggal ke zona Asia/Jakarta
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

// ── Generate nomor invoice INV-YYYYMMDD-XXXX (reset per hari) ────────
// Menggunakan DB transaction + unique constraint sebagai pengaman race condition.
async function generateNomorInvoice(repo: InvoiceRepository): Promise<string> {
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS)
  const yy = nowWIB.getUTCFullYear()
  const mm = String(nowWIB.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(nowWIB.getUTCDate()).padStart(2, '0')
  const datePrefix = `INV-${yy}${mm}${dd}`

  // Hitung invoice existing pada hari ini, lalu +1
  const count = await repo.countByDatePrefix(datePrefix)
  const urut = String(count + 1).padStart(4, '0')
  return `${datePrefix}-${urut}`
}

export class InvoiceService {
  private repo: InvoiceRepository

  constructor(private fastify: FastifyInstance) {
    this.repo = new InvoiceRepository(fastify.prisma)
  }

  // ── Terbitkan invoice (idempotent) ───────────────────────────────
  // Jika sudah ada, kembalikan yang sudah ada (idempotent).
  // Jika belum ada, buat invoice baru dengan snapshot data.
  async terbitkanInvoice(transaksiId: string): Promise<ReturnType<InvoiceRepository['findByTransaksiId']> extends Promise<infer T> ? T : never> {
    // 1. Cek apakah invoice sudah ada (idempotency)
    const existing = await this.repo.findByTransaksiId(transaksiId)
    if (existing) {
      return existing as any
    }

    // 2. Cari transaksi dengan semua relasi yang dibutuhkan
    const transaksi = await this.fastify.prisma.transaksi.findUnique({
      where: { id: transaksiId },
      include: {
        client: true,
        booking_konsultasi: {
          include: {
            layanan: true,
            jadwal: {
              include: {
                psikolog: {
                  include: { account: true },
                },
              },
            },
          },
        },
        booking_psikotes: {
          include: {
            paket: true,
          },
        },
        booking_event: {
          include: {
            event: true,
          },
        },
      },
    })

    if (!transaksi) {
      const err: any = new Error('Transaksi tidak ditemukan')
      err.statusCode = 404
      throw err
    }

    // 3. Validasi: jika belum ada invoice, hanya transaksi yang sudah PAID (atau pernah PAID lalu REFUNDED) yang bisa diterbitkan
    if (transaksi.status_pembayaran !== 'PAID' && transaksi.status_pembayaran !== 'REFUNDED') {
      const err: any = new Error(
        'Invoice hanya dapat diterbitkan untuk transaksi yang sudah dibayar (status PAID).'
      )
      err.statusCode = 422
      throw err
    }

    // 4. Ambil data snapshot
    const booking = transaksi.booking_konsultasi
    const bookingPsikotes = transaksi.booking_psikotes
    const bookingEvent = transaksi.booking_event
    const jadwal = booking?.jadwal
    const psikolog = jadwal?.psikolog
    const namaGelar =
      psikolog?.nama_gelar ??
      psikolog?.account?.nama ??
      (bookingPsikotes ? 'Asesmen Mandiri' : bookingEvent?.event?.nama_pembicara ?? 'Platform Empathika')

    const judulLayanan =
      booking?.layanan?.nama ??
      bookingPsikotes?.paket?.judul ??
      bookingEvent?.event?.judul ??
      'Layanan Empathika'

    // Gabungkan tanggal dan waktu sesi menjadi DateTime lengkap
    let tanggalSesi: Date = transaksi.createdAt || new Date()
    if (jadwal?.tanggal && jadwal?.jam_mulai) {
      const tgl = new Date(jadwal.tanggal)
      const jam = new Date(jadwal.jam_mulai)
      tanggalSesi = new Date(
        Date.UTC(
          tgl.getUTCFullYear(),
          tgl.getUTCMonth(),
          tgl.getUTCDate(),
          jam.getUTCHours(),
          jam.getUTCMinutes()
        )
      )
    } else if (bookingEvent?.event?.tanggal) {
      tanggalSesi = new Date(bookingEvent.event.tanggal)
    }

    // 5. Generate nomor invoice (dengan retry jika race condition)
    let nomor: string
    let retries = 0
    let lastError: unknown = null
    while (retries < 5) {
      nomor = await generateNomorInvoice(this.repo)
      try {
        const invoice = await this.repo.create({
          nomor,
          id_transaksi: transaksiId,
          nama_client: transaksi.client.nama,
          no_wa_client: transaksi.client.no_telepon ?? null,
          nama_psikolog: namaGelar,
          judul_layanan: judulLayanan,
          tanggal_sesi: tanggalSesi,
          jenis_sesi: booking?.metode ?? 'ONLINE',
          harga: transaksi.total,
          metode_bayar: transaksi.metode_pembayaran,
          tanggal_bayar: transaksi.tanggal_bayar ?? null,
        })
        return invoice as any
      } catch (e: any) {
        lastError = e
        // Jika unique constraint violation pada nomor (race condition), retry
        if (
          retries < 4 &&
          (e?.code === 'P2002' || e?.message?.includes('unique'))
        ) {
          retries++
          await new Promise((r) => setTimeout(r, 50 * retries))
          // Setelah retry, mungkin invoice sudah dibuat oleh request lain
          const check = await this.repo.findByTransaksiId(transaksiId)
          if (check) return check as any
          continue
        }
        throw e
      }
    }
    throw lastError || new Error('Gagal generate nomor invoice setelah 5 percobaan')
  }

  // ── Ambil invoice berdasarkan transaksi (lazy generate) ─────────
  async getOrCreateInvoice(transaksiId: string) {
    return this.terbitkanInvoice(transaksiId)
  }

  // ── Helper bangun data invoice terstruktur berdasarkan jenis transaksi ───
  private async buildInvoiceData(transaksiId: string, invoice: any): Promise<InvoiceData> {
    const trx = await this.fastify.prisma.transaksi.findUnique({
      where: { id: transaksiId },
      include: {
        booking_psikotes: {
          include: {
            paket: true,
            peserta_psikotes: true,
          },
        },
        booking_konsultasi: true,
        booking_event: true,
      },
    })

    const isPsikotes = trx?.tipe_transaksi === 'PSIKOTES' || Boolean(trx?.booking_psikotes)
    const isEvent = trx?.tipe_transaksi === 'EVENT' || Boolean(trx?.booking_event)

    const kodeAkses = trx?.booking_psikotes?.kode_akses || trx?.kode_transaksi || null
    const idPaket = trx?.booking_psikotes?.id_paket || null
    const namaPeserta = trx?.booking_psikotes?.peserta_psikotes?.nama_lengkap || null

    return {
      nomor: invoice.nomor,
      tanggal_terbit: invoice.tanggal_terbit,
      tanggal_bayar: invoice.tanggal_bayar,
      nama_client: invoice.nama_client,
      judul_layanan: invoice.judul_layanan,
      nama_psikolog: invoice.nama_psikolog,
      tanggal_sesi: invoice.tanggal_sesi,
      jenis_sesi: invoice.jenis_sesi,
      harga: invoice.harga,
      metode_bayar: invoice.metode_bayar,
      no_wa_client: invoice.no_wa_client,
      tipe_transaksi: isPsikotes ? 'PSIKOTES' : isEvent ? 'EVENT' : 'KONSULTASI',
      kode_akses: kodeAkses,
      id_paket: idPaket,
      nama_peserta: namaPeserta,
      masa_berlaku_hari: 14,
    }
  }

  // ── Ambil teks pesan WA invoice ──────────────────────────────────
  async getInvoiceText(transaksiId: string): Promise<string> {
    const invoice = await this.getOrCreateInvoice(transaksiId)
    const data = await this.buildInvoiceData(transaksiId, invoice)
    return buildInvoiceWhatsAppText(data)
  }

  // ── Bangun URL wa.me untuk kirim invoice ──────────────────────────
  async buildSendUrl(transaksiId: string): Promise<{
    url: string
    nomor_tujuan: string
    invoice: any
  }> {
    const invoice = await this.getOrCreateInvoice(transaksiId)

    // Cek status transaksi: jika REFUNDED, tombol kirim tidak diizinkan
    const trx = await this.fastify.prisma.transaksi.findUnique({
      where: { id: transaksiId },
      select: { status_pembayaran: true },
    })
    if (trx?.status_pembayaran === 'REFUNDED') {
      const err: any = new Error('Invoice tidak dapat dikirim untuk transaksi yang sudah dibatalkan/direfund.')
      err.statusCode = 422
      throw err
    }

    const waValidation = validateWhatsAppNumber(invoice!.no_wa_client)
    if (!waValidation.valid) {
      const err: any = new Error(waValidation.error)
      err.statusCode = 422
      err.code = 'INVALID_WA_NUMBER'
      throw err
    }

    const data = await this.buildInvoiceData(transaksiId, invoice)
    const text = buildInvoiceWhatsAppText(data)
    const url = buildWhatsAppUrl(waValidation.normalized!, text)

    return {
      url,
      nomor_tujuan: waValidation.normalized!,
      invoice,
    }
  }

  // ── Tandai invoice sudah dikirim (opsi A: admin buka link WA) ────
  async markAsSent(transaksiId: string, adminName: string) {
    const invoice = await this.repo.findByTransaksiId(transaksiId)
    if (!invoice) {
      const err: any = new Error('Invoice tidak ditemukan untuk transaksi ini')
      err.statusCode = 404
      throw err
    }
    return this.repo.updateStatusKirim(invoice.id, 'DIKIRIM', adminName, null)
  }
}
