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
      'Hasil tes menunjukkan bahwa gejala kecemasan yang kamu alami tergolong minimal. Dalam keseharian, kamu mungkin sesekali merasa khawatir, gugup, atau gelisah ketika menghadapi situasi tertentu. Namun, perasaan tersebut cenderung tidak muncul secara intens atau berkepanjangan.\n\nKamu mungkin masih dapat mengelola kekhawatiran dan menjalani aktivitas sehari-hari dengan cukup nyaman. Meski begitu, bukan berarti kamu tidak pernah mengalami kecemasan. Perasaan khawatir merupakan hal yang wajar dialami setiap orang, terutama ketika menghadapi situasi yang tidak pasti.\n\nTetap luangkan waktu untuk mengenali perasaan dan kebutuhan diri sendiri. Menjaga keseimbangan antara aktivitas dan waktu istirahat, melakukan kegiatan yang disukai, serta berbagi cerita dengan orang yang dipercaya dapat membantu menjaga kesejahteraan emosionalmu.',
  },
  {
    min_skor: 5,
    max_skor: 9,
    grade: 'Ringan',
    judul: 'Kondisimu Sedikit Tegang (Kecemasan Ringan)',
    deskripsi:
      'Hasil tes menunjukkan bahwa kamu mengalami gejala kecemasan dalam kategori ringan. Dalam beberapa situasi, kamu mungkin lebih sering merasa khawatir, gugup, atau gelisah dibandingkan biasanya. Ada kalanya pikiran terasa sulit dihentikan karena terus memikirkan berbagai kemungkinan yang belum tentu terjadi.\n\nKamu juga mungkin mengalami kesulitan untuk benar-benar merasa santai, mudah tersinggung, atau merasa tidak tenang ketika menghadapi hal-hal tertentu. Meskipun gejala tersebut belum tentu mengganggu seluruh aktivitas, pengalaman ini tetap dapat membuatmu merasa kurang nyaman dalam menjalani keseharian.\n\nCobalah mulai memperhatikan situasi yang sering memicu kekhawatiranmu. Memberikan waktu bagi diri sendiri untuk beristirahat, melakukan aktivitas yang menenangkan, dan berbagi cerita dengan orang tepercaya dapat menjadi langkah awal untuk mengelola kecemasan. Jika gejala semakin sering muncul atau mulai mengganggu aktivitas, kamu dapat mempertimbangkan konsultasi dengan psikolog.',
  },
  {
    min_skor: 10,
    max_skor: 14,
    grade: 'Sedang',
    judul: 'Kecemasan Tingkat Sedang Terdeteksi',
    deskripsi:
      'Hasil tes menunjukkan bahwa gejala kecemasan yang kamu alami berada dalam kategori sedang. Kamu mungkin cukup sering merasa khawatir, gelisah, atau kesulitan mengendalikan pikiran yang terus memikirkan berbagai hal. Bahkan, ketika tidak sedang menghadapi masalah tertentu, perasaan tidak tenang mungkin tetap muncul dan membuatmu sulit merasa rileks.\n\nKondisi ini juga dapat disertai dengan mudah tersinggung, kesulitan untuk duduk tenang, atau munculnya rasa takut seolah-olah sesuatu yang buruk akan terjadi. Pengalaman tersebut bisa membuatmu lebih sulit berkonsentrasi, menikmati waktu istirahat, maupun menjalankan aktivitas dengan nyaman.\n\nPada kondisi ini, penting untuk tidak mengabaikan apa yang sedang kamu rasakan. Cobalah mengenali hal-hal yang memicu kekhawatiran, memberikan waktu bagi diri sendiri untuk beristirahat, dan mencari dukungan dari orang yang dipercaya. Kamu juga disarankan mempertimbangkan konsultasi dengan psikolog agar gejala yang dialami dapat dipahami lebih lanjut dan memperoleh pendampingan yang sesuai.',
  },
  {
    min_skor: 15,
    max_skor: 21,
    grade: 'Berat',
    judul: 'Kondisimu Memerlukan Perhatian Khusus',
    deskripsi:
      'Hasil tes menunjukkan bahwa gejala kecemasan yang kamu alami berada dalam kategori berat. Kamu mungkin merasakan kekhawatiran yang intens dan sulit dikendalikan, bahkan ketika sudah berusaha menenangkan diri. Pikiran dapat terus dipenuhi berbagai kemungkinan buruk sehingga membuatmu merasa tidak tenang dan sulit melepaskan diri dari rasa khawatir.\n\nSelain itu, kamu mungkin mengalami kegelisahan yang cukup kuat, kesulitan untuk bersantai atau duduk diam, mudah tersinggung, hingga perasaan takut seolah-olah sesuatu yang buruk akan terjadi. Gejala-gejala tersebut dapat terasa melelahkan secara emosional maupun fisik dan berpotensi mengganggu konsentrasi, waktu istirahat, hubungan dengan orang lain, serta aktivitas sehari-hari.\n\nApa yang kamu rasakan tetap layak untuk diperhatikan dan mendapatkan dukungan. Kamu tidak perlu menyalahkan diri sendiri atau merasa harus menghadapi semuanya sendirian. Cobalah mencari dukungan dari orang-orang yang kamu percaya dan sangat disarankan untuk berkonsultasi dengan psikolog atau tenaga profesional agar dapat memahami kondisi yang dialami serta memperoleh pendampingan yang sesuai.',
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
  const judulPaket = 'Tes Kecemasan'
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaket },
        { judul: { contains: 'GAD-7', mode: 'insensitive' } },
        { judul: 'Tes Kecemasan: Anxiety Test | Skrining Tingkat Kecemasanmu' },
        { id_alat_ukur: alatUkur.id },
      ],
    },
  })

  const paketPayload = {
    judul: judulPaket,
    id_alat_ukur: alatUkur.id,
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: '/images/psikotes/banner-default.jpg',
    tentang_tes:
      'Pernah merasa gelisah, terus-menerus khawatir, atau sulit menenangkan pikiran? Tes ini mengajak kamu mengenali pengalaman kecemasan yang mungkin muncul dalam dua minggu terakhir, mulai dari rasa gugup, sulit mengendalikan kekhawatiran, hingga perasaan takut bahwa sesuatu yang buruk akan terjadi.',
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

