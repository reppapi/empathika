import React from "react";
import { SECTIONS } from "../../constants/terms.constants";
import { TermsMobileNavProps } from "../../types/terms.types";

export default function TermsMobileNav({
  activeSection,
  scrollToSection,
}: TermsMobileNavProps) {
  return (
    <div className="lg:hidden -mt-2 mb-4 overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
      {SECTIONS.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${
              isActive
                ? "bg-[#EAB308] text-gray-950 font-bold shadow-sm shadow-yellow-500/25 scale-[1.02]"
                : "bg-white text-gray-600 font-medium border border-gray-200/80 hover:bg-yellow-50/60"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center ${
                isActive ? "bg-white/90 text-gray-950" : "bg-purple-100 text-[#561269]"
              }`}
            >
              {sec.number}
            </span>
            <span>{sec.title}</span>
          </button>
        );
      })}
    </div>
  );
}
