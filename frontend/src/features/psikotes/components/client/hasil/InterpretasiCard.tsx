"use client";

import { ChevronDown } from "lucide-react";
import type { DASSEvaluationResult } from "@/features/psikotes/utils/dassEvaluation";

interface InterpretasiCardProps {
  headline: string;
  interpretasiText: string;
  tipsList: any[];
  isTipsExpanded: boolean;
  onToggleTips: () => void;
  dassEvaluation?: DASSEvaluationResult | null;
}

export default function InterpretasiCard({
  headline,
  interpretasiText,
  tipsList,
  isTipsExpanded,
  onToggleTips,
  dassEvaluation,
}: InterpretasiCardProps) {
  // Pastikan headline tidak menampilkan jargon GPD atau rangkaian keparahan beruntun
  const cleanHeadline = (() => {
    if (dassEvaluation) return dassEvaluation.headline;
    if (!headline) return "Profil Kesehatan Emosional";
    if (
      /general psychological distress/i.test(headline) ||
      /\(gpd\)/i.test(headline) ||
      /depresi.*kecemasan.*stres/i.test(headline) ||
      /depresi.*kecemasan.*stress/i.test(headline)
    ) {
      return "Profil Kesehatan Emosional";
    }
    return headline;
  })();

  const effectiveIntroText = dassEvaluation ? dassEvaluation.introText : interpretasiText;
  const effectiveTips = dassEvaluation?.tips && dassEvaluation.tips.length > 0 ? dassEvaluation.tips : tipsList;

  return (
    <div className="bg-[#e9f4f7] rounded-3xl p-6 sm:p-7 border border-[#d2ebf2] shadow-xs transition-all">
      {/* 1. Header Ringkasan Skor & Interpretasi */}
      <div className="w-full">
        <div className="space-y-2.5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {cleanHeadline}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
            {effectiveIntroText}
          </p>
        </div>
      </div>

      {/* 2. Visualisasi Grafik 3 Dimensi (Sesuai Referensi: Nama, Persentase, dan Bar Minimalis) */}
      {dassEvaluation && (
        <div className="mt-6 pt-5 border-t border-[#cde5ec] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              Profil Lengkap Anda
            </h3>
          </div>

          <div className="space-y-4">
            {dassEvaluation.subscalesList.map((sub, idx) => (
              <div key={idx} className="space-y-1.5">
                {/* Baris Atas: Nama Dimensi di kiri & Persentase di kanan */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">
                    {sub.name}
                  </span>
                  <span className="font-semibold text-gray-700">
                    {sub.percentage}%
                  </span>
                </div>

                {/* Bar Grafik Minimalis */}
                <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${sub.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${sub.percentage > 0 ? Math.max(5, sub.percentage) : 0}%` }}
                  />
                </div>

                {/* Deskripsi Klinis Subskala */}
                <p className="text-xs text-gray-600 leading-relaxed font-normal pt-0.5">
                  {sub.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Expandable Tips Button & List */}
      {effectiveTips.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[#cde5ec]">
          <button
            type="button"
            onClick={onToggleTips}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0e7490]">
              Tips Untukmu!
            </h3>
            <div className="w-8 h-8 rounded-full bg-white/70 group-hover:bg-white flex items-center justify-center shrink-0 text-gray-600 transition shadow-2xs">
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  isTipsExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {isTipsExpanded && (
            <div className="mt-4 space-y-2.5">
              {effectiveTips.map((tip, idx) => {
                const tipTitle = typeof tip === "string" ? "" : tip.title || "";
                const tipDesc = typeof tip === "string" ? tip : tip.desc || "";

                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 border border-white/60 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#0e7490] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      {tipTitle && (
                        <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                          {tipTitle}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                        {tipDesc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

