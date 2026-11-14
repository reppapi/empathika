import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

// ============================================================================
// DATA ALAT UKUR & PAKET RCMAS (REVISED CHILDREN'S MANIFEST ANXIETY SCALE)
// Dikembangkan oleh Reynolds & Richmond (1978) berdasarkan CMAS (1956)
// Total 37 Butir: 28 Item Anxiety Scale (Skor 0–28, Cut-off >= 19) + 9 Item Lie Scale
// ============================================================================

export const RCMAS_SOAL = [
  { no: 1, text: 'Saya sering merasa sulit untuk mengambil keputusan.' },
  { no: 2, text: 'Saya merasa gugup ketika segala sesuatunya tidak berjalan sesuai keinginan saya.' },
  { no: 3, text: 'Orang lain kelihatannya lebih mudah melakukan sesuatu daripada saya.' },
  { no: 4, text: 'Saya menyukai semua orang yang saya kenal.' },
  { no: 5, text: 'Saya sering merasa sulit bernapas atau sesak napas saat tegang.' },
  { no: 6, text: 'Saya sering merasa khawatir sepanjang waktu.' },
  { no: 7, text: 'Saya merasa takut terhadap banyak hal.' },
  { no: 8, text: 'Saya selalu bersikap baik kepada siapa pun.' },
  { no: 9, text: 'Saya mudah merasa kesal atau marah.' },
  { no: 10, text: 'Saya khawatir tentang apa yang akan dikatakan orang tua saya kepada saya.' },
  { no: 11, text: 'Saya merasa orang lain tidak menyukai cara saya melakukan sesuatu.' },
  { no: 12, text: 'Saya selalu memiliki tata krama dan sopan santun yang baik.' },
  { no: 13, text: 'Saya sulit untuk bisa tidur nyenyak di malam hari.' },
  { no: 14, text: 'Saya sering khawatir tentang apa yang dipikirkan orang lain tentang diri saya.' },
  { no: 15, text: 'Saya merasa kesepian meskipun ada banyak orang di sekitar saya.' },
  { no: 16, text: 'Saya selalu berperilaku baik setiap saat.' },
  { no: 17, text: 'Perut saya sering terasa sakit atau mual saat merasa tegang.' },
  { no: 18, text: 'Perasaan saya mudah terluka atau tersinggung.' },
  { no: 19, text: 'Telapak tangan saya sering terasa berkeringat atau dingin.' },
  { no: 20, text: 'Saya selalu ramah dan menyenangkan kepada semua orang.' },
  { no: 21, text: 'Saya sering merasa lelah dan tidak berenergi.' },
  { no: 22, text: 'Saya khawatir memikirkan apa yang akan terjadi di masa depan.' },
  { no: 23, text: 'Anak-anak atau teman-teman lain kelihatannya lebih bahagia daripada saya.' },
  { no: 24, text: 'Saya selalu mengatakan kebenaran dan tidak pernah berbohong.' },
  { no: 25, text: 'Saya sering mengalami mimpi buruk saat tidur.' },
  { no: 26, text: 'Perasaan saya mudah terluka ketika ditegur atau dimarahi.' },
  { no: 27, text: 'Saya merasa cemas ada orang yang akan mengatakan bahwa cara saya salah.' },
  { no: 28, text: 'Saya tidak pernah merasa marah sama sekali.' },
  { no: 29, text: 'Saya kadang terbangun di malam hari dalam keadaan takut.' },
  { no: 30, text: 'Saya merasa cemas atau gelisah saat hendak tidur di malam hari.' },
  { no: 31, text: 'Saya merasa sulit untuk memusatkan perhatian dan konsentrasi pada tugas sekolah.' },
  { no: 32, text: 'Saya tidak pernah mengatakan hal-hal yang tidak pantas atau tidak seharusnya.' },
  { no: 33, text: 'Saya sering merasa gelisah dan tidak bisa duduk tenang di kursi.' },
  { no: 34, text: 'Saya merasa banyak orang yang memusuhi atau menentang saya.' },
  { no: 35, text: 'Saya sering khawatir akan terjadi sesuatu yang buruk pada diri saya.' },
  { no: 36, text: 'Saya tidak pernah berpikiran buruk tentang orang lain.' },
  { no: 37, text: 'Saya mudah merasa cemas atau khawatir jika menghadapi hal yang baru.' },
]

