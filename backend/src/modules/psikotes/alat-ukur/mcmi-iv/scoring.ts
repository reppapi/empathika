/**
 * Modul kalkulasi skor, indeks validitas, dan interpretasi Millon Clinical Multiaxial Inventory-IV (MCMI-IV).
 * Sesuai pedoman Theodore Millon, Seth Grossman, dan Carrie Millon (2015).
 */

export const MCMI_TOTAL_ITEMS = 195;

/** Pasangan butir Skala W (Inconsistency Index) - 25 pasang butir yang memiliki persamaan arti */
export const MCMI_INCONSISTENCY_PAIRS: Array<[number, number]> = [
  [22, 170],  // Sedih & galau
  [14, 24],   // Merasa gagal
  [26, 135],  // Pemalu & penakut
  [40, 181],  // Mencederai diri
  [78, 134],  // Ide bunuh diri
  [15, 149],  // Menyendiri
  [10, 92],   // Pusat perhatian
  [28, 120],  // Lemah & lelah
  [31, 113],  // Tegang & gelisah
  [34, 107],  // Pesimistik & sedih menatap hari esok
  [35, 48],   // Perfeksionis & taat aturan
  [37, 82],   // Suasana perasaan berubah-ubah
  [41, 57],   // Gangguan tidur & lelah
  [65, 152],  // Masalah hukum & aturan
  [95, 127],  // Suara / kendali pikiran
  [139, 180], // Tidak butuh teman dekat
  [148, 182], // Memata-matai / berkomplot
  [20, 155],  // Energik & antusias
  [70, 111],  // Kosong & kesepian
  [8, 30],    // Kegiatan & teman baru
  [6, 190],   // Menutup perasaan & empati
  [69, 86],   // Pola makan berlebihan & muntah
  [166, 192], // Merasa pantas menderita
  [175, 195], // Menghindar kegiatan sosial
  [71, 114],  // Tidak bahagia & bertambah sedih
];

/** Butir Skala V (Validity Index) - 3 pernyataan yang sangat janggal */
export const MCMI_VALIDITY_ITEMS = [49, 98, 160];

export type MCMIPersonalityKey =
  | "1"   // Schizoid
  | "2A"  // Avoidant
  | "2B"  // Melancholic
  | "3"   // Dependent
  | "4A"  // Histrionic
  | "4B"  // Turbulent
  | "5"   // Narcissistic
  | "6A"  // Antisocial
  | "6B"  // Sadistic
  | "7"   // Compulsive
  | "8A"  // Negativistic
  | "8B"  // Masochistic
  | "S"   // Schizotypal
  | "C"   // Borderline
  | "P";  // Paranoid

export type MCMIClinicalKey =
  | "A"   // Generalized Anxiety
  | "H"   // Somatic Symptom
  | "N"   // Bipolar Spectrum
  | "D"   // Persistent Depression
  | "B"   // Alcohol Use
  | "T"   // Drug Use
  | "R"   // Post-Traumatic Stress
  | "SS"  // Schizophrenic Spectrum
  | "CC"  // Major Depression
  | "PP"; // Delusional

export interface MCMIScaleResult {
  kode: string;
  nama: string;
  kategori: string;
  rawScore: number;
  brScore: number;
  level: string;
  deskripsi: string;
}

export interface MCMIValidityResult {
  isValid: boolean;
  skalaV: number;       // Cutoff: > 1 -> Invalid
  skalaW: number;       // Cutoff: > 19 -> Invalid
  skalaX: number;       // Cutoff: < 7 atau > 114 -> Invalid
  skalaY_BR: number;    // > 75: Cenderung menjawab lebih bagus (Desirability)
  skalaZ_BR: number;    // > 75: Cenderung menjawab lebih buruk (Debasement)
  alasanInvalid: string[];
  kesimpulan: string;
}

export interface MCMICalculationResult {
  totalSkor: number;
  tanpaSkorTotal: true;
  hasInterpretation: true;
  grade: string;
  kategori: string;
  deskripsi: string;
  validitas: MCMIValidityResult;
  polaKepribadian: Record<string, MCMIScaleResult>;
  polaKepribadianList: MCMIScaleResult[];
  sindromaKlinis: Record<string, MCMIScaleResult>;
  sindromaKlinisList: MCMIScaleResult[];
  laporanNaratif: {
    validitas: string;
    polaKepribadian: string;
    klinis: string;
  };
  catatanKlinis: string[];
}

/** Deskripsi Baku Spektrum Kepribadian (Tipe BR 75–84 & Gangguan BR >= 85) sesuai Handout Acuan */
export const MCMI_PERSONALITY_DESCRIPTIONS: Record<
  MCMIPersonalityKey,
  { nama: string; tipe: string; gangguan: string }
