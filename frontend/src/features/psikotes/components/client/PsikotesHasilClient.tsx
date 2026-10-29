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
  User,
} from "lucide-react";
import Link from "next/link";

import { RESULT_DATA as resultData, TEST_DATA } from "../../data/psikotesData";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { useAuthStore } from "@/store/authStore";

export default function PsikotesHasilClient({ params }: { params: { testId: string } }) {
  const searchParams = useSearchParams();
  const isPaid = searchParams.get("paket") === "berbayar" || searchParams.get("plan") === "berbayar" || searchParams.get("tipe") === "berbayar";
  const [isDownloading, setIsDownloading] = useState(false);
  const [dbPackage, setDbPackage] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // ── Identitas Peserta ───────────────────────────────────────────────────────
  const [peserta, setPeserta] = useState(() => {
    const rawParamNama = searchParams.get("nama") || searchParams.get("name") || "";
    const rawParamWa =
      searchParams.get("whatsapp") ||
      searchParams.get("no_telepon") ||
      searchParams.get("phone") ||
      searchParams.get("nohp") ||
      searchParams.get("kontak") ||
      "";
    const rawParamEmail = searchParams.get("email") || searchParams.get("user_email") || "";
    const rawBookingId = searchParams.get("bookingId") || searchParams.get("orderId") || "";

    return {
      nama: rawParamNama,
      noHp: rawParamWa,
      email: rawParamEmail,
      bookingId: rawBookingId,
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  });

  useEffect(() => {
    try {
      // 1. Cek dari localStorage pendaftaran psikotes / checkout
      const raw = localStorage.getItem("empathika_peserta_psikotes");
      let savedNama = "";
      let savedWa = "";
      let savedEmail = "";
      let savedBookingId = "";

      if (raw) {
        const parsed = JSON.parse(raw);
        savedNama = parsed.nama || parsed.name || "";
        savedWa = parsed.no_telepon || parsed.whatsapp || parsed.noHp || parsed.phone || parsed.kontak || "";
        savedEmail = parsed.email || parsed.user_email || "";
        savedBookingId = parsed.bookingId || parsed.orderId || "";
      }

      // 2. Cek dari akun user yang sedang login jika belum ada
      const authUser = useAuthStore.getState().user;
      const authNama = authUser?.name || "";
      const authEmail = authUser?.email || "";

      setPeserta((prev) => {
        const finalNama = prev.nama || savedNama || authNama || (isPaid ? "Peserta Asesmen Empathika" : "Anonim");
        const finalWa = prev.noHp || savedWa || "—";
        const finalEmail = prev.email || savedEmail || authEmail || "—";
        const finalBookingId = prev.bookingId || savedBookingId || "";

        return {
          ...prev,
          nama: finalNama,
          noHp: finalWa,
          email: finalEmail,
          bookingId: finalBookingId,
        };
      });
    } catch {}
  }, [searchParams, isPaid]);

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

  const { interpretation, meaning, tips, recommendations } = resultData;

  // Data komprehensif interpretasi untuk paket Berbayar (sinkron dengan sistem Admin & Database)
  const berbayarDetail = (() => {
    // 1. Cek dari database jika ada interpretasi yang cocok
    if (dbInterpretasi) {
      let parsedTips: any = {};
      if (typeof dbInterpretasi.tips === "object" && dbInterpretasi.tips !== null && !Array.isArray(dbInterpretasi.tips)) {
        parsedTips = dbInterpretasi.tips;
      } else if (typeof dbInterpretasi.tips === "string") {
        try {
          parsedTips = JSON.parse(dbInterpretasi.tips);
        } catch {}
      }

      const kekuatanUtama: string[] = Array.isArray(parsedTips.kekuatanUtama) && parsedTips.kekuatanUtama.length > 0
        ? (parsedTips.kekuatanUtama as string[])
        : [];
      const blindspots: string[] = Array.isArray(parsedTips.blindspots) && parsedTips.blindspots.length > 0
        ? (parsedTips.blindspots as string[])
        : [];
      const lingkunganOptimal: string[] = Array.isArray(parsedTips.lingkunganOptimal) && parsedTips.lingkunganOptimal.length > 0
        ? (parsedTips.lingkunganOptimal as string[])
        : [];

      const saranList: Array<{ title: string; desc: string }> = Array.isArray(parsedTips.saran) && parsedTips.saran.length > 0
        ? parsedTips.saran
        : (Array.isArray(dbInterpretasi.tips) ? (dbInterpretasi.tips as any) : tips);

      if (dbInterpretasi.deskripsi || kekuatanUtama.length > 0) {
        return {
          deskripsi: dbInterpretasi.deskripsi || "",
          makna: dbInterpretasi.makna || "",
          kekuatanUtama,
          blindspots,
          lingkunganOptimal,
          judulKekuatan: parsedTips.judulKekuatan || "Potensi atau Kekuatan Utama",
          judulBlindspots: parsedTips.judulBlindspots || "Area yang Perlu Dikembangkan",
          judulLingkungan: parsedTips.judulLingkungan || "Kondisi atau Lingkungan yang Mendukung",
          saranList,
        };
      }
    }

    if (params.testId === "love-language") {
      return {
        deskripsi:
          "Hasil asesmen komprehensif menunjukkan bahasa cinta utamamu adalah Words of Affirmation. Kamu paling merasa dihargai dan dicintai melalui kata-kata verbal yang tulus, apresiasi spesifik, dan komunikasi yang membangun.",
        makna:
          "Pujian yang tulus, ucapan terima kasih yang jujur, dan kata-kata penyemangat memiliki dampak emosional yang mendalam bagimu dalam memperkuat ikatan hubungan interpersonal.",
        judulKekuatan: "Potensi atau Kekuatan Utama",
        judulBlindspots: "Area yang Perlu Dikembangkan",
        judulLingkungan: "Kondisi atau Lingkungan yang Mendukung",
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
        saranList: tips,
      };
    }
    if (params.testId === "kesiapan-karir" || params.testId.includes("karier") || params.testId.includes("karir")) {
      return {
        deskripsi:
          "Dominasi minat berfokus pada inovasi, ekspresi ide orisinal, serta komunikasi persuasif yang berakar pada empati tulus.",
        makna:
          "Unggul dalam industri edukasi, psikologi, human resource, dan perancangan strategi kreatif dengan ruang kolaborasi tim yang fleksibel.",
        judulKekuatan: "Potensi atau Kekuatan Utama",
        judulBlindspots: "Area yang Perlu Dikembangkan",
        judulLingkungan: "Kondisi atau Lingkungan yang Mendukung",
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
        saranList: tips,
      };
    }
    // Default MBTI / Kepribadian
    return {
      deskripsi:
        "Karakteristikmu mencerminkan kecenderungan analitis yang kuat, gaya komunikasi yang terstruktur, serta orientasi tinggi terhadap pencapaian dan kolaborasi yang harmonis.",
      makna:
        "Mampu membangun keselarasan dan kohesi tim kerja, merumuskan solusi berpusat pada manusia, serta menginspirasi rekan kerja dengan empati tulus.",
      judulKekuatan: "Potensi atau Kekuatan Utama",
      judulBlindspots: "Area yang Perlu Dikembangkan",
      judulLingkungan: "Kondisi atau Lingkungan yang Mendukung",
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
      saranList: tips,
    };
  })();

  const handleDownloadPdf = async () => {
    setIsDownloading(true);

    const target = document.getElementById("laporan-berbayar-container");
    const sidebar = document.getElementById("laporan-sidebar-aksi");
    const leftCol = document.getElementById("laporan-kolom-kiri");
    const headerPdf = document.getElementById("laporan-pdf-header");
    const footerPdf = document.getElementById("laporan-pdf-footer");

    if (!target) {
      window.print();
      setIsDownloading(false);
      return;
    }

    const originalScrollY = window.scrollY;
    const prevWidth = target.style.width;
    const prevMaxWidth = target.style.maxWidth;

    try {
      // Helper untuk memuat library html2pdf jika belum ada di window
      const getHtml2Pdf = async (): Promise<any> => {
        if (typeof window === "undefined") return null;
        if ((window as any).html2pdf) return (window as any).html2pdf;

        return new Promise((resolve, reject) => {
          const existing = document.querySelector('script[src*="html2pdf"]');
          if (existing) {
            existing.addEventListener("load", () => resolve((window as any).html2pdf));
            existing.addEventListener("error", reject);
            if ((window as any).html2pdf) resolve((window as any).html2pdf);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.async = true;
          script.onload = () => resolve((window as any).html2pdf);
          script.onerror = reject;
          document.body.appendChild(script);
        });
      };

      const html2pdf = await getHtml2Pdf();
      if (!html2pdf) {
        throw new Error("Library html2pdf gagal dimuat");
      }

      // 1. Scroll ke paling atas untuk mencegah offset html2canvas
      window.scrollTo(0, 0);

      // 2. Aktifkan mode PDF dokumen profesional:
      // Menghilangkan background putih card web, border luar, dan shadow yang membuat PDF terpotong/kotor
      target.classList.add("pdf-export-mode");

      if (headerPdf) headerPdf.style.display = "block";
      if (footerPdf) footerPdf.style.display = "block";
      if (sidebar) sidebar.style.display = "none";
      if (leftCol) {
        leftCol.style.width = "100%";
        leftCol.style.gridColumn = "1 / -1";
      }

      // Berikan jeda 300ms agar browser merender ulang layout dokumen sebelum di-capture
      await new Promise((resolve) => setTimeout(resolve, 300));

      const cleanFileName = `Laporan-Resmi-Psikotes-${(peserta.nama || "Peserta").replace(/[^a-zA-Z0-9]/g, "_")}-Empathika.pdf`;

      const opt = {
        margin: [10, 10, 10, 10], // Margin simetris presisi 10mm di setiap sisi (rata tengah sempurna)
        filename: cleanFileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc: any) => {
            const clonedTarget = clonedDoc.getElementById("laporan-berbayar-container");
            if (clonedTarget) {
              clonedTarget.style.width = "100%";
              clonedTarget.style.maxWidth = "100%";
              clonedTarget.style.margin = "0 auto";
              clonedTarget.style.padding = "0";
              clonedTarget.style.boxSizing = "border-box";
              if (clonedTarget.parentElement) {
                clonedTarget.parentElement.style.width = "100%";
                clonedTarget.parentElement.style.maxWidth = "100%";
                clonedTarget.parentElement.style.margin = "0 auto";
                clonedTarget.parentElement.style.padding = "0";
              }
            }
          },
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [".pdf-card", ".pdf-avoid-break", ".pdf-sub-box", ".pdf-tip-item", "#laporan-pdf-footer"],
        },
      };

      await html2pdf().set(opt).from(target).save();
    } catch (err) {
      console.error("[PDF Download Error]", err);
      window.print();
    } finally {
      // 3. Kembalikan layout tampilan web seperti semula secara mulus
      target.classList.remove("pdf-export-mode");
      if (headerPdf) headerPdf.style.display = "none";
      if (footerPdf) footerPdf.style.display = "none";
      if (sidebar) sidebar.style.display = "";
      if (leftCol) {
        leftCol.style.width = "";
        leftCol.style.gridColumn = "";
      }
      window.scrollTo(0, originalScrollY);
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
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        strategy="afterInteractive"
      />

      {/* CSS Khusus Mode Cetak & Export PDF: Dokumen Clean, Rapi, Standar A4 & Profesional */}
      <style dangerouslySetInnerHTML={{ __html: `
        .pdf-export-mode {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin: 0 auto !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .pdf-export-mode .pdf-main-grid {
          display: block !important;
          width: 100% !important;
          margin: 0 auto !important;
          padding: 0 !important;
          gap: 0 !important;
        }
        .pdf-export-mode #laporan-kolom-kiri {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        .pdf-export-mode #laporan-pdf-header {
          width: 100% !important;
          margin: 0 auto 14px auto !important;
          box-sizing: border-box !important;
        }
        .pdf-export-mode .pdf-card {
          box-shadow: none !important;
          border-radius: 10px !important;
          border: 1px solid #E5E7EB !important;
          padding: 14px 18px !important;
          margin: 0 auto 12px auto !important;
          width: 100% !important;
          box-sizing: border-box !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          background: #ffffff !important;
        }
        .pdf-export-mode .pdf-hero-card {
          box-shadow: none !important;
          border-radius: 10px !important;
          padding: 16px 20px !important;
          margin: 0 auto 12px auto !important;
          width: 100% !important;
          box-sizing: border-box !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          background: #FAF8FB !important;
          border-left-width: 4px !important;
          border-left-color: #561269 !important;
        }
        .pdf-export-mode .pdf-result-val {
          font-size: 22px !important;
          font-weight: 800 !important;
          line-height: 1.25 !important;
          margin-bottom: 4px !important;
          color: #561269 !important;
        }
        .pdf-export-mode .pdf-heading {
          font-size: 13.5px !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
          margin-bottom: 4px !important;
          color: #111827 !important;
        }
        .pdf-export-mode .pdf-subheading {
          font-size: 10px !important;
          color: #6B7280 !important;
          margin-bottom: 8px !important;
        }
        .pdf-export-mode .pdf-body {
          font-size: 10.5px !important;
          line-height: 1.55 !important;
          color: #374151 !important;
        }
        .pdf-export-mode .pdf-grid-4 {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 10px !important;
        }
        .pdf-export-mode .pdf-meta-box {
          padding: 8px 12px !important;
          border-radius: 8px !important;
          background: #F9FAFB !important;
          border: 1px solid #F3F4F6 !important;
        }
        .pdf-export-mode .pdf-meta-label {
          font-size: 9px !important;
          margin-bottom: 2px !important;
          color: #6B7280 !important;
        }
        .pdf-export-mode .pdf-meta-val {
          font-size: 11.5px !important;
          font-weight: 700 !important;
        }
        .pdf-export-mode .pdf-sub-box {
          padding: 10px 14px !important;
          border-radius: 8px !important;
        }
        .pdf-export-mode .pdf-sub-title {
          font-size: 10px !important;
          margin-bottom: 4px !important;
        }
        .pdf-export-mode .pdf-grid-2 {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 10px !important;
        }
        .pdf-export-mode .pdf-list-item {
          font-size: 10px !important;
          line-height: 1.45 !important;
          margin-bottom: 4px !important;
        }
        .pdf-export-mode .pdf-tip-item {
          padding: 8px 12px !important;
          border-radius: 8px !important;
          margin-bottom: 6px !important;
          gap: 10px !important;
        }
        .pdf-export-mode .pdf-tip-title {
          font-size: 11.5px !important;
          font-weight: 700 !important;
        }
        .pdf-export-mode .pdf-tip-desc {
          font-size: 10px !important;
          line-height: 1.4 !important;
        }
        .pdf-export-mode .pdf-page-break-before {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .pdf-export-mode .pdf-avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .pdf-export-mode #laporan-kolom-kiri > * + * {
          margin-top: 10px !important;
        }
        .pdf-export-mode #laporan-pdf-footer {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-top: 14px !important;
          padding-top: 10px !important;
        }

        @media print {
          .print\\:hidden { display: none !important; }
          #laporan-pdf-header { display: block !important; }
          #laporan-pdf-footer { display: block !important; }
          #laporan-sidebar-aksi { display: none !important; }
          #laporan-kolom-kiri { width: 100% !important; grid-column: 1 / -1 !important; }
          #laporan-berbayar-container {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .pdf-card {
            box-shadow: none !important;
            border-radius: 10px !important;
            border: 1px solid #E5E7EB !important;
            padding: 12px 16px !important;
            margin-bottom: 10px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .pdf-page-break-before {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .pdf-grid-4 {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }
          .pdf-grid-2 {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
        }
      `}} />

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

          <div className="flex items-center gap-3 shrink-0 print:hidden">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-98 ${
                isDownloading ? "bg-[#763E8B] text-white opacity-80 cursor-wait" : "bg-[#561269] hover:bg-[#6e1886] text-white cursor-pointer"
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunduh PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Laporan (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ══ KONTEN UTAMA LAPORAN BERBAYAR (TAMPILAN WEB & PDF) ══ */}
        <div id="laporan-berbayar-container" className="space-y-6 bg-white p-4 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs">

          {/* Kop Surat Resmi Empathika khusus Dokumen PDF */}
          <div
            id="laporan-pdf-header"
            style={{ display: "none" }}
            className="pb-4 mb-5 border-b-2 border-[#561269] pdf-avoid-break"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-black text-[#561269] tracking-tight">EMPATHIKA</div>
                <div className="text-[10px] font-medium text-gray-500 mt-0.5">Pusat Layanan Asesmen &amp; Konsultasi Psikologi Digital</div>
                <div className="text-[9px] text-gray-400 mt-0.5">www.empathika.id • info@empathika.id</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#561269]">
                  Laporan Hasil Asesmen Psikotes
                </div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{displayTestName}</div>
                <div className="text-[9px] font-medium text-gray-500 mt-0.5">
                  No. Dokumen: <span className="font-mono font-bold text-gray-800">EMP-PSI-{peserta.bookingId ? String(peserta.bookingId).slice(-6).toUpperCase() : "VERIFIED"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Identitas Peserta Asesmen */}
          <div style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight pdf-heading">
                    Identitas Peserta Asesmen
                  </h3>
                  <p className="text-xs text-gray-500 pdf-subheading">
                    Data resmi peserta pengerjaan asesmen psikotes
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                Terverifikasi Resmi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pdf-grid-4">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 pdf-meta-box">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 pdf-meta-label">
                  Nama Lengkap
                </span>
                <span className="font-extrabold text-sm text-gray-900 block truncate pdf-meta-val">
                  {peserta.nama || "Peserta Asesmen Empathika"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 pdf-meta-box">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 pdf-meta-label">
                  Kontak WhatsApp
                </span>
                <span className="font-bold text-sm text-emerald-700 block truncate pdf-meta-val">
                  {peserta.noHp || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 pdf-meta-box">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 pdf-meta-label">
                  Email Terdaftar
                </span>
                <span className="font-bold text-sm text-gray-800 block truncate pdf-meta-val">
                  {peserta.email || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 pdf-meta-box">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 pdf-meta-label">
                  Tanggal Asesmen
                </span>
                <span className="font-bold text-sm text-gray-800 block truncate pdf-meta-val">
                  {peserta.tanggal}
                </span>
              </div>
            </div>
          </div>

          {/* 1. Hasil Utama (Clean & Modern Card) */}
          <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card pdf-hero-card bg-[#FAF8FB] rounded-xl border border-purple-200/70 p-6 sm:p-8 shadow-xs text-center border-l-4 border-l-[#561269]">
            {dynamicResult.prefix && (
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pdf-subheading">{dynamicResult.prefix}</p>
            )}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#561269] tracking-tight mb-2 pdf-result-val">
              {dynamicResult.value}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed pdf-body">
              {berbayarDetail.deskripsi}
            </p>
          </section>

          {/* 2. Grid Konten: Kolom Kiri (Analisis) & Kolom Kanan (Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pdf-main-grid">
            
            {/* Kolom Kiri: Analisis Lengkap */}
            <div id="laporan-kolom-kiri" className="lg:col-span-8 space-y-8 print:w-full print:col-span-12">
              
              {/* Interpretasi Hasil & Implikasi Strategis */}
              <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 pdf-heading">
                    <Info className="w-5 h-5 text-[#561269]" />
                    Interpretasi Hasil
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed pdf-body">
                    {berbayarDetail.deskripsi}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8FB] border border-[#EFE7F2] pdf-sub-box">
                  <h4 className="text-xs font-bold text-[#561269] uppercase tracking-wider mb-2 pdf-sub-title">
                    Makna Hasil dalam Kehidupan Sehari-hari
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pdf-body">
                    {berbayarDetail.makna}
                  </p>
                </div>
              </section>

              {/* Analisis Karakteristik & Dinamika Diri */}
              <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2 pdf-heading">
                    <ShieldCheck className="w-5 h-5 text-[#561269]" />
                    Analisis Karakteristik &amp; Dinamika Diri
                  </h3>
                  <p className="text-xs text-gray-500 pdf-subheading">
                    Pemetaan potensi keunggulan serta area pengembangan diri untuk berkembang optimal:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pdf-grid-2">
                  {/* Potensi atau Kekuatan Utama */}
                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 pdf-sub-box">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider pdf-sub-title">
                        {berbayarDetail.judulKekuatan || "Potensi atau Kekuatan Utama"}
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-emerald-950">
                      {berbayarDetail.kekuatanUtama.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 leading-relaxed pdf-list-item">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Area yang Perlu Dikembangkan */}
                  <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/70 pdf-sub-box">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-xs font-bold text-rose-900 uppercase tracking-wider pdf-sub-title">
                        {berbayarDetail.judulBlindspots || "Area yang Perlu Dikembangkan"}
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-rose-950">
                      {berbayarDetail.blindspots.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 leading-relaxed pdf-list-item">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Kondisi atau Lingkungan yang Mendukung */}
              <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2 pdf-heading">
                    <Compass className="w-5 h-5 text-[#561269]" />
                    {berbayarDetail.judulLingkungan || "Kondisi atau Lingkungan yang Mendukung"}
                  </h3>
                  <p className="text-xs text-gray-500 pdf-subheading">
                    Kondisi eksternal yang paling mendukung performa optimal dan kesejahteraan emosionalmu:
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/70 pdf-sub-box">
                  <ul className="space-y-2.5 text-xs text-gray-800">
                    {berbayarDetail.lingkunganOptimal.map((ling, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-2 leading-relaxed pdf-list-item">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{ling}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Tips & Langkah Pengembangan Diri */}
              <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2 pdf-heading">
                    <HeartHandshake className="w-5 h-5 text-[#561269]" />
                    Langkah Pengembangan Diri
                  </h3>
                  <p className="text-xs text-gray-500 pdf-subheading">
                    Saran praktis untuk memaksimalkan potensi dan menjaga keseimbangan energimu:
                  </p>
                </div>

                <div className="space-y-3">
                  {(berbayarDetail.saranList || tips).map((tip, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 pdf-tip-item">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-[#561269]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 pdf-tip-title">{tip.title}</h4>
                        <p className="mt-0.5 text-xs text-gray-600 leading-relaxed pdf-tip-desc">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Kolom Kanan: Sidebar Aksi & Konsultasi (TIDAK MASUK KE PDF / PRINT) */}
            <div id="laporan-sidebar-aksi" className="lg:col-span-4 space-y-6 sticky top-[120px] print:hidden">
              
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

          {/* Footer Resmi Asesor khusus Dokumen PDF */}
          <div
            id="laporan-pdf-footer"
            style={{ display: "none" }}
            className="pt-4 border-t border-dashed border-gray-300 mt-6 bg-white pdf-avoid-break"
          >
            <div className="flex justify-between items-end">
              <div className="text-[9px] text-gray-400 leading-relaxed max-w-xs">
                <strong>Catatan Resmi:</strong> Dokumen ini bersifat rahasia (confidential) dan diterbitkan sebagai hasil asesmen psikometri resmi Empathika.
                <br />
                Verifikasi Dokumen: <span className="font-mono text-gray-600">EMP-PSI-{peserta.bookingId ? String(peserta.bookingId).slice(-6).toUpperCase() : "VERIFIED"}</span>
              </div>
              <div className="text-center w-52">
                <div className="text-[10px] text-gray-600 mb-8">
                  Bandung, {peserta.tanggal}
                  <br />
                  Tim Asesor Asesmen Psikologi,
                </div>
                <div className="text-xs font-extrabold text-gray-900 border-t border-gray-900 pt-1">
                  Empathika Psychological Center
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Rekomendasi Tes Lainnya (Bagian Bawah - TIDAK MASUK KE PRINT) */}
        <section className="pt-10 border-t border-gray-200 space-y-6 print:hidden">
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
