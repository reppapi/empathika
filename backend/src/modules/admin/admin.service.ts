import type { FastifyInstance } from 'fastify'
import { AdminRepository } from './admin.repository'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
} from './admin.schema'
import type { StatusBooking } from '@prisma/client'
import {
  parseDateString,
  timeStringToDate,
  formatDateToString,
  formatTimeToString,
} from '../../utils/date-time'

export class AdminService {
  private repo: AdminRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new AdminRepository(fastify.prisma)
  }

  async getJadwalOverview(query: GetAdminJadwalQuery) {
    const selectedDate = query.date ? parseDateString(query.date) : new Date()

    // 1. Ambil Sesi Hari Ini
    const rawTodaySessions = await this.repo.findTodaySessions(selectedDate)

    const todaySessions = rawTodaySessions.map((s) => {
      const jamMulaiStr = formatTimeToString(s.jadwal.jam_mulai)
      const jamSelesaiStr = formatTimeToString(s.jadwal.jam_selesai)

      // Hitung label status operasional
      let statusLabel = 'Menunggu Jadwal'
      if (s.status === 'COMPLETED') {
        statusLabel = 'Selesai'
      } else if (s.status === 'CANCELLED') {
        statusLabel = 'Dibatalkan'
      }

      // Format link nomor WA
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

  async createJadwalSlot(input: CreateAdminJadwalSlotInput) {
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
      tanggal: formatDateToString(booking.jadwal.tanggal),
      jam: `${formatTimeToString(booking.jadwal.jam_mulai)} - ${formatTimeToString(booking.jadwal.jam_selesai)}`,
      metode: booking.metode,
      status: booking.status,
    }
  }

  async updateBookingStatus(id: string, status: StatusBooking) {
    return this.repo.updateBookingStatus(id, status)
  }
}
