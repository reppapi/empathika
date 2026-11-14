import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

// ============================================================================
// DATA ALAT UKUR & PAKET DASS-42 (DEPRESSION ANXIETY STRESS SCALE)
// ============================================================================
export const DASS42_SOAL = [
  { no: 1, text: 'Saya merasa bahwa diri saya menjadi marah karena hal-hal sepele.', scale: 'stress' },
  { no: 2, text: 'Saya merasa bibir saya sering kering.', scale: 'anxiety' },
  { no: 3, text: 'Saya sama sekali tidak dapat merasakan perasaan positif.', scale: 'depression' },
  { no: 4, text: 'Saya mengalami kesulitan bernapas (misalnya: seringkali terengah-engah atau tidak dapat bernapas padahal tidak melakukan aktivitas fisik sebelumnya).', scale: 'anxiety' },
  { no: 5, text: 'Saya sepertinya tidak kuat lagi untuk melakukan suatu kegiatan.', scale: 'depression' },
  { no: 6, text: 'Saya cenderung bereaksi berlebihan terhadap suatu situasi.', scale: 'stress' },
  { no: 7, text: 'Saya merasa goyah (misalnya: kaki terasa mau \'copot\').', scale: 'anxiety' },
  { no: 8, text: 'Saya merasa sulit untuk bersantai.', scale: 'stress' },
  { no: 9, text: 'Saya menemukan diri saya berada dalam situasi yang membuat saya merasa sangat cemas dan saya akan merasa sangat lega jika semua ini berakhir.', scale: 'anxiety' },
  { no: 10, text: 'Saya merasa tidak ada hal yang dapat diharapkan di masa depan.', scale: 'depression' },
  { no: 11, text: 'Saya menemukan diri saya mudah merasa kesal.', scale: 'stress' },
  { no: 12, text: 'Saya merasa telah menghabiskan banyak energi untuk merasa cemas.', scale: 'stress' },
  { no: 13, text: 'Saya merasa sedih dan tertekan.', scale: 'depression' },
  { no: 14, text: 'Saya menemukan diri saya menjadi tidak sabar ketika mengalami penundaan (misalnya: kemacetan lalu lintas, menunggu sesuatu).', scale: 'stress' },
  { no: 15, text: 'Saya merasa lemas seperti mau pingsan.', scale: 'anxiety' },
  { no: 16, text: 'Saya merasa saya kehilangan minat akan segala hal.', scale: 'depression' },
  { no: 17, text: 'Saya merasa bahwa saya tidak berharga sebagai seorang manusia.', scale: 'depression' },
  { no: 18, text: 'Saya merasa bahwa saya mudah tersinggung.', scale: 'stress' },
  { no: 19, text: 'Saya berkeringat secara berlebihan (misalnya: tangan berkeringat), padahal temperatur tidak panas atau tidak melakukan aktivitas fisik sebelumnya.', scale: 'anxiety' },
  { no: 20, text: 'Saya merasa takut tanpa alasan yang jelas.', scale: 'anxiety' },
  { no: 21, text: 'Saya merasa bahwa hidup tidak bermanfaat.', scale: 'depression' },
  { no: 22, text: 'Saya merasa sulit untuk beristirahat.', scale: 'stress' },
  { no: 23, text: 'Saya mengalami kesulitan dalam menelan.', scale: 'anxiety' },
  { no: 24, text: 'Saya tidak dapat merasakan kenikmatan dari berbagai hal yang saya lakukan.', scale: 'depression' },
  { no: 25, text: 'Saya menyadari kegiatan jantung, walaupun saya tidak sedang habis melakukan aktivitas fisik (misalnya: merasa detak jantung meningkat atau melemah).', scale: 'anxiety' },
  { no: 26, text: 'Saya merasa putus asa dan sedih.', scale: 'depression' },
  { no: 27, text: 'Saya merasa bahwa saya sangat mudah marah.', scale: 'stress' },
  { no: 28, text: 'Saya merasa saya hampir panik.', scale: 'anxiety' },
  { no: 29, text: 'Saya merasa sulit untuk tenang setelah sesuatu membuat saya kesal.', scale: 'stress' },
  { no: 30, text: 'Saya takut bahwa saya akan \'terhambat\' oleh tugas-tugas sepele yang tidak biasa saya lakukan.', scale: 'anxiety' },
  { no: 31, text: 'Saya tidak merasa antusias dalam hal apapun.', scale: 'depression' },
  { no: 32, text: 'Saya sulit untuk sabar dalam menghadapi gangguan terhadap hal yang sedang saya lakukan.', scale: 'stress' },
  { no: 33, text: 'Saya sedang merasa gelisah.', scale: 'stress' },
  { no: 34, text: 'Saya merasa bahwa saya tidak berharga.', scale: 'depression' },
  { no: 35, text: 'Saya tidak dapat memaklumi hal apapun yang menghalangi saya untuk menyelesaikan hal yang sedang saya lakukan.', scale: 'stress' },
  { no: 36, text: 'Saya merasa sangat ketakutan.', scale: 'anxiety' },
  { no: 37, text: 'Saya melihat tidak ada harapan untuk masa depan.', scale: 'depression' },
  { no: 38, text: 'Saya merasa bahwa hidup tidak berarti.', scale: 'depression' },
  { no: 39, text: 'Saya menemukan diri saya mudah gelisah.', scale: 'stress' },
  { no: 40, text: 'Saya merasa khawatir dengan situasi dimana saya mungkin menjadi panik dan mempermalukan diri sendiri.', scale: 'anxiety' },
  { no: 41, text: 'Saya merasa gemetar (misalnya: pada tangan).', scale: 'anxiety' },
  { no: 42, text: 'Saya merasa sulit untuk meningkatkan inisiatif dalam melakukan sesuatu.', scale: 'depression' },
]

