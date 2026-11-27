"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  FileText,
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

export function isChociInstrument(alatUkurKode?: string | null, namaPaket?: string): boolean {
  return (
    Boolean(alatUkurKode?.toUpperCase().includes("CHOCI")) ||
    Boolean(namaPaket?.toLowerCase().includes("choci")) ||
    Boolean(namaPaket?.toLowerCase().includes("ocd anak"))
  );
}

export function splitChociSections(items: RekapJawabanItem[]) {
  return {
    anakItems: items.filter((it) => it.nomor <= 38),
    ortuItems: items.filter((it) => it.nomor >= 39),
  };
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
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TRUE" | "FALSE" | "ANAK" | "ORTU">("ALL");

  const isMcmi =
    Boolean(alatUkurKode?.toUpperCase().includes("MCMI")) ||
    Boolean(namaPaket?.toLowerCase().includes("mcmi")) ||
    Boolean(namaPaket?.toLowerCase().includes("multiaxial"));

  const isChoci = isChociInstrument(alatUkurKode, namaPaket);
  const hasChociOrtu = useMemo(
    () => isChoci && rekapJawaban.some((it) => it.nomor >= 39),
    [isChoci, rekapJawaban]
  );

  useEffect(() => {
    if (isChoci && hasChociOrtu && activeFilter === "ALL") {
      setActiveFilter("ANAK");
    }
  }, [isChoci, hasChociOrtu, activeFilter]);

  // Hitung metrik dan distribusi butir jawaban
  const stats = useMemo(() => {
    let trueCount = 0;
    let falseCount = 0;
    let anakCount = 0;
    let ortuCount = 0;

    for (const it of rekapJawaban) {
      const isTrue = isAnswerTrue(it);
      if (isTrue) trueCount++;
      else falseCount++;
      if (it.nomor <= 38) anakCount++;
      else ortuCount++;
    }

    return {
      total: rekapJawaban.length,
      trueCount,
      falseCount,
      anakCount,
      ortuCount,
    };
  }, [rekapJawaban]);

  // Filter dan pencarian butir jawaban secara real-time
  const filteredItems = useMemo(() => {
    let list = rekapJawaban;

    // Filter Kategori
    if (activeFilter === "TRUE") {
      list = list.filter((it) => isAnswerTrue(it));
    } else if (activeFilter === "FALSE") {
      list = list.filter((it) => isAnswerFalse(it));
    } else if (activeFilter === "ANAK") {
      list = list.filter((it) => it.nomor <= 38);
    } else if (activeFilter === "ORTU") {
      list = list.filter((it) => it.nomor >= 39);
    }

    // Filter Pencarian kata kunci atau nomor
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const numQuery = parseInt(q.replace(/^(no\.?|#)\s*/i, ""), 10);

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
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#561269] text-[10px] font-bold tracking-wide uppercase shrink-0">
              {alatUkurKode || "Asesmen"}
            </span>
          </div>
        </div>

        {/* 2. Input Pencarian & Reset */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor butir atau kata kunci (contoh: 'tidur', '40')..."
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
          {!(isChoci && hasChociOrtu) && (
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
          )}

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

          {isChoci && hasChociOrtu && (
            <>
              <button
                type="button"
                onClick={() => setActiveFilter("ANAK")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  activeFilter === "ANAK"
                    ? "bg-[#561269] text-white shadow-2xs"
                    : "bg-white text-[#561269] border border-purple-200 hover:bg-purple-50"
                }`}
              >
                Kuesioner Anak ({stats.anakCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("ORTU")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  activeFilter === "ORTU"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-white text-amber-800 border border-amber-200 hover:bg-amber-50"
                }`}
              >
                Kuesioner Orang Tua ({stats.ortuCount})
              </button>
            </>
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
        ) : isChoci && hasChociOrtu ? (
          (() => {
            const { anakItems, ortuItems } = splitChociSections(filteredItems);
            const renderCard = (item: RekapJawabanItem, isOrtu: boolean) => {
              const displayNo = isOrtu
                ? `No. ${item.nomor - 38}`
                : `No. ${item.nomor}`;
              const isIsian = [11, 12, 13, 30, 31, 32, 49, 50, 51, 68, 69, 70].includes(item.nomor);
              return (
                <div
                  key={item.nomor}
                  className="p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs text-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isOrtu
                          ? "bg-amber-100 text-amber-900"
                          : "bg-purple-100 text-[#561269]"
                      }`}
                    >
                      {displayNo}
                    </span>
                  </div>
                  <p className="text-gray-800 text-[11px] leading-relaxed mt-1.5 font-normal">
                    {item.pertanyaan}
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-100/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-400">
                      {isOrtu ? "Jawaban Orang Tua:" : "Jawaban Anak:"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 font-semibold text-[10px]">
                      {!isIsian && item.label && <strong className="font-mono">[{item.label}]</strong>}
                      {item.jawaban}
                    </span>
                  </div>
                  {item.teks_jawaban && item.teks_jawaban.trim() && (
                    <div className="mt-2 p-2 rounded-lg bg-purple-50/60 border border-purple-100 text-[11px] text-gray-800">
                      <span className="text-[10px] font-semibold text-[#561269] block mb-0.5">
                        Isian Tertulis:
                      </span>
                      <p className="leading-relaxed whitespace-pre-wrap break-words">
                        &ldquo;{item.teks_jawaban.trim()}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              );
            };

            return (
              <div className="space-y-4">
                {anakItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#561269]">
                        Kuesioner Anak / Remaja (Butir 1–38)
                      </span>
                      <span className="text-[10px] font-semibold text-purple-700">
                        {anakItems.length} butir
                      </span>
                    </div>
                    <div className="space-y-2">{anakItems.map((it) => renderCard(it, false))}</div>
                  </div>
                )}

                {ortuItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900">
                        Kuesioner Orang Tua / Caregiver (Butir 1–38)
                      </span>
                      <span className="text-[10px] font-semibold text-amber-800">
                        {ortuItems.length} butir
                      </span>
                    </div>
                    <div className="space-y-2">{ortuItems.map((it) => renderCard(it, true))}</div>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          filteredItems.map((item) => {
            const isTrue = isAnswerTrue(item);

            return (
              <div
                key={item.nomor}
                className="p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs text-xs transition-all"
              >
                {/* Header Butir Soal */}
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-[#561269]">
                    No. {item.nomor}
                  </span>
                </div>

                {/* Teks Pernyataan Butir */}
                <p className="text-gray-800 text-[11px] leading-relaxed mt-1.5 font-normal">
                  {item.pertanyaan}
                </p>

                {/* Badge Jawaban Pasien */}
                <div className="mt-2 pt-2 border-t border-gray-100/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400">Pilihan Pasien:</span>

                  {isMcmi ? (
                    isTrue ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[10px]">
                        (+) Sesuai
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-300 text-gray-700 font-semibold text-[10px]">
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

