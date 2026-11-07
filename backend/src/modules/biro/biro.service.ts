import type { PrismaClient, Prisma } from "@prisma/client"
import { withActivationAccount, issueActivationToken } from "../../utils/activation"
import bcrypt from "bcrypt"
import type { CreateBiroInput, UpdateBiroProfileInput } from "./biro.schema"
import { parseDateString, formatDateToString, formatTimeToString } from "../../utils/date-time"
import { generateOrderId } from "../../utils"
import type {
  UpdateBiroAccountInput,
  GetPublicBiroPsikologQuery,
  GetPublicBiroLayananQuery,
  GetPublicBiroJadwalQuery,
  CreatePublicBiroBookingInput,
  SendPublicBiroContactInput,
} from "./biro.schema"

export class BiroService {
  constructor(private prisma: PrismaClient) {}

  // ==========================================
  // MANAJEMEN AKUN INTERNAL BIRO (PORTAL/ADMIN)
  // ==========================================

  async updateAccount(accountId: string, input: UpdateBiroAccountInput) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    })

    if (!account) {
      throw Object.assign(new Error("Akun tidak ditemukan"), { statusCode: 404 })
    }

    if (account.role !== "BIRO") {
      throw Object.assign(new Error("Akses ditolak: Hanya akun biro yang dapat menggunakan layanan ini"), {
        statusCode: 403,
      })
    }

    const updateData: { email?: string; password?: string } = {}

    // 1. Validasi & Ganti Email
    if (input.email && input.email !== account.email) {
      const existingEmail = await this.prisma.account.findUnique({
        where: { email: input.email },
      })
      if (existingEmail) {
        throw Object.assign(new Error("Email sudah terdaftar oleh akun lain"), { statusCode: 409 })
      }
      updateData.email = input.email
    }

    // 2. Validasi & Ganti Password
    if (input.passwordBaru) {
      if (!input.passwordLama && account.password) {
        throw Object.assign(new Error("Password lama wajib disertakan untuk konfirmasi perubahan password"), {
          statusCode: 400,
        })
      }

      if (account.password && input.passwordLama) {
        const isMatch = await bcrypt.compare(input.passwordLama, account.password)
        if (!isMatch) {
          throw Object.assign(new Error("Password lama salah"), { statusCode: 400 })
        }
      }

      updateData.password = await bcrypt.hash(input.passwordBaru, 10)
    }

    if (Object.keys(updateData).length === 0) {
      throw Object.assign(new Error("Tidak ada data yang diubah"), { statusCode: 400 })
    }

    const updatedAccount = await this.prisma.account.update({
      where: { id: accountId },
      data: updateData,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    return {
      success: true,
      message: "Data akun biro berhasil diperbarui",
      data: updatedAccount,
    }
  }

  async getAccount(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_telepon: true,
        aktif: true,
        password: true,
        token_aktivasi: true,
        token_aktivasi_exp: true,
        id_biro: true,
        biro: {
          select: {
            id: true,
            nama_biro: true,
            slug: true,
            status: true,
          },
        },
        owned_biro: {
          select: {
            id: true,
            nama_biro: true,
            slug: true,
            status: true,
            logoURI: true,
            warna_tema: true,
            alamat: true,
            deskripsi: true,
            no_telepon: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      } as any,
    })

    if (!account) {
      throw Object.assign(new Error("Akun tidak ditemukan"), { statusCode: 404 })
    }

    return {
      success: true,
      data: withActivationAccount(account),
    }
  }

  async getAllBiroAccounts() {
    const accounts = await this.prisma.account.findMany({
      where: { role: "BIRO" },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_telepon: true,
        aktif: true,
        password: true,
        token_aktivasi: true,
        token_aktivasi_exp: true,
        id_biro: true,
        biro: {
          select: {
            id: true,
            nama_biro: true,
            slug: true,
            status: true,
            logoURI: true,
            warna_tema: true,
            alamat: true,
            deskripsi: true,
            no_telepon: true,
          },
        },
        owned_biro: {
          select: {
            id: true,
            nama_biro: true,
            slug: true,
            status: true,
            logoURI: true,
            warna_tema: true,
            alamat: true,
            deskripsi: true,
            no_telepon: true,
          },
        },
        createdAt: true,
      } as any,
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: accounts.map((item) => withActivationAccount(item)),
    }
  }

  async getBiroById(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_telepon: true,
        aktif: true,
        password: true,
        token_aktivasi: true,
        token_aktivasi_exp: true,
        id_biro: true,
        owned_biro: {
          select: {
            id: true,
            nama_biro: true,
            slug: true,
            status: true,
            logoURI: true,
            warna_tema: true,
            alamat: true,
            deskripsi: true,
            no_telepon: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      } as any,
    })

    if (!account) {
      throw Object.assign(new Error("Akun tidak ditemukan"), { statusCode: 404 })
    }

    if ((account as any).role !== "BIRO") {
      throw Object.assign(new Error("Akun ini bukan akun Biro"), { statusCode: 400 })
    }

    return {
      success: true,
      data: withActivationAccount(account),
    }
  }

  async createBiro(input: CreateBiroInput) {
    // Validasi email belum terdaftar
    const existingEmail = await this.prisma.account.findUnique({
      where: { email: input.email.trim().toLowerCase() },
    })
    if (existingEmail) {
      throw Object.assign(new Error(`Email "${input.email}" sudah digunakan oleh akun lain`), { statusCode: 409 })
    }

    // Validasi slug belum dipakai
    const existingSlug = await this.prisma.biro.findUnique({
      where: { slug: input.slug },
    })
    if (existingSlug) {
      throw Object.assign(new Error(`Slug "${input.slug}" sudah digunakan oleh biro lain`), { statusCode: 409 })
    }

    let activationToken: string
    let activationExpiry: Date

    if (input.tokenAktivasi) {
      activationToken = input.tokenAktivasi
      activationExpiry = input.tokenExpiredAt ? new Date(input.tokenExpiredAt) : issueActivationToken().expiresAt
    } else {
      const issued = issueActivationToken()
      activationToken = issued.token
      activationExpiry = issued.expiresAt
    }

    // Buat account BIRO dulu, lalu biro-nya
    const account = await this.prisma.account.create({
      data: {
        nama: input.nama,
        email: input.email.trim().toLowerCase(),
        password: null,
        role: "BIRO",
        no_telepon: input.noTelepon || null,
        aktif: false,
        token_aktivasi: activationToken,
        token_aktivasi_exp: activationExpiry,
      },
    })

    const biro = await this.prisma.biro.create({
      data: {
        nama_biro: input.nama,
        slug: input.slug,
        id_account: account.id,
        logoURI: input.logoURI || null,
        warna_tema: input.warnaIdentitas || null,
        alamat: input.alamat || null,
        deskripsi: input.deskripsi || null,
        no_telepon: input.noTelepon || null,
        status: "PENDING",
      },
    })

    // Hubungkan akun sebagai owner biro (sekaligus staff jika diperlukan)
    // Account sudah jadi owner via owned_biro relation

    return {
      success: true,
      message: "Akun biro berhasil dibuat. Link aktivasi telah digenerate.",
      data: {
        ...withActivationAccount(account),
        biro: {
          id: biro.id,
          nama_biro: biro.nama_biro,
          slug: biro.slug,
          status: biro.status,
          logoURI: biro.logoURI,
          warna_tema: biro.warna_tema,
          alamat: biro.alamat,
          deskripsi: biro.deskripsi,
        },
      },
    }
  }

  async updateBiroProfile(accountId: string, input: UpdateBiroProfileInput) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { owned_biro: { take: 1 } },
    } as any)

    if (!account) {
      throw Object.assign(new Error("Akun tidak ditemukan"), { statusCode: 404 })
    }

    if ((account as any).role !== "BIRO") {
      throw Object.assign(new Error("Akun ini bukan akun Biro"), { statusCode: 400 })
    }

    const biro = (account as any).owned_biro?.[0]

    // Update email jika berubah
    if (input.email && input.email !== account.email) {
      const existingEmail = await this.prisma.account.findUnique({ where: { email: input.email } })
      if (existingEmail && existingEmail.id !== accountId) {
        throw Object.assign(new Error("Email sudah digunakan oleh akun lain"), { statusCode: 409 })
      }
    }

    // Update slug jika berubah
    if (input.slug && biro && input.slug !== biro.slug) {
      const existingSlug = await this.prisma.biro.findUnique({ where: { slug: input.slug } })
      if (existingSlug && existingSlug.id !== biro.id) {
        throw Object.assign(new Error("Slug sudah digunakan oleh biro lain"), { statusCode: 409 })
      }
    }

    // Update account
    const accountUpdateData: any = {}
    if (input.nama !== undefined) accountUpdateData.nama = input.nama
    if (input.email !== undefined) accountUpdateData.email = input.email
    if (input.noTelepon !== undefined) accountUpdateData.no_telepon = input.noTelepon

    if (Object.keys(accountUpdateData).length > 0) {
      await this.prisma.account.update({ where: { id: accountId }, data: accountUpdateData })
    }

    // Update biro
    if (biro) {
      const biroUpdateData: any = {}
      if (input.nama !== undefined) biroUpdateData.nama_biro = input.nama
      if (input.slug !== undefined) biroUpdateData.slug = input.slug
      if (input.alamat !== undefined) biroUpdateData.alamat = input.alamat
      if (input.deskripsi !== undefined) biroUpdateData.deskripsi = input.deskripsi
      if (input.warnaIdentitas !== undefined) biroUpdateData.warna_tema = input.warnaIdentitas
      if (input.logoURI !== undefined) biroUpdateData.logoURI = input.logoURI
      if (input.status !== undefined) biroUpdateData.status = input.status
      if (input.noTelepon !== undefined) biroUpdateData.no_telepon = input.noTelepon

      if (Object.keys(biroUpdateData).length > 0) {
        await this.prisma.biro.update({ where: { id: biro.id }, data: biroUpdateData })
      }
    }

    return {
      success: true,
      message: "Profil biro berhasil diperbarui",
    }
  }



  /**
   * 1. Mengambil detail informasi profil publik biro berdasarkan slug
   */
  async getPublicBiroBySlug(slug: string) {
    const biro = await this.prisma.biro.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            nama: true,
            email: true,
            no_telepon: true,
          },
        },
        _count: {
          select: {
            staff: true,
            clients: true,
          },
        },
      },
    })

    if (!biro) {
      throw Object.assign(new Error("Biro tidak ditemukan"), { statusCode: 404 })
    }

    if (biro.status !== "ACTIVE") {
      throw Object.assign(
        new Error("Website biro sedang tidak aktif atau dalam proses peninjauan"),
        { statusCode: 403 }
      )
    }

    // Hitung total tenaga ahli yang berafiliasi / tersedia
    const totalPsikolog = await this.prisma.psikolog.count({
      where: {
        status: "ACTIVE",
        OR: [
          { account: { id_biro: biro.id } },
          { account: { id_biro: null } },
        ],
      },
    })

    const totalLayanan = await this.prisma.layanan.count({
      where: { aktif: true },
    })

    return {
      success: true,
      data: {
        id: biro.id,
        nama_biro: biro.nama_biro,
        slug: biro.slug,
        alamat: biro.alamat,
        deskripsi: biro.deskripsi,
        no_telepon: biro.no_telepon,
        website_url: biro.website_url,
        logoURI: biro.logoURI,
        status: biro.status,
        createdAt: biro.createdAt,
        owner: biro.owner,
        statistik: {
          total_psikolog: totalPsikolog,
          total_layanan: totalLayanan,
          total_klien_terdaftar: biro._count.clients,
        },
      },
    }
  }

  /**
   * 2. Mengambil daftar psikolog / konselor yang bertugas di biro
   */
  async getPublicBiroPsikolog(slug: string, query?: GetPublicBiroPsikologQuery) {
    const biro = await this.prisma.biro.findUnique({
      where: { slug },
      select: { id: true, status: true, nama_biro: true },
    })

    if (!biro) {
      throw Object.assign(new Error("Biro tidak ditemukan"), { statusCode: 404 })
    }

    if (biro.status !== "ACTIVE") {
      throw Object.assign(new Error("Website biro sedang tidak aktif"), { statusCode: 403 })
    }

    const whereFilter: any = {
      status: "ACTIVE",
    }

    if (query?.kategori && query.kategori !== "semua") {
      whereFilter.kategori = query.kategori
    }

    if (query?.spesialisasi) {
      whereFilter.spesialisasi = {
        nama: { contains: query.spesialisasi, mode: "insensitive" },
      }
    }

    if (query?.search) {
      whereFilter.OR = [
        { nama_gelar: { contains: query.search, mode: "insensitive" } },
        { keahlian: { contains: query.search, mode: "insensitive" } },
        { bio: { contains: query.search, mode: "insensitive" } },
      ]
    }

    // Cek tenaga ahli yang secara spesifik berafiliasi dengan biro ini
    let psikologs = await this.prisma.psikolog.findMany({
      where: {
        ...whereFilter,
        account: { id_biro: biro.id },
      },
      include: {
        spesialisasi: true,
        account: {
          select: {
            id: true,
            nama: true,
            email: true,
            foto: true,
            no_telepon: true,
            link_maps: true,
            instagram: true,
            tiktok: true,
            linkedin: true,
          },
        },
      },
      orderBy: { jumlah_sesi: "desc" },
    })

    // Jika biro belum menghubungkan staf khusus, fallback ke tenaga ahli platform yang tersedia
    if (psikologs.length === 0) {
      psikologs = await this.prisma.psikolog.findMany({
        where: whereFilter,
        include: {
          spesialisasi: true,
          account: {
            select: {
              id: true,
              nama: true,
              email: true,
              foto: true,
              no_telepon: true,
              link_maps: true,
              instagram: true,
              tiktok: true,
              linkedin: true,
            },
          },
        },
        orderBy: { jumlah_sesi: "desc" },
      })
    }

    return {
      success: true,
      data: psikologs.map((p) => ({
        id: p.id,
        nama_gelar: p.nama_gelar,
        kategori: p.kategori,
        spesialisasi: p.spesialisasi.nama,
        foto: p.foto || p.account?.foto,
        keahlian: p.keahlian,
        bio: p.bio,
        quote: p.quote,
        pendidikan: p.pendidikan,
        pengalaman_tahun: p.pengalaman_tahun,
        tarif_per_jam: Number(p.tarif_per_jam),
        jumlah_sesi: p.jumlah_sesi,
        jenis_kelamin: p.jenis_kelamin,
        status: p.status,
        social_media: {
          instagram: p.instagram || p.account?.instagram,
          tiktok: p.account?.tiktok,
          linkedin: p.account?.linkedin,
        },
      })),
    }
  }

  /**
   * 3. Mengambil profil lengkap satu tenaga ahli di biro
   */
  async getPublicBiroPsikologDetail(slug: string, psikologId: string) {
    const biro = await this.prisma.biro.findUnique({
      where: { slug },
      select: { id: true, status: true, nama_biro: true },
    })

    if (!biro || biro.status !== "ACTIVE") {
      throw Object.assign(new Error("Biro tidak ditemukan atau tidak aktif"), { statusCode: 404 })
    }

    const psikolog = await this.prisma.psikolog.findUnique({
      where: { id: psikologId },
      include: {
        spesialisasi: true,
        account: {
          select: {
            id: true,
            nama: true,
            email: true,
            foto: true,
            instagram: true,
            tiktok: true,
            linkedin: true,
          },
        },
      },
    })

    if (!psikolog || psikolog.status !== "ACTIVE") {
      throw Object.assign(new Error("Psikolog tidak ditemukan atau sedang tidak aktif"), { statusCode: 404 })
    }

    // Ambil slot jadwal tersedia terdekat (7 hari ke depan)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const slots = await this.prisma.jadwalSlot.findMany({
      where: {
        id_psikolog: psikolog.id,
        status: "TERSEDIA",
        tanggal: { gte: today },
      },
      orderBy: [{ tanggal: "asc" }, { jam_mulai: "asc" }],
      take: 10,
    })

    return {
      success: true,
      data: {
        id: psikolog.id,
        nama_gelar: psikolog.nama_gelar,
        kategori: psikolog.kategori,
        spesialisasi: psikolog.spesialisasi.nama,
        foto: psikolog.foto || psikolog.account?.foto,
        keahlian: psikolog.keahlian,
        bio: psikolog.bio,
        quote: psikolog.quote,
        pendidikan: psikolog.pendidikan,
        pengalaman_tahun: psikolog.pengalaman_tahun,
        tarif_per_jam: Number(psikolog.tarif_per_jam),
        jumlah_sesi: psikolog.jumlah_sesi,
        jenis_kelamin: psikolog.jenis_kelamin,
        no_str: psikolog.no_str,
        no_sipp: psikolog.no_sipp,
        video_intro_url: psikolog.video_intro_url,
        video_thumbnail: psikolog.video_thumbnail,
        video_duration: psikolog.video_duration,
        profil_lengkap: psikolog.profil_lengkap,
        jadwal_tersedia_terdekat: slots.map((s) => ({
          id: s.id,
          tanggal: formatDateToString(s.tanggal),
          jam_mulai: formatTimeToString(s.jam_mulai),
          jam_selesai: formatTimeToString(s.jam_selesai),
          tipe_jadwal: s.tipe_jadwal,
        })),
      },
    }
  }

  /**
   * 4. Mengambil daftar layanan yang disediakan di website biro
   */
  async getPublicBiroLayanan(slug: string, query?: GetPublicBiroLayananQuery) {
    const biro = await this.prisma.biro.findUnique({
      where: { slug },
      select: { id: true, status: true },
    })

    if (!biro || biro.status !== "ACTIVE") {
      throw Object.assign(new Error("Biro tidak ditemukan atau tidak aktif"), { statusCode: 404 })
    }

    const where: any = { aktif: true }
    if (query?.kategori && query.kategori !== "semua") {
      where.kategori = query.kategori
    }

    const layanans = await this.prisma.layanan.findMany({
      where,
      orderBy: { createdAt: "asc" },
    })

    return {
      success: true,
      data: layanans.map((l) => ({
        id: l.id,
        nama: l.nama,
        kategori: l.kategori,
        metode: l.metode,
        deskripsi: l.deskripsi,
        harga_weekday: Number(l.harga_weekday),
        harga_weekend: Number(l.harga_weekend),
        banner_url: l.banner_url,
      })),
    }
  }

  /**
   * 5. Mengambil slot jadwal ketersediaan untuk klien di website biro
   */
  async getPublicBiroJadwal(slug: string, query: GetPublicBiroJadwalQuery) {
    const biro = await this.prisma.biro.findUnique({
      where: { slug },
      select: { id: true, status: true },
    })

    if (!biro || biro.status !== "ACTIVE") {
      throw Object.assign(new Error("Biro tidak ditemukan atau tidak aktif"), { statusCode: 404 })
    }

    const where: Prisma.JadwalSlotWhereInput = {
      status: "TERSEDIA",
      tipe_jadwal: query.tipe_jadwal || "KONSULTASI",
    }

    if (query.tanggal) {
      where.tanggal = parseDateString(query.tanggal)
    } else {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      where.tanggal = { gte: today }
    }

    if (query.id_psikolog) {
      where.id_psikolog = query.id_psikolog
    }

    const slots = await this.prisma.jadwalSlot.findMany({
      where,
      include: {
        psikolog: {
          select: {
            id: true,
            nama_gelar: true,
            kategori: true,
            foto: true,
            tarif_per_jam: true,
            spesialisasi: { select: { nama: true } },
          },
        },
      },
      orderBy: [{ tanggal: "asc" }, { jam_mulai: "asc" }],
    })

    return {
      success: true,
      data: slots.map((s) => ({
        id: s.id,
        id_psikolog: s.id_psikolog,
        tanggal: formatDateToString(s.tanggal),
        jam_mulai: formatTimeToString(s.jam_mulai),
        jam_selesai: formatTimeToString(s.jam_selesai),
        tipe_jadwal: s.tipe_jadwal,
        psikolog: {
          id: s.psikolog.id,
          nama_gelar: s.psikolog.nama_gelar,
          kategori: s.psikolog.kategori,
          spesialisasi: s.psikolog.spesialisasi?.nama,
          foto: s.psikolog.foto,
          tarif_per_jam: Number(s.psikolog.tarif_per_jam),
        },
      })),
    }
  }

  /**
   * 6. Klien membuat booking konsultasi baru melalui website biro
   */
  async createPublicBiroBooking(slug: string, input: CreatePublicBiroBookingInput) {
    const biro = await this.prisma.biro.findUnique({
      where: { slug },
      select: { id: true, slug: true, nama_biro: true, status: true },
    })

    if (!biro || biro.status !== "ACTIVE") {
      throw Object.assign(new Error("Biro tidak ditemukan atau tidak aktif"), { statusCode: 404 })
    }

    // Ambil slot jadwal
    const slot = await this.prisma.jadwalSlot.findUnique({
      where: { id: input.id_jadwal },
      include: { psikolog: true },
    })

    if (!slot) {
      throw Object.assign(new Error("Slot jadwal tidak ditemukan"), { statusCode: 404 })
    }

    if (slot.status !== "TERSEDIA") {
      throw Object.assign(new Error("Slot jadwal tersebut sudah terisi atau tidak tersedia"), { statusCode: 400 })
    }

    // Ambil layanan
    const layanan = await this.prisma.layanan.findUnique({
      where: { id: input.id_layanan },
    })

    if (!layanan || !layanan.aktif) {
      throw Object.assign(new Error("Layanan tidak ditemukan atau sedang tidak aktif"), { statusCode: 404 })
    }

    // Hitung rincian biaya
    const dayOfWeek = slot.tanggal.getUTCDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    let subtotal = isWeekend ? Number(layanan.harga_weekend) : Number(layanan.harga_weekday)
    if (subtotal <= 0) {
      subtotal = Number(slot.psikolog.tarif_per_jam)
    }
    const biayaAdmin = 5000
    const total = subtotal + biayaAdmin

    // Eksekusi transaksi database secara atomik
    const bookingResult = await this.prisma.$transaction(async (tx) => {
      // 1. Temukan atau daftarkan klien dengan asosiasi id_biro
      let client = await tx.client.findFirst({
        where: { no_telepon: input.klien.no_telepon },
      })

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: input.klien.nama,
            no_telepon: input.klien.no_telepon,
            usia: input.klien.usia,
            jenis_kelamin: input.klien.jenis_kelamin,
            id_biro: biro.id,
          },
        })
      } else if (!client.id_biro) {
        client = await tx.client.update({
          where: { id: client.id },
          data: { id_biro: biro.id },
        })
      }

      // 2. Tandai slot jadwal sebagai SUDAH_DIBOOKING
      await tx.jadwalSlot.update({
        where: { id: slot.id },
        data: { status: "SUDAH_DIBOOKING" },
      })

      // 3. Buat pesanan booking konsultasi
      const kodePesanan = `BIR-${biro.slug.toUpperCase().slice(0, 3)}-${generateOrderId()}`
      const booking = await tx.bookingKonsultasi.create({
        data: {
          kode_pesanan: kodePesanan,
          id_client: client.id,
          id_layanan: layanan.id,
          id_jadwal: slot.id,
          metode: input.metode,
          deskripsi_trauma: input.deskripsi_trauma,
          status: "PENDING",
        },
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: {
              psikolog: {
                include: {
                  spesialisasi: true,
                },
              },
            },
          },
        },
      })

      // 4. Tambah counter jumlah sesi psikolog
      await tx.psikolog.update({
        where: { id: slot.id_psikolog },
        data: { jumlah_sesi: { increment: 1 } },
      }).catch(() => {})

      return { booking, client }
    })

    return {
      success: true,
      message: "Booking konsultasi di biro berhasil dibuat. Silakan selesaikan konfirmasi pembayaran.",
      data: {
        id_booking: bookingResult.booking.id,
        kode_pesanan: bookingResult.booking.kode_pesanan,
        biro: {
          id: biro.id,
          nama: biro.nama_biro,
          slug: biro.slug,
        },
        klien: {
          id: bookingResult.client.id,
          nama: bookingResult.client.nama,
          no_telepon: bookingResult.client.no_telepon,
        },
        layanan: {
          id: layanan.id,
          nama: layanan.nama,
          metode: bookingResult.booking.metode,
        },
        psikolog: {
          id: slot.psikolog.id,
          nama_gelar: slot.psikolog.nama_gelar,
          kategori: slot.psikolog.kategori,
        },
        jadwal: {
          tanggal: formatDateToString(slot.tanggal),
          jam_mulai: formatTimeToString(slot.jam_mulai),
          jam_selesai: formatTimeToString(slot.jam_selesai),
        },
        rincian_biaya: {
          subtotal,
          biaya_admin: biayaAdmin,
          total,
          status_pembayaran: "MENUNGGU_PEMBAYARAN",
          metode_pembayaran: "TRANSFER_BANK",
        },
        status_booking: bookingResult.booking.status,
        createdAt: bookingResult.booking.createdAt,
      },
    }
  }

  /**
   * 7. Klien mengecek status booking mereka menggunakan kode pesanan di website biro
   */
  async getPublicBiroBookingStatus(slug: string, kodePesanan: string) {
    const biro = await this.prisma.biro.findUnique({
      where: { slug },
      select: { id: true, nama_biro: true, slug: true, status: true },
    })

    if (!biro || biro.status !== "ACTIVE") {
      throw Object.assign(new Error("Biro tidak ditemukan atau tidak aktif"), { statusCode: 404 })
    }

    const booking = await this.prisma.bookingKonsultasi.findUnique({
      where: { kode_pesanan: kodePesanan },
      include: {
        client: true,
        layanan: true,
        jadwal: {
          include: {
            psikolog: {
              include: { spesialisasi: true },
            },
          },
        },
      },
    })

    if (!booking) {
      throw Object.assign(new Error("Pesanan booking dengan kode tersebut tidak ditemukan"), { statusCode: 404 })
    }

    return {
      success: true,
      data: {
        id: booking.id,
        kode_pesanan: booking.kode_pesanan,
        biro: {
          nama_biro: biro.nama_biro,
          slug: biro.slug,
        },
        status_booking: booking.status,
        metode: booking.metode,
        klien: {
          nama: booking.client.nama,
          no_telepon: booking.client.no_telepon,
        },
        layanan: {
          nama: booking.layanan.nama,
          kategori: booking.layanan.kategori,
        },
        psikolog: {
          nama_gelar: booking.jadwal.psikolog.nama_gelar,
          spesialisasi: booking.jadwal.psikolog.spesialisasi.nama,
          foto: booking.jadwal.psikolog.foto,
        },
        jadwal: {
          tanggal: formatDateToString(booking.jadwal.tanggal),
          jam_mulai: formatTimeToString(booking.jadwal.jam_mulai),
          jam_selesai: formatTimeToString(booking.jadwal.jam_selesai),
        },
        createdAt: booking.createdAt,
      },
    }
  }

  /**
   * 8. Form kontak / pesan dari pengunjung website biro
   */
  async sendPublicBiroContact(slug: string, input: SendPublicBiroContactInput) {
    const biro = await this.prisma.biro.findUnique({
      where: { slug },
      select: { id: true, nama_biro: true, slug: true, status: true, owner: { select: { email: true, nama: true } } },
    })

    if (!biro || biro.status !== "ACTIVE") {
      throw Object.assign(new Error("Biro tidak ditemukan atau tidak aktif"), { statusCode: 404 })
    }

    return {
      success: true,
      message: `Pesan Anda berhasil terkirim ke ${biro.nama_biro}. Tim kami akan segera menghubungi Anda melalui nomor kontak atau email yang diberikan.`,
      data: {
        biro: biro.nama_biro,
        pengirim: input.nama,
        kontak: input.no_telepon,
        subjek: input.subjek || "Konsultasi Awal Klien",
        dikirimPada: new Date().toISOString(),
      },
    }
  }
}
