/** Halaman laporan resmi hasil psikotes berbayar lengkap dengan fitur unduh PDF dan cetak browser. */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Download, 
  ShieldCheck,
  AlertTriangle,
  Loader2,
  WifiOff,
} from "lucide-react";
import { calculateReviewSla } from "@/features/psikotes/utils/reviewSla";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { evaluateDASS } from "@/features/psikotes/utils/dassEvaluation";
import {
  isCATS as checkCATS,
  isCDI as checkCDI,
  isDASS as checkDASS,
  isRCMAS as checkRCMAS,
  isMCMI as checkMCMI,
} from "@/features/psikotes/utils/instrumentDetector";
import {
  downloadLaporanPsikotesPdf,
  tailwindBarToHex,
  type LaporanPsikotesPdfData,
} from "@/features/psikotes/utils/downloadLaporanPsikotesPdf";
import { useAdminContact } from "@/hooks/useAdminContact";
import PsikotesRekomendasiSection from "./PsikotesRekomendasiSection";
import HasilMenungguReviewView from "./components/HasilMenungguReviewView";
import HasilLaporanTerbitView from "./components/HasilLaporanTerbitView";
import HasilAnalisisScorecardView from "./components/HasilAnalisisScorecardView";
export default function PsikotesHasilBerbayarClient({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getWhatsAppUrl } = useAdminContact();
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
    const rawBookingId =
      searchParams.get("bookingId") ||
      searchParams.get("orderId") ||
      searchParams.get("kode") ||
      searchParams.get("ticket") ||
      searchParams.get("kode_akses") ||
      "";
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
    statusPengerjaan?: string | null;
    catatanPsikolog?: string | null;
    rekomendasiPsikolog?: string | null;
    psikolog?: { id?: number; nama?: string; gelar?: string; nama_gelar?: string } | null;
    tanggalReview?: string | null;
    tanggalSelesai?: string | null;
  } | null>(null);

  const paramBookingId =
    searchParams.get("bookingId") ||
    searchParams.get("orderId") ||
    searchParams.get("kode") ||
    searchParams.get("ticket") ||
    searchParams.get("kode_akses");
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
              } : null,
              statusPengerjaan: (bData as any).status_pengerjaan || null,
              catatanPsikolog: bData.hasil?.catatan_psikolog || (bData as any).catatan_psikolog || null,
              rekomendasiPsikolog: bData.hasil?.rekomendasi_psikolog || (bData as any).rekomendasi_psikolog || null,
              psikolog: bData.psikolog || (bData as any).psikolog || null,
              tanggalReview: bData.hasil?.tanggal_review || (bData as any).tanggal_review || null,
              tanggalSelesai: bData.hasil?.tanggal_selesai || (bData as any).tanggal_mulai || null,
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

  const isDASS = checkDASS(dbPackage, params.testId);

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

  const isRCMAS = checkRCMAS(dbPackage, params.testId);
  const isCDI = checkCDI(dbPackage, params.testId);
  const isCATS = checkCATS(dbPackage, params.testId);
  const isMCMI = checkMCMI(dbPackage, params.testId);

  // Status Menunggu Review Psikolog (SLA Maks. 3 Hari)
  // Menahan tampilan hasil analitik mentah/grafik klinis sebelum verifikasi psikolog diterbitkan
  const isKlinisPerluReview = Boolean((dbPackage as any)?.perlu_review_psikolog) || isMCMI;
  const isMenungguReview =
    bookingReport?.statusPengerjaan === "MENUNGGU_REVIEW" ||
    (isKlinisPerluReview &&
      bookingReport?.statusPengerjaan !== "SELESAI" &&
      !bookingReport?.catatanPsikolog);

  // Status ketersediaan dokumen telaah klinis resmi yang sudah dibuat dan diterbitkan oleh psikolog
  const hasCatatanPsikolog = Boolean(
    bookingReport?.catatanPsikolog && bookingReport.catatanPsikolog.trim().length > 0
  );

  // Informasi SLA batas waktu telaah psikolog (maksimal 3 hari kerja)
  const slaInfo = calculateReviewSla(bookingReport?.tanggalSelesai || peserta.tanggal);

  const mcmiResult =
    (isMCMI || bookingReport?.detailSkor?.validitas) &&
    Array.isArray(bookingReport?.detailSkor?.polaKepribadianList)
      ? bookingReport.detailSkor
      : null;

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

  const catsSubscales = isCATS
    ? (() => {
        const sub = bookingReport?.detailSkor?.subscales;
        const readSubScore = (entry: any, paramKey: string): number | null => {
          if (typeof entry === "number") return entry;
          if (entry && typeof entry.skor === "number") return entry.skor;
          const q = searchParams.get(paramKey);
          return q !== null && q !== "" && !isNaN(Number(q)) ? Number(q) : null;
        };
        const intr = readSubScore(sub?.intrusion, "cats_b");
        const avoid = readSubScore(sub?.avoidance, "cats_c");
        const cog = readSubScore(sub?.cognitionMood, "cats_d");
        const arsl = readSubScore(sub?.arousal, "cats_e");
        if (intr === null && avoid === null && cog === null && arsl === null) return null;
        return [
          {
            key: "intrusion",
            label: "Kriteria B: Intrusi / Gangguan (Intrusion)",
            score: Number(intr ?? 0),
            max: 15,
            colorHex: "#561269",
            deskripsi: "Pikiran mengganggu berulang, mimpi buruk, kilas balik, serta distres emosional & fisik saat teringat trauma.",
          },
          {
            key: "avoidance",
            label: "Kriteria C: Penghindaran (Avoidance)",
            score: Number(avoid ?? 0),
            max: 6,
            colorHex: "#763E8B",
            deskripsi: "Upaya aktif menghindari ingatan, perasaan, tempat, aktivitas, atau orang yang memicu ingatan traumatis.",
          },
          {
            key: "cognitionMood",
            label: "Kriteria D: Kognisi & Suasana Hati Negatif",
            score: Number(cog ?? 0),
            max: 21,
            colorHex: "#0e7490",
            deskripsi: "Keyakinan negatif diri/dunia, menyalahkan diri, emosi negatif menetap, anhedonia, dan merasa terasing.",
          },
          {
            key: "arousal",
            label: "Kriteria E: Hyperarousal & Reaktivitas",
            score: Number(arsl ?? 0),
            max: 18,
            colorHex: "#c026d3",
            deskripsi: "Iritabilitas/luapan amarah, perilaku berisiko, hiperkewaspadaan, respon terkejut, konsentrasi, dan tidur.",
          },
        ];
      })()
    : null;

  const catsFungsi = isCATS ? bookingReport?.detailSkor?.fungsiPsikososial : null;

  const genericSubscales = rcmasSubscales
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
      : catsSubscales
        ? catsSubscales.map((s) => ({
            name: s.label,
            score: s.score,
            maxScore: s.max,
            percentage: s.max > 0 ? Math.round((s.score / s.max) * 100) : 0,
            grade: `${s.score} / ${s.max}`,
            deskripsi: s.deskripsi,
            colorHex: s.colorHex,
          }))
        : undefined;

  const genericSubscalesTitle = rcmasSubscales
    ? "Profil Tiga Dimensi Kecemasan RCMAS"
    : cdiSubscales
      ? "Profil Lima Dimensi Depresi CDI"
      : catsSubscales
        ? "Profil Empat Klaster Gejala PTSD (DSM-5)"
        : undefined;

  const genericSubscalesMaxNote = rcmasSubscales
    ? "Skor mentah per dimensi (tanpa cutoff terpisah)"
    : cdiSubscales
      ? "Skor mentah per dimensi (cut-off klinis total >= 19)"
      : catsSubscales
        ? "Skor mentah per klaster (cut-off klinis total >= 21)"
        : undefined;


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

    if (mcmiResult) {
      const isValid = mcmiResult.validitas?.isValid ?? true;
      return {
        prefix: "MCMI-IV • LAPORAN MULTIAXIAL",
        value: isValid ? "Laporan Spektrum Kepribadian & Sindroma Klinis" : "Hasil Asesmen MCMI-IV Tidak Valid",
        color: isValid ? "text-[#561269]" : "text-red-700",
        bgColor: isValid ? "bg-purple-50" : "bg-red-50",
        borderColor: isValid ? "border-purple-200" : "border-red-200"
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
    // Khusus instrumen MCMI-IV: Hasil bersifat klinis komprehensif dan FULL DARI PSIKOLOG.
    // Tidak menggunakan template teks otomatis (tanpa deskripsi template, tanpa kekuatan, blindspots, lingkungan, dan tips generic).
    if (isMCMI) {
      return {
        deskripsi: "",
        kekuatanUtama: [],
        judulKekuatan: "",
        blindspots: [],
        judulBlindspots: "",
        lingkunganOptimal: [],
        judulLingkungan: "",
        saranList: [],
      };
    }

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
        deskripsi: dbInterpretasi.deskripsi || dbPackage?.tentang_tes || "Asesmen psikotes telah berhasil diselesaikan.",
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

    if (mcmiResult) {
      const mcmiCatatan: string[] = Array.isArray(mcmiResult.catatanKlinis)
        ? (mcmiResult.catatanKlinis as string[])
        : [];
      const mcmiBlindspots: string[] = Array.isArray(mcmiResult.sindromaKlinisList)
        ? mcmiResult.sindromaKlinisList
            .filter((s: any) => (s?.brScore ?? 0) >= 75)
            .map((s: any) => `${s.nama}: ${s.deskripsi}`)
        : [];

      return {
        deskripsi:
          mcmiResult.laporanNaratif?.polaKepribadian ||
          mcmiResult.deskripsi ||
          "Evaluasi komprehensif profil multiaxial MCMI-IV mencakup 15 spektrum kepribadian dan 10 sindroma klinis.",
        judulKekuatan: "Catatan Validitas & Keterandalan Tes",
        judulBlindspots: "Sindroma Klinis Terindikasi",
        judulLingkungan: "Rekomendasi & Tindak Lanjut Klinis",
        kekuatanUtama: mcmiCatatan,
        blindspots: mcmiBlindspots,
        lingkunganOptimal: [
          "Laporan ini bersifat rahasia untuk penggunaan profesional psikologis/psikiatris.",
          "Disarankan melakukan asesmen kolaboratif bersama psikolog atau psikiater guna menyusun rencana intervensi/psikoterapi yang tepat."
        ],
        saranList: [],
      };
    }

    // Jika tes DASS-42 (menggunakan evaluasi klinis 3 dimensi)
    if (isDASS && dassEvaluation) {
      return {
        deskripsi: dassEvaluation.introText || dbPackage?.tentang_tes || "Asesmen DASS-42 telah selesai dianalisis.",
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
      deskripsi: dbPackage?.tentang_tes || "Hasil asesmen psikotes telah selesai dianalisis.",
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
    if (isDownloading || isMenungguReview) return;
    setIsDownloading(true);
    try {
      const noDokumen = `EMP-PSI-${
        peserta.bookingId ? String(peserta.bookingId).slice(-6).toUpperCase() : "VERIFIED"
      }`;

      const pdfData: LaporanPsikotesPdfData = {
        noDokumen,
        judulTes: displayTestName,
        tanggalAsesmen: peserta.tanggal,
        masaBerlaku: "Masa Berlaku: 3 Bulan",
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
        catatanPsikolog: bookingReport?.catatanPsikolog || null,
        rekomendasiPsikolog: bookingReport?.rekomendasiPsikolog || null,
        namaPsikolog: bookingReport?.psikolog?.nama_gelar || "Psikolog Klinis Empathika",
        tanggalReview: bookingReport?.tanggalReview
          ? new Date(bookingReport.tanggalReview).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : null,
        hasilUtama: {
          prefix: dynamicResult.prefix,
          judul: dynamicResult.value,
          totalSkor: pbqProfile || isMCMI ? null : totalSkor,
          deskripsi:
            isDASS && dassEvaluation
              ? dassEvaluation.introText
              : isMCMI
              ? "Laporan resmi evaluasi klinis multiaxial kepribadian. Seluruh telaah dinamika, indikator psikologis, dan rekomendasi disusun secara personal oleh Psikolog Empathika."
              : berbayarDetail.deskripsi,
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
                : catsSubscales
                  ? catsSubscales.map((s) => ({
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
                : catsSubscales
                  ? "Profil Empat Klaster Gejala PTSD (DSM-5)"
                  : undefined,
        subscalesMaxNote: dassEvaluation
          ? "Maks. 42 / dimensi"
          : pbqProfile
            ? "Maks. 56 / skala (tanpa skor total)"
            : rcmasSubscales
              ? "Skor mentah per dimensi (tanpa cutoff terpisah)"
              : cdiSubscales
                ? "Skor mentah per dimensi (cut-off klinis total >= 19)"
                : catsSubscales
                  ? "Skor mentah per klaster (cut-off klinis total >= 21)"
                  : undefined,
        kekuatanUtama: isMCMI ? undefined : berbayarDetail.kekuatanUtama,
        judulKekuatan: isMCMI ? undefined : berbayarDetail.judulKekuatan,
        blindspots: isMCMI ? undefined : berbayarDetail.blindspots,
        judulBlindspots: isMCMI ? undefined : berbayarDetail.judulBlindspots,
        lingkunganOptimal: isMCMI ? undefined : berbayarDetail.lingkunganOptimal,
        judulLingkungan: isMCMI ? undefined : berbayarDetail.judulLingkungan,
        saranList: isMCMI
          ? undefined
          : berbayarDetail.saranList.map((t: any) =>
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

  // Layar Error / Masa Berlaku Berakhir (3 Bulan)
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
              href={getWhatsAppUrl("Halo Admin Empathika, saya butuh bantuan terkait akses arsip tiket psikotes saya")}
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
  if (!isMenungguReview && !dbInterpretasi && !dassEvaluation && !pbqProfile && !mcmiResult && !bookingReport?.catatanPsikolog) {
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
          .a4-sheet-canvas {
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .a4-print-sheet {
            box-shadow: none !important;
            border: none !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            padding: 0 !important;
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
        
        {/* Header Bersih & Profesional (Hanya tampil saat laporan analitik non-telaah psikolog) */}
        {!isMenungguReview && !(hasCatatanPsikolog || isKlinisPerluReview) && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-[#561269] border border-purple-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {hasCatatanPsikolog ? "Dokumen Resmi Terverifikasi" : "Laporan Analisis Resmi"}
                </span>
                {peserta.bookingId && (
                  <>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-semibold text-gray-500">
                      No. Tiket: <strong className="text-gray-800 font-mono">{peserta.bookingId}</strong>
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                {hasCatatanPsikolog ? "Laporan Hasil Pemeriksaan Psikologis" : displayTestName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
                {hasCatatanPsikolog
                  ? `Surat Keterangan & Telaah Klinis Resmi alat ukur ${displayTestName}. Disusun dan disahkan oleh Psikolog Empathika.`
                  : "Evaluasi mendalam profil personal, gaya komunikasi, serta panduan pengembangan potensi dirimu."}
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
                    <span>Mengunduh Dokumen...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Unduh Dokumen Lengkap (PDF)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ══ KONTEN UTAMA LAPORAN BERBAYAR (TAMPILAN WEB & PDF) ══ */}
        <div id="laporan-berbayar-container" className="space-y-6">

          {/* Percabangan Tampilan: Menunggu Review vs Dokumen Telaah Psikolog A4 vs Fallback Scorecard */}
          {/* Percabangan Tampilan: Menunggu Review vs Laporan Terbit vs Fallback Scorecard */}
          {isMenungguReview ? (
            <HasilMenungguReviewView
              displayTestName={displayTestName}
              peserta={peserta}
              slaInfo={slaInfo}
              getWhatsAppUrl={getWhatsAppUrl}
            />
          ) : (hasCatatanPsikolog || isKlinisPerluReview) ? (
            <HasilLaporanTerbitView
              displayTestName={displayTestName}
              peserta={peserta}
              bookingReport={bookingReport}
              isDownloading={isDownloading}
              onDownloadPdf={handleDownloadPdf}
              getWhatsAppUrl={getWhatsAppUrl}
            />
          ) : (
            <HasilAnalisisScorecardView
              displayTestName={displayTestName}
              peserta={peserta}
              dynamicResult={dynamicResult}
              isDASS={isDASS}
              isMCMI={isMCMI}
              dassEvaluation={dassEvaluation}
              pbqProfile={pbqProfile}
              mcmiResult={mcmiResult}
              berbayarDetail={berbayarDetail}
              subscales={genericSubscales}
              subscalesTitle={genericSubscalesTitle}
              subscalesMaxNote={genericSubscalesMaxNote}
              isDownloading={isDownloading}
              onDownloadPdf={handleDownloadPdf}
              getWhatsAppUrl={getWhatsAppUrl}
            />
          )}
        </div>

        {/* Rekomendasi Tes Dinamis dari Database (TIDAK MASUK KE PRINT) */}
        {!isMenungguReview && (
          <PsikotesRekomendasiSection currentTestId={params.testId} />
        )}

      </div>
    </div>
  );
}
