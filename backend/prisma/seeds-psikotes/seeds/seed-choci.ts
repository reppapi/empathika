import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

// ============================================================================
// DATA ALAT UKUR & PAKET CHOCI-R (CHILDREN'S OBSESSIVE-COMPULSIVE INVENTORY – REVISED)
// Dikembangkan oleh Roz Shafran et al. (2003)
// Sasaran: Anak & Remaja usia 7–17 tahun
// Total 38 Butir:
// - Bagian A (Kompulsi): Butir 1–10 (Gejala 0–2), 11–13 (Isian), 14–19 (Keparahan 0–4)
// - Bagian B (Obsesi)  : Butir 20–29 (Gejala 0–2), 30–32 (Isian), 33–38 (Keparahan 0–4)
// Skor Komposit:
// - Total Symptoms Score (0–40)
// - Total Impairment Score (0–48)
// AKSES: GRATIS (Rp 0)
// ============================================================================

export interface CHOCISoalItem {
  no: number
  kategori: 'KOMPULSI_GEJALA' | 'KOMPULSI_ISIAN' | 'KOMPULSI_KEPARAHAN' | 'OBSESI_GEJALA' | 'OBSESI_ISIAN' | 'OBSESI_KEPARAHAN'
  klaster: string
  text: string
  opsi: Array<{ label: string; text: string; bobot: number }>
}

// Opsi Standar 3 Pilihan Gejala (0–2)
export const CHOCI_OPSI_GEJALA = [
  { label: '0', text: 'Tidak', bobot: 0 },
  { label: '1', text: 'Sedikit', bobot: 1 },
  { label: '2', text: 'Banyak', bobot: 2 },
]

// Opsi Butir Isian Refleksi Kualitatif (Bobot 0)
export const CHOCI_OPSI_ISIAN = [
  { label: '0', text: 'Tidak ada kebiasaan/pikiran khusus', bobot: 0 },
  { label: '1', text: 'Ada kebiasaan/pikiran ini', bobot: 0 },
]

