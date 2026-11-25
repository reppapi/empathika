import type { FastifyInstance } from 'fastify'
import { BookingRepository } from './booking.repository'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
  GetJadwalTersediaQuery,
  GetJadwalPsikologMeQuery,
  CreateJadwalSlotInput,
  CreateClientBookingInput,
  RescheduleBookingInput,
} from './booking.schema'
import type { StatusBooking } from '@prisma/client'
import {
  parseDateString,
  timeStringToDate,
  formatDateToString,
  formatTimeToString,
  calculateRefundDeadline,
} from '../../utils/date-time'

export class BookingService {
  private repo: BookingRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new BookingRepository(fastify.prisma)
  }

  // ── 1. Admin: Overview & Sesi ────────────────────────────────────────────────

  async getJadwalOverview(query: GetAdminJadwalQuery) {
    let selectedDate: Date
    if (query.date) {
      selectedDate = parseDateString(query.date)
    } else {
      const now = new Date()
      const wibDateStr = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
      selectedDate = parseDateString(wibDateStr)
    }

    // 1. Ambil Sesi Hari Ini & Seluruh Slot Mingguan secara Paralel (Fast Response)
    const [rawTodaySessions, allSlots] = await Promise.all([
      this.repo.findTodaySessions(selectedDate, query.id_biro || query.biroId),
      this.repo.findJadwalSlots(query),
    ])

    const todaySessions = rawTodaySessions
      .filter((s) => {
        if (query.status && query.status !== 'semua') {
          const qStatus = query.status.toLowerCase()
          if (qStatus === 'selesai' && s.status !== 'COMPLETED') return false
          if (qStatus === 'dibatalkan' && s.status !== 'CANCELLED') return false
          if (qStatus === 'menunggu' && s.status !== 'CONFIRMED' && s.status !== 'PENDING') return false
        } else {
          // Jika dibatalkan dan tidak ada klien aktif, hapus dari daftar sesi harian
          if (s.status === 'CANCELLED') return false
        }
        if (query.layanan && query.layanan !== 'Semua Layanan' && query.layanan !== 'semua') {
          const qLay = query.layanan.toLowerCase().trim()
          const isAsesmen =
            s.jadwal?.tipe_jadwal === 'ASESMEN' ||
            (s.layanan?.nama || '').toLowerCase().includes('asesmen') ||
            s.layanan?.kategori === 'ASESMEN'
          if (qLay.includes('asesmen')) {
            if (!isAsesmen) return false
          } else if (qLay.includes('konseling') || qLay.includes('konsultasi')) {
            if (isAsesmen) return false
          } else {
            const layName = (s.layanan?.nama || '').toLowerCase()
            if (!layName.includes(qLay)) return false
          }
        }
        return true
      })
      .map((s) => {
      const jamMulaiStr = formatTimeToString(s.jadwal.jam_mulai)
      const jamSelesaiStr = formatTimeToString(s.jadwal.jam_selesai)

      let statusLabel = 'Menunggu Jadwal'
      if (s.status === 'COMPLETED') {
        statusLabel = 'Selesai'
      } else if (s.status === 'CANCELLED') {
        statusLabel = 'Dibatalkan'
      }

      const cleanWa = s.client.no_telepon ? s.client.no_telepon.replace(/\D/g, '') : ''
      const waNumber = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa

      // Hitung batas refund (H-1 = 24 jam sebelum jadwal sesi) via helper terpusat
      const { refundDeadline, isPastH1 } = calculateRefundDeadline(
        s.jadwal.tanggal,
        s.jadwal.jam_mulai
      )

      const isPaid = (s as any).transaksi?.status_pembayaran === 'PAID' || s.status === 'CONFIRMED'
      const isRefunded = (s as any).transaksi?.status_pembayaran === 'REFUNDED' || s.status === 'CANCELLED'
      const isCompleted = s.status === 'COMPLETED'
      const canRefund = isPaid && !isRefunded && !isCompleted && !isPastH1

      const nominalRefund = (s as any).transaksi ? Number((s as any).transaksi.total) : (s.layanan?.harga_weekday ? Number(s.layanan.harga_weekday) : 200000)

      const isAsesmen =
        s.jadwal?.tipe_jadwal === 'ASESMEN' ||
        (s.layanan?.nama || '').toLowerCase().includes('asesmen')

      return {
        id: s.id,
        idKlien: `K-${s.client.id.slice(0, 4).toUpperCase()}`,
        namaKlien: s.client.nama,
        noTelepon: s.client.no_telepon || '',
        waLink: waNumber ? `https://wa.me/${waNumber}` : null,
        layanan: s.layanan.nama,
        psikolog: isAsesmen ? '' : (s.jadwal.psikolog?.nama_gelar || (s.jadwal.psikolog as any)?.account?.nama || 'Belum Ditentukan'),
        idPsikolog: isAsesmen ? null : s.jadwal.psikolog?.id,
        noTeleponPsikolog: isAsesmen ? null : ((s.jadwal.psikolog as any)?.account?.no_telepon || null),
        tipe_jadwal: s.jadwal?.tipe_jadwal || (isAsesmen ? 'ASESMEN' : 'KONSULTASI'),
        jamMulai: jamMulaiStr,
        jamSelesai: jamSelesaiStr,
        waktuRange: `${jamMulaiStr} - ${jamSelesaiStr}`,
        metode: s.metode === 'OFFLINE' ? 'Offline' : s.metode === 'KEDUANYA' ? 'Keduanya' : 'Online',
        status: (s as any).transaksi?.status_pembayaran === 'REFUNDED' ? 'Dibatalkan (Refund)' : statusLabel,
        rawStatus: s.status,
        deskripsiTrauma: s.deskripsi_trauma,
        tanggal: formatDateToString(s.jadwal.tanggal),
        // Rincian Refund H-1
        canRefund,
        isPastH1,
        isRefunded,
        isPaid,
        refundDeadline: refundDeadline.toISOString(),
        nominalRefund,
        idTransaksi: (s as any).transaksi?.id || null,
        kodeTransaksi: (s as any).transaksi?.kode_transaksi || null,
      }
    })

    // 2. Pemrosesan Grid Mingguan (Deduplikasi & Prioritas Slot Aktif)

    // Deduplikasi slot jika terdapat slot lama yang pernah dibatalkan dan slot baru yang dibooking pada jam/tanggal yang sama
    const slotOverviewMap = new Map<string, any>()
    allSlots.forEach((slot) => {
      const key = `${slot.id_psikolog || ''}_${formatDateToString(slot.tanggal)}_${formatTimeToString(slot.jam_mulai)}`
      const existing = slotOverviewMap.get(key)
      const isBookingCancelled = slot.booking_konsultasi?.status === 'CANCELLED'
      const hasActiveBooking = Boolean(slot.booking_konsultasi) && !isBookingCancelled

      if (!existing) {
        slotOverviewMap.set(key, slot)
      } else {
        const existingCancelled = existing.booking_konsultasi?.status === 'CANCELLED'
        const existingActive = Boolean(existing.booking_konsultasi) && !existingCancelled

        // Prioritaskan slot yang memiliki booking aktif klien daripada slot yang dibatalkan atau slot kosong
        if (!existingActive && hasActiveBooking) {
          slotOverviewMap.set(key, slot)
        } else if (!existingActive && !hasActiveBooking && slot.status === 'TERSEDIA' && existing.status !== 'TERSEDIA') {
          slotOverviewMap.set(key, slot)
        }
      }
    })

    const prioritizedSlots = Array.from(slotOverviewMap.values())

    const weeklyGrid = prioritizedSlots.map((slot) => {
      const dateStr = formatDateToString(slot.tanggal)
      const jamMulaiStr = formatTimeToString(slot.jam_mulai)
      const jamSelesaiStr = formatTimeToString(slot.jam_selesai)
      const timeSlot = `${jamMulaiStr} - ${jamSelesaiStr}`
      const targetBiroId = query.id_biro || query.biroId
      const isBookingForThisBiro =
        !targetBiroId ||
        Boolean(
          slot.booking_konsultasi &&
            ((slot.booking_konsultasi.transaksi?.id_biro_tenant === targetBiroId) ||
              (slot.booking_konsultasi.client?.id_biro === targetBiroId))
        )

      const isBookingCancelled = slot.booking_konsultasi?.status === 'CANCELLED'
      const hasActiveBooking = Boolean(slot.booking_konsultasi) && !isBookingCancelled && isBookingForThisBiro
      const isBooked = (slot.status === 'SUDAH_DIBOOKING' || hasActiveBooking) && !isBookingCancelled && isBookingForThisBiro
      const clientName = isBookingForThisBiro ? (slot.booking_konsultasi?.client?.nama || undefined) : undefined
      const clientPhone = isBookingForThisBiro ? (slot.booking_konsultasi?.client?.no_telepon || null) : null
      const clientId = isBookingForThisBiro ? (slot.booking_konsultasi?.client?.id || null) : null
      const isAsesmen =
        slot.tipe_jadwal === 'ASESMEN' ||
        (slot.booking_konsultasi?.layanan?.nama || '').toLowerCase().includes('asesmen')

      return {
        id: slot.id,
        id_booking: (isBookingForThisBiro && slot.booking_konsultasi?.id) || null,
        booking_id: (isBookingForThisBiro && slot.booking_konsultasi?.id) || null,
        date: dateStr,
        timeSlot,
        statusSlot: isBookingCancelled || (!isBookingForThisBiro && slot.status === 'SUDAH_DIBOOKING') ? 'TERSEDIA' : slot.status,
        tipe_jadwal: slot.tipe_jadwal,
        isBooked,
        isCancelled: false,
        clientName: isBookingCancelled || !isBookingForThisBiro ? undefined : clientName,
        namaKlien: isBookingCancelled || !isBookingForThisBiro ? undefined : clientName,
        kontak: isBookingCancelled || !isBookingForThisBiro ? null : clientPhone,
        no_telepon: isBookingCancelled || !isBookingForThisBiro ? null : clientPhone,
        klienId: isBookingCancelled || !isBookingForThisBiro ? null : clientId,
        catatan: isBookingCancelled || !isBookingForThisBiro ? null : (slot.booking_konsultasi?.deskripsi_trauma || null),
        status: isBookingCancelled || !isBookingForThisBiro ? 'Tersedia' : (slot.status === 'TERSEDIA' ? 'Tersedia' : 'Aktif'),
        psikologName: isAsesmen ? '' : (slot.psikolog?.nama_gelar || (slot.psikolog as any)?.account?.nama || ''),
        id_psikolog: slot.id_psikolog || null,
        noTeleponPsikolog: (slot.psikolog as any)?.account?.no_telepon || null,
        cancelled_by: null,
        layanan:
          isBookingCancelled || !isBookingForThisBiro
            ? (isAsesmen ? 'Asesmen Tersedia' : 'Slot Tersedia')
            : (slot.booking_konsultasi?.layanan?.nama ||
              (slot.status === 'TERSEDIA'
                ? isAsesmen
                  ? 'Asesmen Tersedia'
                  : 'Slot Tersedia'
                : isAsesmen
                  ? 'Asesmen Terjadwal'
                  : 'Terjadwal')),
        metode: slot.booking_konsultasi?.metode && isBookingForThisBiro
          ? (slot.booking_konsultasi.metode.toUpperCase().includes('KEDUANYA')
            ? 'Keduanya'
            : slot.booking_konsultasi.metode.toUpperCase().includes('OFFLINE')
              ? 'Offline'
              : 'Online')
          : ((slot as any).metode && (slot as any).metode.toUpperCase().includes('KEDUANYA')
            ? 'Keduanya'
            : (slot as any).metode && (slot as any).metode.toUpperCase().includes('OFFLINE')
              ? 'Offline'
              : 'Online'),
      }
    })

    return {
      selectedDate: formatDateToString(selectedDate),
      summary: {
        totalSesiHariIni: todaySessions.length,
        sesiSelesai: todaySessions.filter((s) => s.rawStatus === 'COMPLETED').length,
        sesiMenunggu: todaySessions.filter((s) => s.rawStatus === 'CONFIRMED' || s.rawStatus === 'PENDING').length,
        totalSlotTersedia: allSlots.filter((s) => s.status === 'TERSEDIA').length,
      },
      todaySessions,
      weeklyGrid,
    }
  }

  async createAdminJadwalSlot(input: CreateAdminJadwalSlotInput) {
    const parsedTanggal = parseDateString(input.tanggal)
    const parsedJamMulai = timeStringToDate(input.jam_mulai)
    const parsedJamSelesai = timeStringToDate(input.jam_selesai)

    if (parsedJamSelesai <= parsedJamMulai) {
      throw new Error('Jam selesai harus lebih akhir dari jam mulai')
    }

    const targetTipeJadwal = (input.tipe_jadwal || 'ASESMEN').toUpperCase()
    const isAsesmen = targetTipeJadwal === 'ASESMEN'

    let targetMetode = isAsesmen ? 'OFFLINE' : 'ONLINE'
    if (input.metode) {
      const upper = input.metode.toUpperCase()
      if (upper.includes('KEDUANYA') || (upper.includes('OFFLINE') && upper.includes('ONLINE'))) {
        targetMetode = 'KEDUANYA'
      } else if (upper.includes('OFFLINE')) {
        targetMetode = 'OFFLINE'
      } else {
        targetMetode = 'ONLINE'
      }
    }

    let targetPsikologId = input.id_psikolog
    if (!targetPsikologId) {
      const allPsikolog = await (this.repo as any).prisma.psikolog.findMany({ select: { id: true } })
      if (!allPsikolog || allPsikolog.length === 0) {
        throw new Error('Tidak ditemukan data psikolog untuk dialokasikan pada slot ini')
      }

      // Cari psikolog pertama yang slotnya belum bentrok
      let selectedPsiId: string | null = null
      for (const p of allPsikolog) {
        const hasOverlap = await this.repo.findOverlappingSlot(
          p.id,
          parsedTanggal,
          parsedJamMulai,
          parsedJamSelesai
        )
        if (!hasOverlap) {
          selectedPsiId = p.id
          break
        }
      }

      // Cegah duplikasi slot jam yang sama persis
      const existingSlot = await (this.repo as any).prisma.jadwalSlot.findFirst({
        where: {
          tanggal: parsedTanggal,
          jam_mulai: parsedJamMulai,
          jam_selesai: parsedJamSelesai,
          status: 'TERSEDIA',
        },
      })
      if (existingSlot) {
        throw new Error('Slot jam tersebut sudah dibuka pada tanggal yang sama')
      }

      targetPsikologId = selectedPsiId || allPsikolog[0].id
    } else {
      const overlap = await this.repo.findOverlappingSlot(
        targetPsikologId,
        parsedTanggal,
        parsedJamMulai,
        parsedJamSelesai
      )

      if (overlap) {
        const booking = (overlap as any).booking_konsultasi
        const isRefunded =
          booking?.status === 'CANCELLED' ||
          booking?.transaksi?.status_pembayaran === 'REFUNDED'
        const isPendingUnpaid = booking?.status === 'PENDING'
        const isSlotAvailable = overlap.status === 'TERSEDIA'

        if ((input as any).force_release || isSlotAvailable || isRefunded || isPendingUnpaid) {
          if (booking && booking.status !== 'CANCELLED') {
            await (this.repo as any).prisma.bookingKonsultasi.update({
              where: { id: booking.id },
              data: { status: 'CANCELLED' },
            }).catch(() => {})
          }
        } else {
          const hasActiveBooking = booking && booking.status !== 'CANCELLED'
          if (hasActiveBooking) {
            throw new Error('Slot jam tersebut bentrok dengan jadwal yang sudah ada')
          }
        }

        const overlapStart = formatTimeToString(overlap.jam_mulai)
        const overlapEnd = formatTimeToString(overlap.jam_selesai)
        const inputStart = formatTimeToString(parsedJamMulai)
        const inputEnd = formatTimeToString(parsedJamSelesai)

        const isExactSameTime = overlapStart === inputStart && overlapEnd === inputEnd

        if (!isExactSameTime) {
          // Jika slot sebelumnya memiliki riwayat booking (meski CANCELLED), JANGAN di-delete fisik (karena onDelete: Restrict).
          // Cukup perbarui jam dan aktifkan kembali sebagai TERSEDIA.
          if ((overlap as any).booking_konsultasi) {
            const updatedSlot = await (this.repo as any).prisma.jadwalSlot.update({
              where: { id: overlap.id },
              data: {
                jam_mulai: parsedJamMulai,
                jam_selesai: parsedJamSelesai,
                status: 'TERSEDIA',
                metode: targetMetode,
                tipe_jadwal: targetTipeJadwal,
              },
            })

            return {
              id: updatedSlot.id,
              id_psikolog: updatedSlot.id_psikolog,
              tanggal: formatDateToString(updatedSlot.tanggal),
              jam_mulai: formatTimeToString(updatedSlot.jam_mulai),
              jam_selesai: formatTimeToString(updatedSlot.jam_selesai),
              metode: (updatedSlot as any).metode || targetMetode,
              status: 'TERSEDIA',
              tipe_jadwal: (updatedSlot as any).tipe_jadwal || 'ASESMEN',
            }
          }

          // Jika slot benar-benar murni tanpa riwayat booking sama sekali, hapus slot lama
          await (this.repo as any).prisma.jadwalSlot.delete({
            where: { id: overlap.id },
          }).catch(() => {})
        } else {
          const updatedSlot = await (this.repo as any).prisma.jadwalSlot.update({
            where: { id: overlap.id },
            data: {
              status: 'TERSEDIA',
              metode: targetMetode,
              tipe_jadwal: targetTipeJadwal,
            },
          })

          return {
            id: updatedSlot.id,
            id_psikolog: updatedSlot.id_psikolog,
            tanggal: formatDateToString(updatedSlot.tanggal),
            jam_mulai: formatTimeToString(updatedSlot.jam_mulai),
            jam_selesai: formatTimeToString(updatedSlot.jam_selesai),
            metode: (updatedSlot as any).metode || targetMetode,
            status: 'TERSEDIA',
            tipe_jadwal: (updatedSlot as any).tipe_jadwal || 'ASESMEN',
          }
        }
      }
    }

    const newSlot = await this.repo.createJadwalSlot({
      id_psikolog: targetPsikologId!,
      tanggal: parsedTanggal,
      jam_mulai: parsedJamMulai,
      jam_selesai: parsedJamSelesai,
      tipe_jadwal: targetTipeJadwal,
      metode: targetMetode,
    })

    return {
      id: newSlot.id,
      id_psikolog: newSlot.id_psikolog,
      tanggal: formatDateToString(newSlot.tanggal),
      jam_mulai: formatTimeToString(newSlot.jam_mulai),
      jam_selesai: formatTimeToString(newSlot.jam_selesai),
      metode: (newSlot as any).metode || targetMetode,
      status: (newSlot as any).status || 'TERSEDIA',
      tipe_jadwal: (newSlot as any).tipe_jadwal || 'ASESMEN',
    }
  }

  async createAdminSesi(input: CreateAdminSesiInput) {
    const parsedTanggal = parseDateString(input.tanggal)
    const parsedJamMulai = timeStringToDate(input.jam_mulai)
    const parsedJamSelesai = timeStringToDate(input.jam_selesai)

    if (parsedJamSelesai <= parsedJamMulai) {
      throw new Error('Jam selesai harus lebih akhir dari jam mulai')
    }

    let targetPsikologId = input.id_psikolog
    if (targetPsikologId) {
      const isUuidPsi = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetPsikologId)
      if (!isUuidPsi) {
        const psi = await (this.repo as any).prisma.psikolog.findFirst({
          where: {
            OR: [
              { nama_gelar: { contains: targetPsikologId, mode: 'insensitive' } },
              { account: { nama: { contains: targetPsikologId, mode: 'insensitive' } } },
            ],
          },
        })
        if (psi) targetPsikologId = psi.id
      }
    }

    if (targetPsikologId) {
      const overlap = await this.repo.findOverlappingSlot(
        targetPsikologId,
        parsedTanggal,
        parsedJamMulai,
        parsedJamSelesai
      )

      if (overlap) {
        const hasActiveBooking =
          (overlap as any).booking_konsultasi &&
          (overlap as any).booking_konsultasi.status !== 'CANCELLED'
        const isAlreadyBooked =
          overlap.status === 'SUDAH_DIBOOKING' || hasActiveBooking
        if (isAlreadyBooked) {
          throw new Error('Slot jam tersebut sudah dibooking oleh sesi lain')
        }
        // Jika overlap.status === 'TERSEDIA', ini adalah slot resmi yang dibuka psikolog
        // yang akan diisi oleh admin untuk sesi klien ini.
      }
    } else {
      const firstPsikolog = await this.repo.findFirstPsikolog()
      if (!firstPsikolog) {
        throw new Error('Tidak ditemukan data psikolog untuk dialokasikan pada sesi ini')
      }
      targetPsikologId = firstPsikolog.id
    }

    try {
      const booking = await this.repo.createAdminSesi({
        id_psikolog: targetPsikologId,
        id_layanan: input.id_layanan,
        tanggal: parsedTanggal,
        jam_mulai: parsedJamMulai,
        jam_selesai: parsedJamSelesai,
        metode: input.metode,
        tipe_jadwal: input.tipe_jadwal,
        deskripsi_trauma: input.deskripsi_trauma,
        id_biro: (input as any).id_biro || (input as any).biroId,
        klien: input.klien,
      })

      return {
        id: booking.id,
        kode_pesanan: booking.kode_pesanan,
        klien: booking.client,
        layanan: booking.layanan,
        jadwal: {
          id: booking.jadwal.id,
          tanggal: formatDateToString(booking.jadwal.tanggal),
          jam_mulai: formatTimeToString(booking.jadwal.jam_mulai),
          jam_selesai: formatTimeToString(booking.jadwal.jam_selesai),
          psikolog: booking.jadwal.psikolog?.nama_gelar,
        },
        metode: booking.metode,
        status: booking.status,
      }
    } catch (err: any) {
      if (
        err?.code === 'P2002' ||
        err?.message?.includes('P2002') ||
        (err?.meta?.target && String(err.meta.target).includes('id_jadwal'))
      ) {
        throw Object.assign(
          new Error('Mohon maaf, slot sesi ini baru saja dipesan oleh klien lain. Silakan pilih jadwal sesi lainnya.'),
          { statusCode: 409, code: 'P2002' }
        )
      }
      throw err
    }
  }

  async updateBookingStatus(id: string, status: StatusBooking) {
    const updated = await this.repo.updateBookingStatus(id, status)
    return {
      id: updated.id,
      kode_pesanan: updated.kode_pesanan,
      status: updated.status,
      klien: updated.client.nama,
      layanan: updated.layanan.nama,
    }
  }

  async processRefund(params: {
    bookingId: string
    adminName: string
    alasan: string
  }) {
    const result = await this.repo.refundBooking(params)
    return {
      success: true,
      message: 'Refund berhasil diproses. Status transaksi telah diperbarui dan jadwal telah dibatalkan.',
      bookingId: result.booking.id,
      kodePesanan: result.booking.kode_pesanan,
      klien: result.booking.client.nama,
      statusBooking: result.booking.status,
      nominalRefund: result.nominalRefund,
      transaksi: result.transaksi
        ? {
          id: result.transaksi.id,
          kodeTransaksi: result.transaksi.kode_transaksi,
          statusPembayaran: result.transaksi.status_pembayaran,
          refundAt: result.transaksi.refund_at,
          refundReason: result.transaksi.refund_reason,
          refundAmount: result.transaksi.refund_amount,
        }
        : null,
    }
  }
  // ── 2. Psikolog: Slot Ketersediaan & Agenda ──────────────────────────────────

  async getJadwalTersedia(query: GetJadwalTersediaQuery) {
    const resolvedQuery = { ...query }
    if (query.id_psikolog) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query.id_psikolog)
      if (isUuid) {
        let psikolog = await this.repo.findPsikologById(query.id_psikolog)
        if (!psikolog) {
          psikolog = await this.repo.findPsikologByAccountId(query.id_psikolog)
        }
        if (psikolog) {
          resolvedQuery.id_psikolog = psikolog.id
        }
      } else {
        const psi = await (this.repo as any).prisma.psikolog.findFirst({
          where: {
            OR: [
              { nama_gelar: { contains: query.id_psikolog, mode: 'insensitive' } },
              { account: { nama: { contains: query.id_psikolog, mode: 'insensitive' } } },
              { account: { email: { contains: query.id_psikolog, mode: 'insensitive' } } },
            ],
          },
        })
        if (psi) {
          resolvedQuery.id_psikolog = psi.id
        }
      }
    }
    const slots = await this.repo.findJadwalTersedia(resolvedQuery)

    const now = new Date()
    const todayStr = formatDateToString(now)
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    // Filter slot yang jamnya sudah terlewat jika tanggalnya adalah hari ini atau lampau
    const upcomingSlots = slots.filter((slot) => {
      const slotDateStr = formatDateToString(slot.tanggal)
      if (slotDateStr < todayStr) return false
      if (slotDateStr > todayStr) return true

      const jamMulaiStr = formatTimeToString(slot.jam_mulai)
      const parts = jamMulaiStr.split(':')
      if (parts.length >= 2) {
        const slotStartMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
        return slotStartMinutes > currentMinutes
      }
      return true
    })

    return upcomingSlots.map((slot) => ({
      id: slot.id,
      id_psikolog: slot.id_psikolog,
      nama_psikolog: slot.psikolog.nama_gelar,
      foto_psikolog: slot.psikolog.foto,
      kategori_psikolog: slot.psikolog.kategori,
      spesialisasi: slot.psikolog.spesialisasi?.nama,
      tarif_per_jam: slot.psikolog.tarif_per_jam,
      tanggal: formatDateToString(slot.tanggal),
      jam_mulai: formatTimeToString(slot.jam_mulai),
      jam_selesai: formatTimeToString(slot.jam_selesai),
      label_waktu: `${formatTimeToString(slot.jam_mulai)} - ${formatTimeToString(slot.jam_selesai)}`,
      metode: (slot as any).metode || 'ONLINE',
      status: slot.status,
      tipe_jadwal: slot.tipe_jadwal,
    }))
  }

  async checkSlotAvailability(query: {
    id?: string
    tanggal?: string
    waktu?: string
    tipe_jadwal?: string
    id_psikolog?: string
  }) {
    if (query.id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query.id)
      if (isUuid) {
        const slot = await (this.repo as any).prisma.jadwalSlot.findUnique({
          where: { id: query.id },
          include: { booking_konsultasi: true },
        })
        if (slot) {
          if (slot.status === 'TIDAK_TERSEDIA' || slot.status === 'CANCELLED') {
            return {
              available: false,
              reason: 'Slot jadwal ini telah dibatalkan oleh pihak klinik atau psikolog.',
            }
          }
          if (
            slot.status === 'SUDAH_DIBOOKING' ||
            (slot.booking_konsultasi && slot.booking_konsultasi.status !== 'CANCELLED')
          ) {
            return {
              available: false,
              reason: 'Slot jadwal ini sudah dibooking oleh klien lain.',
            }
          }
          return { available: true, slot }
        }
      }
    }

    if (query.tanggal && query.waktu) {
      const parsedTanggal = parseDateString(query.tanggal)
      const parsedJamMulai = timeStringToDate(query.waktu)
      const isAsesmen = (query.tipe_jadwal || '').toUpperCase() === 'ASESMEN'

      let resolvedPsikologId = query.id_psikolog
      if (resolvedPsikologId) {
        const isUuidPsi = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resolvedPsikologId)
        if (!isUuidPsi) {
          const psi = await (this.repo as any).prisma.psikolog.findFirst({
            where: {
              OR: [
                { nama_gelar: { contains: resolvedPsikologId, mode: 'insensitive' } },
                { account: { nama: { contains: resolvedPsikologId, mode: 'insensitive' } } },
              ],
            },
          })
          if (psi) resolvedPsikologId = psi.id
        }
      }

      const slot = await (this.repo as any).prisma.jadwalSlot.findFirst({
        where: {
          tanggal: parsedTanggal,
          jam_mulai: parsedJamMulai,
          ...(resolvedPsikologId ? { id_psikolog: resolvedPsikologId } : {}),
          ...(isAsesmen ? { tipe_jadwal: 'ASESMEN' } : {}),
        },
        include: { booking_konsultasi: true },
      })

      // Slot wajib sudah dibuka dan terdaftar resmi di database oleh psikolog
      if (!slot) {
        return {
          available: false,
          reason: 'Slot jadwal ini belum dibuka atau tidak tersedia pada database psikolog.',
        }
      }
      if (slot.status === 'TIDAK_TERSEDIA' || slot.status === 'CANCELLED') {
        return {
          available: false,
          reason: 'Slot jadwal ini telah dibatalkan oleh pihak klinik atau psikolog.',
        }
      }
      if (
        slot.status === 'SUDAH_DIBOOKING' ||
        (slot.booking_konsultasi && slot.booking_konsultasi.status !== 'CANCELLED')
      ) {
        return {
          available: false,
          reason: 'Slot jadwal ini sudah dibooking oleh klien lain.',
        }
      }
      return { available: true, slot }
    }

    return { available: true }
  }

  async getJadwalSaya(accountId?: string, query?: GetJadwalPsikologMeQuery) {
    let psikolog = null
    const isAccountUuid = accountId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(accountId)
    if (isAccountUuid) {
      psikolog = await this.repo.findPsikologByAccountId(accountId)
      if (!psikolog) {
        psikolog = await this.repo.findPsikologById(accountId)
      }
    }

    if (!psikolog && query?.id_psikolog) {
      const isQueryUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query.id_psikolog)
      if (isQueryUuid) {
        psikolog = await this.repo.findPsikologById(query.id_psikolog)
        if (!psikolog) {
          psikolog = await this.repo.findPsikologByAccountId(query.id_psikolog)
        }
      } else if (query.id_psikolog !== '0') {
        psikolog = await (this.repo as any).prisma.psikolog.findFirst({
          where: {
            OR: [
              { nama_gelar: { contains: query.id_psikolog, mode: 'insensitive' } },
              { account: { nama: { contains: query.id_psikolog, mode: 'insensitive' } } },
              { account: { email: { contains: query.id_psikolog, mode: 'insensitive' } } },
            ],
          },
          include: { spesialisasi: true },
        })
      }
    }

    if (!psikolog) {
      const psikologWithSlots = await (this.repo as any).prisma.psikolog.findFirst({
        where: { jadwal_slot: { some: {} } },
        include: { spesialisasi: true },
      })
      if (psikologWithSlots) {
        psikolog = psikologWithSlots
      } else {
        psikolog = await this.repo.findFirstPsikolog()
      }
    }
    if (!psikolog) {
      throw new Error('Data profil tenaga ahli tidak ditemukan')
    }

    const slots = await this.repo.findJadwalByPsikologId(psikolog.id, query)

    // Deduplikasi slot jika terdapat slot lama yang pernah dibatalkan dan slot baru yang dibooking pada jam/tanggal yang sama
    const slotPsikologMap = new Map<string, any>()
    slots.forEach((slot) => {
      const key = `${formatDateToString(slot.tanggal)}_${formatTimeToString(slot.jam_mulai)}`
      const existing = slotPsikologMap.get(key)
      const isCancelled = slot.booking_konsultasi?.status === 'CANCELLED'
      const hasActive = Boolean(slot.booking_konsultasi) && !isCancelled

      if (!existing) {
        slotPsikologMap.set(key, slot)
      } else {
        const existingCancelled = existing.booking_konsultasi?.status === 'CANCELLED'
        const existingActive = Boolean(existing.booking_konsultasi) && !existingCancelled
        if (!existingActive && hasActive) {
          slotPsikologMap.set(key, slot)
        } else if (!existingActive && !hasActive && slot.status === 'TERSEDIA' && existing.status !== 'TERSEDIA') {
          slotPsikologMap.set(key, slot)
        }
      }
    })

    const prioritizedPsikologSlots = Array.from(slotPsikologMap.values())

    return {
      psikolog: {
        id: psikolog.id,
        id_account: (psikolog as any).id_account,
        nama_gelar: psikolog.nama_gelar,
        kategori: psikolog.kategori,
      },
      slots: prioritizedPsikologSlots.map((slot) => {
        const isCancelled = slot.booking_konsultasi?.status === 'CANCELLED'
        return {
          id: slot.id,
          date: formatDateToString(slot.tanggal),
          waktu: `${formatTimeToString(slot.jam_mulai)} - ${formatTimeToString(slot.jam_selesai)}`,
          jam_mulai: formatTimeToString(slot.jam_mulai),
          jam_selesai: formatTimeToString(slot.jam_selesai),
          metode: (slot as any).metode || 'ONLINE',
          status: isCancelled ? 'TERSEDIA' : slot.status,
          is_cancelled: isCancelled,
          cancelled_by: isCancelled ? 'ADMIN' : null,
          tipe_jadwal: slot.tipe_jadwal,
          booking: slot.booking_konsultasi
            ? (() => {
              const b = slot.booking_konsultasi
              const isRefunded =
                b.status === 'CANCELLED' ||
                b.transaksi?.status_pembayaran === 'REFUNDED'

              // Hitung harga penuh: prioritaskan nilai nominal transaksi, lalu tarif layanan/psikolog
              const nominalTransaksi = b.transaksi ? Number(b.transaksi.total) : null
              const tarifPsikolog = (slot as any).psikolog?.tarif_per_jam ? Number((slot as any).psikolog.tarif_per_jam) : null
              const fullPrice = nominalTransaksi ?? tarifPsikolog ?? (b.layanan?.harga_weekday ? Number(b.layanan.harga_weekday) : 0)

              // Bagian Psikolog 60%
              const pendapatanPsikolog = isRefunded || fullPrice <= 0 ? null : Math.round(fullPrice * 0.6)

              return {
                id_booking: b.id,
                kode_pesanan: b.kode_pesanan,
                nama_klien: b.client?.nama,
                no_telepon_klien: b.client?.no_telepon,
                layanan: b.layanan?.nama,
                metode: b.metode || (slot as any).metode || 'ONLINE',
                status_booking: b.status,
                is_cancelled: isRefunded || b.status === 'CANCELLED',
                cancelled_by: b.status === 'CANCELLED' ? 'ADMIN' : null,
                deskripsi_trauma: b.deskripsi_trauma,
                harga_penuh: fullPrice > 0 ? fullPrice : null,
                pendapatan_psikolog: pendapatanPsikolog,
                status_pembayaran: b.transaksi?.status_pembayaran || (b.status === 'CANCELLED' ? 'REFUNDED' : 'PAID'),
                is_refunded: isRefunded,
              }
            })()
            : null,
        }
      }),
    }
  }

  async createPsikologJadwalSlot(input: CreateJadwalSlotInput, accountId?: string) {
    let psikologId = input.id_psikolog
    const isInputUuid = Boolean(
      psikologId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(psikologId)
    )

    if (psikologId && isInputUuid) {
      let existing = await this.repo.findPsikologById(psikologId)
      if (!existing) {
        existing = await this.repo.findPsikologByAccountId(psikologId)
      }
      if (existing) {
        psikologId = existing.id
      } else {
        psikologId = undefined
      }
    } else if (psikologId && psikologId !== '0') {
      const psi = await (this.repo as any).prisma.psikolog.findFirst({
        where: {
          OR: [
            { nama_gelar: { contains: psikologId, mode: 'insensitive' } },
            { account: { nama: { contains: psikologId, mode: 'insensitive' } } },
            { account: { email: { contains: psikologId, mode: 'insensitive' } } },
          ],
        },
      })
      if (psi) {
        psikologId = psi.id
      } else {
        psikologId = undefined
      }
    } else {
      psikologId = undefined
    }

    if (!psikologId && accountId) {
      const isAccountUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(accountId)
      if (isAccountUuid) {
        let psikolog = await this.repo.findPsikologByAccountId(accountId)
        if (!psikolog) {
          psikolog = await this.repo.findPsikologById(accountId)
        }
        if (psikolog) {
          psikologId = psikolog.id
        }
      }
    }

    if (!psikologId) {
      const firstPsikolog = await this.repo.findFirstPsikolog()
      if (firstPsikolog) {
        psikologId = firstPsikolog.id
      }
    }

    if (!psikologId) {
      throw new Error('Psikolog tidak ditemukan untuk membuka slot ini')
    }

    const parsedTanggal = parseDateString(input.tanggal)
    const parsedJamMulai = timeStringToDate(input.jam_mulai)
    const parsedJamSelesai = timeStringToDate(input.jam_selesai)

    if (parsedJamSelesai <= parsedJamMulai) {
      throw new Error('Jam selesai harus lebih akhir dari jam mulai')
    }

    const overlap = await this.repo.findOverlappingSlot(
      psikologId,
      parsedTanggal,
      parsedJamMulai,
      parsedJamSelesai
    )

    let metodeSlot = 'ONLINE'
    if (input.metode) {
      const upper = input.metode.toUpperCase()
      if (upper.includes('KEDUANYA') || (upper.includes('OFFLINE') && upper.includes('ONLINE'))) {
        metodeSlot = 'KEDUANYA'
      } else if (upper.includes('OFFLINE')) {
        metodeSlot = 'OFFLINE'
      } else {
        metodeSlot = 'ONLINE'
      }
    }

    if (overlap) {
      const booking = (overlap as any).booking_konsultasi
      const isRefunded =
        booking?.status === 'CANCELLED' ||
        booking?.transaksi?.status_pembayaran === 'REFUNDED'
      const isPendingUnpaid = booking?.status === 'PENDING'
      const isSlotAvailable = overlap.status === 'TERSEDIA'

      if ((input as any).force_release || isSlotAvailable || isRefunded || isPendingUnpaid) {
        if (booking && booking.status !== 'CANCELLED') {
          await (this.repo as any).prisma.bookingKonsultasi.update({
            where: { id: booking.id },
            data: { status: 'CANCELLED' },
          }).catch(() => {})

          if (overlap.id_psikolog) {
            await (this.repo as any).prisma.psikolog.update({
              where: { id: overlap.id_psikolog },
              data: { jumlah_sesi: { decrement: 1 } },
            }).catch(() => {})
          }
        }
      } else {
        const hasActiveBooking = booking && booking.status !== 'CANCELLED'
        if (hasActiveBooking) {
          throw new Error('Slot jam tersebut bentrok dengan jadwal konsultasi klien yang sudah ada')
        }
      }

      const overlapStart = formatTimeToString(overlap.jam_mulai)
      const overlapEnd = formatTimeToString(overlap.jam_selesai)
      const inputStart = formatTimeToString(parsedJamMulai)
      const inputEnd = formatTimeToString(parsedJamSelesai)

      const isExactSameTime = overlapStart === inputStart && overlapEnd === inputEnd

      if (!isExactSameTime) {
        // Jika slot lama memiliki riwayat booking (meski CANCELLED), JANGAN di-delete fisik (karena onDelete: Restrict).
        // Cukup perbarui jamnya dan aktifkan kembali sebagai TERSEDIA.
        if ((overlap as any).booking_konsultasi) {
          const updatedSlot = await (this.repo as any).prisma.jadwalSlot.update({
            where: { id: overlap.id },
            data: {
              jam_mulai: parsedJamMulai,
              jam_selesai: parsedJamSelesai,
              status: 'TERSEDIA',
              metode: metodeSlot,
              tipe_jadwal: input.tipe_jadwal || 'KONSULTASI',
            },
          })

          return {
            id: updatedSlot.id,
            id_psikolog: updatedSlot.id_psikolog,
            tanggal: formatDateToString(updatedSlot.tanggal),
            jam_mulai: formatTimeToString(updatedSlot.jam_mulai),
            jam_selesai: formatTimeToString(updatedSlot.jam_selesai),
            metode: (updatedSlot as any).metode || metodeSlot,
            status: 'TERSEDIA',
            tipe_jadwal: (updatedSlot as any).tipe_jadwal || 'KONSULTASI',
          }
        }

        // Jika slot benar-benar murni tanpa riwayat booking sama sekali:
        await (this.repo as any).prisma.jadwalSlot.delete({
          where: { id: overlap.id },
        }).catch(() => {})
      } else {
        // Jika slot jamnya SAMA PERSIS dan tidak ada booking aktif (misal slot sebelumnya berstatus TERSEDIA,
        // TIDAK_TERSEDIA, atau pernah dibooking tapi sesinya sudah DIBATALKAN):
        // Aktifkan / perbarui slot yang ada agar kembali TERSEDIA untuk klien
        const updatedSlot = await (this.repo as any).prisma.jadwalSlot.update({
          where: { id: overlap.id },
          data: {
            status: 'TERSEDIA',
            metode: metodeSlot,
            tipe_jadwal: input.tipe_jadwal || 'KONSULTASI',
          },
        })

        return {
          id: updatedSlot.id,
          id_psikolog: updatedSlot.id_psikolog,
          tanggal: formatDateToString(updatedSlot.tanggal),
          jam_mulai: formatTimeToString(updatedSlot.jam_mulai),
          jam_selesai: formatTimeToString(updatedSlot.jam_selesai),
          metode: (updatedSlot as any).metode || metodeSlot,
          status: 'TERSEDIA',
          tipe_jadwal: (updatedSlot as any).tipe_jadwal || 'KONSULTASI',
        }
      }
    }

    const newSlot = await this.repo.createJadwalSlot({
      id_psikolog: psikologId,
      tanggal: parsedTanggal,
      jam_mulai: parsedJamMulai,
      jam_selesai: parsedJamSelesai,
      tipe_jadwal: input.tipe_jadwal || 'KONSULTASI',
      metode: metodeSlot,
    })

    return {
      id: newSlot.id,
      id_psikolog: newSlot.id_psikolog,
      tanggal: formatDateToString(newSlot.tanggal),
      jam_mulai: formatTimeToString(newSlot.jam_mulai),
      jam_selesai: formatTimeToString(newSlot.jam_selesai),
      metode: (newSlot as any).metode || 'ONLINE',
      status: (newSlot as any).status || 'TERSEDIA',
      tipe_jadwal: (newSlot as any).tipe_jadwal || 'KONSULTASI',
    }
  }

  async deleteJadwalSlot(id: string, accountId?: string, role?: string) {
    const slot = await this.repo.findJadwalSlotById(id)
    if (!slot) {
      throw new Error('Slot jadwal tidak ditemukan')
    }

    const hasActiveBooking =
      slot.booking_konsultasi && slot.booking_konsultasi.status !== 'CANCELLED'

    if (slot.status === 'SUDAH_DIBOOKING' && hasActiveBooking) {
      throw new Error('Slot jadwal yang sudah dibooking aktif tidak dapat dihapus langsung. Batalkan booking sesi klien terlebih dahulu jika ingin membatalkan.')
    }

    const normalizedRole = (role || '').toUpperCase()

    // Aturan Bisnis: Admin HANYA mengelola slot jadwal Asesmen klinik.
    // Jadwal ketersediaan konsultasi diatur secara mandiri oleh Psikolog masing-masing di portal mereka.
    if (normalizedRole === 'ADMIN' && slot.tipe_jadwal !== 'ASESMEN') {
      throw new Error('Admin hanya berwenang mengelola slot jadwal asesmen klinik. Jadwal ketersediaan konsultasi dikelola mandiri oleh psikolog terkait di portal mereka.')
    }

    // Jika yang menghapus adalah PSIKOLOG, verifikasi kepemilikan slot
    if (normalizedRole === 'PSIKOLOG' && accountId) {
      const psi = await this.repo.findPsikologByAccountId(accountId)
      if (psi && slot.id_psikolog !== psi.id) {
        throw new Error('Anda tidak memiliki wewenang untuk menghapus slot jadwal milik psikolog lain')
      }
    }

    if (slot.booking_konsultasi) {
      // Karena id_jadwal memiliki foreign key restrict pada booking_konsultasi (meski CANCELLED),
      // jangan di-delete fisik. Cukup aktifkan kembali slot tersebut sebagai 'TERSEDIA' sesuai instruksi.
      await (this.repo as any).prisma.jadwalSlot.update({
        where: { id },
        data: { status: 'TERSEDIA' },
      })
      return { success: true, message: 'Slot jadwal berhasil diaktifkan kembali sebagai TERSEDIA' }
    }

    await this.repo.deleteJadwalSlot(id)
    return { success: true, message: 'Slot jadwal berhasil dihapus' }
  }

  // ── 3. Client Booking (Publik) ───────────────────────────────────────────────

  async createClientBooking(input: CreateClientBookingInput) {
    try {
      return await this.repo.createClientBooking(input)
    } catch (err: any) {
      if (
        err?.code === 'P2002' ||
        err?.message?.includes('P2002') ||
        (err?.meta?.target && String(err.meta.target).includes('id_jadwal'))
      ) {
        throw Object.assign(
          new Error('Mohon maaf, slot sesi ini baru saja dipesan oleh klien lain. Silakan pilih jadwal sesi lainnya.'),
          { statusCode: 409, code: 'P2002' }
        )
      }
      throw err
    }
  }

  async confirmPayment(bookingId: string) {
    return this.repo.confirmBookingPayment(bookingId)
  }

  async getAllBookings(params?: Record<string, unknown>, user?: { id?: string; role?: string; id_biro?: string }) {
    const role = (user?.role || '').toUpperCase()
    let filterBiroId: string | undefined = undefined

    // Jika Admin Biro, batasi hanya melihat booking klien dari biro tersebut
    if (role === 'BIRO') {
      filterBiroId = user?.id_biro || undefined
    }

    return this.repo.findAllBookings({
      ...(params as any),
      id_biro: filterBiroId,
    })
  }

  async getBookingById(id: string, user?: { id?: string; role?: string; id_biro?: string }) {
    if (!user || !user.id) {
      throw Object.assign(new Error('Silakan login terlebih dahulu'), { statusCode: 401 })
    }

    const item = await this.repo.findBookingById(id)
    if (!item) {
      throw Object.assign(new Error('Booking tidak ditemukan'), { statusCode: 404 })
    }

    const role = (user.role || '').toUpperCase()

    // 1. Super Admin: Boleh melihat semua booking
    if (role === 'ADMIN' || role === 'SUPERADMIN') {
      return item
    }

    // 2. Admin Biro: Hanya boleh melihat booking dari klien biro miliknya saja
    if (role === 'BIRO') {
      let userBiroId = user.id_biro
      if (!userBiroId) {
        const acc = await (this.repo as any).prisma.account.findUnique({
          where: { id: user.id },
          select: { id_biro: true },
        })
        userBiroId = acc?.id_biro
      }

      const clientBiroId = (item.client as any)?.id_biro

      if (!userBiroId || userBiroId !== clientBiroId) {
        throw Object.assign(
          new Error('Akses ditolak - Anda hanya dapat melihat data booking dari klien biro Anda'),
          { statusCode: 403 }
        )
      }
      return item
    }

    // 3. Psikolog: Hanya boleh melihat booking jadwal miliknya sendiri
    if (role === 'PSIKOLOG') {
      const psikologAccount = (item.jadwal?.psikolog as any)?.id_account
      const psikologId = item.jadwal?.id_psikolog

      let isMySchedule = Boolean(
        (psikologAccount && psikologAccount === user.id) ||
        (psikologId && psikologId === user.id)
      )

      if (!isMySchedule) {
        const psi = await (this.repo as any).prisma.psikolog.findUnique({
          where: { id_account: user.id },
          select: { id: true },
        })
        if (psi && psi.id === psikologId) {
          isMySchedule = true
        }
      }

      if (!isMySchedule) {
        throw Object.assign(
          new Error('Akses ditolak - Anda hanya dapat melihat data booking dari jadwal Anda sendiri'),
          { statusCode: 403 }
        )
      }
      return item
    }

    // 4. Peran lain atau publik dilarang mengakses
    throw Object.assign(
      new Error('Akses ditolak - Anda tidak memiliki izin untuk melihat data booking ini'),
      { statusCode: 403 }
    )
  }

  async cleanExpiredPendingBookings(maxAgeMinutes: number = 30) {
    const result = await this.repo.cancelExpiredPendingBookings(maxAgeMinutes)
    return {
      success: true,
      message: `${result.count} sesi booking pending yang kedaluwarsa berhasil dibatalkan dan slotnya telah dikembalikan.`,
      ...result,
    }
  }

  async getMyBookings(user?: { id?: string; email?: string; no_telepon?: string }) {
    if (!user) return []
    return this.repo.findBookingsByClientIdentifier({
      clientId: user.id,
      phone: user.no_telepon,
      email: user.email,
    })
  }

  async rescheduleBooking(
    idOrSlotId: string,
    input: RescheduleBookingInput,
    user?: { id: string; role?: string; email?: string }
  ) {
    try {
      return await this.repo.rescheduleBooking(idOrSlotId, input, user)
    } catch (err: any) {
      if (
        err?.code === 'P2002' ||
        err?.message?.includes('P2002') ||
        (err?.meta?.target && String(err.meta.target).includes('id_jadwal'))
      ) {
        throw Object.assign(
          new Error('Mohon maaf, slot sesi ini baru saja dipesan oleh klien lain. Silakan pilih jadwal sesi lainnya.'),
          { statusCode: 409, code: 'P2002' }
        )
      }
      throw err
    }
  }
}
