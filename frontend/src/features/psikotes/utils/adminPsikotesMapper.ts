/** Helper mapper untuk mengubah respons API psikotes menjadi format tampilan tabel dan detail laporan admin. */
import type { PaketPsikotesApiResponse } from "@/services/psikotes.service";
import type {
  AdminPsikotesPeserta,
  Interpretasi,
  JudulPsikotesItem,
  PaketDetailItem,
  Tip,
} from "../types/adminPsikotes";

/**
 * Normalisasi data respons API paket psikotes dari backend menjadi model tampilan daftar judul admin.
 */
export function mapApiResponseToJudul(items: PaketPsikotesApiResponse[]): JudulPsikotesItem[] {
  const judulMap = new Map<string, JudulPsikotesItem>();

  items.forEach((item) => {
    const cleanJudul = item.judul
      .replace(/\s*\((gratis|berbayar|free|paid|paket lengkap)\)\s*$/i, "")
      .trim();
    const normalizedKey = cleanJudul.toLowerCase();

    const paketDetail: PaketDetailItem = {
      id: item.id,
      judulId: item.id,
      namaJudul: cleanJudul,
      kategori: "Umum",
      deskripsi: item.deskripsi || "",
      bannerUrl: item.banner_url || undefined,
      jenisAkses: item.jenis_akses === "GRATIS" ? "Gratis" : "Berbayar",
      harga: item.jenis_akses === "GRATIS" ? "Gratis" : `Rp ${Number(item.harga).toLocaleString("id-ID")}`,
      numericHarga: Number(item.harga) || 0,
      waktu: "15 Menit",
      status: item.status === "PUBLISHED" ? "Aktif" : "Draf",
      jumlahSoal: item.soal_psikotes?.length || 0,
      soalList: [],
      interpretasiList: (item.interpretasi_psikotes || []).map((i) => {
        let saran: Tip[] = [];
        let kekuatanUtama: string[] = [];
        let blindspots: string[] = [];
        let lingkunganOptimal: string[] = [];
        let judulKekuatan = "Potensi atau Kekuatan Utama";
        let judulBlindspots = "Area yang Perlu Dikembangkan";
        let judulLingkungan = "Kondisi atau Lingkungan yang Mendukung";

        const rawTips = (i as any)?.tips;
        if (Array.isArray(rawTips)) {
          saran = rawTips;
        } else if (rawTips && typeof rawTips === "object") {
          const t = rawTips as any;
          saran = Array.isArray(t.saran) ? t.saran : [];
          kekuatanUtama = Array.isArray(t.kekuatanUtama) ? t.kekuatanUtama : [];
          blindspots = Array.isArray(t.blindspots) ? t.blindspots : [];
          lingkunganOptimal = Array.isArray(t.lingkunganOptimal) ? t.lingkunganOptimal : [];
          if (t.judulKekuatan) judulKekuatan = t.judulKekuatan;
          if (t.judulBlindspots) judulBlindspots = t.judulBlindspots;
          if (t.judulLingkungan) judulLingkungan = t.judulLingkungan;
        }

        return {
          id: i.id,
          min: String(i.min_skor),
          max: String(i.max_skor),
          judul: i.judul,
          kategori: i.grade || "Umum",
          deskripsi: i.deskripsi,
          saran,
          kekuatanUtama,
          blindspots,
          lingkunganOptimal,
          judulKekuatan,
          judulBlindspots,
          judulLingkungan,
        };
      }),
      updatedAt: new Date(item.updatedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      pesertaCount: item._count?.booking_psikotes || 0,
    };

    if (judulMap.has(normalizedKey)) {
      const existing = judulMap.get(normalizedKey)!;
      const existingIdx = existing.paketList.findIndex(
        (p) => p.id === paketDetail.id || (p.jenisAkses === paketDetail.jenisAkses && p.status === paketDetail.status)
      );
      if (existingIdx >= 0) {
        existing.paketList[existingIdx] = paketDetail;
      } else {
        existing.paketList.push(paketDetail);
      }
      if (!existing.deskripsi && paketDetail.deskripsi) {
        existing.deskripsi = paketDetail.deskripsi;
      }
      if ((!existing.image || existing.image.includes("unsplash")) && paketDetail.bannerUrl) {
        existing.image = paketDetail.bannerUrl;
      }
    } else {
      judulMap.set(normalizedKey, {
        id: item.id,
        judul: cleanJudul,
        kategori: "Umum",
        deskripsi: item.deskripsi || "",
        image: item.banner_url || "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=100&h=100",
        paketList: [paketDetail],
      });
    }
  });

  return Array.from(judulMap.values());
}

/**
 * Ekstrak detail lengkap laporan interpretasi peserta untuk modal detail & cetak PDF.
 */
export function getPesertaReportDetail(
  peserta: AdminPsikotesPeserta,
  judulList: JudulPsikotesItem[] = []
) {
  const paketLower = (peserta.paket || "").toLowerCase().trim();

  // 1. Ekstrak langsung dari peserta.hasil (Data Asli dari Database Hasil Tes Peserta)
  let detailJudul = peserta.hasil?.judul && peserta.hasil.judul !== "—" ? peserta.hasil.judul : "";
  let detailGrade = peserta.hasil?.grade && peserta.hasil.grade !== "—" ? peserta.hasil.grade : peserta.skor;
  let deskripsi = peserta.hasil?.deskripsi && peserta.hasil.deskripsi !== "—" ? peserta.hasil.deskripsi : "";

  let kekuatanUtama: string[] = [];
  let blindspots: string[] = [];
  let lingkunganOptimal: string[] = [];
  let tips: Array<{ title: string; desc: string }> = [];
  let judulKekuatan = "Potensi atau Kekuatan Utama";
  let judulBlindspots = "Area yang Perlu Dikembangkan";
  let judulLingkungan = "Kondisi atau Lingkungan yang Mendukung";

  const rawHasilTips = (peserta.hasil as any)?.tips;
  if (rawHasilTips) {
    let rawTips: any = rawHasilTips;
    if (typeof rawTips === "string") {
      try {
        rawTips = JSON.parse(rawTips);
      } catch {
        rawTips = [];
      }
    }

    if (rawTips && typeof rawTips === "object" && !Array.isArray(rawTips)) {
      if (Array.isArray(rawTips.kekuatanUtama) && rawTips.kekuatanUtama.length > 0) {
        kekuatanUtama = rawTips.kekuatanUtama;
      }
      if (Array.isArray(rawTips.blindspots) && rawTips.blindspots.length > 0) {
        blindspots = rawTips.blindspots;
      }
      if (Array.isArray(rawTips.lingkunganOptimal) && rawTips.lingkunganOptimal.length > 0) {
        lingkunganOptimal = rawTips.lingkunganOptimal;
      }
      if (rawTips.judulKekuatan) judulKekuatan = rawTips.judulKekuatan;
      if (rawTips.judulBlindspots) judulBlindspots = rawTips.judulBlindspots;
      if (rawTips.judulLingkungan) judulLingkungan = rawTips.judulLingkungan;

      if (Array.isArray(rawTips.saran) && rawTips.saran.length > 0) {
        tips = rawTips.saran.map((s: any) =>
          typeof s === "string" ? { title: "Rekomendasi", desc: s } : s
        );
      }
    } else if (Array.isArray(rawTips) && rawTips.length > 0) {
      tips = rawTips.map((t: any) =>
        typeof t === "string" ? { title: "Rekomendasi", desc: t } : t
      );
    }
  }

  // 2. Jika ada informasi yang belum lengkap, cocokkan dengan interpretasi paket di judulList
  let interFound: Interpretasi | undefined;
  for (const j of judulList) {
    for (const p of j.paketList) {
      const pNama = p.namaJudul.toLowerCase().trim();
      const jJudul = j.judul.toLowerCase().trim();
      if (
        pNama === paketLower ||
        jJudul === paketLower ||
        paketLower.includes(jJudul) ||
        jJudul.includes(paketLower) ||
        paketLower.includes(pNama)
      ) {
        const matchInter = p.interpretasiList.find((i) => {
          const targetGrade = (detailGrade || peserta.skor || "").toLowerCase().trim();
          const targetJudul = (detailJudul || "").toLowerCase().trim();
          const iKat = (i.kategori || "").toLowerCase().trim();
          const iJud = (i.judul || "").toLowerCase().trim();

          if (targetGrade && (iKat === targetGrade || iJud.includes(targetGrade) || targetGrade.includes(iJud))) {
            return true;
          }
          if (targetJudul && (iJud === targetJudul || iJud.includes(targetJudul) || targetJudul.includes(iJud))) {
            return true;
          }
          if (peserta.totalSkor !== null && peserta.totalSkor !== undefined) {
            const min = Number(i.min);
            const max = Number(i.max);
            if (!isNaN(min) && !isNaN(max) && peserta.totalSkor >= min && peserta.totalSkor <= max) {
              return true;
            }
          }
          return false;
        });

        if (matchInter) {
          interFound = matchInter;
          break;
        }
      }
    }
    if (interFound) break;
  }

  if (interFound) {
    if (!detailJudul) detailJudul = interFound.judul;
    if (!deskripsi) deskripsi = interFound.deskripsi;
    if (kekuatanUtama.length === 0 && interFound.kekuatanUtama && interFound.kekuatanUtama.length > 0) {
      kekuatanUtama = interFound.kekuatanUtama;
    }
    if (blindspots.length === 0 && interFound.blindspots && interFound.blindspots.length > 0) {
      blindspots = interFound.blindspots;
    }
    if (lingkunganOptimal.length === 0 && interFound.lingkunganOptimal && interFound.lingkunganOptimal.length > 0) {
      lingkunganOptimal = interFound.lingkunganOptimal;
    }
    if (interFound.judulKekuatan) judulKekuatan = interFound.judulKekuatan;
    if (interFound.judulBlindspots) judulBlindspots = interFound.judulBlindspots;
    if (interFound.judulLingkungan) judulLingkungan = interFound.judulLingkungan;
    if (tips.length === 0 && interFound.saran && interFound.saran.length > 0) {
      tips = interFound.saran;
    }
  }

  return {
    judul: detailJudul || peserta.skor || "Profil Asesmen",
    grade: detailGrade || peserta.skor,
    deskripsi: deskripsi || "Asesmen psikotes telah diselesaikan dengan baik oleh peserta.",
    kekuatanUtama,
    blindspots,
    lingkunganOptimal,
    judulKekuatan,
    judulBlindspots,
    judulLingkungan,
    tips,
  };
}
