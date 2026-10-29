import {
  PrismaClient,
  JenisAksesPsikotes,
  TipeTransaksi,
  MetodePembayaran,
  StatusPembayaran,
} from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// DATA PAKET 1: TES TINGKAT KEJENUHAN & STRES HARIAN
// ============================================================================
const KEJENUHAN_SOAL = [
  {
    urutan: 1,
    pertanyaan: 'Apakah kamu sering merasa lelah di pagi hari meskipun waktu tidurmu sudah cukup?',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Ya, sering merasa lelah dan enggan beraktivitas', bobot: 1 },
      { label: 'B', teks_jawaban: 'Tidak, merasa cukup segar dan berenergi', bobot: 0 },
    ],
  },
  {
    urutan: 2,
    pertanyaan: 'Ketika menghadapi masalah atau tugas mendadak, apakah kamu mudah merasa cemas atau panik?',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Ya, langsung merasa terbebani dan kewalahan', bobot: 1 },
      { label: 'B', teks_jawaban: 'Tidak, masih bisa tenang mencari solusi', bobot: 0 },
    ],
  },
  {
    urutan: 3,
    pertanyaan: 'Apakah belakangan ini kamu merasa sulit untuk fokus atau berkonsentrasi pada pekerjaan/tugas?',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Ya, pikiran sering melayang atau mudah teralihkan', bobot: 1 },
      { label: 'B', teks_jawaban: 'Tidak, fokus dan konsentrasi masih terjaga', bobot: 0 },
    ],
  },
  {
    urutan: 4,
    pertanyaan: 'Apakah kamu belakangan ini lebih mudah merasa kesal atau tersinggung oleh hal-hal kecil?',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Ya, suasana hati lebih sensitif dan mudah uring-uringan', bobot: 1 },
      { label: 'B', teks_jawaban: 'Tidak, emosi relatif stabil', bobot: 0 },
    ],
  },
  {
    urutan: 5,
    pertanyaan: 'Apakah kamu sempat meluangkan waktu jeda (istirahat/hobi) untuk dirimu sendiri setiap hari?',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Tidak, waktu tersita penuh oleh rutinitas dan beban pikiran', bobot: 1 },
      { label: 'B', teks_jawaban: 'Ya, selalu ada waktu luang untuk rileks', bobot: 0 },
    ],
  },
]

const KEJENUHAN_INTERPRETASI_GRATIS = [
  {
    min_skor: 0,
    max_skor: 2,
    grade: 'Stres Rendah',
    judul: 'Kondisi Mental Prima & Energi Stabil',
    deskripsi: 'Kondisi psikologis dan tingkat stresmu saat ini berada dalam rentang aman dan adaptif. Kamu mampu mengelola beban rutinitas harian dengan baik.',
    makna: 'Kamu memiliki ketahanan mental yang baik, tidak mudah panik, dan mampu menjaga keseimbangan antara aktivitas dan waktu istirahat.',
    tips: {
      saran: [
        {
          title: 'Pertahankan Pola Hidup Seimbang',
          desc: 'Terus jaga kebiasaan istirahat cukup, konsumsi makanan sehat, dan luangkan waktu untuk hal-hal yang kamu sukai.',
        },
      ],
      blindspots: ['Kecenderungan menoleransi beban berlebih saat merasa masih mampu.'],
      judulKekuatan: 'Potensi Utama',
      kekuatanUtama: ['Regulasi emosi yang stabil di bawah rutinitas harian.'],
      judulBlindspots: 'Area Waspada',
      judulLingkungan: 'Kondisi Pendukung',
      lingkunganOptimal: ['Lingkungan dengan ritme kerja terprediksi.'],
    },
  },
  {
    min_skor: 3,
    max_skor: 5,
    grade: 'Stres Tinggi',
    judul: 'Kelelahan Mental (Perlu Waktu Pemulihan)',
    deskripsi: 'Hasil asesmen menunjukkan tanda-tanda kejenuhan dan beban stres yang cukup tinggi. Tubuh dan pikiranmu mengirimkan sinyal bahwa kamu butuh jeda istirahat.',
    makna: 'Kondisi ini membuat energimu cepat terkuras, rentan mengalami perubahan suasana hati, dan produktivitas harian bisa menurun.',
    tips: {
      saran: [
        {
          title: 'Ambil Jeda & Kurangi Beban Sementara',
          desc: 'Luangkan waktu jeda sejenak tanpa memikirkan pekerjaan/tugas, dan jangan ragu bercerita pada orang terdekat atau profesional untuk meredakan ketegangan.',
        },
      ],
      blindspots: ['Mengabaikan sinyal lelah fisik demi mengejar target tugas.'],
      judulKekuatan: 'Potensi Utama',
      kekuatanUtama: ['Daya juang dan loyalitas tinggi dalam bekerja.'],
      judulBlindspots: 'Area Waspada',
      judulLingkungan: 'Kondisi Pendukung',
      lingkunganOptimal: ['Ruang tenang bebas distraksi dan dukungan delegasi tugas.'],
    },
  },
]

