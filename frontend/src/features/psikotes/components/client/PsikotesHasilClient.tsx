"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/Button";
import { 
  Calendar, 
  Info, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Briefcase, 
  HeartHandshake, 
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Compass,
  Loader2,
  FileText,
} from "lucide-react";
import Link from "next/link";

import { RESULT_DATA as resultData, TEST_DATA } from "../../data/psikotesData";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";

export default function PsikotesHasilClient({ params }: { params: { testId: string } }) {
  const searchParams = useSearchParams();
  const isPaid = searchParams.get("paket") === "berbayar" || searchParams.get("plan") === "berbayar" || searchParams.get("tipe") === "berbayar";
  const [isDownloading, setIsDownloading] = useState(false);
  const [dbPackage, setDbPackage] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

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

  // Dynamic display name from database (fallback to static)
  const displayTestName = dbPackage?.judul || (TEST_DATA[params.testId as keyof typeof TEST_DATA]?.title) || resultData.testName;

  const dynamicResult = (() => {
    // 1. Prioritaskan data interpretasi dari database jika paket terdaftar di DB
    if (dbPackage) {
      if (dbInterpretasi) {
        return {
          prefix: dbInterpretasi.grade ? `Tingkat: ${dbInterpretasi.grade}` : "Hasil Asesmen:",
          value: dbInterpretasi.judul,
          color: "text-[#561269]",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200"
        };
      }
      return {
        prefix: "Hasil Asesmen:",
        value: dbPackage.judul,
        color: "text-[#561269]",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      };
    }

    // 2. Fallback mock static hanya jika route berupa mock testing lokal
    if (params.testId === "mbti" || params.testId === "mbti-2") {
      return {
        prefix: "Tipe kepribadianmu adalah",
        value: "ENFJ-A (Protagonist)",
        color: "text-[#561269]",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      };
    }
    if (params.testId === "love-language") {
      return {
        prefix: "Bahasa cinta utamamu adalah",
        value: "Words of Affirmation",
        color: "text-[#561269]",
        bgColor: "bg-pink-50",
        borderColor: "border-pink-200"
      };
    }
    return resultData.result;
  })();

  // Data komprehensif interpretasi untuk paket Berbayar (sinkron dengan sistem Admin)
  const berbayarDetail = (() => {
    if (params.testId === "love-language") {
      return {
        deskripsi:
          "Hasil asesmen komprehensif menunjukkan bahasa cinta utamamu adalah Words of Affirmation. Kamu paling merasa dihargai dan dicintai melalui kata-kata verbal yang tulus, apresiasi spesifik, dan komunikasi yang membangun.",
        makna:
          "Pujian yang tulus, ucapan terima kasih yang jujur, dan kata-kata penyemangat memiliki dampak emosional yang mendalam bagimu dalam memperkuat ikatan hubungan interpersonal.",
        kekuatanUtama: [
          "Kemampuan mengekspresikan apresiasi verbal yang menyejukkan dan memvalidasi perasaan orang lain.",
          "Sensitivitas tinggi terhadap nada bicara dan kebutuhan emosional pasangan atau sahabat.",
          "Komunikasi afektif yang membangun rasa aman, keterbukaan, dan kepercayaan jangka panjang.",
        ],
        blindspots: [
          "Sangat sensitif terhadap kritik pedas, nada bicara ketus, atau sarkasme ringan dari orang terdekat.",
          "Dapat meragukan ketulusan atau kasih sayang orang lain jika tidak dinyatakan secara verbal berulang kali.",
          "Kerap menahan kekecewaan sendiri demi menjaga suasana verbal tetap positif di depan orang lain.",
        ],
        lingkunganOptimal: [
          "Lingkungan relasi personal dan kerja yang mengedepankan budaya apresiatif serta umpan balik positif.",
          "Dinamika kelompok kerja yang saling menghargai usaha anggota tim secara transparan.",
          "Pola interaksi yang asertif, jujur, dan bebas dari sindiran atau sarkasme pasif.",
        ],
      };
    }
    if (params.testId === "kesiapan-karir" || params.testId.includes("karier") || params.testId.includes("karir")) {
      return {
        deskripsi:
          "Dominasi minat berfokus pada inovasi, ekspresi ide orisinal, serta komunikasi persuasif yang berakar pada empati tulus.",
        makna:
          "Unggul dalam industri edukasi, psikologi, human resource, dan perancangan strategi kreatif dengan ruang kolaborasi tim yang fleksibel.",
        kekuatanUtama: [
          "Kreativitas tinggi dalam memecahkan masalah interpersonal dan operasional.",
          "Kecerdasan emosional yang mendukung komunikasi asertif dan diplomatis.",
          "Kemampuan mengubah konsep abstrak menjadi strategi implementatif yang menarik.",
        ],
        blindspots: [
          "Cenderung menghindari konfrontasi langsung meskipun ada masalah struktural yang mendesak.",
          "Rentan overthinking terhadap ekspektasi atau pandangan orang lain terhadap hasil kerjanya.",
          "Sering kesulitan menetapkan batasan profesional ketika urusan pekerjaan menyentuh empati emosional.",
        ],
        lingkunganOptimal: [
          "Industri kreatif, agensi konsultan, riset sosial, dan human capital.",
          "Organisasi yang memiliki budaya terbuka, suportif, dan inovatif.",
          "Posisi yang memungkinkan interaksi berkelanjutan dengan klien atau komunitas.",
        ],
      };
    }
    // Default MBTI / Kepribadian
    return {
      deskripsi:
        "Karakteristikmu mencerminkan kecenderungan analitis yang kuat, gaya komunikasi yang terstruktur, serta orientasi tinggi terhadap pencapaian dan kolaborasi yang harmonis.",
      makna:
        "Mampu membangun keselarasan dan kohesi tim kerja, merumuskan solusi berpusat pada manusia, serta menginspirasi rekan kerja dengan empati tulus.",
      kekuatanUtama: [
        "Komunikasi persuasif yang berakar pada empati tulus dan pemahaman interpersonal.",
        "Kemampuan membangun keselarasan dan kohesi tim kerja dalam mencapai target bersama.",
        "Ketajaman dalam merumuskan solusi strategis yang tetap berpusat pada kesejahteraan manusia.",
      ],
      blindspots: [
        "Cenderung mengabaikan kebutuhan diri sendiri demi mendahulukan kepentingan atau perasaan orang lain.",
        "Rentan mengalami kelelahan emosional (burnout) akibat terlalu menyerap beban masalah lingkungan sekitar.",
        "Sulit menolak permintaan tambahan atau menetapkan batasan beban kerja pribadi yang tegas.",
      ],
      lingkunganOptimal: [
        "Industri edukasi, psikologi, human resource, konsultasi, dan pengembangan komunitas.",
        "Posisi strategis dengan ruang kolaborasi tim yang fleksibel, hangat, dan suportif.",
        "Budaya organisasi yang menghargai inovasi sosial, empati, dan pengakuan personal yang transparan.",
      ],
    };
  })();

  const { interpretation, meaning, tips, recommendations } = resultData;


  const handleDownloadPdf = () => {
    setIsDownloading(true);
    const element = document.getElementById("laporan-berbayar-container");

    if (element && (window as any).html2canvas) {
      ;(window as any)
        .html2canvas(element, { scale: 2, backgroundColor: "#FFFFFF" })
        .then((canvas: HTMLCanvasElement) => {
          const link = document.createElement("a");
          link.download = `Laporan-Resmi-Psikotes-${params.testId.toUpperCase()}-Empathika.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          setIsDownloading(false);
        })
        .catch(() => {
          window.print();
          setIsDownloading(false);
        });
    } else {
      // Fallback native browser print dialog (Save as PDF)
      window.print();
      setIsDownloading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // JIKA PSIKOTES GRATIS: Tampilkan interpretasi dinamis dari database
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isPaid) {
    // Loading state while fetching db data
    if (isLoadingDb) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
          <p className="text-sm text-gray-500 font-medium">Memuat hasil psikotes...</p>
        </div>
      );
    }

    // Derive display interpretation text
    const interpretasiText = dbInterpretasi?.deskripsi || (dbPackage ? (dbPackage.deskripsi || "Asesmen psikotes telah berhasil diselesaikan.") : interpretation);
    const maknaTeks = dbInterpretasi?.makna || (dbPackage ? null : meaning);
    const dbTips = (Array.isArray(dbInterpretasi?.tips) && dbInterpretasi.tips.length > 0)
      ? dbInterpretasi.tips as Array<{ title: string; desc: string }>
      : (dbPackage ? [] : tips);

    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 lg:pt-36">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-sm font-semibold tracking-wide text-primary uppercase">
              Hasil Psikotesmu
            </h2>
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

              {/* 4. Tips atau Saran */}
              {dbTips.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Tips untukmu</h2>
                  <div className="space-y-4">
                    {dbTips.map((tip, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{tip.title}</h4>
                          <p className="mt-1 text-gray-600 leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar / CTA Column */}
            <div className="md:col-span-4 space-y-6">
              {/* Card Upsell Paket Berbayar / Download PDF Laporan Resmi */}
              <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/50 rounded-3xl p-6 sm:p-7 border border-purple-200/80 shadow-xs space-y-3.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#561269] bg-purple-100 px-2.5 py-1 rounded-md inline-block">
                  Laporan Resmi (PDF)
                </span>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  Ingin Analisis Lengkap &amp; Download Hasil PDF?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Dapatkan pemetaan mendalam kekuatan diri, area blindspots, serta sertifikat/laporan resmi asesmen yang siap diunduh &amp; dicetak.
                </p>
                <Link
                  href={`/psikotes/${params.testId}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#561269] hover:bg-[#763E8B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>Lihat Paket Lengkap &amp; PDF</span>
                </Link>
              </div>

              {/* 5. Ajakan untuk Konsultasi */}
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

          {/* 6. Rekomendasi Tes untukmu */}
          <section className="space-y-8 pt-12 border-t border-gray-200">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Rekomendasi Tes Lainnya</h2>
              <p className="text-gray-600">
                Kenali dirimu lebih dalam dengan berbagai tes psikologi yang telah kami sediakan khusus untukmu.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                  <div className={`h-48 w-full ${rec.bgColor} overflow-hidden relative`}>
                    <div className="absolute inset-0 flex items-start p-6">
                      <div className="text-left w-full">
                        <h3 className={`${rec.titleColor} font-bold text-[24px] leading-none mb-2 uppercase drop-shadow-sm`}>{rec.topTitle}</h3>
                        <p className={`${rec.titleColor} text-sm font-medium drop-shadow-sm`}>{rec.topSubtitle}</p>
                      </div>
                    </div>
                    {rec.shape === "circles" && (
                      <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="white"/><circle cx="50" cy="120" r="50" fill="white"/></svg>
                      </div>
                    )}
                    {rec.shape === "circles-dark" && (
                      <div className="absolute -bottom-4 right-0 opacity-20 mix-blend-overlay">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="black"/><circle cx="50" cy="120" r="50" fill="black"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-6 leading-tight">{rec.bottomTitle}</h3>
                    
                    <div className="mt-auto">
                      <Link href={`/psikotes/${rec.id}`} className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
                        Ikuti Tes Sekarang
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // JIKA PSIKOTES BERBAYAR: Tampilan Profesional Web dengan Download PDF
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#FAFAFC] font-poppins pt-24 pb-20 px-4 sm:px-6 lg:px-8 lg:pt-32">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        strategy="lazyOnload"
      />

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Bersih & Profesional */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <p className="text-xs font-bold text-[#561269] uppercase tracking-wider mb-1.5">
              Laporan Analisis Asesmen
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              {displayTestName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
              Evaluasi mendalam profil personal, gaya komunikasi, serta panduan pengembangan potensi dirimu.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-5 py-2.5 rounded-xl bg-[#561269] hover:bg-[#6e1886] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Menyiapkan PDF..." : "Download Laporan (PDF)"}</span>
            </button>
          </div>
        </div>

        {/* ══ KONTEN UTAMA LAPORAN BERBAYAR ══ */}
        <div id="laporan-berbayar-container" className="space-y-8">
          
          {/* 1. Hasil Utama (Clean & Modern Card) */}
          <section className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 shadow-xs text-center">
            {dynamicResult.prefix && (
              <p className="text-sm sm:text-base font-semibold text-gray-500 mb-2">{dynamicResult.prefix}</p>
            )}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#561269] tracking-tight mb-4">
              {dynamicResult.value}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {berbayarDetail.deskripsi}
            </p>
          </section>

          {/* 2. Grid Konten: Kolom Kiri (Analisis) & Kolom Kanan (Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Kolom Kiri: Analisis Lengkap */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Interpretasi Hasil & Implikasi Strategis */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#561269]" />
                    Interpretasi Analisis &amp; Landasan Ilmiah
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {berbayarDetail.deskripsi}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8FB] border border-[#EFE7F2]">
                  <h4 className="text-xs font-bold text-[#561269] uppercase tracking-wider mb-2">
                    Implikasi bagi Kehidupan Sehari-hari
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {berbayarDetail.makna}
                  </p>
                </div>
              </section>

              {/* Analisis Karakteristik: Kekuatan Utama vs Blindspots */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#561269]" />
                    Analisis Karakteristik &amp; Dinamika Diri
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pemetaan keunggulan utama serta area blindspot yang perlu kamu waspadai untuk berkembang optimal:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kekuatan Utama */}
                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        Kekuatan Utama (Core Strengths)
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-emerald-950">
                      {berbayarDetail.kekuatanUtama.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Titik Rawan & Blindspots */}
                  <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/70">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                        Titik Rawan (Blindspots)
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-rose-950">
                      {berbayarDetail.blindspots.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Lingkungan & Budaya Kerja Optimal */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#561269]" />
                    Lingkungan &amp; Budaya Optimal
                  </h3>
                  <p className="text-xs text-gray-500">
                    Kondisi eksternal yang paling mendukung performa optimal dan kesejahteraan emosionalmu:
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/70">
                  <ul className="space-y-2.5 text-xs text-gray-800">
                    {berbayarDetail.lingkunganOptimal.map((ling, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{ling}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Tips & Langkah Pengembangan Diri */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#561269]" />
                    Langkah Pengembangan Diri
                  </h3>
                  <p className="text-xs text-gray-500">
                    Saran praktis untuk memaksimalkan potensi dan menjaga keseimbangan energimu:
                  </p>
                </div>

                <div className="space-y-3">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-[#561269]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{tip.title}</h4>
                        <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Kolom Kanan: Sidebar Aksi & Konsultasi */}
            <div className="lg:col-span-4 space-y-6 sticky top-[120px]">
              
              {/* Card Ringkasan Asesmen */}
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Informasi Asesmen
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Status Tes</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Selesai</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Cakupan Laporan</span>
                    <span className="font-semibold text-[#561269]">Analisis Komprehensif</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Validitas Respon</span>
                    <span className="font-semibold text-gray-900">Konsisten</span>
                  </div>
                </div>
              </div>

              {/* Card Ajakan Konsultasi */}
              <div className="bg-gradient-to-br from-[#561269] to-[#763E8B] text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EAB308] block">
                  Konsultasi Psikolog
                </span>
                <h4 className="text-lg font-bold leading-snug">
                  Ingin Membahas Hasil Ini Secara Mendalam?
                </h4>
                <p className="text-xs text-purple-100 leading-relaxed">
                  Konsultasikan hasil analisismu bersama psikolog berlisensi Empathika untuk panduan karir dan pengembangan diri yang personal.
                </p>
                <Link href="/konseling" className="block pt-1">
                  <button className="w-full py-3 rounded-xl bg-[#EAB308] hover:bg-[#FACC15] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer">
                    <Calendar className="w-4 h-4" />
                    <span>Jadwalkan Sesi Konsultasi</span>
                  </button>
                </Link>
              </div>

            </div>

          </div>

        </div>

        {/* Rekomendasi Tes Lainnya (Bagian Bawah) */}
        <section className="pt-10 border-t border-gray-200 space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900">Eksplorasi Asesmen Lainnya</h3>
            <p className="text-xs text-gray-500 mt-1">
              Lengkapi pemetaan potensimu dengan ragam tes psikologi Empathika.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className={`h-40 w-full ${rec.bgColor} overflow-hidden relative`}>
                  <div className="absolute inset-0 flex items-start p-6">
                    <div className="text-left w-full">
                      <h4 className={`${rec.titleColor} font-bold text-[22px] leading-none mb-1.5 uppercase drop-shadow-sm`}>{rec.topTitle}</h4>
                      <p className={`${rec.titleColor} text-xs font-medium drop-shadow-sm`}>{rec.topSubtitle}</p>
                    </div>
                  </div>
                  {rec.shape === "circles" && (
                    <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay">
                      <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="white"/><circle cx="50" cy="120" r="50" fill="white"/></svg>
                    </div>
                  )}
                  {rec.shape === "circles-dark" && (
                    <div className="absolute -bottom-4 right-0 opacity-20 mix-blend-overlay">
                      <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="black"/><circle cx="50" cy="120" r="50" fill="black"/></svg>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-4 leading-tight">{rec.bottomTitle}</h4>
                  <div className="mt-auto">
                    <Link href={`/psikotes/${rec.id}` as any} className="w-full flex items-center justify-center py-2.5 rounded-full bg-[#EAB308] text-black font-bold text-xs hover:bg-yellow-500 transition-colors shadow-sm">
                      Ikuti Tes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