export const CHOCI_SOAL: CHOCISoalItem[] = [
  // --- BAGIAN A: KOMPULSI (1–19) ---
  // Gejala Kompulsi (1–10, Skala 0–2)
  {
    no: 1,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Aku menghabiskan terlalu banyak waktu untuk mencuci tangan berulang kali.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 2,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Aku merasa harus melakukan hal-hal biasa / sehari-hari dengan cara yang persis sama, setiap kali aku melakukannya.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 3,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Aku menghabiskan banyak waktu setiap hari untuk memeriksa sesuatu berulang-ulang.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 4,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Aku sering mengalami kesulitan menyelesaikan sesuatu, karena aku harus memastikan bahwa semuanya benar.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 5,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Aku menghabiskan terlalu banyak waktu untuk mengatur barang-barangku.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 6,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Aku butuh seseorang untuk memberitahuku berulang kali bahwa semuanya baik-baik saja.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 7,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Jika aku menyentuh sesuatu dengan satu tangan, aku merasa harus menyentuh hal yang sama dengan tangan yang lain, untuk membuat semuanya merata dan setara.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 8,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Aku selalu menghitung, bahkan ketika melakukan hal-hal biasa.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 9,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Jika aku memiliki "pikiran buruk", aku harus selalu memastikan bahwa aku segera memiliki "pikiran baik" untuk melawannya.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 10,
    kategori: 'KOMPULSI_GEJALA',
    klaster: 'Compulsion Symptoms',
    text: 'Aku sering sangat terlambat, karena aku terus mengulangi tindakan yang sama, lagi dan lagi.',
    opsi: CHOCI_OPSI_GEJALA,
  },

  // Isian Kualitatif 3 Kebiasaan Kompulsi (11–13, Bobot 0)
  {
    no: 11,
    kategori: 'KOMPULSI_ISIAN',
    klaster: 'Compulsion Notes',
    text: 'Kebiasaan 1 yang paling menjengkelkan yang menurut kamu harus dilakukan dan tidak bisa dihentikan (misalnya: sering mencuci tangan, mengulangi tindakan, atau memeriksa pintu/jendela).',
    opsi: CHOCI_OPSI_ISIAN,
  },
  {
    no: 12,
    kategori: 'KOMPULSI_ISIAN',
    klaster: 'Compulsion Notes',
    text: 'Kebiasaan 2 yang paling menjengkelkan yang menurut kamu harus dilakukan dan tidak bisa dihentikan.',
    opsi: CHOCI_OPSI_ISIAN,
  },
  {
    no: 13,
    kategori: 'KOMPULSI_ISIAN',
    klaster: 'Compulsion Notes',
    text: 'Kebiasaan 3 yang paling menjengkelkan yang menurut kamu harus dilakukan dan tidak bisa dihentikan.',
    opsi: CHOCI_OPSI_ISIAN,
  },

  // Keparahan Kompulsi (14–19, Skala 0–4)
  {
    no: 14,
    kategori: 'KOMPULSI_KEPARAHAN',
    klaster: 'Compulsion Severity',
    text: 'Berapa banyak waktu yang kamu habiskan untuk melakukan kebiasaan ini?',
    opsi: [
      { label: '0', text: 'Tidak ada', bobot: 0 },
      { label: '1', text: 'Kurang dari 1 jam sehari (kadang-kadang)', bobot: 1 },
      { label: '2', text: '1-3 jam sehari (sekitar pagi atau sore hari)', bobot: 2 },
      { label: '3', text: '3-8 jam sehari (sekitar separuh waktu kamu dalam kondisi bangun)', bobot: 3 },
      { label: '4', text: 'Lebih dari 8 jam sehari (hampir sepanjang waktu kamu dalam kondisi bangun)', bobot: 4 },
    ],
  },
  {
    no: 15,
    kategori: 'KOMPULSI_KEPARAHAN',
    klaster: 'Compulsion Severity',
    text: 'Seberapa besar kebiasaan ini menghalangi kamu bersekolah atau melakukan sesuatu dengan teman-teman kamu?',
    opsi: [
      { label: '0', text: 'Tidak sama sekali', bobot: 0 },
      { label: '1', text: 'Sedikit', bobot: 1 },
      { label: '2', text: 'Agak', bobot: 2 },
      { label: '3', text: 'Banyak', bobot: 3 },
      { label: '4', text: 'Hampir selalu', bobot: 4 },
    ],
  },
  {
    no: 16,
    kategori: 'KOMPULSI_KEPARAHAN',
    klaster: 'Compulsion Severity',
    text: 'Bagaimana perasaan kamu jika dicegah dari melakukan kebiasaan ini? Seberapa kesal kamu nantinya?',
    opsi: [
      { label: '0', text: 'Tidak sama sekali', bobot: 0 },
      { label: '1', text: 'Sedikit', bobot: 1 },
      { label: '2', text: 'Agak', bobot: 2 },
      { label: '3', text: 'Banyak', bobot: 3 },
      { label: '4', text: 'Benar-benar', bobot: 4 },
    ],
  },
  {
    no: 17,
    kategori: 'KOMPULSI_KEPARAHAN',
    klaster: 'Compulsion Severity',
    text: 'Seberapa banyak kamu mencoba melawan kebiasaan yang menjengkelkan ini?',
    opsi: [
      { label: '0', text: 'Aku selalu berusaha melawan', bobot: 0 },
      { label: '1', text: 'Aku mencoba melawan di sebagian besar waktu', bobot: 1 },
      { label: '2', text: 'Aku melakukan beberapa usaha untuk melawan', bobot: 2 },
      { label: '3', text: 'Meskipun aku ingin, aku tidak mencoba untuk melawan', bobot: 3 },
      { label: '4', text: 'Aku tidak melawan sama sekali', bobot: 4 },
    ],
  },
  {
    no: 18,
    kategori: 'KOMPULSI_KEPARAHAN',
    klaster: 'Compulsion Severity',
    text: 'Seberapa kuat perasaan bahwa kamu harus menjalankan kebiasaan ini?',
    opsi: [
      { label: '0', text: 'Tidak kuat', bobot: 0 },
      { label: '1', text: 'Desakan yang ringan untuk melakukan kebiasaan', bobot: 1 },
      { label: '2', text: 'Desakan yang kuat untuk melakukan kebiasaan, sulit dikendalikan', bobot: 2 },
      { label: '3', text: 'Desakan yang sangat kuat untuk melakukan kebiasaan, sangat sulit dikendalikan', bobot: 3 },
      { label: '4', text: 'Desakan yang ekstrim untuk melakukan kebiasaan, tidak mungkin dikendalikan', bobot: 4 },
    ],
  },
  {
    no: 19,
    kategori: 'KOMPULSI_KEPARAHAN',
    klaster: 'Compulsion Severity',
    text: 'Seberapa sering kamu menghindari melakukan sesuatu, pergi ke suatu tempat atau bersama siapapun karena kebiasaan menjengkelkan kamu ini?',
    opsi: [
      { label: '0', text: 'Tidak sama sekali', bobot: 0 },
      { label: '1', text: 'Sedikit', bobot: 1 },
      { label: '2', text: 'Agak', bobot: 2 },
      { label: '3', text: 'Banyak', bobot: 3 },
      { label: '4', text: 'Hampir selalu', bobot: 4 },
    ],
  },

  // --- BAGIAN B: OBSESI (20–38) ---
  // Gejala Obsesi (20–29, Skala 0–2)
  {
    no: 20,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Aku tidak bisa memberhentikan pikiran menjengkelkan tentang kecelakaan.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 21,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Aku sering memiliki pikiran buruk yang membuatku merasa seperti orang yang buruk.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 22,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Pikiran menjengkelkan tentang keluargaku yang terluka berputar-putar di kepalaku dan menghentikan aku untuk berkonsentrasi.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 23,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Aku selalu memiliki keraguan besar tentang apakah aku telah membuat keputusan yang tepat, bahkan tentang hal-hal kecil yang bodoh.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 24,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Aku tidak bisa memberhentikan pikiran menjengkelkan tentang kematian yang terus berputar di kepalaku, lagi dan lagi.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 25,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Aku sering memiliki pikiran jahat tentang orang lain yang aku rasa buruk, lagi dan lagi.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 26,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Aku sering memiliki pikiran buruk tentang menjadi gila.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 27,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Aku terus memiliki pikiran menakutkan, bahwa sesuatu yang buruk akan terjadi, dan itu akan menjadi kesalahanku.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 28,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Aku sangat takut, bahwa aku akan memikirkan sesuatu (atau melakukan sesuatu) yang akan membuat Tuhan marah.',
    opsi: CHOCI_OPSI_GEJALA,
  },
  {
    no: 29,
    kategori: 'OBSESI_GEJALA',
    klaster: 'Obsession Symptoms',
    text: 'Aku selalu khawatir bahwa pikiran jahatku tentang orang lain sama jahatnya dengan melakukan hal-hal jahat.',
    opsi: CHOCI_OPSI_GEJALA,
  },

  // Isian Kualitatif 3 Pikiran Obsesi (30–32, Bobot 0)
  {
    no: 30,
    kategori: 'OBSESI_ISIAN',
    klaster: 'Obsession Notes',
    text: 'Pikiran 1 paling mengganggu yang sering kamu miliki dan tidak bisa dihentikan (misalnya: berpikir tentang menyakiti seseorang, atau memikirkan hal-hal buruk tentang Tuhan).',
    opsi: CHOCI_OPSI_ISIAN,
  },
  {
    no: 31,
    kategori: 'OBSESI_ISIAN',
    klaster: 'Obsession Notes',
    text: 'Pikiran 2 paling mengganggu yang sering kamu miliki dan tidak bisa dihentikan.',
    opsi: CHOCI_OPSI_ISIAN,
  },
  {
    no: 32,
    kategori: 'OBSESI_ISIAN',
    klaster: 'Obsession Notes',
    text: 'Pikiran 3 paling mengganggu yang sering kamu miliki dan tidak bisa dihentikan.',
    opsi: CHOCI_OPSI_ISIAN,
  },

  // Keparahan Obsesi (33–38, Skala 0–4)
  {
    no: 33,
    kategori: 'OBSESI_KEPARAHAN',
    klaster: 'Obsession Severity',
    text: 'Berapa banyak waktu yang kamu habiskan untuk memikirkan hal-hal ini?',
    opsi: [
      { label: '0', text: 'Tidak ada', bobot: 0 },
      { label: '1', text: 'Kurang dari 1 jam sehari (kadang-kadang)', bobot: 1 },
      { label: '2', text: '1-3 jam sehari (sekitar pagi atau sore hari)', bobot: 2 },
      { label: '3', text: '3-8 jam sehari (sekitar separuh waktu kamu dalam kondisi bangun)', bobot: 3 },
      { label: '4', text: 'Lebih dari 8 jam sehari (hampir sepanjang waktu kamu dalam kondisi bangun)', bobot: 4 },
    ],
  },
  {
    no: 34,
    kategori: 'OBSESI_KEPARAHAN',
    klaster: 'Obsession Severity',
    text: 'Seberapa banyak pikiran ini menghalangi kamu bersekolah atau melakukan sesuatu dengan teman-teman kamu?',
    opsi: [
      { label: '0', text: 'Tidak sama sekali', bobot: 0 },
      { label: '1', text: 'Sedikit', bobot: 1 },
      { label: '2', text: 'Agak', bobot: 2 },
      { label: '3', text: 'Banyak', bobot: 3 },
      { label: '4', text: 'Banyak sekali', bobot: 4 },
    ],
  },
  {
    no: 35,
    kategori: 'OBSESI_KEPARAHAN',
    klaster: 'Obsession Severity',
    text: 'Seberapa besar pikiran ini mengganggu atau membuat kamu kesal?',
    opsi: [
      { label: '0', text: 'Tidak sama sekali', bobot: 0 },
      { label: '1', text: 'Sedikit', bobot: 1 },
      { label: '2', text: 'Agak', bobot: 2 },
      { label: '3', text: 'Banyak', bobot: 3 },
      { label: '4', text: 'Banyak sekali', bobot: 4 },
    ],
  },
  {
    no: 36,
    kategori: 'OBSESI_KEPARAHAN',
    klaster: 'Obsession Severity',
    text: 'Seberapa keras kamu mencoba untuk menghentikan pikiran ini atau mengabaikannya?',
    opsi: [
      { label: '0', text: 'Aku selalu berusaha melawan', bobot: 0 },
      { label: '1', text: 'Aku mencoba melawan di sebagian besar waktu', bobot: 1 },
      { label: '2', text: 'Aku melakukan beberapa usaha untuk melawan', bobot: 2 },
      { label: '3', text: 'Meskipun aku ingin, aku tidak mencoba untuk melawan', bobot: 3 },
      { label: '4', text: 'Aku tidak melawan sama sekali', bobot: 4 },
    ],
  },
  {
    no: 37,
    kategori: 'OBSESI_KEPARAHAN',
    klaster: 'Obsession Severity',
    text: 'Ketika kamu mencoba melawan pikiran ini, dapatkah kamu mengalahkannya? Berapa banyak kendali yang kamu miliki atas pikiran ini?',
    opsi: [
      { label: '0', text: 'Kendali penuh', bobot: 0 },
      { label: '1', text: 'Banyak kendali', bobot: 1 },
      { label: '2', text: 'Kendali sedang', bobot: 2 },
      { label: '3', text: 'Sedikit kendali', bobot: 3 },
      { label: '4', text: 'Tidak ada kendali', bobot: 4 },
    ],
  },
  {
    no: 38,
    kategori: 'OBSESI_KEPARAHAN',
    klaster: 'Obsession Severity',
    text: 'Seberapa sering kamu menghindari melakukan sesuatu, pergi ke mana pun, atau bersama siapapun karena pikiran kamu ini?',
    opsi: [
      { label: '0', text: 'Tidak sama sekali', bobot: 0 },
      { label: '1', text: 'Sedikit', bobot: 1 },
      { label: '2', text: 'Agak', bobot: 2 },
      { label: '3', text: 'Banyak', bobot: 3 },
      { label: '4', text: 'Hampir selalu', bobot: 4 },
    ],
  },
]

