/** Seeder master data alat ukur dan paket tes PBQ (Personality Belief Questionnaire) beserta 126 butir soal tanpa interpretasi. */
import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

export const PBQ_SOAL = [
  // 1–14: Avoidant
  { no: 1, scale: 'avoidant', text: 'Saya orang yang canggung dan tidak dikehendaki bila berada di lingkungan kerja maupun di lingkungan pergaulan.' },
  { no: 2, scale: 'avoidant', text: 'Pada dasarnya orang lain itu suka mengkritik, tidak peduli, merendahkan, atau menolak.' },
  { no: 3, scale: 'avoidant', text: 'Saya tidak dapat menerima perasaan yang tidak menyenangkan.' },
  { no: 4, scale: 'avoidant', text: 'Saya tidak mau terlalu dekat dengan orang lain karena khawatir mereka akan mengetahui diri saya yang sebenarnya sehingga mereka menjauhi saya.' },
  { no: 5, scale: 'avoidant', text: 'Saya tidak ingin orang lain melihat saya sebagai orang yang lemah dan rendah.' },
  { no: 6, scale: 'avoidant', text: 'Apapun resikonya saya berusaha menghindari situasi yang tidak menyenangkan.' },
  { no: 7, scale: 'avoidant', text: 'Bila saya merasa atau memikirkan sesuatu yang tidak menyenangkan, saya akan mengalihkannya dengan cara memikirkan hal-hal lain.' },
  { no: 8, scale: 'avoidant', text: 'Sebisa mungkin saya harus menghindari situasi dimana saya menjadi pusat perhatian.' },
  { no: 9, scale: 'avoidant', text: 'Perasaan yang tidak menyenangkan akan terus meningkat dan sulit untuk saya kendalikan.' },
  { no: 10, scale: 'avoidant', text: 'Saya percaya bahwa kritikan orang lain itu benar.' },
  { no: 11, scale: 'avoidant', text: 'Lebih baik tidak melakukan apapun daripada mengalami kegagalan.' },
  { no: 12, scale: 'avoidant', text: 'Bila saya tidak memikirkan suatu masalah, maka saya tidak perlu melakukan sesuatu apapun.' },
  { no: 13, scale: 'avoidant', text: 'Saya akan memutus suatu hubungan bila terdapat ketegangan dalam hubungan itu.' },
  { no: 14, scale: 'avoidant', text: 'Bila saya mengabaikan suatu masalah, maka masalah itu akan berlalu dengan sendirinya.' },

  // 15–28: Dependent
  { no: 15, scale: 'dependent', text: 'Saya serba tidak berdaya dan lemah.' },
  { no: 16, scale: 'dependent', text: 'Saya butuh seseorang yang setiap saat diperlukan bisa menolong saya atau pada saat sesuatu yang buruk terjadi.' },
  { no: 17, scale: 'dependent', text: 'Jika seseorang ingin menjadi penolong saya, maka sebaiknya orang tersebut bisa mengasuh, mendukung, dan percaya diri.' },
  { no: 18, scale: 'dependent', text: 'Saya akan tidak berdaya bila ditinggal sendiri.' },
  { no: 19, scale: 'dependent', text: 'Pada dasarnya saya merasa sendiri – kecuali jika saya dapat menggantungkan diri saya kepada orang yang lebih kuat.' },
  { no: 20, scale: 'dependent', text: 'Hal terburuk yang mungkin terjadi pada diri saya adalah ditinggalkan.' },
  { no: 21, scale: 'dependent', text: 'Bila saya tidak dicintai atau disayang, maka saya tidak akan bahagia.' },
  { no: 22, scale: 'dependent', text: 'Saya tidak boleh melakukan hal yang menyinggung perasaan penolong saya.' },
  { no: 23, scale: 'dependent', text: 'Saya harus selalu patuh untuk membuat dia tetap baik pada saya.' },
  { no: 24, scale: 'dependent', text: 'Saya selalu harus menjaga hubungan dengan dia atau orang yang mendampingi saya.' },
  { no: 25, scale: 'dependent', text: 'Saya selalu harus menjaga hubungan yang sedekat mungkin.' },
  { no: 26, scale: 'dependent', text: 'Saya tidak dapat membuat keputusan sendiri.' },
  { no: 27, scale: 'dependent', text: 'Saya tidak mampu mengatasi sesuatu seperti orang lain lakukan.' },
  { no: 28, scale: 'dependent', text: 'Saya membutuhkan bantuan orang lain untuk memutuskan atau mengatakan apa yang harus saya perbuat.' },

  // 29–42: Passive-Aggressive
  { no: 29, scale: 'passiveAggressive', text: 'Saya cukup mampu, tapi saya membutuhkan orang lain untuk membantu saya dalam mencapai tujuan saya.' },
  { no: 30, scale: 'passiveAggressive', text: 'Satu-satunya cara yang dapat menjaga kehormatan diri saya adalah dengan menyatakan diri secara tidak langsung, misalnya, dengan tidak melaksanakan instruksi dengan benar.' },
  { no: 31, scale: 'passiveAggressive', text: 'Saya senang akrab dengan orang-orang tapi saya tidak mau didominasi.' },
  { no: 32, scale: 'passiveAggressive', text: 'Figure-figur otoritas cenderung intrusive, penuh tuntutan, campur tangan, dan pengatur.' },
  { no: 33, scale: 'passiveAggressive', text: 'Saya menolak dominasi dari figure otoritas, tapi pada saat yang sama menjaga untuk tetap diterima dan selalu disetujuinya.' },
  { no: 34, scale: 'passiveAggressive', text: 'Dikendalikan atau didominasi oleh orang lain adalah perlakuan yang tidak dapat diterima.' },
  { no: 35, scale: 'passiveAggressive', text: 'Saya melakukan sesuatu sesuai dengan cara saya.' },
  { no: 36, scale: 'passiveAggressive', text: 'Memenuhi tenggat waktu dan tuntutan, serta harus mendapat persetujuan merupakan pukulan langsung dan menyinggung harga diri saya.' },
  { no: 37, scale: 'passiveAggressive', text: 'Bila saya mengikuti aturan seperti diminta oleh orang lain, maka hal itu akan menghambat kebebasan saya dalam bertindak.' },
  { no: 38, scale: 'passiveAggressive', text: 'Sebaiknya tidak menyatakan kemarahan secara langsung, tetapi menunjukkannya melalui ketidakpatuhan.' },
  { no: 39, scale: 'passiveAggressive', text: 'Saya tahu betul apa yang terbaik buat diri saya, dan orang lain tidak perlu memberitahu apa yang harus saya lakukan.' },
  { no: 40, scale: 'passiveAggressive', text: 'Aturan, adalah sewenang-wenang dan menghalangi saya.' },
  { no: 41, scale: 'passiveAggressive', text: 'Orang lain, sering terlalu menuntut.' },
  { no: 42, scale: 'passiveAggressive', text: 'Bila saya menganggap orang lain terlalu menuntut, maka saya memiliki hak untuk mengabaikan tuntutan mereka.' },

  // 43–56: Obsessive-Compulsive
  { no: 43, scale: 'obsessiveCompulsive', text: 'Saya bertanggung jawab penuh atas diri saya dan orang lain.' },
  { no: 44, scale: 'obsessiveCompulsive', text: 'Saya harus bergantung pada diri saya untuk menyelesaikan pekerjaan saya.' },
  { no: 45, scale: 'obsessiveCompulsive', text: 'Orang lain cenderung untuk biasa saja, tidak bertanggung jawab, manja, atau tidak kompeten.' },
  { no: 46, scale: 'obsessiveCompulsive', text: 'Sangat penting untuk menyelesaikan pekerjaan secara sempurna.' },
  { no: 47, scale: 'obsessiveCompulsive', text: 'Saya membutuhkan keteraturan, perintah dan aturan yang jelas agar dapat menyelesaikan pekerjaan dengan baik.' },
  { no: 48, scale: 'obsessiveCompulsive', text: 'Bila saya tidak punya aturan yang jelas, maka semuanya akan kacau balau.' },
  { no: 49, scale: 'obsessiveCompulsive', text: 'Setiap ketidaksempurnaan dalam suatu hasil kerja akan menimbulkan bencana.' },
  { no: 50, scale: 'obsessiveCompulsive', text: 'Sangatlah penting untuk selalu memegang standar yang tinggi dalam kehidupan.' },
  { no: 51, scale: 'obsessiveCompulsive', text: 'Saya perlu untuk selalu dapat mengendalikan emosi.' },
  { no: 52, scale: 'obsessiveCompulsive', text: 'Orang lain harus dapat melakukan suatu hal seperti cara saya.' },
  { no: 53, scale: 'obsessiveCompulsive', text: 'Bila saya tidak mengerjakan secara sempurna berarti saya gagal.' },
  { no: 54, scale: 'obsessiveCompulsive', text: 'Kekurangan, cacat atau berbuat salah, tidak dapat ditoleransi.' },
  { no: 55, scale: 'obsessiveCompulsive', text: 'Hal-hal yang detail sangat penting bagi saya.' },
  { no: 56, scale: 'obsessiveCompulsive', text: 'Cara saya melakukan sesuatu adalah cara yang terbaik.' },

  // 57–70: Antisocial
  { no: 57, scale: 'antisocial', text: 'Saya selalu harus memperhatikan diri saya, bukan orang lain.' },
  { no: 58, scale: 'antisocial', text: 'Pemaksaan dan kecerdikan adalah cara terbaik untuk menyelesaikan suatu pekerjaan.' },
  { no: 59, scale: 'antisocial', text: 'Kita hidup di belantara, orang yang terkuatlah yang dapat bertahan hidup.' },
  { no: 60, scale: 'antisocial', text: 'Saya manfaatkan orang lain lebih dulu sebelum mereka memanfaatkan saya.' },
  { no: 61, scale: 'antisocial', text: 'Tidak penting untuk memegang janji.' },
  { no: 62, scale: 'antisocial', text: 'Berbohong atau licik tidak masalah, selama tidak ketahuan.' },
  { no: 63, scale: 'antisocial', text: 'Saya sudah diperlakukan tidak adil, saya berhak mendapatkan keadilan itu dengan cara apapun.' },
  { no: 64, scale: 'antisocial', text: 'Orang lain lemah dan pantas untuk dimanfaatkan.' },
  { no: 65, scale: 'antisocial', text: 'Bila saya tidak mendesak orang lain, maka saya akan menjadi korban.' },
  { no: 66, scale: 'antisocial', text: 'Saya harus melaksanakan apa yang saya inginkan.' },
  { no: 67, scale: 'antisocial', text: 'Apa yang dipikirkan orang lain tentang saya bukan masalah.' },
  { no: 68, scale: 'antisocial', text: 'Bila saya menginginkan sesuatu, maka saya akan melakukan apapun untuk mendapatkannya.' },
  { no: 69, scale: 'antisocial', text: 'Saya selalu dapat mengatasi masalah, maka saya tidak terlalu khawatir akan akibat buruk yang akan terjadi.' },
  { no: 70, scale: 'antisocial', text: 'Bila orang lain tidak dapat mengatasi masalahnya, maka itu bukan urusan saya.' },

  // 71–84: Narcissistic
  { no: 71, scale: 'narcissistic', text: 'Saya adalah seorang yang istimewa.' },
  { no: 72, scale: 'narcissistic', text: 'Karena saya istimewa, maka saya pantas mendapatkan perlakuan yang istimewa juga.' },
  { no: 73, scale: 'narcissistic', text: 'Saya tidak harus terikat dengan aturan yang berlaku pada orang lain.' },
  { no: 74, scale: 'narcissistic', text: 'Sangat penting bagi saya untuk mendapat pengakuan, penghargaan dan pujian.' },
  { no: 75, scale: 'narcissistic', text: 'Bila orang lain tidak menghargai status saya, maka mereka harus dihukum.' },
  { no: 76, scale: 'narcissistic', text: 'Orang lain harus memuaskan kebutuhan saya.' },
  { no: 77, scale: 'narcissistic', text: 'Orang lain harus mengetahui betapa istimewanya saya.' },
  { no: 78, scale: 'narcissistic', text: 'Sangat tidak dapat ditoleran bila saya tidak mendapatkan apa yang saya inginkan (seperti: respek, penghargaan, pujian).' },
  { no: 79, scale: 'narcissistic', text: 'Orang lain tidak pantas mendapatkan pujian atau kekayaan.' },
  { no: 80, scale: 'narcissistic', text: 'Orang lain tidak berhak mengkritik saya.' },
  { no: 81, scale: 'narcissistic', text: 'Tidak ada satupun yang dapat mencampuri kepentingan saya.' },
  { no: 82, scale: 'narcissistic', text: 'Karena saya sangat berbakat, maka orang lain harus mengenalinya dan mempromosikan saya.' },
  { no: 83, scale: 'narcissistic', text: 'Hanya orang pintar yang dapat mengerti diri saya.' },
  { no: 84, scale: 'narcissistic', text: 'Saya memiliki alasan untuk mendapatkan hal yang besar.' },

  // 85–98: Histrionic
  { no: 85, scale: 'histrionic', text: 'Saya orang yang menarik dan penuh semangat.' },
  { no: 86, scale: 'histrionic', text: 'Saya akan bahagia bila orang lain memperhatikan saya.' },
  { no: 87, scale: 'histrionic', text: 'Diri saya tidak berarti kecuali saya dapat memuaskan atau memberikan kesan istimewa pada orang lain.' },
  { no: 88, scale: 'histrionic', text: 'Bila saya tidak akrab bergaul dengan orang lain, maka mereka tidak akan menyukai saya.' },
  { no: 89, scale: 'histrionic', text: 'Cara untuk mendapatkan apa yang saya inginkan adalah dengan membuat orang lain senang.' },
  { no: 90, scale: 'histrionic', text: 'Bila orang lain tidak merespons positif terhadap saya maka mereka adalah orang yang tidak bernilai.' },
  { no: 91, scale: 'histrionic', text: 'Sangat menyedihkan bila orang lain mengabaikan saya.' },
  { no: 92, scale: 'histrionic', text: 'Saya harus menjadi pusat perhatian.' },
  { no: 93, scale: 'histrionic', text: 'Saya tidak selalu harus berpikir secara mendalam- saya selalu menggunakan naluri saya.' },
  { no: 94, scale: 'histrionic', text: 'Bila saya menghibur atau membuat orang lain senang, maka mereka tidak akan dapat melihat kelemahan saya.' },
  { no: 95, scale: 'histrionic', text: 'Saya tidak bisa mentolerir rasa bosan.' },
  { no: 96, scale: 'histrionic', text: 'Bila saya ingin melakukan sesuatu maka akan saya kerjakan.' },
  { no: 97, scale: 'histrionic', text: 'Orang hanya akan memperhatikan saya bila saya berbuat sesuatu yang ekstrim.' },
  { no: 98, scale: 'histrionic', text: 'Perasaan dan intuisi lebih penting dibandingkan pikiran dan perencanaan yang rasional.' },

  // 99–112: Schizoid
  { no: 99, scale: 'schizoid', text: 'Saya tidak peduli pada apa yang dipikirkan orang lain tentang saya.' },
  { no: 100, scale: 'schizoid', text: 'Penting bagi saya untuk bebas dan tidak tergantung orang lain.' },
  { no: 101, scale: 'schizoid', text: 'Saya lebih senang melakukan sesuatu seorang diri daripada dengan orang lain.' },
  { no: 102, scale: 'schizoid', text: 'Dalam banyak situasi, saya lebih menyukai untuk dibiarkan sendiri.' },
  { no: 103, scale: 'schizoid', text: 'Saya tidak terpengaruh oleh orang lain dalam pengambilan keputusan atas apa yang akan saya lakukan.' },
  { no: 104, scale: 'schizoid', text: 'Hubungan yang akrab dengan orang lain tidak begitu penting bagi saya.' },
  { no: 105, scale: 'schizoid', text: 'Saya menetapkan standard dan sasaran bagi diri saya sendiri.' },
  { no: 106, scale: 'schizoid', text: 'Kehidupan pribadi saya (privacy) lebih penting daripada kedekatan saya dengan orang lain.' },
  { no: 107, scale: 'schizoid', text: 'Apa yang dipikirkan orang lain tidak penting bagi saya.' },
  { no: 108, scale: 'schizoid', text: 'Saya dapat mengatasi seluruh masalah saya tanpa perlu dibantu orang lain.' },
  { no: 109, scale: 'schizoid', text: 'Lebih baik hidup sendiri daripada jadi “tertambat” atau terikat dengan orang lain.' },
  { no: 110, scale: 'schizoid', text: 'Saya tidak harus mengutarakan apa yang saya pikirkan kepada orang lain.' },
  { no: 111, scale: 'schizoid', text: 'Saya dapat memanfaatkan orang lain guna memenuhi kebutuhan saya tanpa harus terlibat di dalamnya.' },
  { no: 112, scale: 'schizoid', text: 'Hubungan dengan orang lain akan mengganggu kebebasan saya.' },

  // 113–126: Paranoid
  { no: 113, scale: 'paranoid', text: 'Saya tidak dapat mempercayai orang lain.' },
  { no: 114, scale: 'paranoid', text: 'Setiap orang memiliki motivasi tersembunyi.' },
  { no: 115, scale: 'paranoid', text: 'Bila saya tidak waspada maka orang lain akan memanfaatkan saya atau memanipulasi saya.' },
  { no: 116, scale: 'paranoid', text: 'Saya harus waspada setiap saat.' },
  { no: 117, scale: 'paranoid', text: 'Tidak aman bila bercerita pada orang lain.' },
  { no: 118, scale: 'paranoid', text: 'Bila orang lain bersikap bersahabat, maka mereka memiliki tujuan tertentu atau akan memanfaatkan saya.' },
  { no: 119, scale: 'paranoid', text: 'Orang akan memanfaatkan saya bila saya memberi kesempatan kepada mereka.' },
  { no: 120, scale: 'paranoid', text: 'Dalam banyak hal, orang lain sebenarnya tidak bersahabat.' },
  { no: 121, scale: 'paranoid', text: 'Orang lain secara sengaja mencoba merendahkan saya.' },
  { no: 122, scale: 'paranoid', text: 'Seringkali orang lain secara sengaja ingin mengganggu saya.' },
  { no: 123, scale: 'paranoid', text: 'Saya akan mengalami masalah serius apabila saya membiarkan orang lain memperlakukan saya dengan cara yang tidak baik.' },
  { no: 124, scale: 'paranoid', text: 'Bila orang lain menemukan sesuatu mengenai diri saya, maka mereka akan menggunakannya sebagai alat untuk menyerang saya.' },
  { no: 125, scale: 'paranoid', text: 'Orang selalu mengatakan sesuatu padahal maksudnya lain.' },
  { no: 126, scale: 'paranoid', text: 'Orang yang dekat dengan saya, bisa saja tidak loyal bahkan menghianati saya.' },
]

