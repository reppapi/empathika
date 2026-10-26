import type { PrismaClient, Prisma, StatusBooking, StatusSlot } from '@prisma/client'
import { parseDateString, timeStringToDate } from '../../utils/date-time'
import { generateOrderId } from '../../utils'

export class BookingRepository {
  constructor(private prisma: PrismaClient) { }

  // ── 1. Slot Ketersediaan & Kalender ──────────────────────────────────────────

  async findJadwalSlots(params?: { date?: string; start_date?: string; end_date?: string; layanan?: string; status?: string }) {
    const where: Prisma.JadwalSlotWhereInput = {}

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
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setUTCHours(23, 59, 59, 999)

    return this.prisma.bookingKonsultasi.findMany({
      where: {
        jadwal: {
          tanggal: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      include: {
        client: true,
        layanan: true,
        transaksi: true,
        jadwal: {
          include: {
            psikolog: {
              include: {
                account: true,
              },
            },
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
        jam_mulai: { lt: jam_selesai },
        jam_selesai: { gt: jam_mulai },
      },
    })
  }

  async cancelExpiredPendingBookings(maxAgeMinutes: number = 30) {
    const cutoffDate = new Date(Date.now() - maxAgeMinutes * 60 * 1000)

    // Cari seluruh booking konsultasi berstatus PENDING yang sudah melewati batas waktu
    const expiredBookings = await this.prisma.bookingKonsultasi.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoffDate },
      },
      include: {
        jadwal: true,
        transaksi: true,
      },
    })

    if (expiredBookings.length === 0) {
      return { count: 0, expiredIds: [] }
    }

    const expiredIds: string[] = []

    for (const booking of expiredBookings) {
      await this.prisma.$transaction(async (tx) => {
        // 1. Batalkan booking
        await tx.bookingKonsultasi.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' } as any,
        })

        // 2. Kembalikan slot jam ke TERSEDIA
        if (booking.id_jadwal) {
          await tx.jadwalSlot.update({
            where: { id: booking.id_jadwal },
            data: { status: 'TERSEDIA' } as any,
          }).catch(() => { })
        }

        // 3. Update transaksi menjadi FAILED jika masih PENDING
        if (booking.id_transaksi) {
          await tx.transaksi.update({
            where: { id: booking.id_transaksi },
            data: { status_pembayaran: 'FAILED' } as any,
          }).catch(() => { })
        }

        // 4. Kurangi jumlah sesi psikolog
        if (booking.jadwal?.id_psikolog) {
          await tx.psikolog.update({
            where: { id: booking.jadwal.id_psikolog },
            data: { jumlah_sesi: { decrement: 1 } },
          }).catch(() => { })
        }
      }).catch(() => { })
      expiredIds.push(booking.id)
    }

    return { count: expiredIds.length, expiredIds }
  }

  async findJadwalTersedia(params: {
    tanggal?: string
    id_psikolog?: string
    tipe_jadwal?: string
  }) {
    // Otomatis lepas slot yang ditinggalkan (pending > 30 menit) agar langsung muncul lagi di kalender
    await this.cancelExpiredPendingBookings(30).catch(() => { })
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
        psikolog: true,
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
            transaksi: true,
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
    metode?: string
    status?: StatusSlot | string
  }): Promise<any> {
    return this.prisma.jadwalSlot.create({
      data: {
        id_psikolog: data.id_psikolog,
        tanggal: data.tanggal,
        jam_mulai: data.jam_mulai,
        jam_selesai: data.jam_selesai,
        tipe_jadwal: data.tipe_jadwal || 'KONSULTASI',
        metode: data.metode || 'ONLINE',
        status: (data.status as any) || 'TERSEDIA',
      } as any,
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
          metode: data.metode || 'ONLINE',
          status: 'SUDAH_DIBOOKING',
        } as any,
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
        } as any,
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
      }).catch(() => { })

      return booking
    })
  }

  async createClientBooking(data: {
    id_jadwal?: string
    id_layanan?: string
    id_psikolog?: string
    tanggal?: string
    jam_mulai?: string
    metode?: string
    deskripsi_trauma?: string
    status?: 'PENDING' | 'CONFIRMED'
    metode_pembayaran?: string
    channel_pembayaran?: string
    klien: {
      nama: string
      no_telepon: string
      email?: string
      usia?: number
      jenis_kelamin?: string
    }
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verifikasi atau cari slot ketersediaan
      let slot: any = null
      let isNewlyCreated = false
      const isUuid = data.id_jadwal && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id_jadwal)
      if (isUuid || (data.id_jadwal && !data.id_jadwal.startsWith('mock-'))) {
        slot = await tx.jadwalSlot.findUnique({
          where: { id: data.id_jadwal },
          include: { psikolog: true, booking_konsultasi: true },
        })
      }

      // Jika slot tidak ditemukan dengan id_jadwal, cari berdasarkan psikolog, tanggal, dan jam_mulai
      if (!slot && data.id_psikolog && data.tanggal && data.jam_mulai) {
        const parsedTanggal = parseDateString(data.tanggal)
        const parsedJamMulai = timeStringToDate(data.jam_mulai)
        slot = await tx.jadwalSlot.findFirst({
          where: {
            id_psikolog: data.id_psikolog,
            tanggal: parsedTanggal,
            jam_mulai: parsedJamMulai,
          },
          include: { psikolog: true, booking_konsultasi: true },
        })

        // Jika belum ada slot di database untuk psikolog tersebut di waktu ini, buatkan slot baru
        if (!slot) {
          const parsedJamSelesai = new Date(parsedJamMulai.getTime() + 60 * 60 * 1000)
          slot = await tx.jadwalSlot.create({
            data: {
              id_psikolog: data.id_psikolog,
              tanggal: parsedTanggal,
              jam_mulai: parsedJamMulai,
              jam_selesai: parsedJamSelesai,
              metode: (data.metode || 'ONLINE').toUpperCase(),
              status: 'SUDAH_DIBOOKING' as any,
              tipe_jadwal: 'KONSULTASI',
            } as any,
            include: { psikolog: true },
          })
          isNewlyCreated = true
        }
      }

      if (!slot) {
        throw Object.assign(new Error('Slot jadwal tidak ditemukan atau belum dipilih'), { statusCode: 400 })
      }

      // Validasi ketersediaan slot & cegah duplikasi booking
      if (!isNewlyCreated) {
        const existingBooking = slot.booking_konsultasi || await tx.bookingKonsultasi.findUnique({
          where: { id_jadwal: slot.id },
        })

        if (existingBooking && existingBooking.status !== 'CANCELLED') {
          throw Object.assign(
            new Error('Slot jadwal ini sudah dibooking oleh klien lain. Silakan pilih jadwal atau waktu lain.'),
            { statusCode: 409 }
          )
        }

        if (slot.status === 'SUDAH_DIBOOKING' && (!existingBooking || existingBooking.status !== 'CANCELLED')) {
          throw Object.assign(
            new Error('Slot jadwal ini sudah dibooking oleh klien lain. Silakan pilih jadwal atau waktu lain.'),
            { statusCode: 409 }
          )
        }

        // Jika slot sebelumnya pernah memiliki booking berstatus CANCELLED,
        // buat slot baru dengan jam/tanggal yang sama untuk booking baru ini
        // agar tidak terjadi tabrakan unique constraint pada BookingKonsultasi.id_jadwal
        if (existingBooking && existingBooking.status === 'CANCELLED') {
          slot = await tx.jadwalSlot.create({
            data: {
              id_psikolog: slot.id_psikolog,
              tanggal: slot.tanggal,
              jam_mulai: slot.jam_mulai,
              jam_selesai: slot.jam_selesai,
              metode: slot.metode,
              status: 'SUDAH_DIBOOKING' as any,
              tipe_jadwal: slot.tipe_jadwal || 'KONSULTASI',
            } as any,
            include: { psikolog: true },
          })
        } else {
          // 2. Update status slot menjadi SUDAH_DIBOOKING
          await tx.jadwalSlot.update({
            where: { id: slot.id },
            data: { status: 'SUDAH_DIBOOKING' } as any,
          })
        }
      }

      // 3. Buat atau cari Klien berdasarkan nomor telepon (normalisasi format)
      const rawPhone = data.klien.no_telepon.trim()
      const digitsOnly = rawPhone.replace(/\D/g, '')

      let client = await tx.client.findFirst({
        where: {
          OR: [
            { no_telepon: rawPhone },
            ...(digitsOnly.length >= 8 ? [{ no_telepon: digitsOnly }] : []),
          ],
        },
      })

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: data.klien.nama.trim(),
            no_telepon: rawPhone,
            usia: data.klien.usia,
            jenis_kelamin: data.klien.jenis_kelamin,
          },
        })
      } else {
        await tx.client.update({
          where: { id: client.id },
          data: {
            nama: data.klien.nama.trim() || client.nama,
            usia: data.klien.usia ?? client.usia,
            jenis_kelamin: data.klien.jenis_kelamin ?? client.jenis_kelamin,
          },
        }).catch(() => {})
      }

      // 4. Cari info layanan untuk menentukan nominal transaksi (fallback otomatis ke layanan aktif pertama)
      let resolvedLayananId = data.id_layanan
      let layanan: any = null
      if (resolvedLayananId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resolvedLayananId)) {
        layanan = await tx.layanan.findUnique({
          where: { id: resolvedLayananId },
        })
      }
      if (!layanan) {
        layanan = await tx.layanan.findFirst({ where: { aktif: true } })
        if (!layanan) {
          layanan = await tx.layanan.findFirst()
        }
        if (layanan) {
          resolvedLayananId = layanan.id
        }
      }

      const nominal = layanan?.harga_weekday ? Number(layanan.harga_weekday) : 200000
      const finalStatus = data.status || 'CONFIRMED'
      const paymentStatus = finalStatus === 'CONFIRMED' ? 'PAID' : 'PENDING'

      // 5. Buat Transaksi
      const kode_pesanan = `W-EMP-${generateOrderId()}`
      const transaksi = await tx.transaksi.create({
        data: {
          id_client: client.id,
          kode_transaksi: kode_pesanan,
          tipe_transaksi: 'KONSULTASI',
          subtotal: nominal,
          biaya_admin: 0,
          total: nominal,
          metode_pembayaran: (data.metode_pembayaran || 'QRIS').toUpperCase(),
          channel_pembayaran: data.channel_pembayaran || null,
          status_pembayaran: paymentStatus,
        } as any,
      })

      // 6. Buat BookingKonsultasi (terhubung langsung ke JadwalSlot dan Transaksi)
      const booking = await tx.bookingKonsultasi.create({
        data: {
          kode_pesanan,
          id_client: client.id,
          id_layanan: resolvedLayananId,
          id_jadwal: slot.id,
          id_transaksi: transaksi.id,
          metode: (data.metode || 'ONLINE').toUpperCase(),
          deskripsi_trauma: data.deskripsi_trauma,
          status: finalStatus,
        } as any,
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

      // 7. Update jumlah_sesi psikolog
      await tx.psikolog.update({
        where: { id: slot.id_psikolog },
        data: { jumlah_sesi: { increment: 1 } },
      }).catch(() => { })

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
        // Lepas slot jadwal agar kembali TERSEDIA
        if (existing.id_jadwal) {
          await tx.jadwalSlot.update({
            where: { id: existing.id_jadwal },
            data: { status: 'TERSEDIA' } as any,
          }).catch(() => { })
        }
        // Kurangi jumlah sesi psikolog yang sebelumnya bertambah saat booking
        if (existing.jadwal?.id_psikolog) {
          await tx.psikolog.update({
            where: { id: existing.jadwal.id_psikolog },
            data: { jumlah_sesi: { decrement: 1 } },
          }).catch(() => { })
        }
      } else if (existing.status === 'CANCELLED' && (status === 'CONFIRMED' || status === 'PENDING')) {
        // Jika diaktifkan kembali dari CANCELLED
        if (existing.id_jadwal) {
          await tx.jadwalSlot.update({
            where: { id: existing.id_jadwal },
            data: { status: 'SUDAH_DIBOOKING' } as any,
          }).catch(() => { })
        }
        if (existing.jadwal?.id_psikolog) {
          await tx.psikolog.update({
            where: { id: existing.jadwal.id_psikolog },
            data: { jumlah_sesi: { increment: 1 } },
          }).catch(() => { })
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
      // Jam di DB disimpan sebagai angka WIB (misal 13:30), konversi ke UTC absolut dengan dikurangi 7 jam
      const sessionDate = new Date(booking.jadwal.tanggal)
      const sessionTime = new Date(booking.jadwal.jam_mulai)
      const sessionDateTime = new Date(
        Date.UTC(
          sessionDate.getUTCFullYear(),
          sessionDate.getUTCMonth(),
          sessionDate.getUTCDate(),
          sessionTime.getUTCHours() - 7,
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
      let updatedTransaksi: any = booking.transaksi
      if (booking.transaksi) {
        updatedTransaksi = await tx.transaksi.update({
          where: { id: booking.transaksi.id },
          data: {
            status_pembayaran: 'REFUNDED',
            refund_at: new Date(),
            refund_reason: params.alasan,
            refund_amount: refundAmount,
          } as any,
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
          } as any,
        })
      }

      // 2. Ubah status BookingKonsultasi menjadi CANCELLED
      const updatedBooking = await tx.bookingKonsultasi.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          id_transaksi: updatedTransaksi.id,
        } as any,
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

  async findAllBookings(params?: Record<string, unknown>) {
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
    const defaultJane = await this.prisma.psikolog.findFirst({
      where: {
        OR: [
          { nama_gelar: { contains: 'Jane', mode: 'insensitive' } },
          { account: { email: { contains: 'psikolog@empathika', mode: 'insensitive' } } },
        ],
      },
      include: { spesialisasi: true },
    })
    if (defaultJane) return defaultJane

    return this.prisma.psikolog.findFirst({
      include: { spesialisasi: true },
    })
  }
}
