"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePsikotesTest } from "../../hooks/usePsikotesTest";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { useAuthStore } from "@/store/authStore";
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

  const testTitle = dbData?.judul || "Tes Psikotes";

  const questions = (dbData?.soal_psikotes && dbData.soal_psikotes.length > 0)
    ? dbData.soal_psikotes.map((s) => {
        const sortedPilihan = [...(s.pilihan_jawaban || [])].sort(
          (a, b) => (Number(a.bobot) || 0) - (Number(b.bobot) || 0)
        );
        return {
          id: s.id,
          text: s.pertanyaan,
          options: sortedPilihan.map((p) => p.teks_jawaban),
          weights: sortedPilihan.map((p) => Number(p.bobot) || 0),
          pilihanList: sortedPilihan,
        };
      })
    : [];

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
      <div className="min-h-screen bg-[#fbfbfb] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
        <p className="text-sm text-gray-500 font-medium">Memuat soal psikotes...</p>
      </div>
    );
  }

  // Jika paket belum memiliki butir soal
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-[90px] lg:pt-[110px] pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{testTitle}</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Belum ada soal yang tersedia untuk paket ini. Silakan hubungi admin atau pilih paket psikotes lainnya.
          </p>
          <Link
            href="/psikotes"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-extrabold transition shadow-sm cursor-pointer"
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
    let pesertaNama = "";
    let pesertaWa = "";
    let pesertaEmail = "";

    try {
      // Ambil data diri peserta:
      // Pada psikotes gratis, peserta tidak mengisi formulir identitas (anonim).
      // Data diri hanya diambil jika paket berbayar dari pendaftaran / query parameter resmi.
      const isPaketGratis = dbData?.jenis_akses === "GRATIS" || (typeof dbData?.harga === "number" && dbData.harga === 0);

      if (!isPaketGratis) {
        pesertaNama = searchParams.get("nama") || "";
        pesertaWa = searchParams.get("whatsapp") || searchParams.get("no_telepon") || "";
        pesertaEmail = searchParams.get("email") || "";

        if (!pesertaNama || !pesertaWa || !pesertaEmail) {
          try {
            const raw = localStorage.getItem("empathika_peserta_psikotes");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (!pesertaNama && parsed.nama) pesertaNama = parsed.nama;
              if (!pesertaWa && (parsed.no_telepon || parsed.whatsapp)) pesertaWa = parsed.no_telepon || parsed.whatsapp;
              if (!pesertaEmail && parsed.email) pesertaEmail = parsed.email;
            }
          } catch {}
        }

        // Fallback dari user yang sedang login jika bukan akun admin
        const authUser = useAuthStore.getState().user;
        if (authUser && authUser.role !== "ADMIN" && (authUser as any).role !== "admin") {
          if (!pesertaNama && authUser.name) pesertaNama = authUser.name;
          if (!pesertaEmail && authUser.email) pesertaEmail = authUser.email;
        }
      }

      if (questions.length > 0) {
        // Susun payload jawaban untuk dikirim ke backend sesuai urutan pilihan yang ditampilkan
        const jawabanPayload = questions.map((q, idx) => {
          const selectedOptIdx = answers[idx] ?? 0;
          const pilihan = q.pilihanList[selectedOptIdx];
          return {
            id_soal: q.id,
            id_pilihan: pilihan ? pilihan.id : q.pilihanList[0]?.id,
          };
        });

        const res = await psikotesService.submitJawaban(params.testId, {
          jawaban: jawabanPayload,
          nama: pesertaNama || undefined,
          no_telepon: pesertaWa || undefined,
          email: pesertaEmail || undefined,
          klien: pesertaNama ? {
            nama: pesertaNama,
            no_telepon: pesertaWa || undefined,
            email: pesertaEmail || undefined,
          } : undefined,
        });

        if (res && res.success && res.data) {
          const query = new URLSearchParams(searchParams.toString());
          query.set("skor", String(res.data.total_skor));
          query.set("bookingId", res.data.id_booking);
          if (pesertaNama) query.set("nama", pesertaNama);
          if (pesertaWa) query.set("whatsapp", pesertaWa);
          if (pesertaEmail) query.set("email", pesertaEmail);
          router.replace(`/psikotes/${params.testId}/hasil?${query.toString()}`);
          return;
        }
      }

      // Fallback kalkulasi lokal jika paket mock
      const score = calculateScore(answers);
      const query = new URLSearchParams(searchParams.toString());
      query.set("skor", String(score));
      if (pesertaNama) query.set("nama", pesertaNama);
      if (pesertaWa) query.set("whatsapp", pesertaWa);
      if (pesertaEmail) query.set("email", pesertaEmail);
      router.replace(`/psikotes/${params.testId}/hasil?${query.toString()}`);
    } catch (err) {
      console.error("Gagal menyimpan jawaban psikotes ke server:", err);
      // Tetap lanjutkan ke halaman hasil agar pengalaman user lancar
      const score = calculateScore(answers);
      const query = new URLSearchParams(searchParams.toString());
      query.set("skor", String(score));
      if (pesertaNama) query.set("nama", pesertaNama);
      if (pesertaWa) query.set("whatsapp", pesertaWa);
      if (pesertaEmail) query.set("email", pesertaEmail);
      router.replace(`/psikotes/${params.testId}/hasil?${query.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] font-sans pt-28 lg:pt-36 pb-12 px-4 flex flex-col selection:bg-[#561269] selection:text-white">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        {/* Progress Bar & Indikator Soal */}
        <div className="mb-6 md:mb-8">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#8e4a9e] to-[#561269] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-start">
            <span className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide">
              Pertanyaan <span className="font-bold text-gray-800">{currentIndex + 1}</span> dari {totalQuestions}
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 mb-6 flex-1 flex flex-col justify-center transition-all duration-300">
            <p className="text-xs sm:text-sm text-gray-400 font-medium text-center mb-2">
              Dalam 2 minggu terakhir, seberapa sering kamu:
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug md:leading-normal text-center mb-6 md:mb-8">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`text-left w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3.5 group ${
                      isSelected 
                        ? "border-[#561269] bg-[#561269]/5 shadow-xs scale-[1.005]" 
                        : "border-gray-100 hover:border-[#561269]/30 hover:bg-gray-50/80"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors duration-200 font-bold text-xs ${
                      isSelected ? "border-[#561269] bg-[#561269] text-white" : "border-gray-300 text-gray-500 group-hover:border-[#561269]/50 group-hover:text-[#561269]"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-sm sm:text-base font-medium leading-relaxed transition-colors duration-200 ${
                      isSelected ? "text-[#561269]" : "text-gray-700"
                    }`}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {(showError || localError) && (
              <p className="text-red-500 text-xs sm:text-sm font-medium text-center mt-5 animate-pulse">
                Silakan pilih jawaban terlebih dahulu.
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 mt-auto pt-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || isSubmitting}
              className={`px-5 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-200 text-xs sm:text-sm ${
                currentIndex === 0 
                  ? "opacity-0 pointer-events-none" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-xs"
              }`}
            >
              Sebelumnya
            </button>

            <button
              onClick={isLastQuestion ? handleFinish : handleNext}
              disabled={isSubmitting}
              className={`px-6 py-2.5 sm:py-3 rounded-xl font-extrabold transition-all duration-200 text-xs sm:text-sm flex items-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 shadow-sm hover:shadow-md cursor-pointer ${
                isSubmitting ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                  <span>Menyimpan Hasil...</span>
                </>
              ) : isLastQuestion ? (
                <span>Selesai</span>
              ) : (
                <>
                  <span>Berikutnya</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

