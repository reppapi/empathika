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
    text: 'Ditampar, ditinju, atau dipukuli oleh keluarganya sendiri.',
  },
  {
    no: 5,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Ditampar, ditinju, atau dipukuli oleh seseorang yang bukan anggota keluarganya.',
  },
  {
    no: 6,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Melihat seseorang di keluarganya sedang ditampar, ditinju, atau dipukuli.',
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
    text: 'Seseorang yang lebih tua menyentuh bagian intim anak (misal : alat kelamin, pantat, payudara) padahal seharusnya tidak boleh.',
  },
  {
    no: 9,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Seseorang memaksa atau menekan anak untuk melakukan hubungan intim / seksual, ketika anak sulit mengatakan tidak.',
  },
  {
    no: 10,
    kategori: 'PTE',
    klaster: 'Kriteria A',
    text: 'Seseorang yang dekat dengannya meninggal tiba-tiba atau karena tindak kekerasan.',
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
    text: 'Prosedur medis yang membuat anak stres atau menakutkannya.',
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
    text: 'Peristiwa yang membuat anak stres atau menakutkan lainnya.',
  },

  // --- BAGIAN 2: 20 BUTIR GEJALA PTSD DSM-5 (NOMOR 16–35) ---
  // Kriteria B: Intrusi / Gangguan (Butir 16–20 / Gejala 1–5)
  {
    no: 16,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Pikiran atau gambaran yang menjengkelkan tentang peristiwa yang membuatnya stres. Atau memerankan kembali peristiwa yang membuatnya stres dalam permainan.',
  },
  {
    no: 17,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Memiliki mimpi buruk terkait dengan peristiwa yang membuatnya stres.',
  },
  {
    no: 18,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Bertindak, bermain, atau merasa seolah-olah peristiwa yang membuatnya stres sedang terjadi saat ini.',
  },
  {
    no: 19,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Merasa sangat kesal secara emosional ketika diingatkan tentang peristiwa yang membuatnya stres.',
  },
  {
    no: 20,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria B: Intrusi',
    text: 'Reaksi fisik yang kuat ketika diingatkan akan peristiwa yang membuatnya stres (berkeringat, jantung berdebar kencang, sakit perut).',
  },

  // Kriteria C: Penghindaran (Butir 21–22 / Gejala 6–7)
  {
    no: 21,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria C: Penghindaran',
    text: 'Berusaha untuk tidak mengingat, memikirkan, atau memiliki perasaan tentang peristiwa yang membuatnya stres.',
  },
  {
    no: 22,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria C: Penghindaran',
    text: 'Menjauhi apa pun yang mengingatkan dia tentang peristiwa yang membuatnya stres (aktivitas, orang, tempat, benda, pembicaraan).',
  },

  // Kriteria D: Kognisi & Suasana Hati Negatif (Butir 23–29 / Gejala 8–14)
  {
    no: 23,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Tidak mampu mengingat bagian penting dari peristiwa yang membuatnya stres.',
  },
  {
    no: 24,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Perubahan negatif dalam cara dia berpikir tentang dirinya, orang lain, atau dunianya setelah peristiwa yang membuatnya stres. Misal: “Aku tidak akan memiliki kehidupan yang baik, tidak ada yang bisa dipercaya, seluruh dunia tidak aman.”',
  },
  {
    no: 25,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Memikirkan peristiwa yang membuatnya stres terjadi karena dia atau orang lain melakukan sesuatu yang salah atau tidak cukup berbuat sesuatu untuk menghentikannya.',
  },
  {
    no: 26,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Memiliki perasaan yang sangat negatif (takut, marah, bersalah, malu).',
  },
  {
    no: 27,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Kehilangan minat pada aktivitas yang dia nikmati sebelum peristiwa yang membuatnya stres.',
  },
  {
    no: 28,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Merasa jauh atau terputus dari orang-orang di sekitarnya.',
  },
  {
    no: 29,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria D: Kognisi & Mood',
    text: 'Tidak menunjukkan perasaan positif (menjadi bahagia, memiliki perasaan cinta).',
  },

  // Kriteria E: Hyperarousal & Reaktivitas (Butir 30–35 / Gejala 15–20)
  {
    no: 30,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Menjadi mudah tersinggung. Atau meluapkan amarah tanpa alasan yang jelas dan melampiaskannya pada orang atau benda lain.',
  },
  {
    no: 31,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Perilaku berisiko atau perilaku yang dapat merugikannya.',
  },
  {
    no: 32,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Menjadi terlalu waspada atau siap-siaga.',
  },
  {
    no: 33,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Menjadi gelisah atau mudah terkejut.',
  },
  {
    no: 34,
    kategori: 'GEJALA_PTSD',
    klaster: 'Kriteria E: Hyperarousal',
    text: 'Kesulitan dalam berkonsentrasi.',
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
    text: 'Masalah yang dialami mengganggu: Pergaulannya dengan orang lain.',
  },
  {
    no: 37,
    kategori: 'FUNGSI_PSIKOSOSIAL',
    klaster: 'Fungsi Psikososial',
    text: 'Masalah yang dialami mengganggu: Hobi / kesenangannya.',
  },
  {
    no: 38,
    kategori: 'FUNGSI_PSIKOSOSIAL',
    klaster: 'Fungsi Psikososial',
    text: 'Masalah yang dialami mengganggu: Sekolahnya.',
  },
  {
    no: 39,
    kategori: 'FUNGSI_PSIKOSOSIAL',
    klaster: 'Fungsi Psikososial',
    text: 'Masalah yang dialami mengganggu: Hubungan dengan keluarganya.',
  },
  {
    no: 40,
    kategori: 'FUNGSI_PSIKOSOSIAL',
    klaster: 'Fungsi Psikososial',
    text: 'Masalah yang dialami mengganggu: Kebahagiaannya secara umum.',
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
      'Tingkat gejala stres pascatrauma berada dalam rentang normal dan tidak menunjukkan peningkatan klinis yang bermakna. Anak atau remaja menunjukkan daya lenting (resiliensi) yang adaptif dalam menghadapi tekanan atau peristiwa sulit.',
    tips: [
      'Tinjauan singkat hasilnya dengan klien dan caregiver.',
      'Lakukan validasi perasaan anak, normalisasi emosi, dan berikan rasa aman serta keyakinan.',
      'Berikan bimbingan antisipatif dan pertahankan pola komunikasi yang hangat dan terbuka di keluarga.',
    ],
  },
  {
    min_skor: 15,
    max_skor: 20,
    grade: 'Distres level menengah terkait trauma',
    judul: 'Distres Tingkat Menengah Terkait Trauma',
    deskripsi:
      'Terdeteksi adanya distres tingkat menengah yang berhubungan dengan pengalaman peristiwa traumatis atau menakutkan. Meskipun belum memenuhi kriteria penuh kemungkinan PTSD, gejala yang muncul dapat membebani kenyamanan emosional anak.',
    tips: [
      'Tinjau hasilnya secara hati-hati bersama klien dan caregiver.',
      'Validasi emosi anak, normalisasi perasaan, dan yakinkan bahwa respons stres wajar terjadi setelah peristiwa berat.',
      'Berikan psikoedukasi tentang trauma dan ajarkan tips coping adaptif (seperti teknik relaksasi napas, grounding 5-4-3-2-1, dan jurnal emosi).',
      'Sampaikan harapan bahwa banyak anak bisa pulih secara alami dengan dukungan lingkungan terdekat.',
      'Tawarkan terapi khusus trauma jika dibutuhkan atau apabila gejala menetap.',
    ],
  },
  {
    min_skor: 21,
    max_skor: 60,
    grade: 'Kemungkinan PTSD',
    judul: 'Skor Mengindikasikan Kemungkinan PTSD',
    deskripsi:
      'Skor gejala mencapai ambang batas klinis (skor ≥ 21), yang mengindikasikan kemungkinan adanya Post-Traumatic Stress Disorder (PTSD) atau reaksi stres pascatrauma yang signifikan pada anak atau remaja. Kondisi ini ditandai dengan ingatan mengganggu yang berulang, kecenderungan menghindar, perubahan negatif suasana hati, serta peningkatan kewaspadaan.',
    tips: [
      'Tinjau hasilnya secara hati-hati bersama klien dan lakukan wawancara diagnostik PTSD klinis lanjutan semi-terstruktur.',
      'Lakukan validasi dan normalisasi perasaan anak tanpa memaksanya menceritakan detail kejadian traumatis sebelum merasa aman.',
      'Sampaikan harapan positif mengenai pemulihan bahwa gejala stres pascatrauma dapat ditangani secara efektif melalui bantuan profesional.',
      'Sangat disarankan untuk mempertimbangkan Trauma-Focused Cognitive Behavioral Therapy (TF-CBT) atau terapi khusus trauma berbasis bukti lainnya bersama psikolog anak/remaja.',
    ],
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
    banner_url: '/images/psikotes/banner-cats.jpg',
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

