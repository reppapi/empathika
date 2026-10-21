import type { PrismaClient, Prisma, JenisEvent, StatusEvent } from '@prisma/client'
import type { CreateEventInput, UpdateEventInput } from './event.schema'

export interface EventQueryInput {
  page?: number
  limit?: number
  search?: string
  jenis_event?: JenisEvent
  status?: StatusEvent
}

export class EventRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(query?: EventQueryInput) {
    const page = query?.page ?? 1
    const limit = query?.limit ?? 10
    const skip = (page - 1) * limit

    const where: Prisma.EventWhereInput = {}

    if (query?.search) {
      where.OR = [
        { judul: { contains: query.search, mode: 'insensitive' } },
        { deskripsi: { contains: query.search, mode: 'insensitive' } },
        { nama_pembicara: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query?.jenis_event) {
      where.jenis_event = query.jenis_event
    }

    if (query?.status) {
      where.status = query.status
    }

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { tanggal: 'desc' },
          { jam_mulai: 'desc' },
        ],
        include: {
          _count: {
            select: { booking_event: true },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ])

    return {
      items: items.map((item) => ({
        ...item,
        harga: item.harga.toString(),
        jumlah_booking: item._count.booking_event,
        sisa_kuota: item.kuota - item._count.booking_event,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string) {
    // TODO: Implement query
    return null
  }

  async create(data: CreateEventInput) {
    // TODO: Implement
    return null
  }

  async update(id: string, data: UpdateEventInput) {
    // TODO: Implement
    return null
  }

  async delete(id: string) {
    // TODO: Implement
    return null
  }
}
