import type { FastifyInstance } from 'fastify'
import { PsikologRepository } from './psikolog.repository'
import { BookingService } from '../booking/booking.service'
import bcrypt from 'bcrypt'
import type {
  GetJadwalTersediaQuery,
  GetJadwalPsikologMeQuery,
  CreateJadwalSlotInput,
  CreatePsikologInput,
  UpdatePsikologInput,
  UpdatePsikologProfileInput,
} from './psikolog.schema'

let legacySlotsPurged = false

export class PsikologService {
  private repo: PsikologRepository
  private bookingService: BookingService
  private prisma: any

  constructor(fastify: FastifyInstance) {
    this.repo = new PsikologRepository(fastify.prisma)
    this.bookingService = new BookingService(fastify)
    this.prisma = fastify.prisma
  }

  private async purgeLegacyUnbookedSlots() {
    // Dinonaktifkan: Slot jam ketersediaan yang dibuka oleh psikolog harus tetap tersimpan dan tidak boleh dihapus.
  }

  async getAll(params?: { kategori?: string; search?: string; status?: string }) {
    await this.purgeLegacyUnbookedSlots()
    const list = await this.repo.findAll(params)

    // Hitung total booking riil langsung dari tabel booking_konsultasi
    const countMap: Record<string, number> = {}
    try {
      const activeBookings = await this.prisma.bookingKonsultasi.findMany({
        where: { status: { not: 'CANCELLED' } },
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
          status: { not: 'CANCELLED' },
        },
      })
    } catch {}

    return {
      ...item,
      jumlah_sesi: bookedCount,
    }
  }

  /**
   * Mengambil slot ketersediaan untuk Client (Tamu) - Didelegasikan ke Modul Booking
   */
  async getJadwalTersedia(query: GetJadwalTersediaQuery) {
    return this.bookingService.getJadwalTersedia(query)
  }

  /**
   * Mengambil jadwal mingguan / agenda milik Psikolog yang sedang login - Didelegasikan ke Modul Booking
   */
  async getJadwalSaya(accountId?: string, query?: GetJadwalPsikologMeQuery) {
    return this.bookingService.getJadwalSaya(accountId, query)
  }

  /**
   * Menambahkan slot ketersediaan baru - Didelegasikan ke Modul Booking
   */
  async createJadwalSlot(input: CreateJadwalSlotInput, accountId?: string) {
    return this.bookingService.createPsikologJadwalSlot(input, accountId)
  }

  /**
   * Menghapus slot ketersediaan yang belum dibooking - Didelegasikan ke Modul Booking
   */
  async deleteJadwalSlot(slotId: string, accountId?: string) {
    return this.bookingService.deleteJadwalSlot(slotId, accountId)
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
          status: { not: 'CANCELLED' },
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
    const spesialisasiNama =
      typeof body.spesialisasi === 'object' && body.spesialisasi?.nama
        ? body.spesialisasi.nama
        : typeof body.spesialisasi === 'string' && body.spesialisasi.trim()
        ? body.spesialisasi.trim()
        : 'Psikologi Umum'
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
