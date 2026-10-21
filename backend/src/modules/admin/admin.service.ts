import type { FastifyInstance } from 'fastify'
import { AdminRepository } from './admin.repository'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
  UpdateAdminProfileInput,
} from './admin.schema'
import bcrypt from 'bcrypt'
import type { StatusBooking } from '@prisma/client'
import {
  parseDateString,
  timeStringToDate,
  formatDateToString,
  formatTimeToString,
} from '../../utils/date-time'

async function resolveGoogleMapsEmbedUrl(linkMaps?: string | null, alamat?: string | null): Promise<string> {
  const defaultEmbed =
    'https://www.google.com/maps?q=EMPATHIKA,+Layanan+Konsultasi+Psikologi,+Jl.+Cikutra+No.312,+Neglasari,+Kec.+Cibeunying+Kaler,+Kota+Bandung,+Jawa+Barat+41024&output=embed'

  const raw = (linkMaps || '').trim()

  // 1. Jika pengguna mem-paste iframe HTML langsung: <iframe src="..."/>
  if (raw.includes('<iframe') && raw.includes('src=')) {
    const srcMatch = raw.match(/src=["']([^"']+)["']/)
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1]
    }
  }

  // 2. Jika sudah berupa embed URL resmi Google Maps
  if (raw.includes('/maps/embed')) {
    return raw
  }

  // 3. Jika pengguna memasukkan short link: https://maps.app.goo.gl/... atau goo.gl/maps/...
  if (raw.includes('maps.app.goo.gl') || raw.includes('goo.gl/maps')) {
    try {
      const res = await fetch(raw, { method: 'HEAD', redirect: 'manual' })
      const redirectLoc = res.headers.get('location') || ''
      if (redirectLoc) {
        // Cek nama tempat: /place/Nama+Tempat/
        const matchPlace = redirectLoc.match(/\/place\/([^/@?]+)/)
        if (matchPlace && matchPlace[1]) {
          const placeName = decodeURIComponent(matchPlace[1].replace(/\+/g, ' '))
          return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`
        }
        // Cek koordinat pin: !3d(-?\d+\.\d+)!4d(-?\d+\.\d+)
        const matchPin = redirectLoc.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
        if (matchPin) {
          return `https://www.google.com/maps?q=${matchPin[1]},${matchPin[2]}&output=embed`
        }
        // Cek koordinat kamera: @(-?\d+\.\d+),(-?\d+\.\d+)
        const matchCoords = redirectLoc.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (matchCoords) {
          return `https://www.google.com/maps?q=${matchCoords[1]},${matchCoords[2]}&output=embed`
        }
      }
    } catch {
      // Gagal resolve, lanjut ke fallback
    }
  }

  // 4. Jika berupa link google.com/maps/place/Nama+Tempat
  if (raw.includes('/place/')) {
    const matchPlace = raw.match(/\/place\/([^/@?]+)/)
    if (matchPlace && matchPlace[1]) {
      const placeName = decodeURIComponent(matchPlace[1].replace(/\+/g, ' '))
      return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`
    }
    const matchCoords = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (matchCoords) {
      return `https://www.google.com/maps?q=${matchCoords[1]},${matchCoords[2]}&output=embed`
    }
  }

  // 5. Jika berupa link google.com/maps?q=...
  if (raw.includes('google.com/maps') && raw.includes('q=')) {
    if (!raw.includes('output=embed')) {
      const sep = raw.includes('?') ? '&' : '?'
      return `${raw}${sep}output=embed`
    }
    return raw
  }

  // 6. Jika ada alamat
  if (alamat && alamat.trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(alamat.trim())}&output=embed`
  }

  return defaultEmbed
}

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

  // ── Modul Profil Admin Utama ────────────────────────────────────
  async getProfile(adminId?: string) {
    const admin = await this.repo.findAdminUtama(adminId)
    if (!admin) {
      throw Object.assign(new Error('Akun Admin Utama tidak ditemukan'), { statusCode: 404 })
    }

    const embedUrl = await resolveGoogleMapsEmbedUrl(admin.link_maps, admin.alamat)

    return {
      id: admin.id,
      nama: admin.nama,
      email: admin.email,
      role: admin.role,
      no_telepon: admin.no_telepon,
      noTelepon: admin.no_telepon,
      alamat: admin.alamat,
      link_maps: admin.link_maps,
      linkMaps: admin.link_maps,
      link_maps_embed: embedUrl,
      linkMapsEmbed: embedUrl,
      bio: admin.bio,
      foto: admin.foto,
    }
  }

  async updateProfile(adminId: string, input: UpdateAdminProfileInput) {
    const existing = await this.repo.findAdminUtama(adminId)
    if (!existing) {
      throw Object.assign(new Error('Akun Admin tidak ditemukan'), { statusCode: 404 })
    }

    if (existing.role !== 'ADMIN') {
      throw Object.assign(new Error('Hanya Admin Utama yang berwenang mengubah profil'), { statusCode: 403 })
    }

    const updateData: any = {}

    if (input.nama !== undefined) {
      updateData.nama = input.nama
    }

    if (input.email !== undefined && input.email !== existing.email) {
      const emailUsed = await this.repo.findAccountByEmail(input.email)
      if (emailUsed && emailUsed.id !== existing.id) {
        throw Object.assign(new Error('Email sudah digunakan oleh akun lain'), { statusCode: 400 })
      }
      updateData.email = input.email
    }

    const noTelepon = input.no_telepon !== undefined ? input.no_telepon : input.noTelepon
    if (noTelepon !== undefined) {
      updateData.no_telepon = noTelepon
    }

    if (input.alamat !== undefined) {
      updateData.alamat = input.alamat
    }

    const linkMaps = input.link_maps !== undefined ? input.link_maps : input.linkMaps
    if (linkMaps !== undefined) {
      updateData.link_maps = linkMaps
    }

    if (input.bio !== undefined) {
      updateData.bio = input.bio
    }

    if (input.foto !== undefined) {
      updateData.foto = input.foto
    }

    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 10)
    }

    const updated = await this.repo.updateAdminProfile(existing.id, updateData)
    const embedUrl = await resolveGoogleMapsEmbedUrl(updated.link_maps, updated.alamat)

    return {
      id: updated.id,
      nama: updated.nama,
      email: updated.email,
      role: updated.role,
      no_telepon: updated.no_telepon,
      noTelepon: updated.no_telepon,
      alamat: updated.alamat,
      link_maps: updated.link_maps,
      linkMaps: updated.link_maps,
      link_maps_embed: embedUrl,
      linkMapsEmbed: embedUrl,
      bio: updated.bio,
      foto: updated.foto,
    }
  }

  async getPublicProfile() {
    let admin = null
    try {
      admin = await this.repo.findAdminUtama()
    } catch {
      // Fallback ke profil publik default jika database belum di-seed atau belum siap
    }
    const embedUrl = await resolveGoogleMapsEmbedUrl(admin?.link_maps, admin?.alamat)

    return {
      nama: admin?.nama || 'Empathika',
      email: admin?.email || 'empathika889@gmail.com',
      no_telepon: admin?.no_telepon || '0878-7878-5498',
      noTelepon: admin?.no_telepon || '0878-7878-5498',
      alamat: admin?.alamat || 'Jl. Cikutra No.312, Neglasari\nKec. Cibeunying Kaler, Kota Bandung\nJawa Barat 41024',
      link_maps: admin?.link_maps || 'https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw',
      linkMaps: admin?.link_maps || 'https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw',
      link_maps_embed: embedUrl,
      linkMapsEmbed: embedUrl,
      bio: admin?.bio || 'Platform psikologi dan kesehatan mental.',
      foto: admin?.foto || null,
    }
  }
}

