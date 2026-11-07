"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { 
  Calendar, 
  Info, 
  CheckCircle2, 
  Download, 
  HeartHandshake, 
  ShieldCheck,
  AlertTriangle,
  Compass,
  Loader2,
  User,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { useAuthStore } from "@/store/authStore";
import { evaluateDASS } from "@/features/psikotes/utils/dassEvaluation";
import PsikotesRekomendasiSection from "./PsikotesRekomendasiSection";

export default function PsikotesHasilBerbayarClient({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDownloading, setIsDownloading] = useState(false);
  const [dbPackage, setDbPackage] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        const finalNama = prev.nama || savedNama || authNama || "Peserta Asesmen Empathika";
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
  }, [searchParams]);

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
      console.error("Gagal mengambil data interpretasi berbayar:", err);
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

  // Dimensi DASS-42 (Depresi, Kecemasan, Stres)
  const rawDep = searchParams.get("dep");
  const rawAnx = searchParams.get("anx");
  const rawStr = searchParams.get("str");

  const isDASS = Boolean(
    dbPackage?.alat_ukur?.kode?.toUpperCase().includes("DASS") ||
    dbPackage?.judul?.toUpperCase().includes("DASS") ||
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

  // Dynamic display name from database
  const displayTestName = dbPackage?.judul || "Laporan Hasil Psikotes";

  const dynamicResult = (() => {
    if (isDASS) {
      return {
        prefix: "DASS-42 • SKRINING KESEHATAN EMOSIONAL",
        value: "Profil Kesehatan Emosional",
        color: "text-[#561269]",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      };
    }

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
      value: dbPackage?.judul || "Laporan Hasil Psikotes",
      color: "text-[#561269]",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    };
  })();

  // Data komprehensif interpretasi untuk paket Berbayar murni dari database
  const berbayarDetail = (() => {
    if (dbInterpretasi) {
      let parsedTips: any = {};
      const rawTips = (dbInterpretasi as any)?.tips;
      if (typeof rawTips === "object" && rawTips !== null && !Array.isArray(rawTips)) {
        parsedTips = rawTips;
      } else if (typeof rawTips === "string") {
        try {
          parsedTips = JSON.parse(rawTips);
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

      const saranList: Array<{ title: string; desc: string }> =
        isDASS && dassEvaluation?.tips?.length
          ? dassEvaluation.tips
          : Array.isArray(parsedTips.saran) && parsedTips.saran.length > 0
            ? parsedTips.saran
            : (Array.isArray(rawTips) ? (rawTips as any) : []);

      return {
        deskripsi: dbInterpretasi.deskripsi || dbPackage?.deskripsi || "Asesmen psikotes telah berhasil diselesaikan.",
        kekuatanUtama,
        blindspots,
        lingkunganOptimal,
        judulKekuatan: parsedTips.judulKekuatan || "Potensi atau Kekuatan Utama",
        judulBlindspots: parsedTips.judulBlindspots || "Area yang Perlu Dikembangkan",
        judulLingkungan: parsedTips.judulLingkungan || "Kondisi atau Lingkungan yang Mendukung",
        saranList,
      };
    }

    // Jika belum ada data interpretasi yang cocok di database
    return {
      deskripsi: dbPackage?.deskripsi || "Hasil asesmen psikotes telah selesai dianalisis.",
      judulKekuatan: "Potensi atau Kekuatan Utama",
      judulBlindspots: "Area yang Perlu Dikembangkan",
      judulLingkungan: "Kondisi atau Lingkungan yang Mendukung",
      kekuatanUtama: [],
      blindspots: [],
      lingkunganOptimal: [],
      saranList: [],
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

      // 2. Aktifkan mode PDF dokumen profesional
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
        margin: [10, 10, 10, 10],
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

  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
        <p className="text-sm text-gray-500 font-medium">Memuat laporan resmi psikotes...</p>
      </div>
    );
  }

  // Layar Error Koneksi — Jika backend mati
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] font-sans pt-24 pb-12 px-4 flex flex-col items-center justify-center">
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
  // Jika kategori interpretasi belum dikonfigurasi di database untuk skor ini,
  // JANGAN gunakan fallback dummy (misal judul pura-pura "Tes Tingkat Kecemasan").
  if (!dbInterpretasi) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] font-sans pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {dbPackage?.judul || "Laporan Hasil Psikotes"}
          </h2>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Interpretasi Skor Belum Dikonfigurasi
          </p>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Demi menjaga etika dan integritas diagnostik psikologi, laporan hasil komprehensif tidak dapat dibuat karena kategori interpretasi skor untuk instrumen ini belum dikonfigurasi di database.
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

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-sans pt-24 pb-20 px-4 sm:px-6 lg:px-8 lg:pt-32">
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
        .pdf-export-mode .pdf-grid-3 {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
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
          .pdf-grid-3 {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
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
              Laporan Analisis Asesmen Resmi
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pdf-grid-3">
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
              {isDASS && dassEvaluation ? dassEvaluation.introText : berbayarDetail.deskripsi}
            </p>
          </section>

          {/* 2. Grid Konten: Kolom Kiri (Analisis) & Kolom Kanan (Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pdf-main-grid">
            
            {/* Kolom Kiri: Analisis Lengkap */}
            <div id="laporan-kolom-kiri" className="lg:col-span-8 space-y-8 print:w-full print:col-span-12">
              
              {/* Profil 3 Dimensi DASS-42 (Depresi, Kecemasan, Stres) */}
              {dassEvaluation && (
                <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pdf-heading">
                      <Compass className="w-5 h-5 text-[#561269]" />
                      Profil 3 Dimensi: Depresi, Kecemasan, &amp; Stres
                    </h3>
                    <span className="text-xs font-semibold text-gray-400">Maks. 42 / dimensi</span>
                  </div>

                  <div className="space-y-4">
                    {dassEvaluation.subscalesList.map((sub, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${sub.barColor} shrink-0`} />
                            <span className="font-bold text-sm text-gray-900">{sub.name}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-700">
                            {sub.score} <span className="text-gray-400 font-normal">/ {sub.maxScore}</span>
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${sub.barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.max(6, sub.percentage)}%` }}
                          />
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed pt-0.5">
                          {sub.deskripsi}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

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
              </section>

              {/* Analisis Karakteristik & Dinamika Diri */}
              {(berbayarDetail.kekuatanUtama.length > 0 || berbayarDetail.blindspots.length > 0) && (
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
                    {berbayarDetail.kekuatanUtama.length > 0 && (
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
                    )}

                    {/* Area yang Perlu Dikembangkan */}
                    {berbayarDetail.blindspots.length > 0 && (
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
                    )}
                  </div>
                </section>
              )}

              {/* Kondisi atau Lingkungan yang Mendukung */}
              {berbayarDetail.lingkunganOptimal.length > 0 && (
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
              )}

              {/* Tips & Langkah Pengembangan Diri */}
              {berbayarDetail.saranList.length > 0 && (
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
                    {berbayarDetail.saranList.map((tip: any, index: number) => (
                      <div key={index} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 pdf-tip-item">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-[#561269]" />
                        </div>
                        <div>
                          {typeof tip === "string" ? (
                            <p className="text-xs text-gray-600 leading-relaxed pdf-tip-desc">{tip}</p>
                          ) : (
                            <>
                              {tip.title && <h4 className="text-sm font-bold text-gray-900 pdf-tip-title">{tip.title}</h4>}
                              {tip.desc && <p className="mt-0.5 text-xs text-gray-600 leading-relaxed pdf-tip-desc">{tip.desc}</p>}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

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
                  {dassEvaluation && (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Rincian Skor Dimensi
                      </span>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Depresi</span>
                        <span className="font-semibold text-gray-800">{dassEvaluation.depression.score} / 42</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Kecemasan</span>
                        <span className="font-semibold text-gray-800">{dassEvaluation.anxiety.score} / 42</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Stres</span>
                        <span className="font-semibold text-gray-800">{dassEvaluation.stress.score} / 42</span>
                      </div>
                    </div>
                  )}
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

        {/* Rekomendasi Tes Dinamis dari Database (TIDAK MASUK KE PRINT) */}
        <PsikotesRekomendasiSection currentTestId={params.testId} />

      </div>
    </div>
  );
}
