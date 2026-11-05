export interface QuestionOption {
  value: number;
  label: string;
  text: string;
}

export type DASSScale = "depression" | "anxiety" | "stress";

export interface DASSQuestionItem {
  id: number;
  text: string;
  scale: DASSScale;
}

export const DASS42_OPTIONS: QuestionOption[] = [
  { value: 0, label: "0", text: "Tidak pernah" },
  { value: 1, label: "1", text: "Kadang-kadang" },
  { value: 2, label: "2", text: "Lumayan sering" },
  { value: 3, label: "3", text: "Sering sekali" },
];

export const DEPRESSION_ITEM_IDS = [3, 5, 10, 13, 16, 17, 21, 24, 26, 31, 34, 37, 38, 42];
export const ANXIETY_ITEM_IDS = [2, 4, 7, 9, 15, 19, 20, 23, 25, 28, 30, 36, 40, 41];
export const STRESS_ITEM_IDS = [1, 6, 8, 11, 12, 14, 18, 22, 27, 29, 32, 33, 35, 39];

export const DASS42_QUESTIONS: DASSQuestionItem[] = [
  { id: 1, text: "Saya merasa bahwa diri saya menjadi marah karena hal-hal sepele.", scale: "stress" },
  { id: 2, text: "Saya merasa bibir saya sering kering.", scale: "anxiety" },
  { id: 3, text: "Saya sama sekali tidak dapat merasakan perasaan positif.", scale: "depression" },
  { id: 4, text: "Saya mengalami kesulitan bernapas (misalnya: seringkali terengah-engah atau tidak dapat bernapas padahal tidak melakukan aktivitas fisik sebelumnya).", scale: "anxiety" },
  { id: 5, text: "Saya sepertinya tidak kuat lagi untuk melakukan suatu kegiatan.", scale: "depression" },
  { id: 6, text: "Saya cenderung bereaksi berlebihan terhadap suatu situasi.", scale: "stress" },
  { id: 7, text: "Saya merasa goyah (misalnya: kaki terasa mau 'copot').", scale: "anxiety" },
  { id: 8, text: "Saya merasa sulit untuk bersantai.", scale: "stress" },
  { id: 9, text: "Saya menemukan diri saya berada dalam situasi yang membuat saya merasa sangat cemas dan saya akan merasa sangat lega jika semua ini berakhir.", scale: "anxiety" },
  { id: 10, text: "Saya merasa tidak ada hal yang dapat diharapkan di masa depan.", scale: "depression" },
  { id: 11, text: "Saya menemukan diri saya mudah merasa kesal.", scale: "stress" },
  { id: 12, text: "Saya merasa telah menghabiskan banyak energi untuk merasa cemas.", scale: "stress" },
  { id: 13, text: "Saya merasa sedih dan tertekan.", scale: "depression" },
  { id: 14, text: "Saya menemukan diri saya menjadi tidak sabar ketika mengalami penundaan (misalnya: kemacetan lalu lintas, menunggu sesuatu).", scale: "stress" },
  { id: 15, text: "Saya merasa lemas seperti mau pingsan.", scale: "anxiety" },
  { id: 16, text: "Saya merasa saya kehilangan minat akan segala hal.", scale: "depression" },
  { id: 17, text: "Saya merasa bahwa saya tidak berharga sebagai seorang manusia.", scale: "depression" },
  { id: 18, text: "Saya merasa bahwa saya mudah tersinggung.", scale: "stress" },
  { id: 19, text: "Saya berkeringat secara berlebihan (misalnya: tangan berkeringat), padahal temperatur tidak panas atau tidak melakukan aktivitas fisik sebelumnya.", scale: "anxiety" },
  { id: 20, text: "Saya merasa takut tanpa alasan yang jelas.", scale: "anxiety" },
  { id: 21, text: "Saya merasa bahwa hidup tidak bermanfaat.", scale: "depression" },
  { id: 22, text: "Saya merasa sulit untuk beristirahat.", scale: "stress" },
  { id: 23, text: "Saya mengalami kesulitan dalam menelan.", scale: "anxiety" },
  { id: 24, text: "Saya tidak dapat merasakan kenikmatan dari berbagai hal yang saya lakukan.", scale: "depression" },
  { id: 25, text: "Saya menyadari kegiatan jantung, walaupun saya tidak sedang habis melakukan aktivitas fisik (misalnya: merasa detak jantung meningkat atau melemah).", scale: "anxiety" },
  { id: 26, text: "Saya merasa putus asa dan sedih.", scale: "depression" },
  { id: 27, text: "Saya merasa bahwa saya sangat mudah marah.", scale: "stress" },
  { id: 28, text: "Saya merasa saya hampir panik.", scale: "anxiety" },
  { id: 29, text: "Saya merasa sulit untuk tenang setelah sesuatu membuat saya kesal.", scale: "stress" },
  { id: 30, text: "Saya takut bahwa saya akan 'terhambat' oleh tugas-tugas sepele yang tidak biasa saya lakukan.", scale: "anxiety" },
  { id: 31, text: "Saya tidak merasa antusias dalam hal apapun.", scale: "depression" },
  { id: 32, text: "Saya sulit untuk sabar dalam menghadapi gangguan terhadap hal yang sedang saya lakukan.", scale: "stress" },
  { id: 33, text: "Saya sedang merasa gelisah.", scale: "stress" },
  { id: 34, text: "Saya merasa bahwa saya tidak berharga.", scale: "depression" },
  { id: 35, text: "Saya tidak dapat memaklumi hal apapun yang menghalangi saya untuk menyelesaikan hal yang sedang saya lakukan.", scale: "stress" },
  { id: 36, text: "Saya merasa sangat ketakutan.", scale: "anxiety" },
  { id: 37, text: "Saya melihat tidak ada harapan untuk masa depan.", scale: "depression" },
  { id: 38, text: "Saya merasa bahwa hidup tidak berarti.", scale: "depression" },
  { id: 39, text: "Saya menemukan diri saya mudah gelisah.", scale: "stress" },
  { id: 40, text: "Saya merasa khawatir dengan situasi dimana saya mungkin menjadi panik dan mempermalukan diri sendiri.", scale: "anxiety" },
  { id: 41, text: "Saya merasa gemetar (misalnya: pada tangan).", scale: "anxiety" },
  { id: 42, text: "Saya merasa sulit untuk meningkatkan inisiatif dalam melakukan sesuatu.", scale: "depression" },
];

