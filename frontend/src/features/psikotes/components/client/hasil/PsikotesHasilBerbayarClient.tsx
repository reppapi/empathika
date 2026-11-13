/** Halaman laporan resmi hasil psikotes berbayar lengkap dengan fitur unduh PDF dan cetak browser. */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { evaluateDASS } from "@/features/psikotes/utils/dassEvaluation";
import {
  downloadLaporanPsikotesPdf,
  tailwindBarToHex,
  type LaporanPsikotesPdfData,
} from "@/features/psikotes/utils/downloadLaporanPsikotesPdf";
import PsikotesRekomendasiSection from "./PsikotesRekomendasiSection";
import CrisisHotlineCard from "./CrisisHotlineCard";

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
    const rawUmur = searchParams.get("umur") || "";
    const rawGender = searchParams.get("gender") || searchParams.get("jenisKelamin") || "";
    const rawPendidikan = searchParams.get("pendidikan") || "";
    const rawPekerjaan = searchParams.get("pekerjaan") || "";
    const rawKategori = searchParams.get("kategori") || "";

    return {
      nama: rawParamNama,
      noHp: rawParamWa,
      email: rawParamEmail,
      usia: rawUmur,
      jenisKelamin: rawGender,
      pendidikan: rawPendidikan,
      pekerjaan: rawPekerjaan,
      kategori: rawKategori,
      tempatLahir: "",
      tanggalLahir: "",
      statusPernikahan: searchParams.get("status") || "",
      namaOrangTua: "",
      noTeleponOrangTua: "",
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
      // 1. Cek dari localStorage identitas peserta pengerjaan asesmen (BUKAN data pembeli akun/checkout)
      const raw = localStorage.getItem("empathika_peserta_psikotes");
      let savedNama = "";
      let savedWa = "";
      let savedEmail = "";
      let savedBookingId = "";
      let savedUmur = "";
      let savedGender = "";
      let savedPendidikan = "";
      let savedPekerjaan = "";
      let savedNamaOrangTua = "";
      let savedNoTeleponOrangTua = "";

      if (raw) {
        const parsed = JSON.parse(raw);
        // HANYA ambil jika merupakan identitas formulir peserta tes (memiliki tempatLahir / tanggalLahir / noTelepon / jenisKelamin)
        if (parsed.tempatLahir || parsed.tanggalLahir || parsed.jenisKelamin || parsed.noTelepon) {
          savedNama = parsed.nama || "";
          savedWa = parsed.noTelepon || parsed.no_telepon || parsed.whatsapp || "";
          savedEmail = parsed.email || "";
          savedUmur = parsed.umur ? String(parsed.umur) : "";
          savedGender = parsed.jenisKelamin || "";
          savedPendidikan = parsed.pendidikan || "";
          savedPekerjaan = parsed.pekerjaan || "";
          savedNamaOrangTua = parsed.namaOrangTua || parsed.nama_orang_tua || "";
          savedNoTeleponOrangTua = parsed.noTeleponOrangTua || parsed.no_telepon_orang_tua || "";
        }
        savedBookingId = parsed.bookingId || parsed.orderId || "";
      }

      setPeserta((prev) => {
        // Penting: JANGAN gunakan fallback akun login authUser (karena pembeli/wali bisa berbeda dari peserta tes)
        const finalNama = prev.nama || savedNama || "Peserta Asesmen Empathika";
        const finalWa = prev.noHp || savedWa || "—";
        const finalEmail = prev.email || savedEmail || "—";
        const finalBookingId = prev.bookingId || savedBookingId || "";
        const finalUmur = prev.usia || savedUmur || "";
        const finalGender = prev.jenisKelamin || savedGender || "";
        const finalPendidikan = prev.pendidikan || savedPendidikan || "";
        const finalPekerjaan = prev.pekerjaan || savedPekerjaan || "";
        const finalNamaOrangTua = prev.namaOrangTua || savedNamaOrangTua || "";
        const finalNoTeleponOrangTua = prev.noTeleponOrangTua || savedNoTeleponOrangTua || "";

        return {
          ...prev,
          nama: finalNama,
          noHp: finalWa,
          email: finalEmail,
          usia: finalUmur,
          jenisKelamin: finalGender,
          pendidikan: finalPendidikan,
          pekerjaan: finalPekerjaan,
          namaOrangTua: finalNamaOrangTua,
          noTeleponOrangTua: finalNoTeleponOrangTua,
          bookingId: finalBookingId,
        };
      });
    } catch {}
  }, [searchParams]);

  const [bookingReport, setBookingReport] = useState<{
    totalSkor: number | null;
    dep: number | null;
    anx: number | null;
    str: number | null;
    detailSkor?: any | null;
    dbInterpretasi?: any | null;
  } | null>(null);

  const paramBookingId = searchParams.get("bookingId") || searchParams.get("orderId");
  const paramToken = (() => {
    const urlToken = searchParams.get("token");
    if (urlToken) return urlToken;
    if (paramBookingId && typeof window !== "undefined") {
      try {
        return localStorage.getItem(`empathika_psikotes_token_${paramBookingId}`);
      } catch {}
    }
    return null;
  })();

  // Fetch package data & verified booking report from backend (Anti-Tampering)
  const fetchPackage = async () => {
    setIsLoadingDb(true);
    setErrorMessage(null);
    try {
      // 1. Jika ada bookingId (tiket berbayar resmi), muat data otentik murni dari database beserta token akses
      if (paramBookingId) {
        try {
          const bookingRes = await psikotesService.getHasilByBooking(paramBookingId, paramToken);
          if (bookingRes?.success && bookingRes?.data) {
            const bData = bookingRes.data;
            if (bData.paket) {
              setDbPackage(bData.paket);
            }

            if (bData.peserta) {
              setPeserta((prev) => ({
                ...prev,
                nama: bData.peserta.nama_lengkap || prev.nama,
                noHp: bData.peserta.no_telepon || prev.noHp,
                usia: bData.peserta.usia !== undefined && bData.peserta.usia !== null ? String(bData.peserta.usia) : prev.usia,
                jenisKelamin: bData.peserta.jenis_kelamin || prev.jenisKelamin,
                pendidikan: bData.peserta.pendidikan || prev.pendidikan,
                pekerjaan: bData.peserta.pekerjaan || prev.pekerjaan,
                kategori: (bData.peserta as any).kategori_peserta || prev.kategori,
                tempatLahir: (bData.peserta as any).tempat_lahir || prev.tempatLahir,
                tanggalLahir: (bData.peserta as any).tanggal_lahir || prev.tanggalLahir,
                statusPernikahan: (bData.peserta as any).status_pernikahan || prev.statusPernikahan,
                namaOrangTua: (bData.peserta as any).nama_orang_tua || prev.namaOrangTua,
                noTeleponOrangTua: (bData.peserta as any).no_telepon_orang_tua || prev.noTeleponOrangTua,
                bookingId: bData.kode_akses || bData.id_booking || prev.bookingId,
                tanggal: bData.hasil?.tanggal_selesai
                  ? new Date(bData.hasil.tanggal_selesai).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : prev.tanggal,
              }));
            }

            let depScore: number | null = null;
            let anxScore: number | null = null;
            let strScore: number | null = null;

            let parsedDs: any = null;
            const ds = bData.hasil?.detail_skor;
            if (ds) {
              parsedDs = typeof ds === "string" ? JSON.parse(ds) : ds;
              if (parsedDs?.depression?.score !== undefined) depScore = parsedDs.depression.score;
              else if (parsedDs?.subscales?.depression?.skor !== undefined) depScore = parsedDs.subscales.depression.skor;

              if (parsedDs?.anxiety?.score !== undefined) anxScore = parsedDs.anxiety.score;
              else if (parsedDs?.subscales?.anxiety?.skor !== undefined) anxScore = parsedDs.subscales.anxiety.skor;

              if (parsedDs?.stress?.score !== undefined) strScore = parsedDs.stress.score;
              else if (parsedDs?.subscales?.stress?.skor !== undefined) strScore = parsedDs.subscales.stress.skor;
            }

            setBookingReport({
              totalSkor: typeof bData.hasil?.total_skor === "number" ? bData.hasil.total_skor : null,
              dep: depScore,
              anx: anxScore,
              str: strScore,
              detailSkor: parsedDs,
              dbInterpretasi: bData.hasil?.grade ? {
                grade: bData.hasil.grade,
                judul: bData.hasil.judul,
                deskripsi: bData.hasil.deskripsi,
                tips: bData.hasil.tips,
              } : null,
            });

            setIsLoadingDb(false);
            return;
          }
        } catch (bookingErr: any) {
          const apiStatus = bookingErr?.response?.status;
          const apiMsg = bookingErr?.response?.data?.message || bookingErr?.message;
          if (apiStatus === 403 || (apiMsg && (apiMsg.includes("berakhir") || apiMsg.includes("kedaluwarsa")))) {
            setErrorMessage(
              apiMsg ||
                "Akses laporan hasil asesmen memerlukan verifikasi tiket yang sah. Silakan masukkan kode tiket dan nomor WhatsApp di halaman detail tes."
            );
            setIsLoadingDb(false);
            return;
          }
          console.warn("Laporan via booking ID belum dapat dimuat, melanjutkan fallback paket:", bookingErr);
        }
      }

      // 2. Fallback: ambil metadata paket
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
  }, [params.testId, paramBookingId]);

  // Skor Prioritas: Murni dari Database (Anti-Tampering) > Fallback dari URL Query
  const rawSkor = searchParams.get("skor");
  const fallbackSkor = rawSkor !== null && rawSkor !== "" ? parseInt(rawSkor, 10) : null;
  const totalSkor = bookingReport?.totalSkor !== undefined && bookingReport?.totalSkor !== null
    ? bookingReport.totalSkor
    : fallbackSkor;

  // Dimensi DASS-42 (Depresi, Kecemasan, Stres)
  const rawDep = searchParams.get("dep");
  const rawAnx = searchParams.get("anx");
  const rawStr = searchParams.get("str");

  const effectiveDep = bookingReport?.dep !== undefined && bookingReport?.dep !== null
    ? bookingReport.dep
    : (rawDep !== null && rawDep !== "" ? parseInt(rawDep, 10) : null);

  const effectiveAnx = bookingReport?.anx !== undefined && bookingReport?.anx !== null
    ? bookingReport.anx
    : (rawAnx !== null && rawAnx !== "" ? parseInt(rawAnx, 10) : null);

  const effectiveStr = bookingReport?.str !== undefined && bookingReport?.str !== null
    ? bookingReport.str
    : (rawStr !== null && rawStr !== "" ? parseInt(rawStr, 10) : null);

  const isDASS = Boolean(
    dbPackage?.alat_ukur?.kode?.toUpperCase().includes("DASS") ||
    dbPackage?.judul?.toUpperCase().includes("DASS") ||
    dbPackage?.judul?.toLowerCase().includes("depresi, kecemasan") ||
    params.testId.toLowerCase().includes("dass")
  );

  const dassEvaluation = isDASS
    ? evaluateDASS(
        totalSkor,
        effectiveDep,
        effectiveAnx,
        effectiveStr
      )
    : null;

  const pbqProfile =
    bookingReport?.detailSkor?.tanpaSkorTotal &&
    Array.isArray(bookingReport?.detailSkor?.subscalesList) &&
    bookingReport.detailSkor.subscalesList.length > 0
      ? bookingReport.detailSkor
      : null;

  const isRCMAS = Boolean(
    dbPackage?.alat_ukur?.kode?.toUpperCase().includes("RCMAS") ||
    dbPackage?.judul?.toUpperCase().includes("RCMAS") ||
    params.testId.toLowerCase().includes("rcmas")
  );

  const isPHQ9 = Boolean(
    dbPackage?.alat_ukur?.kode?.toUpperCase().includes("PHQ") ||
    dbPackage?.judul?.toUpperCase().includes("PHQ") ||
    params.testId.toLowerCase().includes("phq")
  );

  const isCDI = Boolean(
    dbPackage?.alat_ukur?.kode?.toUpperCase().includes("CDI") ||
    dbPackage?.judul?.toUpperCase().includes("CDI") ||
    params.testId.toLowerCase().includes("cdi")
  );

  const isHarmDetected =
    (isPHQ9 || isCDI) && (Boolean(bookingReport?.detailSkor?.ideMelukaiDiri) || searchParams.get("harm") === "1");

  const rcmasSubscales = isRCMAS
    ? (() => {
        const sub = bookingReport?.detailSkor?.subscales;
        const readSubScore = (entry: any, paramKey: string): number | null => {
          if (typeof entry === "number") return entry;
          if (entry && typeof entry.skor === "number") return entry.skor;
          const q = searchParams.get(paramKey);
          return q !== null && q !== "" && !isNaN(Number(q)) ? Number(q) : null;
        };
        const phys = readSubScore(sub?.physiological, "phys");
        const worry = readSubScore(sub?.worry, "worry");
        const conc = readSubScore(sub?.concentration, "conc");
        if (phys === null && worry === null && conc === null) return null;
        return [
          {
            key: "physiological",
            label: "Physiological Anxiety",
            score: Number(phys ?? 0),
            max: 10,
            colorHex: "#561269",
            deskripsi: "Skor mentah dimensi keluhan fisiologis kecemasan (maks. 10 butir).",
          },
          {
            key: "worry",
            label: "Worry / Oversensitivity",
            score: Number(worry ?? 0),
            max: 11,
            colorHex: "#763E8B",
            deskripsi: "Skor mentah dimensi kekhawatiran & sensitivitas berlebih (maks. 11 butir).",
          },
          {
            key: "concentration",
            label: "Concentration Anxiety",
            score: Number(conc ?? 0),
            max: 7,
            colorHex: "#0e7490",
            deskripsi: "Skor mentah dimensi kecemasan konsentrasi (maks. 7 butir).",
          },
        ];
      })()
    : null;

  const cdiSubscales = isCDI
    ? (() => {
        const sub = bookingReport?.detailSkor?.subscales;
        const readSubScore = (entry: any, paramKey: string): number | null => {
          if (typeof entry === "number") return entry;
          if (entry && typeof entry.skor === "number") return entry.skor;
          const q = searchParams.get(paramKey);
          return q !== null && q !== "" && !isNaN(Number(q)) ? Number(q) : null;
        };
        const nm = readSubScore(sub?.negativeMood, "cdi_nm");
        const ip = readSubScore(sub?.interpersonalProblem, "cdi_ip");
        const ineff = readSubScore(sub?.ineffectiveness, "cdi_ineff");
        const anh = readSubScore(sub?.anhedonia, "cdi_anh");
        const nse = readSubScore(sub?.negativeSelfEsteem, "cdi_nse");
        if (nm === null && ip === null && ineff === null && anh === null && nse === null) return null;
        return [
          {
            key: "negativeMood",
            label: "Suasana Hati Negatif (Negative Mood)",
            score: Number(nm ?? 0),
            max: 12,
            colorHex: "#561269",
            deskripsi: "Skor mentah dimensi perasaan sedih, rasa bersalah, kekhawatiran, tangisan, dan kebimbangan (maks. 12).",
          },
          {
            key: "interpersonalProblem",
            label: "Masalah Antar Pribadi (Interpersonal Problems)",
            score: Number(ip ?? 0),
            max: 8,
            colorHex: "#763E8B",
            deskripsi: "Skor mentah dimensi kesulitan interaksi sosial, penarikan diri, dan konflik pergaulan (maks. 8).",
          },
          {
            key: "ineffectiveness",
            label: "Ketidakefektifan (Ineffectiveness)",
            score: Number(ineff ?? 0),
            max: 8,
            colorHex: "#0e7490",
            deskripsi: "Skor mentah dimensi perasaan gagal, penurunan motivasi sekolah, dan inkompetensi (maks. 8).",
          },
          {
            key: "anhedonia",
            label: "Anhedonia / Kesedihan (Anhedonia)",
            score: Number(anh ?? 0),
            max: 16,
            colorHex: "#c026d3",
            deskripsi: "Skor mentah dimensi kemurungan, gangguan tidur, kelelahan, nafsu makan, dan kesepian (maks. 16).",
          },
          {
            key: "negativeSelfEsteem",
            label: "Harga Diri Negatif (Negative Self-Esteem)",
            score: Number(nse ?? 0),
            max: 10,
            colorHex: "#e11d48",
            deskripsi: "Skor mentah dimensi kebencian pada diri, keraguan keputusan, keputusasaan, dan citra diri (maks. 10).",
          },
        ];
      })()
    : null;

  // ── Dynamic interpretation from database ──────────────────────────────────
  const dbInterpretasi = (() => {
    // Prioritaskan interpretasi resmi yang tercatat di hasil_tes booking
    if (bookingReport?.dbInterpretasi) {
      return bookingReport.dbInterpretasi;
    }

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

    if (pbqProfile) {
      return {
        prefix: "PBQ • PROFIL KEYAKINAN KEPRIBADIAN",
        value: "Profil Skor Mentah 9 Skala Kepribadian (PBQ)",
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

    // Jika tes PBQ (profil skor mentah 9 skala tanpa total gabungan & tanpa kategori interpretasi)
    if (pbqProfile) {
      return {
        deskripsi:
          pbqProfile.deskripsi ||
          "Skor mentah PBQ dihitung terpisah untuk masing-masing 9 skala (rentang 0–56 per skala) tanpa penjumlahan skor total gabungan. Interpretasi klinis dan Z-score normatif menunggu acuan resmi.",
        judulKekuatan: "Potensi atau Kekuatan Utama",
        judulBlindspots: "Area yang Perlu Dikembangkan",
        judulLingkungan: "Kondisi atau Lingkungan yang Mendukung",
        kekuatanUtama: [],
        blindspots: [],
        lingkunganOptimal: [],
        saranList: [],
      };
    }

    // Jika tes DASS-42 (menggunakan evaluasi klinis 3 dimensi)
    if (isDASS && dassEvaluation) {
      return {
        deskripsi: dassEvaluation.introText || dbPackage?.deskripsi || "Asesmen DASS-42 telah selesai dianalisis.",
        judulKekuatan: "Potensi atau Kekuatan Utama",
        judulBlindspots: "Area yang Perlu Dikembangkan",
        judulLingkungan: "Kondisi atau Lingkungan yang Mendukung",
        kekuatanUtama: [],
        blindspots: [],
        lingkunganOptimal: [],
        saranList: dassEvaluation.tips || [],
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
    try {
      const noDokumen = `EMP-PSI-${
        peserta.bookingId ? String(peserta.bookingId).slice(-6).toUpperCase() : "VERIFIED"
      }`;

      const pdfData: LaporanPsikotesPdfData = {
        noDokumen,
        judulTes: displayTestName,
        tanggalAsesmen: peserta.tanggal,
        masaBerlaku: "Masa Berlaku: 14 Hari (2 Minggu)",
        peserta: {
          nama: peserta.nama || "Peserta Asesmen Empathika",
          noHp: peserta.noHp || peserta.noTeleponOrangTua || null,
          usia: peserta.usia || null,
          jenisKelamin: peserta.jenisKelamin || null,
          kategori: peserta.kategori || null,
          tempatLahir: peserta.tempatLahir || null,
          tanggalLahir: peserta.tanggalLahir || null,
          pendidikan: peserta.pendidikan || null,
          pekerjaan: peserta.pekerjaan || null,
          statusPernikahan: peserta.statusPernikahan || null,
          namaOrangTua: peserta.namaOrangTua || null,
          noTeleponOrangTua: peserta.noTeleponOrangTua || null,
        },
        hasilUtama: {
          prefix: dynamicResult.prefix,
          judul: dynamicResult.value,
          totalSkor: pbqProfile ? null : totalSkor,
          deskripsi: isDASS && dassEvaluation ? dassEvaluation.introText : berbayarDetail.deskripsi,
        },
        subscales: dassEvaluation
          ? dassEvaluation.subscalesList.map((s) => ({
              name: s.name,
              score: s.score,
              maxScore: s.maxScore,
              percentage: s.percentage,
              grade: s.grade,
              deskripsi: s.deskripsi,
              colorHex: tailwindBarToHex(s.barColor),
            }))
          : pbqProfile
            ? pbqProfile.subscalesList.map((s: any) => {
                const score = Number(s.skor ?? 0);
                const maxScore = Number(s.max_skor ?? 56);
                return {
                  name: s.nama || s.key,
                  score,
                  maxScore,
                  percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
                  grade: `Butir ${s.rentangButir || ""}`.trim(),
                  deskripsi: "Skor mentah per skala (interpretasi & Z-score normatif menunggu acuan resmi).",
                  colorHex: "#561269",
                };
              })
            : rcmasSubscales
              ? rcmasSubscales.map((s) => ({
                  name: s.label,
                  score: s.score,
                  maxScore: s.max,
                  percentage: s.max > 0 ? Math.round((s.score / s.max) * 100) : 0,
                  grade: `${s.score} / ${s.max}`,
                  deskripsi: s.deskripsi,
                  colorHex: s.colorHex,
                }))
              : cdiSubscales
                ? cdiSubscales.map((s) => ({
                    name: s.label,
                    score: s.score,
                    maxScore: s.max,
                    percentage: s.max > 0 ? Math.round((s.score / s.max) * 100) : 0,
                    grade: `${s.score} / ${s.max}`,
                    deskripsi: s.deskripsi,
                    colorHex: s.colorHex,
                  }))
                : undefined,
        subscalesTitle: dassEvaluation
          ? "Profil 3 Dimensi: Depresi, Kecemasan, & Stres"
          : pbqProfile
            ? "Profil Skor Mentah 9 Skala Kepribadian (PBQ)"
            : rcmasSubscales
              ? "Profil Tiga Dimensi Kecemasan RCMAS"
              : cdiSubscales
                ? "Profil Lima Dimensi Depresi CDI"
                : undefined,
        subscalesMaxNote: dassEvaluation
          ? "Maks. 42 / dimensi"
          : pbqProfile
            ? "Maks. 56 / skala (tanpa skor total)"
            : rcmasSubscales
              ? "Skor mentah per dimensi (tanpa cutoff terpisah)"
              : cdiSubscales
                ? "Skor mentah per dimensi (cut-off klinis total >= 19)"
                : undefined,
        kekuatanUtama: berbayarDetail.kekuatanUtama,
        judulKekuatan: berbayarDetail.judulKekuatan,
        blindspots: berbayarDetail.blindspots,
        judulBlindspots: berbayarDetail.judulBlindspots,
        lingkunganOptimal: berbayarDetail.lingkunganOptimal,
        judulLingkungan: berbayarDetail.judulLingkungan,
        saranList: berbayarDetail.saranList.map((t: any) =>
          typeof t === "string" ? { title: "Rekomendasi", desc: t } : t
        ),
      };

      await downloadLaporanPsikotesPdf(pdfData);
    } catch (err) {
      console.error("[PDF Download Error]", err);
      window.print();
    } finally {
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

  // Layar Error / Masa Berlaku Berakhir (14 Hari)
  if (errorMessage) {
    const isExpired = errorMessage.toLowerCase().includes("berakhir") || errorMessage.toLowerCase().includes("kedaluwarsa");

    return (
      <div className="min-h-screen bg-[#FAFAFC] font-sans pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isExpired ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
            {isExpired ? <AlertTriangle className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isExpired ? "Masa Akses Hasil Berakhir" : "Gagal Memuat Laporan"}
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{errorMessage}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/psikotes/${params.testId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#561269] hover:bg-[#763E8B] text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Kembali ke Detail Tes
            </Link>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Empathika,%20saya%20butuh%20bantuan%20terkait%20akses%20arsip%20tiket%20psikotes%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-sm"
            >
              Hubungi Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  // DATA KRITIS: Kategori Interpretasi & Skoring
  // Jika kategori interpretasi belum dikonfigurasi di database untuk skor ini,
  // dan bukan instrumen DASS-42 (yang memiliki perhitungan evaluasi multidimensi khusus),
  // JANGAN gunakan fallback dummy (misal judul pura-pura "Tes Tingkat Kecemasan").
  if (!dbInterpretasi && !dassEvaluation && !pbqProfile) {
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
      {/* CSS Khusus Mode Cetak Browser (Ctrl+P) */}
      <style dangerouslySetInnerHTML={{ __html: `
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
            className="pb-4 mb-5 border-b-2 border-[#561269]"
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
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    Identitas Peserta Asesmen
                  </h3>
                  <p className="text-xs text-gray-500">
                    Data resmi peserta pengerjaan asesmen psikotes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#561269] border border-purple-200">
                  <Calendar className="w-3.5 h-3.5" />
                  Masa Berlaku: 14 Hari (2 Minggu)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Terverifikasi Resmi
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pdf-grid-4">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Nama Lengkap
                </span>
                <span className="font-extrabold text-sm text-gray-900 block truncate">
                  {peserta.nama || "Peserta Asesmen Empathika"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Kontak WhatsApp
                </span>
                <span className="font-bold text-sm text-emerald-700 block truncate">
                  {peserta.noHp || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Profil Peserta
                </span>
                <span className="font-bold text-sm text-gray-800 block truncate">
                  {[
                    peserta.usia ? `${peserta.usia} Thn` : null,
                    peserta.jenisKelamin || null,
                    peserta.kategori ? `(${peserta.kategori})` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ") || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Tanggal Asesmen
                </span>
                <span className="font-bold text-sm text-gray-800 block truncate">
                  {peserta.tanggal}
                </span>
              </div>
            </div>
          </div>

          {/* 1. Hasil Utama (Clean & Modern Card) */}
          <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-[#FAF8FB] rounded-xl border border-purple-200/70 p-6 sm:p-8 shadow-xs text-center border-l-4 border-l-[#561269]">
            {dynamicResult.prefix && (
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{dynamicResult.prefix}</p>
            )}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#561269] tracking-tight mb-2">
              {dynamicResult.value}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {isDASS && dassEvaluation ? dassEvaluation.introText : berbayarDetail.deskripsi}
            </p>
          </section>

          {/* 2. Grid Konten: Kolom Kiri (Analisis) & Kolom Kanan (Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Kolom Kiri: Analisis Lengkap */}
            <div id="laporan-kolom-kiri" className="lg:col-span-8 space-y-8 print:w-full print:col-span-12">
              
              {/* Profil 3 Dimensi DASS-42 (Depresi, Kecemasan, Stres) */}
              {dassEvaluation && (
                <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
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
                            style={{ width: `${sub.score > 0 ? Math.max(6, sub.percentage) : 0}%` }}
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

              {/* Profil 9 Skala Kepribadian PBQ (Tanpa Skor Total & Tanpa Kategori Interpretasi) */}
              {pbqProfile && (
                <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#561269]" />
                      Profil Skor Mentah 9 Skala Kepribadian (PBQ)
                    </h3>
                    <span className="text-xs font-semibold text-gray-400">Maks. 56 / skala (tanpa skor total)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {pbqProfile.subscalesList.map((sub: any) => {
                      const score = Number(sub.skor ?? 0);
                      const maxScore = Number(sub.max_skor ?? 56);
                      const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                      return (
                        <div key={sub.key} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="font-bold text-sm text-gray-900 block">{sub.nama}</span>
                              <span className="text-[11px] text-gray-500">Butir {sub.rentangButir}</span>
                            </div>
                            <span className="text-xs font-bold text-[#561269]">
                              {score} <span className="text-gray-400 font-normal">/ {maxScore}</span>
                            </span>
                          </div>

                          <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#561269] rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(score > 0 ? 4 : 0, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 leading-relaxed">
                    Catatan: Skor ditampilkan sebagai skor mentah per skala (rentang 0–56). Kategori interpretasi dan Z-score normatif belum ditampilkan sambil menunggu acuan resmi.
                  </p>
                </section>
              )}

              {/* Profil Tiga Dimensi Kecemasan RCMAS (tanpa Lie Scale & tanpa cutoff buatan) */}
              {rcmasSubscales && (
                <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#561269]" />
                      Profil Tiga Dimensi Kecemasan RCMAS
                    </h3>
                    <span className="text-xs font-semibold text-gray-400">Skor mentah per dimensi</span>
                  </div>

                  <div className="space-y-3.5">
                    {rcmasSubscales.map((sub) => {
                      const pct = sub.max > 0 ? Math.round((sub.score / sub.max) * 100) : 0;
                      return (
                        <div key={sub.key} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-gray-900">{sub.label}</span>
                            <span className="text-xs font-bold text-[#561269]">
                              {sub.score} <span className="text-gray-400 font-normal">/ {sub.max}</span>
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#561269] rounded-full transition-all duration-500"
                              style={{ width: `${sub.score > 0 ? Math.max(4, pct) : 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{sub.deskripsi}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Profil Lima Dimensi Depresi CDI */}
              {cdiSubscales && (
                <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#561269]" />
                      Profil Lima Dimensi Depresi CDI
                    </h3>
                    <span className="text-xs font-semibold text-gray-400">Skor mentah per dimensi (cut-off total ≥ 19)</span>
                  </div>

                  <div className="space-y-3.5">
                    {cdiSubscales.map((sub) => {
                      const pct = sub.max > 0 ? Math.round((sub.score / sub.max) * 100) : 0;
                      return (
                        <div key={sub.key} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-gray-900">{sub.label}</span>
                            <span className="text-xs font-bold text-[#561269]">
                              {sub.score} <span className="text-gray-400 font-normal">/ {sub.max}</span>
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#561269] rounded-full transition-all duration-500"
                              style={{ width: `${sub.score > 0 ? Math.max(4, pct) : 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{sub.deskripsi}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Safety & Crisis Hotline Card untuk PHQ-9 Butir 9 */}
              {isHarmDetected && <CrisisHotlineCard />}

              {/* Interpretasi Hasil & Implikasi Strategis */}
              <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#561269]" />
                    Interpretasi Hasil
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {berbayarDetail.deskripsi}
                  </p>
                </div>
              </section>

              {/* Analisis Karakteristik & Dinamika Diri */}
              {(berbayarDetail.kekuatanUtama.length > 0 || berbayarDetail.blindspots.length > 0) && (
                <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#561269]" />
                      Analisis Karakteristik &amp; Dinamika Diri
                    </h3>
                    <p className="text-xs text-gray-500">
                      Pemetaan potensi keunggulan serta area pengembangan diri untuk berkembang optimal:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pdf-grid-2">
                    {/* Potensi atau Kekuatan Utama */}
                    {berbayarDetail.kekuatanUtama.length > 0 && (
                      <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                            {berbayarDetail.judulKekuatan || "Potensi atau Kekuatan Utama"}
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
                    )}

                    {/* Area yang Perlu Dikembangkan */}
                    {berbayarDetail.blindspots.length > 0 && (
                      <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/70">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                            {berbayarDetail.judulBlindspots || "Area yang Perlu Dikembangkan"}
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
                    )}
                  </div>
                </section>
              )}

              {/* Kondisi atau Lingkungan yang Mendukung */}
              {berbayarDetail.lingkunganOptimal.length > 0 && (
                <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#561269]" />
                      {berbayarDetail.judulLingkungan || "Kondisi atau Lingkungan yang Mendukung"}
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
              )}

              {/* Tips & Langkah Pengembangan Diri */}
              {berbayarDetail.saranList.length > 0 && (
                <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
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
                    {berbayarDetail.saranList.map((tip: any, index: number) => (
                      <div key={index} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-[#561269]" />
                        </div>
                        <div>
                          {typeof tip === "string" ? (
                            <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
                          ) : (
                            <>
                              {tip.title && <h4 className="text-sm font-bold text-gray-900">{tip.title}</h4>}
                              {tip.desc && <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">{tip.desc}</p>}
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
            className="pt-4 border-t border-dashed border-gray-300 mt-6 bg-white"
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
