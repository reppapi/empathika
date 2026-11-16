import { describe, it, expect } from 'vitest'
import {
  calculateDASS42,
  DEPRESSION_ITEM_IDS,
  ANXIETY_ITEM_IDS,
  STRESS_ITEM_IDS,
} from '../src/modules/psikotes/alat-ukur/dass-42/scoring'

describe('DASS-42 (Depression Anxiety Stress Scales) Scoring Logic', () => {
  it('harus memiliki 14 butir untuk masing-masing dimensi (total 42 butir unik)', () => {
    expect(DEPRESSION_ITEM_IDS).toHaveLength(14)
    expect(ANXIETY_ITEM_IDS).toHaveLength(14)
    expect(STRESS_ITEM_IDS).toHaveLength(14)

    const allItems = [...DEPRESSION_ITEM_IDS, ...ANXIETY_ITEM_IDS, ...STRESS_ITEM_IDS]
    const uniqueSet = new Set(allItems)
    expect(uniqueSet.size).toBe(42)
  })

  it('harus menghasilkan skor 0 dan kategori Normal untuk semua jawaban 0', () => {
    const zeroAnswers: Record<number, number> = {}
    for (let i = 1; i <= 42; i++) zeroAnswers[i] = 0

    const res = calculateDASS42(zeroAnswers)
    expect(res.totalSkor).toBe(0)
    expect(res.subscales.depression.skor).toBe(0)
    expect(res.subscales.depression.grade).toBe('Normal')
    expect(res.subscales.anxiety.skor).toBe(0)
    expect(res.subscales.anxiety.grade).toBe('Normal')
    expect(res.subscales.stress.skor).toBe(0)
    expect(res.subscales.stress.grade).toBe('Normal')
  })

  it('harus menghitung skor maksimum 42 per subskala dan total 126 untuk semua jawaban 3', () => {
    const maxAnswers: Record<number, number> = {}
    for (let i = 1; i <= 42; i++) maxAnswers[i] = 3

    const res = calculateDASS42(maxAnswers)
    expect(res.totalSkor).toBe(126)
    expect(res.subscales.depression.skor).toBe(42)
    expect(res.subscales.depression.grade).toBe('Sangat Berat')
    expect(res.subscales.anxiety.skor).toBe(42)
    expect(res.subscales.anxiety.grade).toBe('Sangat Berat')
    expect(res.subscales.stress.skor).toBe(42)
    expect(res.subscales.stress.grade).toBe('Sangat Berat')
  })

  it('harus mengelompokkan skor subskala secara tepat sesuai ambang batas Lovibond', () => {
    const customAnswers: Record<number, number> = {}
    for (let i = 1; i <= 42; i++) customAnswers[i] = 0

    // Depresi: skor 12 -> Ringan (rentang 10–13)
    // 4 butir depresi dijawab 3 (skor 12)
    customAnswers[3] = 3
    customAnswers[5] = 3
    customAnswers[10] = 3
    customAnswers[13] = 3

    // Kecemasan: skor 12 -> Sedang (rentang 10–14)
    // 4 butir kecemasan dijawab 3 (skor 12)
    customAnswers[2] = 3
    customAnswers[4] = 3
    customAnswers[7] = 3
    customAnswers[9] = 3

    // Stres: skor 20 -> Sedang (rentang 19–25)
    // 5 butir stres dijawab 3 + 1 butir dijawab 2 + 1 butir dijawab 3 (total 20)
    customAnswers[1] = 3
    customAnswers[6] = 3
    customAnswers[8] = 3
    customAnswers[11] = 3
    customAnswers[12] = 3
    customAnswers[14] = 3
    customAnswers[18] = 2

    const res = calculateDASS42(customAnswers)
    expect(res.subscales.depression.skor).toBe(12)
    expect(res.subscales.depression.grade).toBe('Ringan')

    expect(res.subscales.anxiety.skor).toBe(12)
    expect(res.subscales.anxiety.grade).toBe('Sedang')

    expect(res.subscales.stress.skor).toBe(20)
    expect(res.subscales.stress.grade).toBe('Sedang')

    expect(res.totalSkor).toBe(44)
    expect(res.grade).toBe('Sedang')
  })

  it('harus mendukung format indeks 0-based (0..41)', () => {
    const zeroBasedAnswers: Record<number, number> = {}
    for (let i = 0; i < 42; i++) zeroBasedAnswers[i] = 0

    // Butir 1 (index 0) adalah Stres
    zeroBasedAnswers[0] = 3
    // Butir 2 (index 1) adalah Kecemasan
    zeroBasedAnswers[1] = 3
    // Butir 3 (index 2) adalah Depresi
    zeroBasedAnswers[2] = 3

    const res = calculateDASS42(zeroBasedAnswers)
    expect(res.subscales.stress.skor).toBe(3)
    expect(res.subscales.anxiety.skor).toBe(3)
    expect(res.subscales.depression.skor).toBe(3)
    expect(res.totalSkor).toBe(9)
  })
})

