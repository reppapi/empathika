import type { FastifyInstance } from 'fastify'
import { PsikologRepository } from './psikolog.repository'
import bcrypt from 'bcrypt'
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
  private prisma: any

  constructor(fastify: FastifyInstance) {
    this.repo = new PsikologRepository(fastify.prisma)
    this.prisma = fastify.prisma
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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    let psikolog = null
    if (isUuid) {
      psikolog = await this.prisma.psikolog.findFirst({
        where: {
          OR: [{ id }, { id_account: id }],
        },
      })
    }

    if (!psikolog) {
      psikolog = await this.prisma.psikolog.findFirst({
        where: {
          OR: [
            { nama_gelar: { equals: id, mode: 'insensitive' } },
            { account: { email: { equals: id, mode: 'insensitive' } } },
          ],
        },
      })
    }

    if (!psikolog) {
      return { success: true, message: 'Data tidak ditemukan atau sudah terhapus' }
    }

    // 1. Cek apakah psikolog ini memiliki data booking konsultasi dari klien
    const existingBooking = await this.prisma.bookingKonsultasi.findFirst({
      where: {
        jadwal: {
          id_psikolog: psikolog.id,
        },
      },
      include: {
        client: true,
      },
    })

    if (existingBooking) {
      const clientName = existingBooking.client?.nama ? `klien "${existingBooking.client.nama}"` : 'klien'
      throw new Error(
        `Psikolog ${psikolog.nama_gelar} tidak dapat dihapus karena sudah memiliki riwayat booking konsultasi dari ${clientName}. Anda dapat mengubah status hak aksesnya menjadi NONAKTIF.`
      )
    }

    // 2. Jika tidak ada booking dari klien, bersihkan slot jadwal ketersediaan kosong yang belum dibooking
    await this.prisma.jadwalSlot
      .deleteMany({
        where: { id_psikolog: psikolog.id },
      })
      .catch(() => {})

    // 3. Hapus data profil psikolog
    const accountId = psikolog.id_account
    await this.prisma.psikolog.delete({
      where: { id: psikolog.id },
    })

    // 4. Hapus juga akun login terkait
    if (accountId) {
      await this.prisma.account
        .delete({
          where: { id: accountId },
        })
        .catch(() => {})
    }

    return { success: true, message: 'Psikolog berhasil dihapus dari database' }
  }

  /**
   * Menambahkan atau memperbarui tenaga ahli baru dari dashboard admin
   * Membuat Akun login, Profil Tenaga Ahli, Spesialisasi, dan Slot Jadwal default di database
   */
  async registerPsikologBaru(body: any) {
    const passwordToHash = body.password || 'Psikolog123!'
    const hashedPassword = await bcrypt.hash(passwordToHash, 10)

    // Cari atau buat Spesialisasi
    const spesialisasiNama = body.spesialisasi || 'Psikologi Umum'
    let spesialisasi = await this.prisma.spesialisasi.findFirst({
      where: { nama: { equals: spesialisasiNama, mode: 'insensitive' } },
    })
    if (!spesialisasi) {
      spesialisasi = await this.prisma.spesialisasi.create({
        data: { nama: spesialisasiNama },
      })
    }

    // Format kategori & keahlian
    const kat = (body.kategori || '').toLowerCase()
    const kategoriFormatted = kat.includes('peer')
      ? 'Peer Konselor'
      : kat.includes('konselor')
      ? 'Konselor'
      : 'Psikolog Klinis'

    const keahlianStr =
      Array.isArray(body.keahlian) && body.keahlian.length > 0
        ? body.keahlian.join(', ')
        : typeof body.keahlian === 'string' && body.keahlian.trim()
        ? body.keahlian.trim()
        : null

    const tarif =
      body.tarif_per_jam ||
      (kat.includes('peer') ? 50000 : kat.includes('konselor') ? 100000 : 150000)

    // 1. Cek apakah ada data psikolog yang diedit berdasarkan body.id
    const isUuid =
      body.id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id)
    let existingPsikolog = null
    if (isUuid) {
      existingPsikolog = await this.prisma.psikolog.findFirst({
        where: {
          OR: [{ id: body.id }, { id_account: body.id }],
        },
        include: { account: true },
      })
    }

    let account = null
    let psikolog = null

    if (existingPsikolog) {
      // MODE EDIT: Update akun dan profil psikolog yang sudah ada
      account = await this.prisma.account.update({
        where: { id: existingPsikolog.id_account },
        data: {
          nama: body.nama,
          email: body.email || existingPsikolog.account?.email,
          no_telepon: body.noTelepon || existingPsikolog.account?.no_telepon,
          foto: body.foto || existingPsikolog.account?.foto,
          bio: body.bio || existingPsikolog.account?.bio,
          role: 'PSIKOLOG',
          aktif: body.statusAkses !== 'NONAKTIF',
        },
      })

      psikolog = await this.prisma.psikolog.update({
        where: { id: existingPsikolog.id },
        data: {
          id_spesialisasi: spesialisasi.id,
          kategori: kategoriFormatted,
          nama_gelar: body.nama,
          no_str: body.noStr || null,
          no_sipp: body.noSipp || null,
          pendidikan: body.pendidikanText || body.pendidikan || null,
          quote: body.quote || null,
          instagram: body.instagram || null,
          keahlian: keahlianStr,
          foto: body.foto || null,
          bio: body.bio || null,
          status: body.statusAkses === 'NONAKTIF' ? 'INACTIVE' : 'ACTIVE',
          tarif_per_jam: tarif,
        },
        include: {
          spesialisasi: true,
          account: true,
        },
      })
    } else {
      // MODE CREATE / UPSERT: Cek berdasarkan email
      account = await this.prisma.account.findUnique({
        where: { email: body.email },
      })

      if (account) {
        account = await this.prisma.account.update({
          where: { id: account.id },
          data: {
            nama: body.nama,
            no_telepon: body.noTelepon || account.no_telepon,
            foto: body.foto || account.foto,
            bio: body.bio || account.bio,
            role: 'PSIKOLOG',
            aktif: body.statusAkses !== 'NONAKTIF',
          },
        })
      } else {
        account = await this.prisma.account.create({
          data: {
            nama: body.nama,
            email: body.email,
            password: hashedPassword,
            role: 'PSIKOLOG',
            no_telepon: body.noTelepon || null,
            foto: body.foto || null,
            bio: body.bio || null,
            aktif: body.statusAkses !== 'NONAKTIF',
          },
        })
      }

      psikolog = await this.prisma.psikolog.findUnique({
        where: { id_account: account.id },
      })

      if (psikolog) {
        psikolog = await this.prisma.psikolog.update({
          where: { id: psikolog.id },
          data: {
            id_spesialisasi: spesialisasi.id,
            kategori: kategoriFormatted,
            nama_gelar: body.nama,
            no_str: body.noStr || null,
            no_sipp: body.noSipp || null,
            pendidikan: body.pendidikanText || body.pendidikan || null,
            quote: body.quote || null,
            instagram: body.instagram || null,
            keahlian: keahlianStr,
            foto: body.foto || null,
            bio: body.bio || null,
            status: body.statusAkses === 'NONAKTIF' ? 'INACTIVE' : 'ACTIVE',
            tarif_per_jam: tarif,
          },
          include: {
            spesialisasi: true,
            account: true,
          },
        })
      } else {
        psikolog = await this.prisma.psikolog.create({
          data: {
            id_account: account.id,
            id_spesialisasi: spesialisasi.id,
            kategori: kategoriFormatted,
            nama_gelar: body.nama,
            no_str: body.noStr || null,
            no_sipp: body.noSipp || null,
            pendidikan: body.pendidikanText || body.pendidikan || null,
            quote: body.quote || null,
            instagram: body.instagram || null,
            keahlian: keahlianStr,
            foto: body.foto || null,
            bio: body.bio || null,
            status: body.statusAkses === 'NONAKTIF' ? 'INACTIVE' : 'ACTIVE',
            tarif_per_jam: tarif,
          },
          include: {
            spesialisasi: true,
            account: true,
          },
        })
      }
    }

    // 5. Generate slot ketersediaan default jika belum ada slot
    try {
      const existingSlots = await this.prisma.jadwalSlot.count({
        where: { id_psikolog: psikolog.id },
      })

      if (existingSlots === 0) {
        const today = new Date()
        const defaultHours = [
          { start: '09:00', end: '10:00' },
          { start: '10:00', end: '11:00' },
          { start: '13:00', end: '14:00' },
          { start: '14:00', end: '15:00' },
          { start: '15:00', end: '16:00' },
        ]

        for (let i = 0; i < 3; i++) {
          const slotDate = new Date(today)
          slotDate.setDate(today.getDate() + i)
          const slotDateOnly = new Date(
            Date.UTC(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate())
          )

          for (const h of defaultHours) {
            const startDateTime = new Date(`1970-01-01T${h.start}:00Z`)
            const endDateTime = new Date(`1970-01-01T${h.end}:00Z`)
            await this.prisma.jadwalSlot.create({
              data: {
                id_psikolog: psikolog.id,
                tanggal: slotDateOnly,
                jam_mulai: startDateTime,
                jam_selesai: endDateTime,
                tipe_jadwal: 'KONSULTASI',
                status: 'TERSEDIA',
              },
            }).catch((_err) => {
              // Abaikan jika slot sudah ada
            })
          }
        }
      }
    } catch (slotErr) {
      console.warn('Gagal generate slot default untuk psikolog baru:', slotErr)
    }

    return psikolog
  }
}