// Tabel Interpretasi Master CHOCI-R Sesuai Handout (Tanpa Kategori Buatan)
export const CHOCI_INTERPRETASI = [
  {
    min_skor: 0,
    max_skor: 88,
    grade: 'Profil Gejala & Keparahan CHOCI-R',
    judul: 'Profil Skor Gejala & Keparahan OCD (CHOCI-R)',
    deskripsi:
      'CHOCI-R menyajikan profil skor terpisah antara keberadaan gejala (Total Symptoms Score rentang 0–40) dan tingkat keparahan/distres fungsional (Total Impairment Score rentang 0–48) tanpa pengelompokan kategori artifisial.',
    tips: [
      'Total Symptoms Score: Semakin tinggi skor, semakin besar kompleksitas dan luasnya gejala OCD yang dialami anak/remaja.',
      'Total Impairment Score: Semakin tinggi skor, semakin tinggi tingkat keparahan atau distres yang berkaitan dengan gejala OCD.',
      'Persentil 50: Disebut sebagai skor rata-rata untuk anak/remaja dengan OCD, yang menunjukkan gejala khas dan signifikan secara klinis.',
      'Tinjau dan diskusikan profil skor ini secara komprehensif bersama psikolog anak dan remaja.',
    ],
  },
]

export async function seedCHOCI(prisma: PrismaClient) {
  console.log('\n--- Menyemai Master Data Alat Ukur CHOCI-R ---')

  // 1. Master Data AlatUkur
  const alatUkur = await prisma.alatUkur.upsert({
    where: { kode: 'CHOCI-R' },
    update: {
      nama: 'Children’s Obsessive-Compulsive Inventory – Revised (CHOCI-R)',
      kategori: 'Obsesi, Kompulsi & Gejala OCD Anak/Remaja',
    },
    create: {
      kode: 'CHOCI-R',
      nama: 'Children’s Obsessive-Compulsive Inventory – Revised (CHOCI-R)',
      kategori: 'Obsesi, Kompulsi & Gejala OCD Anak/Remaja',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkur.nama} (${alatUkur.kode})`)

  // 2. Produk Paket CHOCI-R (Gratis - Rp 0)
  console.log('\n--- Menyemai Produk Paket CHOCI-R (Gratis) ---')
  const judulPaket = 'Tes Gejala OCD Anak dan Remaja'
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaket },
        { judul: { contains: 'CHOCI', mode: 'insensitive' } },
        { judul: { contains: 'Obsesi', mode: 'insensitive' } },
        { judul: { contains: 'OCD', mode: 'insensitive' } },
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
      'Pernah merasa memiliki pikiran yang muncul berulang kali dan sulit dihilangkan, atau terdorong untuk melakukan sesuatu secara berulang agar merasa lebih tenang? Terkadang, pikiran dan kebiasaan tersebut dapat memengaruhi aktivitas sehari-hari. Tes ini membantu mengenali gejala yang berkaitan dengan obsesif-kompulsif (OCD) pada anak dan remaja, baik berupa pikiran yang muncul berulang kali (obsesi) maupun dorongan untuk melakukan tindakan tertentu secara berulang (kompulsi). Selain itu, tes ini juga melihat tingkat keparahan gejala serta dampaknya terhadap kehidupan sehari-hari.',
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

  // 3. 38 Butir Soal & Pilihan Jawaban
  for (const q of CHOCI_SOAL) {
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
  console.log(`    ✓ 38 Butir Soal & Opsi Jawaban CHOCI-R berhasil disemai`)

  // 4. Interpretasi Profil Skor Master CHOCI-R
  for (const interp of CHOCI_INTERPRETASI) {
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
  console.log(`    ✓ Interpretasi Master CHOCI-R berhasil disemai`)

  return paket
}

// Eksekusi mandiri jika dijalankan langsung via tsx
if (process.argv[1]?.includes('seed-choci') || (typeof require !== 'undefined' && require.main === module)) {
  const prisma = new PrismaClient()
  seedCHOCI(prisma)
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

