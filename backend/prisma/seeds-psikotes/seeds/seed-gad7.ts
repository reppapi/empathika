import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

// ============================================================================
// DATA ALAT UKUR & PAKET GAD-7 (GENERALIZED ANXIETY DISORDER-7)
// ============================================================================
export const GAD7_SOAL = [
  { no: 1, text: 'Merasa gugup, cemas atau gelisah.' },
  { no: 2, text: 'Tidak mampu menghentikan atau mengendalikan rasa khawatir.' },
  { no: 3, text: 'Khawatir berlebihan tentang berbagai hal.' },
  { no: 4, text: 'Sulit untuk santai.' },
  { no: 5, text: 'Begitu gelisah sehingga sulit untuk duduk diam.' },
  { no: 6, text: 'Menjadi mudah kesal atau jengkel.' },
  { no: 7, text: 'Merasa takut seolah-olah sesuatu yang mengerikan mungkin terjadi.' },
]

export const GAD7_OPSI = [
  { label: '0', text: 'Tidak pernah', bobot: 0 },
  { label: '1', text: 'Beberapa hari', bobot: 1 },
  { label: '2', text: 'Lebih dari separuh waktu yang dimaksud', bobot: 2 },
  { label: '3', text: 'Hampir setiap hari', bobot: 3 },
]

export const GAD7_INTERPRETASI = [
  {
    min_skor: 0,
    max_skor: 4,
    grade: 'Minimal',
    judul: 'Yay, Kamu Baik-baik Saja!',
    deskripsi:
      'Berdasarkan hasil screening kesehatan mental, saat ini kondisimu tergolong stabil. Jaga terus kesehatan mental kamu ya.',
    tips: [
      'Pertahankan pola hidup sehat, waktu tidur teratur, dan rutinitas relaksasi harian.',
      'Tetap sadari pemicu stres kecil agar tidak menumpuk di kemudian hari.',
    ],
  },
  {
    min_skor: 5,
    max_skor: 9,
    grade: 'Ringan',
    judul: 'Kondisimu Sedikit Tegang (Kecemasan Ringan)',
    deskripsi:
      'Kamu mengalami beberapa gejala kecemasan ringan yang mungkin dipicu oleh tekanan pekerjaan, studi, atau situasi tertentu.',
    tips: [
      'Luangkan waktu jeda (istirahat berkualitas) di sela-sela kesibukan rutinitas.',
      'Praktikkan teknik pernapasan dalam (deep breathing) atau mindfulness ketika rasa khawatir mulai muncul.',
      'Ceritakan hal-hal yang mengganjal pikiran kepada orang terdekat yang kamu percayai.',
    ],
  },
  {
    min_skor: 10,
    max_skor: 14,
    grade: 'Sedang',
    judul: 'Kecemasan Tingkat Sedang Terdeteksi',
    deskripsi:
      'Gejala kecemasan kamu berada pada tingkat sedang dan kemungkinan mengarah pada Generalized Anxiety Disorder (GAD).',
    tips: [
      'Sangat disarankan untuk menjadwalkan sesi konseling dengan psikolog atau konselor profesional.',
      'Identifikasi pola pikiran negatif yang sering berulang dan mulai buat batasan terhadap sumber pemicu stres berlebih.',
      'Lakukan aktivitas fisik ringan secara teratur untuk membantu pelepasan hormon penenang alami tubuh.',
    ],
  },
  {
    min_skor: 15,
    max_skor: 21,
    grade: 'Berat',
    judul: 'Kondisimu Memerlukan Perhatian Khusus',
    deskripsi:
      'Kondisi kecemasan kamu berada pada tingkat berat yang signifikan. Gejala ini memerlukan perhatian serius dan bantuan profesional.',
    tips: [
      'Sangat direkomendasikan untuk segera berkonsultasi dengan psikolog klinis atau psikiater untuk asesmen mendalam.',
      'Jangan memendam beban sendirian, mintalah dukungan dari keluarga atau support system terdekat.',
      'Hindari konsumsi stimulan berlebih seperti kafein tinggi yang dapat memicu detak jantung lebih cepat.',
    ],
  },
]

