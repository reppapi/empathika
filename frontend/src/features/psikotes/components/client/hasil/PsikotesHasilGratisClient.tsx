/** Halaman hasil skrining psikotes gratis (ringkasan kategori, evaluasi DASS, saran, dan hotline krisis). */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  RotateCcw,
  AlertCircle,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { evaluateDASS } from "@/features/psikotes/utils/dassEvaluation";
import PsikotesRekomendasiSection from "./PsikotesRekomendasiSection";
import InterpretasiCard from "./InterpretasiCard";
import CrisisHotlineCard from "./CrisisHotlineCard";

function SelfCareIllustration() {
  return (
    <div className="w-full flex justify-center py-2">
      <svg
        viewBox="0 0 360 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-64 sm:w-72 md:w-80 h-auto"
        aria-hidden="true"
      >
        {/* Soft background shape */}
        <ellipse cx="180" cy="220" rx="140" ry="24" fill="#F1F5F9" />
        <ellipse cx="180" cy="140" rx="120" ry="100" fill="#F8FAFC" />

        {/* Mirror frame (soft deep navy ellipse) */}
        <ellipse
          cx="140"
          cy="120"
          rx="68"
          ry="92"
          fill="#EFF6FF"
          stroke="#1E3A8A"
          strokeWidth="4"
        />

        {/* Plant leaf in background */}
        <path
          d="M75 190C65 160 80 130 95 125C95 155 85 180 75 190Z"
          fill="#A7F3D0"
          opacity="0.8"
        />

        {/* Reflection: Person hugging heart */}
        <g transform="translate(10, 5)">
          {/* Back shoulders */}
          <path
            d="M95 195C95 155 120 140 135 140C150 140 175 155 175 195"
            fill="#FEE2E2"
          />

          {/* Neck */}
          <rect x="127" y="125" width="16" height="20" rx="8" fill="#FBD5C5" />

          {/* Head & Face */}
          <ellipse cx="135" cy="108" rx="22" ry="25" fill="#FBD5C5" />

          {/* Hair (Front view reflection) */}
          <path
            d="M113 105C113 85 125 78 135 78C148 78 157 85 157 105C157 112 153 118 153 118C148 102 143 100 135 100C127 100 122 102 117 118C117 118 113 112 113 105Z"
            fill="#1F2937"
          />

          {/* Facial features: closed peaceful eyes & gentle smile */}
          <ellipse cx="127" cy="107" rx="1.5" ry="1.5" fill="#1F2937" />
          <ellipse cx="143" cy="107" rx="1.5" ry="1.5" fill="#1F2937" />
          {/* Subtle blush */}
          <ellipse cx="123" cy="112" rx="3" ry="1.5" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="147" cy="112" rx="3" ry="1.5" fill="#FDA4AF" opacity="0.6" />
          {/* Smile */}
          <path
            d="M131 114C133 117 137 117 139 114"
            stroke="#1F2937"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Big navy heart being hugged */}
          <path
            d="M135 145 C135 136 122 130 115 138 C106 148 120 162 135 174 C150 162 164 148 155 138 C148 130 135 136 135 145 Z"
            fill="#0F2F57"
          />

          {/* Arms hugging heart */}
          {/* Left arm */}
          <path
            d="M102 178C108 162 118 150 138 150C145 150 148 153 148 156C148 159 135 160 125 162C118 164 110 172 108 180"
            fill="#FBD5C5"
          />
          {/* Right arm */}
          <path
            d="M168 178C162 162 152 150 132 150C125 150 122 153 122 156C122 159 135 160 145 162C152 164 160 172 162 180"
            fill="#FBD5C5"
          />
        </g>

        {/* Person from behind looking into mirror */}
        <g transform="translate(140, 20)">
          {/* Back shoulders */}
          <path
            d="M50 200C50 155 75 140 100 140C125 140 145 155 145 200"
            fill="#FDF2F8"
            stroke="#FCE7F3"
            strokeWidth="2"
          />

          {/* Back neck */}
          <rect x="92" y="118" width="16" height="25" rx="8" fill="#FBD5C5" />

          {/* Back head & hair */}
          <ellipse cx="100" cy="100" rx="26" ry="30" fill="#1F2937" />
          <ellipse cx="118" cy="98" rx="5" ry="8" fill="#FBD5C5" />

          {/* Braided ponytail falling down */}
          <path
            d="M104 125C108 135 106 148 110 160C113 168 111 178 112 188C110 188 106 182 105 175C104 165 106 150 102 138C100 132 102 125 104 125Z"
            fill="#111827"
          />
        </g>
      </svg>
    </div>
  );
}

