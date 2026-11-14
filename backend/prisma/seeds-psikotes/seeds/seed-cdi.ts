import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

// ============================================================================
// DATA ALAT UKUR & PAKET CDI (CHILDREN'S DEPRESSION INVENTORY)
// Dikembangkan oleh Maria Kovacs (1992) untuk anak & remaja usia 7–19 tahun
// Total 27 Butir (3 pilihan per butir: skor 0, 1, atau 2). Rentang skor: 0–54.
// Ambang batas cut-off klinis >= 19.
// AKSES: GRATIS (Rp 0)
// ============================================================================

export interface CDISoalItem {
  no: number
  bahasan: string
  pertanyaan: string
  opsi: Array<{ label: string; text: string; bobot: number }>
}

export const CDI_SOAL: CDISoalItem[] = [
  // Nomor 1 (Negative Mood) - Kelompok 1: 0, 1, 2
  {
    no: 1,
    bahasan: 'Kesedihan',
    pertanyaan: 'Mengenai perasaan sedih:',
    opsi: [
      { label: '0', text: 'Aku kadang-kadang merasa sedih.', bobot: 0 },
      { label: '1', text: 'Aku sering merasa sedih.', bobot: 1 },
      { label: '2', text: 'Aku selalu merasa sedih.', bobot: 2 },
    ],
  },
  // Nomor 2* (Ineffectiveness) - Kelompok 2: 2, 1, 0
  {
    no: 2,
    bahasan: 'Harapan dan keberhasilan',
    pertanyaan: 'Mengenai harapan dan keberhasilanmu:',
    opsi: [
      { label: '0', text: 'Aku tidak pernah berhasil.', bobot: 2 },
      { label: '1', text: 'Aku tidak yakin apakah aku akan berhasil.', bobot: 1 },
      { label: '2', text: 'Biasanya aku berhasil.', bobot: 0 },
    ],
  },
  // Nomor 3 (Negative Mood) - Kelompok 1: 0, 1, 2
  {
    no: 3,
    bahasan: 'Rasa bersalah',
    pertanyaan: 'Mengenai cara kamu melakukan berbagai hal:',
    opsi: [
      { label: '0', text: 'Aku hampir selalu melakukan segala-galanya secara benar.', bobot: 0 },
      { label: '1', text: 'Aku melakukan banyak hal secara salah.', bobot: 1 },
      { label: '2', text: 'Aku melakukan segalanya secara salah.', bobot: 2 },
    ],
  },
  // Nomor 4 (Anhedonia) - Kelompok 1: 0, 1, 2
  {
    no: 4,
    bahasan: 'Kesenangan',
    pertanyaan: 'Mengenai hal-hal yang kamu senangi:',
    opsi: [
      { label: '0', text: 'Aku menyenangi banyak hal.', bobot: 0 },
      { label: '1', text: 'Aku menyenangi beberapa hal.', bobot: 1 },
      { label: '2', text: 'Aku tidak menyenangi apapun.', bobot: 2 },
    ],
  },
  // Nomor 5* (Interpersonal Problems) - Kelompok 2: 2, 1, 0
  {
    no: 5,
    bahasan: 'Sikap baik/tidak',
    pertanyaan: 'Mengenai perilakumu terhadap orang lain:',
    opsi: [
      { label: '0', text: 'Aku selalu tidak baik.', bobot: 2 },
      { label: '1', text: 'Aku sering tidak baik.', bobot: 1 },
      { label: '2', text: 'Aku kadang-kadang tidak baik.', bobot: 0 },
    ],
  },
  // Nomor 6 (Negative Mood) - Kelompok 1: 0, 1, 2
  {
    no: 6,
    bahasan: 'Kekhawatiran',
    pertanyaan: 'Mengenai pikiran tentang hal-hal buruk:',
    opsi: [
      { label: '0', text: 'Aku kadang-kadang memikirkan hal-hal yang buruk yang dapat menimpa diriku.', bobot: 0 },
      { label: '1', text: 'Aku cemas mengenai hal-hal buruk yang akan menimpa diriku.', bobot: 1 },
      { label: '2', text: 'Aku yakin bahwa hal yang buruk akan menimpa diriku.', bobot: 2 },
    ],
  },
  // Nomor 7* (Negative Self-Esteem) - Kelompok 2: 2, 1, 0
  {
    no: 7,
    bahasan: 'Perasaan terhadap diri',
    pertanyaan: 'Mengenai perasaan terhadap diri sendiri:',
    opsi: [
      { label: '0', text: 'Aku membenci diriku.', bobot: 2 },
      { label: '1', text: 'Aku tidak menyukai diriku.', bobot: 1 },
      { label: '2', text: 'Aku menyukai diriku.', bobot: 0 },
    ],
  },
  // Nomor 8* (Interpersonal Problems) - Kelompok 2: 2, 1, 0
  {
    no: 8,
    bahasan: 'Menyalahkan diri',
    pertanyaan: 'Mengenai hal-hal buruk yang terjadi di sekitarmu:',
    opsi: [
      { label: '0', text: 'Semua hal yang buruk adalah salah aku.', bobot: 2 },
      { label: '1', text: 'Banyak hal yang buruk adalah salah aku.', bobot: 1 },
      { label: '2', text: 'Hal-hal yang buruk biasanya bukan salah aku.', bobot: 0 },
    ],
  },
  // Nomor 9 (Negative Self-Esteem - Suicide Risk) - Kelompok 1: 0, 1, 2
  {
    no: 9,
    bahasan: 'Pikiran bunuh diri',
    pertanyaan: 'Mengenai pikiran tentang mengakhiri hidup:',
    opsi: [
      { label: '0', text: 'Aku tidak memikirkan untuk bunuh diri.', bobot: 0 },
      { label: '1', text: 'Aku memikirkan untuk bunuh diri tapi tak akan melakukannya.', bobot: 1 },
      { label: '2', text: 'Aku ingin bunuh diri.', bobot: 2 },
    ],
  },
  // Nomor 10* (Negative Mood) - Kelompok 2: 2, 1, 0
  {
    no: 10,
    bahasan: 'Keinginan menangis',
    pertanyaan: 'Mengenai keinginan untuk menangis:',
    opsi: [
      { label: '0', text: 'Setiap hari aku merasa ingin menangis.', bobot: 2 },
      { label: '1', text: 'Pada banyak hari aku merasa ingin menangis.', bobot: 1 },
      { label: '2', text: 'Kadang-kadang aku merasa ingin menangis.', bobot: 0 },
    ],
  },
  // Nomor 11* (Negative Mood) - Kelompok 2: 2, 1, 0
  {
    no: 11,
    bahasan: 'Perasaan diri disusahkan',
    pertanyaan: 'Mengenai perasaan diri disusahkan:',
    opsi: [
      { label: '0', text: 'Aku selalu merasa diri disusahkan.', bobot: 2 },
      { label: '1', text: 'Aku seringkali merasa diri disusahkan.', bobot: 1 },
      { label: '2', text: 'Aku kadang-kadang merasa diri disusahkan.', bobot: 0 },
    ],
  },
  // Nomor 12 (Interpersonal Problems) - Kelompok 1: 0, 1, 2
  {
    no: 12,
    bahasan: 'Penarikan diri',
    pertanyaan: 'Mengenai berada bersama orang lain:',
    opsi: [
      { label: '0', text: 'Aku senang berada bersama orang lain.', bobot: 0 },
      { label: '1', text: 'Aku sering merasa tidak senang berada bersama orang lain.', bobot: 1 },
      { label: '2', text: 'Aku sama sekali tidak senang berada bersama orang lain.', bobot: 2 },
    ],
  },
  // Nomor 13* (Negative Self-Esteem) - Kelompok 2: 2, 1, 0
  {
    no: 13,
    bahasan: 'Pengambilan keputusan',
    pertanyaan: 'Mengenai kemampuan mengambil keputusan:',
    opsi: [
      { label: '0', text: 'Aku tidak bisa mengambil keputusan.', bobot: 2 },
      { label: '1', text: 'Aku sulit memutuskan sesuatu.', bobot: 1 },
      { label: '2', text: 'Aku mudah untuk memutuskan sesuatu.', bobot: 0 },
    ],
  },
  // Nomor 14 (Negative Self-Esteem) - Kelompok 1: 0, 1, 2
  {
    no: 14,
    bahasan: 'Penampilan',
    pertanyaan: 'Mengenai penampilan fisik dirimu:',
    opsi: [
      { label: '0', text: 'Penampilan aku baik.', bobot: 0 },
      { label: '1', text: 'Ada beberapa hal pada penampilan aku yang tidak baik.', bobot: 1 },
      { label: '2', text: 'Penampilan aku buruk.', bobot: 2 },
    ],
  },
  // Nomor 15* (Ineffectiveness) - Kelompok 2: 2, 1, 0
  {
    no: 15,
    bahasan: 'Mengerjakan PR',
    pertanyaan: 'Mengenai membuat tugas sekolah atau PR:',
    opsi: [
      { label: '0', text: 'Aku selalu harus memaksa diri untuk membuat PR.', bobot: 2 },
      { label: '1', text: 'Aku seringkali harus memaksa diri untuk membuat PR.', bobot: 1 },
      { label: '2', text: 'Mengerjakan PR bagiku bukan masalah besar.', bobot: 0 },
    ],
  },
  // Nomor 16* (Anhedonia) - Kelompok 2: 2, 1, 0
  {
    no: 16,
    bahasan: 'Pola tidur',
    pertanyaan: 'Mengenai pola tidur di malam hari:',
    opsi: [
      { label: '0', text: 'Aku sulit tidur setiap malam.', bobot: 2 },
      { label: '1', text: 'Aku sulit tidur pada banyak malam.', bobot: 1 },
      { label: '2', text: 'Aku tidur cukup baik.', bobot: 0 },
    ],
  },
  // Nomor 17 (Anhedonia) - Kelompok 1: 0, 1, 2
  {
    no: 17,
    bahasan: 'Kepenatan',
    pertanyaan: 'Mengenai rasa lelah dan tingkat energimu:',
    opsi: [
      { label: '0', text: 'Kadang aku merasa lelah.', bobot: 0 },
      { label: '1', text: 'Pada banyak hari aku merasa lelah.', bobot: 1 },
      { label: '2', text: 'Setiap saat aku merasa lelah.', bobot: 2 },
    ],
  },
  // Nomor 18* (Anhedonia) - Kelompok 2: 2, 1, 0
  {
    no: 18,
    bahasan: 'Nafsu makan',
    pertanyaan: 'Mengenai nafsu makanmu:',
    opsi: [
      { label: '0', text: 'Hampir setiap hari aku tidak ingin makan.', bobot: 2 },
      { label: '1', text: 'Pada banyak hari aku merasa tidak ingin makan.', bobot: 1 },
      { label: '2', text: 'Aku makan cukup baik.', bobot: 0 },
    ],
  },
  // Nomor 19 (Anhedonia) - Kelompok 1: 0, 1, 2
  {
    no: 19,
    bahasan: 'Rasa sakit',
    pertanyaan: 'Mengenai rasa cemas tentang nyeri dan rasa sakit:',
    opsi: [
      { label: '0', text: 'Aku tidak cemas mengenai nyeri dan rasa sakit.', bobot: 0 },
      { label: '1', text: 'Aku seringkali cemas mengenai nyeri dan rasa sakit.', bobot: 1 },
      { label: '2', text: 'Aku selalu cemas mengenai nyeri dan rasa sakit.', bobot: 2 },
    ],
  },
  // Nomor 20 (Anhedonia) - Kelompok 1: 0, 1, 2
  {
    no: 20,
    bahasan: 'Perasaan sendirian',
    pertanyaan: 'Mengenai perasaan sendirian:',
    opsi: [
      { label: '0', text: 'Aku tidak merasa sendirian.', bobot: 0 },
      { label: '1', text: 'Aku sering merasa sendirian.', bobot: 1 },
      { label: '2', text: 'Aku selalu merasa sendirian.', bobot: 2 },
    ],
  },
  // Nomor 21* (Anhedonia) - Kelompok 2: 2, 1, 0
  {
    no: 21,
    bahasan: 'Perasaan senang di sekolah',
    pertanyaan: 'Mengenai perasaan senang di sekolah:',
    opsi: [
      { label: '0', text: 'Aku tidak pernah merasa senang di sekolah.', bobot: 2 },
      { label: '1', text: 'Aku kadang-kadang merasa senang di sekolah.', bobot: 1 },
      { label: '2', text: 'Aku sering merasa senang di sekolah.', bobot: 0 },
    ],
  },
  // Nomor 22 (Anhedonia) - Kelompok 1: 0, 1, 2
  {
    no: 22,
    bahasan: 'Pertemanan',
    pertanyaan: 'Mengenai hubungan pertemananmu:',
    opsi: [
      { label: '0', text: 'Aku punya banyak teman.', bobot: 0 },
      { label: '1', text: 'Aku punya beberapa teman tapi ingin punya lebih banyak.', bobot: 1 },
      { label: '2', text: 'Aku tidak punya teman.', bobot: 2 },
    ],
  },
  // Nomor 23 (Ineffectiveness) - Kelompok 1: 0, 1, 2
  {
    no: 23,
    bahasan: 'Pekerjaan sekolah',
    pertanyaan: 'Mengenai hasil pekerjaan atau tugas sekolah:',
    opsi: [
      { label: '0', text: 'Hasil pekerjaan sekolah aku baik.', bobot: 0 },
      { label: '1', text: 'Hasil pekerjaan sekolah aku tidak sebaik dulu.', bobot: 1 },
      { label: '2', text: 'Hasil pekerjaan sekolah aku buruk dalam mata pelajaran yang dulu aku kuasai.', bobot: 2 },
    ],
  },
  // Nomor 24* (Ineffectiveness) - Kelompok 2: 2, 1, 0
  {
    no: 24,
    bahasan: 'Kemampuan dibanding anak lain',
    pertanyaan: 'Mengenai kemampuanmu dibandingkan anak lain:',
    opsi: [
      { label: '0', text: 'Aku tidak akan pernah sebaik anak lain.', bobot: 2 },
      { label: '1', text: 'Aku bisa sebaik anak lain bila aku mau.', bobot: 1 },
      { label: '2', text: 'Aku sama baiknya dengan anak lain.', bobot: 0 },
    ],
  },
  // Nomor 25* (Negative Self-Esteem) - Kelompok 2: 2, 1, 0
  {
    no: 25,
    bahasan: 'Perasaan dicintai',
    pertanyaan: 'Mengenai perasaan dicintai oleh orang lain:',
    opsi: [
      { label: '0', text: 'Tak seorang pun benar-benar mencintai aku.', bobot: 2 },
      { label: '1', text: 'Aku tidak yakin apakah ada seseorang yang mencintai aku.', bobot: 1 },
      { label: '2', text: 'Aku yakin bahwa ada orang yang mencintai aku.', bobot: 0 },
    ],
  },
  // Nomor 26 (Negative Mood) - Kelompok 1: 0, 1, 2
  {
    no: 26,
    bahasan: 'Melakukan yang disuruh',
    pertanyaan: 'Mengenai melakukan apa yang disuruh:',
    opsi: [
      { label: '0', text: 'Aku biasanya melakukan apa yang disuruh.', bobot: 0 },
      { label: '1', text: 'Aku sering tidak melakukan apa yang disuruh.', bobot: 1 },
      { label: '2', text: 'Aku tidak pernah melakukan apa yang disuruh.', bobot: 2 },
    ],
  },
  // Nomor 27 (Interpersonal Problems) - Kelompok 1: 0, 1, 2
  {
    no: 27,
    bahasan: 'Pergaulan',
    pertanyaan: 'Mengenai pergaulan dengan anak lain:',
    opsi: [
      { label: '0', text: 'Aku dapat bergaul dengan anak lain.', bobot: 0 },
      { label: '1', text: 'Aku seringkali terlibat perkelahian.', bobot: 1 },
      { label: '2', text: 'Aku hampir selalu terlibat dalam perkelahian.', bobot: 2 },
    ],
  },
]

