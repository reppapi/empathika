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

  it('verifyTicket harus menolak pencocokan nomor parsial/berbeda dan hanya mengizinkan exact match nomor ternormalisasi', async () => {
    const mockPrisma = {
      bookingPsikotes: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'booking-ticket-1',
          id_paket: 'paket-dass',
          kode_akses: 'PSI-VALID-123',
          paket: { id: 'paket-dass', judul: 'DASS-42', jenis_akses: 'BERBAYAR', harga: 49000, banner_url: null },
          client: { id: 'c-1', nama: 'Budi', no_telepon: '+62 812-3456-7890' },
          peserta_psikotes: { no_telepon: null, no_telepon_orang_tua: null },
          transaksi: { id: 'tx-1', kode_transaksi: 'PSI-VALID-123', status_pembayaran: 'PAID' },
          hasil_tes: null,
        }),
      },
    } as any

    const repo = new PsikotesRepository(mockPrisma)

    // 1. Nomor sama persis beda format (081234567890 vs +62 812-3456-7890) -> BERHASIL
    const ok = await repo.verifyTicket({
      kode_akses: 'PSI-VALID-123',
      no_telepon: '081234567890',
    })
    expect(ok.booking_id).toBe('booking-ticket-1')
    expect(ok.access_token).toBeDefined()

    // 2. Nomor berbeda provider yang hanya kebetulan berakhiran sama (0899-3456-7890) -> DITOLAK
    await expect(
      repo.verifyTicket({
        kode_akses: 'PSI-VALID-123',
        no_telepon: '089934567890',
      })
    ).rejects.toThrow(/Nomor WhatsApp tidak cocok/i)

    // 3. Nomor acak / salah -> DITOLAK
    await expect(
      repo.verifyTicket({
        kode_akses: 'PSI-VALID-123',
        no_telepon: '081399998888',
      })
    ).rejects.toThrow(/Nomor WhatsApp tidak cocok/i)
  })

  it('Kolam Bersama: claimReviewTicket mengunci tiket dan menolak klaim tumpang-tindih rekan (409), releaseReviewTicket mengembalikan ke antrean', async () => {
    let currentLockedPsikologId: string | null = null
    const mockTx = {
      bookingPsikotes: {
        findUnique: vi.fn().mockImplementation(() =>
          Promise.resolve({
            id: 'booking-lock-1',
            status_pengerjaan: 'MENUNGGU_REVIEW',
            id_psikolog: currentLockedPsikologId,
            updatedAt: new Date(),
            hasil_tes: { id: 'h-1' },
            psikolog: currentLockedPsikologId
              ? { id: 'psi-1', nama_gelar: 'Dr. Jane Doe, M.Psi., Psikolog', kategori: 'Psikolog' }
              : null,
          })
        ),
        update: vi.fn().mockImplementation(({ data }: any) => {
          currentLockedPsikologId = data.id_psikolog
          return Promise.resolve({
            id: 'booking-lock-1',
            status_pengerjaan: 'MENUNGGU_REVIEW',
            id_psikolog: currentLockedPsikologId,
            updatedAt: new Date(),
            psikolog: currentLockedPsikologId ? { id: currentLockedPsikologId, nama_gelar: 'Dr. Jane Doe' } : null,
          })
        }),
      },
      psikolog: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          const accId = where?.OR?.[0]?.id_account
          if (accId === 'acc-psi-1') return Promise.resolve({ id: 'psi-1', nama_gelar: 'Dr. Jane Doe, M.Psi.' })
          if (accId === 'acc-psi-2') return Promise.resolve({ id: 'psi-2', nama_gelar: 'Galuh Kikiany, M.Psi.' })
          return Promise.resolve(null)
        }),
        findUnique: vi.fn().mockResolvedValue({ id: 'psi-1', nama_gelar: 'Dr. Jane Doe, M.Psi.' }),
      },
    }

    const mockPrisma = {
      $transaction: vi.fn().mockImplementation((cb: any) => cb(mockTx)),
    } as any

    const repo = new PsikotesRepository(mockPrisma)

    // 1. Psikolog 1 mengklaim dari Kolam Bersama -> BERHASIL
    const claimed = await repo.claimReviewTicket('booking-lock-1', 'acc-psi-1', 'PSIKOLOG')
    expect(claimed.is_claimed).toBe(true)
    expect(currentLockedPsikologId).toBe('psi-1')

    // 2. Psikolog 2 mencoba klaim tiket yang sama saat masih aktif dikerjakan Psikolog 1 -> DITOLAK (409 Conflict)
    await expect(
      repo.claimReviewTicket('booking-lock-1', 'acc-psi-2', 'PSIKOLOG')
    ).rejects.toThrow(/sedang aktif ditelaah oleh Dr. Jane Doe/i)

    // 3. Orang lain yang bukan pemilik lock mencoba melepas tiket -> DITOLAK (403 Forbidden)
    await expect(
      repo.releaseReviewTicket('booking-lock-1', 'acc-psi-2', 'PSIKOLOG')
    ).rejects.toThrow(/Hanya psikolog yang sedang menelaah tiket ini atau Admin/i)

    // 4. Psikolog 1 mengembalikan tiket ke Kolam Bersama (Shared Pool) -> BERHASIL
    const released = await repo.releaseReviewTicket('booking-lock-1', 'acc-psi-1', 'PSIKOLOG')
    expect(released.is_claimed).toBe(false)
    expect(currentLockedPsikologId).toBeNull()

    // 5. Sekarang Psikolog 2 bisa mengklaim tiket yang sudah dilepas -> BERHASIL
    const claimedBy2 = await repo.claimReviewTicket('booking-lock-1', 'acc-psi-2', 'PSIKOLOG')
    expect(claimedBy2.is_claimed).toBe(true)
    expect(currentLockedPsikologId).toBe('psi-2')
  })
})

