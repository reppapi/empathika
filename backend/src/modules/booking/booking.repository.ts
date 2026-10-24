import type { PrismaClient, Prisma, StatusBooking } from '@prisma/client'
import { parseDateString } from '../../utils/date-time'
import { generateOrderId } from '../../utils'

export class BookingRepository {
  constructor(private prisma: PrismaClient) {}

  // ── 1. Slot Ketersediaan & Kalender ──────────────────────────────────────────

  async findJadwalSlots(params?: { date?: string; layanan?: string; status?: string }) {
    const where: Prisma.JadwalSlotWhereInput = {}

    if (params?.date) {
      where.tanggal = parseDateString(params.date)
    }

    if (params?.status && params.status !== 'semua') {
      if (params.status === 'TERSEDIA' || params.status === 'SUDAH_DIBOOKING' || params.status === 'TIDAK_TERSEDIA') {
        where.status = params.status as any
      }
    }

    return this.prisma.jadwalSlot.findMany({
      where,
      include: {
        psikolog: {
          select: {
            id: true,
            nama_gelar: true,
            kategori: true,
            foto: true,
            spesialisasi: {
              select: { nama: true },
            },
          },
        },
        booking_konsultasi: {
          include: {
            client: true,
            layanan: true,
          },
        },
      },
      orderBy: [
        { tanggal: 'asc' },
        { jam_mulai: 'asc' },
      ],
    })
  }

  async findTodaySessions(date: Date) {
    return this.prisma.bookingKonsultasi.findMany({
      where: {
        jadwal: {
          tanggal: date,
        },
      },
      include: {
        client: true,
        layanan: true,
        transaksi: true,
        jadwal: {
          include: {
            psikolog: true,
          },
        },
      },
      orderBy: {
        jadwal: {
          jam_mulai: 'asc',
        },
      },
    })
  }

  async findOverlappingSlot(id_psikolog: string, tanggal: Date, jam_mulai: Date, jam_selesai: Date) {
    return this.prisma.jadwalSlot.findFirst({
      where: {
        id_psikolog,
        tanggal,
        OR: [
          {
            jam_mulai: { lte: jam_mulai },
            jam_selesai: { gt: jam_mulai },
          },
          {
            jam_mulai: { lt: jam_selesai },
            jam_selesai: { gte: jam_selesai },
          },
        ],
      },
    })
  }

  async findJadwalTersedia(params: {
    tanggal?: string
    id_psikolog?: string
    tipe_jadwal?: string
  }) {
    const where: Prisma.JadwalSlotWhereInput = {
      status: 'TERSEDIA',
      tipe_jadwal: params.tipe_jadwal || 'KONSULTASI',
      NOT: {
        id: { startsWith: 'slot-' },
      },
    }

    if (params.tanggal) {
      where.tanggal = parseDateString(params.tanggal)
    }

    const isUuid = params.id_psikolog && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id_psikolog)
    if (isUuid) {
      where.id_psikolog = params.id_psikolog
    }

