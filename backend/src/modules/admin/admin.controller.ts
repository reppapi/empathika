import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { AdminService } from './admin.service'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
  UpdateBookingStatusInput,
  RescheduleBookingInput,
  UpdateAdminProfileInput,
  ResendActivationInput,
  UpdateTentangKamiInput,
  UpdateHeroBannersInput,
  CreateInternshipPositionInput,
  UpdateInternshipPositionInput,
  UpdateInternshipPositionsInput,
} from './admin.schema'
import {
  buildActivationUrl,
  formatExpiryWib,
  formatRemainingTime,
  issueActivationToken,
  withActivationAccount,
} from '../../utils/activation'

export class AdminController {
  private service: AdminService
  private fastify: FastifyInstance

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
    this.service = new AdminService(fastify)
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

  private async resolveBiroId(request: FastifyRequest): Promise<string | undefined> {
    const user = (request as any).user
    let biroId: string | undefined =
      (request.query as any)?.biroId ||
      (request.query as any)?.id_biro ||
      (request.headers['x-biro-id'] as string)

    // Jika biroId belum dapat, coba cek dari header atau query slug biro
    const slug =
      (request.headers['x-biro-slug'] as string) ||
      (request.query as any)?.slug ||
      (request.query as any)?.biro
    if (!biroId && slug) {
      const biro = await (this.fastify as any).prisma.biro.findFirst({
        where: { slug: String(slug).toLowerCase() },
        select: { id: true },
      })
      if (biro) biroId = biro.id
    }

    if (user?.role === 'BIRO') {
      const userBiroId = await this.getBiroIdForUser(user.id)
      if (userBiroId) {
        biroId = userBiroId
      }
    }
    return biroId
  }