const KEJENUHAN_INTERPRETASI_BERBAYAR = [
  {
    min_skor: 0,
    max_skor: 2,
    grade: 'Stres Rendah',
    judul: 'Resiliensi Tinggi & Keseimbangan Emosi Prima',
    deskripsi: 'Kamu memiliki stabilitas emosional yang sangat kokoh. Ritme biologis dan ketahanan psikologismu bekerja harmonis sehingga kamu tidak mudah terseret ke dalam spiral stres kerja.',
    makna: 'Kemampuanmu dalam mengelola ekspektasi membuatmu tampil tenang di bawah tekanan, menjadi penyeimbang suasana bagi orang sekitar, dan mampu mengambil keputusan dengan jernih.',
    tips: {
      saran: [
        {
          title: 'Jaga Keseimbangan Energi',
          desc: 'Meskipun energimu prima, jadwalkan me-time berkala agar tidak mengalami kelelahan yang tak terduga.',
        },
        {
          title: 'Eksplorasi Tantangan Baru',
          desc: 'Kondisi psikologis prima adalah momen terbaik untuk mempelajari keterampilan baru atau menginisiasi proyek kreatif.',
        },
      ],
      blindspots: [
        'Kecenderungan menoleransi beban berlebih karena merasa diri masih mampu bertahan.',
        'Perlu meningkatkan kesadaran untuk rehat sebelum rasa lelah fisik muncul.',
      ],
      judulKekuatan: 'Potensi atau Kekuatan Utama',
      kekuatanUtama: [
        'Kemampuan regulasi emosi yang adaptif saat menghadapi perubahan mendadak.',
        'Ketahanan mental tinggi dalam mempertahankan fokus kerja jangka panjang.',
      ],
      judulBlindspots: 'Area yang Perlu Dikembangkan',
      judulLingkungan: 'Kondisi atau Lingkungan yang Mendukung',
      lingkunganOptimal: [
        'Lingkungan kerja yang fleksibel dengan batasan kerja yang jelas.',
        'Budaya tim yang menghargai keterbukaan komunikasi dan saling mendukung.',
      ],
    },
  },
  {
    min_skor: 3,
    max_skor: 5,
    grade: 'Stres Tinggi',
    judul: 'Beban Mental Tinggi (Indikasi Kejenuhan Ekstrem)',
    deskripsi: 'Sistem sarafmu berada dalam mode siaga tinggi (overdrive). Energi psikologismu tergerus oleh akumulasi rutinitas dan tuntutan harian tanpa pemulihan yang cukup.',
    makna: 'Kamu mungkin merasa mudah lelah secara fisik, sensitif terhadap stimulus sekitar, merasa lambat dalam menyelesaikan tugas rutin, dan kehilangan antusiasme beraktivitas.',
    tips: {
      saran: [
        {
          title: 'Detoks Beban & Konsultasi Terarah',
          desc: 'Ambil jeda minimal 1 hari penuh tanpa memikirkan tanggung jawab kerja. Pertimbangkan berdiskusi dengan konselor profesional untuk mengurai akar kecemasan.',
        },
        {
          title: 'Latihan Teknik Grounding 5-4-3-2-1',
          desc: 'Saat pikiran terasa buntu atau panik, alihkan perhatian ke panca indra di sekitarmu untuk mengembalikan kestabilan detak jantung.',
        },
      ],
      blindspots: [
        'Kesulitan menolak permintaan orang lain atau melepaskan kendali pekerjaan.',
        'Kecenderungan mengabaikan sinyal kelelahan tubuh demi menyelesaikan target.',
      ],
      judulKekuatan: 'Potensi atau Kekuatan Utama',
      kekuatanUtama: [
        'Rasa tanggung jawab dan komitmen yang sangat tinggi terhadap penyelesaian tugas.',
        'Sensitivitas empati yang tajam terhadap dinamika lingkungan sekitar.',
      ],
      judulBlindspots: 'Area yang Perlu Dikembangkan',
      judulLingkungan: 'Kondisi atau Lingkungan yang Mendukung',
      lingkunganOptimal: [
        'Ruang yang tenang dan bebas dari interupsi berlebih untuk memulihkan fokus.',
        'Dukungan pendelegasian tugas yang adil tanpa penghakiman.',
      ],
    },
  },
]

