export interface QuestionOption {
  value: number;
  label: string;
  text: string;
}

export interface QuestionItem {
  id: number;
  text: string;
}

export const PHQ9_OPTIONS: QuestionOption[] = [
  { value: 0, label: "0", text: "Tidak pernah" },
  { value: 1, label: "1", text: "Beberapa hari" },
  { value: 2, label: "2", text: "Lebih dari separuh waktu yang dimaksud" },
  { value: 3, label: "3", text: "Hampir setiap hari" },
];

export const PHQ9_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    text: "Kurang tertarik atau kurang suka dalam melakukan apapun.",
  },
  {
    id: 2,
    text: "Merasa murung, pilu, atau putus asa.",
  },
  {
    id: 3,
    text: "Sulit untuk tidur atau bertahan tidur, atau terlalu banyak tidur.",
  },
  {
    id: 4,
    text: "Merasa lelah atau kurang bertenaga.",
  },
  {
    id: 5,
    text: "Kurang nafsu makan atau makan terlalu banyak.",
  },
  {
    id: 6,
    text: "Merasa buruk akan diri anda sendiri – atau merasa bahwa anda adalah orang yang gagal atau telah mengecewakan diri sendiri atau keluarga anda.",
  },
  {
    id: 7,
    text: "Sulit berkonsentrasi pada sesuatu, misalnya membaca koran atau menonton televisi.",
  },
  {
    id: 8,
    text: "Bergerak atau berbicara sangat lambat sehingga orang lain memperhatikannya. Atau sebaliknya sedemikian resah dan gelisah sehingga anda bergerak jauh lebih banyak dari biasanya.",
  },
  {
    id: 9,
    text: "Memikirkan bahwa anda lebih baik mati atau melukai diri anda sendiri dengan suatu cara.",
  },
];

// Pertanyaan tambahan untuk evaluasi dampak fungsional sehari-hari
export const PHQ9_DIFFICULTY_QUESTION = {
  id: 10,
  text: "Jika anda melingkari salah satu masalah di atas, seberapa besar kesulitan yang ditimbulkan masalah-masalah ini terhadap anda dalam melakukan pekerjaan anda, mengurus pekerjaan rumah tangga, atau bergaul dengan orang lain?",
  options: [
    { value: 0, text: "Tidak menyulitkan sama sekali" },
    { value: 1, text: "Sedikit menyulitkan" },
    { value: 2, text: "Sangat menyulitkan" },
    { value: 3, text: "Luar biasa menyulitkan" },
  ],
};

