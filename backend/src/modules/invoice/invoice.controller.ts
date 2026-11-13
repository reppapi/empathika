// =====================================================================
// invoice.controller.ts
// Handler Fastify untuk endpoint invoice.
// Semua endpoint memerlukan role ADMIN (dijaga oleh adminGuard di route).
// =====================================================================

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { InvoiceService } from './invoice.service'
import { validateWhatsAppNumber } from './invoice.helper'

export class InvoiceController {
  private service: InvoiceService

  constructor(fastify: FastifyInstance) {
    this.service = new InvoiceService(fastify)
  }

  // ── GET /invoice/transaksi/:transaksiId ───────────────────────────
  // Ambil invoice (lazy generate jika belum ada).
  // Mengembalikan data invoice + teks pesan WA + URL wa.me.
  getOrCreate = async (
    request: FastifyRequest<{ Params: { transaksiId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { transaksiId } = request.params

      // Lazy generate: terbitkan jika belum ada
      const invoice = await this.service.getOrCreateInvoice(transaksiId)
      if (!invoice) {
        return reply.code(404).send({ error: 'Not Found', message: 'Invoice tidak ditemukan' })
      }

      // Bangun teks pesan WA (otomatis menyesuaikan jenis transaksi: Psikotes / Konseling / Event)
      const text = await this.service.getInvoiceText(transaksiId)

      // Validasi nomor WA (untuk info FE, tidak throw)
      const waValidation = validateWhatsAppNumber(invoice.no_wa_client)

      reply.send({
        success: true,
        data: {
          ...serializeInvoice(invoice),
          pesan_wa: text,
          wa_valid: waValidation.valid,
          wa_normalized: waValidation.normalized ?? null,
          wa_error: waValidation.error ?? null,
        },
      })
    } catch (err: any) {
      const status = err.statusCode || 500
      reply.code(status).send({
        error: httpErrorName(status),
        message: err.message,
        code: err.code,
      })
    }
  }

  // ── GET /invoice/transaksi/:transaksiId/wa-url ────────────────────
  // Bangun URL wa.me dengan teks invoice ter-URL-encode.
  // Mengembalikan URL + nomor tujuan.
  getWaUrl = async (
    request: FastifyRequest<{ Params: { transaksiId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { transaksiId } = request.params
      const result = await this.service.buildSendUrl(transaksiId)

      reply.send({
        success: true,
        data: {
          url: result.url,
          nomor_tujuan: result.nomor_tujuan,
          invoice: serializeInvoice(result.invoice),
        },
      })
    } catch (err: any) {
      const status = err.statusCode || 500
      reply.code(status).send({
        error: httpErrorName(status),
        message: err.message,
        code: err.code,
      })
    }
  }

  // ── POST /invoice/transaksi/:transaksiId/mark-sent ────────────────
  // Tandai invoice sebagai sudah dikirim via WA (opsi A: admin buka link).
  // Pengiriman ulang diperbolehkan — hanya update sent_at dan sent_by_admin.
  markSent = async (
    request: FastifyRequest<{ Params: { transaksiId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { transaksiId } = request.params
      const user = request.user as { id?: string; name?: string; role?: string; email?: string }
      const adminName = user?.name || user?.email || 'Admin Empathika'

      const updated = await this.service.markAsSent(transaksiId, adminName)
      reply.send({
        success: true,
        message: 'Status invoice diperbarui: Sudah Dikirim',
        data: serializeInvoice(updated),
      })
    } catch (err: any) {
      const status = err.statusCode || 500
      reply.code(status).send({
        error: httpErrorName(status),
        message: err.message,
        code: err.code,
      })
    }
  }
}

// ── Serialisasi invoice (Decimal → number untuk JSON) ─────────────────
function serializeInvoice(invoice: any) {
  return {
    id: invoice.id,
    nomor: invoice.nomor,
    id_transaksi: invoice.id_transaksi,
    nama_client: invoice.nama_client,
    no_wa_client: invoice.no_wa_client,
    nama_psikolog: invoice.nama_psikolog,
    judul_layanan: invoice.judul_layanan,
    tanggal_sesi: invoice.tanggal_sesi,
    jenis_sesi: invoice.jenis_sesi,
    harga: Number(invoice.harga),
    metode_bayar: invoice.metode_bayar,
    tanggal_bayar: invoice.tanggal_bayar,
    tanggal_terbit: invoice.tanggal_terbit,
    status_kirim: invoice.status_kirim,
    sent_at: invoice.sent_at,
    sent_by_admin: invoice.sent_by_admin,
    gagal_alasan: invoice.gagal_alasan,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  }
}

function httpErrorName(status: number): string {
  const map: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
  }
  return map[status] ?? 'Error'
}
