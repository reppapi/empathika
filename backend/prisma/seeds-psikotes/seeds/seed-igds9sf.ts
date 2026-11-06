import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

// ============================================================================
// DATA ALAT UKUR & PAKET IGDS9-SF (INTERNET GAMING DISORDER SCALE - SHORT FORM)
// Dikembangkan oleh Pontes & Griffiths (2015) berdasarkan kriteria DSM-5
// ============================================================================
export const IGDS9SF_SOAL = [
  {
    no: 1,
    text: 'Apakah kamu merasa disibukkan dengan bermain game? (Contoh: Apakah kamu memikirkan aktivitas game sebelumnya atau mengantisipasi sesi game berikutnya? Apakah menurut kamu game telah menjadi aktivitas dominan dalam kehidupan keseharian kamu?)',
  },
  {
    no: 2,
    text: 'Apakah kamu merasa lebih mudah tersinggung, cemas, atau bahkan sedih ketika kamu mencoba untuk mengurangi atau menghentikan aktivitas bermain game kamu?',
  },
  {
    no: 3,
    text: 'Apakah kamu merasa perlu menghabiskan lebih banyak waktu dalam bermain game untuk mencapai kepuasan atau kesenangan?',
  },
  {
    no: 4,
    text: 'Apakah kamu secara sistematis gagal saat mencoba mengontrol atau menghentikan aktivitas game kamu?',
  },
  {
    no: 5,
    text: 'Apakah kamu kehilangan minat pada hobi sebelumnya dan aktivitas hiburan lainnya sebagai akibat dari keterlibatan kamu pada game?',
  },
  {
    no: 6,
    text: 'Apakah kamu tetap melanjutkan aktivitas bermain game meskipun kamu tahu hal itu menyebabkan masalah antara kamu dan orang lain?',
  },
  {
    no: 7,
    text: 'Apakah kamu pernah menipu salah satu anggota keluarga, terapis, atau orang lain karena banyaknya aktivitas bermain game kamu?',
  },
  {
    no: 8,
    text: 'Apakah kamu bermain game untuk melarikan diri atau menghilangkan suasana hati negatif (misalnya, ketidakberdayaan, rasa bersalah, kecemasan) untuk sementara waktu?',
  },
  {
    no: 9,
    text: 'Pernahkah kamu membahayakan atau kehilangan hubungan, pekerjaan, pendidikan, atau peluang karir yang penting akibat aktivitas game kamu?',
  },
]

export const IGDS9SF_OPSI = [
  { label: '1', text: 'Tidak pernah', bobot: 1 },
  { label: '2', text: 'Jarang', bobot: 2 },
  { label: '3', text: 'Kadang-kadang', bobot: 3 },
  { label: '4', text: 'Sering', bobot: 4 },
  { label: '5', text: 'Sangat sering', bobot: 5 },
]

export const IGDS9SF_INTERPRETASI = [
  {
    min_skor: 9,
    max_skor: 35,
    grade: 'Gambaran Pola Bermain Terkendali',
    judul: 'Pola Bermain Game Kamu Masih Relatif Terkendali',
    deskripsi:
      'Berdasarkan jawaban yang kamu berikan, aktivitas bermain game tampaknya belum menunjukkan banyak tanda yang berkaitan dengan Internet Gaming Disorder. Game dapat menjadi salah satu bentuk hiburan yang menyenangkan selama tetap seimbang dengan tanggung jawab, waktu istirahat, hubungan sosial, dan aktivitas sehari-hari lainnya.',
    tips: [
      'Pertahankan keseimbangan antara bermain game, belajar atau bekerja, beristirahat, dan melakukan aktivitas lainnya.',
      'Tetapkan batas waktu bermain agar tidak mengganggu jadwal tidur dan kegiatan sehari-hari.',
      'Luangkan waktu untuk melakukan hobi lain dan berinteraksi dengan keluarga maupun teman.',
      'Perhatikan perubahan pola bermain, terutama jika mulai sulit mengendalikan durasi atau frekuensi bermain.',
    ],
  },
  {
    min_skor: 36,
    max_skor: 45,
    grade: 'Indikasi Gejala IGD',
    judul: 'Pola Bermain Game Kamu Perlu Diperhatikan Lebih Lanjut (Indikasi gejala IGD)',
    deskripsi:
      'Berdasarkan jawaban yang kamu berikan, terdapat sejumlah tanda yang berkaitan dengan Internet Gaming Disorder. Hal ini dapat terlihat dari aktivitas bermain game yang mulai sulit dikendalikan atau berpotensi memengaruhi kegiatan sehari-hari, hubungan dengan orang lain, maupun tanggung jawab pribadi. Kondisi ini bukan berarti kamu pasti mengalami gangguan, tetapi dapat menjadi pengingat untuk lebih memperhatikan pola bermain game dan dampaknya terhadap kehidupanmu.',
    tips: [
      'Coba kenali situasi atau perasaan yang membuatmu terdorong untuk bermain game dalam waktu lama.',
      'Mulailah mengatur jadwal bermain secara bertahap dan berikan ruang untuk aktivitas lain.',
      'Tetapkan waktu khusus untuk beristirahat, belajar atau bekerja, serta berinteraksi dengan orang terdekat.',
      'Ceritakan kesulitan yang kamu alami kepada orang yang kamu percaya.',
      'Jika pola bermain mulai mengganggu aktivitas atau hubunganmu, pertimbangkan untuk berkonsultasi dengan psikolog profesional.',
    ],
  },
]