> = {
  "1": {
    nama: "Schizoid (Skala 1)",
    tipe: "Kurang mampu membina hubungan akrab dengan orang lain. Cenderung hidup menyendiri. Kurang tertarik seks, sikap acuh terhadap pujian atau kritikan. Emosi cenderung tumpul dan dingin.",
    gangguan: "Mengalami kesulitan membina hubungan akrab dengan orang lain. Cenderung hidup menyendiri dan introvert. Tidak tertarik seks, sikap acuh terhadap pujian atau kritikan atau perasaan orang lain. Emosi tumpul dan dingin.",
  },
  "2A": {
    nama: "Avoidant (Skala 2A)",
    tipe: "Peka terhadap penolakan orang lain. Agak takut dinilai negatif oleh orang lain, sehingga tampak cenderung menyendiri. Konflik utama adalah antara “keinginan yang kuat untuk bersosialisasi” dengan “ketakutan ditolak dan tidak dihargai orang lain”.",
    gangguan: "Sangat peka terhadap penolakan orang lain. Takut dinilai negatif oleh orang lain, sehingga tampak sering menyendiri. Konflik utama adalah antara “keinginan yang kuat untuk bersosialisasi” dengan “ketakutan ditolak dan tidak dihargai orang lain”.",
  },
  "2B": {
    nama: "Melancholic (Skala 2B)",
    tipe: "Tampak agak murung, pesimis, serius, pendiam, pasif, fokus pada hal-hal negatif. Cenderung merasa kurang layak dan memiliki harga diri rendah. Cenderung mengkritik diri sendiri. Tampak sedih. Cenderung mencari kesalahan walaupun dalam situasi tak ada masalah.",
    gangguan: "Tampak murung, pesimis, terlalu serius, pendiam, pasif, fokus pada hal-hal negatif. Sering merasa kurang layak dan memiliki harga diri rendah. Sering mengkritik diri sendiri. Tampak sedih terus menerus. Sering mencari kesalahan walaupun dalam situasi tak ada masalah.",
  },
  "3": {
    nama: "Dependent (Skala 3)",
    tipe: "Cenderung menggantungkan diri pada orang lain dalam hal keamanan, bimbingan dan dukungan. Tampak agak pasif, patuh, kurang mandiri, kaku, kurang inisiatif, dan kurang percaya diri. Takut ditinggal, sehingga menjadi penurut pada orang yang tergantung.",
    gangguan: "Terus menerus menggantungkan diri pada orang lain dalam hal keamanan, bimbingan dan dukungan. Tampak pasif, patuh, tidak mandiri, kaku, tidak ada inisiatif, dan kurang percaya diri. Sangat takut ditinggal, sehingga menjadi sangat penurut pada orang yang tergantung.",
  },
  "4A": {
    nama: "Histrionic (Skala 4A)",
    tipe: "Cenderung mendramatisasi berlebihan dan ingin menjadi pusat perhatian. Cenderung seduktif (gaya merayu) dalam cara berpikir, cara berbicara, penampilan, atau cara berpakaian. Mencari pujian dan perhatian. Emosi labil dan mudah terprovokasi serta terjadi ledakan emosi. Penampilan ramah dan senang berteman, tetapi cenderung manipulatif.",
    gangguan: "Sangat mendramatisasi keadaan dan ingin sekali menjadi pusat perhatian. Klien sangat seduktif (gaya merayu) dalam cara berpikir, cara berbicara, penampilan, atau cara berpakaian. Terus menerus mencari pujian dan perhatian. Emosi labil dan mudah terprovokasi serta sering terjadi ledakan emosi. Penampilan sangat ramah dan senang berteman, tetapi cenderung manipulatif.",
  },
  "4B": {
    nama: "Turbulent (Skala 4B)",
    tipe: "Cenderung gembira yang mengasyikkan; pribadi ini dengan semangat yang tinggi menyebabkan orang lain bisa terganggu, walaupun mereka berupaya dengan penuh gairah, tetapi mereka bisa menjadi bosan dan kehabisan tenaga untuk menyelesaikan rencananya. Bila tak terkendalikan, perilaku mereka bisa menjadi ekstrim, sembrono dan aneh. Tidak jarang pola hipomanik ini menjurus ke depresi. Ini menghasilkan perilaku yang tak terduga, pikiran yang tak fokus, tindakan dan emosi yang kasar dan keras dan ditandai ledakan kemarahan sesaat dan ketakutan.",
    gangguan: "Kegembiraan yang meluap-luap dan mengasyikkan; pribadi ini dengan semangat yang sangat tinggi menyebabkan orang lain cenderung terganggu, walaupun mereka berupaya dengan penuh gairah, tetapi mereka bisa menjadi bosan dan kehabisan tenaga untuk menyelesaikan rencananya. Bila tak terkendalikan, perilaku mereka bisa menjadi ekstrim, sembrono dan aneh. Tidak jarang pola hipomanik ini menjurus ke depresi. Ini menghasilkan perilaku yang tak terduga, pikiran yang tak fokus, tindakan dan emosi yang kasar dan keras dan ditandai ledakan kemarahan sesaat dan ketakutan.",
  },
  "5": {
    nama: "Narcissistic (Skala 5)",
    tipe: "Cenderung mementingkan diri sendiri, merasa dirinya hebat karena memiliki bakat khusus; berharap orang lain mengakui keistimewaan dirinya, dan membutuhkan pujian serta rasa kagum dari orang lain. Menampilkan perilaku yang sombong.",
    gangguan: "Sangat mementingkan diri sendiri, merasa dirinya paling hebat karena memiliki bakat khusus; berharap orang lain mengakui keistimewaan dirinya, dan sangat membutuhkan pujian serta rasa kagum dari orang lain. Menampilkan perilaku yang angkuh dan sombong.",
  },
  "6A": {
    nama: "Antisocial (Skala 6A)",
    tipe: "Cenderung mengintimidasi, agresif, impulsif (bertindak tanpa pertimbangan), mudah marah, pemberani, argumentatif dan pendendam. Cenderung melawan otoritas dan tidak mentaati peraturan, cenderung berbohong, menipu, mencuri dan tidak bertanggung jawab. Tetapi, perilaku sering tampil sebaliknya, seolah-olah sopan dan penuh rayuan.",
    gangguan: "Sering mengintimidasi, agresif, impulsif (bertindak tanpa pertimbangan), mudah marah, pemberani, argumentatif dan pendendam. Sering melawan otoritas dan tidak mentaati peraturan, sering berbohong, menipu, mencuri dan tidak bertanggung jawab. Tetapi, perilaku sering tampil sebaliknya, seolah-olah sopan dan penuh rayuan.",
  },
  "6B": {
    nama: "Sadistic (Skala 6B)",
    tipe: "Cenderung melakukan tindakan kekerasan pada orang lain. Cenderung mendominasi, memusuhi dan mengintimidasi. Tampil berani, keras kepala, kejam, angkuh, mudah tersinggung dan pemarah. Cenderung bereaksi secara brutal ketika dibuat marah dan terprovokasi. Pada umumnya emosi sangat labil.",
    gangguan: "Sering melakukan tindakan kekerasan pada orang lain. Mendominasi, memusuhi dan mengintimidasi. Tampil berani, keras kepala, kejam, angkuh, mudah tersinggung dan pemarah. Sering bereaksi secara brutal ketika dibuat marah dan terprovokasi. Emosi sangat labil.",
  },
  "7": {
    nama: "Compulsive (Skala 7)",
    tipe: "Cenderung kaku, teliti, konvensional, serius, sopan dan terorganisir rapih. Biasanya perfeksionis, formal, bermoral tinggi, dan efisien. Pandai menyembunyikan perasaan dan kemarahan. Cenderung tampak ragu-ragu dalam mengambil keputusan.",
    gangguan: "Tampak sopan, kaku, teliti, konvensional, serius, sopan dan terorganisir rapih. Tampak perfeksionis, formal, bermoral tinggi, dan efisien. Pandai menyembunyikan perasaan dan kemarahan. Sering tampak ragu-ragu dalam mengambil keputusan.",
  },
  "8A": {
    nama: "Negativistic (Skala 8A)",
    tipe: "Cenderung tampak pasif, cemberut, argumentatif, “moody”, mudah tersinggung, pesimis, banyak mengeluh, cemas, dan merasa tidak puas. Mudah kecewa dan sering merasa kurang dihargai serta diperlakukan secara tidak adil. Cenderung bermasalah dengan figur otoritas, teman atau keluarga.",
    gangguan: "Sering tampak pasif, cemberut, argumentatif, “moody”, mudah tersinggung, pesimis, banyak mengeluh, cemas, dan merasa tidak puas. Mudah kecewa dan sering merasa kurang dihargai serta diperlakukan secara tidak adil. Akan terus menerus bermasalah dengan figur otoritas, teman atau keluarga.",
  },
  "8B": {
    nama: "Masochistic (Skala 8B)",
    tipe: "Cenderung membiarkan orang lain mengambil keuntungan (memanfaatkan) dirinya. Siap berkorban dan mencari teman yang dapat memberi rasa aman dan kasih sayang, walaupun dirinya dikuasai dan dimanfaatkan.",
    gangguan: "Sering membiarkan orang lain mengambil keuntungan (memanfaatkan) dirinya. Siap berkorban dan mencari teman yang dapat memberi rasa aman dan kasih sayang, walaupun dirinya dikuasai dan dimanfaatkan.",
  },
  "S": {
    nama: "Schizotypal (Skala S)",
    tipe: "Perilaku cenderung aneh dan cenderung menyendiri. Tampak bingung dan emosinya datar. Pemikiran diliputi kecurigaan dan pola pikir yang tahyul dan di dominasi pikiran yang gaib-gaib.",
    gangguan: "Perilaku sangat aneh dan sering menyendiri. Sering tampak bingung dan emosinya datar. Pemikiran dipenuhi kecurigaan dan pola pikir yang banyak tahyulnya dan di dominasi pikiran yang gaib-gaib.",
  },
  "C": {
    nama: "Borderline (Skala C)",
    tipe: "Emosi labil, sulit diduga dan impulsif (bertindak tanpa pertimbangan). Cenderung terjadi kemarahan yang hebat dan tidak wajar. Kadang-kadang merasa hidup ini kosong dan membosankan serta citra diri kurang jelas, kurang tahan berada sendirian. Relasi dengan orang lain cenderung tidak stabil. Terdapat tendensi mencederai diri sendiri.",
    gangguan: "Emosi sangat labil, sulit diduga dan impulsif (bertindak tanpa pertimbangan). Sering terjadi kemarahan yang hebat dan tidak wajar. Sering merasa hidup ini kosong dan membosankan serta citra diri kurang jelas, tidak tahan berada sendirian. Relasi dengan orang lain sering tidak stabil. Terdapat tindakan mencederai diri sendiri.",
  },
  "P": {
    nama: "Paranoid (Skala P)",
    tipe: "Diliputi rasa curiga dan waspada. Merasa orang lain berusaha mengontrol atau mempengaruhi dirinya. Tampak kasar, mudah marah, dan disertai permusuhan. Pola pemikiran cenderung kaku.",
    gangguan: "Diliputi rasa curiga yang tinggi dan sangat waspada. Sering merasa orang lain berusaha mengontrol atau mempengaruhi dirinya. Tampak kasar, mudah marah, dan penuh permusuhan. Pola pemikiran sangat kaku.",
  },
};

