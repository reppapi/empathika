import { Prisma } from '@prisma/client'
import type { PrismaClient, JenisEvent, StatusEvent, TipeEvent } from '@prisma/client'
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

  /**
   * Otomatis sinkronisasi status event & buat entri EventDokumentasi:
   * - Jika tanggal & jam selesai event sudah lewat → update status ke COMPLETED
   * - Jika belum ada entri EventDokumentasi untuk event tersebut → buat otomatis
   *   (dengan judul, tanggal, deskripsi, dan banner_url sebagai foto pertama)
   */
  async autoUpdatePassedEvents() {
    try {
      const activeEvents = await this.prisma.event.findMany({
        where: {
          status: { in: ['UPCOMING', 'ONGOING'] },
        },
        select: {
          id: true,
          judul: true,
          tanggal: true,
          jam_mulai: true,
          durasi_menit: true,
          deskripsi: true,
          banner_url: true,
        },
      })

      const now = new Date()
      const passedEvents: typeof activeEvents = []

      for (const ev of activeEvents) {
        const tgl = new Date(ev.tanggal)
        const jam = new Date(ev.jam_mulai)
        // Gunakan UTC konsisten: gabungkan tanggal (UTC) + jam (UTC) + durasi
        const endTimeMs =
          Date.UTC(
            tgl.getUTCFullYear(),
            tgl.getUTCMonth(),
            tgl.getUTCDate(),
            jam.getUTCHours(),
            jam.getUTCMinutes() + (ev.durasi_menit || 0)
          )
        const endTime = new Date(endTimeMs)
        if (endTime <= now) {
          passedEvents.push(ev)
        }
      }

      if (passedEvents.length > 0) {
        const passedIds = passedEvents.map((ev) => ev.id)

        // 1. Update status event ke COMPLETED (status tetap tampil "Selesai" di admin)
        await this.prisma.event.updateMany({
          where: { id: { in: passedIds } },
          data: { status: 'COMPLETED' },
        })

        // 2. Untuk setiap event yang baru selesai, buat entri EventDokumentasi
        //    jika belum ada (dicek berdasarkan kesamaan judul + tanggal)
        for (const ev of passedEvents) {
          const existing = await this.prisma.eventDokumentasi.findFirst({
            where: {
              judul: ev.judul,
              tanggal: ev.tanggal,
            },
          })

          if (!existing) {
            const created = await this.prisma.eventDokumentasi.create({
              data: {
                judul: ev.judul,
                tanggal: ev.tanggal,
                deskripsi: ev.deskripsi || '',
              },
            })

            // Tambahkan banner_url sebagai foto pertama jika ada
            if (ev.banner_url) {
              await this.prisma.eventDokumentasiFoto.create({
                data: {
                  id_event_dokumentasi: created.id,
                  foto_url: ev.banner_url,
                  urutan: 0,
                },
              })
            }
          }
        }
      }
    } catch (err) {
      console.warn('Gagal memperbarui status event yang sudah terlewat:', err)
    }
  }

  async findAll(query?: EventQueryInput) {
    // Sinkronisasi otomatis saat query dijalankan
    await this.autoUpdatePassedEvents()

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
          booking_event: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] },
            },
            select: {
              jumlah_peserta: true,
            },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ])

    return {
      items: items.map((item) => {
        const totalPesertaBooked = item.booking_event.reduce((acc, curr) => acc + (curr.jumlah_peserta || 1), 0)
        const { booking_event, ...eventData } = item
        return {
          ...eventData,
          harga: item.harga.toString(),
          harga_coret: item.harga_coret ? item.harga_coret.toString() : null,
          harga_bundling: item.harga_bundling ? item.harga_bundling.toString() : null,
          kuota_tiket_bundling: item.kuota_tiket_bundling ?? 2,
          nama_bundling: item.nama_bundling ?? null,
          paket_bundling: item.paket_bundling ?? null,
          jumlah_booking: totalPesertaBooked,
          sisa_kuota: item.kuota - totalPesertaBooked,
        }
      }),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string) {
    await this.autoUpdatePassedEvents()
    const item = await this.prisma.event.findUnique({
      where: { id },
      include: {
        booking_event: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          select: {
            jumlah_peserta: true,
          },
        },
      },
    })

    if (!item) return null

    const totalPesertaBooked = item.booking_event.reduce((acc, curr) => acc + (curr.jumlah_peserta || 1), 0)
    const { booking_event, ...eventData } = item

    return {
      ...eventData,
      harga: item.harga.toString(),
      harga_coret: item.harga_coret ? item.harga_coret.toString() : null,
      harga_bundling: item.harga_bundling ? item.harga_bundling.toString() : null,
      kuota_tiket_bundling: item.kuota_tiket_bundling ?? 2,
      nama_bundling: item.nama_bundling ?? null,
      paket_bundling: item.paket_bundling ?? null,
      jumlah_booking: totalPesertaBooked,
      sisa_kuota: item.kuota - totalPesertaBooked,
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
        harga_bundling: data.harga_bundling !== undefined && data.harga_bundling !== null ? data.harga_bundling : null,
        kuota_tiket_bundling: data.kuota_tiket_bundling !== undefined && data.kuota_tiket_bundling !== null ? data.kuota_tiket_bundling : 2,
        nama_bundling: data.nama_bundling ?? null,
        paket_bundling: data.paket_bundling !== undefined && data.paket_bundling !== null ? (data.paket_bundling as Prisma.InputJsonValue) : Prisma.JsonNull,
        banner_url: data.banner_url ?? null,
        nama_pembicara: data.nama_pembicara,
        status: data.status ?? 'UPCOMING',
      },
      include: {
        booking_event: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          select: {
            jumlah_peserta: true,
          },
        },
      },
    })

    const totalPesertaCreated = created.booking_event.reduce((acc, curr) => acc + (curr.jumlah_peserta || 1), 0)
    const { booking_event: createdBookings, ...createdEventData } = created

    return {
      ...createdEventData,
      harga: created.harga.toString(),
      harga_coret: created.harga_coret ? created.harga_coret.toString() : null,
      harga_bundling: created.harga_bundling ? created.harga_bundling.toString() : null,
      kuota_tiket_bundling: created.kuota_tiket_bundling ?? 2,
      nama_bundling: created.nama_bundling ?? null,
      paket_bundling: created.paket_bundling ?? null,
      jumlah_booking: totalPesertaCreated,
      sisa_kuota: created.kuota - totalPesertaCreated,
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
    if (data.harga_bundling !== undefined) {
      updateData.harga_bundling = data.harga_bundling !== null ? data.harga_bundling : null
    }
    if (data.kuota_tiket_bundling !== undefined) {
      updateData.kuota_tiket_bundling = data.kuota_tiket_bundling !== null ? data.kuota_tiket_bundling : 2
    }
    if (data.nama_bundling !== undefined) {
      updateData.nama_bundling = data.nama_bundling !== null ? data.nama_bundling : null
    }
    if (data.paket_bundling !== undefined) {
      updateData.paket_bundling = data.paket_bundling !== null ? (data.paket_bundling as Prisma.InputJsonValue) : Prisma.JsonNull
    }
    if (data.banner_url !== undefined) updateData.banner_url = data.banner_url
    if (data.nama_pembicara !== undefined) updateData.nama_pembicara = data.nama_pembicara
    if (data.status !== undefined) updateData.status = data.status

    const updated = await this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        booking_event: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          select: {
            jumlah_peserta: true,
          },
        },
      },
    })

    const totalPesertaUpdated = updated.booking_event.reduce((acc, curr) => acc + (curr.jumlah_peserta || 1), 0)
    const { booking_event: updatedBookings, ...updatedEventData } = updated

    return {
      ...updatedEventData,
      harga: updated.harga.toString(),
      harga_coret: updated.harga_coret ? updated.harga_coret.toString() : null,
      harga_bundling: updated.harga_bundling ? updated.harga_bundling.toString() : null,
      kuota_tiket_bundling: updated.kuota_tiket_bundling ?? 2,
      nama_bundling: updated.nama_bundling ?? null,
      paket_bundling: updated.paket_bundling ?? null,
      jumlah_booking: totalPesertaUpdated,
      sisa_kuota: updated.kuota - totalPesertaUpdated,
    }
  }

  async delete(id: string) {
    return this.prisma.event.delete({
      where: { id },
    })
  }

  async countBookings(id: string) {
    const agg = await this.prisma.bookingEvent.aggregate({
      where: {
        id_event: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      _sum: {
        jumlah_peserta: true,
      },
    })
    return agg._sum.jumlah_peserta || 0
  }
}
