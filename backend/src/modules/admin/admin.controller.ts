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

function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '0 detik'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days} hari`)
  if (hours > 0) parts.push(`${hours} jam`)
  if (minutes > 0 && days === 0) parts.push(`${minutes} menit`)
  if (parts.length === 0) return 'kurang dari 1 menit'
  return parts.join(' ')
}

export class AdminController {
  private service: AdminService
  private fastify: FastifyInstance

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
    this.service = new AdminService(fastify)
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
        return reply.code(400).send({
          error: 'Bad Request',
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
          const expDateFormatted = new Date(account.token_aktivasi_exp).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          return reply.code(429).send({
            error: 'Too Many Requests',
            errorCode: 'LINK_STILL_ACTIVE',
            message: `Link aktivasi masih berlaku. Generate ulang baru bisa dilakukan setelah ${expDateFormatted}.`,
            tokenExpiredAt: account.token_aktivasi_exp,
            remainingSeconds: Math.ceil(remainingMs / 1000),
            remainingFormatted: remainingStr,
          })
        }
      }

      const crypto = await import('crypto')
      const newToken = `act_${crypto.randomBytes(20).toString('hex')}`
      const newExpiry = new Date(now + 3 * 24 * 60 * 60 * 1000)

      await this.fastify.prisma.account.update({
        where: { id: account.id },
        data: {
          token_aktivasi: newToken,
          token_aktivasi_exp: newExpiry,
        },
      })

      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      const activationUrl = `${frontendBaseUrl}/set-password?token=${newToken}`

      return reply.code(200).send({
        success: true,
        message: 'Tautan aktivasi baru berhasil dibuat',
        token: newToken,
        tokenExpiredAt: newExpiry.toISOString(),
        activationUrl,
        account: {
          id: account.id,
          nama: account.nama,
          email: account.email,
          no_telepon: account.no_telepon,
          role: account.role,
          aktif: account.aktif,
        },
      })
    } catch (err: any) {
      return reply.code(500).send({ error: 'Internal Server Error', message: err.message })
    }
  }

  remove = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.code(204).send()
  }
}