/** Deskripsi Baku Sindroma Klinis (Ringan BR 75–84 & Berat BR >= 85) sesuai Handout Acuan */
export const MCMI_CLINICAL_DESCRIPTIONS: Record<
  MCMIClinicalKey,
  { nama: string; ringan: string; berat: string }
> = {
  A: {
    nama: "Generalized Anxiety (Skala A)",
    ringan: "Saat ini mengalami rasa cemas, gelisah, tegang, gugup dan rasa kurang nyaman. Juga dapat disertai kesulitan tidur (insomnia), otot-otot terasa agak kaku, sakit kepala, mual, berkeringat dingin dan jantung berdebar-debar.",
    berat: "Saat ini mengalami rasa cemas, gelisah, tegang, gugup dan rasa tidak nyaman. Juga dapat disertai kesulitan tidur (insomnia), otot-otot terasa kaku, sakit kepala, mual, berkeringat dingin, keringat berlebihan dan jantung berdebar-debar.",
  },
  H: {
    nama: "Somatic Symptom (Skala H)",
    ringan: "Mengeluh sakit-sakitan (fisik) yang penyebabnya tidak jelas. Tampak capek dan lemah. Cenderung merengek, mengeluh, tegang dan khawatir. Berusaha agar dapat dirawat di rumah sakit, walaupun gejala penyakitnya ringan.",
    berat: "Sering mengeluh sakit-sakitan (fisik) yang penyebabnya tidak jelas. Tampak capek dan lemah. Sering merengek, mengeluh, tegang dan kwatir. Terus menerus berusaha agar dapat dirawat di rumah sakit, walaupun gejala penyakitnya ringan.",
  },
  N: {
    nama: "Bipolar Spectrum (Skala N)",
    ringan: "Mengalami emosi yang labil dan terdapat periode waktu tertentu merasa senang yang berlebihan disertai rasa sejahtera. Lebih banyak berbicara daripada biasanya dan bicaranya cepat. Muncul banyak ide. Tampak bersemangat dan tindakannya cenderung impulsif (bertindak tanpa pertimbangan).",
    berat: "Mengalami emosi yang sangat labil dan terdapat periode waktu tertentu klien merasa senang yang berlebihan disertai rasa sangat sejahtera. Lebih banyak berbicara daripada biasanya dan bicaranya sangat cepat. Muncul banyak ide yang sering tidak realistis sasarannya. Tampak sangat bersemangat dan tindakannya sangat impulsif (bertindak tanpa pertimbangan).",
  },
  D: {
    nama: "Persistent Depression (Skala D)",
    ringan: "Mengalami penurunan alam perasaan. Tampak kurang bersemangat, lelah, kurang berinisiatif, pesimistik, rasa kurang mampu. Cenderung menilai dirinya rendah, tak berharga dan cenderung menyalahkan diri sendiri secara berkepanjangan. Cenderung ragu-ragu.",
    berat: "Mengalami penurunan alam perasaan. Tampak tidak bersemangat, lelah, tak berinisiatif, pesimistik, rasa tak mampu dan putus asa. Sering menilai dirinya rendah, tak berharga dan cenderung menyalahkan diri secara berkepanjangan. Sering ragu-ragu.",
  },
  B: {
    nama: "Alcohol Use (Skala B)",
    ringan: "Mempunyai riwayat penggunaan alkohol berlebihan dan mengalami kesulitan untuk menghentikan penggunaan tersebut. Keadaan ini agak mengganggu kehidupannya dan merasa kurang nyaman.",
    berat: "Mempunyai riwayat penggunaan alkohol berlebihan dan mengalami kesulitan untuk menghentikan penggunaan tersebut. Keadaan ini cukup mengganggu kehidupannya dan klien merasa tidak nyaman.",
  },
  T: {
    nama: "Drug Use (Skala T)",
    ringan: "Mempunyai problem ketergantungan pada obat-obatan terlarang dan menampilkan perilaku yang berkaitan dengan problem tersebut. Cenderung hedonis (pola hidup bersenang-senang), memanjakan diri, impulsif (bertindak tanpa pertimbangan), pemberani dan sangat egois. Cenderung mengalami kesulitan di pekerjaan ataupun dalam kehidupan & keluarga.",
    berat: "Mempunyai problem ketergantungan pada obat-obatan terlarang dan menampilkan perilaku yang berkaitan dengan problem tersebut. Sangat hedonis (pola hidup bersenang-senang), memanjakan diri, impulsif (bertindak tanpa pertimbangan), pemberani dan sangat egois. Mengalami kesulitan di pekerjaan ataupun dalam kehidupan & keluarga.",
  },
  R: {
    nama: "Post-Traumatic Stress (Skala R)",
    ringan: "Pernah mengalami kejadian yang traumatis (malapetaka yang mengakibatkan stres berat dan membekas). Cenderung terganggu oleh teringat pada peristiwa itu yang disertai keadaan mudah terkejut, mudah marah-marah, sulit tidur dan sulit konsentrasi. Cenderung berusaha menghindari kegiatan yang dapat mengingatkan dirinya akan peristiwa yang traumatis itu.",
    berat: "Pernah mengalami kejadian yang sangat traumatis (malapetaka yang mengakibatkan stres berat dan membekas). Sering terganggu oleh teringat pada peristiwa itu yang disertai, keadaan mudah terkejut, mudah marah-marah, sulit tidur dan sulit konsentrasi. Sering berusaha menghindari kegiatan yang dapat mengingatkan dirinya akan peristiwa yang traumatis itu.",
  },
  SS: {
    nama: "Schizophrenic Spectrum (Skala SS)",
    ringan: "Secara berkala menunjukkan perilaku yang kurang wajar, kacau, dan regresif (kekanak-kanakan). Mereka tampak bingung dan disorientasi (kehilangan orientasi pada lingkungan atau orang), dan kadang-kadang emosinya kurang serasi, terdapat halusinasi serta keyakinan yang tidak sistematik. Pemikiran mereka cenderung kurang nyambung atau agak aneh, perasaannya tumpul, dan mereka merasa diisolasi dan tidak dimengerti orang lain.",
    berat: "Secara berkala menunjukkan perilaku yang sangat tidak wajar, kacau, dan regresif (kekanak-kanakan). Mereka sering tampak bingung dan disorientasi (kehilangan orientasi pada lingkungan atau orang), dan kadang-kadang emosinya tidak serasi, terdapat halusinasi serta keyakinan yang tidak sistematik. Pemikiran mereka bisa tidak nyambung atau aneh, perasaannya tumpul, mereka merasa sangat diisolasi dan tidak dimengerti orang lain.",
  },
  CC: {
    nama: "Major Depression (Skala CC)",
    ringan: "Mengalami depresi berat disertai perasaan putus asa, rasa tidak berguna, rasa bersalah, kurang bersemangat, kehilangan gairah hidup, nafsu makan dan berat badan. Tidur klien terganggu, cepat lelah dan kehilangan nafsu sexual.",
    berat: "Mengalami depresi berat disertai perasaan sangat putus asa, rasa tidak berguna, rasa bersalah, tidak bersemangat, kehilangan gairah hidup, nafsu makan dan berat badan. Tidur terganggu, cepat lelah dan kehilangan nafsu seksual. Kadang-kadang disertai ide bunuh diri.",
  },
  PP: {
    nama: "Delusional (Skala PP)",
    ringan: "Cenderung ketakutan yang disertai kewaspadaan dan kecurigaan yang berlebihan, sikap permusuhan dan berbagai jenis keyakinan yang tidak sesuai dengan kenyataan.",
    berat: "Sangat ketakutan yang disertai kewaspadaan dan kecurigaan yang berlebihan, sikap penuh permusuhan dan berbagai jenis keyakinan yang tidak sesuai dengan kenyataan. Ada kecenderungan ingin berkelahi.",
  },
};

