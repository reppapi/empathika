import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

// ============================================================================
// DATA ALAT UKUR & PAKET CATS (CHILD AND ADOLESCENT TRAUMA SCREEN)
// Dikembangkan oleh Cedric Sachser et al. (2017)
// Sasaran: Anak & Remaja usia 7–17 tahun
// Total 40 Butir:
// - 15 Butir Kriteria A: Paparan Peristiwa Berpotensi Traumatis (PTE 1–15) (Ya/Tidak)
// - 20 Butir Kriteria B, C, D, E: Gejala PTSD DSM-5 (Gejala 1–20) (Skala 0–3, Skor 0–60)
// - 5 Butir: Dampak terhadap Fungsi Psikososial (Aspek 1–5) (Ya/Tidak)
// AKSES: GRATIS (Rp 0)
// ============================================================================

export interface CATSSoalItem {
  no: number
  kategori: 'PTE' | 'GEJALA_PTSD' | 'FUNGSI_PSIKOSOSIAL'
  klaster?: string
  text: string
}

export const CATS_SOAL: CATSSoalItem[] = [
  // --- BAGIAN 1: PERISTIWA BERPOTENSI TRAUMATIS (PTE 1–15) ---
  {
    no: 1,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Bencana alam serius seperti banjir, angin puting-beliung, angin topan, gempa bumi, atau kebakaran.',
  },
  {
    no: 2,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Kecelakaan atau cedera serius seperti tabrakan mobil / sepeda, digigit anjing, luka serius akibat olahraga.',
  },
  {
    no: 3,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Dirampok dengan ancaman, kekuatan, atau senjata.',
  },
  {
    no: 4,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Ditampar, ditinju, atau dipukuli oleh keluarga kamu sendiri.',
  },
  {
    no: 5,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Ditampar, ditinju, atau dipukuli oleh seseorang yang bukan anggota keluarga kamu.',
  },
  {
    no: 6,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Melihat seseorang di keluarga kamu sedang ditampar, ditinju, atau dipukuli.',
  },
  {
    no: 7,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Melihat seseorang di tempat lain sedang ditampar dan ditinju.',
  },
  {
    no: 8,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Seseorang yang lebih tua menyentuh bagian intim kamu (misal : alat kelamin, pantat, payudara) padahal seharusnya tidak boleh.',
  },
  {
    no: 9,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Seseorang memaksa atau menekan kamu untuk melakukan hubungan intim / seksual, ketika kamu sulit mengatakan tidak.',
  },
  {
    no: 10,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Seseorang yang dekat dengan kamu meninggal tiba-tiba atau karena tindak kekerasan.',
  },
  {
    no: 11,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Diserang, ditikam, ditembak, atau dilukai secara parah.',
  },
  {
    no: 12,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Melihat seseorang diserang, ditikam, ditembak, terluka parah, atau dibunuh.',
  },
  {
    no: 13,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Prosedur medis yang membuat stres atau menakutkan.',
  },
  {
    no: 14,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Berada di situasi peperangan.',
  },
  {
    no: 15,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Peristiwa yang membuat stres atau menakutkan lainnya?',
  },

  // --- BAGIAN 2: 20 BUTIR GEJALA PTSD DSM-5 (NOMOR 16–35) ---
  // Kriteria B: Intrusi / Gangguan (Butir 16–20 / Gejala 1–5)
  {
    no: 16,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Pikiran atau gambaran yang menjengkelkan tentang apa yang terjadi, muncul tiba-tiba di kepala kamu.',
  },
  {
    no: 17,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Mimpi buruk yang mengingatkan kamu tentang apa yang terjadi.',
  },
  {
    no: 18,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Merasa seolah-olah apa yang terjadi terulang kembali.',
  },
  {
    no: 19,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Merasa sangat kesal ketika diingatkan tentang apa yang terjadi.',
  },
  {
    no: 20,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Perasaan kuat di tubuh kamu, ketika kamu diingatkan tentang apa yang terjadi (berkeringat, jantung berdebar kencang, sakit perut).',
  },

  // Kriteria C: Penghindaran (Butir 21–22 / Gejala 6–7)
  {
    no: 21,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria C: Penghindaran',
    text: 'Berusaha untuk tidak memikirkan apa yang terjadi. Atau berusaha tidak memiliki perasaan tentang hal itu.',
  },
  {
    no: 22,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria C: Penghindaran',
    text: 'Menjauhi apa pun yang mengingatkan kamu tentang apa yang terjadi (orang, tempat, benda, situasi, pembicaraan).',
  },

  // Kriteria D: Kognisi & Suasana Hati Negatif (Butir 23–29 / Gejala 8–14)
  {
    no: 23,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Tidak mampu mengingat sebagian peristiwa yang terjadi.',
  },
  {
    no: 24,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Pikiran negatif tentang diri sendiri atau orang lain. Misal, pikiran seperti : “Aku tidak akan memiliki kehidupan yang baik, tidak ada yang bisa dipercaya, seluruh dunia tidak aman.”',
  },
  {
    no: 25,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Menyalahkan diri sendiri atas apa yang terjadi. Atau menyalahkan orang lain ketika itu bukan kesalahan mereka.',
  },
  {
    no: 26,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Seringkali muncul perasaan buruk (takut, marah, bersalah, malu).',
  },
  {
    no: 27,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Tidak ingin melakukan hal-hal yang biasa kamu lakukan.',
  },
  {
    no: 28,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Tidak merasa dekat dengan orang lain.',
  },
  {
    no: 29,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Tidak mampu memiliki perasaan yang baik atau bahagia.',
  },

  // Kriteria E: Hyperarousal & Reaktivitas (Butir 30–35 / Gejala 15–20)
  {
    no: 30,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Merasa gila. Memiliki kemarahan dan melampiaskannya ke orang lain.',
  },
  {
    no: 31,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Melakukan hal-hal yang tidak aman.',
  },
  {
    no: 32,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Menjadi terlalu berhati-hati (memeriksa untuk melihat siapa yang ada di sekitar kamu).',
  },
  {
    no: 33,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Menjadi gelisah.',
  },
  {
    no: 34,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Kesulitan dalam memperhatikan sesuatu.',
  },
  {
    no: 35,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Kesulitan untuk tidur atau tetap tertidur.',
  },

  // --- BAGIAN 3: DAMPAK TERHADAP FUNGSI PSIKOSOSIAL (NOMOR 36–40) ---
  {
    no: 36,
    kategori: 'FUNGSI_PSIKOSOSIAL',
    klaster: 'Fungsi Psikososial',
    text: 'Masalah yang kamu tandai sudah mengganggu: Pergaulan dengan orang lain.',
  },
  {
    no: 37,
    kategori: 'FUNGSI_PSIKOSOSIAL',
    klaster: 'Fungsi Psikososial',
    text: 'Masalah yang kamu tandai sudah mengganggu: Hobi / kesenangan.',
  },
  {
    no: 38,
    kategori: 'FUNGSI_PSIKOSOSIAL',
    klaster: 'Fungsi Psikososial',
    text: 'Masalah yang kamu tandai sudah mengganggu: Sekolah.',
  },
  {
    no: 39,
    kategori: 'FUNGSI_PSIKOSOSIAL',
    klaster: 'Fungsi Psikososial',
    text: 'Masalah yang kamu tandai sudah mengganggu: Hubungan dengan keluarga.',
  },
  {
    no: 40,
    kategori: 'FUNGSI_PSIKOSOSIAL',
    klaster: 'Fungsi Psikososial',
    text: 'Masalah yang kamu tandai sudah mengganggu: Kebahagiaan secara umum.',
  },
]