export const RCMAS_OPSI = [
  { label: '0', text: 'Tidak', bobot: 0 },
  { label: '1', text: 'Ya', bobot: 1 },
]

export const RCMAS_INTERPRETASI = [
  {
    min_skor: 0,
    max_skor: 18,
    grade: 'Kecemasan Normal',
    judul: 'Tingkat Kecemasan Masih dalam Batas Wajar',
    deskripsi:
      'Kamu cenderung mampu menghadapi berbagai situasi sehari-hari tanpa menunjukkan kecemasan yang berlebihan. Rasa khawatir, gugup, atau takut mungkin sesekali muncul, terutama ketika menghadapi hal baru, tekanan, atau situasi yang tidak sesuai harapan. Namun, perasaan tersebut belum menunjukkan indikasi kecemasan yang signifikan. Dalam keseharian, penting untuk tetap mengenali perasaan yang muncul, memahami respons diri ketika menghadapi tekanan, serta mengembangkan cara yang positif dalam menghadapi berbagai tantangan. Dengan begitu, kamu dapat terus membangun rasa percaya diri dan menjaga keseimbangan emosional.',
    tips: [
      'Kenali perasaan yang muncul ketika menghadapi situasi yang membuatmu gugup atau khawatir. Memahami emosi merupakan langkah awal untuk mengelolanya.',
      'Bangun rasa percaya diri dengan menghargai setiap usaha dan pencapaian kecil yang berhasil kamu lakukan.',
      'Jangan ragu untuk mencoba hal baru secara bertahap. Berikan dirimu kesempatan untuk belajar dan beradaptasi dengan pengalaman yang berbeda.',
      'Jaga keseimbangan antara aktivitas belajar, waktu istirahat, dan kegiatan yang kamu sukai agar kondisi emosional tetap terjaga.',
      'Ceritakan pengalaman atau perasaanmu kepada orang yang kamu percaya ketika membutuhkan dukungan atau tempat untuk bercerita.',
    ],
  },
  {
    min_skor: 19,
    max_skor: 28,
    grade: 'Kecemasan Signifikan Secara Klinis',
    judul: 'Kamu Perlu Memberikan Perhatian Lebih pada Kecemasan',
    deskripsi:
      'Kamu mungkin lebih mudah mengalami rasa khawatir, gugup, atau takut ketika menghadapi berbagai situasi. Perasaan tersebut dapat muncul dalam bentuk respons fisik, seperti tubuh terasa tegang, sulit tidur, atau gelisah; kekhawatiran berlebih terhadap berbagai hal; maupun kesulitan dalam mempertahankan konsentrasi. Kondisi ini dapat membuat aktivitas sehari-hari terasa lebih menantang, terutama ketika menghadapi tekanan, perubahan, atau situasi yang belum familiar. Penting untuk tidak mengabaikan perasaan yang kamu alami. Cobalah untuk lebih memahami hal-hal yang memicu kecemasan dan memberikan ruang bagi diri sendiri untuk beristirahat serta mencari dukungan. Apabila kecemasan mulai mengganggu aktivitas atau keseharianmu, berbicara dengan psikolog dapat membantu kamu memahami kondisi tersebut dan menemukan cara penanganan yang sesuai.',
    tips: [
      'Cobalah mengenali situasi, pikiran, atau pengalaman yang sering membuatmu merasa cemas. Kamu bisa menuliskannya dalam jurnal agar lebih mudah memahami pola kecemasan yang muncul.',
      'Ketika mulai merasa gelisah, luangkan waktu sejenak untuk menenangkan diri, misalnya dengan mengatur napas secara perlahan atau melakukan aktivitas yang membuatmu nyaman.',
      'Hindari memendam semua kekhawatiran sendirian. Berbagi cerita dengan teman, keluarga, atau orang yang kamu percaya dapat membantu meringankan beban pikiran.',
      'Berikan dirimu waktu untuk beristirahat dan jangan terlalu memaksakan diri dalam menghadapi tuntutan atau ekspektasi yang terasa berat.',
      'Cobalah menghadapi situasi yang membuatmu khawatir secara bertahap. Tidak perlu memaksakan diri untuk menyelesaikan semuanya sekaligus.',
      'Pertimbangkan untuk berkonsultasi dengan psikolog apabila rasa cemas terus berulang atau mulai mengganggu kegiatan belajar, hubungan sosial, maupun aktivitas sehari-hari.',
    ],
  },
]

