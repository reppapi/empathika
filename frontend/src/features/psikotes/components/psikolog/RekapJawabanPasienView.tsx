"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  AlertTriangle,
  FileText,
  Check,
} from "lucide-react";
import type { RekapJawabanItem } from "@/services/psikotes.service";

interface RekapJawabanPasienViewProps {
  rekapJawaban: RekapJawabanItem[];
  alatUkurKode?: string | null;
  namaPaket?: string;
  snapshotJawaban?: any;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

// Deteksi butir klinis kritis / indikator khusus berdasarkan instrumen psikotes
interface CriticalAlert {
  type: "bahaya" | "validitas" | "zat" | "paranoid" | "disosiasi" | "peringatan";
  label: string;
  deskripsi: string;
}

/**
 * Helper terpusat untuk mendeteksi apakah jawaban bernilai True / Sesuai / Benar (+)
 * Menghindari bug string includes("sesuai") yang keliru mencocokkan "tidak sesuai".
 */
export function isAnswerTrue(it: {
  jawaban?: string | null;
  label?: string | null;
  skor?: number | null;
}): boolean {
  // 1. Cek label eksplisit (+ vs -)
  const label = (it.label || "").trim();
  if (label === "+") return true;
  if (label === "-") return false;
  if (/^true$/i.test(label) || /^t$/i.test(label) || /^ya$/i.test(label)) return true;
  if (/^false$/i.test(label) || /^f$/i.test(label) || /^tidak$/i.test(label)) return false;

  const text = (it.jawaban || "").trim().toLowerCase();

  // 2. Cek teks jawaban yang secara eksplisit bernada negatif (False / Tidak Sesuai / Salah)
  // PENTING: Wajib dicek SEBELUM pola "sesuai" / "benar" karena "tidak sesuai" mengandung kata "sesuai"!
  if (
    text === "-" ||
    text.startsWith("tidak") ||
    text.includes("tidak sesuai") ||
    text.includes("tidak benar") ||
    text.includes("tidak setuju") ||
    text.includes("bukan") ||
    text.includes("salah") ||
    text.includes("false") ||
    text === "0"
  ) {
    return false;
  }

  // 3. Cek teks jawaban yang bernada positif (True / Sesuai / Benar)
  if (
    text === "+" ||
    text === "true" ||
    text === "sesuai" ||
    text === "benar" ||
    text === "ya" ||
    text === "1" ||
    text.startsWith("sesuai") ||
    text.startsWith("benar") ||
    text.includes("sesuai / benar") ||
    text.includes("(true)") ||
    text.includes("sesuai") ||
    text.includes("benar")
  ) {
    return true;
  }

  // 4. Fallback ke skor numerik (pada MCMI, True memiliki bobot 1, False bobot 0)
  if (typeof it.skor === "number") {
    return it.skor > 0;
  }

  return false;
}

export function isAnswerFalse(it: {
  jawaban?: string | null;
  label?: string | null;
  skor?: number | null;
}): boolean {
  return !isAnswerTrue(it);
}

function getCriticalItemAlert(
  nomor: number,
  jawabanText: string,
  skor: number,
  alatUkurKode?: string | null,
  label?: string | null
): CriticalAlert | null {
  const code = (alatUkurKode || "").toUpperCase();
  const isTrue = isAnswerTrue({ jawaban: jawabanText, label, skor });

  // 1. MCMI-IV
  if (code.includes("MCMI")) {
    // Skala V (Validitas / Absurditas)
    if (nomor === 49 && isTrue) {
      return {
        type: "validitas",
        label: "Skala V (Absurditas)",
        deskripsi: "Pernyataan absurd: mengaku fotonya menghiasi halaman depan majalah.",
      };
    }
    if (nomor === 114 && isTrue) {
      return {
        type: "validitas",
        label: "Skala V (Absurditas)",
        deskripsi: "Pernyataan absurd: mengaku 2 tahun tidak pernah melihat mobil di jalan raya.",
      };
    }
    if (nomor === 158 && isTrue) {
      return {
        type: "validitas",
        label: "Skala V (Absurditas)",
        deskripsi: "Pernyataan absurd: mengaku mampu terbang tanpa alat bantuan apapun.",
      };
    }

    // Riwayat Menyakiti Diri (Self-Harm) / Suicidality
    if (nomor === 40 && isTrue) {
      return {
        type: "bahaya",
        label: "Riwayat Menyakiti Diri",
        deskripsi: "Pernah dengan sengaja melukai diri sendiri di masa lalu.",
      };
    }

    // Penyalahgunaan Zat & Alkohol
    if (nomor === 25 && isTrue) {
      return {
        type: "zat",
        label: "Masalah Alkohol",
        deskripsi: "Kebiasaan konsumsi alkohol yang membawa dampak masalah bagi diri & keluarga.",
      };
    }
    if (nomor === 36 && isTrue) {
      return {
        type: "zat",
        label: "Penyalahgunaan Narkoba",
        deskripsi: "Kehilangan pekerjaan akibat pemakaian zat/narkotika.",
      };
    }
    if (nomor === 45 && isTrue) {
      return {
        type: "zat",
        label: "Adiksi Alkohol",
        deskripsi: "Kesulitan menahan diri agar tidak minum alkohol berlebihan.",
      };
    }

    // Ide Referensi & Disregulasi Emosi
    if (nomor === 13 && isTrue) {
      return {
        type: "paranoid",
        label: "Ide Referensi / Curiga",
        deskripsi: "Meyakini sekelompok orang sedang membicarakan dirinya saat berpapasan.",
      };
    }
    if (nomor === 18 && isTrue) {
      return {
        type: "disosiasi",
        label: "Disregulasi Emosional",
        deskripsi: "Kerap merasa seperti hilang kendali atau 'orang gila' saat hidup memburuk.",
      };
    }
  }

  // 2. PHQ-9 (Patient Health Questionnaire - 9)
  if (code.includes("PHQ")) {
    if (nomor === 9 && skor > 0) {
      return {
        type: "bahaya",
        label: "Ide Bunuh Diri / Menyakiti Diri",
        deskripsi: "Muncul pikiran lebih baik mati atau berniat menyakiti diri sendiri.",
      };
    }
  }

  // 3. GAD-7 (Generalized Anxiety Disorder - 7)
  if (code.includes("GAD")) {
    if (nomor === 7 && skor >= 2) {
      return {
        type: "peringatan",
        label: "Kepanikan Akut",
        deskripsi: "Merasa takut luar biasa seolah musibah buruk akan segera menimpa.",
      };
    }
  }

  return null;
}

export default function RekapJawabanPasienView({
  rekapJawaban,
  alatUkurKode,
  namaPaket,
  snapshotJawaban,
  onMaximize,
  isMaximized = false,
}: RekapJawabanPasienViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TRUE" | "FALSE" | "CRITICAL">("ALL");

  const isMcmi =
    Boolean(alatUkurKode?.toUpperCase().includes("MCMI")) ||
    Boolean(namaPaket?.toLowerCase().includes("mcmi")) ||
    Boolean(namaPaket?.toLowerCase().includes("multiaxial"));

  // Hitung metrik dan distribusi butir jawaban
  const stats = useMemo(() => {
    let trueCount = 0;
    let falseCount = 0;
    let criticalCount = 0;

    for (const it of rekapJawaban) {
      const isTrue = isAnswerTrue(it);

      if (isTrue) trueCount++;
      else falseCount++;

      const alert = getCriticalItemAlert(it.nomor, it.jawaban, it.skor, alatUkurKode, it.label);
      if (alert) criticalCount++;
    }

    return {
      total: rekapJawaban.length,
      trueCount,
      falseCount,
      criticalCount,
    };
  }, [rekapJawaban, alatUkurKode]);

  // Filter dan pencarian butir jawaban secara real-time
  const filteredItems = useMemo(() => {
    let list = rekapJawaban;

    // Filter Kategori
    if (activeFilter === "TRUE") {
      list = list.filter((it) => isAnswerTrue(it));
    } else if (activeFilter === "FALSE") {
      list = list.filter((it) => isAnswerFalse(it));
    } else if (activeFilter === "CRITICAL") {
      list = list.filter((it) => {
        return Boolean(getCriticalItemAlert(it.nomor, it.jawaban, it.skor, alatUkurKode, it.label));
      });
    }

    // Filter Pencarian kata kunci atau nomor
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const numQuery = parseInt(q.replace("#", ""), 10);

      list = list.filter((it) => {
        if (!isNaN(numQuery) && it.nomor === numQuery) return true;
        return (
          it.pertanyaan.toLowerCase().includes(q) ||
          it.jawaban.toLowerCase().includes(q) ||
          String(it.nomor).includes(q)
        );
      });
    }

    return list;
  }, [rekapJawaban, activeFilter, searchQuery, alatUkurKode]);

