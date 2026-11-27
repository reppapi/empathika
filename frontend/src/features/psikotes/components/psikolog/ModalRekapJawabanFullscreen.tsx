"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  ClipboardList,
} from "lucide-react";
import type { RekapJawabanItem } from "@/services/psikotes.service";
import {
  isAnswerTrue,
  isAnswerFalse,
  isChociInstrument,
  splitChociSections,
} from "./RekapJawabanPasienView";

interface ModalRekapJawabanFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
  rekapJawaban: RekapJawabanItem[];
  namaPeserta: string;
  namaPaket: string;
  alatUkurKode?: string | null;
  snapshotJawaban?: any;
}

export default function ModalRekapJawabanFullscreen({
  isOpen,
  onClose,
  rekapJawaban,
  namaPeserta,
  namaPaket,
  alatUkurKode,
  snapshotJawaban,
}: ModalRekapJawabanFullscreenProps) {
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

  const filteredItems = useMemo(() => {
    let list = rekapJawaban;

    if (activeFilter === "TRUE") {
      list = list.filter((it) => isAnswerTrue(it));
    } else if (activeFilter === "FALSE") {
      list = list.filter((it) => isAnswerFalse(it));
    } else if (activeFilter === "ANAK") {
      list = list.filter((it) => it.nomor <= 38);
    } else if (activeFilter === "ORTU") {
      list = list.filter((it) => it.nomor >= 39);
    }

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-xl bg-[#561269] text-white shrink-0 shadow-xs">
              <ClipboardList className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 truncate">
                Lembar Rekap Jawaban Pasien: {namaPeserta}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {namaPaket}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor butir atau kata kunci..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1.5 focus:ring-[#561269]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
            {!(isChoci && hasChociOrtu) && (
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  activeFilter === "ALL"
                    ? "bg-[#561269] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    activeFilter === "TRUE"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  Sesuai (+) ({stats.trueCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("FALSE")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    activeFilter === "FALSE"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    activeFilter === "ANAK"
                      ? "bg-[#561269] text-white"
                      : "bg-purple-50 text-[#561269] border border-purple-200 hover:bg-purple-100"
                  }`}
                >
                  Kuesioner Anak ({stats.anakCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("ORTU")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    activeFilter === "ORTU"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  Kuesioner Orang Tua ({stats.ortuCount})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 [scrollbar-width:thin] bg-gray-50/50">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Tidak ada butir soal ditemukan</p>
              <p className="text-xs text-gray-400">Silakan sesuaikan kata kunci atau filter pencarian Anda.</p>
            </div>
          ) : isChoci && hasChociOrtu ? (
            (() => {
              const { anakItems, ortuItems } = splitChociSections(filteredItems);
              const renderFullscreenCard = (item: RekapJawabanItem, isOrtu: boolean) => (
                <div
                  key={item.nomor}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-xs hover:border-purple-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        isOrtu ? "bg-amber-100 text-amber-900" : "bg-purple-100 text-[#561269]"
                      }`}
                    >
                      {isOrtu ? `No. ${item.nomor - 38}` : `No. ${item.nomor}`}
                    </span>
                  </div>
                  <p className="text-gray-800 text-xs leading-relaxed mt-2 font-normal">
                    {item.pertanyaan}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400">
                      {isOrtu ? "Jawaban Orang Tua:" : "Jawaban Anak:"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 font-semibold text-xs">
                      {item.label && <strong className="font-mono">[{item.label}]</strong>}
                      {item.jawaban}
                    </span>
                  </div>
                </div>
              );

              return (
                <div className="space-y-6">
                  {anakItems.length > 0 && (
                    <div className="space-y-3">
                      <div className="px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#561269]">
                          Section 1 — Kuesioner Anak / Remaja (Butir 1–38)
                        </span>
                        <span className="text-xs font-semibold text-purple-700">
                          {anakItems.length} butir
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {anakItems.map((it) => renderFullscreenCard(it, false))}
                      </div>
                    </div>
                  )}

                  {ortuItems.length > 0 && (
                    <div className="space-y-3">
                      <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">
                          Section 2 — Kuesioner Orang Tua / Caregiver (Butir 1–38)
                        </span>
                        <span className="text-xs font-semibold text-amber-800">
                          {ortuItems.length} butir
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {ortuItems.map((it) => renderFullscreenCard(it, true))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map((item) => {
                const isTrue = isAnswerTrue(item);

                return (
                  <div
                    key={item.nomor}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-xs hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-[#561269]">
                        No. {item.nomor}
                      </span>
                    </div>

                    <p className="text-gray-800 text-xs leading-relaxed mt-2 font-normal">
                      {item.pertanyaan}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400">Pilihan Pasien:</span>
                      {isMcmi ? (
                        isTrue ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs">
                            (+) Sesuai
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 border border-gray-300 text-gray-700 font-medium text-xs">
                            (-) Tidak Sesuai
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 font-semibold text-xs">
                          {item.label && <strong className="font-mono">[{item.label}]</strong>}
                          {item.jawaban}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between text-xs text-gray-500">
          <span>Menampilkan {filteredItems.length} dari {rekapJawaban.length} butir pertanyaan</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

