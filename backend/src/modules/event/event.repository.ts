import type { PrismaClient, Prisma, JenisEvent, StatusEvent, TipeEvent } from '@prisma/client'
import type { CreateEventInput, UpdateEventInput } from './event.schema'

export interface EventQueryInput {
  page?: number
  limit?: number
  search?: string
  jenis_event?: JenisEvent
  tipe_event?: TipeEvent
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

    if (query?.tipe_event) {
      where.tipe_event = query.tipe_event
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
        harga_coret: item.harga_coret ? item.harga_coret.toString() : null,
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
      harga_coret: item.harga_coret ? item.harga_coret.toString() : null,
      jumlah_booking: item._count.booking_event,
      sisa_kuota: item.kuota - item._count.booking_event,
    }
  }

  async create(data: CreateEventInput) {
    // Parse tanggal dan jam_mulai menjadi objek Date yang kompatibel dengan Prisma @db.Date dan @db.Time
    const tanggalDate = new Date(`${data.tanggal}T00:00:00.000Z`)
    const jamMulaiDate = new Date(`1970-01-01T${data.jam_mulai}:00.000Z`)

    const isOnline = data.tipe_event === 'ONLINE'
    const linkMeet = isOnline ? (data.link_meet || null) : null

    const created = await this.prisma.event.create({
      data: {
        judul: data.judul,
        jenis_event: data.jenis_event,
        tipe_event: data.tipe_event ?? 'ONLINE',
        link_meet: linkMeet,
        link_wa: data.link_wa || null,
        deskripsi: data.deskripsi,
        tanggal: tanggalDate,
        jam_mulai: jamMulaiDate,
        durasi_menit: data.durasi_menit,
        lokasi: data.lokasi ?? null,
        kuota: data.kuota,
        harga: data.harga,
        harga_coret: data.harga_coret !== undefined && data.harga_coret !== null ? data.harga_coret : null,
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
      harga_coret: created.harga_coret ? created.harga_coret.toString() : null,
      jumlah_booking: created._count.booking_event,
      sisa_kuota: created.kuota - created._count.booking_event,
    }
  }

  async update(id: string, data: UpdateEventInput) {
    const updateData: Prisma.EventUpdateInput = {}

    if (data.judul !== undefined) updateData.judul = data.judul
    if (data.jenis_event !== undefined) updateData.jenis_event = data.jenis_event
    if (data.tipe_event !== undefined) {
      updateData.tipe_event = data.tipe_event
      // Jika diupdate jadi OFFLINE, otomatis bersihkan link_meet
      if (data.tipe_event === 'OFFLINE') {
        updateData.link_meet = null
      }
    }
    if (data.link_meet !== undefined) {
      // Jika tipe_event sedang diubah jadi OFFLINE atau tidak ditentukan tetapi form mengirimkan nilai
      if (data.tipe_event === 'OFFLINE') {
        updateData.link_meet = null
      } else {
        updateData.link_meet = data.link_meet || null
      }
    }
    if (data.link_wa !== undefined) updateData.link_wa = data.link_wa || null
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi
    if (data.tanggal !== undefined) updateData.tanggal = new Date(`${data.tanggal}T00:00:00.000Z`)
    if (data.jam_mulai !== undefined)
      updateData.jam_mulai = new Date(`1970-01-01T${data.jam_mulai}:00.000Z`)
    if (data.durasi_menit !== undefined) updateData.durasi_menit = data.durasi_menit
    if (data.lokasi !== undefined) updateData.lokasi = data.lokasi
    if (data.kuota !== undefined) updateData.kuota = data.kuota
    if (data.harga !== undefined) updateData.harga = data.harga
    if (data.harga_coret !== undefined) {
      updateData.harga_coret = data.harga_coret !== null ? data.harga_coret : null
    }
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
      harga_coret: updated.harga_coret ? updated.harga_coret.toString() : null,
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