// Opsi Jawaban Bagian 1 (PTE) & Bagian 3 (Fungsi Psikososial)
export const CATS_OPSI_YA_TIDAK = [
  { label: '0', text: 'Tidak', bobot: 0 },
  { label: '1', text: 'Ya', bobot: 1 },
]

// Opsi Jawaban Bagian 2 (Gejala PTSD DSM-5)
export const CATS_OPSI_GEJALA = [
  { label: '0', text: 'Tidak pernah', bobot: 0 },
  { label: '1', text: 'Sesekali', bobot: 1 },
  { label: '2', text: 'Separuh waktu', bobot: 2 },
  { label: '3', text: 'Hampir selalu', bobot: 3 },
]

// Tabel Interpretasi Skor Gejala Total CATS (0–60) Sesuai Handout
export const CATS_INTERPRETASI = [
  {
    min_skor: 0,
    max_skor: 14,
    grade: 'Normal, tidak meningkat secara klinis',
    judul: 'Tingkat Gejala Normal (Tidak Meningkat Secara Klinis)',
    deskripsi:
      'Hasil yang kamu peroleh menunjukkan bahwa saat ini gejala stres pascatrauma yang kamu alami belum terlihat meningkat secara signifikan. Artinya, kamu belum menunjukkan banyak gejala yang berkaitan dengan pengalaman traumatis. Meskipun begitu, perasaan sedih, takut, atau tidak nyaman ketika mengingat suatu kejadian tetap merupakan hal yang perlu diperhatikan.\n\nSetiap orang memiliki cara dan waktu yang berbeda dalam menghadapi pengalaman sulit. Terkadang, perasaan tertentu masih bisa muncul meskipun kejadian tersebut sudah berlalu. Karena itu, penting untuk tetap mengenali perasaan dan memahami apa yang kamu butuhkan.\n\nJika suatu saat ada hal yang membuatmu merasa tidak nyaman, jangan ragu untuk bercerita kepada orang yang kamu percaya. Kamu tetap berhak mendapatkan dukungan dan merasa aman dalam menjalani keseharian.',
  },
  {
    min_skor: 15,
    max_skor: 20,
    grade: 'Distres level menengah terkait trauma',
    judul: 'Distres Tingkat Menengah Terkait Trauma',
    deskripsi:
      'Hasil yang kamu peroleh menunjukkan adanya gejala stres tingkat menengah yang berkaitan dengan pengalaman sulit atau peristiwa berat yang pernah kamu alami. Kamu mungkin masih merasakan takut, khawatir, sedih, atau tidak nyaman ketika mengingat kejadian tersebut. Perasaan ini dapat memengaruhi kenyamananmu dalam menjalani aktivitas sehari-hari.\n\nMenghadapi pengalaman berat bukanlah hal yang mudah, dan setiap orang memiliki proses pemulihan yang berbeda. Dukungan dari keluarga, teman, maupun orang-orang yang kamu percaya dapat membantu membuatmu merasa lebih aman dan didengarkan. Kamu juga bisa melakukan kegiatan yang membuatmu nyaman sebagai salah satu cara untuk mengelola perasaan.\n\nJika gejala yang kamu alami masih terasa mengganggu, jangan ragu untuk mencari pendampingan dari psikolog. Dengan dukungan yang tepat, kamu dapat belajar memahami perasaanmu dan menjalani proses pemulihan secara bertahap.',
  },
  {
    min_skor: 21,
    max_skor: 60,
    grade: 'Kemungkinan PTSD',
    judul: 'Skor Mengindikasikan Kemungkinan PTSD',
    deskripsi:
      'Hasil yang kamu peroleh menunjukkan adanya gejala stres pascatrauma yang cukup menonjol dan perlu mendapatkan perhatian lebih lanjut. Kamu mungkin mengalami perasaan takut, cemas, atau tidak nyaman yang berkaitan dengan pengalaman berat di masa lalu. Gejala tersebut juga dapat memengaruhi pikiran, perasaan, hubungan dengan orang lain, maupun aktivitas sehari-hari.\n\nPerlu diingat bahwa hasil ini belum merupakan diagnosis. Untuk memahami kondisi yang kamu alami secara lebih menyeluruh, diperlukan pemeriksaan dan wawancara lebih lanjut bersama psikolog. Melalui pendampingan tersebut, kamu dapat memperoleh bantuan yang sesuai dengan pengalaman dan kebutuhanmu.\n\nKamu tidak harus menghadapi semuanya sendirian. Pengalaman berat yang pernah terjadi tidak menentukan seluruh perjalanan hidupmu. Dengan dukungan dan penanganan yang tepat, kamu memiliki kesempatan untuk pulih, merasa lebih aman, dan kembali menjalani aktivitas dengan nyaman.',
  },
]