// ============================================================================
// DATA PAKET 2: TES KEPRIBADIAN DASAR 
// ============================================================================
const KEPRIBADIAN_SOAL = [
  {
    urutan: 1,
    pertanyaan: 'Ketika energi Anda terkuras setelah seharian beraktivitas, bagaimana cara terbaik Anda memulihkan energi?',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Menghabiskan waktu sendirian dengan membaca, menonton, atau istirahat tenang di kamar.', bobot: 10 },
      { label: 'B', teks_jawaban: 'Berkumpul, mengobrol santai, atau nongkrong bersama teman-teman dekat.', bobot: 20 },
      { label: 'C', teks_jawaban: 'Membagi waktu seimbang: me-time sejenak lalu berinteraksi santai dengan orang rumah.', bobot: 15 },
    ],
  },
  {
    urutan: 2,
    pertanyaan: 'Dalam situasi kelompok baru atau menghadiri acara sosial, Anda cenderung:',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Menunggu disapa terlebih dahulu dan mengamati suasana sekitar sebelum mulai membaur.', bobot: 10 },
      { label: 'B', teks_jawaban: 'Percaya diri memulai percakapan dan senang berkenalan dengan orang-orang baru.', bobot: 20 },
      { label: 'C', teks_jawaban: 'Fokus berinteraksi intens hanya dengan orang yang sudah Anda kenal sebelumnya.', bobot: 15 },
    ],
  },
  {
    urutan: 3,
    pertanyaan: 'Ketika harus mengambil keputusan penting dalam hidup atau pekerjaan, Anda lebih mengutamakan:',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Nilai personal, empati, perasaan orang yang terdampak, serta menjaga keharmonisan.', bobot: 10 },
      { label: 'B', teks_jawaban: 'Logika murni, data objektif, efisiensi, dan analisa fakta rasional.', bobot: 20 },
      { label: 'C', teks_jawaban: 'Keseimbangan antara pertimbangan logika fakta dan intuisi kata hati.', bobot: 15 },
    ],
  },
  {
    urutan: 4,
    pertanyaan: 'Bagaimana pendekatan Anda terhadap rencana atau jadwal kegiatan harian?',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Lebih santai, fleksibel, spontan, dan menyesuaikan situasi atau mood saat itu.', bobot: 10 },
      { label: 'B', teks_jawaban: 'Menyukai rencana yang terstruktur, terjadwal rapi, dan jelas to-do list-nya.', bobot: 20 },
      { label: 'C', teks_jawaban: 'Membuat jadwal garis besar namun tetap terbuka pada perubahan mendadak.', bobot: 15 },
    ],
  },
  {
    urutan: 5,
    pertanyaan: 'Ketika menghadapi perbedaan pendapat atau perdebatan dengan orang lain, sikap Anda biasanya:',
    pilihan_jawaban: [
      { label: 'A', teks_jawaban: 'Mengambil jeda waktu sejenak untuk memikirkan sudut pandang lawan bicara secara tenang.', bobot: 10 },
      { label: 'B', teks_jawaban: 'Mengutarakan argumen secara langsung, lugas, dan terbuka agar masalah segera tuntas.', bobot: 20 },
      { label: 'C', teks_jawaban: 'Mencari titik temu kompromi yang aman agar tidak merusak hubungan baik.', bobot: 15 },
    ],
  },
]