export const DASS42_OPSI = [
  { label: '0', text: 'Tidak pernah', bobot: 0 },
  { label: '1', text: 'Kadang-kadang', bobot: 1 },
  { label: '2', text: 'Lumayan sering', bobot: 2 },
  { label: '3', text: 'Sering sekali', bobot: 3 },
]

export const DASS42_INTERPRETASI = [
  {
    min_skor: 0,
    max_skor: 30,
    grade: 'Normal',
    judul: 'Kondisi Emosional Normal',
    deskripsi:
      'Kondisi kesehatan emosional secara umum berada dalam batas normal. Keseimbangan suasana hati dan daya lenting (resiliensi) terhadap tekanan sehari-hari terjaga dengan baik.',
    tips: [
      'Pertahankan rutinitas istirahat, olahraga, dan nutrisi seimbang.',
      'Lakukan aktivitas rekreasional yang menyenangkan secara teratur.',
      'Jaga koneksi sosial yang hangat bersama sahabat dan keluarga.',
    ],
  },
  {
    min_skor: 31,
    max_skor: 40,
    grade: 'Ringan',
    judul: 'Kondisi Emosional Ringan',
    deskripsi:
      'Terdeteksi adanya ketegangan emosional tingkat ringan. Kamu mungkin sedang mengalami beban pikiran atau kelelahan situasional yang memicu sedikit rasa lelah secara mental.',
    tips: [
      'Ambil jeda istirahat sejenak dari rutinitas yang menguras energi mental.',
      'Praktikkan latihan pernapasan dalam, relaksasi otot, atau journaling emosi.',
      'Ceritakan hal yang membebanimu kepada teman atau keluarga terpercaya.',
    ],
  },
  {
    min_skor: 41,
    max_skor: 60,
    grade: 'Sedang',
    judul: 'Kondisi Emosional Sedang',
    deskripsi:
      'Kondisi emosional berada pada tingkat sedang. Kombinasi perubahan suasana hati, kecemasan, atau ketegangan mulai mempengaruhi kenyamanan aktivitas harian.',
    tips: [
      'Prioritaskan manajemen stres dan atur batasan beban kerja yang realistis.',
      'Hindari memendam beban sendirian dan kurangi overthinking dengan aktivitas terarah.',
      'Sangat disarankan berkonsultasi dengan psikolog profesional Empathika untuk memetakan pemicunya.',
    ],
  },
  {
    min_skor: 61,
    max_skor: 70,
    grade: 'Berat',
    judul: 'Kondisi Emosional Berat',
    deskripsi:
      'Terdeteksi beban emosional yang cukup berat. Tekanan yang dialami cukup intens dan dapat mengganggu konsentrasi, produktivitas, maupun kenyamanan relasi sosial.',
    tips: [
      'Jadwalkan sesi konsultasi dan konseling komprehensif bersama psikolog profesional.',
      'Kurangi tuntutan tinggi dan mintalah dukungan dari support system terdekat.',
      'Fokus pada perawatan diri mendasar (pola tidur, makan teratur, dan lingkungan tenang).',
    ],
  },
  {
    min_skor: 71,
    max_skor: 126,
    grade: 'Sangat Berat',
    judul: 'Kondisi Emosional Sangat Berat',
    deskripsi:
      'Kondisi emosional berada pada tingkat sangat intens. Kondisi ini memerlukan perhatian dan pendampingan psikologis profesional demi memulihkan kestabilan mental dan kenyamanan diri.',
    tips: [
      'Segera hubungi psikolog profesional atau layanan kesehatan mental terdekat untuk mendapatkan pendampingan klinis yang tepat.',
      'Jangan ragu meminta bantuan orang terdekat untuk mendampingimu dalam menjalani masa sulit ini.',
      'Empathika menyediakan ruang konsultasi privat dan aman bersama psikolog terpercaya.',
    ],
  },
]

