import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

// ============================================================================
// DATA ALAT UKUR & PAKET PHQ-9 (PATIENT HEALTH QUESTIONNAIRE-9)
// ============================================================================
export const PHQ9_SOAL = [
  { no: 1, text: 'Kurang tertarik atau kurang suka dalam melakukan apapun.' },
  { no: 2, text: 'Merasa murung, pilu, atau putus asa.' },
  { no: 3, text: 'Sulit untuk tidur atau bertahan tidur, atau terlalu banyak tidur.' },
  { no: 4, text: 'Merasa lelah atau kurang bertenaga.' },
  { no: 5, text: 'Kurang nafsu makan atau makan terlalu banyak.' },
  {
    no: 6,
    text: 'Merasa buruk akan diri anda sendiri – atau merasa bahwa anda adalah orang yang gagal atau telah mengecewakan diri sendiri atau keluarga anda.',
  },
  {
    no: 7,
    text: 'Sulit berkonsentrasi pada sesuatu, misalnya membaca koran atau menonton televisi.',
  },
  {
    no: 8,
    text: 'Bergerak atau berbicara sangat lambat sehingga orang lain memperhatikannya. Atau sebaliknya sedemikian resah dan gelisah sehingga anda bergerak jauh lebih banyak dari biasanya.',
  },
  {
    no: 9,
    text: 'Memikirkan bahwa anda lebih baik mati atau melukai diri anda sendiri dengan suatu cara.',
  },
]

export const PHQ9_OPSI = [
  { label: '0', text: 'Tidak pernah', bobot: 0 },
  { label: '1', text: 'Beberapa hari', bobot: 1 },
  { label: '2', text: 'Lebih dari separuh waktu yang dimaksud', bobot: 2 },
  { label: '3', text: 'Hampir setiap hari', bobot: 3 },
]

