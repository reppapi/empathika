export const UNIVERSAL_PAID_BENEFITS = [
  "Hasil analisis sesuai jenis psikotes yang dipilih",
  "Interpretasi hasil dan karakteristik secara mendalam",
  "Insight mengenai potensi, kelebihan, dan area pengembangan diri",
  "Rekomendasi dan panduan pengembangan diri sesuai hasil asesmen",
];

export const UNIVERSAL_FREE_BENEFITS = [
  "Akses pengerjaan asesmen secara online tanpa biaya",
  "Hasil skor dan profil asesmen langsung keluar",
  "Ringkasan interpretasi hasil dan makna bagi peserta",
  "Tips dasar dan saran aksi pengembangan praktis",
];

export const TEST_DATA = {
  "mbti": {
    id: "mbti",
    title: "Tes Online 16 Kepribadian (MBTI)",
    subtitle: "Pahami potensi diri, cara berpikir, dan preferensi lingkungan kerjamu.",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80",
    themeColor: "#f48520",
    description: "Tes MBTI (Myers-Briggs Type Indicator) dirancang untuk mengukur preferensi psikologis dalam memandang dunia dan membuat keputusan. Melalui tes ini, kamu dapat menemukan satu dari 16 tipe kepribadian yang paling sesuai dengan karakteristikmu.",
    benefits: [
      "Menemukan potensi tersembunyi yang ada di dalam dirimu.",
      "Mengetahui gaya belajar dan gaya kerja yang paling optimal.",
      "Membantu menentukan jalur karir yang sesuai dengan minat dan bakat.",
      "Meningkatkan kemampuan komunikasi dengan tipe kepribadian yang berbeda."
    ],
    guidelines: [
      "Jawab setiap pertanyaan dengan jujur sesuai dengan dirimu. Tidak ada jawaban benar atau salah.",
      "Tidak ada batas waktu, jadi kerjakan dengan santai dan nyaman.",
      "Pastikan berada di tempat yang tenang dan bebas gangguan.",
      "Selesaikan tes dalam satu sesi karena progres akan hilang jika keluar.",
      "Setelah selesai, kamu akan mendapatkan laporan hasil tes lengkap."
    ],
    duration: "15 Menit",
    questions: "60 Pertanyaan",
    price: 50000,
    formattedPrice: "Rp 50.000",
    paidPackageName: "Laporan Hasil Psikotes Lengkap (PDF)",
    paidBenefits: UNIVERSAL_PAID_BENEFITS,
    freeBenefits: UNIVERSAL_FREE_BENEFITS,
  },
  "mbti-2": {
    id: "mbti-2",
    title: "Tes Online 16 Kepribadian Lanjutan",
    subtitle: "Pahami secara mendalam potensi diri dan gaya kerjamu.",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80",
    themeColor: "#f0d164",
    description: "Tes lanjutan untuk mengukur preferensi psikologis secara lebih spesifik, memberikan pandangan yang lebih mendalam mengenai cara berinteraksi dan mengelola energi.",
    benefits: [
      "Mengenal sisi introvert atau ekstrovert secara mendalam.",
      "Mengetahui gaya belajar dan gaya kerja yang paling optimal.",
      "Membantu menentukan jalur karir yang sesuai dengan minat dan bakat.",
      "Meningkatkan kemampuan komunikasi dengan tipe kepribadian yang berbeda."
    ],
    guidelines: [
      "Jawab setiap pertanyaan dengan jujur sesuai dengan dirimu. Tidak ada jawaban benar atau salah.",
      "Tidak ada batas waktu, jadi kerjakan dengan santai dan nyaman.",
      "Pastikan berada di tempat yang tenang dan bebas gangguan.",
      "Selesaikan tes dalam satu sesi karena progres akan hilang jika keluar.",
      "Setelah selesai, kamu akan mendapatkan laporan hasil tes lengkap."
    ],
    duration: "15 Menit",
    questions: "60 Pertanyaan",
    price: 75000,
    formattedPrice: "Rp 75.000",
    paidPackageName: "Laporan Hasil Psikotes Lengkap (PDF)",
    paidBenefits: UNIVERSAL_PAID_BENEFITS,
    freeBenefits: UNIVERSAL_FREE_BENEFITS,
  },
  "love-language": {
    id: "love-language",
    title: "Tes Love Language: 5 Bahasa Cinta",
    subtitle: "Ketahui cara terbaikmu menerima dan mengekspresikan kasih sayang.",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=1200&q=80",
    themeColor: "#e31e3d",
    description: "Tes Love Language atau Bahasa Cinta dikembangkan oleh Dr. Gary Chapman untuk membantu seseorang memahami bagaimana mereka lebih suka memberikan dan menerima kasih sayang. Mengetahui love language dapat meningkatkan kualitas hubungan dengan pasangan, keluarga, dan teman.",
    benefits: [
      "Memahami kebutuhan emosional diri sendiri.",
      "Meningkatkan empati dan cara berkomunikasi dengan orang terdekat.",
      "Mencegah kesalahpahaman dalam sebuah hubungan.",
      "Menemukan cara paling tepat untuk merasa dihargai dan dicintai."
    ],
    guidelines: [
      "Jawab setiap pertanyaan dengan jujur sesuai dengan dirimu. Tidak ada jawaban benar atau salah.",
      "Tidak ada batas waktu, jadi kerjakan dengan santai dan nyaman.",
      "Pastikan berada di tempat yang tenang dan bebas gangguan.",
      "Selesaikan tes dalam satu sesi karena progres akan hilang jika keluar.",
      "Setelah selesai, kamu akan mendapatkan laporan hasil tes lengkap."
    ],
    duration: "10 Menit",
    questions: "30 Pertanyaan",
    price: 40000,
    formattedPrice: "Rp 40.000",
    paidPackageName: "Laporan Hasil Psikotes Lengkap (PDF)",
    paidBenefits: UNIVERSAL_PAID_BENEFITS,
    freeBenefits: UNIVERSAL_FREE_BENEFITS,
  }
};

