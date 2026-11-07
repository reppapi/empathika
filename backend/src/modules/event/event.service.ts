import type { FastifyInstance } from 'fastify'
import { Prisma } from '@prisma/client'
import { EventRepository } from './event.repository'
import type { CreateEventInput, UpdateEventInput, EventQueryInput } from './event.schema'

export class EventService {
  private repo: EventRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new EventRepository(fastify.prisma)
  }

  async getAll(query?: EventQueryInput) {
    return this.repo.findAll(query)
  }

  async getById(id: string) {
    const item = await this.repo.findById(id)
    if (!item) {
      throw Object.assign(new Error('Event tidak ditemukan'), { statusCode: 404 })
    }
    return item
  }

  async create(data: CreateEventInput) {
    try {
      return await this.repo.create(data)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw Object.assign(new Error('Event dengan data ini sudah ada'), { statusCode: 409 })
        }
      }
      throw error
    }
  }

  async update(id: string, data: UpdateEventInput) {
    // 1. Cek event ada
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Event tidak ditemukan'), { statusCode: 404 })
    }

    // 2. Validasi bisnis: tidak boleh mengubah kuota menjadi lebih kecil dari jumlah booking aktif
    if (data.kuota !== undefined && data.kuota < existing.jumlah_booking) {
      throw Object.assign(
        new Error(
          `Kuota tidak boleh dikurangi di bawah jumlah peserta yang sudah terdaftar (${existing.jumlah_booking} orang)`
        ),
        { statusCode: 409 }
      )
    }

    // 3. Validasi bisnis: tidak boleh mengubah status event CANCELLED kembali ke UPCOMING/ONGOING
    if (
      existing.status === 'CANCELLED' &&
      data.status &&
      ['UPCOMING', 'ONGOING'].includes(data.status)
    ) {
      throw Object.assign(
        new Error('Event yang sudah dibatalkan tidak dapat dikembalikan ke status aktif'),
        { statusCode: 409 }
      )
    }

    // 4. Validasi bisnis: harga_coret harus lebih besar dari harga asli
    const targetHarga = data.harga !== undefined ? data.harga : Number(existing.harga)
    const targetHargaCoret =
      data.harga_coret !== undefined
        ? (data.harga_coret !== null ? Number(data.harga_coret) : null)
        : (existing.harga_coret !== null && existing.harga_coret !== undefined ? Number(existing.harga_coret) : null)

    if (targetHargaCoret !== null && targetHargaCoret <= targetHarga) {
      throw Object.assign(
        new Error('Harga coret harus lebih besar dari harga asli'),
        { statusCode: 400 }
      )
    }

    // 5. Validasi bisnis: jika event tipe ONLINE, link_meet wajib ada
    const targetTipe = data.tipe_event !== undefined ? data.tipe_event : existing.tipe_event
    const targetMeet = data.link_meet !== undefined ? data.link_meet : existing.link_meet

    if (targetTipe === 'ONLINE' && (!targetMeet || targetMeet.trim() === '')) {
      throw Object.assign(
        new Error('Link Google Meet wajib diisi untuk event online'),
        { statusCode: 400 }
      )
    }

    try {
      return await this.repo.update(id, data)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw Object.assign(new Error('Event tidak ditemukan'), { statusCode: 404 })
        }
      }
      throw error
    }
  }

  async delete(id: string) {
    // 1. Cek event ada
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Event tidak ditemukan'), { statusCode: 404 })
    }

    // 2. Validasi bisnis: tidak boleh hapus event yang sudah ada booking aktif (CONFIRMED/PENDING)
    const activeBookings = await this.repo.countBookings(id)
    if (activeBookings > 0) {
      throw Object.assign(
        new Error(
          `Tidak dapat menghapus event karena masih ada ${activeBookings} peserta terdaftar. Batalkan event terlebih dahulu.`
        ),
        { statusCode: 409 }
      )
    }

    try {
      return await this.repo.delete(id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw Object.assign(
            new Error('Event tidak dapat dihapus karena masih memiliki data terkait'),
            { statusCode: 409 }
          )
        }
        if (error.code === 'P2025') {
          throw Object.assign(new Error('Event tidak ditemukan'), { statusCode: 404 })
        }
      }
      throw error
    }
  }
}
