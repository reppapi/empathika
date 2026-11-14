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
  } else if (
    paketLower.includes("cdi") ||
    (parsedDs?.subscales &&
      parsedDs.subscales.negativeMood !== undefined &&
      parsedDs.subscales.anhedonia !== undefined)
  ) {
    const sub = parsedDs?.subscales || {};
    const nm = Number(typeof sub.negativeMood === "number" ? sub.negativeMood : sub.negativeMood?.skor ?? 0);
    const ip = Number(typeof sub.interpersonalProblem === "number" ? sub.interpersonalProblem : sub.interpersonalProblem?.skor ?? 0);
    const ineff = Number(typeof sub.ineffectiveness === "number" ? sub.ineffectiveness : sub.ineffectiveness?.skor ?? 0);
    const anh = Number(typeof sub.anhedonia === "number" ? sub.anhedonia : sub.anhedonia?.skor ?? 0);
    const nse = Number(typeof sub.negativeSelfEsteem === "number" ? sub.negativeSelfEsteem : sub.negativeSelfEsteem?.skor ?? 0);
    subscalesTitle = "Profil Lima Dimensi Depresi CDI";
    subscalesMaxNote = "Skor mentah per dimensi (cut-off klinis total >= 19)";
    subscales = [
      {
        name: "Suasana Hati Negatif (Negative Mood)",
        score: nm,
        maxScore: 12,
        percentage: Math.round((nm / 12) * 100),
        grade: `${nm} / 12`,
        deskripsi: "Skor mentah dimensi perasaan sedih, rasa bersalah, kekhawatiran, tangisan, dan kebimbangan (maks. 12).",
        colorHex: "#561269",
      },
      {
        name: "Masalah Antar Pribadi (Interpersonal Problems)",
        score: ip,
        maxScore: 8,
        percentage: Math.round((ip / 8) * 100),
        grade: `${ip} / 8`,
        deskripsi: "Skor mentah dimensi kesulitan interaksi sosial, penarikan diri, dan konflik pergaulan (maks. 8).",
        colorHex: "#763E8B",
      },
      {
        name: "Ketidakefektifan (Ineffectiveness)",
        score: ineff,
        maxScore: 8,
        percentage: Math.round((ineff / 8) * 100),
        grade: `${ineff} / 8`,
        deskripsi: "Skor mentah dimensi perasaan gagal, penurunan motivasi sekolah, dan inkompetensi (maks. 8).",
        colorHex: "#0e7490",
      },
      {
        name: "Anhedonia / Kesedihan (Anhedonia)",
        score: anh,
        maxScore: 16,
        percentage: Math.round((anh / 16) * 100),
        grade: `${anh} / 16`,
        deskripsi: "Skor mentah dimensi kemurungan, gangguan tidur, kelelahan, nafsu makan, dan kesepian (maks. 16).",
        colorHex: "#c026d3",
      },
      {
        name: "Harga Diri Negatif (Negative Self-Esteem)",
        score: nse,
        maxScore: 10,
        percentage: Math.round((nse / 10) * 100),
        grade: `${nse} / 10`,
        deskripsi: "Skor mentah dimensi kebencian pada diri, keraguan keputusan, keputusasaan, dan citra diri (maks. 10).",
        colorHex: "#e11d48",
      },
    ];
  } else if (
    paketLower.includes("cats") ||
    (parsedDs?.subscales &&
      (parsedDs.subscales.intrusion !== undefined ||
        parsedDs.subscales.avoidance !== undefined))
  ) {
    const sub = parsedDs?.subscales || {};
    const intr = Number(typeof sub.intrusion === "number" ? sub.intrusion : sub.intrusion?.skor ?? 0);
    const avoid = Number(typeof sub.avoidance === "number" ? sub.avoidance : sub.avoidance?.skor ?? 0);
    const cog = Number(typeof sub.cognitionMood === "number" ? sub.cognitionMood : sub.cognitionMood?.skor ?? 0);
    const arsl = Number(typeof sub.arousal === "number" ? sub.arousal : sub.arousal?.skor ?? 0);
    subscalesTitle = "Profil Empat Klaster Gejala PTSD (DSM-5)";
    subscalesMaxNote = "Skor mentah per klaster (cut-off klinis total >= 21)";
    subscales = [
      {
        name: "Kriteria B: Intrusi / Gangguan (Intrusion)",
        score: intr,
        maxScore: 15,
        percentage: Math.round((intr / 15) * 100),
        grade: `${intr} / 15`,
        deskripsi: "Pikiran mengganggu berulang, mimpi buruk, kilas balik, serta distres emosional & fisik saat teringat trauma.",
        colorHex: "#561269",
      },
      {
        name: "Kriteria C: Penghindaran (Avoidance)",
        score: avoid,
        maxScore: 6,
        percentage: Math.round((avoid / 6) * 100),
        grade: `${avoid} / 6`,
        deskripsi: "Upaya aktif menghindari ingatan, perasaan, tempat, aktivitas, atau orang yang memicu ingatan traumatis.",
        colorHex: "#763E8B",
      },
      {
        name: "Kriteria D: Kognisi & Suasana Hati Negatif",
        score: cog,
        maxScore: 21,
        percentage: Math.round((cog / 21) * 100),
        grade: `${cog} / 21`,
        deskripsi: "Keyakinan negatif diri/dunia, menyalahkan diri, emosi negatif menetap, anhedonia, dan merasa terasing.",
        colorHex: "#0e7490",
      },
      {
        name: "Kriteria E: Hyperarousal & Reaktivitas",
        score: arsl,
        maxScore: 18,
        percentage: Math.round((arsl / 18) * 100),
        grade: `${arsl} / 18`,
        deskripsi: "Iritabilitas/luapan amarah, perilaku berisiko, hiperkewaspadaan, respon terkejut, konsentrasi, dan tidur.",
        colorHex: "#c026d3",
      },
    ];

    if (parsedDs?.pte?.totalDialami !== undefined) {
      const pteNote = `Kriteria A (Paparan Trauma): Dilaporkan ${parsedDs.pte.totalDialami} peristiwa berpotensi traumatis.${
        parsedDs.pte.peristiwaPalingMengganggu ? ` Peristiwa paling mengganggu: "${parsedDs.pte.peristiwaPalingMengganggu}".` : ""
      }`;
      if (!detail.kekuatanUtama.includes(pteNote)) {
        detail.kekuatanUtama = [pteNote, ...detail.kekuatanUtama];
        detail.judulKekuatan = "Paparan Peristiwa Traumatis (Kriteria A)";
      }
    }

    if (parsedDs?.fungsiPsikososial?.totalTerganggu !== undefined) {
      const fungsiNote = `Dampak terhadap Fungsi Psikososial: Terdeteksi kendala pada ${parsedDs.fungsiPsikososial.totalTerganggu} dari 5 area kehidupan (pergaulan, hobi, sekolah, keluarga, kebahagiaan).`;
      if (!detail.blindspots.includes(fungsiNote)) {
        detail.blindspots = [fungsiNote, ...detail.blindspots];
        detail.judulBlindspots = "Dampak terhadap Fungsi Kehidupan Sehari-hari";
      }
    }
  }

  const isWithoutTotal = Boolean(parsedDs?.tanpaSkorTotal);

  // Jika terindikasi ide melukai diri / bunuh diri (misal Butir 9 CDI atau PHQ-9 > 0), sematkan catatan keselamatan prioritas pada PDF
  if (parsedDs?.ideMelukaiDiri) {
    const safetyNote =
      "PERHATIAN KHUSUS KESELAMATAN: Terindikasi adanya pikiran menyakiti diri sendiri / mengakhiri hidup (Butir 9 > 0). Diperlukan asesmen keselamatan mendalam dan konsultasi segera bersama orang tua/wali serta profesional kesehatan mental.";
    if (!detail.blindspots.includes(safetyNote)) {
      detail.blindspots = [safetyNote, ...detail.blindspots];
      detail.judulBlindspots = "Perhatian Khusus & Area Kritis";
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
    masaBerlaku: "Masa Berlaku: Tanpa Batas Waktu",
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