export const CDI_INTERPRETASI = [
  {
    min_skor: 0,
    max_skor: 18,
    grade: 'Depresi Normal / Wajar',
    judul: 'Tingkat Depresi Berada dalam Batas Wajar',
    deskripsi:
      'Skor yang kamu peroleh menunjukkan bahwa gejala depresi berada dalam batas normal dan tidak mengindikasikan adanya sindrom depresi yang bermakna secara klinis. Kondisi suasana hati, interaksi sosial, efektivitas belajar, minat beraktivitas, serta penilaian terhadap diri sendiri secara umum berada dalam rentang wajar anak dan remaja. Naik turunnya emosi sesekali merupakan bagian wajar dari pertumbuhan. Tetap jaga komunikasi terbuka dengan orang tua dan teman sebaya, serta rawat pola istirahat dan kegiatan yang positif. Hasil ini merupakan skrining awal kondisi emosional anak/remaja dan bukan diagnosis medis mutlak.',
    tips: [
      'Pertahankan komunikasi terbuka dengan orang tua, guru, atau teman sebaya mengenai apa yang kamu rasakan.',
      'Lakukan kegiatan atau hobi yang menyenangkan untuk menjaga suasana hati dan menyalurkan energi secara positif.',
      'Jaga pola tidur teratur dan asupan makanan bergizi untuk mendukung kesehatan fisik dan konsentrasi belajar.',
      'Tetap kembangkan rasa percaya diri dan hargai setiap usaha atau pencapaian kecil yang kamu raih.',
      'Ceritakan kepada orang yang kamu percaya jika sesekali merasa sedih atau menghadapi masalah yang berat.',
    ],
  },
  {
    min_skor: 19,
    max_skor: 54,
    grade: 'Depresi Bermakna Klinis',
    judul: 'Kecenderungan Depresi Bermakna Secara Klinis (Perlu Perhatian)',
    deskripsi:
      'Skor yang kamu peroleh mencapai ambang batas klinis (skor ≥ 19), yang mengindikasikan kemungkinan adanya sindrom depresi yang bermakna pada anak atau remaja. Kondisi ini dapat terlihat dari perasaan sedih atau murung yang sering muncul, penurunan minat dan kesenangan dalam beraktivitas (anhedonia), penurunan motivasi atau rasa tidak mampu di sekolah, kesulitan dalam bergaul, serta pandangan negatif terhadap diri sendiri. Hasil ini merupakan skrining awal dan bukan diagnosis medis mutlak. Sangat disarankan untuk berkonsultasi lebih lanjut dengan psikolog klinis anak/remaja atau psikiater agar mendapatkan evaluasi komprehensif dan pendampingan yang tepat.',
    tips: [
      'Sangat disarankan untuk berkonsultasi dengan profesional psikolog anak/remaja atau psikiater untuk evaluasi komprehensif.',
      'Ceritakan apa yang kamu rasakan kepada orang tua, wali, atau guru yang kamu percaya agar mendapatkan dukungan emosional.',
      'Hindari memendam beban perasaan sendirian; kehadiran dan dukungan lingkungan terdekat sangat berarti.',
      'Berikan ruang bagi diri sendiri untuk beristirahat dan jangan terlalu menyalahkan diri sendiri atas kesulitan yang dialami.',
      'Jika muncul perasaan ingin menyakiti diri sendiri atau keputusasaan berat, segera hubungi orang dewasa terdekat atau layanan krisis kesehatan mental.',
    ],
  },
]

