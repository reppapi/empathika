import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { BiroService } from "./biro.service"
import type {
  UpdateBiroAccountInput,
  GetPublicBiroParams,
  GetPublicBiroPsikologQuery,
  GetPublicBiroPsikologDetailParams,
  GetPublicBiroLayananQuery,
  GetPublicBiroJadwalQuery,
  CreatePublicBiroBookingInput,
  GetPublicBiroBookingStatusParams,
  SendPublicBiroContactInput,
} from "./biro.schema"

export class BiroController {
  private service: BiroService

  constructor(fastify: FastifyInstance) {
    this.service = new BiroService(fastify.prisma)
  }

  // ==========================================
  // MANAJEMEN AKUN INTERNAL BIRO (PORTAL/ADMIN)
  // ==========================================

  updateAccount = async (
    request: FastifyRequest<{ Body: UpdateBiroAccountInput }>,
    reply: FastifyReply
  ) => {
    try {
      const user = (request as any).user
      const accountId = user?.id || (request.headers["x-account-id"] as string)

      if (!accountId) {
        return reply.code(401).send({ error: "Unauthorized", message: "ID akun tidak ditemukan" })
      }

      const result = await this.service.updateAccount(accountId, request.body)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({ error: "Bad Request", message: err.message })
    }
  }

  getMyAccount = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user
      const accountId = user?.id || (request.headers["x-account-id"] as string)

      if (!accountId) {
        return reply.code(401).send({ error: "Unauthorized", message: "ID akun tidak ditemukan" })
      }

      const result = await this.service.getAccount(accountId)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 404
      return reply.code(statusCode).send({ error: "Error", message: err.message })
    }
  }

  getAll = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await this.service.getAllBiroAccounts()
      return reply.code(200).send(result)
    } catch (err: any) {
      return reply.code(500).send({ error: "Error", message: err.message })
    }
  }

  // ==========================================
  // WEBSITE PUBLIK BIRO (CLIENT / USER FACING)
  // ==========================================

  /**
   * GET /biro/public/:slug
   * Mengambil detail informasi profil publik biro
   */
  getPublicBiro = async (
    request: FastifyRequest<{ Params: GetPublicBiroParams }>,
    reply: FastifyReply
  ) => {
    try {
      const { slug } = request.params
      const result = await this.service.getPublicBiroBySlug(slug)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 404
      return reply.code(statusCode).send({ error: "Not Found", message: err.message })
    }
  }

  /**
   * GET /biro/public/:slug/psikolog
   * Mengambil daftar tenaga ahli / psikolog di biro
   */
  getPublicBiroPsikolog = async (
    request: FastifyRequest<{
      Params: GetPublicBiroParams
      Querystring: GetPublicBiroPsikologQuery
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { slug } = request.params
      const result = await this.service.getPublicBiroPsikolog(slug, request.query)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({ error: "Error", message: err.message })
    }
  }

  /**
   * GET /biro/public/:slug/psikolog/:psikologId
   * Mengambil detail profil satu psikolog di biro
   */
  getPublicBiroPsikologDetail = async (
    request: FastifyRequest<{ Params: GetPublicBiroPsikologDetailParams }>,
    reply: FastifyReply
  ) => {
    try {
      const { slug, psikologId } = request.params
      const result = await this.service.getPublicBiroPsikologDetail(slug, psikologId)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 404
      return reply.code(statusCode).send({ error: "Not Found", message: err.message })
    }
  }

  /**
   * GET /biro/public/:slug/layanan
   * Mengambil daftar layanan aktif di biro
   */
  getPublicBiroLayanan = async (
    request: FastifyRequest<{
      Params: GetPublicBiroParams
      Querystring: GetPublicBiroLayananQuery
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { slug } = request.params
      const result = await this.service.getPublicBiroLayanan(slug, request.query)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({ error: "Error", message: err.message })
    }
  }

  /**
   * GET /biro/public/:slug/jadwal-tersedia
   * Mengambil slot jadwal ketersediaan di biro
   */
  getPublicBiroJadwal = async (
    request: FastifyRequest<{
      Params: GetPublicBiroParams
      Querystring: GetPublicBiroJadwalQuery
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { slug } = request.params
      const result = await this.service.getPublicBiroJadwal(slug, request.query)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({ error: "Error", message: err.message })
    }
  }

  /**
   * POST /biro/public/:slug/booking
   * Klien membuat pemesanan booking konsultasi di biro
   */
  createPublicBiroBooking = async (
    request: FastifyRequest<{
      Params: GetPublicBiroParams
      Body: CreatePublicBiroBookingInput
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { slug } = request.params
      const result = await this.service.createPublicBiroBooking(slug, request.body)
      return reply.code(201).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({ error: "Bad Request", message: err.message })
    }
  }

  /**
   * GET /biro/public/:slug/booking/:kode_pesanan
   * Klien mengecek status booking mereka di website biro
   */
  getPublicBiroBookingStatus = async (
    request: FastifyRequest<{ Params: GetPublicBiroBookingStatusParams }>,
    reply: FastifyReply
  ) => {
    try {
      const { slug, kode_pesanan } = request.params
      const result = await this.service.getPublicBiroBookingStatus(slug, kode_pesanan)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 404
      return reply.code(statusCode).send({ error: "Not Found", message: err.message })
    }
  }

  /**
   * POST /biro/public/:slug/kontak
   * Pengunjung mengirimkan pesan pertanyaan / kontak ke biro
   */
  sendPublicBiroContact = async (
    request: FastifyRequest<{
      Params: GetPublicBiroParams
      Body: SendPublicBiroContactInput
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { slug } = request.params
      const result = await this.service.sendPublicBiroContact(slug, request.body)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({ error: "Bad Request", message: err.message })
    }
  }
}
