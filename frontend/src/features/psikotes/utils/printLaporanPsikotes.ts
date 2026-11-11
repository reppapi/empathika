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
    paketLower.includes("depresi, kecemasan") ||
    paketLower.includes("stres");

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
  }

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
      totalSkor: peserta.totalSkor ?? null,
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
