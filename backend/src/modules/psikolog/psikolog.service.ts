import type { FastifyInstance } from 'fastify'
import { PsikologRepository } from './psikolog.repository'
import bcrypt from 'bcrypt'
import type {
  GetJadwalTersediaQuery,
  GetJadwalPsikologMeQuery,
  CreateJadwalSlotInput,
  CreatePsikologInput,
  UpdatePsikologInput,
  UpdatePsikologProfileInput,
} from './psikolog.schema'
import {
  parseDateString,
  timeStringToDate,
  formatDateToString,
  formatTimeToString,
} from '../../utils/date-time'

let legacySlotsPurged = false

export class PsikologService {
  private repo: PsikologRepository
  private prisma: any

  constructor(fastify: FastifyInstance) {
    this.repo = new PsikologRepository(fastify.prisma)
    this.prisma = fastify.prisma
  }

  private async purgeLegacyUnbookedSlots() {
    if (!legacySlotsPurged && this.prisma?.jadwalSlot) {
      legacySlotsPurged = true
      try {
        const unbooked = await this.prisma.jadwalSlot.findMany({
          where: {
            status: 'TERSEDIA',
            booking_konsultasi: null,
          },
          select: { id: true },
        })
        if (unbooked && unbooked.length > 0) {
          await this.prisma.jadwalSlot.deleteMany({
            where: { id: { in: unbooked.map((s: { id: string }) => s.id) } },
          })
        }
      } catch {}
    }
  }

  async getAll(params?: { kategori?: string; search?: string; status?: string }) {
    await this.purgeLegacyUnbookedSlots()
    const list = await this.repo.findAll(params)

    // Hitung total booking riil langsung dari tabel booking_konsultasi
    const countMap: Record<string, number> = {}
    try {
      const activeBookings = await this.prisma.bookingKonsultasi.findMany({
        where: { status: { not: 'BATAL' } },
        select: { jadwal: { select: { id_psikolog: true } } },
      })
      for (const b of activeBookings) {
        const psiId = b.jadwal?.id_psikolog
        if (psiId) {
          countMap[psiId] = (countMap[psiId] || 0) + 1
        }
      }
    } catch {}

    return list.map((item: any) => ({
      ...item,
      jumlah_sesi: countMap[item.id] || 0,
    }))
  }