export const MOCK_QUESTIONS = [
  {
    id: 1,
    text: "Saat berada di lingkungan baru dengan banyak orang yang belum dikenal, kamu biasanya...",
    options: [
      "Secara aktif memulai percakapan dan berkenalan dengan banyak orang.",
      "Menunggu orang lain menyapa terlebih dahulu atau berbicara dengan sedikit orang saja."
    ]
  },
  {
    id: 2,
    text: "Dalam mengambil keputusan penting, kamu lebih sering mengandalkan...",
    options: [
      "Logika, analisis objektif, dan fakta yang ada.",
      "Perasaan, empati, dan dampaknya terhadap orang lain."
    ]
  },
  {
    id: 3,
    text: "Saat merencanakan liburan, gaya kamu adalah...",
    options: [
      "Membuat jadwal yang terperinci untuk setiap kegiatan setiap harinya.",
      "Lebih fleksibel, spontan, dan memutuskan kegiatan saat berada di tempat."
    ]
  },
  {
    id: 4,
    text: "Setelah melewati minggu yang panjang dan melelahkan, cara terbaikmu memulihkan energi adalah...",
    options: [
      "Pergi keluar, bertemu teman-teman, atau menghadiri acara sosial.",
      "Tinggal di rumah, membaca buku, menonton film, atau menikmati waktu sendiri."
    ]
  }
];

export const RESULT_DATA = {
  testName: "Kalkulator Tingkat Stres",
  result: {
    prefix: "Tingkat stresmu tergolong",
    value: "Tinggi",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  interpretation: "Berdasarkan hasil tes, tingkat stres yang kamu alami saat ini berada pada kategori tinggi. Ini berarti kamu mungkin sedang menghadapi beban pikiran atau tekanan yang cukup berat dalam keseharianmu.",
  meaning: "Berada di tingkat stres yang tinggi bukan berarti kamu lemah, namun ini adalah sinyal dari tubuh dan pikiranmu bahwa kamu memerlukan waktu untuk beristirahat. Jika terus dibiarkan, stres tingkat tinggi dapat memengaruhi produktivitas, suasana hati, hingga kesehatan fisik. Sangat penting untuk mulai memperhatikan batasan diri dan mencari cara untuk mengelola stres tersebut.",
  tips: [
    {
      title: "Beri Waktu Jeda",
      desc: "Luangkan waktu 15-30 menit setiap hari tanpa gangguan untuk relaksasi, meditasi, atau sekadar melakukan hobi ringan."
    },
    {
      title: "Cerita pada Orang Terdekat",
      desc: "Membagikan beban pikiran pada seseorang yang kamu percaya bisa membantu mengurangi tekanan emosional."
    },
    {
      title: "Atur Prioritas",
      desc: "Fokus pada hal-hal yang paling penting dan mendesak. Jangan ragu untuk mengatakan 'tidak' jika kapasitasmu sudah penuh."
    }
  ],
  recommendations: [
    {
      id: "introvert-ekstrovert",
      topTitle: "TES INTROVERT / EKSTROVERT",
      topSubtitle: "Kenali energimu",
      bottomTitle: "Tes Kepribadian Introvert/Ekstrovert",
      desc: "Kenali lebih dalam tentang energimu dan bagaimana kamu berinteraksi dengan lingkungan sekitar.",
      bgColor: "bg-[#f48520]",
      titleColor: "text-white",
      shape: "circles",
    },
    {
      id: "kesiapan-karir",
      topTitle: "TES KESIAPAN KARIR",
      topSubtitle: "Siap kerja?",
      bottomTitle: "Tes Kesiapan Karir",
      desc: "Ukur seberapa siap kamu menghadapi tantangan di dunia profesional saat ini.",
      bgColor: "bg-[#f0d164]",
      titleColor: "text-gray-900",
      shape: "circles-dark",
    }
  ]
};