const KEPRIBADIAN_INTERPRETASI_GRATIS = [
  {
    min_skor: 50,
    max_skor: 65,
    grade: 'Introvert Reflektif',
    judul: 'Tipe Introvert yang Penuh Pertimbangan & Mandiri',
    deskripsi: 'Anda memiliki kecenderungan kepribadian introvert yang kuat. Anda mendapatkan energi utama dari ketenangan, refleksi diri, dan kenyamanan lingkungan yang akrab serta intim.',
    makna: 'Anda adalah pemikir yang mendalam, teliti, mandiri, dan pendengar yang sangat berempati. Anda lebih menghargai percakapan bermakna daripada obrolan basa-basi.',
    tips: {
      saran: [
        {
          title: 'Jaga Batasan Energi Mental',
          desc: 'Sediakan waktu me-time berkualitas setelah berinteraksi di lingkungan sosial yang ramai agar terhindar dari social burnout.',
        },
        {
          title: 'Komunikasikan Kebutuhan Ruang',
          desc: 'Beri tahu orang terdekat saat Anda butuh waktu untuk berpikir mandiri sebelum mengambil keputusan.',
        },
      ],
      blindspots: ['Kecenderungan terlalu lama menimbang hingga menunda tindakan nyata.'],
      judulKekuatan: 'Kekuatan Utama',
      kekuatanUtama: ['Konsentrasi mendalam dan analisis yang cermat.'],
      judulBlindspots: 'Area Pengembangan',
      judulLingkungan: 'Lingkungan Ideal',
      lingkunganOptimal: ['Ruang kerja yang tenang dengan minim interupsi mendadak.'],
    },
  },
  {
    min_skor: 66,
    max_skor: 80,
    grade: 'Ambivert Adaptif',
    judul: 'Tipe Ambivert yang Seimbang & Fleksibel',
    deskripsi: 'Anda memiliki keseimbangan dinamis antara sifat introvert dan ekstrovert. Anda mampu beradaptasi dan menyesuaikan energi sosial dengan sangat fleksibel tergantung situasi.',
    makna: 'Anda memiliki kemampuan komunikasi yang luwes: bisa menjadi pendengar yang penuh perhatian, sekaligus bisa menjadi pembicara yang menarik saat dibutuhkan.',
    tips: {
      saran: [
        {
          title: 'Pahami Kapasitas Harian',
          desc: 'Kenali sinyal tubuh apakah hari ini Anda sedang butuh bersosialisasi aktif atau justru butuh keheningan untuk memulihkan fokus.',
        },
        {
          title: 'Manfaatkan Kepekaan Sosial',
          desc: 'Gaya adaptif Anda merupakan modal kepemimpinan yang sangat baik untuk menjadi jembatan antar berbagai karakter orang.',
        },
      ],
      blindspots: ['Bisa merasa bingung terhadap prioritas emosi pribadi saat terlalu fokus menyesuaikan diri.'],
      judulKekuatan: 'Kekuatan Utama',
      kekuatanUtama: ['Fleksibilitas komunikasi tingkat tinggi di berbagai lapisan sosial.'],
      judulBlindspots: 'Area Pengembangan',
      judulLingkungan: 'Lingkungan Ideal',
      lingkunganOptimal: ['Kolaborasi tim yang dinamis namun tetap memberi ruang kerja mandiri.'],
    },
  },
  {
    min_skor: 81,
    max_skor: 100,
    grade: 'Ekstrovert Dinamis',
    judul: 'Tipe Ekstrovert yang Energik & Komunikatif',
    deskripsi: 'Anda mendapatkan stimulasi dan energi maksimal saat berinteraksi, bertukar pikiran, dan berkolaborasi dalam dinamika sosial yang aktif dan produktif.',
    makna: 'Anda ekspresif, bersemangat, percaya diri, dan mudah mencairkan suasana. Anda senang menginisiasi kolaborasi baru dan menggerakkan lingkungan sekitar.',
    tips: {
      saran: [
        {
          title: 'Sediakan Waktu Refleksi Tenang',
          desc: 'Biasakan meluangkan waktu sejenak untuk menimbang keputusan penting tanpa terburu-buru oleh antusiasme spontan.',
        },
        {
          title: 'Beri Ruang untuk yang Pendiam',
          desc: 'Ajak rekan yang lebih pasif untuk turut menyuarakan pendapatnya dalam diskusi kelompok.',
        },
      ],
      blindspots: ['Mudah merasa bosan jika harus bekerja sendirian dalam jangka waktu lama.'],
      judulKekuatan: 'Kekuatan Utama',
      kekuatanUtama: ['Kemampuan menginspirasi, membangun jejaring, dan menghidupkan suasana.'],
      judulBlindspots: 'Area Pengembangan',
      judulLingkungan: 'Lingkungan Ideal',
      lingkunganOptimal: ['Suasana kerja kolaboratif dengan ruang diskusi terbuka.'],
    },
  },
]

