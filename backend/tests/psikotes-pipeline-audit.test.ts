import { describe, it, expect, vi } from 'vitest'
import { submitPsikotesSchema } from '../src/modules/psikotes/psikotes.schema'
import { calculateIGDS9SF } from '../src/modules/psikotes/alat-ukur/igds9-sf/scoring'
import { calculateGAD7 } from '../src/modules/psikotes/alat-ukur/gad-7/scoring'
import { calculatePHQ9 } from '../src/modules/psikotes/alat-ukur/phq-9/scoring'
import { calculateRCMAS } from '../src/modules/psikotes/alat-ukur/rcmas/scoring'
import { calculatePBQ } from '../src/modules/psikotes/alat-ukur/pbq/scoring'
import { PsikotesRepository } from '../src/modules/psikotes/psikotes.repository'

function buildMockPaket(kode: string, jumlahSoal: number, jenisAkses: 'GRATIS' | 'BERBAYAR' = 'GRATIS', bobotPerPilihan = 1) {
  const soal_psikotes = Array.from({ length: jumlahSoal }, (_, idx) => {
    const soalId = `soal-${idx + 1}`
    return {
      id: soalId,
      id_paket: 'paket-1',
      urutan: idx + 1,
      pertanyaan: `Pertanyaan ${idx + 1}`,
      pilihan_jawaban: [
        { id: `pil-${idx + 1}-0`, id_soal: soalId, label: '0', teks_jawaban: 'Tidak', bobot: 0 },
        { id: `pil-${idx + 1}-1`, id_soal: soalId, label: '1', teks_jawaban: 'Ya', bobot: bobotPerPilihan },
      ],
    }
  })

  return {
    id: 'paket-1',
    judul: `Tes ${kode}`,
    jenis_akses: jenisAkses,
    status: 'PUBLISHED',
    aktif: true,
    alat_ukur: { id: 'au-1', kode, nama: kode, kategori: 'KLINIS' },
    soal_psikotes,
    interpretasi_psikotes: [
      { id: 'interp-1', id_paket: 'paket-1', min_skor: 0, max_skor: 100, grade: 'Ringan', judul: 'Ringan', deskripsi: 'Deskripsi', tips: [] },
    ],
  }
}

function createRepoWithMockTx(paket: any, bookingOverride: any = null) {
  const txMock: any = {
    paketPsikotes: {
      findUnique: vi.fn().mockResolvedValue(paket),
    },
    bookingPsikotes: {
      findFirst: vi.fn().mockResolvedValue(bookingOverride),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue(bookingOverride || { id: 'booking-1' }),
      create: vi.fn().mockResolvedValue({ id: 'booking-new' }),
    },
    client: {
      findFirst: vi.fn().mockResolvedValue({ id: 'client-1', nama: 'Tamu Anonim' }),
      create: vi.fn().mockResolvedValue({ id: 'client-1', nama: 'Tamu Anonim' }),
    },
    jawabanPsikotes: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    hasilTes: {
      upsert: vi.fn().mockImplementation(async ({ create }) => ({
        id: 'hasil-1',
        ...create,
        tanggal_selesai: new Date(),
        interpretasi: null,
      })),
    },
    transaksi: {
      updateMany: vi.fn(),
    },
  }

  const prismaMock: any = {
    $transaction: vi.fn(async (cb: any) => cb(txMock)),
  }

  const repo = new PsikotesRepository(prismaMock)
  return { repo, txMock }
}

