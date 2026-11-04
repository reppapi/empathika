"use client"

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePsikotesTest } from "@/features/psikotes/hooks/usePsikotesTest";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { useAuthStore } from "@/store/authStore";
import { Loader2, AlertCircle, WifiOff, RefreshCw } from "lucide-react";

export default function PsikotesMulaiClient({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dbData, setDbData] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [localError, setLocalError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  const fetchPackage = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await psikotesService.getById(params.testId);
      if (res && res.success && res.data) {
        setDbData(res.data);
      } else {
        setErrorMessage("Paket psikotes tidak ditemukan di database.");
      }
    } catch (err: any) {
      console.error("Gagal mengambil instrumen psikotes:", err);
      setErrorMessage("Tidak dapat terhubung ke server backend. Silakan periksa koneksi atau coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [params.testId]);

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

  // Verifikasi keabsahan butir soal dari database:
  // Data Kritis: TIDAK BOLEH ADA FALLBACK SOAL ATAU OPSI RUSAK.
  const hasInvalidOptions = dbData?.soal_psikotes?.some(
    (s) => !s.pertanyaan || !s.pilihan_jawaban || s.pilihan_jawaban.length < 2
  );

  const calculateScore = (ans: Record<number, number>) => {
    return Object.entries(ans).reduce((sum, [qIdx, optIdx]) => {
      const q = questions[Number(qIdx)];
      return sum + Number(q?.weights[optIdx] ?? 0);
    }, 0);
  };

  const {
    currentIndex,
    setCurrentIndex,
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

  // Layar Error Koneksi — Jika backend mati
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-28 sm:pt-32 lg:pt-36 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-100 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Menghubungkan ke Server</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fetchPackage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#561269] text-white text-xs font-bold hover:bg-[#763E8B] transition shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
            <Link
              href={`/psikotes/${params.testId}`}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-sm"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // DATA KRITIS: Integritas Klinis Soal & Opsi Jawaban
  if (!dbData || questions.length === 0 || hasInvalidOptions) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-28 sm:pt-32 lg:pt-36 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{dbData?.judul || "Instrumen Psikotes"}</h2>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Instrumen Soal Belum Dikonfigurasi
          </p>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Demi menjaga integritas dan akurasi klinis, tes ini tidak dapat dimulai karena butir pertanyaan atau opsi pilihan jawaban belum terdaftar di database. Silakan hubungi tim Empathika.
          </p>
          <Link
            href="/psikotes"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#561269] hover:bg-[#763E8B] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Kembali ke Daftar Psikotes
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex] || questions[0];
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  // Periode evaluasi alat ukur klinis:
  // DASS-42 mengevaluasi 1 minggu terakhir
  // GAD-7 & PHQ-9 mengevaluasi 2 minggu terakhir
  const isDASS =
    dbData?.alat_ukur?.kode?.toUpperCase().includes("DASS") ||
    dbData?.judul?.toUpperCase().includes("DASS") ||
    params.testId.toLowerCase().includes("dass");

  const timeframeText = isDASS
    ? "Dalam 1 minggu terakhir, seberapa sering kamu:"
    : "Dalam 2 minggu terakhir, seberapa sering kamu:";

  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (optionIdx: number) => {
    if (isAdvancing || isSubmitting) return;

    handleOptionSelect(optionIdx);
    setLocalError(false);
    setSubmitError(null);

    // Di butir terakhir, biarkan tombol 'Selesai' yang melakukan submit
    if (isLastQuestion) {
      return;
    }

    // Auto-advance dengan debouncing ketat agar tidak ada soal terlewat saat klik cepat
    setIsAdvancing(true);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    advanceTimeoutRef.current = setTimeout(() => {
      goToNext();
      setIsAdvancing(false);
    }, 350);
  };

  const handleSafePrev = () => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setIsAdvancing(false);
    handlePrev();
  };

  const handleSafeNext = () => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setIsAdvancing(false);
    handleNext();
  };

  const handleFinish = async () => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setIsAdvancing(false);

    // Validasi 1: Butir saat ini wajib dijawab
    if (answers[currentIndex] === undefined) {
      setLocalError(true);
      return;
    }

    // Validasi 2: Integritas butir lengkap - tidak boleh ada butir terlewat
    const missingIdx = questions.findIndex((_, idx) => answers[idx] === undefined);
    if (missingIdx !== -1) {
      setCurrentIndex(missingIdx);
      setLocalError(true);
      setSubmitError(`Pertanyaan nomor ${missingIdx + 1} belum dijawab. Mohon lengkapi seluruh pertanyaan terlebih dahulu.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
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

      // Validasi integritas butir soal: tidak boleh ada submit jika data soal kosong
      if (questions.length === 0) {
        throw new Error("Tidak ada butir soal yang dapat dikirim.");
      }

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

        // Jika ada data subscales (DASS-42), simpan skor per dimensi ke URL
        if (res.data.detail_skor?.subscales) {
          const subs = res.data.detail_skor.subscales;
          if (subs.depression?.skor !== undefined) query.set("dep", String(subs.depression.skor));
          if (subs.anxiety?.skor !== undefined) query.set("anx", String(subs.anxiety.skor));
          if (subs.stress?.skor !== undefined) query.set("str", String(subs.stress.skor));
        }

        // Protokol Krisis / Melukai Diri HANYA berlaku untuk instrumen PHQ-9 (Butir 9).
        // Instrumen DASS-42 dan GAD-7 tidak memiliki butir skrining melukai diri.
        const isPHQ9 =
          dbData?.alat_ukur?.kode?.toUpperCase().includes("PHQ") ||
          dbData?.judul?.toUpperCase().includes("PHQ") ||
          params.testId.toLowerCase().includes("phq");

        const hasHarm =
          isPHQ9 &&
          Boolean(
            res.data.detail_skor?.ideMelukaiDiri ||
            (answers[8] !== undefined && Number(questions[8]?.weights[answers[8]]) > 0)
          );

        if (hasHarm) {
          query.set("harm", "1");
        }
        if (pesertaNama) query.set("nama", pesertaNama);
        if (pesertaWa) query.set("whatsapp", pesertaWa);
        if (pesertaEmail) query.set("email", pesertaEmail);
        router.replace(`/psikotes/${params.testId}/hasil?${query.toString()}`);
        return;
      }

      throw new Error(res?.message || "Server tidak dapat memproses jawaban psikotes.");
    } catch (err: any) {
      console.error("Gagal menyimpan jawaban psikotes ke server:", err);
      setSubmitError(
        err?.message || "Terjadi kendala saat mengirim jawaban ke server. Pastikan koneksi internet stabil lalu coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] pt-28 sm:pt-32 lg:pt-36 pb-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#561269] selection:text-white flex flex-col justify-between">
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        {/* Top Progress Bar */}
        <div className="mb-6 md:mb-8">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#561269] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 flex justify-between items-center text-xs text-gray-500">
            <span className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide">
              Pertanyaan <span className="font-bold text-gray-800">{currentIndex + 1}</span> dari {totalQuestions}
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 mb-6 flex-1 flex flex-col justify-center transition-all duration-300">
            <p className="text-xs sm:text-sm text-gray-400 font-medium text-center mb-2">
              {timeframeText}
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
                    disabled={isAdvancing || isSubmitting}
                    onClick={() => handleSelectOption(idx)}
                    className={`text-left w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3.5 group cursor-pointer ${
                      isSelected 
                        ? "border-[#561269] bg-[#561269]/5 shadow-xs scale-[1.005]" 
                        : "border-gray-100 hover:border-[#561269]/30 hover:bg-gray-50/80"
                    } ${isAdvancing ? "cursor-wait opacity-90" : ""}`}
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

            {submitError && (
              <div className="mt-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm text-center flex flex-col items-center gap-2">
                <p className="font-semibold">{submitError}</p>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Coba Kirim Ulang
                </button>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 mt-auto pt-1">
            <button
              onClick={handleSafePrev}
              disabled={currentIndex === 0 || isSubmitting || isAdvancing}
              className={`px-5 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-200 text-xs sm:text-sm cursor-pointer ${
                currentIndex === 0 
                  ? "opacity-0 pointer-events-none" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-xs"
              }`}
            >
              Sebelumnya
            </button>

            <button
              onClick={isLastQuestion ? handleFinish : handleSafeNext}
              disabled={isSubmitting || isAdvancing}
              className={`px-6 py-2.5 sm:py-3 rounded-xl font-extrabold transition-all duration-200 text-xs sm:text-sm flex items-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 shadow-sm hover:shadow-md cursor-pointer ${
                isSubmitting || isAdvancing ? "opacity-80 cursor-not-allowed" : ""
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
