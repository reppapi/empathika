/** Sub-repository pembuatan booking, verifikasi tiket, dan penarikan hasil asesmen */
import type { PrismaClient, MetodePembayaran, StatusPembayaran } from '@prisma/client'
import { generateOrderId, normalizePhoneNumber, formatIndonesianPhone } from '../../../utils'
import type {
  CreateBookingPsikotesInput,
  VerifyTicketInput,
} from '../psikotes.schema'
import { createHasilAccessToken, verifyHasilAccessToken } from '../hasil-token'
import { determineKategoriPeserta } from './peserta-kategori.helper'
import { purgeExpiredPsikotesData } from './retensi-psikotes.helper'

export class PsikotesBookingRepository {
  constructor(private prisma: PrismaClient) {}

  async createBooking(input: CreateBookingPsikotesInput) {
    return this.prisma.$transaction(async (tx) => {
      const rawPaketId = (input.id_paket || input.testId || '').trim()
      if (!rawPaketId) {
        throw Object.assign(new Error('ID paket psikotes wajib diisi'), { statusCode: 400 })
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawPaketId)

      // 1. Cari paket psikotes berdasarkan UUID, id, kode alat ukur, atau judul
      let paket = await tx.paketPsikotes.findFirst({
        where: (isUuid
          ? { id: rawPaketId }
          : {
            OR: [
              { id: rawPaketId },
              { alat_ukur: { kode: { equals: rawPaketId, mode: 'insensitive' as const } } },
              { alat_ukur: { kode: { contains: rawPaketId, mode: 'insensitive' as const } } },
              { judul: { equals: rawPaketId, mode: 'insensitive' as const } },
              { judul: { contains: rawPaketId, mode: 'insensitive' as const } },
              ...(rawPaketId.toLowerCase().includes('dass')
                ? [
                  { alat_ukur: { kode: { contains: 'DASS', mode: 'insensitive' as const } } },
                  { judul: { contains: 'stres', mode: 'insensitive' as const } },
                  { judul: { contains: 'depresi', mode: 'insensitive' as const } },
                ]
                : []),
            ],
          }) as any,
      })

      if (!paket) {
        // Fallback: cari paket berbayar terbitan terbaru
        paket = await tx.paketPsikotes.findFirst({
          where: {
            OR: [
              { jenis_akses: 'BERBAYAR' },
              { status: 'PUBLISHED' },
            ],
          },
          orderBy: { createdAt: 'desc' },
        })
      }

      if (!paket) {
        throw Object.assign(
          new Error(`Paket psikotes dengan pengidentifikasi '${rawPaketId}' tidak ditemukan`),
          { statusCode: 404 }
        )
      }

      // Jika paket yang ditemukan berjenis GRATIS, periksa apakah ada varian BERBAYAR dengan judul yang sama
      if (paket.jenis_akses === 'GRATIS') {
        const berbayarVariant = await tx.paketPsikotes.findFirst({
          where: {
            judul: { equals: paket.judul.trim(), mode: 'insensitive' },
            jenis_akses: 'BERBAYAR',
          },
        })
        if (berbayarVariant) {
          paket = berbayarVariant
        }
      }

      if (paket.status !== 'PUBLISHED') {
        throw Object.assign(
          new Error('Paket psikotes ini belum dipublikasikan atau sedang dinonaktifkan.'),
          { statusCode: 403 }
        )
      }

      // 2. Normalisasi data Klien (Peserta)
      const inputName = (input.klien?.nama || input.nama || '').trim()
      const rawPhone = (input.klien?.no_telepon || input.no_telepon || '').trim()
      const formattedPhone = formatIndonesianPhone(rawPhone)
      const inputPhone = normalizePhoneNumber(rawPhone) || rawPhone
      const inputEmail = (input.klien?.email || input.email || '').trim()
      const inputUsia = input.klien?.usia ?? null
      const inputGender = input.klien?.jenis_kelamin || null
      const idBiro = input.id_biro || null

      if (!inputName) {
        throw Object.assign(new Error('Nama lengkap peserta wajib diisi'), { statusCode: 400 })
      }

      let client: any = null
      const normInputPhone = inputPhone ? (normalizePhoneNumber(rawPhone) || inputPhone) : null

      if (normInputPhone && inputName) {
        client = await tx.client.findFirst({
          where: {
            AND: [
              {
                OR: [
                  { no_telepon: normInputPhone },
                  ...(formattedPhone ? [{ no_telepon: formattedPhone }] : []),
                  ...(rawPhone ? [{ no_telepon: rawPhone }] : []),
                ],
              },
              { nama: { equals: inputName, mode: 'insensitive' } },
            ],
            ...(idBiro ? { id_biro: idBiro } : {}),
          },
        })
      } else if (normInputPhone) {
        client = await tx.client.findFirst({
          where: {
            OR: [
              { no_telepon: normInputPhone },
              ...(formattedPhone ? [{ no_telepon: formattedPhone }] : []),
              ...(rawPhone ? [{ no_telepon: rawPhone }] : []),
            ],
            ...(idBiro ? { id_biro: idBiro } : {}),
          },
        })
      } else if (inputName) {
        client = await tx.client.findFirst({
          where: {
            nama: { equals: inputName, mode: 'insensitive' },
            ...(idBiro ? { id_biro: idBiro } : {}),
          },
        })
      }

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: inputName,
            no_telepon: normInputPhone || null,
            usia: inputUsia,
            jenis_kelamin: inputGender,
            id_biro: idBiro,
          },
        })
      } else {
        await tx.client
          .update({
            where: { id: client.id },
            data: {
              ...(normInputPhone && client.no_telepon !== normInputPhone ? { no_telepon: normInputPhone } : {}),
              ...(idBiro && !client.id_biro ? { id_biro: idBiro } : {}),
              usia: inputUsia ?? client.usia,
              jenis_kelamin: inputGender ?? client.jenis_kelamin,
            },
          })
          .catch(() => { })
      }

      // 3. Tentukan nominal biaya transaksi
      let nominal = Number(paket.harga)
      if ((!nominal || nominal <= 0) && input.harga && Number(input.harga) > 0) {
        nominal = Number(input.harga)
      }
      if (!nominal || nominal <= 0) {
        nominal = 50000 // default tarif paket berbayar jika paket belum terisi harga di database
      }

      // 4. Normalisasi metode pembayaran ke enum Prisma
      let metodePembayaranEnum: MetodePembayaran = 'QRIS'
      const rawMetode = (input.metode_pembayaran || 'QRIS').toUpperCase()
      if (rawMetode === 'TRANSFER_BANK' || rawMetode === 'BANK') {
        metodePembayaranEnum = 'TRANSFER_BANK'
      } else if (rawMetode === 'E_WALLET' || rawMetode === 'EWALLET') {
        metodePembayaranEnum = 'E_WALLET'
      } else {
        metodePembayaranEnum = 'QRIS'
      }

      // 5. Normalisasi status pembayaran ke enum Prisma
      const statusPembayaranEnum: StatusPembayaran =
        (input.status_pembayaran as StatusPembayaran) || 'PAID'

      // 6. Buat kode transaksi unik
      const kodeTransaksi = input.kode_transaksi || `PSI-${generateOrderId()}`

      // 7. Simpan Transaksi ke tabel transaksis
      const transaksi = await tx.transaksi.create({
        data: {
          id_client: client.id,
          id_biro_tenant: idBiro || client.id_biro || null,
          kode_transaksi: kodeTransaksi,
          tipe_transaksi: 'PSIKOTES',
          subtotal: nominal,
          biaya_admin: 0,
          total: nominal,
          metode_pembayaran: metodePembayaranEnum,
          channel_pembayaran: input.channel_pembayaran || null,
          status_pembayaran: statusPembayaranEnum,
          tanggal_bayar: statusPembayaranEnum === 'PAID' ? new Date() : null,
          data_pembayaran: inputEmail ? JSON.stringify({ email: inputEmail }) : null,
        },
      })

      // 8. Cek apakah klien sudah memiliki booking aktif yang belum selesai (hasil_tes masih null)
      let booking: any = await tx.bookingPsikotes.findFirst({
        where: {
          id_paket: paket.id,
          id_client: client.id,
          hasil_tes: null,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (booking) {
        if (idBiro && (!client.id_biro || client.id_biro !== idBiro)) {
          await tx.client.update({ where: { id: client.id }, data: { id_biro: idBiro } }).catch(() => {});
        }
        // Perbarui booking yang belum dikerjakan ini dengan transaksi yang baru
        booking = await tx.bookingPsikotes.update({
          where: { id: booking.id },
          data: {
            id_transaksi: transaksi.id,
            kode_akses: booking.kode_akses || kodeTransaksi,
            status_pengerjaan: 'BELUM_MULAI',
          },
          include: {
            paket: {
              select: {
                id: true,
                judul: true,
                jenis_akses: true,
                harga: true,
                banner_url: true,
              },
            },
            transaksi: true,
            client: true,
          },
        })
      } else {
        // Buat entri BookingPsikotes baru jika belum pernah ada booking aktif yang belum selesai
        booking = await tx.bookingPsikotes.create({
          data: {
            id_paket: paket.id,
            id_client: client.id,
            id_transaksi: transaksi.id,
            kode_akses: kodeTransaksi,
            status_pengerjaan: 'BELUM_MULAI',
          },
          include: {
            paket: {
              select: {
                id: true,
                judul: true,
                jenis_akses: true,
                harga: true,
                banner_url: true,
              },
            },
            transaksi: true,
            client: true,
          },
        })
      }

      // Simpan data peserta tes ke tabel peserta_psikotes HANYA jika input.peserta dikirim secara eksplisit
      // (Jangan mengisi peserta_psikotes memakai nama/kontak pembeli transaksi)
      const explicitPeserta = (input as any).peserta
      const pesertaSource = explicitPeserta || {}
      const namaPeserta = explicitPeserta?.nama_lengkap?.trim() || ''
      const usiaPeserta = pesertaSource.usia ?? inputUsia ?? null
      const isUnderAge = usiaPeserta !== null && Number(usiaPeserta) < 18
      const kategoriOtomatis =
        pesertaSource.kategori_peserta ||
        determineKategoriPeserta(usiaPeserta)

      // Pemisahan data Anak/Remaja (<18) vs Dewasa (>=18) sesuai standar etika klinis:
      let namaOrangTua: string | null = null
      let noTeleponOrangTua: string | null = null
      let pekerjaan: string | null = null
      let statusPernikahan: string | null = null
      let noHpPeserta: string | null = null

      if (isUnderAge) {
        namaOrangTua = pesertaSource.nama_orang_tua || null
        noTeleponOrangTua =
          pesertaSource.no_telepon_orang_tua ||
          pesertaSource.whatsapp ||
          pesertaSource.no_telepon ||
          null
        noHpPeserta = pesertaSource.no_telepon || null
        pekerjaan = null
        statusPernikahan = null
      } else {
        namaOrangTua = null
        noTeleponOrangTua = null
        pekerjaan = pesertaSource.pekerjaan || null
        statusPernikahan = pesertaSource.status_pernikahan || null
        noHpPeserta =
          pesertaSource.no_telepon ||
          pesertaSource.whatsapp ||
          (input as any).no_telepon ||
          null
      }

      if (namaPeserta) {
        await (tx as any).pesertaPsikotes.upsert({
          where: { id_booking: booking.id },
          create: {
            id_booking: booking.id,
            nama_lengkap: namaPeserta,
            no_telepon: noHpPeserta,
            jenis_kelamin: pesertaSource.jenis_kelamin || inputGender || 'Laki-laki',
            tempat_lahir: pesertaSource.tempat_lahir || null,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : null,
            usia: usiaPeserta,
            kategori_peserta: kategoriOtomatis,
            nama_orang_tua: namaOrangTua,
            no_telepon_orang_tua: noTeleponOrangTua,
            pendidikan: pesertaSource.pendidikan || null,
            pekerjaan: pekerjaan,
            status_pernikahan: statusPernikahan,
          },
          update: {
            nama_lengkap: namaPeserta,
            no_telepon: noHpPeserta ?? undefined,
            jenis_kelamin: pesertaSource.jenis_kelamin || inputGender || undefined,
            tempat_lahir: pesertaSource.tempat_lahir || undefined,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : undefined,
            usia: usiaPeserta ?? undefined,
            kategori_peserta: kategoriOtomatis || undefined,
            nama_orang_tua: namaOrangTua,
            no_telepon_orang_tua: noTeleponOrangTua,
            pendidikan: pesertaSource.pendidikan || undefined,
            pekerjaan: pekerjaan,
            status_pernikahan: statusPernikahan,
          },
        }).catch(() => { })
      }

      return {
        booking: {
          id: booking.id,
          id_paket: booking.id_paket,
          id_transaksi: booking.id_transaksi,
          id_client: booking.id_client,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        },
        transaksi: {
          id: transaksi.id,
          kode_transaksi: transaksi.kode_transaksi,
          tipe_transaksi: transaksi.tipe_transaksi,
          subtotal: Number(transaksi.subtotal),
          biaya_admin: Number(transaksi.biaya_admin),
          total: Number(transaksi.total),
          metode_pembayaran: transaksi.metode_pembayaran,
          channel_pembayaran: transaksi.channel_pembayaran,
          status_pembayaran: transaksi.status_pembayaran,
          tanggal_bayar: transaksi.tanggal_bayar,
        },
        paket: {
          id: booking.paket.id,
          judul: booking.paket.judul,
          jenis_akses: booking.paket.jenis_akses,
          harga: Number(booking.paket.harga),
          banner_url: booking.paket.banner_url,
        },
        client: {
          id: booking.client.id,
          nama: booking.client.nama,
          no_telepon: booking.client.no_telepon,
          email: inputEmail || null,
          usia: booking.client.usia,
          jenis_kelamin: booking.client.jenis_kelamin,
        },
      }
    }, { maxWait: 10000, timeout: 25000 })
  }

  /**
   * Pembersihan berkala data pengerjaan psikotes tamu anonim (Retention Lifecycle).
   * Menghapus data tamu anonim gratis yang usianya lebih dari `daysOld` (default: 60 hari)
   * serta memicu pembersihan data berbayar yang melewati retensi 90 hari.
   */

  async verifyTicket(input: VerifyTicketInput) {
    purgeExpiredPsikotesData(this.prisma).catch(() => {})

    const rawKode = (input.kode_akses || '').trim()
    const cleanKode = rawKode.toUpperCase().replace(/\s+/g, '')
    const rawPhone = (input.no_telepon || '').trim()

    if (!rawKode || !rawPhone) {
      throw Object.assign(new Error('Kode akses dan nomor WhatsApp pembeli wajib diisi'), { statusCode: 400 })
    }

    // Cari booking psikotes berdasarkan kode_akses ATAU kode_transaksi
    const booking = await this.prisma.bookingPsikotes.findFirst({
      where: {
        OR: [
          { kode_akses: { equals: cleanKode, mode: 'insensitive' } },
          { kode_akses: { equals: rawKode, mode: 'insensitive' } },
          { transaksi: { kode_transaksi: { equals: cleanKode, mode: 'insensitive' } } },
          { transaksi: { kode_transaksi: { equals: rawKode, mode: 'insensitive' } } },
        ],
      },
      include: {
        paket: {
          select: {
            id: true,
            judul: true,
            jenis_akses: true,
            harga: true,
            banner_url: true,
            alat_ukur: {
              select: {
                id: true,
                kode: true,
                nama: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            nama: true,
            no_telepon: true,
          },
        },
        peserta_psikotes: true,
        hasil_tes: {
          select: {
            id: true,
            total_skor: true,
            tanggal_selesai: true,
            detail_skor: true,
          },
        },
        transaksi: {
          select: {
            id: true,
            kode_transaksi: true,
            status_pembayaran: true,
            tanggal_bayar: true,
          },
        },
      },
    })

    if (!booking) {
      throw Object.assign(
        new Error(`Kode akses '${rawKode}' tidak ditemukan. Mohon periksa kembali kode tiket pada bukti pembayaran Anda.`),
        { statusCode: 404 }
      )
    }

    // Validasi apakah tiket ini sesuai dengan paket tes yang sedang diakses
    const targetPaketInput = (input.id_paket || '').trim()
    if (targetPaketInput) {
      const normalizeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
      const targetSlug = normalizeSlug(targetPaketInput)
      const bookingPaketId = normalizeSlug(booking.id_paket)
      const alatUkurId = (booking.paket as any)?.alat_ukur?.id ? normalizeSlug((booking.paket as any).alat_ukur.id) : ''
      const alatUkurKode = (booking.paket as any)?.alat_ukur?.kode ? normalizeSlug((booking.paket as any).alat_ukur.kode) : ''
      const paketJudul = normalizeSlug(booking.paket.judul)

      const isMatch =
        targetSlug === bookingPaketId ||
        (alatUkurId && targetSlug === alatUkurId) ||
        (alatUkurKode && (targetSlug === alatUkurKode || targetSlug.includes(alatUkurKode) || alatUkurKode.includes(targetSlug))) ||
        (paketJudul && targetSlug.includes(paketJudul))

      if (!isMatch) {
        throw Object.assign(
          new Error(
            `Kode tiket '${rawKode}' tidak valid untuk tes ini. Tiket Anda terdaftar untuk paket "${booking.paket.judul}".`
          ),
          { statusCode: 400 }
        )
      }
    }

    // Verifikasi validasi kepemilikan tiket:
    // Nomor WhatsApp yang dimasukkan HARUS cocok secara penuh (exact match pada nomor ternormalisasi)
    // dengan salah satu kontak yang sah pada booking ini:
    // 1. Nomor telepon pembeli/pemesan (booking.client?.no_telepon)
    // 2. Nomor telepon peserta tes (booking.peserta_psikotes?.no_telepon)
    // 3. Nomor telepon orang tua/wali (booking.peserta_psikotes?.no_telepon_orang_tua)
    //
    // PENTING:
    // - TIDAK BOLEH mengabaikan validasi jika nomor telepon kosong.
    // - TIDAK BOLEH menggunakan substring atau pencocokan parsial 8 digit yang berisiko
    //   mencocokkan nomor berbeda yang kebetulan memiliki akhiran angka yang sama.
    const normInputPhone = normalizePhoneNumber(rawPhone)
    if (!normInputPhone || normInputPhone.length < 10) {
      throw Object.assign(
        new Error('Nomor WhatsApp yang Anda masukkan tidak valid. Mohon masukkan nomor lengkap yang aktif.'),
        { statusCode: 400 }
      )
    }

    const clientPhone = (booking.client?.no_telepon || '').trim()
    const pesertaPhone = ((booking as any).peserta_psikotes?.no_telepon || '').trim()
    const parentPhone = ((booking as any).peserta_psikotes?.no_telepon_orang_tua || '').trim()

    const normClientPhone = normalizePhoneNumber(clientPhone)
    const normPesertaPhone = normalizePhoneNumber(pesertaPhone)
    const normParentPhone = normalizePhoneNumber(parentPhone)

    const isPhoneMatched = Boolean(
      (normClientPhone && normInputPhone === normClientPhone) ||
      (normPesertaPhone && normInputPhone === normPesertaPhone) ||
      (normParentPhone && normInputPhone === normParentPhone)
    )

    if (!isPhoneMatched) {
      throw Object.assign(
        new Error('Nomor WhatsApp tidak cocok dengan nomor pemesan atau peserta yang terdaftar pada tiket ini. Mohon masukkan nomor kontak yang digunakan saat pemesanan.'),
        { statusCode: 403 }
      )
    }

    if (booking.transaksi && booking.transaksi.status_pembayaran !== 'PAID') {
      throw Object.assign(
        new Error('Status pembayaran tiket belum lunas. Silakan selesaikan pembayaran terlebih dahulu sebelum mengerjakan tes.'),
        { statusCode: 400 }
      )
    }

    const isSelesai = booking.status_pengerjaan === 'SELESAI' || Boolean(booking.hasil_tes)

    const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000

    // Validasi masa aktif tiket pengerjaan yang belum diselesaikan (3 bulan / 90 hari sejak pembelian)
    if (!isSelesai && booking.createdAt && Date.now() - new Date(booking.createdAt).getTime() > THREE_MONTHS_MS) {
      throw Object.assign(
        new Error(
          'Masa berlaku tiket pengerjaan asesmen ini telah berakhir (berlaku 3 bulan sejak tanggal pembelian). Silakan hubungi admin Empathika jika Anda memerlukan bantuan.'
        ),
        { statusCode: 410 }
      )
    }

    // Validasi masa aktif akses online laporan hasil asesmen (3 bulan / 90 hari sejak tes diselesaikan)
    if (isSelesai && booking.hasil_tes?.tanggal_selesai) {
      const selesaiDate = new Date(booking.hasil_tes.tanggal_selesai).getTime()
      if (Date.now() - selesaiDate > THREE_MONTHS_MS) {
        throw Object.assign(
          new Error(
            'Masa aktif akses online laporan hasil asesmen ini telah berakhir (berlaku 3 bulan sejak tanggal pengerjaan). Untuk evaluasi kondisi psikologis terkini, disarankan untuk melakukan asesmen ulang atau hubungi admin Empathika.'
          ),
          { statusCode: 410 }
        )
      }
    }

    const effectiveKode = booking.kode_akses || booking.transaksi?.kode_transaksi || rawKode
    const accessToken = createHasilAccessToken(booking.id)

    let redirectUrl = `/psikotes/${booking.id_paket}/mulai?bookingId=${booking.id}&orderId=${effectiveKode}&paket=berbayar&token=${encodeURIComponent(accessToken)}`

    if (isSelesai) {
      redirectUrl = `/psikotes/${booking.id_paket}/hasil?bookingId=${booking.id}&paket=berbayar&token=${encodeURIComponent(accessToken)}`
    }

    return {
      booking_id: booking.id,
      access_token: accessToken,
      kode_akses: effectiveKode,
      status_pengerjaan: booking.status_pengerjaan,
      test_id: booking.id_paket,
      judul_paket: booking.paket.judul,
      nama_pembeli: booking.client.nama,
      peserta: booking.peserta_psikotes
        ? {
          nama_lengkap: booking.peserta_psikotes.nama_lengkap,
          no_telepon: (booking.peserta_psikotes as any).no_telepon || (booking.peserta_psikotes as any).no_telepon_orang_tua || null,
          usia: booking.peserta_psikotes.usia,
          jenis_kelamin: booking.peserta_psikotes.jenis_kelamin,
          kategori_peserta:
            booking.peserta_psikotes.kategori_peserta ||
            determineKategoriPeserta(booking.peserta_psikotes.usia),
        }
        : null,
      hasil_tes: booking.hasil_tes,
      redirect_url: redirectUrl,
    }
  }

  /**
   * Mengambil data laporan hasil asesmen resmi terverifikasi murni dari database berdasarkan bookingId.
   * Melindungi dari manipulasi parameter URL (anti-tampering) dan mewajibkan HMAC token/Admin untuk paket berbayar.
   */

  async getHasilByBookingId(
    bookingId: string,
    options?: { accessToken?: string; isAdmin?: boolean }
  ) {
    const cleanId = (bookingId || '').trim()
    if (!cleanId) {
      throw Object.assign(new Error('ID pengerjaan atau tiket wajib diisi'), { statusCode: 400 })
    }

    purgeExpiredPsikotesData(this.prisma).catch(() => {})

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId)

    const booking = await this.prisma.bookingPsikotes.findFirst({
      where: isUuid
        ? { id: cleanId }
        : {
          OR: [
            { id: cleanId },
            { kode_akses: { equals: cleanId, mode: 'insensitive' as const } },
            { transaksi: { kode_transaksi: { equals: cleanId, mode: 'insensitive' as const } } },
          ],
        },
      include: {
        paket: {
          select: {
            id: true,
            judul: true,
            jenis_akses: true,
            harga: true,
            banner_url: true,
            tentang_tes: true,
            perlu_review_psikolog: true,
            alat_ukur: {
              select: {
                id: true,
                kode: true,
                nama: true,
                kategori: true,
              },
            },
            soal_psikotes: {
              include: {
                pilihan_jawaban: true,
              },
              orderBy: {
                urutan: 'asc',
              },
            },
            interpretasi_psikotes: true,
          },
        },
        client: {
          select: {
            id: true,
            nama: true,
            no_telepon: true,
            usia: true,
            jenis_kelamin: true,
          },
        },
        peserta_psikotes: true,
        transaksi: {
          select: {
            id: true,
            kode_transaksi: true,
            status_pembayaran: true,
            tanggal_bayar: true,
          },
        },
        psikolog: {
          select: {
            id: true,
            nama_gelar: true,
            kategori: true,
            foto: true,
          },
        },
        jawaban_psikotes: {
          include: {
            soal_psikotes: {
              select: {
                id: true,
                urutan: true,
                pertanyaan: true,
              },
            },
            pilihan_jawaban: {
              select: {
                id: true,
                label: true,
                teks_jawaban: true,
                bobot: true,
              },
            },
          },
          orderBy: {
            soal_psikotes: {
              urutan: 'asc',
            },
          },
        },
        hasil_tes: {
          include: {
            interpretasi: true,
          },
        },
      },
    })

    if (!booking) {
      throw Object.assign(
        new Error(`Sesi pengerjaan atau tiket dengan ID '${cleanId}' tidak ditemukan di database.`),
        { statusCode: 404 }
      )
    }

    // Proteksi PII untuk paket berbayar: wajib menyertakan HMAC token terverifikasi atau kredensial Admin
    if (booking.paket.jenis_akses === 'BERBAYAR' && !options?.isAdmin) {
      const validToken = verifyHasilAccessToken(booking.id, options?.accessToken)
      if (!validToken) {
        throw Object.assign(
          new Error(
            'Akses laporan hasil asesmen berbayar memerlukan token verifikasi yang sah. Silakan masukkan kode tiket dan nomor WhatsApp pemesan di halaman detail tes.'
          ),
          { statusCode: 403 }
        )
      }
    }

    if (!booking.hasil_tes) {
      throw Object.assign(
        new Error('Hasil laporan asesmen belum tersedia karena tes belum diselesaikan.'),
        { statusCode: 400 }
      )
    }

    // Validasi masa aktif akses online laporan hasil asesmen untuk klien: 3 bulan (90 hari) sejak pengerjaan
    // Pengecualian: Admin tetap memiliki wewenang akses riwayat asesmen untuk arsip rekap & konseling
    if (booking.hasil_tes?.tanggal_selesai && !options?.isAdmin) {
      const selesaiDate = new Date(booking.hasil_tes.tanggal_selesai).getTime()
      const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000
      if (Date.now() - selesaiDate > THREE_MONTHS_MS) {
        throw Object.assign(
          new Error(
            'Masa aktif akses online laporan hasil asesmen ini telah berakhir (berlaku 3 bulan sejak tanggal pengerjaan). Untuk evaluasi kondisi psikologis terkini, disarankan untuk melakukan asesmen ulang atau hubungi admin Empathika.'
          ),
          { statusCode: 410 }
        )
      }
    }

    const detailSkor = typeof booking.hasil_tes.detail_skor === 'string'
      ? JSON.parse(booking.hasil_tes.detail_skor)
      : booking.hasil_tes.detail_skor

    // Rekonstruksi rekap butir jawaban pasien secara bersih dan akurat sesuai struktur database
    let rekapJawaban: Array<{
      nomor: number
      pertanyaan: string
      jawaban: string
      label?: string | null
      skor: number
      id_soal?: string
      id_pilihan?: string
    }> = []

    const dbJawaban = (booking as any).jawaban_psikotes || []
    const soalList = (booking.paket as any)?.soal_psikotes || []

    if (Array.isArray(dbJawaban) && dbJawaban.length > 0) {
      rekapJawaban = dbJawaban.map((jp: any, idx: number) => ({
        nomor: jp.soal_psikotes?.urutan ?? idx + 1,
        pertanyaan: jp.soal_psikotes?.pertanyaan ?? `Butir Pertanyaan #${jp.soal_psikotes?.urutan ?? idx + 1}`,
        jawaban: jp.pilihan_jawaban?.teks_jawaban ?? '-',
        label: jp.pilihan_jawaban?.label ?? null,
        skor: typeof jp.skor === 'number' ? jp.skor : (jp.pilihan_jawaban?.bobot ?? 0),
        id_soal: jp.id_soal_psikotes,
        id_pilihan: jp.id_pilihan_jawaban,
      }))
    } else if (booking.hasil_tes?.snapshot_jawaban) {
      // Fallback jika jawaban tersimpan dalam format snapshot_jawaban JSON
      const rawSnapshot = booking.hasil_tes.snapshot_jawaban
      const snapshotList: any[] = Array.isArray(rawSnapshot)
        ? rawSnapshot
        : typeof rawSnapshot === 'object' && rawSnapshot !== null
        ? Object.entries(rawSnapshot).map(([k, v]) => ({ id_soal: k, ...(typeof v === 'object' ? v : { val: v }) }))
        : []

      rekapJawaban = snapshotList.map((item: any, idx: number) => {
        const soal = soalList.find(
          (s: any) =>
            s.id === item.id_soal ||
            s.urutan === idx + 1 ||
            s.urutan === item.nomor ||
            (typeof item.id_soal === 'string' && item.id_soal.endsWith(`-${idx + 1}`))
        )
        const pilihan = soal?.pilihan_jawaban?.find(
          (p: any) =>
            p.id === item.id_pilihan ||
            p.bobot === item.skor ||
            (item.label && p.label === item.label) ||
            (item.teks_jawaban && p.teks_jawaban === item.teks_jawaban)
        )

        return {
          nomor: soal?.urutan ?? idx + 1,
          pertanyaan: soal?.pertanyaan ?? item.pertanyaan ?? `Butir Pertanyaan #${idx + 1}`,
          jawaban: pilihan?.teks_jawaban ?? item.teks_jawaban ?? item.jawaban ?? (item.val !== undefined ? String(item.val) : '-'),
          label: pilihan?.label ?? item.label ?? null,
          skor: typeof item.skor === 'number' ? item.skor : (pilihan?.bobot ?? 0),
          id_soal: item.id_soal || soal?.id,
          id_pilihan: item.id_pilihan || pilihan?.id,
        }
      })
    }

    // Urutkan jawaban secara deterministik berdasarkan nomor butir soal
    rekapJawaban.sort((a, b) => a.nomor - b.nomor)

    return {
      id_booking: booking.id,
      id_paket: booking.id_paket,
      kode_akses: booking.kode_akses || booking.transaksi?.kode_transaksi || null,
      status_pengerjaan: booking.status_pengerjaan,
      catatan_psikolog: (booking.hasil_tes as any)?.catatan_psikolog || null,
      rekomendasi_psikolog: (booking.hasil_tes as any)?.rekomendasi_psikolog || null,
      draft_saved_at: (booking.hasil_tes as any)?.draft_saved_at || null,
      tanggal_review: (booking.hasil_tes as any)?.tanggal_review || null,
      paket: booking.paket,
      client: booking.client,
      peserta: {
        nama_lengkap: booking.peserta_psikotes?.nama_lengkap || booking.client?.nama || 'Peserta Asesmen Empathika',
        no_telepon: (booking.peserta_psikotes as any)?.no_telepon || booking.peserta_psikotes?.no_telepon_orang_tua || booking.client?.no_telepon || null,
        usia: booking.peserta_psikotes?.usia ?? booking.client?.usia ?? null,
        kategori_peserta:
          booking.peserta_psikotes?.kategori_peserta ||
          determineKategoriPeserta(booking.peserta_psikotes?.usia ?? booking.client?.usia),
        jenis_kelamin: booking.peserta_psikotes?.jenis_kelamin || booking.client?.jenis_kelamin || null,
        tempat_lahir: booking.peserta_psikotes?.tempat_lahir || null,
        tanggal_lahir: booking.peserta_psikotes?.tanggal_lahir || null,
        pendidikan: booking.peserta_psikotes?.pendidikan || null,
        pekerjaan: booking.peserta_psikotes?.pekerjaan || null,
        status_pernikahan: booking.peserta_psikotes?.status_pernikahan || null,
        nama_orang_tua: booking.peserta_psikotes?.nama_orang_tua || null,
        no_telepon_orang_tua: booking.peserta_psikotes?.no_telepon_orang_tua || null,
      },
      hasil: {
        id: booking.hasil_tes.id,
        total_skor: booking.hasil_tes.total_skor,
        detail_skor: detailSkor,
        tanggal_selesai: booking.hasil_tes.tanggal_selesai,
        grade:
          booking.hasil_tes.interpretasi?.grade ||
          (detailSkor?.tanpaSkorTotal ? detailSkor?.grade || null : null),
        judul:
          booking.hasil_tes.interpretasi?.judul ||
          (detailSkor?.tanpaSkorTotal ? detailSkor?.kategori || null : null),
        deskripsi:
          booking.hasil_tes.interpretasi?.deskripsi ||
          (detailSkor?.tanpaSkorTotal ? detailSkor?.deskripsi || null : null),
        catatan_psikolog: (booking.hasil_tes as any).catatan_psikolog || null,
        rekomendasi_psikolog: (booking.hasil_tes as any).rekomendasi_psikolog || null,
        draft_saved_at: (booking.hasil_tes as any)?.draft_saved_at || null,
        tanggal_review: (booking.hasil_tes as any).tanggal_review || null,
      },
      psikolog: (booking as any).psikolog || null,
      rekap_jawaban: rekapJawaban,
      total_jawaban: rekapJawaban.length,
      snapshot_jawaban: booking.hasil_tes.snapshot_jawaban,
    }
  }

  /**
   * Mengambil daftar asesmen psikotes yang memerlukan tinjauan/review klinis oleh psikolog.
   */
}
