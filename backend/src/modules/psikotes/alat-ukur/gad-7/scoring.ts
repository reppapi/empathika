export interface GAD7CalculationResult {
  totalSkor: number;
  kategori: string;
  grade: string;
  deskripsi: string;
  catatanKlinis: string[];
  saran: string[];
  dampakAktivitas?: string;
}

export const GAD7_LEVELS = [
  {
    min: 0,
    max: 4,
    grade: "Minimal",
    kategori: "Kecemasan Minimal",
    deskripsi:
      "Tingkat kecemasan kamu berada dalam batas normal dan adaptif. Gejala kecemasan harian tidak mengganggu kestabilan emosi dan rutinitasmu.",
    saran: [
      "Pertahankan pola hidup sehat, waktu tidur teratur, dan rutinitas relaksasi harian.",
      "Tetap sadari pemicu stres kecil agar tidak menumpuk di kemudian hari.",
    ],
  },
  {
    min: 5,
    max: 9,
    grade: "Ringan",
    kategori: "Kecemasan Ringan",
    deskripsi:
      "Kamu mengalami beberapa gejala kecemasan ringan yang mungkin dipicu oleh tekanan pekerjaan, studi, atau situasi tertentu.",
    saran: [
      "Luangkan waktu jeda (istirahat berkualitas) di sela-sela kesibukan rutinitas.",
      "Praktikkan teknik pernapasan dalam (deep breathing) atau mindfulness ketika rasa khawatir mulai muncul.",
      "Ceritakan hal-hal yang mengganjal pikiran kepada orang terdekat yang kamu percayai.",
    ],
  },
  {
    min: 10,
    max: 14,
    grade: "Sedang",
    kategori: "Kecemasan Sedang",
    deskripsi:
      "Gejala kecemasan kamu berada pada tingkat sedang dan kemungkinan mengarah pada Generalized Anxiety Disorder (GAD). Rasa khawatir sudah mulai mempengaruhi konsentrasi dan kenyamanan aktivitas harian.",
    saran: [
      "Sangat disarankan untuk menjadwalkan sesi konseling dengan psikolog atau konselor profesional.",
      "Identifikasi pola pikiran negatif yang sering berulang dan mulai buat batasan terhadap sumber pemicu stres berlebih.",
      "Lakukan aktivitas fisik ringan secara teratur untuk membantu pelepasan hormon penenang alami tubuh.",
    ],
  },
  {
    min: 15,
    max: 21,
    grade: "Berat",
    kategori: "Kecemasan Berat",
    deskripsi:
      "Kondisi kecemasan kamu berada pada tingkat berat yang signifikan. Gejala ini memerlukan perhatian serius dan bantuan profesional agar tidak berkembang menjadi kondisi yang lebih membebani.",
    saran: [
      "Sangat direkomendasikan untuk segera berkonsultasi dengan psikolog klinis atau psikiater untuk asesmen mendalam.",
      "Jangan memendam beban sendirian, mintalah dukungan dari keluarga atau support system terdekat.",
      "Hindari konsumsi stimulan berlebih seperti kafein tinggi yang dapat memicu detak jantung lebih cepat.",
    ],
  },
];

const DIFFICULTY_MAP: Record<number, string> = {
  0: "Tidak menyulitkan sama sekali",
  1: "Sedikit menyulitkan",
  2: "Sangat menyulitkan",
  3: "Luar biasa menyulitkan",
};

export function calculateGAD7(jawabanPeserta: Record<number | string, number | string>): GAD7CalculationResult {
  // 1. Hitung total skor dari 7 butir pertanyaan pokok (nilai 0 - 3 per butir)
  let totalSkor = 0;
  for (let no = 1; no <= 7; no++) {
    const rawVal = jawabanPeserta[no] ?? jawabanPeserta[String(no)];
    const val = Number(rawVal);
    if (!isNaN(val)) {
      totalSkor += Math.max(0, Math.min(3, val));
    }
  }

  // 2. Tentukan kategori berdasarkan rentang skor 0-21
  const level =
    GAD7_LEVELS.find((lvl) => totalSkor >= lvl.min && totalSkor <= lvl.max) ||
    GAD7_LEVELS[GAD7_LEVELS.length - 1];

  // 3. Evaluasi catatan klinis berdasarkan standar Spitzer & Kroenke
  const catatanKlinis: string[] = [];
  if (totalSkor >= 8) {
    catatanKlinis.push(
      "Skor mencapai atau melebihi ambang cut-off 8: Mengindikasikan perlunya skrining lanjutan terhadap kemungkinan gejala Panic Disorder, Social Anxiety Disorder, atau PTSD."
    );
  }
  if (totalSkor >= 10) {
    catatanKlinis.push(
      "Skor berada pada kategori kecemasan sedang/berat (skor >= 10): Mengindikasikan kemungkinan Generalized Anxiety Disorder (GAD)."
    );
  }

  // 4. Periksa evaluasi dampak kesulitan aktivitas (item nomor 8 jika ada)
  const rawDifficulty = jawabanPeserta[8] ?? jawabanPeserta["8"];
  const difficultyText =
    rawDifficulty !== undefined && rawDifficulty !== null
      ? DIFFICULTY_MAP[Number(rawDifficulty)]
      : undefined;

  return {
    totalSkor,
    kategori: level.kategori,
    grade: level.grade,
    deskripsi: level.deskripsi,
    catatanKlinis,
    saran: level.saran,
    dampakAktivitas: difficultyText,
  };
}

