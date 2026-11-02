export interface QuestionOption {
  value: number;
  label: string;
  text: string;
}

export interface QuestionItem {
  id: number;
  text: string;
}

export const GAD7_OPTIONS: QuestionOption[] = [
  { value: 0, label: "0", text: "Tidak pernah" },
  { value: 1, label: "1", text: "Beberapa hari" },
  { value: 2, label: "2", text: "Lebih dari separuh waktu yang dimaksud" },
  { value: 3, label: "3", text: "Hampir setiap hari" },
];

export const GAD7_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    text: "Merasa gugup, cemas atau gelisah.",
  },
  {
    id: 2,
    text: "Tidak mampu menghentikan atau mengendalikan rasa khawatir.",
  },
  {
    id: 3,
    text: "Khawatir berlebihan tentang berbagai hal.",
  },
  {
    id: 4,
    text: "Sulit untuk santai.",
  },
  {
    id: 5,
    text: "Begitu gelisah sehingga sulit untuk duduk diam.",
  },
  {
    id: 6,
    text: "Menjadi mudah kesal atau jengkel.",
  },
  {
    id: 7,
    text: "Merasa takut seolah-olah sesuatu yang mengerikan mungkin terjadi.",
  },
];

// Pertanyaan tambahan untuk evaluasi dampak fungsional sehari-hari
export const GAD7_DIFFICULTY_QUESTION = {
  id: 8,
  text: "Jika anda melingkari salah satu masalah di atas, seberapa besar kesulitan yang ditimbulkan masalah-masalah ini terhadap anda dalam melakukan pekerjaan anda, mengurus pekerjaan rumah tangga, atau bergaul dengan orang lain?",
  options: [
    { value: 0, text: "Tidak menyulitkan sama sekali" },
    { value: 1, text: "Sedikit menyulitkan" },
    { value: 2, text: "Sangat menyulitkan" },
    { value: 3, text: "Luar biasa menyulitkan" },
  ],
};