export async function seedGAD7(prisma: PrismaClient) {
  console.log('\n--- Menyemai Master Data Alat Ukur GAD-7 ---')

  // 1. Master Data AlatUkur
  const alatUkur = await prisma.alatUkur.upsert({
    where: { kode: 'GAD-7' },
    update: {
      nama: 'Generalized Anxiety Disorder-7 (GAD-7)',
      kategori: 'Kesehatan Mental',
    },
    create: {
      kode: 'GAD-7',
      nama: 'Generalized Anxiety Disorder-7 (GAD-7)',
      kategori: 'Kesehatan Mental',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkur.nama} (${alatUkur.kode})`)

  // 2. Produk Paket GAD-7 (Gratis)
  console.log('\n--- Menyemai Produk Paket GAD-7 (Gratis) ---')
  const judulPaket = 'Tes Kecemasan: Anxiety Test | Skrining Tingkat Kecemasanmu'
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaket },
        { judul: 'Tes Skrining Tingkat Kecemasan (GAD-7)' },
        { id_alat_ukur: alatUkur.id },
      ],
    },
  })

  const paketPayload = {
    judul: judulPaket,
    id_alat_ukur: alatUkur.id,
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: '/images/psikotes/banner-kecemasan.jpg',
    deskripsi:
      'Kenali kondisi kecemasanmu dan pahami bagaimana perasaan serta pikiranmu dalam menjalani aktivitas sehari-hari. Melalui tes ini, kamu dapat memperoleh gambaran mengenai tingkat kecemasan yang kamu alami berdasarkan kondisi selama dua minggu terakhir.',
    tentang_tes:
      'Melalui tes ini, kamu bisa mengenali gejala kecemasan yang mungkin sedang dialami, seperti perasaan gelisah, kesulitan mengendalikan kekhawatiran, hingga ketegangan dalam menjalani aktivitas sehari-hari. Hasilnya dapat membantumu memahami kondisi emosional diri dan menjadi langkah awal untuk lebih memperhatikan kesehatan mental.',
    status: 'PUBLISHED',
  }

  if (paket) {
    paket = await prisma.paketPsikotes.update({
      where: { id: paket.id },
      data: paketPayload,
    })
  } else {
    paket = await prisma.paketPsikotes.create({
      data: paketPayload,
    })
  }
  console.log(`    ✓ Paket: ${paket.judul} (Gratis)`)

  // 3. 7 Butir Soal & 28 Opsi Jawaban
  for (const q of GAD7_SOAL) {
    let soal = await prisma.soalPsikotes.findFirst({
      where: { id_paket: paket.id, urutan: q.no },
    })

    if (soal) {
      soal = await prisma.soalPsikotes.update({
        where: { id: soal.id },
        data: { pertanyaan: q.text },
      })
    } else {
      soal = await prisma.soalPsikotes.create({
        data: { id_paket: paket.id, urutan: q.no, pertanyaan: q.text },
      })
    }

    for (const opt of GAD7_OPSI) {
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
  console.log('    ✓ 7 Soal & 28 Pilihan Jawaban tersimpan di database.')

  // 4. Kategori Interpretasi Baseline
  for (const item of GAD7_INTERPRETASI) {
    const existing = await prisma.interpretasiPsikotes.findFirst({
      where: {
        id_paket: paket.id,
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
          tips: item.tips,
        },
      })
    } else {
      await prisma.interpretasiPsikotes.create({
        data: {
          id_paket: paket.id,
          min_skor: item.min_skor,
          max_skor: item.max_skor,
          grade: item.grade,
          judul: item.judul,
          deskripsi: item.deskripsi,
          tips: item.tips,
        },
      })
    }
  }
  console.log('    ✓ 4 Kategori Interpretasi tersimpan di database.')

  return paket
}

if (process.argv[1]?.includes('seed-gad7')) {
  const p = new PrismaClient()
  seedGAD7(p)
    .then(async () => {
      await p.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Error saat menjalankan seed-gad7:', e)
      await p.$disconnect()
      process.exit(1)
    })
}