export default function PsikotesHasilGratisClient({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dbPackage, setDbPackage] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [isTipsExpanded, setIsTipsExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch package data from backend to get interpretasi_psikotes
  const fetchPackage = async () => {
    setIsLoadingDb(true);
    setErrorMessage(null);
    try {
      const res = await psikotesService.getById(params.testId, { allowDraft: false });
      if (res && res.success && res.data) {
        setDbPackage(res.data);
      } else {
        setErrorMessage("Data paket psikotes tidak ditemukan.");
      }
    } catch (err: any) {
      console.error("Gagal mengambil data interpretasi:", err);
      setErrorMessage("Tidak dapat terhubung ke server backend. Silakan periksa koneksi atau coba lagi.");
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [params.testId]);

  // Match score from URL params to the interpretasi from database
  const rawSkor = searchParams.get("skor");
  const totalSkor = rawSkor !== null && rawSkor !== "" ? parseInt(rawSkor, 10) : null;

  // Protokol darurat / Crisis Hotline HANYA untuk PHQ-9 (Butir 9 ide bunuh diri)
  const isPHQ9 = Boolean(
    dbPackage?.alat_ukur?.kode?.toUpperCase().includes("PHQ") ||
    dbPackage?.judul?.toUpperCase().includes("PHQ") ||
    params.testId.toLowerCase().includes("phq")
  );
  const isHarmDetected = isPHQ9 && searchParams.get("harm") === "1";

  // Dimensi DASS-42 (Depresi, Kecemasan, Stres)
  const rawDep = searchParams.get("dep");
  const rawAnx = searchParams.get("anx");
  const rawStr = searchParams.get("str");

  const isDASS = Boolean(
    dbPackage?.alat_ukur?.kode?.toUpperCase().includes("DASS") ||
    dbPackage?.judul?.toUpperCase().includes("DASS") ||
    dbPackage?.judul?.toLowerCase().includes("stres") ||
    dbPackage?.judul?.toLowerCase().includes("depresi, kecemasan") ||
    params.testId.toLowerCase().includes("dass")
  );

  const dassEvaluation = isDASS
    ? evaluateDASS(
        totalSkor,
        rawDep !== null && rawDep !== "" ? parseInt(rawDep, 10) : null,
        rawAnx !== null && rawAnx !== "" ? parseInt(rawAnx, 10) : null,
        rawStr !== null && rawStr !== "" ? parseInt(rawStr, 10) : null
      )
    : null;

  // ── Dynamic interpretation from database ──────────────────────────────────
  const dbInterpretasi = (() => {
    if (!dbPackage) return null;
    const list = dbPackage.interpretasi_psikotes;
    if (!list || list.length === 0) return null;
    if (totalSkor === null || isNaN(totalSkor)) return null;

    // Find exact match
    const exact = list.find((i) => totalSkor >= i.min_skor && totalSkor <= i.max_skor);
    if (exact) return exact;

    // Closest tier
    const sorted = [...list].sort((a, b) => a.min_skor - b.min_skor);
    if (totalSkor < sorted[0].min_skor) return sorted[0];
    return sorted[sorted.length - 1];
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

  // Layar Error Koneksi — Jika backend mati
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-100 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Menghubungkan ke Server</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{errorMessage}</p>
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

  // DATA KRITIS: Kategori Interpretasi & Skoring
  // Jika skor tidak valid atau kategori interpretasi belum dikonfigurasi di database,
  // DILARANG keras memakai fallback text palsu.
  if (!dbInterpretasi) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {dbPackage?.judul || "Hasil Asesmen"}
          </h2>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Interpretasi Skor Tidak Tersedia
          </p>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Demi menjaga akurasi etis dan klinis psikotes, hasil tidak dapat disimpulkan karena kategori skor untuk hasil asesmen ini belum dikonfigurasi pada database.
          </p>
          <Link
            href={`/psikotes/${params.testId}`}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#561269] hover:bg-[#763E8B] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Kembali ke Detail Tes
          </Link>
        </div>
      </div>
    );
  }

  // Ambil judul, deskripsi interpretasi, dan tips murni dari database
  let headline = dbInterpretasi.judul;
  if (isDASS) {
    // Pastikan tidak ada istilah GPD atau rangkaian keparahan beruntun di judul
    if (
      !headline ||
      /general psychological distress/i.test(headline) ||
      /\(gpd\)/i.test(headline) ||
      /depresi.*kecemasan.*stres/i.test(headline) ||
      /depresi.*kecemasan.*stress/i.test(headline)
    ) {
      headline = "Profil Kesehatan Emosional";
    }
  }
  const interpretasiText = dbInterpretasi.deskripsi || "Asesmen psikologi telah diselesaikan.";

  const rawTips = (dbInterpretasi as any)?.tips;
  const tipsList: any[] = Array.isArray(rawTips)
    ? rawTips
    : rawTips && Array.isArray(rawTips.saran)
      ? rawTips.saran
      : [];

  return (
    <div className="min-h-screen bg-[#fbfbfb] pt-24 pb-20 px-4 sm:px-6 lg:px-8 lg:pt-28 font-sans selection:bg-[#561269] selection:text-white">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* 1. Warm Illustration */}
        <SelfCareIllustration />

        {/* 2. Clean Pastel Card (Bunda.id Inspired) */}
        <InterpretasiCard
          headline={headline}
          interpretasiText={interpretasiText}
          tipsList={tipsList}
          isTipsExpanded={isTipsExpanded}
          onToggleTips={() => setIsTipsExpanded(!isTipsExpanded)}
          dassEvaluation={dassEvaluation}
        />

        {/* 2b. Safety & Crisis Hotline Card (PHQ-9 Suicidal/Self-Harm Ideation Protocol - Satu Persen Card Style) */}
        {isHarmDetected && <CrisisHotlineCard />}

        {/* 3. Konsultasi Purple Card (Clean, without calendar icon & without "privat aman") */}
        <div className="pt-2">
          <div className="bg-gradient-to-br from-[#561269] to-[#3b0a48] text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-purple-900/20 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">
                Ingin Memahami Kondisimu Lebih Lanjut?
              </h3>
              <p className="text-purple-100/90 text-xs sm:text-sm leading-relaxed font-light">
                Hasil tes ini dapat menjadi langkah awal untuk mengenali kondisi emosionalmu, bukan sebagai diagnosis. Jika kamu merasa membutuhkan dukungan atau ingin membicarakan apa yang sedang kamu alami, psikolog profesional Empathika siap menemani dan membantumu memahami kondisi tersebut lebih dalam.
              </p>
            </div>

            <div className="pt-1">
              <Link href="/konseling" className="block w-full">
                <button
                  type="button"
                  className="w-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  Jadwalkan Konsultasi
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4. Tombol Ulangi Tes (Di Bawah Kotak Rekomendasi Konsultasi) */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => router.replace(`/psikotes/${params.testId}/mulai`)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 font-semibold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Ulangi Tes</span>
          </button>
        </div>

        {/* 5. Rekomendasi Tes Lainnya */}
        <div className="pt-6">
          <PsikotesRekomendasiSection currentTestId={params.testId} />
        </div>

      </div>
    </div>
  );
}
