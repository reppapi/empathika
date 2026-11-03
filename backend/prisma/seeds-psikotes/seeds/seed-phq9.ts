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
      'Berdasarkan hasil screening kesehatan mental, kondisi suasana hatimu saat ini berada dalam batas normal. Gejala depresi tidak terdeteksi secara signifikan.',
    tips: [
      'Pertahankan pola tidur yang cukup dan olahraga teratur.',
      'Lakukan aktivitas yang memberikan kegembiraan dan kepuasan batin.',
      'Jaga komunikasi aktif dengan keluarga dan support system terdekat.',
    ],
  },
  {
    min_skor: 5,
    max_skor: 9,
    grade: 'Ringan',
    judul: 'Terdeteksi Gejala Depresi Ringan',
    deskripsi:
      'Kamu mengalami beberapa gejala penurunan suasana hati ringan yang mungkin dipicu oleh tekanan hidup, kelelahan fisik, atau situasi tertentu.',
    tips: [
      'Luangkan waktu jeda berkualitas untuk memulihkan energi fisik dan mental.',
      'Praktikkan teknik relaksasi, journaling emosi, atau aktivitas mindfulness ringan.',
      'Ceritakan hal-hal yang mengganjal perasaan kepada orang terdekat yang kamu percayai.',
    ],
  },
  {
    min_skor: 10,
    max_skor: 14,
    grade: 'Sedang',
    judul: 'Gejala Depresi Tingkat Sedang Terdeteksi',
    deskripsi:
      'Gejala depresi berada pada tingkat sedang dan kemungkinan mengarah pada episode Major Depressive Disorder (MDD). Kondisi ini mulai mempengaruhi motivasi dan produktivitas harianmu.',
    tips: [
      'Sangat disarankan menjadwalkan sesi konseling dengan psikolog klinis profesional.',
      'Bangun rutinitas harian sederhana dan hindari membuat keputusan besar yang membebani saat ini.',
      'Hindari mengisolasi diri; terbukalah kepada orang-orang suportif di sekitarmu.',
    ],
  },
  {
    min_skor: 15,
    max_skor: 19,
    grade: 'Agak Berat',
    judul: 'Kondisimu Memerlukan Perhatian & Intervensi Aktif',
    deskripsi:
      'Tingkat depresi berada pada tahap agak berat. Kondisi ini telah menimbulkan gangguan signifikan terhadap energi, motivasi, pola tidur/makan, dan kestabilan pikiranmu.',
    tips: [
      'Sangat direkomendasikan untuk segera berkonsultasi dengan psikolog klinis atau psikiater.',
      'Mintalah pendampingan dari keluarga atau orang terdekat untuk membantu aktivitas harian.',
      'Fokus pada pemulihan diri dan kurangi beban tuntutan yang membebani pikiran.',
    ],
  },
  {
    min_skor: 20,
    max_skor: 27,
    grade: 'Berat',
    judul: 'Kondisi Kritis Memerlukan Dukungan Profesional Segera',
    deskripsi:
      'Kondisi depresi berada pada tingkat berat yang signifikan. Gejala sangat membebani fisik dan mental, serta membutuhkan penanganan medis dan psikologis segera tanpa penundaan.',
    tips: [
      'Segera temui psikiater atau psikolog klinis di fasilitas layanan kesehatan terdekat.',
      'Jangan menghadapi beban ini sendirian; pastikan kamu didampingi keluarga atau kerabat terdekat.',
      'Hubungi layanan darurat kesehatan mental terdekat jika merasa kewalahan (Hotline Kemenkes 119 ext 8).',
    ],
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
  const judulPaketPHQ9 = 'Tes Tingkat Depresi'
  let paketPHQ9 = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaketPHQ9 },
        { judul: 'Tes Skrining Tingkat Depresi (PHQ-9)' },
        { id_alat_ukur: alatUkurPHQ9.id },
      ],
    },
  })

  const paketPHQ9Payload = {
    judul: judulPaketPHQ9,
    id_alat_ukur: alatUkurPHQ9.id,
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: '/images/psikotes/banner-depresi.jpg',
    deskripsi:
      'Kenali kondisi suasana hati dan tingkat depresi yang kamu rasakan dalam dua minggu terakhir menggunakan instrumen baku PHQ-9 terstandar.',
    tentang_tes:
      'Patient Health Questionnaire-9 (PHQ-9) dikembangkan oleh Spitzer, Kroenke & Williams pada tahun 1999, berisi 9 item yang mengukur tingkat keparahan gejala depresi berdasarkan kriteria DSM-IV. Instrumen ini dirancang untuk individu usia 18 tahun ke atas guna membantu mengenali kondisi emosional diri serta menjadi langkah awal untuk lebih memperhatikan kesehatan mental.',
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
          tips: item.tips,
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
          tips: item.tips,
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

