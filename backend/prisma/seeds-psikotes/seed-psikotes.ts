import {
  PrismaClient,
  JenisAksesPsikotes,
} from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// DATA PAKET GAD-7: GENERALIZED ANXIETY DISORDER-7 (GRATIS & TERSTANDAR)
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
    judul: 'Kecemasan Minimal',
    deskripsi: 'Tingkat kecemasan kamu berada dalam batas normal dan adaptif. Gejala kecemasan harian tidak mengganggu kestabilan emosi dan rutinitasmu.',
    tips: [
      'Pertahankan pola hidup sehat, waktu tidur teratur, dan rutinitas relaksasi harian.',
      'Tetap sadari pemicu stres kecil agar tidak menumpuk di kemudian hari.',
    ],
  },
  {
    min_skor: 5,
    max_skor: 9,
    grade: 'Ringan',
    judul: 'Kecemasan Ringan',
    deskripsi: 'Kamu mengalami beberapa gejala kecemasan ringan yang mungkin dipicu oleh tekanan pekerjaan, studi, atau situasi tertentu.',
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
    judul: 'Kecemasan Sedang',
    deskripsi: 'Gejala kecemasan kamu berada pada tingkat sedang dan kemungkinan mengarah pada Generalized Anxiety Disorder (GAD).',
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
    judul: 'Kecemasan Berat',
    deskripsi: 'Kondisi kecemasan kamu berada pada tingkat berat yang signifikan. Gejala ini memerlukan perhatian serius dan bantuan profesional.',
    tips: [
      'Sangat direkomendasikan untuk segera berkonsultasi dengan psikolog klinis atau psikiater untuk asesmen mendalam.',
      'Jangan memendam beban sendirian, mintalah dukungan dari keluarga atau support system terdekat.',
      'Hindari konsumsi stimulan berlebih seperti kafein tinggi yang dapat memicu detak jantung lebih cepat.',
    ],
  },
]

// ============================================================================
// MAIN SEEDER FUNCTION
// ============================================================================
export async function seedPsikotes(customPrisma?: PrismaClient) {
  const p = customPrisma || prisma
  console.log('========================================================')
  console.log('🌱 MEMULAI SEEDER PSIKOTES (seeds-psikotes)...')
  console.log('========================================================')

  // 1. Bersihkan paket legacy yang sudah tidak digunakan (Kejenuhan & Kepribadian Dasar)
  const legacyList = await p.paketPsikotes.findMany({
    where: {
      OR: [
        { judul: { contains: 'Kejenuhan', mode: 'insensitive' } },
        { judul: { contains: 'Kepribadian Dasar', mode: 'insensitive' } },
      ],
    },
    include: {
      soal_psikotes: true,
      booking_psikotes: true,
    },
  })

  if (legacyList.length > 0) {
    console.log(`🧹 Membersihkan ${legacyList.length} paket legacy lama...`)
    for (const leg of legacyList) {
      const bIds = leg.booking_psikotes.map((b) => b.id)
      if (bIds.length > 0) {
        await p.hasilTes.deleteMany({ where: { id_booking: { in: bIds } } })
        await p.jawabanPsikotes.deleteMany({ where: { id_booking: { in: bIds } } })
        await p.bookingPsikotes.deleteMany({ where: { id: { in: bIds } } })
      }
      const sIds = leg.soal_psikotes.map((s) => s.id)
      if (sIds.length > 0) {
        await p.pilihanJawaban.deleteMany({ where: { id_soal: { in: sIds } } })
        await p.soalPsikotes.deleteMany({ where: { id: { in: sIds } } })
      }
      await p.interpretasiPsikotes.deleteMany({ where: { id_paket: leg.id } })
      await p.paketPsikotes.delete({ where: { id: leg.id } })
    }
    console.log('   ✓ Paket legacy berhasil dibersihkan.')
  }

  // 2. Semai Master Alat Ukur GAD-7
  console.log('\n--- Menyemai Master Data Alat Ukur GAD-7 ---')
  const alatUkur = await p.alatUkur.upsert({
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

  // 3. Semai Produk Paket GAD-7 (Gratis)
  console.log('\n--- Menyemai Produk Paket GAD-7 (Gratis) ---')
  const judulPaket = 'Tes Tingkat Kecemasan'
  let paket = await p.paketPsikotes.findFirst({
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
    banner_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800',
    deskripsi:
      'Kenali kondisi kecemasanmu dan pahami bagaimana perasaan serta pikiranmu dalam menjalani aktivitas sehari-hari. Melalui tes ini, kamu dapat memperoleh gambaran mengenai tingkat kecemasan yang kamu alami berdasarkan kondisi selama dua minggu terakhir.',
    status: 'PUBLISHED',
  }

  if (paket) {
    paket = await p.paketPsikotes.update({
      where: { id: paket.id },
      data: paketPayload,
    })
  } else {
    paket = await p.paketPsikotes.create({
      data: paketPayload,
    })
  }
  console.log(`    ✓ Paket: ${paket.judul} (Gratis)`)

  // 4. Semai 7 Butir Soal & 28 Opsi Jawaban (Model Hybrid)
  for (const q of GAD7_SOAL) {
    let soal = await p.soalPsikotes.findFirst({
      where: { id_paket: paket.id, urutan: q.no },
    })

    if (soal) {
      soal = await p.soalPsikotes.update({
        where: { id: soal.id },
        data: { pertanyaan: q.text },
      })
    } else {
      soal = await p.soalPsikotes.create({
        data: { id_paket: paket.id, urutan: q.no, pertanyaan: q.text },
      })
    }

    for (const opt of GAD7_OPSI) {
      const existingOpt = await p.pilihanJawaban.findFirst({
        where: { id_soal: soal.id, bobot: opt.bobot },
      })
      if (existingOpt) {
        await p.pilihanJawaban.update({
          where: { id: existingOpt.id },
          data: { label: opt.label, teks_jawaban: opt.text },
        })
      } else {
        await p.pilihanJawaban.create({
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

  // 5. Semai Interpretasi Baseline
  for (const item of GAD7_INTERPRETASI) {
    const existing = await p.interpretasiPsikotes.findFirst({
      where: {
        id_paket: paket.id,
        min_skor: item.min_skor,
        max_skor: item.max_skor,
      },
    })
    if (existing) {
      await p.interpretasiPsikotes.update({
        where: { id: existing.id },
        data: {
          grade: item.grade,
          judul: item.judul,
          deskripsi: item.deskripsi,
          tips: item.tips,
        },
      })
    } else {
      await p.interpretasiPsikotes.create({
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

  console.log('\n========================================================')
  console.log('🎉 SEEDER PSIKOTES BERHASIL!')
  console.log('========================================================')
  console.log(`Paket Aktif:`)
  console.log(`1. "${paket.judul}" -> GRATIS (Rp 0)`)
  console.log('========================================================\n')
}

if (process.argv[1]?.includes('seed-psikotes')) {
  seedPsikotes()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Error saat menjalankan seed-psikotes:', e)
      await prisma.$disconnect()
      process.exit(1)
    })
}

