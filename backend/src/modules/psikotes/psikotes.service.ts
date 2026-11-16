/** Service layer bisnis modul psikotes yang menghubungkan controller ke repository. */
import type { FastifyInstance } from 'fastify'
import { PsikotesRepository } from './psikotes.repository'
import type {
  CreatePsikotesInput,
  UpdatePsikotesInput,
  PsikotesQueryInput,
  SubmitPsikotesInput,
  PesertaQueryInput,
  CreateBookingPsikotesInput,
  VerifyTicketInput,
} from './psikotes.schema'

export class PsikotesService {
  private repo: PsikotesRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new PsikotesRepository(fastify.prisma)
  }

  async getAll(params?: PsikotesQueryInput) {
    return this.repo.findAll(params)
  }

  async getById(id: string, allowDraft: boolean = false) {
    const item = await this.repo.findById(id, allowDraft)
    if (!item) {
      throw new Error('Paket psikotes tidak ditemukan atau belum dipublikasikan')
    }
    return item
  }

  async create(data: CreatePsikotesInput) {
    return this.repo.create(data)
  }

  async update(id: string, data: UpdatePsikotesInput) {
    return this.repo.update(id, data)
  }

  async delete(id: string) {
    return this.repo.delete(id)
  }

  async submit(idPaket: string, input: SubmitPsikotesInput) {
    return this.repo.submit(idPaket, input)
  }

  async createBooking(input: CreateBookingPsikotesInput) {
    return this.repo.createBooking(input)
  }

  async verifyTicket(input: VerifyTicketInput) {
    return this.repo.verifyTicket(input)
  }

  async getHasilByBooking(
    bookingId: string,
    options?: { accessToken?: string; isAdmin?: boolean }
  ) {
    return this.repo.getHasilByBookingId(bookingId, options)
  }

  async getPeserta(params?: PesertaQueryInput) {
    return this.repo.findPeserta(params)
  }

  async cleanupOldAnonymousGuests(daysOld?: number) {
    return this.repo.cleanupOldAnonymousGuests(daysOld)
  }
}