// ============================================================================
// HELPER: SYNC PAKET BESERTA SOAL & INTERPRETASI (IDEMPOTENT)
// ============================================================================
async function syncPaketWithDetails(config: {
  judul: string
  jenis_akses: JenisAksesPsikotes
  harga: number
  banner_url: string
  deskripsi: string
  benefits: string[]
  soal: Array<{
    urutan: number
    pertanyaan: string
    pilihan_jawaban: Array<{ label: string; teks_jawaban: string; bobot: number }>
  }>
  interpretasi: Array<{
    min_skor: number
    max_skor: number
    grade: string
    judul: string
    deskripsi: string
    makna: string
    tips: Record<string, any>
  }>
}) {
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      judul: config.judul,
      jenis_akses: config.jenis_akses,
    },
    include: {
      soal_psikotes: {
        include: { pilihan_jawaban: true },
      },
      interpretasi_psikotes: true,
    },
  })

  if (!paket) {
    paket = await prisma.paketPsikotes.create({
      data: {
        judul: config.judul,
        jenis_akses: config.jenis_akses,
        harga: config.harga,
        banner_url: config.banner_url,
        deskripsi: config.deskripsi,
        status: 'PUBLISHED',
        benefits: config.benefits,
      },
      include: {
        soal_psikotes: {
          include: { pilihan_jawaban: true },
        },
        interpretasi_psikotes: true,
      },
    })
    console.log(`[+] Created paket: ${config.judul} (${config.jenis_akses})`)
  } else {
    paket = await prisma.paketPsikotes.update({
      where: { id: paket.id },
      data: {
        harga: config.harga,
        banner_url: config.banner_url,
        deskripsi: config.deskripsi,
        status: 'PUBLISHED',
        benefits: config.benefits,
      },
      include: {
        soal_psikotes: {
          include: { pilihan_jawaban: true },
        },
        interpretasi_psikotes: true,
      },
    })
    console.log(`[*] Updated paket: ${config.judul} (${config.jenis_akses})`)
  }

  // Jika belum ada soal, buat soal & pilihan jawaban
  if (paket.soal_psikotes.length === 0) {
    for (const s of config.soal) {
      await prisma.soalPsikotes.create({
        data: {
          id_paket: paket.id,
          urutan: s.urutan,
          pertanyaan: s.pertanyaan,
          pilihan_jawaban: {
            create: s.pilihan_jawaban.map((p) => ({
              label: p.label,
              teks_jawaban: p.teks_jawaban,
              bobot: p.bobot,
            })),
          },
        },
      })
    }
    console.log(`    -> Created ${config.soal.length} soal untuk ${config.judul} (${config.jenis_akses})`)
  }

  // Jika belum ada interpretasi, buat interpretasi
  if (paket.interpretasi_psikotes.length === 0) {
    for (const item of config.interpretasi) {
      await prisma.interpretasiPsikotes.create({
        data: {
          id_paket: paket.id,
          min_skor: item.min_skor,
          max_skor: item.max_skor,
          grade: item.grade,
          judul: item.judul,
          deskripsi: item.deskripsi,
          makna: item.makna,
          tips: item.tips,
        },
      })
    }
    console.log(`    -> Created ${config.interpretasi.length} interpretasi untuk ${config.judul} (${config.jenis_akses})`)
  }

  // Refresh paket dengan relasi terisi lengkap
  const finalPaket = await prisma.paketPsikotes.findUniqueOrThrow({
    where: { id: paket.id },
    include: {
      soal_psikotes: {
        include: { pilihan_jawaban: true },
        orderBy: { urutan: 'asc' },
      },
      interpretasi_psikotes: {
        orderBy: { min_skor: 'asc' },
      },
    },
  })

  return finalPaket
}