  // Ekstraksi jawaban kualitatif tambahan jika ada di snapshot
  const kualitatifTambahan = useMemo(() => {
    if (!snapshotJawaban || typeof snapshotJawaban !== "object") return null;

    const items: Array<{ label: string; value: string }> = [];

    if (snapshotJawaban.dampak_aktivitas !== undefined && snapshotJawaban.dampak_aktivitas !== null) {
      const mapVal: Record<number, string> = {
        0: "Sama sekali tidak sulit",
        1: "Agak sulit",
        2: "Sangat sulit",
        3: "Luar biasa sulit",
      };
      items.push({
        label: "Dampak Masalah terhadap Aktivitas & Sosial (Functional Impairment)",
        value: mapVal[Number(snapshotJawaban.dampak_aktivitas)] || String(snapshotJawaban.dampak_aktivitas),
      });
    }

    if (snapshotJawaban.peristiwa_paling_mengganggu || snapshotJawaban.peristiwaPalingMengganggu) {
      items.push({
        label: "Peristiwa Trauma yang Paling Mengganggu (CATS)",
        value: String(snapshotJawaban.peristiwa_paling_mengganggu || snapshotJawaban.peristiwaPalingMengganggu),
      });
    }

    if (snapshotJawaban.peristiwa_lainnya || snapshotJawaban.peristiwaLainnya) {
      items.push({
        label: "Peristiwa Trauma Lainnya",
        value: String(snapshotJawaban.peristiwa_lainnya || snapshotJawaban.peristiwaLainnya),
      });
    }

    return items.length > 0 ? items : null;
  }, [snapshotJawaban]);

