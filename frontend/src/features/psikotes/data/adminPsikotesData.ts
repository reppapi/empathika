import type {
  AdminPsikotesPaketListItem,
  AdminPsikotesPeserta,
  JudulPsikotesItem,
} from "../types/adminPsikotes";

export const INITIAL_PESERTA_LIST: AdminPsikotesPeserta[] = [
  { id: 1, nama: "Budi Santoso", noHp: "081234567890", paket: "Tes Kepribadian (MBTI) - Gratis", tanggal: "08 Okt 2026", status: "Selesai", skor: "INTJ (Architect)", jenisAkses: "Gratis" },
  { id: 2, nama: "Siti Aminah", noHp: "081298765432", paket: "Tes Minat Karier - Berbayar", tanggal: "07 Okt 2026", status: "Selesai", skor: "Social - Artistic (Kreatif & Humanis)", jenisAkses: "Berbayar" },
  { id: 3, nama: "Andi Saputra", noHp: "085612341234", paket: "Tes Tingkat Stres - Gratis", tanggal: "07 Okt 2026", status: "Berjalan", skor: "-", jenisAkses: "Gratis" },
  { id: 4, nama: "Rina Wijaya", noHp: "081122334455", paket: "Tes Kepribadian (MBTI) - Berbayar", tanggal: "06 Okt 2026", status: "Selesai", skor: "ENFJ-A (Protagonist)", jenisAkses: "Berbayar" },
];