export const PHQ9_INTERPRETASI = [
  {
    min_skor: 0,
    max_skor: 4,
    grade: 'Minimal',
    judul: 'Suasana Hatimu Tergolong Stabil & Positif',
    deskripsi:
      'Hasil tes menunjukkan bahwa gejala depresi yang kamu alami tergolong minimal. Kamu mungkin sesekali merasa sedih atau kehilangan semangat, tetapi gejala tersebut tidak terlalu menonjol berdasarkan hasil tes ini.\n\nKamu cenderung masih dapat menikmati aktivitas, menjalankan tanggung jawab, dan berinteraksi dengan orang-orang di sekitarmu. Meski begitu, kondisi emosional tetap perlu diperhatikan.\n\nTetap jaga keseimbangan antara aktivitas dan waktu istirahat. Luangkan waktu untuk melakukan hal-hal yang kamu sukai serta mengenali perasaan dan kebutuhan diri sendiri.',
  },
  {
    min_skor: 5,
    max_skor: 9,
    grade: 'Ringan',
    judul: 'Terdeteksi Gejala Depresi Ringan',
    deskripsi:
      'Hasil tes menunjukkan adanya gejala depresi ringan. Kamu mungkin mulai merasa sedih, kehilangan minat terhadap aktivitas yang biasanya disukai, atau kurang bersemangat dalam menjalani keseharian.\n\nKamu juga mungkin mengalami perubahan pola tidur atau nafsu makan, mudah lelah, kesulitan berkonsentrasi, atau merasa kurang percaya diri. Gejala ini dapat menimbulkan ketidaknyamanan meskipun belum tentu mengganggu seluruh aktivitas.\n\nCobalah untuk lebih memperhatikan perubahan yang kamu alami. Jika gejala terus dirasakan, kamu dapat mempertimbangkan konsultasi dengan psikolog serta melakukan pemantauan kondisi lebih lanjut.',
  },
  {
    min_skor: 10,
    max_skor: 14,
    grade: 'Sedang',
    judul: 'Gejala Depresi Tingkat Sedang Terdeteksi',
    deskripsi:
      'Hasil tes menunjukkan bahwa gejala depresi yang kamu alami berada dalam kategori sedang. Kamu mungkin cukup sering merasa sedih, kehilangan minat terhadap hal-hal yang sebelumnya menyenangkan, atau kesulitan menemukan semangat dalam menjalani aktivitas.\n\nGejala tersebut dapat disertai perubahan pola tidur dan nafsu makan, mudah lelah, sulit berkonsentrasi, hingga munculnya perasaan gagal atau menyalahkan diri sendiri. Kondisi ini berpotensi memengaruhi aktivitas dan hubunganmu dengan orang lain.\n\nPenting untuk memberikan perhatian lebih terhadap kondisi yang sedang kamu alami. Kamu disarankan berkonsultasi dengan psikolog atau tenaga profesional untuk mendapatkan pemahaman dan penanganan yang sesuai, termasuk mempertimbangkan konseling atau intervensi lebih lanjut.',
  },
  {
    min_skor: 15,
    max_skor: 19,
    grade: 'Agak Berat',
    judul: 'Kondisimu Memerlukan Perhatian & Intervensi Aktif',
    deskripsi:
      'Hasil tes menunjukkan bahwa gejala depresi yang kamu alami berada dalam kategori agak berat. Kamu mungkin mengalami kesedihan yang lebih intens, kehilangan minat terhadap berbagai aktivitas, atau kesulitan menemukan motivasi dalam keseharian.\n\nKamu juga mungkin mengalami gangguan tidur, perubahan nafsu makan, kelelahan, kesulitan berkonsentrasi, serta perasaan tidak berharga. Gejala tersebut dapat memberikan dampak cukup besar terhadap aktivitas dan hubungan sosial.\n\nKamu disarankan untuk segera mendapatkan pendampingan dari tenaga profesional. Pemeriksaan lebih lanjut dapat membantu menentukan penanganan yang sesuai, termasuk psikoterapi dan/atau farmakoterapi berdasarkan pertimbangan profesional.',
  },
  {
    min_skor: 20,
    max_skor: 27,
    grade: 'Berat',
    judul: 'Kondisi Kritis Memerlukan Dukungan Profesional Segera',
    deskripsi:
      'Hasil tes menunjukkan bahwa gejala depresi yang kamu alami berada dalam kategori berat. Kamu mungkin merasakan kesedihan yang mendalam, kehilangan minat terhadap hampir seluruh aktivitas, atau kesulitan menemukan energi dan motivasi untuk menjalani keseharian.\n\nGejala lain yang mungkin muncul meliputi perubahan pola tidur dan nafsu makan, kelelahan, kesulitan berkonsentrasi, perasaan gagal, hingga pikiran negatif terhadap diri sendiri. Kondisi ini dapat sangat memengaruhi kehidupan pribadi maupun aktivitas sehari-hari.\n\nKamu sangat disarankan untuk segera berkonsultasi dengan psikiater atau tenaga profesional agar memperoleh pemeriksaan dan penanganan yang sesuai. Jika muncul pikiran untuk menyakiti diri atau mengakhiri hidup, segera cari bantuan langsung dari orang tepercaya dan layanan kesehatan terdekat.',
  },
]

