/** Utility penyusun data laporan peserta admin sebelum diunduh menjadi PDF melalui downloadLaporanPsikotesPdf. */
import type { AdminPsikotesPeserta, JudulPsikotesItem } from "../types/adminPsikotes";
import { getPesertaReportDetail } from "./adminPsikotesMapper";
import { evaluateDASS } from "./dassEvaluation";
import {
  downloadLaporanPsikotesPdf,
  tailwindBarToHex,
  type LaporanPsikotesPdfData,
  type LaporanPsikotesSubscale,
} from "./downloadLaporanPsikotesPdf";

/**
 * Mencetak/mengunduh dokumen PDF resmi hasil asesmen psikotes peserta (1:1 template resmi Empathika).
 */
export async function printLaporanPsikotes(
  peserta: AdminPsikotesPeserta,
  judulList: JudulPsikotesItem[] = []
) {
  const detail = getPesertaReportDetail(peserta, judulList);
  const paketLower = (peserta.paket || "").toLowerCase();
  const isDASS =
    paketLower.includes("dass") ||
    paketLower.includes("depresi, kecemasan");

  let subscales: LaporanPsikotesSubscale[] | undefined = undefined;
  let subscalesTitle: string | undefined = undefined;
  let subscalesMaxNote: string | undefined = undefined;
  let heroPrefix: string | null = null;
  let heroTitle = detail.judul || detail.grade || "Profil Asesmen";
  let heroDesc = detail.deskripsi;
  let tipsList = detail.tips;

  const dsRaw = peserta.hasil?.detail_skor;
  let parsedDs: any = null;
  if (dsRaw) {
    try {
      parsedDs = typeof dsRaw === "string" ? JSON.parse(dsRaw) : dsRaw;
    } catch {}
  }

  if (isDASS) {
    const dep = parsedDs?.depression?.score ?? parsedDs?.subscales?.depression?.skor ?? null;
    const anx = parsedDs?.anxiety?.score ?? parsedDs?.subscales?.anxiety?.skor ?? null;
    const str = parsedDs?.stress?.score ?? parsedDs?.subscales?.stress?.skor ?? null;
    const dassEval = evaluateDASS(peserta.totalSkor ?? null, dep, anx, str);
    if (dassEval) {
      heroPrefix = "DASS-42 • SKRINING KESEHATAN EMOSIONAL";
      heroTitle = "Profil Kesehatan Emosional";
      heroDesc = dassEval.introText || detail.deskripsi;
      subscalesTitle = "Profil 3 Dimensi: Depresi, Kecemasan, & Stres";
      subscalesMaxNote = "Maks. 42 / dimensi";
      subscales = dassEval.subscalesList.map((s) => ({
        name: s.name,
        score: s.score,
        maxScore: s.maxScore,
        percentage: s.percentage,
        grade: s.grade,
        deskripsi: s.deskripsi,
        colorHex: tailwindBarToHex(s.barColor),
      }));
      if (dassEval.tips?.length && (!tipsList || tipsList.length === 0)) {
        tipsList = dassEval.tips;
      }
    }
  } else if (parsedDs?.tanpaSkorTotal && Array.isArray(parsedDs?.subscalesList)) {
    heroPrefix = "PBQ • PROFIL KEYAKINAN KEPRIBADIAN";
    heroTitle = "Profil Skor Mentah 9 Skala Kepribadian (PBQ)";
    heroDesc =
      parsedDs.deskripsi ||
      "Skor mentah PBQ dihitung terpisah untuk masing-masing 9 skala (rentang 0–56 per skala) tanpa penjumlahan skor total gabungan. Interpretasi klinis dan Z-score normatif menunggu acuan resmi.";
    subscalesTitle = "Profil Skor Mentah 9 Skala Kepribadian (PBQ)";
    subscalesMaxNote = "Maks. 56 / skala (tanpa skor total)";
    subscales = parsedDs.subscalesList.map((s: any) => {
      const score = Number(s.skor ?? 0);
      const maxScore = Number(s.max_skor ?? 56);
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      return {
        name: s.nama || s.key,
        score,
        maxScore,
        percentage,
        grade: `Butir ${s.rentangButir || ""}`.trim(),
        deskripsi: "Skor mentah per skala (interpretasi & Z-score normatif menunggu acuan resmi).",
        colorHex: "#561269",
      };
    });
  } else if (
    paketLower.includes("rcmas") ||
    (parsedDs?.subscales &&
      parsedDs.subscales.physiological !== undefined &&
      parsedDs.subscales.worry !== undefined &&
      parsedDs.subscales.concentration !== undefined)
  ) {
    const sub = parsedDs?.subscales || {};
    const phys = Number(typeof sub.physiological === "number" ? sub.physiological : sub.physiological?.skor ?? 0);
    const worry = Number(typeof sub.worry === "number" ? sub.worry : sub.worry?.skor ?? 0);
    const conc = Number(typeof sub.concentration === "number" ? sub.concentration : sub.concentration?.skor ?? 0);
    subscalesTitle = "Profil Tiga Dimensi Kecemasan RCMAS";
    subscalesMaxNote = "Skor mentah per dimensi (tanpa cutoff terpisah)";
    subscales = [
      {
        name: "Physiological Anxiety",
        score: phys,
        maxScore: 10,
        percentage: Math.round((phys / 10) * 100),
        grade: `${phys} / 10`,
        deskripsi: "Skor mentah dimensi keluhan fisiologis kecemasan (maks. 10 butir).",
        colorHex: "#561269",
      },
      {
        name: "Worry / Oversensitivity",
        score: worry,
        maxScore: 11,
        percentage: Math.round((worry / 11) * 100),
        grade: `${worry} / 11`,
        deskripsi: "Skor mentah dimensi kekhawatiran & sensitivitas berlebih (maks. 11 butir).",
        colorHex: "#763E8B",
      },
      {
        name: "Concentration Anxiety",
        score: conc,
        maxScore: 7,
        percentage: Math.round((conc / 7) * 100),
        grade: `${conc} / 7`,
        deskripsi: "Skor mentah dimensi kecemasan konsentrasi (maks. 7 butir).",
        colorHex: "#0e7490",
      },
    ];
  }

  const isWithoutTotal = Boolean(parsedDs?.tanpaSkorTotal);

  const pProfile = peserta.peserta;
  const noDokumen = `EMP-PSI-${
    peserta.id ? String(peserta.id).slice(-6).toUpperCase() : "VERIFIED"
  }`;

  const pdfData: LaporanPsikotesPdfData = {
    noDokumen,
    judulTes: peserta.paket || "Laporan Hasil Psikotes",
    tanggalAsesmen: peserta.tanggal || "-",
    masaBerlaku: "Masa Berlaku: 14 Hari (2 Minggu)",
    peserta: {
      nama: pProfile?.nama_lengkap || peserta.nama || "Peserta Asesmen Empathika",
      noHp: peserta.noHp || pProfile?.no_telepon_orang_tua || null,
      usia: pProfile?.usia ?? peserta.usia ?? null,
      jenisKelamin: pProfile?.jenis_kelamin || peserta.jenisKelamin || null,
      kategori: pProfile?.kategori_peserta || null,
      tempatLahir: pProfile?.tempat_lahir || null,
      tanggalLahir: pProfile?.tanggal_lahir || null,
      pendidikan: pProfile?.pendidikan || null,
      pekerjaan: pProfile?.pekerjaan || null,
      statusPernikahan: pProfile?.status_pernikahan || null,
      namaOrangTua: pProfile?.nama_orang_tua || null,
      noTeleponOrangTua: pProfile?.no_telepon_orang_tua || null,
    },
    hasilUtama: {
      prefix: heroPrefix,
      judul: heroTitle,
      totalSkor: isWithoutTotal ? null : (peserta.totalSkor ?? null),
      deskripsi: heroDesc,
    },
    subscales,
    subscalesTitle,
    subscalesMaxNote,
    kekuatanUtama: detail.kekuatanUtama,
    judulKekuatan: detail.judulKekuatan,
    blindspots: detail.blindspots,
    judulBlindspots: detail.judulBlindspots,
    lingkunganOptimal: detail.lingkunganOptimal,
    judulLingkungan: detail.judulLingkungan,
    saranList: tipsList,
  };

  await downloadLaporanPsikotesPdf(pdfData);
}