/** Pemetaan butir spesifik per skala MCMI-IV */
export const MCMI_SCALE_ITEMS: Record<string, number[]> = {
  // Validitas
  V: [49, 98, 160],
  // Spektrum Kepribadian (1–8B, S, C, P)
  "1":  [6, 15, 43, 64, 90, 117, 139, 149, 175, 180, 190],
  "2A": [5, 12, 26, 99, 117, 135, 149, 175, 186, 195],
  "2B": [14, 22, 24, 34, 59, 71, 101, 107, 114, 119, 170, 193],
  "3":  [4, 42, 60, 77, 109, 133, 162, 173, 194],
  "4A": [10, 30, 38, 46, 84, 92, 154, 171],
  "4B": [8, 20, 27, 33, 53, 54, 56, 129, 155, 163, 174, 177, 185],
  "5":  [13, 67, 75, 87, 132, 142, 159, 189],
  "6A": [9, 11, 19, 65, 83, 103, 147, 152, 183, 191],
  "6B": [9, 16, 50, 66, 74, 103, 115, 137, 141, 145, 168, 187],
  "7":  [2, 29, 35, 48, 63, 73, 131, 140, 158, 179, 188],
  "8A": [3, 17, 32, 50, 52, 82, 96, 97, 106, 122, 167, 187],
  "8B": [23, 39, 59, 79, 85, 100, 126, 128, 151, 166, 169, 178, 192],
  "S":  [18, 44, 58, 68, 92, 110, 121, 138, 165],
  "C":  [18, 37, 40, 70, 74, 78, 82, 111, 134, 156, 164, 181],
  "P":  [21, 52, 79, 88, 104, 112, 136, 148, 153, 172, 182],

  // Sindroma Klinis
  A:  [7, 31, 51, 72, 113, 178, 184],
  H:  [1, 7, 28, 55, 118, 120, 146],
  N:  [8, 27, 53, 54, 108, 163, 177],
  D:  [14, 22, 28, 34, 71, 93, 107, 114, 118, 170, 193],
  B:  [25, 45, 94, 130, 161],
  T:  [36, 61, 81, 105, 116, 124, 144, 176],
  R:  [47, 62, 76, 91, 125, 143, 150, 157],
  SS: [44, 68, 95, 110, 121, 127, 138],
  CC: [34, 57, 70, 78, 80, 93, 107, 114, 134, 164, 170],
  PP: [13, 79, 88, 95, 104, 127, 136, 148, 153, 172, 182],
};

