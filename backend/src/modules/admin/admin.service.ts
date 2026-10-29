import type { FastifyInstance } from 'fastify'
import { AdminRepository } from './admin.repository'
import { BookingService } from '../booking/booking.service'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
  UpdateAdminProfileInput,
} from './admin.schema'
import bcrypt from 'bcrypt'
import type { StatusBooking } from '@prisma/client'

const mapsEmbedCache = new Map<string, string>()

async function resolveGoogleMapsEmbedUrl(linkMaps?: string | null, alamat?: string | null): Promise<string> {
  const defaultEmbed =
    'https://www.google.com/maps?q=EMPATHIKA,+Layanan+Konsultasi+Psikologi,+Jl.+Cikutra+No.312,+Neglasari,+Kec.+Cibeunying+Kaler,+Kota+Bandung,+Jawa+Barat+41024&output=embed'

  const cacheKey = `${linkMaps || ''}::${alamat || ''}`
  if (mapsEmbedCache.has(cacheKey)) {
    return mapsEmbedCache.get(cacheKey)!
  }

  const raw = (linkMaps || '').trim()
  let result = defaultEmbed

  // 1. Jika pengguna mem-paste iframe HTML langsung: <iframe src="..."/>
  if (raw.includes('<iframe') && raw.includes('src=')) {
    const srcMatch = raw.match(/src=["']([^"']+)["']/)
    if (srcMatch && srcMatch[1]) {
      result = srcMatch[1]
      mapsEmbedCache.set(cacheKey, result)
      return result
    }
  }

  // 2. Jika sudah berupa embed URL resmi Google Maps
  if (raw.includes('/maps/embed')) {
    result = raw
    mapsEmbedCache.set(cacheKey, result)
    return result
  }

  // 3. Jika pengguna memasukkan short link: https://maps.app.goo.gl/... atau goo.gl/maps/...
  if (raw.includes('maps.app.goo.gl') || raw.includes('goo.gl/maps')) {
    try {
      const res = await fetch(raw, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(1500),
      })
      const redirectLoc = res.headers.get('location') || ''
      if (redirectLoc) {
        // Cek nama tempat: /place/Nama+Tempat/
        const matchPlace = redirectLoc.match(/\/place\/([^/@?]+)/)
        if (matchPlace && matchPlace[1]) {
          const placeName = decodeURIComponent(matchPlace[1].replace(/\+/g, ' '))
          result = `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`
          mapsEmbedCache.set(cacheKey, result)
          return result
        }
        // Cek koordinat pin: !3d(-?\d+\.\d+)!4d(-?\d+\.\d+)
        const matchPin = redirectLoc.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
        if (matchPin) {
          result = `https://www.google.com/maps?q=${matchPin[1]},${matchPin[2]}&output=embed`
          mapsEmbedCache.set(cacheKey, result)
          return result
        }
        // Cek koordinat kamera: @(-?\d+\.\d+),(-?\d+\.\d+)
        const matchCoords = redirectLoc.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (matchCoords) {
          result = `https://www.google.com/maps?q=${matchCoords[1]},${matchCoords[2]}&output=embed`
          mapsEmbedCache.set(cacheKey, result)
          return result
        }
      }
    } catch {
      // Gagal resolve atau timeout, lanjut ke fallback
    }
  }

  // 4. Jika berupa link google.com/maps/place/Nama+Tempat
  if (raw.includes('/place/')) {
    const matchPlace = raw.match(/\/place\/([^/@?]+)/)
    if (matchPlace && matchPlace[1]) {
      const placeName = decodeURIComponent(matchPlace[1].replace(/\+/g, ' '))
      result = `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`
      mapsEmbedCache.set(cacheKey, result)
      return result
    }
    const matchCoords = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (matchCoords) {
      result = `https://www.google.com/maps?q=${matchCoords[1]},${matchCoords[2]}&output=embed`
      mapsEmbedCache.set(cacheKey, result)
      return result
    }
  }

  // 5. Jika berupa link google.com/maps?q=...
  if (raw.includes('google.com/maps') && raw.includes('q=')) {
    if (!raw.includes('output=embed')) {
      const sep = raw.includes('?') ? '&' : '?'
      result = `${raw}${sep}output=embed`
      mapsEmbedCache.set(cacheKey, result)
      return result
    }
    result = raw
    mapsEmbedCache.set(cacheKey, result)
    return result
  }

  // 6. Jika ada alamat
  if (alamat && alamat.trim()) {
    result = `https://www.google.com/maps?q=${encodeURIComponent(alamat.trim())}&output=embed`
    mapsEmbedCache.set(cacheKey, result)
    return result
  }

  mapsEmbedCache.set(cacheKey, result)
  return result
}

