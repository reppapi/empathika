import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { AdminService } from './admin.service'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
  UpdateBookingStatusInput,
  UpdateAdminProfileInput,
  ResendActivationInput,
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

  getDashboardChart = async (
    request: FastifyRequest<{ Querystring: { period?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.getDashboardChartData(request.query?.period)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getDashboardMetrics = async (
    _request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.getDashboardMetrics()
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getDashboardTodaySessions = async (
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const limit = request.query?.limit ? parseInt(request.query.limit, 10) : 5
      const data = await this.service.getDashboardTodaySessions(isNaN(limit) ? 5 : limit)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getDashboardRecentTransactions = async (
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const limit = request.query?.limit ? parseInt(request.query.limit, 10) : 5
      const data = await this.service.getDashboardRecentTransactions(isNaN(limit) ? 5 : limit)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getDashboardAgenda = async (
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const limit = request.query?.limit ? parseInt(request.query.limit, 10) : 6
      const data = await this.service.getDashboardAgenda(isNaN(limit) ? 6 : limit)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getJadwal = async (
    request: FastifyRequest<{ Querystring: GetAdminJadwalQuery }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.getJadwalOverview(request.query)
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
}
