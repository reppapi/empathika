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
} from './booking.schema'
import type { StatusBooking } from '@prisma/client'
import {
  parseDateString,
  timeStringToDate,
  formatDateToString,
  formatTimeToString,
} from '../../utils/date-time'

export class BookingService {
  private repo: BookingRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new BookingRepository(fastify.prisma)
  }

  // ── 1. Admin: Overview & Sesi ────────────────────────────────────────────────

  async getJadwalOverview(query: GetAdminJadwalQuery) {
    const selectedDate = query.date ? parseDateString(query.date) : new Date()

    // 1. Ambil Sesi Hari Ini
    const rawTodaySessions = await this.repo.findTodaySessions(selectedDate)

    const todaySessions = rawTodaySessions.map((s) => {
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

      return {
        id: s.id,
        idKlien: `K-${s.client.id.slice(0, 4).toUpperCase()}`,
        namaKlien: s.client.nama,
        noTelepon: s.client.no_telepon || '',
        waLink: waNumber ? `https://wa.me/${waNumber}` : null,
        layanan: s.layanan.nama,
        psikolog: s.jadwal.psikolog?.nama_gelar || 'Belum Ditentukan',
        jamMulai: jamMulaiStr,
        jamSelesai: jamSelesaiStr,
        waktuRange: `${jamMulaiStr} - ${jamSelesaiStr}`,
        metode: s.metode === 'OFFLINE' ? 'Offline' : 'Online',
        status: statusLabel,
        rawStatus: s.status,
        deskripsiTrauma: s.deskripsi_trauma,
      }
    })

    // 2. Ambil Seluruh Slot & Grid Mingguan
    const allSlots = await this.repo.findJadwalSlots(query)

    const weeklyGrid = allSlots.map((slot) => {
      const dateStr = formatDateToString(slot.tanggal)
      const jamMulaiStr = formatTimeToString(slot.jam_mulai)
      const jamSelesaiStr = formatTimeToString(slot.jam_selesai)
      const timeSlot = `${jamMulaiStr} - ${jamSelesaiStr}`

      return {
        id: slot.id,
        date: dateStr,
        timeSlot,
        statusSlot: slot.status,
        psikologName: slot.psikolog?.nama_gelar || '',
        layanan: slot.booking_konsultasi?.layanan?.nama || (slot.status === 'TERSEDIA' ? 'Slot Tersedia' : 'Terjadwal'),
        clientName: slot.booking_konsultasi?.client?.nama || '',
        metode: slot.booking_konsultasi?.metode === 'OFFLINE' ? 'Offline' : 'Online',
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

    const overlap = await this.repo.findOverlappingSlot(
      input.id_psikolog,
      parsedTanggal,
      parsedJamMulai,
      parsedJamSelesai
    )

    if (overlap) {
      throw new Error('Slot jam tersebut bentrok dengan jadwal yang sudah ada')
    }

    const newSlot = await this.repo.createJadwalSlot({
      id_psikolog: input.id_psikolog,
      tanggal: parsedTanggal,
      jam_mulai: parsedJamMulai,
      jam_selesai: parsedJamSelesai,
      tipe_jadwal: input.tipe_jadwal || 'ASESMEN',
    })

    return {
      id: newSlot.id,
      id_psikolog: newSlot.id_psikolog,
      tanggal: formatDateToString(newSlot.tanggal),
      jam_mulai: formatTimeToString(newSlot.jam_mulai),
      jam_selesai: formatTimeToString(newSlot.jam_selesai),
      status: newSlot.status,
      tipe_jadwal: newSlot.tipe_jadwal,
    }
  }

  async createAdminSesi(input: CreateAdminSesiInput) {
    const parsedTanggal = parseDateString(input.tanggal)
    const parsedJamMulai = timeStringToDate(input.jam_mulai)
    const parsedJamSelesai = timeStringToDate(input.jam_selesai)

    if (parsedJamSelesai <= parsedJamMulai) {
      throw new Error('Jam selesai harus lebih akhir dari jam mulai')
    }

    const overlap = await this.repo.findOverlappingSlot(
      input.id_psikolog,
      parsedTanggal,
      parsedJamMulai,
      parsedJamSelesai
    )

    if (overlap) {
      throw new Error('Slot jam tersebut bentrok dengan jadwal lain')
    }

    const booking = await this.repo.createAdminSesi({
      id_psikolog: input.id_psikolog,
      id_layanan: input.id_layanan,
      tanggal: parsedTanggal,
      jam_mulai: parsedJamMulai,
      jam_selesai: parsedJamSelesai,
      metode: input.metode,
      deskripsi_trauma: input.deskripsi_trauma,
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

  // ── 2. Psikolog: Slot Ketersediaan & Agenda ──────────────────────────────────

  async getJadwalTersedia(query: GetJadwalTersediaQuery) {
    const slots = await this.repo.findJadwalTersedia(query)

    return slots.map((slot) => ({
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
      status: slot.status,
      tipe_jadwal: slot.tipe_jadwal,
    }))
  }

  async getJadwalSaya(accountId?: string, query?: GetJadwalPsikologMeQuery) {
    let psikolog = accountId ? await this.repo.findPsikologByAccountId(accountId) : null
    if (!psikolog && accountId) {
      psikolog = await this.repo.findPsikologById(accountId)
    }
    if (!psikolog && query?.id_psikolog) {
      psikolog = await this.repo.findPsikologById(query.id_psikolog)
    }
    if (!psikolog) {
      psikolog = await this.repo.findFirstPsikolog()
    }
    if (!psikolog) {
      throw new Error('Data profil tenaga ahli tidak ditemukan')
    }

    const slots = await this.repo.findJadwalByPsikologId(psikolog.id, query)

    return {
      psikolog: {
        id: psikolog.id,
        nama_gelar: psikolog.nama_gelar,
        kategori: psikolog.kategori,
      },
      slots: slots.map((slot) => ({
        id: slot.id,
        date: formatDateToString(slot.tanggal),
        waktu: `${formatTimeToString(slot.jam_mulai)} - ${formatTimeToString(slot.jam_selesai)}`,
        jam_mulai: formatTimeToString(slot.jam_mulai),
        jam_selesai: formatTimeToString(slot.jam_selesai),
        status: slot.status,
        tipe_jadwal: slot.tipe_jadwal,
        booking: slot.booking_konsultasi
          ? {
              id_booking: slot.booking_konsultasi.id,
              kode_pesanan: slot.booking_konsultasi.kode_pesanan,
              nama_klien: slot.booking_konsultasi.client?.nama,
              no_telepon_klien: slot.booking_konsultasi.client?.no_telepon,
              layanan: slot.booking_konsultasi.layanan?.nama,
              metode: slot.booking_konsultasi.metode,
              status_booking: slot.booking_konsultasi.status,
              deskripsi_trauma: slot.booking_konsultasi.deskripsi_trauma,
            }
          : null,
      })),
    }
  }

  async createPsikologJadwalSlot(input: CreateJadwalSlotInput, accountId?: string) {
    let psikologId = input.id_psikolog

    if (psikologId) {
      const existing = await this.repo.findPsikologById(psikologId)
      if (!existing) {
        psikologId = undefined
      }
    }

    if (!psikologId && accountId) {
      let psikolog = await this.repo.findPsikologByAccountId(accountId)
      if (!psikolog) {
        psikolog = await this.repo.findPsikologById(accountId)
      }
      if (psikolog) {
        psikologId = psikolog.id
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

    if (overlap) {
      throw new Error('Slot jam tersebut bentrok dengan jadwal yang sudah ada')
    }

    const newSlot = await this.repo.createJadwalSlot({
      id_psikolog: psikologId,
      tanggal: parsedTanggal,
      jam_mulai: parsedJamMulai,
      jam_selesai: parsedJamSelesai,
      tipe_jadwal: input.tipe_jadwal || 'KONSULTASI',
    })

    return {
      id: newSlot.id,
      id_psikolog: newSlot.id_psikolog,
      tanggal: formatDateToString(newSlot.tanggal),
      jam_mulai: formatTimeToString(newSlot.jam_mulai),
      jam_selesai: formatTimeToString(newSlot.jam_selesai),
      status: newSlot.status,
      tipe_jadwal: newSlot.tipe_jadwal,
    }
  }

  async deleteJadwalSlot(id: string, _accountId?: string) {
    const slot = await this.repo.findJadwalSlotById(id)
    if (!slot) {
      throw new Error('Slot jadwal tidak ditemukan')
    }

    if (slot.status !== 'TERSEDIA' || slot.booking_konsultasi) {
      throw new Error('Slot jadwal yang sudah dibooking tidak dapat dihapus')
    }

    await this.repo.deleteJadwalSlot(id)
    return { success: true, message: 'Slot jadwal berhasil dihapus' }
  }

  // ── 3. Client Booking (Publik) ───────────────────────────────────────────────

  async createClientBooking(input: CreateClientBookingInput) {
    return this.repo.createClientBooking(input)
  }

  async getAllBookings(params?: Record<string, unknown>) {
    return this.repo.findAllBookings(params)
  }

  async getBookingById(id: string) {
    const item = await this.repo.findBookingById(id)
    if (!item) throw new Error('Booking tidak ditemukan')
    return item
  }
}