export async function seedCDI(prisma: PrismaClient) {
  console.log("\n--- Menyemai Master Data Alat Ukur CDI ---")

  // 1. Master Data AlatUkur
  const alatUkur = await prisma.alatUkur.upsert({
    where: { kode: 'CDI' },
    update: {
      nama: "Children's Depression Inventory (CDI)",
      kategori: 'Depresi Anak & Remaja',
    },
    create: {
      kode: 'CDI',
      nama: "Children's Depression Inventory (CDI)",
      kategori: 'Depresi Anak & Remaja',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkur.nama} (${alatUkur.kode})`)

  // 2. Produk Paket CDI (Gratis - Rp 0)
  console.log('\n--- Menyemai Produk Paket CDI (Gratis) ---')
  const judulPaket = 'Tes Depresi Anak dan Remaja'
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaket },
        { judul: { contains: 'CDI', mode: 'insensitive' } },
        { judul: { contains: 'Depresi Anak', mode: 'insensitive' } },
        { id_alat_ukur: alatUkur.id },
      ],
    },
  })

  const paketPayload = {
    judul: judulPaket,
    id_alat_ukur: alatUkur.id,
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: '/images/psikotes/banner-depresi.jpg',
    tentang_tes:
      'Perasaan sedih, kehilangan semangat, atau merasa kurang percaya diri bisa menjadi pengalaman yang tidak mudah untuk diungkapkan. Tes ini membantu mengenali berbagai pengalaman emosional pada anak dan remaja, mulai dari suasana hati negatif, hubungan dengan orang lain, perasaan tidak mampu, kehilangan minat, hingga cara mereka memandang diri sendiri.',
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
  console.log(`    ✓ Paket: ${paket.judul} (Gratis - Rp 0)`)

  // 3. 27 Butir Soal & 81 Pilihan Jawaban
  console.log('\n--- Menyemai 27 Butir Soal & 81 Pilihan Jawaban CDI ---')
  for (const q of CDI_SOAL) {
    let soal = await prisma.soalPsikotes.findFirst({
      where: { id_paket: paket.id, urutan: q.no },
    })

    if (soal) {
      soal = await prisma.soalPsikotes.update({
        where: { id: soal.id },
        data: { pertanyaan: q.pertanyaan },
      })
    } else {
      soal = await prisma.soalPsikotes.create({
        data: {
          id_paket: paket.id,
          urutan: q.no,
          pertanyaan: q.pertanyaan,
        },
      })
    }

    for (const opt of q.opsi) {
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
  console.log(`    ✓ 27 Soal & 81 Opsi Jawaban CDI berhasil disemai`)

  // 4. Rentang Interpretasi Psikotes (Cut-off < 19 vs >= 19)
  console.log('\n--- Menyemai Interpretasi Skor CDI ---')
  for (const interp of CDI_INTERPRETASI) {
    const existing = await prisma.interpretasiPsikotes.findFirst({
      where: {
        id_paket: paket.id,
        min_skor: interp.min_skor,
        max_skor: interp.max_skor,
      },
    })

    if (existing) {
      await prisma.interpretasiPsikotes.update({
        where: { id: existing.id },
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
  console.log(`    ✓ Interpretasi skor CDI (<19 vs >=19) berhasil disemai`)
  return paket
}

// Eksekusi mandiri jika dijalankan langsung via tsx
if (require.main === module) {
  const prisma = new PrismaClient()
  seedCDI(prisma)
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