    return this.prisma.jadwalSlot.findMany({
      where,
      include: {
        psikolog: {
          select: {
            id: true,
            nama_gelar: true,
            foto: true,
            kategori: true,
            tarif_per_jam: true,
            spesialisasi: {
              select: {
                nama: true,
              },
            },
          },
        },
      },
      orderBy: [
        { tanggal: 'asc' },
        { jam_mulai: 'asc' },
      ],
    })
  }

  async findJadwalByPsikologId(
    id_psikolog: string,
    params?: { start_date?: string; end_date?: string }
  ) {
    const where: Prisma.JadwalSlotWhereInput = {
      id_psikolog,
    }

    if (params?.start_date && params?.end_date) {
      where.tanggal = {
        gte: parseDateString(params.start_date),
        lte: parseDateString(params.end_date),
      }
    } else if (params?.start_date) {
      where.tanggal = {
        gte: parseDateString(params.start_date),
      }
    }

    return this.prisma.jadwalSlot.findMany({
      where,
      include: {
        psikolog: {
          select: {
            id: true,
            tarif_per_jam: true,
          },
        },
        booking_konsultasi: {
          include: {
            client: {
              select: {
                id: true,
                nama: true,
                no_telepon: true,
                jenis_kelamin: true,
                usia: true,
              },
            },
            layanan: {
              select: {
                id: true,
                nama: true,
                metode: true,
                harga_weekday: true,
                harga_weekend: true,
              },
            },
            transaksi: {
              select: {
                id: true,
                kode_transaksi: true,
                total: true,
                subtotal: true,
                status_pembayaran: true,
                refund_at: true,
                refund_reason: true,
              },
            },
          },
        },
      },
      orderBy: [
        { tanggal: 'asc' },
        { jam_mulai: 'asc' },
      ],
    })
  }

  async findJadwalSlotById(id: string) {
    return this.prisma.jadwalSlot.findUnique({
      where: { id },
      include: {
        booking_konsultasi: true,
      },
    })
  }

  async createJadwalSlot(data: {
    id_psikolog: string
    tanggal: Date
    jam_mulai: Date
    jam_selesai: Date
    tipe_jadwal?: string
    status?: StatusBooking | string
  }) {
    return this.prisma.jadwalSlot.create({
      data: {
        id_psikolog: data.id_psikolog,
        tanggal: data.tanggal,
        jam_mulai: data.jam_mulai,
        jam_selesai: data.jam_selesai,
        tipe_jadwal: data.tipe_jadwal || 'KONSULTASI',
        status: (data.status as any) || 'TERSEDIA',
      },
    })
  }

  async deleteJadwalSlot(id: string) {
    return this.prisma.jadwalSlot.delete({
      where: { id },
    })
  }

  // ── 2. Pembuatan & Pengelolaan Sesi Booking ──────────────────────────────────

  async createAdminSesi(data: {
    id_psikolog: string
    id_layanan: string
    tanggal: Date
    jam_mulai: Date
    jam_selesai: Date
    metode: string
    deskripsi_trauma?: string
    klien: {
      nama: string
      no_telepon: string
      usia?: number
      jenis_kelamin?: string
    }
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Buat atau cari Klien berdasarkan nomor telepon
      let client = await tx.client.findFirst({
        where: { no_telepon: data.klien.no_telepon },
      })

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: data.klien.nama,
            no_telepon: data.klien.no_telepon,
            usia: data.klien.usia,
            jenis_kelamin: data.klien.jenis_kelamin,
          },
        })
      }

      // 2. Buat JadwalSlot dengan status SUDAH_DIBOOKING
      const slot = await tx.jadwalSlot.create({
        data: {
          id_psikolog: data.id_psikolog,
          tanggal: data.tanggal,
          jam_mulai: data.jam_mulai,
          jam_selesai: data.jam_selesai,
          tipe_jadwal: 'KONSULTASI',
          status: 'SUDAH_DIBOOKING',
        },
      })

      // 3. Buat BookingKonsultasi langsung CONFIRMED (admin direct)
      const kode_pesanan = `ADM-${generateOrderId()}`
      const booking = await tx.bookingKonsultasi.create({
        data: {
          kode_pesanan,
          id_client: client.id,
          id_layanan: data.id_layanan,
          id_jadwal: slot.id,
          metode: data.metode,
          deskripsi_trauma: data.deskripsi_trauma,
          status: 'CONFIRMED',
        },
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: {
              psikolog: true,
            },
          },
        },
      })

      // 4. Update jumlah_sesi psikolog
      await tx.psikolog.update({
        where: { id: data.id_psikolog },
        data: { jumlah_sesi: { increment: 1 } },
      }).catch(() => {})

      return booking
    })
  }

  async createClientBooking(data: {
    id_jadwal: string
    id_layanan: string
    metode: string
    deskripsi_trauma?: string
    klien: {
      nama: string
      no_telepon: string
      email?: string
      usia?: number
      jenis_kelamin?: string
    }
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verifikasi ketersediaan slot
      const slot = await tx.jadwalSlot.findUnique({
        where: { id: data.id_jadwal },
        include: { psikolog: true },
      })

      if (!slot) {
        throw new Error('Slot jadwal tidak ditemukan')
      }

      if (slot.status !== 'TERSEDIA') {
        throw new Error('Slot jadwal tersebut sudah tidak tersedia')
      }

      // 2. Buat atau cari Klien berdasarkan nomor telepon
      let client = await tx.client.findFirst({
        where: { no_telepon: data.klien.no_telepon },
      })

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: data.klien.nama,
            no_telepon: data.klien.no_telepon,
            usia: data.klien.usia,
            jenis_kelamin: data.klien.jenis_kelamin,
          },
        })
      }

      // 3. Update status slot menjadi SUDAH_DIBOOKING
      await tx.jadwalSlot.update({
        where: { id: data.id_jadwal },
        data: { status: 'SUDAH_DIBOOKING' },
      })

      // 4. Buat BookingKonsultasi (status PENDING menunggu verifikasi pembayaran)
      const kode_pesanan = `W-EMP-${generateOrderId()}`
      const booking = await tx.bookingKonsultasi.create({
        data: {
          kode_pesanan,
          id_client: client.id,
          id_layanan: data.id_layanan,
          id_jadwal: slot.id,
          metode: data.metode,
          deskripsi_trauma: data.deskripsi_trauma,
          status: 'PENDING',
        },
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: {
              psikolog: true,
            },
          },
        },
      })

      // 5. Update jumlah_sesi psikolog
      await tx.psikolog.update({
        where: { id: slot.id_psikolog },
        data: { jumlah_sesi: { increment: 1 } },
      }).catch(() => {})

      return booking
    })
  }

  async updateBookingStatus(id: string, status: StatusBooking) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.bookingKonsultasi.findUnique({
        where: { id },
        include: { jadwal: true },
      })

      if (!existing) {
        throw new Error('Booking konsultasi tidak ditemukan')
      }

      const updated = await tx.bookingKonsultasi.update({
        where: { id },
        data: { status },
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: {
              psikolog: true,
            },
          },
        },
      })

      // Jika dibatalkan (CANCELLED) oleh admin
      if (status === 'CANCELLED') {
        // Kurangi jumlah sesi psikolog yang sebelumnya bertambah saat booking
        if (existing.jadwal?.id_psikolog) {
          await tx.psikolog.update({
            where: { id: existing.jadwal.id_psikolog },
            data: { jumlah_sesi: { decrement: 1 } },
          }).catch(() => {})
        }

        // Kembalikan status slot jam ke TERSEDIA agar ketersediaan psikolog terbuka kembali
        if (existing.id_jadwal) {
          await tx.jadwalSlot.update({
            where: { id: existing.id_jadwal },
            data: { status: 'TERSEDIA' },
          }).catch(() => {})
        }
      }

      return updated
    })
  }

  async findBookingById(id: string) {
    return this.prisma.bookingKonsultasi.findUnique({
      where: { id },
      include: {
        client: true,
        layanan: true,
        transaksi: true,
        jadwal: {
          include: {
            psikolog: true,
          },
        },
      },
    })
  }

  async refundBooking(params: {
    bookingId: string
    adminName: string
    alasan: string
  }) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookingKonsultasi.findUnique({
        where: { id: params.bookingId },
        include: {
          transaksi: true,
          jadwal: true,
          client: true,
          layanan: true,
        },
      })

      if (!booking) {
        throw Object.assign(new Error('Sesi booking tidak ditemukan'), { statusCode: 404 })
      }

      // Pastikan status belum dibatalkan / direfund
      if (booking.status === 'CANCELLED' || booking.transaksi?.status_pembayaran === 'REFUNDED') {
        throw Object.assign(new Error('Sesi atau transaksi ini sudah pernah direfund atau dibatalkan sebelumnya'), { statusCode: 409 })
      }

      if (booking.status === 'COMPLETED') {
        throw Object.assign(new Error('Sesi yang sudah selesai tidak dapat direfund'), { statusCode: 422 })
      }

      // Validasi H-1 (24 jam sebelum jadwal sesi)
      const sessionDate = new Date(booking.jadwal.tanggal)
      const sessionTime = new Date(booking.jadwal.jam_mulai)
      const sessionDateTime = new Date(
        Date.UTC(
          sessionDate.getUTCFullYear(),
          sessionDate.getUTCMonth(),
          sessionDate.getUTCDate(),
          sessionTime.getUTCHours(),
          sessionTime.getUTCMinutes(),
          0,
          0
        )
      )
      const refundDeadline = new Date(sessionDateTime.getTime() - 24 * 60 * 60 * 1000)

      if (Date.now() > refundDeadline.getTime()) {
        const deadlineStr = refundDeadline.toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          dateStyle: 'medium',
          timeStyle: 'short',
        })
        throw Object.assign(
          new Error(`Refund ditolak. Batas waktu pengajuan refund maksimal H-1 (24 jam sebelum sesi) telah terlewati pada ${deadlineStr} WIB`),
          {
            statusCode: 422,
            details: {
              batasRefund: refundDeadline.toISOString(),
              batasRefundStr: `${deadlineStr} WIB`,
            },
          }
        )
      }

      // Hitung nominal refund 100%
      let refundAmount = booking.transaksi ? Number(booking.transaksi.total) : Number(booking.layanan.harga_weekday)
      if (refundAmount <= 0) refundAmount = 200000

      // 1. Update / Catat transaksi (PENTING: Jangan di-delete, hanya update status ke REFUNDED)
      let updatedTransaksi = booking.transaksi
      if (booking.transaksi) {
        updatedTransaksi = await tx.transaksi.update({
          where: { id: booking.transaksi.id },
          data: {
            status_pembayaran: 'REFUNDED',
            refund_at: new Date(),
            refund_reason: params.alasan,
            refund_amount: refundAmount,
          },
        })
      } else {
        // Jika sesi belum memiliki record transaksi terhubung (misal walk-in manual admin), buat record transaksi REFUNDED
        updatedTransaksi = await tx.transaksi.create({
          data: {
            id_client: booking.id_client,
            tipe_transaksi: 'KONSULTASI',
            subtotal: refundAmount,
            biaya_admin: 0,
            total: refundAmount,
            metode_pembayaran: 'TRANSFER_BANK',
            status_pembayaran: 'REFUNDED',
            refund_at: new Date(),
            refund_reason: params.alasan,
            refund_amount: refundAmount,
          },
        })
      }

      // 2. Ubah status BookingKonsultasi menjadi CANCELLED
      const updatedBooking = await tx.bookingKonsultasi.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          id_transaksi: updatedTransaksi.id,
        },
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: { psikolog: true },
          },
        },
      })

      // 3. Lepas slot jadwal psikolog agar kembali TERSEDIA untuk klien lain
      await tx.jadwalSlot.update({
        where: { id: booking.id_jadwal },
        data: { status: 'TERSEDIA' },
      })

      return {
        booking: updatedBooking,
        transaksi: updatedTransaksi,
        nominalRefund: refundAmount,
      }
    })
  }

  async findAllBookings(_params?: Record<string, unknown>) {
    return this.prisma.bookingKonsultasi.findMany({
      include: {
        client: true,
        layanan: true,
        jadwal: {
          include: {
            psikolog: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  // ── Helper Psikolog ──
  async findPsikologById(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    if (!isUuid) return null
    return this.prisma.psikolog.findUnique({
      where: { id },
      include: { spesialisasi: true },
    })
  }

  async findPsikologByAccountId(id_account: string) {
    return this.prisma.psikolog.findUnique({
      where: { id_account },
      include: { spesialisasi: true },
    })
  }

  async findFirstPsikolog() {
    return this.prisma.psikolog.findFirst({
      include: { spesialisasi: true },
    })
  }
}
