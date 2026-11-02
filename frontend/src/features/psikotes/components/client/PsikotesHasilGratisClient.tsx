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
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 lg:pt-36 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {displayTestName}
          </h1>
        </div>

        {/* 1. Hasil Utama */}
        <section className="flex justify-center">
          <div className={`w-full max-w-2xl rounded-3xl border ${dynamicResult.borderColor} ${dynamicResult.bgColor} p-8 sm:p-12 text-center shadow-sm`}>
            {dynamicResult.prefix && (
              <p className="text-lg sm:text-xl font-medium text-gray-700 mb-3">{dynamicResult.prefix}</p>
            )}
            <h3 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight ${dynamicResult.color}`}>
              {dynamicResult.value}
            </h3>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Column */}
          <div className="md:col-span-8 space-y-10">
            {/* 2. Interpretasi Hasil */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Info className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Interpretasi Hasil</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {interpretasiText}
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* 3. Apa Artinya untukmu? */}
            {maknaTeks && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Apa Artinya untukmu?</h2>
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {maknaTeks}
                  </p>
                </div>
              </section>
            )}

            {/* 4. Rekomendasi & Saran Langkah Praktis */}
            {tipsList.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Saran & Langkah Praktis</h2>
                </div>
                <div className="space-y-3">
                  {tipsList.map((tip: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-gray-700 text-base leading-relaxed">
                        {typeof tip === "string" ? tip : (tip.title ? `${tip.title}: ${tip.desc || ""}` : tip.desc || "")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar / CTA Column */}
          <div className="md:col-span-4 space-y-6">
            {/* Ajakan untuk Konsultasi */}
            <div className="bg-primary text-white rounded-3xl p-6 sm:p-8 shadow-lg sticky top-[120px]">
              <h3 className="text-xl font-bold mb-3">Ingin memahami kondisimu lebih jauh?</h3>
              <p className="text-primary-foreground/90 mb-6 text-sm leading-relaxed">
                Hasil tes ini adalah langkah awal. Jangan ragu untuk berkonsultasi dengan psikolog profesional kami untuk mendapatkan panduan yang lebih personal.
              </p>
              <div className="space-y-3">
                <Link href="/konseling" className="block w-full">
                  <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-50 flex items-center justify-center gap-2 font-semibold">
                    <Calendar className="w-4 h-4" />
                    Jadwalkan Konsultasi
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Rekomendasi Tes Dinamis dari Database */}
        <PsikotesRekomendasiSection currentTestId={params.testId} />

      </div>
    </div>
  );
}