export async function seedRCMAS(prisma: PrismaClient) {
  console.log("\n--- Menyemai Master Data Alat Ukur RCMAS ---")

  // 1. Master Data AlatUkur
  const alatUkur = await prisma.alatUkur.upsert({
    where: { kode: 'RCMAS' },
    update: {
      nama: "Revised Children's Manifest Anxiety Scale (RCMAS)",
      kategori: 'Kecemasan Anak & Remaja',
    },
    create: {
      kode: 'RCMAS',
      nama: "Revised Children's Manifest Anxiety Scale (RCMAS)",
      kategori: 'Kecemasan Anak & Remaja',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkur.nama} (${alatUkur.kode})`)

  // 2. Produk Paket RCMAS (Gratis)
  console.log('\n--- Menyemai Produk Paket RCMAS (Gratis) ---')
  const judulPaket = 'Tes Kecemasan Anak dan Remaja'
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaket },
        { judul: { contains: 'RCMAS', mode: 'insensitive' } },
        { judul: { contains: 'Kecemasan Anak', mode: 'insensitive' } },
        { id_alat_ukur: alatUkur.id },
      ],
    },
  })

  const paketPayload = {
    judul: judulPaket,
    id_alat_ukur: alatUkur.id,
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: '/images/psikotes/banner-rcmas.jpg',
    tentang_tes:
      'Rasa cemas bisa muncul dalam berbagai bentuk, baik melalui perasaan maupun respons tubuh. Tes ini membantu mengenali pengalaman kecemasan pada anak dan remaja, seperti keluhan fisik, kekhawatiran berlebihan, serta kesulitan berkonsentrasi.',
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

  // 3. 37 Butir Soal & Pilihan Jawaban (Ya = 1, Tidak = 0)
  for (const q of RCMAS_SOAL) {
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
        data: {
          id_paket: paket.id,
          urutan: q.no,
          pertanyaan: q.text,
        },
      })
    }

    // Pastikan pilihan jawaban Ya / Tidak tersedia dengan bobot tepat
    for (const opt of RCMAS_OPSI) {
      const existingPilihan = await prisma.pilihanJawaban.findFirst({
        where: { id_soal: soal.id, label: opt.label },
      })

      if (existingPilihan) {
        await prisma.pilihanJawaban.update({
          where: { id: existingPilihan.id },
          data: {
            teks_jawaban: opt.text,
            bobot: opt.bobot,
          },
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
  console.log(`    ✓ 37 Butir Soal & Opsi Jawaban RCMAS berhasil disemai`)

  // 4. Interpretasi Hasil Berdasarkan Cut-off Klinis (>= 19 dari 28)
  for (const interp of RCMAS_INTERPRETASI) {
    const existingInterp = await prisma.interpretasiPsikotes.findFirst({
      where: {
        id_paket: paket.id,
        min_skor: interp.min_skor,
        max_skor: interp.max_skor,
      },
    })

    if (existingInterp) {
      await prisma.interpretasiPsikotes.update({
        where: { id: existingInterp.id },
        data: {
          grade: interp.grade,
          judul: interp.judul,
          deskripsi: interp.deskripsi,
          tips: interp.tips,
        },
      })
    } else {
      await prisma.interpretasiPsikotes.create({
        data: {
          id_paket: paket.id,
          min_skor: interp.min_skor,
          max_skor: interp.max_skor,
          grade: interp.grade,
          judul: interp.judul,
          deskripsi: interp.deskripsi,
          tips: interp.tips,
        },
      })
    }
  }
  console.log(`    ✓ Interpretasi Hasil RCMAS berhasil disemai (Cut-off >= 19 dari 28)`)

  return paket
}

