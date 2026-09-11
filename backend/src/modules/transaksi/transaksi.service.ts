import type { FastifyInstance } from 'fastify'
import { TransaksiRepository } from './transaksi.repository'
import type { CreateTransaksiInput } from './transaksi.schema'
import { paymentService } from './payment/payment.service'

export class TransaksiService {
  private repo: TransaksiRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new TransaksiRepository(fastify.prisma)
  }

  async getAll(params?: { userId?: string }) {
    return this.repo.findAll(params)
  }

  async getMyTransaksi(userId: string) {
    return this.repo.findByUserId(userId)
  }

  async getById(id: string) {
    const transaksi = await this.repo.findById(id)
    if (!transaksi) throw new Error('Transaksi tidak ditemukan')
    return transaksi
  }

  async createPayment(input: CreateTransaksiInput, userId: string) {
    // TODO: Get booking detail + price dari booking service
    const amount = 150000 // placeholder

    const transaksi = await this.repo.create({
      bookingId: input.bookingId,
      userId,
      amount,
      paymentMethod: input.paymentMethod,
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
