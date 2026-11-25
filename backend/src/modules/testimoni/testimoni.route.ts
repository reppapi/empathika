import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { adminOrBiroGuard } from '../../middlewares/admin-guard'

const createTestimoniInputSchema = z.object({
  bookingId: z.string().uuid(),
})

const submitTestimoniSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  isi: z.string().trim().min(5, 'Testimoni minimal 5 karakter').max(1000, 'Testimoni maksimal 1000 karakter'),
})

export default async function testimoniRoutes(fastify: FastifyInstance) {
  const prisma: any = fastify.prisma

  // 1. Generate link testimoni khusus Admin & Biro
  fastify.post('/generate-link', {
    preHandler: [adminOrBiroGuard],
    schema: {
      tags: ['Testimoni'],
      summary: 'Admin generate link testimoni untuk sesi yang telah selesai',
      security: [{ bearerAuth: [] }],
      body: createTestimoniInputSchema,
    },
    handler: async (request: FastifyRequest<{ Body: { bookingId: string } }>, reply: FastifyReply) => {
      try {
        const { bookingId } = request.body

        // Cek booking
        const booking = await prisma.bookingKonsultasi.findUnique({
          where: { id: bookingId },
          include: {
            client: true,
            jadwal: {
              include: {
                psikolog: true,
              },
            },
            testimoni: true,
          },
        })

        if (!booking) {
          return reply.code(404).send({ success: false, message: 'Data booking tidak ditemukan' })
        }

        // Cek status harus COMPLETED atau tanggal sesi sudah lewat
        if (booking.status !== 'COMPLETED') {
          await prisma.bookingKonsultasi.update({
            where: { id: bookingId },
            data: { status: 'COMPLETED' },
          })
        }

        // Jika sudah ada testimoni record, gunakan token yang ada
        let testimoni = booking.testimoni
        if (!testimoni) {
          testimoni = await prisma.testimoni.create({
            data: {
              id_booking: bookingId,
            },
          })
        }

        return reply.send({
          success: true,
          data: {
            token: testimoni.token,
            is_submitted: testimoni.is_submitted,
            rating: testimoni.rating,
            isi: testimoni.isi,
            namaKlien: booking.client?.nama || 'Klien',
            noTelepon: booking.client?.no_telepon || '',
            namaPsikolog: booking.jadwal?.psikolog?.nama_gelar || 'Psikolog Empathika',
          },
        })
      } catch (err: any) {
        return reply.code(500).send({ success: false, message: err.message })
      }
    },
  })

  // 2. Ambil detail info sesi sebelum mengisi testimoni (Public via token)
  fastify.get('/:token', {
    schema: {
      tags: ['Testimoni'],
      summary: 'Get info sesi berdasarkan token link unik testimoni',
      params: z.object({ token: z.string() }),
    },
    handler: async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
      try {
        const { token } = request.params

        const testimoni = await prisma.testimoni.findUnique({
          where: { token },
          include: {
            booking: {
              include: {
                client: { select: { nama: true } },
                layanan: { select: { nama: true } },
                jadwal: {
                  include: {
                    psikolog: {
                      select: {
                        id: true,
                        nama_gelar: true,
                        foto: true,
                        kategori: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })

        if (!testimoni) {
          return reply.code(404).send({ success: false, message: 'Link testimoni tidak valid atau tidak ditemukan' })
        }

        const clientName: string = testimoni.booking?.client?.nama || 'Klien'
        // Sensor nama klien untuk privasi (contoh: John Doe -> J*** D**)
        const disguisedName = clientName
          .split(' ')
          .map((part: string) => (part.length > 1 ? part[0] + '*'.repeat(part.length - 1) : part))
          .join(' ')

        return reply.send({
          success: true,
          data: {
            token: testimoni.token,
            is_submitted: testimoni.is_submitted,
            rating: testimoni.rating,
            isi: testimoni.isi,
            submitted_at: testimoni.submitted_at,
            clientName: disguisedName,
            layanan: testimoni.booking?.layanan?.nama || 'Konseling Empathika',
            psikolog: {
              nama: testimoni.booking?.jadwal?.psikolog?.nama_gelar || 'Psikolog Empathika',
              foto: testimoni.booking?.jadwal?.psikolog?.foto || '/images/psikolog/default.jpg',
              kategori: testimoni.booking?.jadwal?.psikolog?.kategori || 'Psikolog',
            },
          },
        })
      } catch (err: any) {
        return reply.code(500).send({ success: false, message: err.message })
      }
    },
  })

  // 3. Submit testimoni oleh client (Public via token)
  fastify.post('/:token', {
    schema: {
      tags: ['Testimoni'],
      summary: 'Client submit ulasan testimoni & rating bintang 1-5',
      params: z.object({ token: z.string() }),
      body: submitTestimoniSchema,
    },
    handler: async (
      request: FastifyRequest<{ Params: { token: string }; Body: { rating: number; isi: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { token } = request.params
        const { rating, isi } = request.body

        const existing = await prisma.testimoni.findUnique({
          where: { token },
        })

        if (!existing) {
          return reply.code(404).send({ success: false, message: 'Link testimoni tidak valid' })
        }

        if (existing.is_submitted) {
          return reply.code(400).send({
            success: false,
            message: 'Testimoni untuk sesi ini sudah pernah dikirimkan sebelumnya.',
          })
        }

        const updated = await prisma.testimoni.update({
          where: { token },
          data: {
            rating: Math.min(Math.max(rating, 1), 5),
            isi: isi.trim(),
            is_submitted: true,
            submitted_at: new Date(),
          },
        })

        return reply.send({
          success: true,
          message: 'Terima kasih! Testimoni Anda berhasil dikirimkan.',
          data: updated,
        })
      } catch (err: any) {
        return reply.code(500).send({ success: false, message: err.message })
      }
    },
  })

  // 4. Get list testimoni per psikolog untuk halaman profil publik
  fastify.get('/psikolog/:psikologId', {
    schema: {
      tags: ['Testimoni'],
      summary: 'Ambil semua testimoni terbit untuk profil psikolog tertentu',
      params: z.object({ psikologId: z.string() }),
    },
    handler: async (request: FastifyRequest<{ Params: { psikologId: string } }>, reply: FastifyReply) => {
      try {
        const { psikologId } = request.params

        const list = await prisma.testimoni.findMany({
          where: {
            is_submitted: true,
            booking: {
              jadwal: {
                id_psikolog: psikologId,
              },
            },
          },
          include: {
            booking: {
              select: {
                client: { select: { nama: true } },
                layanan: { select: { nama: true } },
              },
            },
          },
          orderBy: {
            submitted_at: 'desc',
          },
        })

        const mapped = list.map((t: any) => {
          const rawName: string = t.booking?.client?.nama || 'Klien Empathika'
          // Anonimkan sebagian (Contoh: "D*** P***")
          const disguised = rawName
            .split(' ')
            .map((w: string) => (w.length > 1 ? w[0] + '*'.repeat(Math.min(w.length - 1, 4)) : w))
            .join(' ')

          return {
            id: t.id,
            rating: t.rating || 5,
            isi: t.isi || '',
            pemberi: disguised,
            layanan: t.booking?.layanan?.nama || 'Konseling',
            tanggal: t.submitted_at || t.createdAt,
          }
        })

        return reply.send({
          success: true,
          data: mapped,
        })
      } catch (err: any) {
        return reply.code(500).send({ success: false, message: err.message })
      }
    },
  })
}