export async function seedIGDS9SF(prisma: PrismaClient) {
  console.log('\n--- Menyemai Master Data Alat Ukur IGDS9-SF ---')

  // 1. Master Data AlatUkur
  const alatUkur = await prisma.alatUkur.upsert({
    where: { kode: 'IGDS9-SF' },
    update: {
      nama: 'Internet Gaming Disorder Scale – Short-Form (IGDS9-SF)',
      kategori: 'Kecanduan / Perilaku',
    },
    create: {
      kode: 'IGDS9-SF',
      nama: 'Internet Gaming Disorder Scale – Short-Form (IGDS9-SF)',
      kategori: 'Kecanduan / Perilaku',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkur.nama} (${alatUkur.kode})`)

  // 2. Produk Paket IGDS9-SF (Gratis)
  console.log('\n--- Menyemai Produk Paket IGDS9-SF (Gratis) ---')
  const judulPaket = 'Tes Kecanduan Game | Skrining Internet Gaming Disorder'
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaket },
        { judul: { contains: 'IGDS9-SF', mode: 'insensitive' } },
        { id_alat_ukur: alatUkur.id },
      ],
    },
  })

  const paketPayload = {
    judul: judulPaket,
    id_alat_ukur: alatUkur.id,
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: '/images/psikotes/banner-gaming-disorder.jpg',
    deskripsi:
      'Evaluasi pola dan intensitas aktivitas bermain game kamu selama 12 bulan terakhir berdasarkan kriteria resmi DSM-5 (Pontes & Griffiths, 2015). Asesmen ini dapat digunakan untuk anak-anak, remaja, hingga dewasa.',
    tentang_tes:
      'Internet Gaming Disorder Scale – Short-Form (IGDS9-SF) dikembangkan oleh Pontes & Griffiths pada tahun 2015 untuk menilai tingkat keparahan IGD dan efek merugikannya dengan memeriksa aktivitas bermain game online dan/atau offline selama 12 bulan terakhir. Instrumen ini mengukur 9 kriteria inti DSM-5: preokupasi, gejala putus game (withdrawal), toleransi, kehilangan kendali, penurunan minat lain, terus bermain meski bermasalah, menipu/berbohong, pelarian emosi negatif, dan risiko kehilangan relasi/karier.',
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

  // 3. 9 Butir Soal & 45 Opsi Jawaban (5 opsi per butir)
  for (const q of IGDS9SF_SOAL) {
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

    for (const opt of IGDS9SF_OPSI) {
      const existingOpsi = await prisma.pilihanJawaban.findFirst({
        where: { id_soal: soal.id, label: opt.label },
      })

      if (existingOpsi) {
        await prisma.pilihanJawaban.update({
          where: { id: existingOpsi.id },
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
  console.log(`    ✓ 9 Soal & 45 Pilihan Jawaban IGDS9-SF berhasil disinkronkan`)

  // 4. Kategori Interpretasi (Normal 9–35 & Kemungkinan IGD 36–45)
  for (const interp of IGDS9SF_INTERPRETASI) {
    const existing = await prisma.interpretasiPsikotes.findFirst({
      where: {
        id_paket: paket.id,
        grade: interp.grade,
      },
    })

    if (existing) {
      await prisma.interpretasiPsikotes.update({
        where: { id: existing.id },
        data: {
          min_skor: interp.min_skor,
          max_skor: interp.max_skor,
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
  console.log(`    ✓ 2 Kategori Interpretasi IGDS9-SF berhasil disinkronkan`)
}

if (process.argv[1]?.includes('seed-igds9sf')) {
  const p = new PrismaClient()
  seedIGDS9SF(p)
    .then(async () => {
      await p.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Error saat menjalankan seed-igds9sf:', e)
      await p.$disconnect()
      process.exit(1)
    })
}
