import type { PrismaClient, Prisma } from '@prisma/client'
import type { CreateEventInput, UpdateEventInput, EventQueryInput } from './event.schema'

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
        orderBy: { tanggal: 'asc' },
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
    const item = await this.prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { booking_event: true },
        },
      },
    })

    if (!item) return null

    return {
      ...item,
      harga: item.harga.toString(),
      jumlah_booking: item._count.booking_event,
      sisa_kuota: item.kuota - item._count.booking_event,
    }
  }

  async create(data: CreateEventInput) {
    // Parse tanggal dan jam_mulai menjadi objek Date yang kompatibel dengan Prisma @db.Date dan @db.Time
    const tanggalDate = new Date(`${data.tanggal}T00:00:00.000Z`)
    const jamMulaiDate = new Date(`1970-01-01T${data.jam_mulai}:00.000Z`)

    const created = await this.prisma.event.create({
      data: {
        judul: data.judul,
        jenis_event: data.jenis_event,
        deskripsi: data.deskripsi,
        tanggal: tanggalDate,
        jam_mulai: jamMulaiDate,
        durasi_menit: data.durasi_menit,
        lokasi: data.lokasi ?? null,
        kuota: data.kuota,
        harga: data.harga,
        banner_url: data.banner_url ?? null,
        nama_pembicara: data.nama_pembicara,
        status: data.status ?? 'UPCOMING',
      },
      include: {
        _count: {
          select: { booking_event: true },
        },
      },
    })

    return {
      ...created,
      harga: created.harga.toString(),
      jumlah_booking: created._count.booking_event,
      sisa_kuota: created.kuota - created._count.booking_event,
    }
  }

  async update(id: string, data: UpdateEventInput) {
    const updateData: Prisma.EventUpdateInput = {}

    if (data.judul !== undefined) updateData.judul = data.judul
    if (data.jenis_event !== undefined) updateData.jenis_event = data.jenis_event
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi
    if (data.tanggal !== undefined) updateData.tanggal = new Date(`${data.tanggal}T00:00:00.000Z`)
    if (data.jam_mulai !== undefined)
      updateData.jam_mulai = new Date(`1970-01-01T${data.jam_mulai}:00.000Z`)
    if (data.durasi_menit !== undefined) updateData.durasi_menit = data.durasi_menit
    if (data.lokasi !== undefined) updateData.lokasi = data.lokasi
    if (data.kuota !== undefined) updateData.kuota = data.kuota
    if (data.harga !== undefined) updateData.harga = data.harga
    if (data.banner_url !== undefined) updateData.banner_url = data.banner_url
    if (data.nama_pembicara !== undefined) updateData.nama_pembicara = data.nama_pembicara
    if (data.status !== undefined) updateData.status = data.status

    const updated = await this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { booking_event: true },
        },
      },
    })

    return {
      ...updated,
      harga: updated.harga.toString(),
      jumlah_booking: updated._count.booking_event,
      sisa_kuota: updated.kuota - updated._count.booking_event,
    }
  }

  async delete(id: string) {
    return this.prisma.event.delete({
      where: { id },
    })
  }

  async countBookings(id: string) {
    return this.prisma.bookingEvent.count({
      where: { id_event: id },
    })
  }
}