describe('Audit Pipeline Psikotes (A–G)', () => {
  describe('A. Keamanan Status Pembayaran & Atomic Claim', () => {
    it('menolak submit jika transaksi booking masih PENDING dan tidak mengubahnya ke PAID', async () => {
      const paket = buildMockPaket('GAD-7', 7, 'BERBAYAR')
      const bookingPending = {
        id: 'booking-pending',
        id_paket: 'paket-1',
        id_client: 'client-1',
        id_transaksi: 'trx-1',
        status_pengerjaan: 'BELUM_MULAI',
        hasil_tes: null,
        client: { id: 'client-1', nama: 'Budi' },
        transaksi: { id: 'trx-1', status_pembayaran: 'PENDING' },
      }
      const { repo, txMock } = createRepoWithMockTx(paket, bookingPending)
      const jawaban = paket.soal_psikotes.map((s) => ({ id_soal: s.id, id_pilihan: s.pilihan_jawaban[1].id }))

      await expect(
        repo.submit('paket-1', { jawaban, id_booking: 'booking-pending' } as any)
      ).rejects.toMatchObject({ statusCode: 400 })

      expect(txMock.transaksi.updateMany).not.toHaveBeenCalled()
      expect(txMock.hasilTes.upsert).not.toHaveBeenCalled()
    })

    it('menolak submit ganda bersamaan (race condition) ketika atomic claim mengembalikan count 0', async () => {
      const paket = buildMockPaket('GAD-7', 7, 'BERBAYAR')
      const bookingPaid = {
        id: 'booking-paid',
        id_paket: 'paket-1',
        id_client: 'client-1',
        id_transaksi: 'trx-2',
        status_pengerjaan: 'BELUM_MULAI',
        hasil_tes: null,
        client: { id: 'client-1', nama: 'Siti' },
        transaksi: { id: 'trx-2', status_pembayaran: 'PAID' },
      }
      const { repo, txMock } = createRepoWithMockTx(paket, bookingPaid)
      txMock.bookingPsikotes.updateMany.mockResolvedValueOnce({ count: 0 })
      const jawaban = paket.soal_psikotes.map((s) => ({ id_soal: s.id, id_pilihan: s.pilihan_jawaban[1].id }))

      await expect(
        repo.submit('paket-1', { jawaban, id_booking: 'booking-paid' } as any)
      ).rejects.toMatchObject({ statusCode: 400 })

      expect(txMock.hasilTes.upsert).not.toHaveBeenCalled()
    })
  })

  describe('B. GAD-7 & PHQ-9 Functional Answer & Ide Melukai Diri', () => {
    it('validasi schema menerima dampak_aktivitas 0–3 dan menolak nilai di luar rentang', () => {
      const valid = submitPsikotesSchema.safeParse({
        jawaban: [{ id_soal: 's1', id_pilihan: 'p1' }],
        dampak_aktivitas: 2,
      })
      expect(valid.success).toBe(true)

      const invalid = submitPsikotesSchema.safeParse({
        jawaban: [{ id_soal: 's1', id_pilihan: 'p1' }],
        dampak_aktivitas: 5,
      })
      expect(invalid.success).toBe(false)
    })

    it('menyimpan dampak_aktivitas ke detail_skor saat submit GAD-7', async () => {
      const paket = buildMockPaket('GAD-7', 7, 'GRATIS', 1)
      const { repo, txMock } = createRepoWithMockTx(paket, null)
      const jawaban = paket.soal_psikotes.map((s) => ({ id_soal: s.id, id_pilihan: s.pilihan_jawaban[1].id }))

      const result = await repo.submit('paket-1', { jawaban, dampak_aktivitas: 2 } as any)
      expect(result.total_skor).toBe(7)
      expect(result.detail_skor.dampakAktivitas).toBe('Sangat menyulitkan')
      expect(txMock.hasilTes.upsert).toHaveBeenCalledTimes(1)
    })

    it('PHQ-9 menandai ideMelukaiDiri true jika butir 9 > 0 dan menjaga dampakAktivitas', () => {
      const res = calculatePHQ9({
        1: 1, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 2,
        difficulty: 3,
      })
      expect(res.ideMelukaiDiri).toBe(true)
      expect(res.dampakAktivitas).toBe('Luar biasa menyulitkan')

      const gad = calculateGAD7({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, difficulty: 1 })
      expect(gad.dampakAktivitas).toBe('Sedikit menyulitkan')
    })
  })

  describe('D. IGDS9-SF Validasi Ketat & Penyelarasan Evaluasi DSM-5', () => {
    it('menolak jawaban kosong atau tidak valid tanpa fallback menjadi 1', () => {
      expect(() =>
        calculateIGDS9SF({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3 })
      ).toThrow(/wajib diisi/i)

      expect(() =>
        calculateIGDS9SF({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 6 })
      ).toThrow(/tidak valid/i)
    })

    it('tidak kontradiktif saat totalSkor < 36 namun kriteriaSangatSering >= 5', () => {
      const res = calculateIGDS9SF({
        1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 1, 7: 1, 8: 1, 9: 1,
      })
      expect(res.totalSkor).toBe(29)
      expect(res.kategori).toBe('Normal')
      expect(res.dsmEvaluation.isIndikasiEvaluasi).toBe(true)
      expect(res.dsmEvaluation.statusEvaluasi).toContain('Perlu Evaluasi Lanjutan')
      expect(res.dsmEvaluation.catatanKlinis).toContain('mengukur aspek yang berbeda')
    })

    it('mengembalikan Kemungkinan IGD saat totalSkor >= 36', () => {
      const res = calculateIGDS9SF({
        1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4,
      })
      expect(res.totalSkor).toBe(36)
      expect(res.kategori).toBe('Kemungkinan Internet Gaming Disorder (IGD)')
      expect(res.dsmEvaluation.isIndikasiEvaluasi).toBe(true)
    })
  })

  describe('E & F. RCMAS & PBQ Skor Resmi Tetap Utuh', () => {
    it('RCMAS menghitung 3 subskala kecemasan dan lieScale secara terpisah', () => {
      const answers: Record<number, number> = {}
      for (let i = 1; i <= 37; i++) answers[i] = 1
      const res = calculateRCMAS(answers)
      expect(res.totalSkor).toBe(28)
      expect(res.subscales.physiological.skor).toBe(10)
      expect(res.subscales.worry.skor).toBe(11)
      expect(res.subscales.concentration.skor).toBe(7)
      expect(res.subscales.lieScale).toBeUndefined()
      expect(res.lieScale.skor).toBe(9)
    })

    it('PBQ tetap tanpa skor total, 9 skala 0–56, dan zScore null', () => {
      const answers: Record<number, number> = {}
      for (let i = 1; i <= 126; i++) answers[i] = 2
      const res = calculatePBQ(answers)
      expect(res.tanpaSkorTotal).toBe(true)
      expect(res.hasInterpretation).toBe(false)
      expect(res.subscalesList).toHaveLength(9)
      expect(res.subscalesList[0].skor).toBe(28)
      expect(res.subscalesList[0].zScore).toBeNull()
    })
  })

  describe('G. Validasi Kelengkapan & Integritas Jawaban Pipeline Submit', () => {
    it('menolak submit jika jumlah jawaban tidak lengkap', async () => {
      const paket = buildMockPaket('GAD-7', 7, 'GRATIS')
      const { repo } = createRepoWithMockTx(paket, null)
      const incomplete = paket.soal_psikotes.slice(0, 6).map((s) => ({
        id_soal: s.id,
        id_pilihan: s.pilihan_jawaban[1].id,
      }))

      await expect(
        repo.submit('paket-1', { jawaban: incomplete } as any)
      ).rejects.toMatchObject({ statusCode: 400 })
    })

    it('menolak submit jika id_pilihan tidak cocok dengan id_soal-nya', async () => {
      const paket = buildMockPaket('GAD-7', 7, 'GRATIS')
      const { repo } = createRepoWithMockTx(paket, null)
      const tampered = paket.soal_psikotes.map((s, idx) => ({
        id_soal: s.id,
        id_pilihan: idx === 0 ? paket.soal_psikotes[1].pilihan_jawaban[1].id : s.pilihan_jawaban[1].id,
      }))

      await expect(
        repo.submit('paket-1', { jawaban: tampered } as any)
      ).rejects.toMatchObject({ statusCode: 400 })
    })

    it('menolak submit jika terdapat id_soal duplikat', async () => {
      const paket = buildMockPaket('GAD-7', 2, 'GRATIS')
      const { repo } = createRepoWithMockTx(paket, null)
      const duplicate = [
        { id_soal: 'soal-1', id_pilihan: 'pil-1-1' },
        { id_soal: 'soal-1', id_pilihan: 'pil-1-0' },
      ]

      await expect(
        repo.submit('paket-1', { jawaban: duplicate } as any)
      ).rejects.toMatchObject({ statusCode: 400 })
    })
  })
})