  async getById(id: string) {
    await this.purgeLegacyUnbookedSlots()
    const item: any = await this.repo.findById(id)
    if (!item) throw new Error('Psikolog tidak ditemukan')

    let bookedCount = 0
    try {
      bookedCount = await this.prisma.bookingKonsultasi.count({
        where: {
          jadwal: { id_psikolog: item.id },
          status: { not: 'BATAL' },
        },
      })
    } catch {}

    return {
      ...item,
      jumlah_sesi: bookedCount,
    }
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

    const isUuid =
      targetPsikologId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        targetPsikologId
      )
    if (!isUuid) {
      const defaultPsikolog = await (this.repo as any).prisma.psikolog.findFirst()
      if (defaultPsikolog) {
        targetPsikologId = defaultPsikolog.id
      }
    } else {
      const exists = await (this.repo as any).prisma.psikolog.findUnique({
        where: { id: targetPsikologId },
      })
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
      label_waktu: `${formatTimeToString(newSlot.jam_mulai)} - ${formatTimeToString(
        newSlot.jam_selesai
      )}`,
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
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
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
      const clientName = existingBooking.client?.nama
        ? `klien "${existingBooking.client.nama}"`
        : 'klien'
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
   * Mengambil profil psikolog yang sedang login
   */
  async getMyProfile(accountId?: string) {
    let psikolog = accountId
      ? await this.prisma.psikolog.findUnique({
          where: { id_account: accountId },
          include: {
            spesialisasi: true,
            account: {
              select: {
                id: true,
                nama: true,
                email: true,
                no_telepon: true,
                foto: true,
                bio: true,
                role: true,
              },
            },
          },
        })
      : null

    if (!psikolog) {
      psikolog = await this.prisma.psikolog.findFirst({
        include: {
          spesialisasi: true,
          account: {
            select: {
              id: true,
              nama: true,
              email: true,
              no_telepon: true,
              foto: true,
              bio: true,
              role: true,
            },
          },
        },
      })
    }

    if (!psikolog) {
      throw new Error('Data profil psikolog tidak ditemukan')
    }

    // Hitung jumlah sesi riil dari booking
    let bookedCount = 0
    try {
      bookedCount = await this.prisma.bookingKonsultasi.count({
        where: {
          jadwal: { id_psikolog: psikolog.id },
          status: { not: 'BATAL' },
        },
      })
    } catch {}

    return {
      ...psikolog,
      jumlah_sesi: bookedCount,
    }
  }

  /**
   * Mengupdate profil psikolog yang sedang login
   */
  async updateMyProfile(accountId: string | undefined, body: UpdatePsikologProfileInput) {
    let psikolog = accountId
      ? await this.prisma.psikolog.findUnique({
          where: { id_account: accountId },
        })
      : null

    if (!psikolog) {
      psikolog = await this.prisma.psikolog.findFirst()
    }

    if (!psikolog) {
      throw new Error('Data profil psikolog tidak ditemukan')
    }

    const accountUpdateData: Record<string, any> = {}
    if (body.nama !== undefined) accountUpdateData.nama = body.nama
    if (body.email !== undefined && body.email.trim()) accountUpdateData.email = body.email.trim()
    if (body.password !== undefined && body.password.trim()) {
      accountUpdateData.password = await bcrypt.hash(body.password.trim(), 10)
    }
    if (body.no_telepon !== undefined) accountUpdateData.no_telepon = body.no_telepon
    if (body.foto !== undefined) accountUpdateData.foto = body.foto
    if (body.bio !== undefined) accountUpdateData.bio = body.bio

    if (Object.keys(accountUpdateData).length > 0) {
      await this.prisma.account.update({
        where: { id: psikolog.id_account },
        data: accountUpdateData,
      })
    }

    // Tangani spesialisasi jika dikirim
    let spesialisasiId = psikolog.id_spesialisasi
    if (body.spesialisasi && body.spesialisasi.trim()) {
      const specNama = body.spesialisasi.trim()
      let spec = await this.prisma.spesialisasi.findFirst({
        where: { nama: { equals: specNama, mode: 'insensitive' } },
      })
      if (!spec) {
        spec = await this.prisma.spesialisasi.create({
          data: { nama: specNama },
        })
      }
      spesialisasiId = spec.id
    }

    let keahlianStr: string | undefined = undefined
    if (body.keahlian !== undefined) {
      keahlianStr = Array.isArray(body.keahlian) ? body.keahlian.join(', ') : body.keahlian
    }

    let profilLengkapStr: string | undefined = undefined
    if (body.profil_lengkap !== undefined) {
      profilLengkapStr = Array.isArray(body.profil_lengkap)
        ? body.profil_lengkap.join('\n\n')
        : body.profil_lengkap
    }

    const psikologUpdateData: Record<string, any> = {}
    if (body.nama !== undefined) psikologUpdateData.nama_gelar = body.nama
    if (body.foto !== undefined) psikologUpdateData.foto = body.foto
    if (body.bio !== undefined) psikologUpdateData.bio = body.bio
    if (body.quote !== undefined) psikologUpdateData.quote = body.quote
    if (body.instagram !== undefined) psikologUpdateData.instagram = body.instagram
    if (body.no_str !== undefined) psikologUpdateData.no_str = body.no_str
    if (body.no_sipp !== undefined) psikologUpdateData.no_sipp = body.no_sipp
    if (body.no_silp !== undefined) psikologUpdateData.no_silp = body.no_silp
    if (spesialisasiId !== psikolog.id_spesialisasi) psikologUpdateData.id_spesialisasi = spesialisasiId
    if (keahlianStr !== undefined) psikologUpdateData.keahlian = keahlianStr
    if (body.pendidikan !== undefined) psikologUpdateData.pendidikan = body.pendidikan
    if (body.pengalaman_tahun !== undefined)
      psikologUpdateData.pengalaman_tahun = body.pengalaman_tahun
    if (body.jenis_kelamin !== undefined) psikologUpdateData.jenis_kelamin = body.jenis_kelamin
    if (body.video_intro_url !== undefined)
      psikologUpdateData.video_intro_url = body.video_intro_url
    if (body.video_thumbnail !== undefined)
      psikologUpdateData.video_thumbnail = body.video_thumbnail
    if (body.video_duration !== undefined)
      psikologUpdateData.video_duration = body.video_duration
    if (profilLengkapStr !== undefined) psikologUpdateData.profil_lengkap = profilLengkapStr
    if (body.tarif_per_jam !== undefined) psikologUpdateData.tarif_per_jam = body.tarif_per_jam

    const updated = await this.prisma.psikolog.update({
      where: { id: psikolog.id },
      data: psikologUpdateData,
      include: {
        spesialisasi: true,
        account: {
          select: {
            id: true,
            nama: true,
            email: true,
            no_telepon: true,
            foto: true,
            bio: true,
            role: true,
          },
        },
      },
    })

    return updated
  }

  /**
   * Menambahkan atau memperbarui tenaga ahli baru dari dashboard admin
   */
  async registerPsikologBaru(body: any) {
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

    const pengalamanTahun = body.pengalaman_tahun || body.experienceYears || null
    const jenisKelamin = body.jenis_kelamin || body.jenisKelamin || null
    const videoIntroUrl = body.video_intro_url || body.videoIntroUrl || null
    const videoThumbnail = body.video_thumbnail || body.videoThumbnail || null
    const videoDuration = body.video_duration || body.videoDuration || null
    const profilLengkap =
      Array.isArray(body.profil_lengkap || body.profilLengkap)
        ? (body.profil_lengkap || body.profilLengkap).join('\n\n')
        : (body.profil_lengkap || body.profilLengkap || null)

    // Cek apakah ada data psikolog yang diedit berdasarkan body.id
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
          pengalaman_tahun: pengalamanTahun,
          quote: body.quote || null,
          instagram: body.instagram || null,
          keahlian: keahlianStr,
          jenis_kelamin: jenisKelamin,
          foto: body.foto || null,
          bio: body.bio || null,
          video_intro_url: videoIntroUrl,
          video_thumbnail: videoThumbnail,
          video_duration: videoDuration,
          profil_lengkap: profilLengkap,
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

      const passwordToHash = body.password || 'Psikolog123!'
      const hashedPassword = await bcrypt.hash(passwordToHash, 10)

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
            pengalaman_tahun: pengalamanTahun,
            quote: body.quote || null,
            instagram: body.instagram || null,
            keahlian: keahlianStr,
            jenis_kelamin: jenisKelamin,
            foto: body.foto || null,
            bio: body.bio || null,
            video_intro_url: videoIntroUrl,
            video_thumbnail: videoThumbnail,
            video_duration: videoDuration,
            profil_lengkap: profilLengkap,
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
            pengalaman_tahun: pengalamanTahun,
            quote: body.quote || null,
            instagram: body.instagram || null,
            keahlian: keahlianStr,
            jenis_kelamin: jenisKelamin,
            foto: body.foto || null,
            bio: body.bio || null,
            video_intro_url: videoIntroUrl,
            video_thumbnail: videoThumbnail,
            video_duration: videoDuration,
            profil_lengkap: profilLengkap,
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

    return psikolog
  }
}