// ============================================================================
// MAIN SEEDER FUNCTION
// ============================================================================
async function main() {
  console.log('========================================================')
  console.log('🌱 MEMULAI SEEDER PSIKOTES (seed-psikotes)...')
  console.log('========================================================')

  // ──────────────────────────────────────────────────────────────────────────
  // 0. BERSIHKAN VARIAN BERBAYAR DARI KEPRIBADIAN DASAR JIKA PERNAH ADA
  // ──────────────────────────────────────────────────────────────────────────
  const unwantedBerbayarKepribadian = await prisma.paketPsikotes.findFirst({
    where: {
      judul: { contains: 'Kepribadian Dasar', mode: 'insensitive' },
      jenis_akses: JenisAksesPsikotes.BERBAYAR,
    },
    include: {
      soal_psikotes: true,
      interpretasi_psikotes: true,
    },
  })

  if (unwantedBerbayarKepribadian) {
    console.log('🧹 Membersihkan varian berbayar dari "Tes Kepribadian Dasar"...')
    await prisma.interpretasiPsikotes.deleteMany({
      where: { id_paket: unwantedBerbayarKepribadian.id },
    })
    for (const s of unwantedBerbayarKepribadian.soal_psikotes) {
      await prisma.pilihanJawaban.deleteMany({ where: { id_soal: s.id } })
    }
    await prisma.soalPsikotes.deleteMany({
      where: { id_paket: unwantedBerbayarKepribadian.id },
    })
    await prisma.paketPsikotes.delete({
      where: { id: unwantedBerbayarKepribadian.id },
    })
    console.log('    ✓ Berhasil menghapus varian berbayar "Tes Kepribadian Dasar".')
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. SINKRONISASI PAKET PSIKOTES
  // - Tes Tingkat Kejenuhan & Stres Harian: BERBAYAR & GRATIS
  // - Tes Kepribadian Dasar: HANYA GRATIS
  // ──────────────────────────────────────────────────────────────────────────

  // 1A. Paket Kejenuhan & Stres Harian - BERBAYAR (Rp 75.000)
  const paketKejenuhanBerbayar = await syncPaketWithDetails({
    judul: 'Tes Tingkat Kejenuhan & Stres Harian',
    jenis_akses: JenisAksesPsikotes.BERBAYAR,
    harga: 75000,
    banner_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400&h=400',
    deskripsi: 'Deteksi cepat dan mendalam untuk mengetahui apakah kamu sedang mengalami kelelahan mental dalam rutinitas harian beserta rekomendasi terarah.',
    benefits: [
      'Skor indikasi kejenuhan mental harian',
      'Rekomendasi relaksasi praktis aplikatif',
      'Analisis potensi, kekuatan utama, dan area pengembangan',
      'Laporan hasil komprehensif berstandar psikologi',
    ],
    soal: KEJENUHAN_SOAL,
    interpretasi: KEJENUHAN_INTERPRETASI_BERBAYAR,
  })

  // 1B. Paket Kejenuhan & Stres Harian - GRATIS (Rp 0)
  const paketKejenuhanGratis = await syncPaketWithDetails({
    judul: 'Tes Tingkat Kejenuhan & Stres Harian',
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400&h=400',
    deskripsi: 'Deteksi cepat untuk mengetahui apakah kamu sedang mengalami kelelahan mental dalam rutinitas harian.',
    benefits: [
      'Skor indikasi kejenuhan mental harian',
      'Rekomendasi relaksasi praktis',
    ],
    soal: KEJENUHAN_SOAL,
    interpretasi: KEJENUHAN_INTERPRETASI_GRATIS,
  })

  // 1C. Paket Kepribadian Dasar - HANYA GRATIS (Rp 0)
  const paketKepribadianGratis = await syncPaketWithDetails({
    judul: 'Tes Kepribadian Dasar',
    jenis_akses: JenisAksesPsikotes.GRATIS,
    harga: 0,
    banner_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400&h=400',
    deskripsi: 'Asesmen psikologi terstruktur untuk mengetahui kecenderungan tipe kepribadian, gaya energi sosial, serta pola pengambilan keputusan sehari-hari.',
    benefits: [
      'Mengetahui kecenderungan kepribadian Introvert vs Ekstrovert',
      'Memahami gaya komunikasi dan pengambilan keputusan',
      'Rekomendasi tips pengembangan diri yang aplikatif',
    ],
    soal: KEPRIBADIAN_SOAL,
    interpretasi: KEPRIBADIAN_INTERPRETASI_GRATIS,
  })

  console.log('--------------------------------------------------------')
  console.log('✅ Paket psikotes siap (Kejenuhan: Gratis & Berbayar | Kepribadian: Hanya Gratis).')
  console.log('--------------------------------------------------------')

  // ──────────────────────────────────────────────────────────────────────────
  // 2. SEED 3 PESERTA (2 BERBAYAR + 1 GRATIS) DENGAN BOOKING & TRANSAKSI
  // ──────────────────────────────────────────────────────────────────────────

  // ──────────────────────────────────────────────────────────────────────────
  // PESERTA 1 (BERBAYAR - STATUS SELESAI MENGERJAKAN)
  // Nama: Ananda Pratama
  // Paket: Tes Tingkat Kejenuhan & Stres Harian (BERBAYAR - Rp 75.000)
  // Transaksi: Lunas via BCA Virtual Account (Rp 75.000)
  // Status Pengerjaan: Selesai (Skor 4 -> Grade: Stres Tinggi)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n👤 Menyiapkan Peserta 1: Ananda Pratama (Berbayar - Selesai)...')
  let client1 = await prisma.client.findFirst({
    where: { no_telepon: '081234567891' },
  })
  if (!client1) {
    client1 = await prisma.client.create({
      data: {
        nama: 'Ananda Pratama',
        no_telepon: '081234567891',
        usia: 24,
        jenis_kelamin: 'Laki-laki',
      },
    })
  } else {
    client1 = await prisma.client.update({
      where: { id: client1.id },
      data: { nama: 'Ananda Pratama', usia: 24, jenis_kelamin: 'Laki-laki' },
    })
  }

  // Transaksi Peserta 1
  const trx1 = await prisma.transaksi.upsert({
    where: { kode_transaksi: 'PSI-DEMO-001' },
    update: {
      status_pembayaran: StatusPembayaran.PAID,
      total: 75000,
      subtotal: 75000,
      data_pembayaran: JSON.stringify({ email: 'ananda.pratama@gmail.com' }),
    },
    create: {
      kode_transaksi: 'PSI-DEMO-001',
      id_client: client1.id,
      tipe_transaksi: TipeTransaksi.PSIKOTES,
      subtotal: 75000,
      biaya_admin: 0,
      total: 75000,
      metode_pembayaran: MetodePembayaran.TRANSFER_BANK,
      channel_pembayaran: 'bca',
      status_pembayaran: StatusPembayaran.PAID,
      tanggal_bayar: new Date(),
      data_pembayaran: JSON.stringify({ email: 'ananda.pratama@gmail.com' }),
    },
  })

  // Booking Peserta 1
  let booking1 = await prisma.bookingPsikotes.findFirst({
    where: { id_transaksi: trx1.id },
    include: { hasil_tes: true, jawaban_psikotes: true },
  })
  if (!booking1) {
    booking1 = await prisma.bookingPsikotes.create({
      data: {
        id_paket: paketKejenuhanBerbayar.id,
        id_client: client1.id,
        id_transaksi: trx1.id,
      },
      include: { hasil_tes: true, jawaban_psikotes: true },
    })
  } else if (booking1.id_paket !== paketKejenuhanBerbayar.id) {
    booking1 = await prisma.bookingPsikotes.update({
      where: { id: booking1.id },
      data: { id_paket: paketKejenuhanBerbayar.id },
      include: { hasil_tes: true, jawaban_psikotes: true },
    })
  }

  // Jawaban Soal untuk Peserta 1 (Skor 4)
  if (booking1.jawaban_psikotes.length === 0) {
    const soalKejenuhan = paketKejenuhanBerbayar.soal_psikotes
    // Soal 1, 2, 3, 4 dijawab bobot 1, Soal 5 dijawab bobot 0 -> total 4
    for (let idx = 0; idx < soalKejenuhan.length; idx++) {
      const s = soalKejenuhan[idx]
      const targetBobot = idx < 4 ? 1 : 0
      const pil = s.pilihan_jawaban.find((p) => p.bobot === targetBobot) || s.pilihan_jawaban[0]
      await prisma.jawabanPsikotes.create({
        data: {
          id_booking: booking1.id,
          id_soal_psikotes: s.id,
          id_pilihan_jawaban: pil.id,
          skor: pil.bobot,
        },
      })
    }
  }

  // Hasil Tes untuk Peserta 1 (Interpretasi: Stres Tinggi)
  const interpPeserta1 =
    paketKejenuhanBerbayar.interpretasi_psikotes.find(
      (i) => 4 >= i.min_skor && 4 <= i.max_skor
    ) || paketKejenuhanBerbayar.interpretasi_psikotes[paketKejenuhanBerbayar.interpretasi_psikotes.length - 1]

  await prisma.hasilTes.upsert({
    where: { id_booking: booking1.id },
    update: {
      id_interpretasi: interpPeserta1.id,
      total_skor: 4,
      tanggal_selesai: new Date(),
    },
    create: {
      id_booking: booking1.id,
      id_interpretasi: interpPeserta1.id,
      total_skor: 4,
      detail_skor: { skorMaksimal: 5, persentase: 80 },
      tanggal_selesai: new Date(),
    },
  })
  console.log('    ✓ Peserta 1 (Ananda Pratama) siap: Booking + Transaksi Lunas + Hasil Tes Selesai (Grade: Stres Tinggi).')

  // ──────────────────────────────────────────────────────────────────────────
  // PESERTA 2 (BERBAYAR - STATUS BERJALAN / BARU BELI AKSES, BELUM SELESAI)
  // Nama: Siti Nurhaliza
  // Paket: Tes Tingkat Kejenuhan & Stres Harian (BERBAYAR - Rp 75.000)
  // Transaksi: Lunas via QRIS (Rp 75.000)
  // Status Pengerjaan: Berjalan (Belum selesai, hasil_tes null)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n👤 Menyiapkan Peserta 2: Siti Nurhaliza (Berbayar - Berjalan)...')
  let client2 = await prisma.client.findFirst({
    where: { no_telepon: '085712345678' },
  })
  if (!client2) {
    client2 = await prisma.client.create({
      data: {
        nama: 'Siti Nurhaliza',
        no_telepon: '085712345678',
        usia: 22,
        jenis_kelamin: 'Perempuan',
      },
    })
  } else {
    client2 = await prisma.client.update({
      where: { id: client2.id },
      data: { nama: 'Siti Nurhaliza', usia: 22, jenis_kelamin: 'Perempuan' },
    })
  }

  // Transaksi Peserta 2
  const trx2 = await prisma.transaksi.upsert({
    where: { kode_transaksi: 'PSI-DEMO-002' },
    update: {
      status_pembayaran: StatusPembayaran.PAID,
      total: 75000,
      subtotal: 75000,
      data_pembayaran: JSON.stringify({ email: 'siti.nurhaliza@gmail.com' }),
    },
    create: {
      kode_transaksi: 'PSI-DEMO-002',
      id_client: client2.id,
      tipe_transaksi: TipeTransaksi.PSIKOTES,
      subtotal: 75000,
      biaya_admin: 0,
      total: 75000,
      metode_pembayaran: MetodePembayaran.QRIS,
      channel_pembayaran: 'qris',
      status_pembayaran: StatusPembayaran.PAID,
      tanggal_bayar: new Date(),
      data_pembayaran: JSON.stringify({ email: 'siti.nurhaliza@gmail.com' }),
    },
  })

  // Booking Peserta 2 (tanpa hasil_tes agar status pengerjaannya "Berjalan")
  let booking2 = await prisma.bookingPsikotes.findFirst({
    where: { id_transaksi: trx2.id },
  })
  if (!booking2) {
    booking2 = await prisma.bookingPsikotes.create({
      data: {
        id_paket: paketKejenuhanBerbayar.id,
        id_client: client2.id,
        id_transaksi: trx2.id,
      },
    })
  } else if (booking2.id_paket !== paketKejenuhanBerbayar.id) {
    booking2 = await prisma.bookingPsikotes.update({
      where: { id: booking2.id },
      data: { id_paket: paketKejenuhanBerbayar.id },
    })
  }
  console.log('    ✓ Peserta 2 (Siti Nurhaliza) siap: Booking + Transaksi Lunas + Status Tes "Berjalan" (Akses Aktif).')

  // ──────────────────────────────────────────────────────────────────────────
  // PESERTA 3 (GRATIS - STATUS SELESAI MENGERJAKAN)
  // Nama: Rian Hidayat
  // Paket: Tes Kepribadian Dasar (GRATIS - Rp 0)
  // Transaksi: null (Paket Gratis)
  // Status Pengerjaan: Selesai (Skor 85 -> Grade: Ekstrovert Dinamis)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n👤 Menyiapkan Peserta 3: Rian Hidayat (Gratis - Selesai)...')
  let client3 = await prisma.client.findFirst({
    where: { no_telepon: '087890123456' },
  })
  if (!client3) {
    client3 = await prisma.client.create({
      data: {
        nama: 'Rian Hidayat',
        no_telepon: '087890123456',
        usia: 26,
        jenis_kelamin: 'Laki-laki',
      },
    })
  } else {
    client3 = await prisma.client.update({
      where: { id: client3.id },
      data: { nama: 'Rian Hidayat', usia: 26, jenis_kelamin: 'Laki-laki' },
    })
  }

  // Booking Peserta 3 (id_transaksi null untuk paket gratis)
  let booking3 = await prisma.bookingPsikotes.findFirst({
    where: {
      id_client: client3.id,
      id_paket: paketKepribadianGratis.id,
      id_transaksi: null,
    },
    include: { hasil_tes: true, jawaban_psikotes: true },
  })
  if (!booking3) {
    booking3 = await prisma.bookingPsikotes.create({
      data: {
        id_paket: paketKepribadianGratis.id,
        id_client: client3.id,
        id_transaksi: null,
      },
      include: { hasil_tes: true, jawaban_psikotes: true },
    })
  }

  // Jawaban Soal untuk Peserta 3 (Skor 85)
  if (booking3.jawaban_psikotes.length === 0) {
    const soalKepribadian = paketKepribadianGratis.soal_psikotes
    // Soal 1, 2, 3 bobot 20 (60), Soal 4, 5 bobot 15 (30) -> total 90 (Ekstrovert Dinamis)
    for (let idx = 0; idx < soalKepribadian.length; idx++) {
      const s = soalKepribadian[idx]
      const targetBobot = idx < 3 ? 20 : 15
      const pil = s.pilihan_jawaban.find((p) => p.bobot === targetBobot) || s.pilihan_jawaban[0]
      await prisma.jawabanPsikotes.create({
        data: {
          id_booking: booking3.id,
          id_soal_psikotes: s.id,
          id_pilihan_jawaban: pil.id,
          skor: pil.bobot,
        },
      })
    }
  }

  // Hasil Tes untuk Peserta 3 (Interpretasi: Ekstrovert Dinamis)
  const interpPeserta3 =
    paketKepribadianGratis.interpretasi_psikotes.find(
      (i) => 90 >= i.min_skor && 90 <= i.max_skor
    ) || paketKepribadianGratis.interpretasi_psikotes[paketKepribadianGratis.interpretasi_psikotes.length - 1]

  await prisma.hasilTes.upsert({
    where: { id_booking: booking3.id },
    update: {
      id_interpretasi: interpPeserta3.id,
      total_skor: 90,
      tanggal_selesai: new Date(),
    },
    create: {
      id_booking: booking3.id,
      id_interpretasi: interpPeserta3.id,
      total_skor: 90,
      detail_skor: { skorMaksimal: 100, persentase: 90 },
      tanggal_selesai: new Date(),
    },
  })
  console.log('    ✓ Peserta 3 (Rian Hidayat) siap: Booking Gratis + Hasil Tes Selesai (Grade: Ekstrovert Dinamis).')

  console.log('\n========================================================')
  console.log('🎉 SEEDER PSIKOTES BERHASIL DISELESAIKAN!')
  console.log('========================================================')
  console.log('Ringkasan Paket:')
  console.log('1. "Tes Tingkat Kejenuhan & Stres Harian" -> Ada versi GRATIS (Rp 0) & BERBAYAR (Rp 75.000)')
  console.log('2. "Tes Kepribadian Dasar"              -> HANYA versi GRATIS (Rp 0)')
  console.log('\nRingkasan Peserta Demo:')
  console.log('1. Ananda Pratama   -> Berbayar Kejenuhan (BCA VA), Status: Selesai (Stres Tinggi)')
  console.log('2. Siti Nurhaliza   -> Berbayar Kejenuhan (QRIS),   Status: Berjalan (Akses Aktif)')
  console.log('3. Rian Hidayat     -> Gratis Kepribadian Dasar,    Status: Selesai (Ekstrovert Dinamis)')
  console.log('========================================================\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error saat menjalankan seed-psikotes:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
