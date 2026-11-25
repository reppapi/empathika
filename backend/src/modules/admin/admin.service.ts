import type { FastifyInstance } from 'fastify'
import { AdminRepository } from './admin.repository'
import { BookingService } from '../booking/booking.service'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
  RescheduleBookingInput,
  UpdateAdminProfileInput,
  UpdateTentangKamiInput,
  UpdateHeroBannersInput,
  BannerPromoItemInput,
  DefaultSlideConfigInput,
} from './admin.schema'
import bcrypt from 'bcrypt'
import type { StatusBooking } from '@prisma/client'
import { formatDateToString, formatTimeToString } from '../../utils/date-time'
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'fs'
import { join } from 'path'

const DEFAULT_TENTANG_KAMI: UpdateTentangKamiInput = {
  hero: {
    tagline: 'Ruang yang hadir untuk menemani setiap langkah dalam memahami diri dan terus bertumbuh.',
    gallery: [
      'http://localhost:3001/uploads/9d944566-12e6-493c-900b-8b3575419f97.webp',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
      'http://localhost:3001/uploads/6f72e553-dfe8-4a63-96c5-1b85dacb90d9.webp',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80',
      'http://localhost:3001/uploads/05db008d-3d99-40fb-8555-d8c3bb286440.webp',
    ],
  },
  berkenalan: {
    judul: 'Mari Berkenalan dengan Empathika.',
    paragraf1:
      'Empathika hadir sebagai ruang bagi siapa pun untuk lebih memahami diri, bertumbuh, dan menjalani kehidupan dengan lebih baik. Kami percaya bahwa kesehatan mental merupakan bagian penting dari kesejahteraan hidup. Melalui berbagai layanan psikologi yang didukung oleh psikolog dan tenaga profesional, kami berupaya menghadirkan akses bantuan yang lebih dekat, nyaman, dan mudah dijangkau. Di sini, setiap orang memiliki ruang yang aman untuk bercerita, belajar, dan menemukan langkah yang sesuai dengan kebutuhannya.',
    paragraf2:
      'Kami memahami bahwa setiap orang memiliki cerita dan perjalanan yang berbeda. Karena itu, Empathika hadir untuk mendampingi tanpa menghakimi. Kami ingin menjadi bagian dari perjalananmu dalam mengenali diri, menghadapi berbagai tantangan, dan terus bertumbuh. Sebab, bagi kami, mencari bantuan bukanlah tanda kelemahan, melainkan bentuk kepedulian terhadap diri sendiri dan langkah awal untuk menjalani kehidupan yang lebih baik.',
  },
  nilai: {
    judulSection: 'Nilai yang Kami Bawa',
    subjudulSection:
      'Nilai-nilai ini menjadi landasan kami dalam menghadirkan layanan psikologi yang peduli dan berkualitas.',
    items: [
      {
        id: 'empati',
        judul: 'Empati',
        deskripsi: 'Mendengarkan tanpa menghakimi dan memahami potensi diri setiap individu.',
        icon: 'heart',
      },
      {
        id: 'profesional',
        judul: 'Profesional',
        deskripsi: 'Didukung tenaga profesional yang kompeten dan berpengalaman.',
        icon: 'star',
      },
      {
        id: 'privasi',
        judul: 'Privasi Terjaga',
        deskripsi: 'Menjaga kerahasiaan data dan cerita setiap individu sebagai prioritas utama kami.',
        icon: 'shield',
      },
      {
        id: 'solutif',
        judul: 'Solutif Aktif',
        deskripsi: 'Setiap orang bisa menangani dan mengatasi masalah secara aktif dan solutif.',
        icon: 'users',
      },
    ],
  },
  kenapaHadir: {
    judul: 'Kenapa Empathika Hadir?',
    fotoTim: 'http://localhost:3001/uploads/bff0e7cd-4b6e-449a-83d2-39ccb787b5aa.webp',
    paragraf1:
      'Mencari bantuan psikologis bukanlah hal yang selalu mudah. Rasa takut, stigma, keterbatasan akses, hingga kekhawatiran untuk terbuka sering kali membuat seseorang memilih memendam apa yang sedang dirasakannya.',
    paragraf2:
      'Berangkat dari kepedulian tersebut, Empathika hadir untuk mendekatkan layanan psikologi melalui pemanfaatan teknologi. Kami ingin menghadirkan akses bantuan yang lebih mudah, nyaman, dan terbuka bagi siapa pun yang membutuhkannya.',
    paragraf3:
      'Kami percaya bahwa setiap orang berhak mendapatkan dukungan dan ruang untuk didengarkan tanpa merasa dihakimi. Karena memahami diri dan mencari bantuan merupakan bagian dari perjalanan untuk menjalani kehidupan yang lebih baik.',
  },
  layananSection: {
    judul: 'Ada untuk Setiap Langkahmu',
    deskripsi:
      'Kami menyediakan beragam layanan psikologi untuk menemani setiap fase kehidupan dan membantu memenuhi kebutuhanmu.',
  },
  pemimpinSection: {
    judulSection: 'Berawal dari Mereka',
    fotoBersama: '',
    pendiri: {
      nama: '',
      peran: '',
      bio: '',
      foto: '',
    },
    manager: {
      nama: '',
      peran: '',
      bio: '',
      foto: '',
    },
  },
}

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
    this.repo = new AdminRepository((fastify as any).prisma)
    this.bookingService = new BookingService(fastify)
  }

  // ── Sesi & Jadwal Konsultasi (Didelegasikan ke Modul Booking) ──

  async getJadwalOverview(query: GetAdminJadwalQuery) {
    return this.bookingService.getJadwalOverview(query)
  }

  async createJadwalSlot(input: CreateAdminJadwalSlotInput) {
    return this.bookingService.createAdminJadwalSlot(input)
  }

  async deleteJadwalSlot(id: string, accountId?: string, role: string = 'ADMIN') {
    return this.bookingService.deleteJadwalSlot(id, accountId, role)
  }

  async createAdminSesi(input: CreateAdminSesiInput) {
    return this.bookingService.createAdminSesi(input)
  }

  async updateBookingStatus(id: string, status: StatusBooking) {
    return this.bookingService.updateBookingStatus(id, status)
  }

  async rescheduleBooking(id: string, payload: RescheduleBookingInput) {
    return this.bookingService.rescheduleBooking(id, payload)
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
      instagram: (admin as any).instagram || '',
      tiktok: (admin as any).tiktok || '',
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
      // Biarkan null jika database belum siap
    }
    const embedUrl = await resolveGoogleMapsEmbedUrl(admin?.link_maps, admin?.alamat)

    return {
      nama: admin?.nama || '',
      email: admin?.email || '',
      no_telepon: admin?.no_telepon || '',
      noTelepon: admin?.no_telepon || '',
      alamat: admin?.alamat || '',
      link_maps: admin?.link_maps || '',
      linkMaps: admin?.link_maps || '',
      link_maps_embed: embedUrl,
      linkMapsEmbed: embedUrl,
      bio: admin?.bio || '',
      foto: admin?.foto || null,
      instagram: (admin as any)?.instagram || '',
      tiktok: (admin as any)?.tiktok || '',
      youtube: (admin as any)?.youtube || '',
      linkedin: (admin as any)?.linkedin || '',
    }
  }

  /**
   * Menghitung data grafik reservasi sesi konsultasi & asesmen terkonfirmasi
   * Periode:
   * - "minggu": 7 hari (Senin s/d Minggu minggu ini)
   * - "bulan": 4 minggu di bulan berjalan
   * - "bulan_lalu": 4 minggu di bulan sebelumnya
   */
  async getDashboardChartData(_periodQuery?: string, biroId?: string) {
    const now = new Date()
    // Waktu WIB (UTC+7)
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000)
    const curYear = wibNow.getUTCFullYear()
    const curMonth = wibNow.getUTCMonth() // 0-indexed
    const curDate = wibNow.getUTCDate()
    const curDay = wibNow.getUTCDay() // 0 = Minggu, 1 = Senin, ...

    // Helper hitung tinggi bar proporsional (max 90%, 0% jika tidak ada sesi)
    const computeBarHeights = (items: { label: string; value: number }[]) => {
      const maxValue = Math.max(...items.map((i) => i.value), 0)
      return items.map((item) => {
        let heightPercent = 0
        if (maxValue > 0 && item.value > 0) {
          heightPercent = Math.max(15, Math.round((item.value / maxValue) * 90))
        }
        return {
          label: item.label,
          value: item.value,
          height: `${heightPercent}%`,
        }
      })
    }

    // ── 1. Periode "Minggu Ini" (Senin - Minggu) ──
    const diffToMonday = curDate - curDay + (curDay === 0 ? -6 : 1)
    const thisMonday = new Date(Date.UTC(curYear, curMonth, diffToMonday, 0, 0, 0, 0))
    const thisSunday = new Date(Date.UTC(curYear, curMonth, diffToMonday + 6, 23, 59, 59, 999))

    const weekSessions = await this.repo.getConfirmedSessionsBetween(thisMonday, thisSunday, biroId)

    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    const weekCounts = [0, 0, 0, 0, 0, 0, 0]

    weekSessions.forEach((s) => {
      if (!s.jadwal?.tanggal) return
      const tglStr = formatDateToString(s.jadwal.tanggal)
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(Date.UTC(curYear, curMonth, diffToMonday + i, 0, 0, 0, 0))
        if (tglStr === formatDateToString(targetDate)) {
          weekCounts[i]++
          break
        }
      }
    })

    const chartMinggu = computeBarHeights(
      dayLabels.map((lbl, idx) => ({
        label: lbl,
        value: weekCounts[idx],
      }))
    )

    // ── 2. Periode "Bulan Ini" (Bagi ke dalam 4 range minggu) ──
    const monthStart = new Date(Date.UTC(curYear, curMonth, 1, 0, 0, 0, 0))
    const monthEnd = new Date(Date.UTC(curYear, curMonth + 1, 0, 23, 59, 59, 999))
    const monthSessions = await this.repo.getConfirmedSessionsBetween(monthStart, monthEnd, biroId)

    const monthBuckets = [
      { label: 'Mgg 1', start: 1, end: 7, value: 0 },
      { label: 'Mgg 2', start: 8, end: 14, value: 0 },
      { label: 'Mgg 3', start: 15, end: 21, value: 0 },
      { label: 'Mgg 4', start: 22, end: 31, value: 0 },
    ]

    monthSessions.forEach((s) => {
      if (!s.jadwal?.tanggal) return
      const d = new Date(s.jadwal.tanggal)
      const dayNum = d.getUTCDate()
      const bucket = monthBuckets.find((b) => dayNum >= b.start && dayNum <= b.end)
      if (bucket) {
        bucket.value++
      }
    })

    const chartBulan = computeBarHeights(
      monthBuckets.map((b) => ({
        label: b.label,
        value: b.value,
      }))
    )

    // ── 3. Periode "Bulan Lalu" (Bagi ke dalam 4 range minggu) ──
    const lastMonthYear = curMonth === 0 ? curYear - 1 : curYear
    const lastMonth = curMonth === 0 ? 11 : curMonth - 1
    const lastMonthStart = new Date(Date.UTC(lastMonthYear, lastMonth, 1, 0, 0, 0, 0))
    const lastMonthEnd = new Date(Date.UTC(lastMonthYear, lastMonth + 1, 0, 23, 59, 59, 999))

    const lastMonthSessions = await this.repo.getConfirmedSessionsBetween(lastMonthStart, lastMonthEnd, biroId)

    const lastMonthBuckets = [
      { label: 'Mgg 1', start: 1, end: 7, value: 0 },
      { label: 'Mgg 2', start: 8, end: 14, value: 0 },
      { label: 'Mgg 3', start: 15, end: 21, value: 0 },
      { label: 'Mgg 4', start: 22, end: 31, value: 0 },
    ]

    lastMonthSessions.forEach((s) => {
      if (!s.jadwal?.tanggal) return
      const d = new Date(s.jadwal.tanggal)
      const dayNum = d.getUTCDate()
      const bucket = lastMonthBuckets.find((b) => dayNum >= b.start && dayNum <= b.end)
      if (bucket) {
        bucket.value++
      }
    })

    const chartBulanLalu = computeBarHeights(
      lastMonthBuckets.map((b) => ({
        label: b.label,
        value: b.value,
      }))
    )

    return {
      minggu: chartMinggu,
      bulan: chartBulan,
      bulan_lalu: chartBulanLalu,
    }
  }

  /**
   * Menghasilkan 5 metrik ringkasan operasional admin (real-time dari PostgreSQL)
   */
  async getDashboardMetrics(biroId?: string) {
    const now = new Date()
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000)
    const curYear = wibNow.getUTCFullYear()
    const curMonth = wibNow.getUTCMonth() // 0-indexed
    const curDate = wibNow.getUTCDate()

    // 1. Rentang Bulan Ini (WIB UTC)
    const monthStart = new Date(Date.UTC(curYear, curMonth, 1, 0, 0, 0, 0))
    const monthEnd = new Date(Date.UTC(curYear, curMonth + 1, 0, 23, 59, 59, 999))

    // 2. Rentang Bulan Lalu
    const lastMonthYear = curMonth === 0 ? curYear - 1 : curYear
    const lastMonth = curMonth === 0 ? 11 : curMonth - 1
    const lastMonthStart = new Date(Date.UTC(lastMonthYear, lastMonth, 1, 0, 0, 0, 0))
    const lastMonthEnd = new Date(Date.UTC(lastMonthYear, lastMonth + 1, 0, 23, 59, 59, 999))

    // 3. Batas Kemarin (23:59:59)
    const yesterdayEnd = new Date(Date.UTC(curYear, curMonth, curDate - 1, 23, 59, 59, 999))

    const rawMetrics = await this.repo.getOperationalMetricsData(
      monthStart,
      monthEnd,
      lastMonthStart,
      lastMonthEnd,
      yesterdayEnd,
      biroId
    )

    // Format Rupiah: Rp 18.750.000
    const formatRp = (num: number) =>
      `Rp ${Math.round(num).toLocaleString('id-ID')}`

    // Hitung persentase pendapatan vs bulan lalu
    let incomeChange = '0% dari bulan lalu'
    if (rawMetrics.totalIncomeLastMonth > 0) {
      const diffPercent = Math.round(
        ((rawMetrics.totalIncomeThisMonth - rawMetrics.totalIncomeLastMonth) /
          rawMetrics.totalIncomeLastMonth) *
          100
      )
      incomeChange = `${diffPercent >= 0 ? '+' : ''}${diffPercent}% dari bulan lalu`
    } else if (rawMetrics.totalIncomeThisMonth > 0) {
      incomeChange = '+100% dari bulan lalu'
    }

    // Hitung perubahan klien aktif vs kemarin
    const isBiro = Boolean(biroId)
    const clientDiff = rawMetrics.newClientsSinceYesterday
    const clientChange = isBiro
      ? (rawMetrics.totalClients > 0 ? `${rawMetrics.totalClients} klien aktif` : 'Belum ada klien terdaftar')
      : (clientDiff > 0 ? `+${clientDiff} dari kemarin` : 'Klien beraktivitas aktif')

    return {
      pendapatanBulanIni: {
        title: 'Pendapatan Bulan Ini',
        value: formatRp(rawMetrics.totalIncomeThisMonth),
        rawValue: rawMetrics.totalIncomeThisMonth,
        change: incomeChange,
        color: '#5D205E',
      },
      menungguReview: {
        title: isBiro ? 'Klien Aktif Biro' : 'Menunggu Review',
        value: isBiro ? `${rawMetrics.totalClients} Klien` : `${rawMetrics.totalClients} Tes`,
        rawValue: rawMetrics.totalClients,
        change: clientChange,
        color: '#5D205E',
      },
      totalKlienAktif: {
        title: isBiro ? 'Klien Aktif Biro' : 'Menunggu Review',
        value: isBiro ? `${rawMetrics.totalClients} Klien` : `${rawMetrics.totalClients} Tes`,
        rawValue: rawMetrics.totalClients,
        change: clientChange,
        color: '#5D205E',
      },
      sesiKonselingSelesai: {
        title: 'Sesi Konseling Selesai',
        value: `${rawMetrics.completedSessionsThisMonth} Sesi`,
        rawValue: rawMetrics.completedSessionsThisMonth,
        change: 'Akumulasi bulan ini',
        color: '#5D205E',
      },
      pendaftarEvent: {
        title: isBiro ? 'Pendaftar Layanan' : 'Pendaftar Event',
        value: `${rawMetrics.totalEventParticipants} Peserta`,
        rawValue: rawMetrics.totalEventParticipants,
        change: isBiro
          ? (rawMetrics.totalEventParticipants > 0 ? `${rawMetrics.totalEventParticipants} peserta terdaftar` : 'Belum ada program aktif')
          : `Dari ${rawMetrics.activeEventsCount} event dibuka`,
        color: '#5D205E',
      },
      pendaftarWorkshop: {
        title: isBiro ? 'Pendaftar Layanan' : 'Pendaftar Event',
        value: `${rawMetrics.totalEventParticipants} Peserta`,
        rawValue: rawMetrics.totalEventParticipants,
        change: isBiro
          ? (rawMetrics.totalEventParticipants > 0 ? `${rawMetrics.totalEventParticipants} peserta terdaftar` : 'Belum ada program aktif')
          : `Dari ${rawMetrics.activeEventsCount} event dibuka`,
        color: '#5D205E',
      },
      menungguPembayaran: {
        title: 'Menunggu Pembayaran',
        value: `${rawMetrics.pendingPaymentCount} Transaksi`,
        rawValue: rawMetrics.pendingPaymentCount,
        change: rawMetrics.pendingPaymentCount > 0 ? 'Perlu konfirmasi' : 'Tidak ada tagihan tertunda',
        color: '#D97706',
      },
    }
  }

  /**
   * Mengambil sesi konseling hari ini untuk widget dashboard (default limit: 5 sesi terdekat)
   */
  async getDashboardTodaySessions(limit: number = 5, biroId?: string) {
    const now = new Date()
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000)
    const curYear = wibNow.getUTCFullYear()
    const curMonth = wibNow.getUTCMonth()
    const curDate = wibNow.getUTCDate()
    const todayDate = new Date(Date.UTC(curYear, curMonth, curDate, 0, 0, 0, 0))

    const { totalCount, rawSessions } = await this.repo.findDashboardTodaySessions(todayDate, limit, biroId)

    const currentMinutes = wibNow.getUTCHours() * 60 + wibNow.getUTCMinutes()

    const sessions = rawSessions.map((s) => {
      const jamMulaiStr = formatTimeToString(s.jadwal.jam_mulai)
      const jamSelesaiStr = formatTimeToString(s.jadwal.jam_selesai)
      const waktuRange = `${jamMulaiStr} - ${jamSelesaiStr} WIB`

      // Tentukan status dinamis sesi
      let dynamicStatus: string = 'Menunggu Jadwal'
      if (s.status === 'COMPLETED') {
        dynamicStatus = 'Selesai'
      } else if (s.status === 'CANCELLED') {
        dynamicStatus = 'Dibatalkan'
      } else {
        const [hMulai, mMulai] = jamMulaiStr.split(':').map(Number)
        const [hSelesai, mSelesai] = jamSelesaiStr.split(':').map(Number)
        const startMinutes = (hMulai || 0) * 60 + (mMulai || 0)
        const endMinutes = (hSelesai || 0) * 60 + (mSelesai || 0)

        if (currentMinutes >= endMinutes) {
          dynamicStatus = 'Selesai'
        } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          dynamicStatus = 'Sedang Berlangsung'
        } else if (startMinutes - currentMinutes > 0 && startMinutes - currentMinutes <= 30) {
          dynamicStatus = 'Segera Dimulai'
        } else {
          dynamicStatus = 'Menunggu Jadwal'
        }
      }

      const isAsesmen =
        s.jadwal.tipe_jadwal === 'ASESMEN' ||
        (s.layanan?.nama || '').toLowerCase().includes('asesmen')

      return {
        id: s.id,
        waktu: waktuRange,
        klien: s.client.nama,
        psikolog:
          s.jadwal.psikolog?.nama_gelar ||
          s.jadwal.psikolog?.account?.nama ||
          (isAsesmen ? 'Asesor' : '-'),
        layanan: s.layanan?.nama || '-',
        metode: (s.metode || 'ONLINE').toUpperCase() === 'OFFLINE' ? 'Offline' : 'Online',
        status: dynamicStatus,
      }
    })

    return {
      totalCount,
      limit,
      hasMore: totalCount > limit,
      sessions,
    }
  }

  /**
   * Mengambil transaksi pembayaran terbaru untuk widget ringkasan operasional dashboard
   */
  async getDashboardRecentTransactions(limit: number = 5, biroId?: string) {
    const { totalCount, rawTransactions } = await this.repo.findDashboardRecentTransactions(limit, biroId)

    const transactions = rawTransactions.map((trx) => {
      const clientName = trx.client?.nama || '-'
      let layananName = '-'
      let kategori = '-'

      if (trx.booking_konsultasi?.layanan?.nama) {
        layananName = trx.booking_konsultasi.layanan.nama
        kategori = 'Konseling'
      } else if (trx.booking_psikotes?.paket?.judul) {
        layananName = trx.booking_psikotes.paket.judul
        kategori = 'Psikotes'
      } else if (trx.booking_event?.event?.judul) {
        layananName = trx.booking_event.event.judul
        kategori = 'Event'
      }

      // Format metode pembayaran yang user-friendly
      let metode = trx.channel_pembayaran || trx.metode_pembayaran || '-'
      if (metode === 'TRANSFER_BANK') metode = 'Transfer Bank'
      else if (metode === 'E_WALLET') metode = 'E-Wallet'

      // Format status
      let status: 'Lunas' | 'Menunggu Pembayaran' | 'Gagal' | 'Refunded' = 'Menunggu Pembayaran'
      if (trx.status_pembayaran === 'PAID') status = 'Lunas'
      else if (trx.status_pembayaran === 'REFUNDED') status = 'Refunded'
      else if (trx.status_pembayaran === 'FAILED') status = 'Gagal'

      const total = Number(trx.total ?? 0)
      const totalFormatted = total === 0 ? 'Gratis' : `Rp ${total.toLocaleString('id-ID')}`

      return {
        id: trx.kode_transaksi || trx.id,
        client: clientName,
        layanan: layananName,
        kategori,
        total: totalFormatted,
        metode,
        status,
        createdAt: trx.createdAt,
      }
    })

    return {
      totalCount,
      limit,
      hasMore: totalCount > limit,
      transactions,
    }
  }

  /**
   * Mengambil agenda dan peringatan operasional mendatang murni dari Database
   */
  async getDashboardAgenda(limit: number = 6, biroId?: string) {
    const { upcomingEvents, upcomingSessions, pendingPayments } = await this.repo.findDashboardAgenda(limit, biroId)

    const agendaList: Array<{
      title: string
      type: string
      time: string
      href: string
      badgeColor: string
      dotColor: string
    }> = []

    // 1. Pending Payments (Paling prioritas sebagai peringatan)
    for (const trx of pendingPayments) {
      const clientName = trx.client?.nama || '-'
      const trxId = trx.kode_transaksi || trx.id
      agendaList.push({
        title: `Batas Pembayaran: ${clientName} (${trxId})`,
        type: 'Peringatan',
        time: 'Perlu Konfirmasi',
        href: '/admin/transaksi?status=pending',
        badgeColor: 'bg-red-50 text-red-700',
        dotColor: 'bg-red-500',
      })
    }

    // 2. Upcoming Sessions
    for (const s of upcomingSessions) {
      const jamMulaiStr = s.jadwal?.jam_mulai ? formatTimeToString(s.jadwal.jam_mulai) : ''
      const tglStr = s.jadwal?.tanggal
        ? new Date(s.jadwal.tanggal).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
          })
        : '-'
      const clientName = s.client?.nama || '-'
      const layananName = s.layanan?.nama || '-'

      agendaList.push({
        title: `Konseling: ${clientName} (${layananName})`,
        type: 'Konseling',
        time: jamMulaiStr ? `${tglStr}, ${jamMulaiStr} WIB` : tglStr,
        href: '/admin/jadwal',
        badgeColor: 'bg-[#F3E8F5] text-[#5D205E]',
        dotColor: 'bg-[#BFA3C5]',
      })
    }

    // 3. Upcoming Events
    for (const ev of upcomingEvents) {
      const jamStr = ev.jam_mulai ? formatTimeToString(ev.jam_mulai) : ''
      const tglStr = ev.tanggal
        ? new Date(ev.tanggal).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
          })
        : 'Mendatang'

      agendaList.push({
        title: ev.judul,
        type: 'Event',
        time: jamStr ? `${tglStr}, ${jamStr} WIB` : tglStr,
        href: '/admin/event',
        badgeColor: 'bg-[#5D205E] text-white',
        dotColor: 'bg-[#5D205E]',
      })
    }

    return {
      total: agendaList.length,
      agendaList: agendaList.slice(0, limit),
    }
  }

  // ── Manajemen Tentang Kami ──────────────────────────────────────

  async getTentangKami(): Promise<UpdateTentangKamiInput> {
    // 1. Baca langsung dari Database (tabel SiteSetting dengan key 'tentang_kami')
    try {
      const setting = await this.repo.getSiteSetting('tentang_kami')
      if (setting && setting.value) {
        const val = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
        return {
          ...DEFAULT_TENTANG_KAMI,
          ...val,
          hero: { ...DEFAULT_TENTANG_KAMI.hero, ...(val.hero || {}) },
          berkenalan: { ...DEFAULT_TENTANG_KAMI.berkenalan, ...(val.berkenalan || {}) },
          nilai: { ...DEFAULT_TENTANG_KAMI.nilai, ...(val.nilai || {}) },
          kenapaHadir: { ...DEFAULT_TENTANG_KAMI.kenapaHadir, ...(val.kenapaHadir || {}) },
          layananSection: { ...DEFAULT_TENTANG_KAMI.layananSection, ...(val.layananSection || {}) },
          pemimpinSection: {
            ...DEFAULT_TENTANG_KAMI.pemimpinSection,
            ...(val.pemimpinSection || {}),
            pendiri: {
              ...DEFAULT_TENTANG_KAMI.pemimpinSection?.pendiri,
              ...(val.pemimpinSection?.pendiri || {}),
              foto: val.pemimpinSection?.pendiri?.foto ?? '',
            },
            manager: {
              ...DEFAULT_TENTANG_KAMI.pemimpinSection?.manager,
              ...(val.pemimpinSection?.manager || {}),
              foto: val.pemimpinSection?.manager?.foto ?? '',
            },
          },
        }
      }
    } catch (err: any) {
      console.warn('Gagal membaca Tentang Kami dari database, gunakan default bawaan:', err?.message)
    }

    // 2. Jika database belum terisi atau baru dideploy, gunakan default bawaan sistem
    return DEFAULT_TENTANG_KAMI
  }

  async updateTentangKami(input: UpdateTentangKamiInput): Promise<UpdateTentangKamiInput> {
    const normalizedInput: UpdateTentangKamiInput = {
      ...input,
      pemimpinSection: input.pemimpinSection
        ? {
            ...input.pemimpinSection,
            pendiri: input.pemimpinSection.pendiri
              ? {
                  ...input.pemimpinSection.pendiri,
                  foto: input.pemimpinSection.pendiri.foto ?? '',
                }
              : undefined,
            manager: input.pemimpinSection.manager
              ? {
                  ...input.pemimpinSection.manager,
                  foto: input.pemimpinSection.manager.foto ?? '',
                }
              : undefined,
          }
        : input.pemimpinSection,
    }

    // Simpan murni ke Database (tabel SiteSetting dengan key 'tentang_kami')
    await this.repo.upsertSiteSetting('tentang_kami', normalizedInput)

    return normalizedInput
  }

  // ── Manajemen Banner Hero Promosi & Slide Utama ──────────────────────

  async getHeroBanners(): Promise<UpdateHeroBannersInput> {
    const fallbackSlide: DefaultSlideConfigInput = {
      title: 'Ruang Aman untuk Pulih Bersama Psikolog Profesional & Terpercaya',
      subtitle:
        'Kamu tidak harus memikul semuanya sendirian. Ceritakan apa yang kamu rasakan, mari temukan jalan keluar dan bertumbuh bersama Empathika.',
      link: '/konseling',
    }

    let bannersFromDb: BannerPromoItemInput[] | null = null
    let slideFromDb: DefaultSlideConfigInput | null = null

    // 1. Coba baca dari Database (tabel SiteSetting dengan key 'hero_banners')
    try {
      const setting = await this.repo.getSiteSetting('hero_banners')
      if (setting && setting.value) {
        const val = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
        if (Array.isArray(val.promoBanners)) {
          bannersFromDb = val.promoBanners
        }
        if (val.defaultSlide) {
          slideFromDb = val.defaultSlide
        }
      }
    } catch {
      // Abaikan error jika database belum terhubung
    }

    // 2. Baca file JSON lokal
    let bannersFromFile: BannerPromoItemInput[] | null = null
    let slideFromFile: DefaultSlideConfigInput | null = null

    const dataDir = join(process.cwd(), 'data')
    const filePath = join(dataDir, 'hero-banners.json')
    try {
      if (existsSync(filePath)) {
        const raw = readFileSync(filePath, 'utf-8')
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed.promoBanners)) {
          bannersFromFile = parsed.promoBanners
        }
        if (parsed.defaultSlide) {
          slideFromFile = parsed.defaultSlide
        }
      }
    } catch {
      // Abaikan jika berkas belum ada
    }

    // Prioritaskan DB jika ada, jika DB kosong/belum ada maka pakai file lokal
    const promoBanners = bannersFromDb !== null ? bannersFromDb : (bannersFromFile ?? [])
    const chosenSlide = slideFromDb ?? slideFromFile
    const defaultSlide: DefaultSlideConfigInput = {
      title: chosenSlide?.title ?? fallbackSlide.title,
      subtitle: chosenSlide?.subtitle ?? fallbackSlide.subtitle,
      link: chosenSlide?.link ?? fallbackSlide.link,
    }

    return {
      promoBanners,
      defaultSlide,
    }
  }

  async getHeroBannersPublic(): Promise<{
    activeBanners: BannerPromoItemInput[]
    defaultSlide: DefaultSlideConfigInput
  }> {
    const data = await this.getHeroBanners()
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    const activeBanners = (data.promoBanners || []).filter((b) => {
      if (!b.aktif) return false
      if (b.tanggalMulai) {
        const startStr = b.tanggalMulai.split('T')[0]
        if (todayStr < startStr) return false
      }
      if (b.tanggalBerakhir) {
        const endStr = b.tanggalBerakhir.split('T')[0]
        if (todayStr > endStr) return false
      }
      return true
    })

    return {
      activeBanners,
      defaultSlide: data.defaultSlide || {
        title: 'Ruang Aman untuk Pulih Bersama Psikolog Profesional & Terpercaya',
        subtitle:
          'Kamu tidak harus memikul semuanya sendirian. Ceritakan apa yang kamu rasakan, mari temukan jalan keluar dan bertumbuh bersama Empathika.',
        link: '/konseling',
      },
    }
  }

  async updateHeroBanners(input: UpdateHeroBannersInput): Promise<UpdateHeroBannersInput> {
    const dataToSave: UpdateHeroBannersInput = {
      promoBanners: input.promoBanners || [],
      defaultSlide: input.defaultSlide || {
        title: 'Ruang Aman untuk Pulih Bersama Psikolog Profesional & Terpercaya',
        subtitle:
          'Kamu tidak harus memikul semuanya sendirian. Ceritakan apa yang kamu rasakan, mari temukan jalan keluar dan bertumbuh bersama Empathika.',
        link: '/konseling',
      },
    }

    // 1. Simpan ke Database (tabel SiteSetting dengan key 'hero_banners')
    try {
      await this.repo.upsertSiteSetting('hero_banners', dataToSave)
    } catch (err: any) {
      console.warn('Gagal menyimpan Hero Banners ke database, fallback ke berkas JSON:', err.message)
    }

    // 2. Dual-write ke JSON lokal
    try {
      const dataDir = join(process.cwd(), 'data')
      const filePath = join(dataDir, 'hero-banners.json')
      const tempPath = join(dataDir, `hero-banners.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`)
      if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true })
      }
      writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8')
      renameSync(tempPath, filePath)
    } catch {
      // Abaikan jika read-only
    }

    return dataToSave
  }

  // ── Modul Manajemen Internship (Database Murni) ──────────────────
  async getInternship(onlyOpen = false): Promise<any[]> {
    return this.repo.getInternshipPositions(onlyOpen)
  }

  async getInternshipById(id: string): Promise<any> {
    const pos = await this.repo.getInternshipPositionById(id)
    if (!pos) throw new Error("Posisi internship tidak ditemukan")
    return pos
  }

  async createInternship(data: any): Promise<any> {
    return this.repo.createInternshipPosition(data)
  }

  async updateInternshipPosition(id: string, data: any): Promise<any> {
    return this.repo.updateInternshipPosition(id, data)
  }

  async toggleInternshipStatus(id: string): Promise<any> {
    return this.repo.toggleInternshipPosition(id)
  }

  async deleteInternship(id: string): Promise<void> {
    await this.repo.deleteInternshipPosition(id)
  }

  async syncAllInternshipPositions(positions: any[]): Promise<any[]> {
    return this.repo.syncAllInternshipPositions(positions)
  }
}