export async function seedPHQ9(prisma: PrismaClient) {
  console.log('\n--- Menyemai Master Data Alat Ukur PHQ-9 ---')

  // 1. Master Data AlatUkur
  const alatUkurPHQ9 = await prisma.alatUkur.upsert({
    where: { kode: 'PHQ-9' },
    update: {
      nama: 'Patient Health Questionnaire-9 (PHQ-9)',
      kategori: 'Kesehatan Mental',
    },
    create: {
      kode: 'PHQ-9',
      nama: 'Patient Health Questionnaire-9 (PHQ-9)',
      kategori: 'Kesehatan Mental',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkurPHQ9.nama} (${alatUkurPHQ9.kode})`)

  // 2. Produk Paket PHQ-9 (Gratis)
  console.log('\n--- Menyemai Produk Paket PHQ-9 (Gratis) ---')
  const judulPaketPHQ9 = 'Tes Depresi'
  let paketPHQ9 = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaketPHQ9 },
        { judul: { contains: 'PHQ-9', mode: 'insensitive' } },
        { judul: 'Tes Depresi | Skrining Gejala Depresi Awal' },
        { id_alat_ukur: alatUkurPHQ9.id },
      ],
    },
  })

  const paketPHQ9Payload = {
    judul: judulPaketPHQ9,
    id_alat_ukur: alatUkurPHQ9.id,
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: '/images/psikotes/banner-default.jpg',
    tentang_tes:
      'Ada kalanya suasana hati berubah dan hal-hal yang biasanya menyenangkan terasa berbeda. Melalui tes ini, kamu diajak melihat lebih jauh pengalaman yang berkaitan dengan suasana hati, minat, pola tidur, nafsu makan, energi, konsentrasi, serta pikiran yang mungkin muncul dalam dua minggu terakhir.',
    status: 'PUBLISHED',
  }

  if (paketPHQ9) {
    paketPHQ9 = await prisma.paketPsikotes.update({
      where: { id: paketPHQ9.id },
      data: paketPHQ9Payload,
    })
  } else {
    paketPHQ9 = await prisma.paketPsikotes.create({
      data: paketPHQ9Payload,
    })
  }
  console.log(`    ✓ Paket: ${paketPHQ9.judul} (Gratis)`)

  // 3. 9 Butir Soal & 36 Opsi Jawaban PHQ-9
  for (const q of PHQ9_SOAL) {
    let soal = await prisma.soalPsikotes.findFirst({
      where: { id_paket: paketPHQ9.id, urutan: q.no },
    })

    if (soal) {
      soal = await prisma.soalPsikotes.update({
        where: { id: soal.id },
        data: { pertanyaan: q.text },
      })
    } else {
      soal = await prisma.soalPsikotes.create({
        data: { id_paket: paketPHQ9.id, urutan: q.no, pertanyaan: q.text },
      })
    }

    for (const opt of PHQ9_OPSI) {
      const existingOpt = await prisma.pilihanJawaban.findFirst({
        where: { id_soal: soal.id, bobot: opt.bobot },
      })
      if (existingOpt) {
        await prisma.pilihanJawaban.update({
          where: { id: existingOpt.id },
          data: { label: opt.label, teks_jawaban: opt.text },
        })
      } else {
        await prisma.pilihanJawaban.create({
          data: {
            id_soal: soal.id,
            label: opt.label,
            teks_jawaban: opt.text,
            bobot: opt.bobot,
          },
        })
      }
    }
  }
  console.log('    ✓ 9 Soal & 36 Pilihan Jawaban tersimpan di database.')

  // 4. 5 Kategori Interpretasi PHQ-9
  for (const item of PHQ9_INTERPRETASI) {
    const existing = await prisma.interpretasiPsikotes.findFirst({
      where: {
        id_paket: paketPHQ9.id,
        min_skor: item.min_skor,
        max_skor: item.max_skor,
      },
    })
    if (existing) {
      await prisma.interpretasiPsikotes.update({
        where: { id: existing.id },
        data: {
          grade: item.grade,
          judul: item.judul,
          deskripsi: item.deskripsi,
        },
      })
    } else {
      await prisma.interpretasiPsikotes.create({
        data: {
          id_paket: paketPHQ9.id,
          min_skor: item.min_skor,
          max_skor: item.max_skor,
          grade: item.grade,
          judul: item.judul,
          deskripsi: item.deskripsi,
        },
      })
    }
  }
  console.log('    ✓ 5 Kategori Interpretasi PHQ-9 tersimpan di database.')

  return paketPHQ9
}

if (process.argv[1]?.includes('seed-phq9')) {
  const p = new PrismaClient()
  seedPHQ9(p)
    .then(async () => {
      await p.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Error saat menjalankan seed-phq9:', e)
      await p.$disconnect()
      process.exit(1)
    })
}

