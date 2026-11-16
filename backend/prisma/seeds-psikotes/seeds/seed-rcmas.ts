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
      'Hasil yang kamu peroleh menunjukkan bahwa gejala kecemasan yang kamu alami cenderung berada pada tingkat yang rendah. Hal ini berarti kamu belum menunjukkan gejala kecemasan yang signifikan, meskipun dalam situasi tertentu kamu mungkin tetap merasa khawatir, gugup, atau gelisah.\n\nPerasaan tersebut bisa muncul dalam berbagai bentuk, seperti merasa tidak tenang, memikirkan sesuatu secara berlebihan, mengalami respons fisik tertentu, atau sesekali kesulitan berkonsentrasi. Hal ini merupakan pengalaman yang dapat terjadi dalam kehidupan sehari-hari.\n\nTetap kenali dan perhatikan perasaanmu. Jika suatu waktu rasa cemas mulai mengganggu aktivitas atau membuatmu tidak nyaman, jangan ragu untuk bercerita kepada orang yang kamu percaya maupun mencari dukungan dari tenaga profesional.',
  },
  {
    min_skor: 19,
    max_skor: 28,
    grade: 'Kecemasan Signifikan Secara Klinis',
    judul: 'Kamu Perlu Memberikan Perhatian Lebih pada Kecemasan',
    deskripsi:
      'Hasil yang kamu peroleh menunjukkan adanya gejala kecemasan yang cukup signifikan dan perlu mendapatkan perhatian lebih lanjut. Kamu mungkin lebih sering mengalami perasaan khawatir, gugup, gelisah, atau kesulitan mengendalikan pikiran yang membuatmu merasa tidak tenang.\n\nKondisi ini juga dapat muncul melalui respons fisik, seperti tangan berkeringat atau sakit perut, kekhawatiran dan kepekaan yang berlebihan, serta kesulitan berkonsentrasi. Pengalaman tersebut mungkin memengaruhi kenyamanan, hubungan dengan orang lain, maupun aktivitasmu sehari-hari.\n\nKamu tidak perlu menghadapi semuanya sendirian. Cobalah untuk bercerita kepada orang yang kamu percaya dan pertimbangkan untuk berkonsultasi dengan psikolog agar kamu bisa memahami apa yang sedang dirasakan serta mendapatkan pendampingan yang sesuai dengan kebutuhanmu.',
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
    banner_url: '/images/psikotes/banner-default.jpg',
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
        },
      })
    }
  }
  console.log(`    ✓ Interpretasi Hasil RCMAS berhasil disemai (Cut-off >= 19 dari 28)`)

  return paket
}

if (process.argv[1]?.includes('seed-rcmas')) {
  const p = new PrismaClient()
  seedRCMAS(p)
    .then(async () => {
      await p.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Error saat menjalankan seed-rcmas:', e)
      await p.$disconnect()
      process.exit(1)
    })
}

