/**
 * Facade Repository untuk modul Psikotes.
 * Mengagregasi sub-repositories terpisah (Paket, Pengerjaan, Booking, Review, Peserta)
 * agar antarmuka API publik tetap 100% backward-compatible dengan psikotes.service.ts dan unit tests.
 */
import type { PrismaClient } from '@prisma/client'
import type {
  CreatePsikotesInput,
  UpdatePsikotesInput,
  PsikotesQueryInput,
  SubmitPsikotesInput,
  PesertaQueryInput,
  CreateBookingPsikotesInput,
  VerifyTicketInput,
  ReviewPsikotesQueryInput,
  SubmitReviewPsikotesInput,
} from './psikotes.schema'
import {
  determineKategoriPeserta,
  purgeExpiredPsikotesData,
  PsikotesPaketRepository,
  PsikotesPengerjaanRepository,
  PsikotesBookingRepository,
  PsikotesReviewRepository,
  PsikotesPesertaRepository,
} from './repositories'

// Re-export helper penentuan kategori usia peserta dan fungsi retensi
export { determineKategoriPeserta, purgeExpiredPsikotesData }

export class PsikotesRepository {
  private paketRepo: PsikotesPaketRepository
  private pengerjaanRepo: PsikotesPengerjaanRepository
  private bookingRepo: PsikotesBookingRepository
  private reviewRepo: PsikotesReviewRepository
  private pesertaRepo: PsikotesPesertaRepository

  constructor(prisma: PrismaClient) {
    this.paketRepo = new PsikotesPaketRepository(prisma)
    this.pengerjaanRepo = new PsikotesPengerjaanRepository(prisma)
    this.bookingRepo = new PsikotesBookingRepository(prisma)
    this.reviewRepo = new PsikotesReviewRepository(prisma)
    this.pesertaRepo = new PsikotesPesertaRepository(prisma)
  }

  // ── 1. Domain Paket & Soal Psikotes ──────────────────────────────────────────
  async findAll(params?: PsikotesQueryInput) {
    return this.paketRepo.findAll(params)
  }

  async findById(id: string, allowDraft: boolean = false) {
    return this.paketRepo.findById(id, allowDraft)
  }

  async create(data: CreatePsikotesInput) {
    return this.paketRepo.create(data)
  }

  async update(id: string, data: UpdatePsikotesInput) {
    return this.paketRepo.update(id, data)
  }

  async delete(id: string) {
    return this.paketRepo.delete(id)
  }

  // ── 2. Domain Pengerjaan & Kalkulasi Skoring ─────────────────────────────────
  async submit(idPaket: string, input: SubmitPsikotesInput) {
    return this.pengerjaanRepo.submit(idPaket, input)
  }

  // ── 3. Domain Booking, Tiket, & Laporan Hasil ────────────────────────────────
  async createBooking(input: CreateBookingPsikotesInput) {
    return this.bookingRepo.createBooking(input)
  }

  async verifyTicket(input: VerifyTicketInput) {
    this.purgeExpiredPsikotesData().catch(() => {})
    return this.bookingRepo.verifyTicket(input)
  }

  async getHasilByBookingId(
    bookingId: string,
    options?: { accessToken?: string; isAdmin?: boolean }
  ) {
    this.purgeExpiredPsikotesData().catch(() => {})
    return this.bookingRepo.getHasilByBookingId(bookingId, options)
  }

  // ── 4. Domain Review / Telaah Klinis Psikolog ─────────────────────────────────
  async getReviewList(
    params?: ReviewPsikotesQueryInput,
    userId?: string,
    userRole?: string
  ) {
    this.purgeExpiredPsikotesData().catch(() => {})
    return this.reviewRepo.getReviewList(params, userId, userRole)
  }

  async submitReview(
    bookingId: string,
    input: SubmitReviewPsikotesInput,
    userId?: string,
    userRole?: string
  ) {
    return this.reviewRepo.submitReview(bookingId, input, userId, userRole)
  }

  async claimReviewTicket(bookingId: string, userId?: string, userRole?: string) {
    return this.reviewRepo.claimReviewTicket(bookingId, userId, userRole)
  }

  async releaseReviewTicket(bookingId: string, userId?: string, userRole?: string) {
    return this.reviewRepo.releaseReviewTicket(bookingId, userId, userRole)
  }

  // ── 5. Domain Peserta & Manajemen Retensi Lifecycle ─────────────────────────
  async findPeserta(params?: PesertaQueryInput) {
    this.purgeExpiredPsikotesData().catch(() => {})
    return this.pesertaRepo.findPeserta(params)
  }

  async cleanupOldAnonymousGuests(daysOld: number = 60) {
    this.purgeExpiredPsikotesData().catch(() => {})
    return this.pesertaRepo.cleanupOldAnonymousGuests(daysOld)
  }

  async purgeExpiredPsikotesData(daysOld: number = 90) {
    return this.pesertaRepo.purgeExpiredPsikotesData(daysOld)
  }
}
