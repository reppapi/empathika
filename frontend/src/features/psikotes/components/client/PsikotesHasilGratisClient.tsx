"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  Info, 
  CheckCircle2, 
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import PsikotesRekomendasiSection from "./PsikotesRekomendasiSection";

export default function PsikotesHasilGratisClient({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dbPackage, setDbPackage] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Pastikan gesture back / popstate di laptop selalu kembali ke detail psikotes, bukan ke soal
  useEffect(() => {
    const handlePopState = () => {
      router.replace(`/psikotes/${params.testId}`);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [params.testId, router]);

  // Fetch package data from backend to get interpretasi_psikotes
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await psikotesService.getById(params.testId, { allowDraft: false });
        if (res && res.success && res.data) {
          setDbPackage(res.data);
        }
      } catch {
        // Fallback to static data
      } finally {
        setIsLoadingDb(false);
      }
    };
    fetchPackage();
  }, [params.testId]);

  // Match score from URL params to the interpretasi from database
  const rawSkor = searchParams.get("skor");
  const totalSkor = rawSkor ? parseInt(rawSkor) : null;

  // ── Dynamic interpretation from database ──────────────────────────────────
  const dbInterpretasi = (() => {
    if (!dbPackage) return null;
    const list = dbPackage.interpretasi_psikotes;
    if (!list || list.length === 0) return null;
    if (totalSkor === null) return list[0];

    // Find exact match
    const exact = list.find((i) => totalSkor >= i.min_skor && totalSkor <= i.max_skor);
    if (exact) return exact;

    // Closest tier fallback
    const sorted = [...list].sort((a, b) => a.min_skor - b.min_skor);
    if (totalSkor < sorted[0].min_skor) return sorted[0];
    return sorted[sorted.length - 1];
  })();

  // Dynamic display name from database
  const displayTestName = dbPackage?.judul || "Tes Tingkat Kecemasan";

  const dynamicResult = (() => {
    // 1. Prioritaskan data interpretasi dari database jika paket terdaftar di DB
    if (dbPackage) {
      if (dbInterpretasi) {
        return {
          prefix: null,
          value: dbInterpretasi.judul,
          color: "text-[#561269]",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200"
        };
      }
      return {
        prefix: null,
        value: dbPackage.judul,
        color: "text-[#561269]",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      };
    }

    return {
      prefix: null,
      value: "Tes Tingkat Kecemasan",
      color: "text-[#561269]",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    };
  })();

  // Loading state while fetching db data
  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
        <p className="text-sm text-gray-500 font-medium">Memuat hasil psikotes...</p>
      </div>
    );
  }

  // Derive display interpretation text directly from database
  const interpretasiText = dbInterpretasi?.deskripsi || dbPackage?.deskripsi || "Asesmen psikotes telah berhasil diselesaikan.";
  const maknaTeks = dbInterpretasi?.makna || "";
  const rawTips = (dbInterpretasi as any)?.tips;
  const tipsList: any[] = Array.isArray(rawTips)
    ? rawTips
    : (rawTips && Array.isArray(rawTips.saran) ? rawTips.saran : []);

  return (
    <div className="min-h-screen bg-[#fbfbfb] pt-28 pb-16 px-4 sm:px-6 lg:px-8 lg:pt-36 font-sans selection:bg-[#561269] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hasil Utama Sederhana */}
        <section className="flex justify-center">
          <div className="w-full max-w-2xl rounded-3xl border border-purple-200 bg-purple-50 p-8 sm:p-12 text-center shadow-xs">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#561269]">
              {dynamicResult.value}
            </h2>
          </div>
        </section>

        {/* 2. Grid Konten & Sidebar Konsultasi */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Kolom Kiri: Detail Interpretasi & Saran */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Card Interpretasi Hasil */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Interpretasi Hasil</h2>
                  <p className="text-xs text-gray-400">Penjelasan kondisi emosionalmu</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                {interpretasiText}
              </p>

              {maknaTeks && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Apa Artinya untukmu?</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{maknaTeks}</p>
                </div>
              )}
            </div>

            {/* Card Saran & Langkah Praktis */}
            {tipsList.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Saran & Langkah Praktis</h2>
                    <p className="text-xs text-gray-400">Tindakan mandiri yang dapat diterapkan</p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {tipsList.map((tip: any, idx: number) => {
                    const tipText = typeof tip === "string" ? tip : (tip.title ? `${tip.title}: ${tip.desc || ""}` : tip.desc || "");
                    return (
                      <div key={idx} className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                          {tipText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Kolom Kanan: Sidebar Ajak Konsultasi */}
          <div className="md:col-span-4 sticky top-[120px]">
            <div className="bg-gradient-to-br from-[#561269] to-[#3b0a48] text-white rounded-3xl p-6 sm:p-7 shadow-md border border-purple-900/30 flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">Ingin Diskusi Lebih Lanjut?</h3>
                <p className="text-purple-100/90 text-xs sm:text-sm leading-relaxed font-light">
                  Hasil tes ini adalah langkah awal skrining mandiri. Jika kecemasan terasa membebani, kamu bisa berdiskusi langsung bersama psikolog profesional Empathika.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/konseling" className="block w-full">
                  <button className="w-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-98 cursor-pointer">
                    <Calendar className="w-4 h-4 text-gray-950" />
                    <span>Jadwalkan Konsultasi</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Rekomendasi Tes Dinamis */}
        <div className="pt-6">
          <PsikotesRekomendasiSection currentTestId={params.testId} />
        </div>

      </div>
    </div>
  );
}
