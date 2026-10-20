import type { FastifyInstance } from 'fastify'
import { PsikologRepository } from './psikolog.repository'
import type {
  GetJadwalTersediaQuery,
  GetJadwalPsikologMeQuery,
  CreateJadwalSlotInput,
  CreatePsikologInput,
  UpdatePsikologInput,
} from './psikolog.schema'
import {
  parseDateString,
  timeStringToDate,
  formatDateToString,
  formatTimeToString,
} from '../../utils/date-time'

export class PsikologService {
  private repo: PsikologRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new PsikologRepository(fastify.prisma)
  }

  async getAll(params?: { kategori?: string; search?: string }) {
    return this.repo.findAll(params)
  }

  async getById(id: string) {
    const item = await this.repo.findById(id)
    if (!item) throw new Error('Psikolog tidak ditemukan')
    return item
  }

  /**
   * Mengambil slot ketersediaan untuk Client (Tamu)
   */
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

  /**
   * Mengambil jadwal mingguan / agenda milik Psikolog yang sedang login
   */
  async getJadwalSaya(accountId?: string, query?: GetJadwalPsikologMeQuery) {
    let psikolog = accountId ? await this.repo.findByAccountId(accountId) : null
    if (!psikolog) {
      psikolog = await (this.repo as any).prisma.psikolog.findFirst({
        include: { spesialisasi: true },
      })
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

  /**
   * Menambahkan slot ketersediaan baru
   */
  async createJadwalSlot(input: CreateJadwalSlotInput, accountId?: string) {
    let targetPsikologId = input.id_psikolog

    if (accountId) {
      const psikolog = await this.repo.findByAccountId(accountId)
      if (!psikolog) {
        throw new Error('Data profil psikolog tidak ditemukan')
      }
      targetPsikologId = psikolog.id
    }

    const isUuid = targetPsikologId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetPsikologId)
    if (!isUuid) {
      const defaultPsikolog = await (this.repo as any).prisma.psikolog.findFirst()
      if (defaultPsikolog) {
        targetPsikologId = defaultPsikolog.id
      }
    } else {
      const exists = await (this.repo as any).prisma.psikolog.findUnique({ where: { id: targetPsikologId } })
      if (!exists) {
        const defaultPsikolog = await (this.repo as any).prisma.psikolog.findFirst()
        if (defaultPsikolog) {
          targetPsikologId = defaultPsikolog.id
        }
      }
    }

    if (!targetPsikologId) {
      throw new Error('ID Psikolog wajib ditentukan')
    }

    const psikologId: string = targetPsikologId

    const parsedTanggal = parseDateString(input.tanggal)
    const parsedJamMulai = timeStringToDate(input.jam_mulai)
    const parsedJamSelesai = timeStringToDate(input.jam_selesai)

    if (parsedJamSelesai <= parsedJamMulai) {
      throw new Error('Jam selesai harus lebih akhir dari jam mulai')
    }

    // Cek bentrok jam
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
      label_waktu: `${formatTimeToString(newSlot.jam_mulai)} - ${formatTimeToString(newSlot.jam_selesai)}`,
      status: newSlot.status,
      tipe_jadwal: newSlot.tipe_jadwal,
    }
  }

  /**
   * Menghapus slot ketersediaan yang belum dibooking
   */
  async deleteJadwalSlot(slotId: string, accountId?: string) {
    const slot = await this.repo.findJadwalSlotById(slotId)
    if (!slot) {
      throw new Error('Slot jadwal tidak ditemukan')
    }

    if (accountId) {
      const psikolog = await this.repo.findByAccountId(accountId)
      if (!psikolog || slot.id_psikolog !== psikolog.id) {
        throw new Error('Anda tidak memiliki akses untuk menghapus slot ini')
      }
    }

    if (slot.status !== 'TERSEDIA' || slot.booking_konsultasi) {
      throw new Error('Slot jadwal yang sudah dibooking tidak dapat dihapus')
    }

    await this.repo.deleteJadwalSlot(slotId)
    return { success: true, message: 'Slot jadwal berhasil dihapus' }
  }

  async create(data: CreatePsikologInput) {
    return this.repo.create(data as any)
  }

  async update(id: string, data: UpdatePsikologInput) {
    return this.repo.update(id, data as any)
  }

  async delete(id: string) {
    return this.repo.delete(id)
  }
}