// ============================================================================
// SEEDER FUNCTION: DASS-42
// Menjamin Idempotency (aman dijalankan berkali-kali tanpa duplikasi)
// ============================================================================
export async function seedDASS42(prisma: PrismaClient) {
  console.log('--- Menyemai Master Alat Ukur DASS-42 ---')

  // 1. Master Alat Ukur DASS-42
  const alatUkurDASS42 = await prisma.alatUkur.upsert({
    where: { kode: 'DASS-42' },
    update: {
      nama: 'Depression Anxiety Stress Scale (DASS-42)',
      kategori: 'Kesehatan Mental',
    },
    create: {
      kode: 'DASS-42',
      nama: 'Depression Anxiety Stress Scale (DASS-42)',
      kategori: 'Kesehatan Mental',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkurDASS42.nama} (${alatUkurDASS42.kode})`)

  // 2. Produk Paket DASS-42 (Berbayar)
  console.log('\n--- Menyemai Produk Paket DASS-42 (Berbayar) ---')
  const judulPaketDASS42 = 'Tes Depresi, Kecemasan, dan Stres'
  let paketDASS42 = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaketDASS42 },
        { judul: { contains: 'DASS-42', mode: 'insensitive' } },
        { id_alat_ukur: alatUkurDASS42.id },
      ],
    },
  })

  const paketDASS42Payload = {
    judul: judulPaketDASS42,
    id_alat_ukur: alatUkurDASS42.id,
    jenis_akses: JenisAksesPsikotes.BERBAYAR,
    harga: 49000,
    banner_url: '/images/psikotes/banner-dass42.jpg',
    tentang_tes:
      'Setiap orang bisa mengalami tekanan emosional dengan cara yang berbeda. Tes ini membantu memberikan gambaran tentang tiga aspek, yaitu depresi, kecemasan, dan stres. Kamu dapat mengenali pengalaman seperti perasaan sedih, ketegangan, kekhawatiran, hingga kesulitan untuk merasa tenang dalam menghadapi berbagai situasi.',
    status: 'PUBLISHED',
  }

  if (paketDASS42) {
    paketDASS42 = await prisma.paketPsikotes.update({
      where: { id: paketDASS42.id },
      data: paketDASS42Payload,
    })
  } else {
    paketDASS42 = await prisma.paketPsikotes.create({
      data: paketDASS42Payload,
    })
  }
  console.log(`    ✓ Paket: ${paketDASS42.judul} (Berbayar - Rp ${Number(paketDASS42.harga).toLocaleString('id-ID')})`)

  // 3. 42 Butir Soal & 168 Opsi Jawaban DASS-42
  for (const q of DASS42_SOAL) {
    let soal = await prisma.soalPsikotes.findFirst({
      where: { id_paket: paketDASS42.id, urutan: q.no },
    })

    if (soal) {
      soal = await prisma.soalPsikotes.update({
        where: { id: soal.id },
        data: { pertanyaan: q.text },
      })
    } else {
      soal = await prisma.soalPsikotes.create({
        data: { id_paket: paketDASS42.id, urutan: q.no, pertanyaan: q.text },
      })
    }

    for (const opt of DASS42_OPSI) {
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
  console.log('    ✓ 42 Soal & 168 Pilihan Jawaban tersimpan di database.')

  // 4. Kategori Interpretasi DASS-42
  for (const item of DASS42_INTERPRETASI) {
    const existing = await prisma.interpretasiPsikotes.findFirst({
      where: {
        id_paket: paketDASS42.id,
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
          id_paket: paketDASS42.id,
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
  console.log('    ✓ 5 Kategori Interpretasi DASS-42 tersimpan di database.')

  return paketDASS42
}

if (process.argv[1]?.includes('seed-dass42')) {
  const p = new PrismaClient()
  seedDASS42(p)
    .then(async () => {
      await p.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Error saat menjalankan seed-dass42:', e)
      await p.$disconnect()
      process.exit(1)
    })
}
