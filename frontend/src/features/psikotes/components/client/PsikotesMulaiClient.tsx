"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MOCK_QUESTIONS, TEST_DATA } from "../../data/psikotesData";
import { usePsikotesTest } from "../../hooks/usePsikotesTest";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { Loader2, AlertCircle } from "lucide-react";

export default function PsikotesMulaiClient({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dbData, setDbData] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await psikotesService.getById(params.testId);
        if (res && res.success && res.data) {
          setDbData(res.data);
        }
      } catch (err) {
        // Fallback to static mock if not in database
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackage();
  }, [params.testId]);

  const fallbackTest = TEST_DATA[params.testId as keyof typeof TEST_DATA];
  const testTitle = dbData?.judul || fallbackTest?.title || `Psikotes ${params.testId.replace('-', ' ')}`;

  const questions = (dbData?.soal_psikotes && dbData.soal_psikotes.length > 0)
    ? dbData.soal_psikotes.map((s) => ({
        id: s.id,
        text: s.pertanyaan,
        options: s.pilihan_jawaban.map((p) => p.teks_jawaban),
        weights: s.pilihan_jawaban.map((p) => Number(p.bobot) || 0),
      }))
    : MOCK_QUESTIONS.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        weights: [1, 0],
      }));

  const totalQuestions = questions.length;

  const calculateScore = (ans: Record<number, number>) => {
    return Object.entries(ans).reduce((sum, [qIdx, optIdx]) => {
      const q = questions[Number(qIdx)];
      return sum + Number(q?.weights[optIdx] ?? 0);
    }, 0);
  };

  const {
    currentIndex,
    answers,
    showError,
    handleOptionSelect,
    handleNext,
    handlePrev,
    goToNext,
  } = usePsikotesTest(totalQuestions, params.testId, calculateScore);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
        <p className="text-sm text-gray-500 font-medium">Memuat soal psikotes...</p>
      </div>
    );
  }

  // Jika paket dari database belum memiliki butir soal
  if (dbData && (!dbData.soal_psikotes || dbData.soal_psikotes.length === 0)) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-[90px] lg:pt-[110px] pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{testTitle}</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Paket psikotes ini belum memiliki butir pertanyaan yang aktif. Silakan hubungi admin atau kembali ke daftar tes.
          </p>
          <Link
            href="/psikotes"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#561269] text-white text-xs font-bold hover:bg-[#763E8B] transition shadow-sm"
          >
            Kembali ke Daftar Psikotes
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex] || questions[0];
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSelectOption = (optionIdx: number) => {
    handleOptionSelect(optionIdx);
    setLocalError(false);
    setTimeout(() => {
      goToNext();
    }, 400);
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleFinish = async () => {
    if (answers[currentIndex] === undefined) {
      setLocalError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (dbData && dbData.soal_psikotes && dbData.soal_psikotes.length > 0) {
        // Susun payload jawaban untuk dikirim ke backend
        const jawabanPayload = dbData.soal_psikotes.map((s, idx) => {
          const selectedOptIdx = answers[idx] ?? 0;
          const pilihan = s.pilihan_jawaban[selectedOptIdx];
          return {
            id_soal: s.id,
            id_pilihan: pilihan ? pilihan.id : s.pilihan_jawaban[0].id,
          };
        });

        const res = await psikotesService.submitJawaban(params.testId, {
          jawaban: jawabanPayload,
        });

        if (res && res.success && res.data) {
          const query = new URLSearchParams(searchParams.toString());
          query.set("skor", String(res.data.total_skor));
          query.set("bookingId", res.data.id_booking);
          router.push(`/psikotes/${params.testId}/hasil?${query.toString()}`);
          return;
        }
      }

      // Fallback kalkulasi lokal jika paket mock
      const score = calculateScore(answers);
      const query = new URLSearchParams(searchParams.toString());
      query.set("skor", String(score));
      router.push(`/psikotes/${params.testId}/hasil?${query.toString()}`);
    } catch (err) {
      console.error("Gagal menyimpan jawaban psikotes ke server:", err);
      // Tetap lanjutkan ke halaman hasil agar pengalaman user lancar
      const score = calculateScore(answers);
      const query = new URLSearchParams(searchParams.toString());
      query.set("skor", String(score));
      router.push(`/psikotes/${params.testId}/hasil?${query.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] font-sans pt-[90px] lg:pt-[110px] pb-12 px-4 flex flex-col selection:bg-[#561269] selection:text-white">
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
        {/* Header / Progress */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-[#561269] tracking-tight">
              {testTitle}
            </h1>
            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
              Pertanyaan {currentIndex + 1} dari {totalQuestions}
            </span>
          </div>
          
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#8e4a9e] to-[#561269] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 mb-8 flex-1 flex flex-col justify-center transition-all duration-300">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight md:leading-[1.4] text-center mb-10 md:mb-14">
              &quot;{currentQuestion.text}&quot;
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`text-left w-full p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 group ${
                      isSelected 
                        ? "border-[#561269] bg-[#561269]/5 shadow-sm scale-[1.01]" 
                        : "border-gray-100 hover:border-[#561269]/30 hover:bg-gray-50 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300 font-bold text-sm ${
                      isSelected ? "border-[#561269] bg-[#561269] text-white" : "border-gray-300 text-gray-500 group-hover:border-[#561269]/50 group-hover:text-[#561269]"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-base md:text-lg font-medium leading-relaxed transition-colors duration-300 ${
                      isSelected ? "text-[#561269]" : "text-gray-700"
                    }`}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {(showError || localError) && (
              <p className="text-red-500 font-medium text-center mt-6 animate-pulse">
                Silakan pilih jawaban terlebih dahulu.
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 mt-auto pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || isSubmitting}
              className={`px-6 py-3.5 md:py-4 rounded-xl font-bold transition-all duration-300 text-sm md:text-base ${
                currentIndex === 0 
                  ? "opacity-0 pointer-events-none" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              Sebelumnya
            </button>

            <button
              onClick={isLastQuestion ? handleFinish : handleNext}
              disabled={isSubmitting}
              className={`px-8 py-3.5 md:py-4 rounded-xl font-bold transition-all duration-300 shadow-sm text-sm md:text-base flex items-center gap-2 ${
                isLastQuestion
                  ? "bg-[#d97706] hover:bg-[#b46204] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-[#561269] hover:bg-[#763E8B] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
              } ${isSubmitting ? "opacity-80 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menyimpan Hasil...</span>
                </>
              ) : isLastQuestion ? (
                "Selesai"
              ) : (
                <>
                  <span>Berikutnya</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