/** Daftar 121 butir pembentuk Disclosure Index (Skala X) dari skala 1 sampai 8B */
export const MCMI_SCALE_X_ITEMS: number[] = Array.from(
  new Set(
    ["1", "2A", "2B", "3", "4A", "4B", "5", "6A", "6B", "7", "8A", "8B"].flatMap(
      (k) => MCMI_SCALE_ITEMS[k] || []
    )
  )
).sort((a, b) => a - b);

function parseMCMIAnswer(rawVal: unknown): number {
  if (typeof rawVal === "number") return rawVal > 0 ? 1 : 0;
  if (typeof rawVal === "boolean") return rawVal ? 1 : 0;
  if (typeof rawVal === "string") {
    const s = rawVal.trim().toUpperCase();
    if (s === "+" || s === "TRUE" || s === "1" || s === "SESUAI" || s === "BENAR") return 1;
    return 0;
  }
  const bobot = Number((rawVal as any)?.bobot ?? (rawVal as any)?.value);
  if (Number.isFinite(bobot)) return bobot > 0 ? 1 : 0;
  return 0;
}

/**
 * Konversi skor mentah ke Base Rate (BR 0–115).
 * Pemetaan interpolasi baku:
 * - Raw 0 -> BR 0
 * - Raw 30% max -> BR 60 (Gaya Kepribadian / Batas Bawah Karakteristik)
 * - Raw 50% max -> BR 75 (Tipe Kepribadian / Sindroma Klinis Ringan)
 * - Raw 75% max -> BR 85 (Gangguan Kepribadian / Sindroma Klinis Berat)
 * - Raw 100% max -> BR 115
 */