export const INITIAL_PAKET_LIST: AdminPsikotesPaketListItem[] = [
  { id: 1, nama: "Tes Kepribadian (MBTI)", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=100&h=100", kategori: "Kepribadian", harga: "Rp 50.000", jumlahSoal: 60, waktu: "30 Menit", status: "Aktif" },
  { id: 2, nama: "Tes Minat Karier", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=100&h=100", kategori: "Karier", harga: "Rp 75.000", jumlahSoal: 45, waktu: "45 Menit", status: "Aktif" },
  { id: 3, nama: "Tes Tingkat Stres", image: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=100&h=100", kategori: "Klinis", harga: "Gratis", jumlahSoal: 20, waktu: "15 Menit", status: "Aktif" },
];

export const INITIAL_JUDUL_LIST: JudulPsikotesItem[] = [
  {
    id: 1,
    judul: "Tes Kepribadian (MBTI)",
    kategori: "Kepribadian",
    deskripsi: "Tes MBTI (Myers-Briggs Type Indicator) dirancang untuk mengukur preferensi psikologis dalam memandang dunia dan membuat keputusan.",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=100&h=100",
    paketList: [
      {
        id: 101,
        judulId: 1,
        namaJudul: "Tes Kepribadian (MBTI)",
        kategori: "Kepribadian",
        deskripsi: "Pengerjaan ringkas untuk mengenali preferensi kepribadian dasar tanpa biaya.",
        jenisAkses: "Gratis",
        harga: "Gratis",
        numericHarga: 0,
        waktu: "15 Menit",
        status: "Aktif",
        jumlahSoal: 4,
        soalList: [
          {
            id: 1001,
            tipe: "Pilihan Ganda",
            teks: "Saat berada di lingkungan baru dengan banyak orang yang belum dikenal, kamu biasanya...",
            pilihan: [
              { text: "Secara aktif memulai percakapan dan berkenalan dengan banyak orang.", bobot: "1" },
              { text: "Menunggu orang lain menyapa terlebih dahulu atau berbicara dengan sedikit orang saja.", bobot: "0" }
            ]
          },
          {
            id: 1002,
            tipe: "Pilihan Ganda",
            teks: "Dalam mengambil keputusan penting, kamu lebih sering mengandalkan...",
            pilihan: [
              { text: "Logika, analisis objektif, dan fakta yang ada.", bobot: "1" },
              { text: "Perasaan, empati, dan dampaknya terhadap orang lain.", bobot: "0" }
            ]
          },
          {
            id: 1003,
            tipe: "Pilihan Ganda",
            teks: "Saat merencanakan liburan, gaya kamu adalah...",
            pilihan: [
              { text: "Membuat jadwal yang terperinci untuk setiap kegiatan setiap harinya.", bobot: "1" },
              { text: "Lebih fleksibel, spontan, dan memutuskan kegiatan saat berada di tempat.", bobot: "0" }
            ]
          },
          {
            id: 1004,
            tipe: "Pilihan Ganda",
            teks: "Setelah melewati minggu yang panjang dan melelahkan, cara terbaikmu memulihkan energi adalah...",
            pilihan: [
              { text: "Pergi keluar, bertemu teman-teman, atau menghadiri acara sosial.", bobot: "1" },
              { text: "Tinggal di rumah, membaca buku, menonton film, atau menikmati waktu sendiri.", bobot: "0" }
            ]
          }
        ],
        interpretasiList: [
          {
            id: 1011,
            min: "0",
            max: "2",
            judul: "Orientasi Introvert (I)",
            kategori: "Kepribadian",
            deskripsi: "Anda memiliki kecenderungan memulihkan energi melalui refleksi diri dan ketenangan.",
            makna: "Lebih menyukai lingkungan yang kondusif untuk konsentrasi mendalam dan interaksi bermakna satu-lawan-satu.",
            saran: [
              { title: "Sediakan Waktu Sendiri", desc: "Sisihkan waktu jeda sejenak setelah aktivitas sosial yang padat." }
            ]
          },
          {
            id: 1012,
            min: "3",
            max: "4",
            judul: "Orientasi Ekstrovert (E)",
            kategori: "Kepribadian",
            deskripsi: "Anda mendapatkan energi melalui interaksi dinamis dengan orang lain dan lingkungan sekitar.",
            makna: "Aktif berkomunikasi dan cepat beradaptasi dalam suasana kelompok.",
            saran: [
              { title: "Kolaborasi Tim", desc: "Manfaatkan energi sosial Anda untuk memimpin dan berdiskusi ide-ide baru." }
            ]
          }
        ],
        updatedAt: "10 Okt 2026"
      },
      {
        id: 102,
        judulId: 1,
        namaJudul: "Tes Kepribadian (MBTI)",
        kategori: "Kepribadian",
        deskripsi: "Asesmen psikometri mendalam dengan 16 pemetaan tipe kepribadian, gaya kerja, dan rekomendasi karir.",
        jenisAkses: "Berbayar",
        harga: "Rp 50.000",
        numericHarga: 50000,
        waktu: "30 Menit",
        status: "Aktif",
        jumlahSoal: 6,
        soalList: [
          {
            id: 2001,
            tipe: "Pilihan Ganda",
            teks: "Saat menghadapi masalah rumit di pekerjaan atau perkuliahan, apa pendekatan utamamu?",
            pilihan: [
              { text: "Membedah konsep dasar secara teoritis dan mencari pola konseptual.", bobot: "2" },
              { text: "Melihat data historis dan solusi praktis yang sudah terbukti berhasil.", bobot: "1" }
            ]
          },
          {
            id: 2002,
            tipe: "Pilihan Ganda",
            teks: "Bagaimana caramu mengelola tenggat waktu (deadline) proyek?",
            pilihan: [
              { text: "Menyusun jadwal bertahap dan menyelesaikannya jauh sebelum tenggat waktu.", bobot: "2" },
              { text: "Bekerja secara optimal saat mendekati batas akhir karena dorongan adrenalin.", bobot: "1" }
            ]
          },
          {
            id: 2003,
            tipe: "Pilihan Ganda",
            teks: "Dalam sebuah tim, peran apa yang secara alami paling sering kamu ambil?",
            pilihan: [
              { text: "Perencana strategis dan penyusun alur kerja.", bobot: "2" },
              { text: "Pemberi motivasi dan perekat hubungan interpersonal anggota tim.", bobot: "1" }
            ]
          },
          {
            id: 2004,
            tipe: "Pilihan Ganda",
            teks: "Ketika menerima kritik atau umpan balik kerja, kamu cenderung...",
            pilihan: [
              { text: "Mengevaluasi kebenaran argumen secara objektif tanpa memasukkan perasaan.", bobot: "2" },
              { text: "Merasakan dampak emosional terlebih dahulu sebelum merenungkan masukannya.", bobot: "1" }
            ]
          },
          {
            id: 2005,
            tipe: "Pilihan Ganda",
            teks: "Di akhir pekan atau hari libur, aktivitas yang paling menyegarkanmu adalah...",
            pilihan: [
              { text: "Mengeksplorasi proyek pribadi, membaca wawasan baru, atau berefleksi.", bobot: "2" },
              { text: "Mengadakan pertemuan dengan komunitas atau teman-teman terdekat.", bobot: "1" }
            ]
          },
          {
            id: 2006,
            tipe: "Pilihan Ganda",
            teks: "Ketika berada dalam situasi yang tidak terduga atau ambigu, kamu...",
            pilihan: [
              { text: "Segera mencari kejelasan aturan dan struktur pedoman yang baku.", bobot: "2" },
              { text: "Merasa nyaman berimprovisasi dan mencari jalan keluar secara kreatif.", bobot: "1" }
            ]
          }
        ],
        interpretasiList: [
          {
            id: 2011,
            min: "6",
            max: "8",
            judul: "ENFJ-A (Protagonist)",
            kategori: "Kepribadian Berbayar",
            deskripsi: "Karakteristikmu mencerminkan kecenderungan analitis yang kuat, gaya komunikasi yang terstruktur, serta orientasi tinggi terhadap pencapaian dan kolaborasi yang harmonis.",
            makna: "Implikasi bagi Kehidupan Sehari-hari: Mampu membangun keselarasan dan kohesi tim kerja, merumuskan solusi berpusat pada manusia, serta menginspirasi rekan kerja dengan empati tulus.",
            kekuatanUtama: [
              "Komunikasi persuasif yang berakar pada empati tulus dan pemahaman interpersonal.",
              "Kemampuan membangun keselarasan dan kohesi tim kerja dalam mencapai target bersama.",
              "Ketajaman dalam merumuskan solusi strategis yang tetap berpusat pada kesejahteraan manusia."
            ],
            blindspots: [
              "Cenderung mengabaikan kebutuhan diri sendiri demi mendahulukan kepentingan atau perasaan orang lain.",
              "Rentan mengalami kelelahan emosional (burnout) akibat terlalu menyerap beban masalah lingkungan sekitar.",
              "Sulit menolak permintaan tambahan atau menetapkan batasan beban kerja pribadi yang tegas."
            ],
            lingkunganOptimal: [
              "Industri edukasi, psikologi, human resource, konsultasi, dan pengembangan komunitas.",
              "Posisi strategis dengan ruang kolaborasi tim yang fleksibel, hangat, dan suportif.",
              "Budaya organisasi yang menghargai inovasi sosial, empati, dan pengakuan personal yang transparan."
            ],
            saran: [
              { title: "Beri Waktu Jeda", desc: "Luangkan waktu 15-30 menit setiap hari tanpa gangguan untuk relaksasi, meditasi, atau sekadar melakukan hobi ringan." },
              { title: "Cerita pada Orang Terdekat", desc: "Membagikan beban pikiran pada seseorang yang kamu percaya bisa membantu mengurangi tekanan emosional." },
              { title: "Atur Prioritas & Batasan Diri", desc: "Fokus pada hal-hal yang paling esensial. Jangan ragu untuk mengatakan 'tidak' jika kapasitas mentalmu sudah penuh." }
            ]
          },
          {
            id: 2012,
            min: "9",
            max: "12",
            judul: "INTJ-A (Architect)",
            kategori: "Kepribadian Berbayar",
            deskripsi: "Analisis mendalam menunjukkan dominasi pemikiran strategis visioner, perancangan sistem jangka panjang, dan efisiensi logika objektif.",
            makna: "Implikasi bagi Kehidupan Sehari-hari: Mampu merumuskan arsitektur solusi jangka panjang, memetakan risiko, dan mengoptimalkan proses kerja dengan pendekatan analitis yang presisi.",
            kekuatanUtama: [
              "Pemikiran strategis visioner dengan ketajaman arsitektur solusi jangka panjang.",
              "Kemandirian tinggi dan standar kualitas eksekusi yang presisi serta terukur.",
              "Kemampuan membaca pola tersembunyi dan memitigasi potensi risiko sistemik sejak dini."
            ],
            blindspots: [
              "Cenderung kurang sabar terhadap alur kerja yang tidak efisien atau argumen yang minim dasar logika empiris.",
              "Terkadang mempersepsikan dinamika interpersonal atau obrolan santai sebagai distraksi produktivitas.",
              "Terlalu menuntut kesempurnaan pada diri sendiri maupun rekan kerja saat standar tinggi belum terpenuhi."
            ],
            lingkunganOptimal: [
              "Pusat riset & pengembangan teknologi, perencanaan strategis, dan konsultasi manajerial.",
              "Lingkungan kerja dengan otonomi tinggi, birokrasi ramping, dan budaya meritokrasi logis.",
              "Proyek-proyek berorientasi visi transformasional jangka panjang."
            ],
            saran: [
              { title: "Fleksibilitas Pelaksanaan", desc: "Buka ruang bagi metode alternatif dari rekan kerja saat mengeksekusi rencana strategis." },
              { title: "Komunikasi Empatik", desc: "Sampaikan masukan logis dengan mempertimbangkan dinamika interpersonal dan kesiapan emosional tim." },
              { title: "Rayakan Pencapaian Bertahap", desc: "Beri apresiasi pada progres kecil sebelum langsung melompat ke target ambisius berikutnya." }
            ]
          }
        ],
        updatedAt: "12 Okt 2026"
      }
    ]
  },
  {
    id: 2,
    judul: "Tes Minat Karier",
    kategori: "Karier",
    deskripsi: "Asesmen pemetaan minat, potensi bakat, dan kecenderungan jalur profesional berbasis instrumen psikologi kerja.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=100&h=100",
    paketList: [
      {
        id: 201,
        judulId: 2,
        namaJudul: "Tes Minat Karier",
        kategori: "Karier",
        deskripsi: "Laporan komprehensif pemetaan karir profesional, gaya eksekusi tugas, dan industri yang relevan.",
        jenisAkses: "Berbayar",
        harga: "Rp 75.000",
        numericHarga: 75000,
        waktu: "45 Menit",
        status: "Aktif",
        jumlahSoal: 4,
        soalList: [
          {
            id: 3001,
            tipe: "Pilihan Ganda",
            teks: "Kegiatan kerja yang paling membuatmu merasa puas dan bersemangat adalah...",
            pilihan: [
              { text: "Mengolah angka, data riset, dan merumuskan hipotesis analitis.", bobot: "3" },
              { text: "Berinteraksi langsung dengan klien dan membantu menyelesaikan masalah mereka.", bobot: "2" },
              { text: "Mendesain produk visual atau karya kreatif yang orisinal.", bobot: "1" }
            ]
          },
          {
            id: 3002,
            tipe: "Pilihan Ganda",
            teks: "Tipe lingkungan kerja seperti apa yang membuat potensimu paling berkembang?",
            pilihan: [
              { text: "Lingkungan dengan tantangan analisis teknis yang tinggi dan minim birokrasi.", bobot: "3" },
              { text: "Lingkungan yang hangat, kolaboratif, dan menekankan kerja sama tim.", bobot: "2" },
              { text: "Lingkungan yang fleksibel tanpa batasan kaku untuk berkreasi.", bobot: "1" }
            ]
          },
          {
            id: 3003,
            tipe: "Pilihan Ganda",
            teks: "Ketika disodori proyek baru, fokus pertamamu adalah...",
            pilihan: [
              { text: "Memastikan kelayakan data dan mengukur metrik keberhasilan.", bobot: "3" },
              { text: "Mengorganisir peran orang-orang dan membagi tugas secara adil.", bobot: "2" },
              { text: "Menggagas ide-ide inovatif yang belum pernah dicoba sebelumnya.", bobot: "1" }
            ]
          },
          {
            id: 3004,
            tipe: "Pilihan Ganda",
            teks: "Bagaimana caramu menyelesaikan kendala operasional yang macet?",
            pilihan: [
              { text: "Melakukan 'root cause analysis' secara terstruktur berdasarkan fakta.", bobot: "3" },
              { text: "Mengumpulkan tim untuk 'brainstorming' dan saling mendengar masukan.", bobot: "2" },
              { text: "Mencoba jalur eksperimen alternatif yang 'out of the box'.", bobot: "1" }
            ]
          }
        ],
        interpretasiList: [
          {
            id: 3011,
            min: "4",
            max: "7",
            judul: "Orientasi Kreatif & Humanis (Social - Artistic)",
            kategori: "Karier Berbayar",
            deskripsi: "Dominasi minat berfokus pada inovasi, ekspresi ide orisinal, serta komunikasi persuasif yang berakar pada empati tulus.",
            makna: "Implikasi bagi Kehidupan Sehari-hari: Unggul dalam industri edukasi, psikologi, human resource, dan perancangan strategi kreatif dengan ruang kolaborasi tim yang fleksibel.",
            kekuatanUtama: [
              "Kreativitas tinggi dalam memecahkan masalah interpersonal dan operasional.",
              "Kecerdasan emosional yang mendukung komunikasi asertif dan diplomatis.",
              "Kemampuan mengubah konsep abstrak menjadi strategi implementatif yang menarik."
            ],
            blindspots: [
              "Cenderung menghindari konfrontasi langsung meskipun ada masalah struktural yang mendesak.",
              "Rentan overthinking terhadap ekspektasi atau pandangan orang lain terhadap hasil kerjanya.",
              "Sering kesulitan menetapkan batasan profesional ketika urusan pekerjaan menyentuh empati emosional."
            ],
            lingkunganOptimal: [
              "Industri kreatif, agensi konsultan, riset sosial, dan human capital.",
              "Organisasi yang memiliki budaya terbuka, suportif, dan inovatif.",
              "Posisi yang memungkinkan interaksi berkelanjutan dengan klien atau komunitas."
            ],
            saran: [
              { title: "Eksplorasi Peran Strategis", desc: "Kembangkan potensi pada posisi People Development Specialist, UI/UX Researcher, atau Talent Strategist." },
              { title: "Atur Batasan Energi", desc: "Jaga keseimbangan antara keterlibatan sosial dan waktu jeda refleksi mandiri." }
            ]
          },
          {
            id: 3012,
            min: "8",
            max: "12",
            judul: "Orientasi Analitis & Eksekutif (Investigative - Enterprising)",
            kategori: "Karier Berbayar",
            deskripsi: "Kecenderungan kuat dalam pemodelan data, investigasi logis, dan kepemimpinan strategis dalam memecahkan masalah struktural.",
            makna: "Kekuatan Utama & Lingkungan Kerja Optimal: Sangat berdaya dalam posisi manajerial berbasis metrik, riset kuantitatif, konsultasi manajemen, dan arsitektur produk.",
            kekuatanUtama: [
              "Ketajaman analisis kuantitatif dan sintesis data untuk keputusan strategis.",
              "Kemampuan merancang proses operasional yang efisien dan terukur.",
              "Kepemimpinan berorientasi hasil yang tegas dan akuntabel."
            ],
            blindspots: [
              "Cenderung kurang sabar terhadap proses yang lambat atau rekan kerja yang tidak menyukai analisis data.",
              "Dapat terkesan terlalu dingin, kaku, atau menuntut ketika berada di bawah tekanan tenggat waktu.",
              "Sering mengabaikan sinyal kelelahan fisik demi menuntaskan target yang ditetapkan secara ambisius."
            ],
            lingkunganOptimal: [
              "Industri finansial, teknologi analitik, konsultasi manajemen, dan operasional rantai pasok.",
              "Perusahaan yang bertumbuh cepat dengan tantangan efisiensi sistem yang nyata.",
              "Posisi manajerial dengan wewenang pengambilan keputusan berbasis data."
            ],
            saran: [
              { title: "Rekomendasi Spesialisasi", desc: "Perkuat keahlian di bidang Data Consultant, Financial Analyst, Strategic Operations, atau System Architect." },
              { title: "Kolaborasi Lintas Fungsi", desc: "Sertakan aspek empati saat mengomunikasikan temuan analisis data kepada divisi non-teknis." }
            ]
          }
        ],
        updatedAt: "07 Okt 2026"
      }
    ]
  },
  {
    id: 3,
    judul: "Tes Tingkat Stres",
    kategori: "Klinis",
    deskripsi: "Kalkulator dan asesmen klinis untuk mengukur beban stres harian, tekanan mental, dan respon emosional.",
    image: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=100&h=100",
    paketList: [
      {
        id: 301,
        judulId: 3,
        namaJudul: "Tes Tingkat Stres",
        kategori: "Klinis",
        deskripsi: "Pengecekan dini tingkat stres harian untuk mengetahui apakah Anda memerlukan jeda istirahat.",
        jenisAkses: "Gratis",
        harga: "Gratis",
        numericHarga: 0,
        waktu: "15 Menit",
        status: "Aktif",
        jumlahSoal: 3,
        soalList: [
          {
            id: 4001,
            tipe: "Pilihan Ganda",
            teks: "Dalam 2 minggu terakhir, seberapa sering Anda merasa cemas atau terbebani tanpa alasan yang jelas?",
            pilihan: [
              { text: "Hampir setiap hari", bobot: "3" },
              { text: "Beberapa hari", bobot: "1" },
              { text: "Tidak pernah / Sangat jarang", bobot: "0" }
            ]
          },
          {
            id: 4002,
            tipe: "Pilihan Ganda",
            teks: "Apakah Anda mengalami kesulitan tidur atau sering terbangun di malam hari karena memikirkan pekerjaan?",
            pilihan: [
              { text: "Sering sekali", bobot: "3" },
              { text: "Kadang-kadang", bobot: "1" },
              { text: "Tidak pernah", bobot: "0" }
            ]
          },
          {
            id: 4003,
            tipe: "Pilihan Ganda",
            teks: "Seberapa mudah Anda merasa lelah atau kehilangan fokus saat mengerjakan tugas rutin?",
            pilihan: [
              { text: "Sangat mudah lelah", bobot: "3" },
              { text: "Cukup wajar", bobot: "1" },
              { text: "Energi tetap terjaga dengan baik", bobot: "0" }
            ]
          }
        ],
        interpretasiList: [
          {
            id: 4011,
            min: "0",
            max: "3",
            judul: "Tingkat Stres Rendah (Normal)",
            kategori: "Klinis",
            deskripsi: "Kondisi psikologis Anda saat ini tergolong stabil dan mampu mengelola beban harian dengan baik.",
            makna: "Respon tubuh dan pikiran adaptif terhadap tekanan rutin.",
            saran: [
              { title: "Pertahankan Rutinitas Sehat", desc: "Jaga pola tidur dan luangkan waktu olahraga secara teratur." }
            ]
          },
          {
            id: 4012,
            min: "4",
            max: "9",
            judul: "Tingkat Stres Tinggi",
            kategori: "Klinis",
            deskripsi: "Berdasarkan hasil tes, tingkat stres yang kamu alami saat ini berada pada kategori tinggi. Menghadapi beban pikiran yang cukup berat.",
            makna: "Sinyal dari tubuh dan pikiranmu bahwa kamu memerlukan waktu untuk beristirahat dan mengatur batasan diri.",
            saran: [
              { title: "Beri Waktu Jeda", desc: "Luangkan waktu 15-30 menit setiap hari tanpa gangguan untuk relaksasi atau meditasi." },
              { title: "Cerita pada Orang Terdekat", desc: "Membagikan beban pikiran bisa membantu mengurangi tekanan emosional." }
            ]
          }
        ],
        updatedAt: "05 Okt 2026"
      }
    ]
  },
  {
    id: 4,
    judul: "Tes Love Language: 5 Bahasa Cinta",
    kategori: "Relasi",
    deskripsi: "Tes Love Language untuk membantu memahami bagaimana seseorang lebih suka memberikan dan menerima kasih sayang.",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&q=80&w=100&h=100",
    paketList: [
      {
        id: 401,
        judulId: 4,
        namaJudul: "Tes Love Language: 5 Bahasa Cinta",
        kategori: "Relasi",
        deskripsi: "Pengerjaan 15 butir soal ringkas untuk mengidentifikasi 1 bahasa cinta primer.",
        jenisAkses: "Gratis",
        harga: "Gratis",
        numericHarga: 0,
        waktu: "10 Menit",
        status: "Aktif",
        jumlahSoal: 2,
        soalList: [
          {
            id: 5001,
            tipe: "Pilihan Ganda",
            teks: "Saya merasa paling dicintai ketika pasangan atau teman dekat...",
            pilihan: [
              { text: "Memberikan kata-kata pujian atau apresiasi tulus.", bobot: "1" },
              { text: "Menghabiskan waktu berkualitas bersama tanpa gangguan gawai.", bobot: "2" }
            ]
          },
          {
            id: 5002,
            tipe: "Pilihan Ganda",
            teks: "Tindakan yang paling berkesan bagi saya adalah...",
            pilihan: [
              { text: "Bantuan spontan saat saya sedang kerepotan (Acts of Service).", bobot: "1" },
              { text: "Hadiah kecil yang dipilihkan secara khusus untuk saya.", bobot: "2" }
            ]
          }
        ],
        interpretasiList: [
          {
            id: 5011,
            min: "2",
            max: "4",
            judul: "Bahasa Cinta Primer Teridentifikasi",
            kategori: "Relasi",
            deskripsi: "Hasil identifikasi preferensi afeksi emosional dasar.",
            makna: "Membantu Anda memahami apa yang membuat Anda merasa dihargai dalam hubungan.",
            saran: [
              { title: "Komunikasikan Terbuka", desc: "Sampaikan bahasa cintamu dengan lembut kepada pasangan atau sahabat." }
            ]
          }
        ],
        updatedAt: "02 Okt 2026"
      },
      {
        id: 402,
        judulId: 4,
        namaJudul: "Tes Love Language: 5 Bahasa Cinta",
        kategori: "Relasi",
        deskripsi: "Paket Hubungan & Panduan Relasi Lengkap: grafik persentase 5 bahasa cinta, resolusi konflik, dan panduan komunikasi asertif.",
        jenisAkses: "Berbayar",
        harga: "Rp 40.000",
        numericHarga: 40000,
        waktu: "25 Menit",
        status: "Draf",
        jumlahSoal: 2,
        soalList: [
          {
            id: 6001,
            tipe: "Pilihan Ganda",
            teks: "Ketika menghadapi konflik relasi, respon apa yang paling membuatmu merasa tenang?",
            pilihan: [
              { text: "Duduk bersama dan membicarakan solusi dengan kepala dingin.", bobot: "2" },
              { text: "Mendapatkan gestur kehangatan fisik atau pelukan menenangkan.", bobot: "1" }
            ]
          },
          {
            id: 6002,
            tipe: "Pilihan Ganda",
            teks: "Draf pertanyaan lanjutan untuk paket berbayar...",
            pilihan: [
              { text: "Opsi A", bobot: "1" },
              { text: "Opsi B", bobot: "2" }
            ]
          }
        ],
        interpretasiList: [
          {
            id: 6011,
            min: "2",
            max: "4",
            judul: "Words of Affirmation (Kata-Kata Penegasan)",
            kategori: "Relasi Berbayar",
            deskripsi: "Hasil asesmen komprehensif menunjukkan bahasa cinta utamamu adalah Words of Affirmation. Kamu paling merasa dihargai dan dicintai melalui kata-kata verbal yang tulus, apresiasi spesifik, dan komunikasi yang membangun.",
            makna: "Implikasi bagi Hubungan: Pujian yang tulus, ucapan terima kasih yang jujur, dan kata-kata penyemangat memiliki dampak emosional yang mendalam bagimu dalam memperkuat ikatan hubungan interpersonal.",
            kekuatanUtama: [
              "Kemampuan mengekspresikan apresiasi verbal yang menyejukkan dan memvalidasi perasaan orang lain.",
              "Sensitivitas tinggi terhadap nada bicara dan kebutuhan emosional pasangan atau sahabat.",
              "Komunikasi afektif yang membangun rasa aman, keterbukaan, dan kepercayaan jangka panjang."
            ],
            blindspots: [
              "Sangat sensitif terhadap kritik pedas, nada bicara ketus, atau sarkasme ringan dari orang terdekat.",
              "Dapat meragukan ketulusan atau kasih sayang orang lain jika tidak dinyatakan secara verbal berulang kali.",
              "Kerap menahan kekecewaan sendiri demi menjaga suasana verbal tetap positif di depan orang lain."
            ],
            lingkunganOptimal: [
              "Lingkungan relasi personal dan kerja yang mengedepankan budaya apresiatif serta umpan balik positif.",
              "Dinamika kelompok kerja yang saling menghargai usaha anggota tim secara transparan.",
              "Pola interaksi yang asertif, jujur, dan bebas dari sindiran atau sarkasme pasif."
            ],
            saran: [
              { title: "Komunikasikan Terbuka", desc: "Ungkapkan pada pasangan atau sahabat bahwa apresiasi verbal sangat berarti untukmu." },
              { title: "Catat Kata-kata Berharga", desc: "Simpan pesan atau catatan penyemangat sebagai pengingat saat menghadapi hari yang berat." },
              { title: "Latih Self-Compassion", desc: "Ucapkan kata-kata apresiasi dan validasi positif pada dirimu sendiri setiap hari." }
            ]
          }
        ],
        updatedAt: "18 Okt 2026"
      }
    ]
  }
];