  getDashboardChart = async (
    request: FastifyRequest<{ Querystring: { period?: string; biroId?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const biroId = await this.resolveBiroId(request)
      const data = await this.service.getDashboardChartData(request.query?.period, biroId)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getDashboardMetrics = async (
    request: FastifyRequest<{ Querystring: { biroId?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const biroId = await this.resolveBiroId(request)
      const data = await this.service.getDashboardMetrics(biroId)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getDashboardTodaySessions = async (
    request: FastifyRequest<{ Querystring: { limit?: string; biroId?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const biroId = await this.resolveBiroId(request)
      const limit = request.query?.limit ? parseInt(request.query.limit, 10) : 5
      const data = await this.service.getDashboardTodaySessions(isNaN(limit) ? 5 : limit, biroId)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getDashboardRecentTransactions = async (
    request: FastifyRequest<{ Querystring: { limit?: string; biroId?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const biroId = await this.resolveBiroId(request)
      const limit = request.query?.limit ? parseInt(request.query.limit, 10) : 5
      const data = await this.service.getDashboardRecentTransactions(isNaN(limit) ? 5 : limit, biroId)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getDashboardAgenda = async (
    request: FastifyRequest<{ Querystring: { limit?: string; biroId?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const biroId = await this.resolveBiroId(request)
      const limit = request.query?.limit ? parseInt(request.query.limit, 10) : 6
      const data = await this.service.getDashboardAgenda(isNaN(limit) ? 6 : limit, biroId)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getJadwal = async (
    request: FastifyRequest<{ Querystring: GetAdminJadwalQuery & { biroId?: string; id_biro?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const biroId = await this.resolveBiroId(request)
      const data = await this.service.getJadwalOverview({
        ...request.query,
        ...(biroId ? { id_biro: biroId } : {}),
      })
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  createJadwalSlot = async (
    request: FastifyRequest<{ Body: CreateAdminJadwalSlotInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.createJadwalSlot(request.body)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  deleteJadwalSlot = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id?: string; role?: string } | undefined
      await this.service.deleteJadwalSlot(request.params.id, user?.id, user?.role || 'ADMIN')
      reply.code(204).send()
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  createSesi = async (
    request: FastifyRequest<{ Body: CreateAdminSesiInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.createAdminSesi(request.body)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  updateBookingStatus = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateBookingStatusInput }>,
    reply: FastifyReply
  ) => {
    try {
      const body = request.body as UpdateBookingStatusInput
      const data = await this.service.updateBookingStatus(request.params.id, body.status)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  rescheduleBooking = async (
    request: FastifyRequest<{ Params: { id: string }; Body: RescheduleBookingInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.rescheduleBooking(request.params.id, request.body)
      reply.send({
        statusCode: 200,
        message: 'Sesi booking berhasil dijadwalkan ulang (reschedule)',
        data,
      })
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  // ── Profil Admin Utama ──────────────────────────────────────────
  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as { id: string; role: string }
      const data = await this.service.getProfile(user?.id)
      reply.send({ success: true, data })
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ error: err.name || 'Error', message: err.message })
    }
  }

  updateProfile = async (
    request: FastifyRequest<{ Body: UpdateAdminProfileInput }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id: string; role: string }
      if (user?.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden', message: 'Hanya Admin Utama yang berwenang mengubah profil' })
      }
      const data = await this.service.updateProfile(user.id, request.body)
      reply.send({ success: true, message: 'Profil Admin Utama berhasil diperbarui', data })
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ error: err.name || 'Error', message: err.message })
    }
  }

  getPublicProfile = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getPublicProfile()
      reply.send({ success: true, data })
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ error: err.name || 'Error', message: err.message })
    }
  }

  getAll = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.send([])
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    reply.send({ id: request.params.id })
  }

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.code(201).send(request.body)
  }

  update = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    reply.send({ id: request.params.id })
  }

  resendActivation = async (
    request: FastifyRequest<{ Body: ResendActivationInput }>,
    reply: FastifyReply
  ) => {
    try {
      const { accountId } = request.body
      if (!accountId) {
        return reply.code(400).send({ error: 'Bad Request', message: 'accountId wajib disertakan' })
      }
      const account = await this.fastify.prisma.account.findUnique({
        where: { id: accountId },
      })
      if (!account) {
        return reply.code(404).send({ error: 'Not Found', message: 'Akun tidak ditemukan' })
      }

      // Validasi akun sudah aktif
      if (account.aktif && account.password) {
        return reply.code(409).send({
          error: 'Conflict',
          errorCode: 'ACCOUNT_ALREADY_ACTIVE',
          message: 'Akun sudah aktif. Tidak perlu melakukan generate ulang link aktivasi.',
        })
      }

      // Validasi link belum kedaluwarsa (3 hari)
      const now = Date.now()
      if (account.token_aktivasi && account.token_aktivasi_exp) {
        const expTime = new Date(account.token_aktivasi_exp).getTime()
        if (expTime > now) {
          const remainingMs = expTime - now
          const remainingStr = formatRemainingTime(remainingMs)
          const expDateFormatted = formatExpiryWib(account.token_aktivasi_exp)

          return reply.code(429).send({
            error: 'Too Many Requests',
            errorCode: 'LINK_STILL_ACTIVE',
            message: `Link aktivasi masih berlaku. Generate ulang baru bisa dilakukan setelah ${expDateFormatted}.`,
            tokenExpiredAt: new Date(account.token_aktivasi_exp).toISOString(),
            remainingSeconds: Math.ceil(remainingMs / 1000),
            remainingFormatted: remainingStr,
          })
        }
      }

      const { token: newToken, expiresAt: newExpiry } = issueActivationToken()

      await this.fastify.prisma.account.update({
        where: { id: account.id },
        data: {
          token_aktivasi: newToken,
          token_aktivasi_exp: newExpiry,
        },
      })

      return reply.code(200).send({
        success: true,
        message: 'Tautan aktivasi baru berhasil dibuat',
        token: newToken,
        tokenExpiredAt: newExpiry.toISOString(),
        activationUrl: buildActivationUrl(newToken),
        account: withActivationAccount({
          ...account,
          token_aktivasi: newToken,
          token_aktivasi_exp: newExpiry,
        }),
      })
    } catch (err: any) {
      return reply.code(500).send({ error: 'Internal Server Error', message: err.message })
    }
  }

  remove = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.code(204).send()
  }

  getTentangKamiPublic = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getTentangKami()
      return reply.code(200).send({
        success: true,
        data,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal mengambil konten Tentang Kami',
        error: err.message,
      })
    }
  }

  getTentangKami = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getTentangKami()
      return reply.code(200).send({
        success: true,
        data,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal mengambil konfigurasi Tentang Kami',
        error: err.message,
      })
    }
  }

  updateTentangKami = async (
    request: FastifyRequest<{ Body: UpdateTentangKamiInput }>,
    reply: FastifyReply
  ) => {
    try {
      const updated = await this.service.updateTentangKami(request.body)
      return reply.code(200).send({
        success: true,
        message: 'Konten Tentang Kami berhasil disimpan',
        data: updated,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal menyimpan konfigurasi Tentang Kami',
        error: err.message,
      })
    }
  }

  // ── Modul Banner Promosi Hero Beranda ───────────────────────────
  getHeroBannersPublic = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getHeroBannersPublic()
      return reply.code(200).send({
        success: true,
        data,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal mengambil banner promosi publik',
        error: err.message,
      })
    }
  }

  getHeroBanners = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getHeroBanners()
      return reply.code(200).send({
        success: true,
        data,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal mengambil konfigurasi banner promosi',
        error: err.message,
      })
    }
  }

  updateHeroBanners = async (
    request: FastifyRequest<{ Body: UpdateHeroBannersInput }>,
    reply: FastifyReply
  ) => {
    try {
      const updated = await this.service.updateHeroBanners(request.body)
      return reply.code(200).send({
        success: true,
        message: 'Banner promosi beranda berhasil disimpan',
        data: updated,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal menyimpan konfigurasi banner promosi',
        error: err.message,
      })
    }
  }

  // ── Modul Manajemen Internship ──────────────────────────────────
  getInternshipPublic = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getInternship(true) // Hanya yang isOpen
      return reply.code(200).send({
        success: true,
        data,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal mengambil daftar posisi internship publik',
        error: err.message,
      })
    }
  }

  getInternship = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getInternship(false) // Seluruh posisi untuk admin
      return reply.code(200).send({
        success: true,
        data,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal mengambil daftar posisi internship untuk admin',
        error: err.message,
      })
    }
  }

  createInternship = async (
    request: FastifyRequest<{ Body: CreateInternshipPositionInput }>,
    reply: FastifyReply
  ) => {
    try {
      const created = await this.service.createInternship(request.body)
      return reply.code(201).send({
        success: true,
        message: 'Posisi internship berhasil ditambahkan ke database',
        data: created,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal menambahkan posisi internship ke database',
        error: err.message,
      })
    }
  }

  updateInternshipItem = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateInternshipPositionInput }>,
    reply: FastifyReply
  ) => {
    try {
      const updated = await this.service.updateInternshipPosition(request.params.id, request.body)
      return reply.code(200).send({
        success: true,
        message: 'Posisi internship berhasil diperbarui di database',
        data: updated,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal memperbarui posisi internship',
        error: err.message,
      })
    }
  }

  toggleInternshipStatus = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const updated = await this.service.toggleInternshipStatus(request.params.id)
      return reply.code(200).send({
        success: true,
        message: 'Status visibilitas posisi internship berhasil diubah',
        data: updated,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal mengubah status posisi internship',
        error: err.message,
      })
    }
  }

  deleteInternship = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      await this.service.deleteInternship(request.params.id)
      return reply.code(200).send({
        success: true,
        message: 'Posisi internship berhasil dihapus dari database',
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal menghapus posisi internship',
        error: err.message,
      })
    }
  }

  updateInternship = async (
    request: FastifyRequest<{ Body: UpdateInternshipPositionsInput }>,
    reply: FastifyReply
  ) => {
    try {
      const updated = await this.service.syncAllInternshipPositions(request.body.positions)
      return reply.code(200).send({
        success: true,
        message: 'Daftar posisi internship berhasil disimpan ke database',
        data: updated,
      })
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: 'Gagal memperbarui posisi internship',
        error: err.message,
      })
    }
  }
}