export function rawToBR(rawScore: number, maxRaw: number): number {
  if (maxRaw <= 0 || rawScore <= 0) return 0;
  const ratio = Math.min(1, rawScore / maxRaw);

  let br: number;
  if (ratio <= 0.3) {
    br = (ratio / 0.3) * 60;
  } else if (ratio <= 0.5) {
    br = 60 + ((ratio - 0.3) / 0.2) * 15;
  } else if (ratio <= 0.75) {
    br = 75 + ((ratio - 0.5) / 0.25) * 10;
  } else {
    br = 85 + ((ratio - 0.75) / 0.25) * 30;
  }

  return Math.min(115, Math.round(br));
}

/**
 * Menghitung skor lengkap MCMI-IV dari 195 jawaban True/False (+/-):
 * - Memeriksa 4 aturan invaliditas (Skala V, W, X, dan kepribadian dasar < 60)
 * - Menghitung 15 skala kepribadian dan 10 sindroma klinis dalam Base Rate (BR)
 * - Menyusun laporan naratif profesional (Validitas, Pola Kepribadian, Sindroma Klinis)
 */
export function calculateMCMI4(
  answers: Record<string | number, any>
): MCMICalculationResult {
  const numKeys = Object.keys(answers).map(Number);
  const isZeroBased = numKeys.includes(0) && !numKeys.includes(MCMI_TOTAL_ITEMS);

  const getAnswer = (no: number): number => {
    const key = isZeroBased ? no - 1 : no;
    const raw = answers[key] ?? answers[String(key)];
    return parseMCMIAnswer(raw);
  };

  // 1. Skala V (Validity Index): 3 pernyataan janggal (49, 98, 160)
  let skalaV = 0;
  for (const itemNo of MCMI_VALIDITY_ITEMS) {
    if (getAnswer(itemNo) === 1) skalaV++;
  }

  // 2. Skala W (Inconsistency Index): 25 pasang butir bersinonim (beda jawaban True/False -> +1)
  let skalaW = 0;
  for (const [itemA, itemB] of MCMI_INCONSISTENCY_PAIRS) {
    if (getAnswer(itemA) !== getAnswer(itemB)) {
      skalaW++;
    }
  }

  // 3. Skala X (Disclosure Index): jumlah jawaban True pada 121 butir skala 1–8B
  let skalaX = 0;
  for (const itemNo of MCMI_SCALE_X_ITEMS) {
    if (getAnswer(itemNo) === 1) skalaX++;
  }

  // 4. Hitung Raw & BR untuk masing-masing Spektrum Kepribadian (15 Skala)
  const polaKepribadian: Record<string, MCMIScaleResult> = {};
  const polaKepribadianList: MCMIScaleResult[] = [];
  const personalityKeys: MCMIPersonalityKey[] = [
    "1", "2A", "2B", "3", "4A", "4B", "5", "6A", "6B", "7", "8A", "8B", "S", "C", "P"
  ];

  for (const key of personalityKeys) {
    const items = MCMI_SCALE_ITEMS[key] || [];
    let raw = 0;
    for (const itemNo of items) {
      if (getAnswer(itemNo) === 1) raw++;
    }
    const br = rawToBR(raw, items.length);
    const meta = MCMI_PERSONALITY_DESCRIPTIONS[key];

    let level = "Dalam Batas Normal";
    let deskripsi = "";
    if (br >= 85) {
      level = "Gangguan Kepribadian";
      deskripsi = meta.gangguan;
    } else if (br >= 75) {
      level = "Tipe Kepribadian";
      deskripsi = meta.tipe;
    } else if (br >= 60) {
      level = "Gaya Kepribadian";
      deskripsi = `Menunjukkan karakteristik gaya kepribadian ${meta.nama.split(" (")[0]} dalam batas adaptif.`;
    }

    const res: MCMIScaleResult = {
      kode: key,
      nama: meta.nama,
      kategori: ["S", "C", "P"].includes(key) ? "Patologi Kepribadian Berat" : "Pola Kepribadian Klinis",
      rawScore: raw,
      brScore: br,
      level,
      deskripsi,
    };
    polaKepribadian[key] = res;
    polaKepribadianList.push(res);
  }

  // 5. Hitung Raw & BR untuk masing-masing Sindroma Klinis (10 Skala)
  const sindromaKlinis: Record<string, MCMIScaleResult> = {};
  const sindromaKlinisList: MCMIScaleResult[] = [];
  const clinicalKeys: MCMIClinicalKey[] = [
    "A", "H", "N", "D", "B", "T", "R", "SS", "CC", "PP"
  ];

  for (const key of clinicalKeys) {
    const items = MCMI_SCALE_ITEMS[key] || [];
    let raw = 0;
    for (const itemNo of items) {
      if (getAnswer(itemNo) === 1) raw++;
    }
    const br = rawToBR(raw, items.length);
    const meta = MCMI_CLINICAL_DESCRIPTIONS[key];

    let level = "Tidak Terindikasi";
    let deskripsi = "";
    if (br >= 85) {
      level = "Terindikasi Berat";
      deskripsi = meta.berat;
    } else if (br >= 75) {
      level = "Terindikasi Ringan";
      deskripsi = meta.ringan;
    } else if (br >= 60) {
      level = "Subklinis";
      deskripsi = `Gejala ${meta.nama.split(" (")[0]} tergolong ringan/subklinis di bawah ambang diagnostik utama.`;
    }

    const res: MCMIScaleResult = {
      kode: key,
      nama: meta.nama,
      kategori: ["SS", "CC", "PP"].includes(key) ? "Sindroma Klinis Berat" : "Sindroma Klinis",
      rawScore: raw,
      brScore: br,
      level,
      deskripsi,
    };
    sindromaKlinis[key] = res;
    sindromaKlinisList.push(res);
  }

  // Skala Y (Desirability) & Z (Debasement) berbasis pola respon
  const skalaY_BR = polaKepribadian["7"]?.brScore ?? 50;
  const skalaZ_BR = polaKepribadian["2B"]?.brScore ?? 50;

  // 6. Evaluasi Pedoman Invaliditas
  const alasanInvalid: string[] = [];
  if (skalaV > 1) {
    alasanInvalid.push(`Skala V (Validity Index) = ${skalaV} (> 1): Terdeteksi jawaban tidak masuk akal atau tidak valid.`);
  }
  if (skalaW > 19) {
    alasanInvalid.push(`Skala W (Inconsistency Index) = ${skalaW} (> 19): Terdeteksi inkonsistensi jawaban tinggi.`);
  }
  if (skalaX < 7 || skalaX > 114) {
    alasanInvalid.push(`Skala X (Disclosure Index) = ${skalaX}: Di luar batas aman (7–114).`);
  }

  const basicPersonalityKeys = ["1", "2A", "2B", "3", "4A", "4B", "5", "6A", "6B", "7", "8A", "8B"];
  const allBasicUnder60 = basicPersonalityKeys.every(
    (k) => (polaKepribadian[k]?.brScore ?? 0) < 60
  );
  if (allBasicUnder60) {
    alasanInvalid.push("Seluruh skala kepribadian dasar (1 sampai 8B) bernilai BR < 60.");
  }

  const isValid = alasanInvalid.length === 0;

  // 7. Penyusunan Laporan Naratif Profesional
  let naratifValiditas: string;
  let naratifKepribadian: string;
  let naratifKlinis: string;

  if (!isValid) {
    naratifValiditas = "Hasil tes ini tidak akurat dan tidak dapat diinterpretasi.";
    naratifKepribadian = "Tidak dapat diinterpretasi.";
    naratifKlinis = "Tidak dapat diinterpretasi.";
  } else {
    naratifValiditas = "Hasil tes ini akurat dan dapat dipercaya.";

    // Gabungkan deskripsi pola kepribadian yang menonjol (BR >= 75: Tipe atau Gangguan)
    const activePersonality = polaKepribadianList.filter((p) => p.brScore >= 75);
    if (activePersonality.length > 0) {
      naratifKepribadian = activePersonality.map((p) => p.deskripsi).join(" ");
    } else {
      naratifKepribadian = "Pola kepribadian berada dalam rentang adaptif normal tanpa indikasi tipe atau gangguan kepribadian yang menonjol.";
    }

    // Gabungkan deskripsi sindroma klinis yang terindikasi (BR >= 75: Ringan atau Berat)
    const activeClinical = sindromaKlinisList.filter((c) => c.brScore >= 75);
    if (activeClinical.length > 0) {
      naratifKlinis = activeClinical.map((c) => c.deskripsi).join(" ");
    } else {
      naratifKlinis = "Tidak ditemukan indikasi sindroma klinis yang signifikan pada saat pemeriksaan.";
    }
  }

  const prominentScales = polaKepribadianList
    .filter((p) => p.brScore >= 75)
    .map((p) => p.nama.split(" (")[0]);

  return {
    totalSkor: 0,
    tanpaSkorTotal: true,
    hasInterpretation: true,
    grade: isValid ? (prominentScales.length > 0 ? prominentScales.join(", ") : "Profil Normal") : "Hasil Tidak Valid",
    kategori: isValid ? "Profil Multiaxial MCMI-IV" : "Tes Tidak Valid",
    deskripsi: naratifKepribadian,
    validitas: {
      isValid,
      skalaV,
      skalaW,
      skalaX,
      skalaY_BR,
      skalaZ_BR,
      alasanInvalid,
      kesimpulan: naratifValiditas,
    },
    polaKepribadian,
    polaKepribadianList,
    sindromaKlinis,
    sindromaKlinisList,
    laporanNaratif: {
      validitas: naratifValiditas,
      polaKepribadian: naratifKepribadian,
      klinis: naratifKlinis,
    },
    catatanKlinis: [
      `Validitas: ${naratifValiditas}`,
      `Skala V: ${skalaV} (Maks 1), Skala W: ${skalaW} (Maks 19), Skala X: ${skalaX} (7–114)`,
      ...(prominentScales.length > 0 ? [`Skala Menonjol: ${prominentScales.join(", ")}`] : []),
    ],
  };
}
