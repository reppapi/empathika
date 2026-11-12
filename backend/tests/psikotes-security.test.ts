/** Unit test keamanan modul psikotes: HMAC token hasil, proteksi PII berbayar, rate limit, dan guard production. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createHasilAccessToken, verifyHasilAccessToken } from '../src/modules/psikotes/hasil-token'
import { PsikotesRepository } from '../src/modules/psikotes/psikotes.repository'
import { createRateLimiter } from '../src/middlewares/rate-limit'

describe('Psikotes Security Controls', () => {
  const testSecret = 'test-secret-key-minimum-32-chars-for-hmac'

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('HMAC hasil access token harus terikat ke bookingId dan menolak token palsu/kosong', () => {
    const bookingA = '11111111-1111-4111-8111-111111111111'
    const bookingB = '22222222-2222-4222-8222-222222222222'
    const tokenA = createHasilAccessToken(bookingA, testSecret)

    expect(tokenA.length).toBeGreaterThan(20)
    expect(verifyHasilAccessToken(bookingA, tokenA, testSecret)).toBe(true)
    expect(verifyHasilAccessToken(bookingB, tokenA, testSecret)).toBe(false)
    expect(verifyHasilAccessToken(bookingA, 'tampered-token', testSecret)).toBe(false)
    expect(verifyHasilAccessToken(bookingA, null, testSecret)).toBe(false)
    expect(verifyHasilAccessToken(bookingA, '', testSecret)).toBe(false)
  })

  it('getHasilByBookingId harus menolak (403) paket BERBAYAR tanpa token valid, tapi mengizinkan token sah / Admin / paket GRATIS', async () => {
    const bookingId = '33333333-3333-4333-8333-333333333333'
    const validToken = createHasilAccessToken(bookingId)

    const makeMockBooking = (jenisAkses: 'BERBAYAR' | 'GRATIS') => ({
      id: bookingId,
      id_paket: 'paket-1',
      kode_akses: 'EMP-1234',
      status_pengerjaan: 'SELESAI',
      paket: {
        id: 'paket-1',
        judul: jenisAkses === 'BERBAYAR' ? 'DASS-42' : 'PBQ',
        jenis_akses: jenisAkses,
        harga: jenisAkses === 'BERBAYAR' ? 49000 : 0,
        banner_url: null,
        deskripsi: '',
        tentang_tes: '',
        alat_ukur: { id: 'au-1', kode: 'PBQ', nama: 'PBQ', kategori: 'Kepribadian' },
        interpretasi_psikotes: [],
      },
      client: { id: 'c-1', nama: jenisAkses === 'BERBAYAR' ? 'Budi' : 'Tamu Anonim', no_telepon: null, usia: null, jenis_kelamin: null },
      peserta_psikotes: jenisAkses === 'BERBAYAR' ? { nama_lengkap: 'Budi Santoso', usia: 25, jenis_kelamin: 'Laki-laki' } : null,
      transaksi: null,
      hasil_tes: {
        id: 'h-1',
        total_skor: 0,
        detail_skor: { tanpaSkorTotal: true, grade: 'Profil 9 Skala PBQ' },
        tanggal_selesai: new Date(),
        interpretasi: null,
      },
    })

    const mockPrismaPaid = {
      bookingPsikotes: {
        findFirst: vi.fn().mockResolvedValue(makeMockBooking('BERBAYAR')),
      },
    } as any

    const repoPaid = new PsikotesRepository(mockPrismaPaid)

    await expect(repoPaid.getHasilByBookingId(bookingId)).rejects.toMatchObject({
      statusCode: 403,
    })
    await expect(
      repoPaid.getHasilByBookingId(bookingId, { accessToken: 'invalid-token' })
    ).rejects.toMatchObject({ statusCode: 403 })

    const okWithToken = await repoPaid.getHasilByBookingId(bookingId, { accessToken: validToken })
    expect(okWithToken.id_booking).toBe(bookingId)
    expect(okWithToken.peserta.nama_lengkap).toBe('Budi Santoso')

    const okWithAdmin = await repoPaid.getHasilByBookingId(bookingId, { isAdmin: true })
    expect(okWithAdmin.id_booking).toBe(bookingId)

    const mockPrismaFree = {
      bookingPsikotes: {
        findFirst: vi.fn().mockResolvedValue(makeMockBooking('GRATIS')),
      },
    } as any
    const repoFree = new PsikotesRepository(mockPrismaFree)
    const okFree = await repoFree.getHasilByBookingId(bookingId)
    expect(okFree.id_booking).toBe(bookingId)
  })

  it('rate limiter harus memblokir request dengan HTTP 429 setelah batas terlewati', async () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2, message: 'Limit tercapai' })
    const makeReply = () => {
      const res: any = { headers: {}, statusCode: 200, payload: null }
      res.header = (k: string, v: any) => {
        res.headers[k] = v
        return res
      }
      res.code = (c: number) => {
        res.statusCode = c
        return res
      }
      res.send = (p: any) => {
        res.payload = p
        return res
      }
      return res
    }
    const req = { headers: {}, ip: '10.0.0.5', socket: {} } as any

    const r1 = makeReply()
    await limiter(req, r1)
    expect(r1.statusCode).toBe(200)

    const r2 = makeReply()
    await limiter(req, r2)
    expect(r2.statusCode).toBe(200)

    const r3 = makeReply()
    await limiter(req, r3)
    expect(r3.statusCode).toBe(429)
    expect(r3.payload?.message).toBe('Limit tercapai')
  })

  describe('dev-bypass pada production vs development', () => {
    const originalEnv = process.env.NODE_ENV

    beforeEach(() => {
      vi.resetModules()
    })

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
    })

    it('harus menonaktifkan bypass token dummy- saat NODE_ENV=production maupun staging', async () => {
      process.env.NODE_ENV = 'production'
      const prodMod = await import('../src/middlewares/dev-bypass')
      expect(prodMod.isDevDummyAuthEnabled()).toBe(false)
      expect(
        prodMod.hasAllowedDummyToken({ headers: { authorization: 'Bearer dummy-admin-token' } } as any)
      ).toBe(false)

      vi.resetModules()
      process.env.NODE_ENV = 'staging'
      const stagingMod = await import('../src/middlewares/dev-bypass')
      expect(stagingMod.isDevDummyAuthEnabled()).toBe(false)
      expect(
        stagingMod.hasAllowedDummyToken({ headers: { authorization: 'Bearer dummy-admin-token' } } as any)
      ).toBe(false)
    })
  })
})