export async function seedCATS(prisma: PrismaClient) {
  console.log('\n--- Menyemai Master Data Alat Ukur CATS ---')

  // 1. Master Data AlatUkur
  const alatUkur = await prisma.alatUkur.upsert({
    where: { kode: 'CATS' },
    update: {
      nama: 'Child and Adolescent Trauma Screen (CATS)',
      kategori: 'Trauma & Gejala Stres Pascatrauma (PTSS/PTSD)',
    },
    create: {
      kode: 'CATS',
      nama: 'Child and Adolescent Trauma Screen (CATS)',
      kategori: 'Trauma & Gejala Stres Pascatrauma (PTSS/PTSD)',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkur.nama} (${alatUkur.kode})`)

  // 2. Produk Paket CATS (Gratis - Rp 0)
  console.log('\n--- Menyemai Produk Paket CATS (Gratis) ---')
  const judulPaket = 'Tes Pengalaman Traumatis dan Gejala Pascatrauma'
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaket },
        { judul: { contains: 'CATS', mode: 'insensitive' } },
        { judul: { contains: 'Traumatis', mode: 'insensitive' } },
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
      'Pengalaman yang menakutkan atau menyakitkan terkadang dapat meninggalkan dampak yang tidak mudah dilupakan. Tes ini membantu mengenali pengalaman yang berpotensi traumatis serta gejala pascatrauma yang mungkin dialami anak dan remaja. Tes ini juga melihat apakah pengalaman tersebut memengaruhi kehidupan sehari-hari, seperti aktivitas sekolah, hubungan dengan keluarga dan teman, serta hal-hal yang biasanya disukai.',
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

  // 3. 40 Butir Soal & Pilihan Jawaban
  for (const q of CATS_SOAL) {
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

    // Tentukan opsi yang sesuai untuk bagian soal ini
    const opsiList =
      q.kategori === 'GEJALA_PTSD' ? CATS_OPSI_GEJALA : CATS_OPSI_YA_TIDAK

    for (const opt of opsiList) {
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
  console.log(`    ✓ 40 Butir Soal & Opsi Jawaban CATS berhasil disemai`)

  // 4. Interpretasi Hasil Berdasarkan Cut-off Klinis Sesuai Handout
  for (const interp of CATS_INTERPRETASI) {
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
  console.log(`    ✓ Interpretasi Hasil CATS (3 Kategori) berhasil disemai`)

  return paket
}

// Eksekusi mandiri jika dijalankan langsung via tsx
if (process.argv[1]?.includes('seed-cats') || (typeof require !== 'undefined' && require.main === module)) {
  const prisma = new PrismaClient()
  seedCATS(prisma)
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