export const PBQ_OPSI = [
  { label: '0', text: 'Tidak Yakin Sepenuhnya', bobot: 0 },
  { label: '1', text: 'Kurang Yakin', bobot: 1 },
  { label: '2', text: 'Cukup Yakin', bobot: 2 },
  { label: '3', text: 'Sangat Yakin', bobot: 3 },
  { label: '4', text: 'Yakin Sepenuhnya', bobot: 4 },
]

export async function seedPBQ(prisma: PrismaClient) {
  console.log('\n--- Menyemai Master Data Alat Ukur PBQ ---')

  // 1. Master Data AlatUkur
  const alatUkur = await prisma.alatUkur.upsert({
    where: { kode: 'PBQ' },
    update: {
      nama: 'Personality Belief Questionnaire (PBQ)',
      kategori: 'Pola Keyakinan & Kepribadian',
    },
    create: {
      kode: 'PBQ',
      nama: 'Personality Belief Questionnaire (PBQ)',
      kategori: 'Pola Keyakinan & Kepribadian',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkur.nama} (${alatUkur.kode})`)

  // 2. Produk Paket PBQ (Gratis — interpretasi belum disemai menunggu acuan resmi klien)
  const judulPaket = 'Tes Pola Keyakinan Kepribadian (PBQ)'
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaket },
        { judul: { contains: 'PBQ', mode: 'insensitive' } },
        { id_alat_ukur: alatUkur.id },
      ],
    },
  })

  const paketPayload = {
    judul: judulPaket,
    id_alat_ukur: alatUkur.id,
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: null,
    deskripsi:
      'Kenali pola keyakinan dan cara berpikir yang memengaruhi relasi diri serta orang lain melalui 9 dimensi kepribadian berbasis Personality Belief Questionnaire (PBQ).',
    tentang_tes:
      'Personality Belief Questionnaire (PBQ) dikembangkan oleh Aaron T. Beck dan rekan-rekannya untuk memetakan keyakinan inti seseorang pada sembilan pola kepribadian: Avoidant, Dependent, Passive-Aggressive, Obsessive-Compulsive, Antisocial, Narcissistic, Histrionic, Schizoid, dan Paranoid. Hasil skoring disajikan terpisah per skala (rentang 0–56) tanpa penjumlahan skor total.',
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

  // 3. 126 Butir Soal & 630 Pilihan Jawaban (0–4) secara efisien dan idempotent
  const existingSoal = await prisma.soalPsikotes.findMany({
    where: { id_paket: paket.id },
    include: { pilihan_jawaban: true },
  })
  const soalByUrutan = new Map(existingSoal.map((s) => [s.urutan, s]))

  for (const q of PBQ_SOAL) {
    const existing = soalByUrutan.get(q.no)

    if (!existing) {
      await prisma.soalPsikotes.create({
        data: {
          id_paket: paket.id,
          urutan: q.no,
          pertanyaan: q.text,
          pilihan_jawaban: {
            create: PBQ_OPSI.map((opt) => ({
              label: opt.label,
              teks_jawaban: opt.text,
              bobot: opt.bobot,
            })),
          },
        },
      })
      continue
    }

    if (existing.pertanyaan !== q.text) {
      await prisma.soalPsikotes.update({
        where: { id: existing.id },
        data: { pertanyaan: q.text },
      })
    }

    const pilihanByLabel = new Map(existing.pilihan_jawaban.map((p) => [p.label, p]))
    for (const opt of PBQ_OPSI) {
      const existingPil = pilihanByLabel.get(opt.label)
      if (!existingPil) {
        await prisma.pilihanJawaban.create({
          data: {
            id_soal: existing.id,
            label: opt.label,
            teks_jawaban: opt.text,
            bobot: opt.bobot,
          },
        })
      } else if (existingPil.teks_jawaban !== opt.text || existingPil.bobot !== opt.bobot) {
        await prisma.pilihanJawaban.update({
          where: { id: existingPil.id },
          data: {
            teks_jawaban: opt.text,
            bobot: opt.bobot,
          },
        })
      }
    }
  }
  console.log('    ✓ 126 Butir Soal & 630 Pilihan Jawaban PBQ berhasil disemai (tanpa interpretasi)')

  return paket
}

if (process.argv[1]?.includes('seed-pbq')) {
  const p = new PrismaClient()
  seedPBQ(p)
    .then(async () => {
      await p.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Error saat menjalankan seed-pbq:', e)
      await p.$disconnect()
      process.exit(1)
    })
}

