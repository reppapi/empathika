import type { FastifyInstance } from 'fastify'
import { TransaksiRepository } from './transaksi.repository'
import type { CreateTransaksiInput } from './transaksi.schema'
import { paymentService } from './payment/payment.service'

export class TransaksiService {
  private repo: TransaksiRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new TransaksiRepository(fastify.prisma)
  }

  async getAll(params?: { clientId?: string }) {
    return this.repo.findAll(params)
  }

  async getMyTransaksi(clientId: string) {
    return this.repo.findByClientId(clientId)
  }

  async getById(id: string) {
    const transaksi = await this.repo.findById(id)
    if (!transaksi) {
      throw Object.assign(new Error('Transaksi tidak ditemukan'), { statusCode: 404 })
    }
    return transaksi
  }

  async processRefund(params: {
    transaksiId: string
    adminName: string
    alasan: string
  }) {
    const result = await this.repo.refundTransaksi(params)
    return {
      success: true,
      message: 'Refund transaksi berhasil diproses. Status telah diperbarui ke REFUNDED.',
      transaksiId: result.transaksi.id,
      kodeTransaksi: result.transaksi.kode_transaksi,
      nominalRefund: result.nominalRefund,
      statusPembayaran: result.transaksi.status_pembayaran,
      refundAt: result.transaksi.refund_at,
      refundReason: result.transaksi.refund_reason,
      refundByAdmin: result.transaksi.refund_by_admin,
      booking: result.booking
        ? {
            id: result.booking.id,
            kodePesanan: result.booking.kode_pesanan,
            statusBooking: result.booking.status,
            namaKlien: result.booking.client?.nama,
          }
        : null,
    }
  }

  async createPayment(input: CreateTransaksiInput, clientId: string) {
    // TODO: Get booking detail + price dari booking service
    const amount = 150000 // placeholder

    const transaksi = await this.repo.create({
      id_booking: input.bookingId,
      id_client: clientId,
      jumlah: amount,
      metode_pembayaran: input.paymentMethod,
    })

    // Inisiasi payment ke payment gateway
    const paymentUrl = await paymentService.initiate({
      transaksiId: transaksi.id,
      amount,
      method: input.paymentMethod,
    })

    return { transaksi, paymentUrl }
  }

  async handleWebhook(payload: Record<string, unknown>) {
    // TODO: Verifikasi signature dari payment gateway
    // TODO: Update status transaksi
    const transaksiId = payload['transaction_id'] as string
    const status = payload['transaction_status'] as string

    const mappedStatus = status === 'settlement' ? 'PAID' : status === 'cancel' ? 'FAILED' : 'PENDING'
    return this.repo.updateStatus(transaksiId, mappedStatus, payload)
  }
}
