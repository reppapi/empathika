import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/app'

describe('Psikotes Booking API (POST /psikotes/booking)', () => {
  let createdBookingId: string
  let createdTransaksiId: string
  let samplePaketId: string

  beforeAll(async () => {
    await app.ready()

    // Ambil paket psikotes yang ada di database atau buatkan jika belum ada
    let paket = await app.prisma.paketPsikotes.findFirst({
      where: { status: 'PUBLISHED' },
    })

    if (!paket) {
      paket = await app.prisma.paketPsikotes.create({
        data: {
          judul: 'Tes Kepribadian MBTI Pro',
          jenis_akses: 'BERBAYAR',
          harga: 75000,
          deskripsi: 'Paket tes kepribadian berbayar untuk testing integrasi',
          status: 'PUBLISHED',
        },
      })
    }

    samplePaketId = paket.id
  })

  afterAll(async () => {
    // Bersihkan data test jika ada
    if (createdBookingId) {
      await app.prisma.bookingPsikotes.deleteMany({
        where: { id: createdBookingId },
      })
    }
    if (createdTransaksiId) {
      await app.prisma.transaksi.deleteMany({
        where: { id: createdTransaksiId },
      })
    }
    await app.close()
  })

  it('harus menolak request jika ID paket tidak diberikan (validasi 422/400)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/psikotes/booking',
      payload: {
        nama: 'Peserta Uji',
        metode_pembayaran: 'QRIS',
      },
    })

    expect([400, 422]).toContain(res.statusCode)
    const body = JSON.parse(res.body)
    expect(body.message).toBeDefined()
  })

  it('harus menolak request jika nama peserta kosong (validasi 422/400)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/psikotes/booking',
      payload: {
        id_paket: samplePaketId,
        nama: '',
        metode_pembayaran: 'QRIS',
      },
    })

    expect([400, 422]).toContain(res.statusCode)
    const body = JSON.parse(res.body)
    expect(body.message).toBeDefined()
  })

  it('harus berhasil mencatat booking dan transaksi ke database menggunakan transaksi database (201)', async () => {
    const payload = {
      id_paket: samplePaketId,
      metode_pembayaran: 'TRANSFER_BANK',
      channel_pembayaran: 'bca',
      status_pembayaran: 'PAID',
      klien: {
        nama: 'Budi Santoso Test',
        no_telepon: '081298765432',
        email: 'budi.santoso.test@example.com',
        usia: 25,
        jenis_kelamin: 'Laki-laki',
      },
    }

    const res = await app.inject({
      method: 'POST',
      url: '/psikotes/booking',
      payload,
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.body)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
    expect(body.data.booking.id).toBeDefined()
    expect(body.data.transaksi.id).toBeDefined()
    expect(body.data.transaksi.tipe_transaksi).toBe('PSIKOTES')
    expect(body.data.transaksi.metode_pembayaran).toBe('TRANSFER_BANK')
    expect(body.data.transaksi.channel_pembayaran).toBe('bca')
    expect(body.data.transaksi.status_pembayaran).toBe('PAID')
    expect(body.data.client.nama).toBe('Budi Santoso Test')

    createdBookingId = body.data.booking.id
    createdTransaksiId = body.data.transaksi.id

    // Verifikasi langsung ke tabel database PostgreSQL
    const dbBooking = await app.prisma.bookingPsikotes.findUnique({
      where: { id: createdBookingId },
      include: {
        transaksi: true,
        client: true,
        paket: true,
      },
    })

    expect(dbBooking).not.toBeNull()
    expect(dbBooking?.id_transaksi).toBe(createdTransaksiId)
    expect(dbBooking?.transaksi?.tipe_transaksi).toBe('PSIKOTES')
    expect(dbBooking?.transaksi?.status_pembayaran).toBe('PAID')
    expect(dbBooking?.client.no_telepon).toBe('081298765432')

    const dbTransaksi = await app.prisma.transaksi.findUnique({
      where: { id: createdTransaksiId },
    })

    expect(dbTransaksi).not.toBeNull()
    expect(dbTransaksi?.id_client).toBe(dbBooking?.id_client)
    expect(dbTransaksi?.kode_transaksi).toMatch(/^PSI-/)
  })
})