  return (
    <div className="flex flex-col h-full bg-white select-text">
      {/* 1. Header Informasi Rekap Jawaban */}
      <div className="p-3.5 border-b border-gray-100 bg-gray-50/70 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#561269] text-[10px] font-bold tracking-wide uppercase shrink-0">
              {alatUkurKode || "Asesmen"}
            </span>
            <span className="text-xs font-semibold text-gray-700 truncate">
              {rekapJawaban.length} Butir Soal Terjawab
            </span>
          </div>

          {stats.criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold shrink-0 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              {stats.criticalCount} Butir Kritis
            </span>
          )}
        </div>

        {/* 2. Input Pencarian & Reset */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor butir atau kata kunci (contoh: 'tidur', '#40')..."
            className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1.5 focus:ring-[#561269] focus:border-[#561269] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. Filter Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
              activeFilter === "ALL"
                ? "bg-[#561269] text-white shadow-2xs"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Semua ({stats.total})
          </button>

          {isMcmi && (
            <>
              <button
                type="button"
                onClick={() => setActiveFilter("TRUE")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  activeFilter === "TRUE"
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                Sesuai (+) ({stats.trueCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("FALSE")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  activeFilter === "FALSE"
                    ? "bg-gray-700 text-white shadow-2xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                Tidak Sesuai (-) ({stats.falseCount})
              </button>
            </>
          )}

          {stats.criticalCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("CRITICAL")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeFilter === "CRITICAL"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
              }`}
            >
              ⚠️ Kritis ({stats.criticalCount})
            </button>
          )}
        </div>
      </div>

      {/* 4. Daftar Butir Pertanyaan & Pilihan Jawaban */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 [scrollbar-width:thin]">
        {/* Informasi Kualitatif Tambahan (jika ada) */}
        {kualitatifTambahan && (
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 mb-3">
            <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#561269]" />
              Pertanyaan Klinis Tambahan
            </span>
            <div className="space-y-1.5 text-xs">
              {kualitatifTambahan.map((k, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white border border-purple-100">
                  <p className="text-[10px] text-gray-500 font-medium">{k.label}</p>
                  <p className="text-gray-900 font-semibold mt-0.5">{k.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State Kosong Jika Filter / Pencarian Tidak Ditemukan */}
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Tidak ada butir soal ditemukan</p>
            <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto">
              Tidak ada jawaban yang sesuai dengan kata kunci &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isTrue = isAnswerTrue(item);

            const criticalAlert = getCriticalItemAlert(
              item.nomor,
              item.jawaban,
              item.skor,
              alatUkurKode,
              item.label
            );

            return (
              <div
                key={item.nomor}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  criticalAlert
                    ? "bg-rose-50/60 border-rose-200 shadow-2xs"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-2xs"
                }`}
              >
                {/* Header Butir Soal */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                        criticalAlert
                          ? "bg-rose-200/80 text-rose-900"
                          : "bg-purple-100 text-[#561269]"
                      }`}
                    >
                      #{String(item.nomor).padStart(2, "0")}
                    </span>

                    {criticalAlert && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-800 text-[9px] font-bold">
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                        {criticalAlert.label}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-400 font-mono shrink-0">
                    Bobot: {item.skor}
                  </span>
                </div>

                {/* Teks Pernyataan Butir */}
                <p className="text-gray-800 text-[11px] leading-relaxed mt-1.5 font-normal">
                  {item.pertanyaan}
                </p>

                {/* Indikator Peringatan Klinis */}
                {criticalAlert && (
                  <p className="text-[10px] text-rose-700 bg-rose-100/60 p-1.5 rounded-md mt-1.5 leading-snug border border-rose-200/60">
                    <strong>Catatan Klinis:</strong> {criticalAlert.deskripsi}
                  </p>
                )}

                {/* Badge Jawaban Pasien */}
                <div className="mt-2 pt-2 border-t border-gray-100/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400">Pilihan Pasien:</span>

                  {isMcmi ? (
                    isTrue ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[10px]">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                        (+) Sesuai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-300 text-gray-700 font-semibold text-[10px]">
                        <X className="w-3 h-3 text-gray-500" />
                        (-) Tidak Sesuai
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 font-semibold text-[10px]">
                      {item.label && <strong className="font-mono">[{item.label}]</strong>}
                      {item.jawaban}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Footer Informasi Ringkas */}
      <div className="p-2.5 border-t border-gray-100 bg-gray-50/70 text-[10px] text-gray-500 flex items-center justify-between">
        <span>Menampilkan {filteredItems.length} dari {rekapJawaban.length} butir</span>
        <span className="text-gray-400">Empathika Clinical Assessment System</span>
      </div>
    </div>
  );
}

