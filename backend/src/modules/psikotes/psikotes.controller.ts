/** Controller handler request/response HTTP untuk katalog, booking, tiket, submit tes, dan admin psikotes. */
import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { PsikotesService } from './psikotes.service'
import { hasAllowedDummyToken } from '../../middlewares/dev-bypass'
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

export class PsikotesController {
  private service: PsikotesService
  private fastify: FastifyInstance

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
    this.service = new PsikotesService(fastify)
  }

  getAll = async (
    request: FastifyRequest<{ Querystring: PsikotesQueryInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getAll(request.query)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil daftar paket psikotes',
      data,
    })
  }

  getById = async (
    request: FastifyRequest<{ Params: { id: string }; Querystring: { allowDraft?: string | boolean } }>,
    reply: FastifyReply
  ) => {
    const allowDraft = request.query?.allowDraft === 'true' || request.query?.allowDraft === true
    const data = await this.service.getById(request.params.id, allowDraft)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil detail paket psikotes',
      data,
    })
  }

  create = async (
    request: FastifyRequest<{ Body: CreatePsikotesInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.create(request.body)
    return reply.code(201).send({
      success: true,
      message: 'Berhasil menyimpan paket psikotes ke database',
      data,
    })
  }

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdatePsikotesInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.update(request.params.id, request.body)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil memperbarui paket psikotes',
      data,
    })
  }

  remove = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    await this.service.delete(request.params.id)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil menghapus paket psikotes',
    })
  }

  submit = async (
    request: FastifyRequest<{ Params: { id: string }; Body: SubmitPsikotesInput }>,
    reply: FastifyReply
  ) => {
    const resolvedBiroId = await this.resolveBiroIdFromRequest(request)
    const payload: SubmitPsikotesInput = {
      ...request.body,
      ...(resolvedBiroId ? { id_biro: resolvedBiroId } : {}),
    }
    const data = await this.service.submit(request.params.id, payload)
    return reply.code(201).send({
      success: true,
      message: 'Berhasil mengirimkan jawaban psikotes dan menghitung hasil asesmen',
      data,
    })
  }

  private async getBiroIdForUser(userId?: string): Promise<string | undefined> {
    if (!userId) return undefined
    try {
      const account = await (this.fastify as any).prisma.account.findUnique({
        where: { id: userId },
        select: {
          id: true,
          id_biro: true,
          biro: { select: { id: true } },
          owned_biro: { select: { id: true } },
        },
      })
      if (!account) {
        const directBiro = await (this.fastify as any).prisma.biro.findUnique({
          where: { id: userId },
          select: { id: true },
        })
        return directBiro?.id
      }
      if (account.owned_biro && account.owned_biro.length > 0) {
        return account.owned_biro[0].id
      }
      if (account.id_biro) {
        return account.id_biro
      }
      if (account.biro?.id) {
        return account.biro.id
      }
      const biroFound = await (this.fastify as any).prisma.biro.findFirst({
        where: {
          OR: [
            { id_account: userId },
            { id: userId },
          ],
        },
        select: { id: true },
      })
      return biroFound?.id
    } catch {
      return undefined
    }
  }

  private async resolveBiroIdFromRequest(request: FastifyRequest): Promise<string | undefined> {
    // 1. Cek query atau body langsung jika ada id_biro
    const bodyBiro = (request.body as any)?.id_biro
    const queryBiro = (request.query as any)?.id_biro
    if (bodyBiro && typeof bodyBiro === 'string' && bodyBiro.trim()) return bodyBiro.trim()
    if (queryBiro && typeof queryBiro === 'string' && queryBiro.trim()) return queryBiro.trim()

    // 2. Cek headers: x-biro-id atau x-biro-slug
    const headerBiroId = request.headers['x-biro-id']
    if (headerBiroId && typeof headerBiroId === 'string' && headerBiroId.trim()) return headerBiroId.trim()

    const rawSlug = (
      request.headers['x-biro-slug'] ||
      (request.body as any)?.slug ||
      (request.body as any)?.biro_slug ||
      (request.query as any)?.slug ||
      (request.query as any)?.biro ||
      (request.query as any)?.tenant
    ) as string | undefined

    if (rawSlug && typeof rawSlug === 'string' && rawSlug.trim()) {
      const biro = await (this.fastify as any).prisma.biro.findFirst({
        where: { slug: { equals: rawSlug.trim(), mode: 'insensitive' } },
        select: { id: true },
      })
      if (biro?.id) return biro.id
    }

    // 3. Cek referer atau origin header jika berasal dari subdomain biro (misal: bina-insan.empathika.com atau ugm.localhost:3000)
    const referer = (request.headers.referer || request.headers.origin) as string | undefined
    if (referer && typeof referer === 'string') {
      try {
        const url = new URL(referer)
        const hostname = url.hostname.toLowerCase()
        let detectedSlug: string | null = null
        if (hostname.endsWith('.localhost')) {
          const parts = hostname.replace(/\.localhost$/, '').split('.')
          const sub = parts[parts.length - 1]
          if (sub && sub !== 'www') detectedSlug = sub
        } else if (hostname.endsWith('.lvh.me')) {
          const parts = hostname.replace(/\.lvh.me$/, '').split('.')
          const sub = parts[parts.length - 1]
          if (sub && sub !== 'www') detectedSlug = sub
        } else {
          const parts = hostname.split('.')
          if (parts.length > 2 && parts[0] !== 'www') detectedSlug = parts[0]
        }

        if (detectedSlug) {
          const biro = await (this.fastify as any).prisma.biro.findFirst({
            where: { slug: { equals: detectedSlug, mode: 'insensitive' } },
            select: { id: true },
          })
          if (biro?.id) return biro.id
        }
      } catch {}
    }

    return undefined
  }

  getPeserta = async (
    request: FastifyRequest<{ Querystring: PesertaQueryInput }>,
    reply: FastifyReply
  ) => {
    const user = (request as any).user
    let id_biro = request.query?.id_biro

    if (user?.role === 'BIRO') {
      const biroId = await this.getBiroIdForUser(user.id)
      if (!biroId) {
        return reply.code(200).send({
          success: true,
          message: 'Berhasil mengambil daftar peserta psikotes',
          data: {
            summary: {
              total_peserta: 0,
              total_gratis: 0,
              total_berbayar: 0,
              total_selesai: 0,
              total_menunggu_review: 0,
            },
            items: [],
          },
        })
      }
      id_biro = biroId
    }

    const data = await this.service.getPeserta({
      ...request.query,
      ...(id_biro ? { id_biro } : {}),
    })
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil daftar peserta psikotes',
      data,
    })
  }

  createBooking = async (
    request: FastifyRequest<{ Body: CreateBookingPsikotesInput }>,
    reply: FastifyReply
  ) => {
    try {
      const resolvedBiroId = await this.resolveBiroIdFromRequest(request)
      const payload: CreateBookingPsikotesInput = {
        ...request.body,
        ...(resolvedBiroId ? { id_biro: resolvedBiroId } : {}),
      }
      const data = await this.service.createBooking(payload)
      return reply.code(201).send({
        success: true,
        message: 'Berhasil mencatat transaksi dan booking paket psikotes berbayar',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || (err.code === 'P2002' ? 409 : 400)
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Gagal memproses booking paket psikotes',
      })
    }
  }

  verifyTicket = async (
    request: FastifyRequest<{ Body: VerifyTicketInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.verifyTicket(request.body)
      return reply.code(200).send({
        success: true,
        message: 'Kode akses berhasil diverifikasi',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Gagal memverifikasi kode tiket',
      })
    }
  }

  getHasilByBooking = async (
    request: FastifyRequest<{ Params: { bookingId: string }; Querystring: { token?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const headerToken = request.headers['x-hasil-token']
      const accessToken =
        request.query?.token || (typeof headerToken === 'string' ? headerToken : undefined)

      let isAdmin = hasAllowedDummyToken(request)
      if (!isAdmin && request.headers.authorization) {
        try {
          await (request as any).jwtVerify()
          const role = ((request as any).user as any)?.role
          isAdmin = role === 'ADMIN' || role === 'BIRO' || role === 'PSIKOLOG'
        } catch {
          isAdmin = false
        }
      }

      const data = await this.service.getHasilByBooking(request.params.bookingId, {
        accessToken,
        isAdmin,
      })
      return reply.code(200).send({
        success: true,
        message: 'Berhasil mengambil data laporan hasil asesmen resmi',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || 404
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Data hasil tes tidak ditemukan',
      })
    }
  }

  cleanupAnonymousGuests = async (
    request: FastifyRequest<{ Querystring: { days?: string | number } }>,
    reply: FastifyReply
  ) => {
    const days = request.query?.days ? Number(request.query.days) : 60
    const result = await this.service.cleanupOldAnonymousGuests(days)
    return reply.code(200).send({
      success: true,
      message: result.message,
      data: result,
    })
  }

  getReviewList = async (
    request: FastifyRequest<{ Querystring: ReviewPsikotesQueryInput }>,
    reply: FastifyReply
  ) => {
    try {
      let user = (request as any).user as { id?: string; role?: string } | undefined
      if (!user && (request as any).jwtVerify) {
        try {
          await (request as any).jwtVerify()
          user = (request as any).user
        } catch {}
      }

      const data = await this.service.getReviewList(
        request.query,
        user?.id,
        user?.role
      )
      return reply.code(200).send({
        success: true,
        message: 'Berhasil mengambil daftar antrean review asesmen psikotes',
        data,
      })
    } catch (err: any) {
      return reply.code(400).send({
        success: false,
        message: err.message || 'Gagal mengambil antrean review asesmen',
      })
    }
  }

  submitReview = async (
    request: FastifyRequest<{
      Params: { bookingId: string }
      Body: SubmitReviewPsikotesInput
    }>,
    reply: FastifyReply
  ) => {
    try {
      const user = (request as any).user as { id?: string; role?: string } | undefined
      const data = await this.service.submitReview(
        request.params.bookingId,
        request.body,
        user?.id,
        user?.role
      )
      return reply.code(200).send({
        success: true,
        message: 'Verifikasi telaah klinis psikolog berhasil disimpan dan laporan resmi telah terbit.',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Gagal menyimpan telaah klinis psikolog',
      })
    }
  }

  claimReviewTicket = async (
    request: FastifyRequest<{ Params: { bookingId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      let user = (request as any).user as { id?: string; role?: string } | undefined
      if (!user && (request as any).jwtVerify) {
        try {
          await (request as any).jwtVerify()
          user = (request as any).user
        } catch {}
      }

      const data = await this.service.claimReviewTicket(
        request.params.bookingId,
        user?.id,
        user?.role
      )
      return reply.code(200).send({
        success: true,
        message: 'Tiket asesmen berhasil diklaim dan dikunci untuk Anda.',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Gagal mengklaim tiket asesmen.',
      })
    }
  }

  releaseReviewTicket = async (
    request: FastifyRequest<{ Params: { bookingId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      let user = (request as any).user as { id?: string; role?: string } | undefined
      if (!user && (request as any).jwtVerify) {
        try {
          await (request as any).jwtVerify()
          user = (request as any).user
        } catch {}
      }

      const data = await this.service.releaseReviewTicket(
        request.params.bookingId,
        user?.id,
        user?.role
      )
      return reply.code(200).send({
        success: true,
        message: 'Tiket asesmen berhasil dikembalikan ke Kolam Bersama.',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Gagal melepas tiket asesmen.',
      })
    }
  }

  toggleWaStatus = async (
    request: FastifyRequest<{
      Params: { bookingId: string }
      Body?: { sent?: boolean }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { bookingId } = request.params
      const forcedSent = request.body?.sent
      const data = await this.service.toggleWaSentStatus(bookingId, forcedSent)
      return reply.code(200).send({
        success: true,
        message: data.is_wa_sent
          ? 'Hasil laporan psikotes berhasil ditandai telah dikirim via WhatsApp.'
          : 'Tanda pengiriman WhatsApp berhasil dibatalkan.',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Gagal memperbarui status pengiriman WhatsApp.',
      })
    }
  }
}


