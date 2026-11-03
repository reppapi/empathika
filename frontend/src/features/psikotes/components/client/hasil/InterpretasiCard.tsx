"use client";

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
  return (
    <div className="bg-[#e9f4f7] rounded-3xl p-6 sm:p-7 border border-[#d2ebf2] shadow-xs transition-all">
      <button
        type="button"
        onClick={onToggleTips}
        className="w-full flex items-start justify-between text-left gap-4 cursor-pointer group"
      >
        <div className="space-y-2.5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {headline}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
            {interpretasiText}
          </p>
        </div>
        {tipsList.length > 0 && (
          <div className="w-8 h-8 rounded-full bg-white/70 group-hover:bg-white flex items-center justify-center shrink-0 text-gray-600 transition shadow-2xs mt-0.5">
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${
                isTipsExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        )}
      </button>

      {/* Expandable Tips */}
      {isTipsExpanded && tipsList.length > 0 && (
        <div className="mt-5 pt-5 border-t border-[#cde5ec] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0e7490]">
            Tips Untukmu!
          </h3>
          <div className="space-y-2.5">
            {tipsList.map((tip, idx) => {
              const tipText =
                typeof tip === "string"
                  ? tip
                  : tip.title
                    ? `${tip.title}: ${tip.desc || ""}`
                    : tip.desc || "";
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 border border-white/60 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0e7490] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                    {tipText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