export class AdminService {
  private repo: AdminRepository
  private bookingService: BookingService

  constructor(fastify: FastifyInstance) {
    this.repo = new AdminRepository(fastify.prisma)
    this.bookingService = new BookingService(fastify)
  }

  // ── Sesi & Jadwal Konsultasi (Didelegasikan ke Modul Booking) ──

  async getJadwalOverview(query: GetAdminJadwalQuery) {
    return this.bookingService.getJadwalOverview(query)
  }

  async createJadwalSlot(input: CreateAdminJadwalSlotInput) {
    return this.bookingService.createAdminJadwalSlot(input)
  }

  async createAdminSesi(input: CreateAdminSesiInput) {
    return this.bookingService.createAdminSesi(input)
  }

  async updateBookingStatus(id: string, status: StatusBooking) {
    return this.bookingService.updateBookingStatus(id, status)
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
      instagram: (admin as any).instagram || 'https://www.instagram.com/empathika_psikologi?psln=dzgxaTNybnZhbmts',
      tiktok: (admin as any).tiktok || 'https://www.tiktok.com/@empathika_psikologi?_r=1&_t=ZS-9Aje7iAkpFZ',
      youtube: (admin as any).youtube || '',
      linkedin: (admin as any).linkedin || '',
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

    if (input.instagram !== undefined) {
      updateData.instagram = input.instagram
    }

    if (input.tiktok !== undefined) {
      updateData.tiktok = input.tiktok
    }

    if (input.youtube !== undefined) {
      updateData.youtube = input.youtube
    }

    if (input.linkedin !== undefined) {
      updateData.linkedin = input.linkedin
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
      instagram: (updated as any).instagram || '',
      tiktok: (updated as any).tiktok || '',
      youtube: (updated as any).youtube || '',
      linkedin: (updated as any).linkedin || '',
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

    const rawPhone = admin?.no_telepon?.trim()
    const isLegacyDummy = !rawPhone || rawPhone === '081234567890' || rawPhone === '08123456789'
    const officialPhone = isLegacyDummy ? '0878-7878-5498' : rawPhone

    return {
      nama: admin?.nama || 'Empathika',
      email: admin?.email || 'empathika889@gmail.com',
      no_telepon: officialPhone,
      noTelepon: officialPhone,
      alamat: admin?.alamat || 'Jl. Cikutra No.312, Neglasari\nKec. Cibeunying Kaler, Kota Bandung\nJawa Barat 41024',
      link_maps: admin?.link_maps || 'https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw',
      linkMaps: admin?.link_maps || 'https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw',
      link_maps_embed: embedUrl,
      linkMapsEmbed: embedUrl,
      bio: admin?.bio || 'Platform psikologi dan kesehatan mental.',
      foto: admin?.foto || null,
      instagram: (admin as any)?.instagram || 'https://www.instagram.com/empathika_psikologi?psln=dzgxaTNybnZhbmts',
      tiktok: (admin as any)?.tiktok || 'https://www.tiktok.com/@empathika_psikologi?_r=1&_t=ZS-9Aje7iAkpFZ',
      youtube: (admin as any)?.youtube || '',
      linkedin: (admin as any)?.linkedin || '',
    }
  }
}

