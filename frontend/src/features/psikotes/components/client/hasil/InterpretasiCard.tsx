/** Kartu tampilan ringkasan hasil skor dan rincian interpretasi/saran untuk hasil tes gratis. */
"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";

interface InterpretasiCardProps {
  headline: string;
  interpretasiText: string;
  tipsList: any[];
  isTipsExpanded: boolean;
  onToggleTips: () => void;
}

export default function InterpretasiCard({
  headline,
  interpretasiText,
  tipsList,
  isTipsExpanded,
  onToggleTips,
}: InterpretasiCardProps) {
  const cleanHeadline = headline || "Profil Hasil Asesmen";

  const introParagraphs = useMemo(() => {
    if (!interpretasiText) return [];
    const doubleSplit = interpretasiText
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (doubleSplit.length > 1) return doubleSplit;

    const singleSplit = interpretasiText
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    return singleSplit.length > 1 ? singleSplit : [interpretasiText.trim()];
  }, [interpretasiText]);

  return (
    <div className="bg-[#e9f4f7] rounded-3xl p-6 sm:p-7 border border-[#d2ebf2] shadow-xs transition-all">
      {/* 1. Header Ringkasan Skor & Interpretasi */}
      <div className="w-full">
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {cleanHeadline}
          </h2>
          <div className="space-y-3.5 text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
            {introParagraphs.map((para, pIdx) => (
              <p key={pIdx}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Expandable Tips Button & List */}
      {tipsList.length > 0 && (
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
              {tipsList.map((tip, idx) => {
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

