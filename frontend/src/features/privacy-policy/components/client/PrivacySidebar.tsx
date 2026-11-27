import React from "react";
import { FileText, ChevronRight, Sparkles, Mail, Phone } from "lucide-react";
import { SECTIONS } from "../../constants/privacy.constants";
import { PrivacySidebarProps } from "../../types/privacy.types";

export default function PrivacySidebar({
  activeSection,
  scrollToSection,
  email,
  waNumber,
  displayPhone,
}: PrivacySidebarProps) {
  return (
    <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
      <div className="bg-white rounded-2xl border border-purple-100/80 shadow-xs p-5">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
          <FileText className="w-5 h-5 text-[#561269]" />
          <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">
            Daftar Isi Dokumen
          </h3>
        </div>

        <nav className="space-y-1.5">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 ease-out flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? "bg-[#EAB308] text-gray-950 font-bold shadow-md shadow-yellow-500/25 scale-[1.01]"
                    : "text-gray-600 font-medium hover:bg-yellow-50/70 hover:text-yellow-950"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? "bg-white/90 text-gray-950 font-extrabold shadow-2xs"
                        : "bg-purple-100/70 text-[#561269] font-bold group-hover:bg-yellow-100 group-hover:text-yellow-800"
                    }`}
                  >
                    {sec.number}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                    isActive
                      ? "text-gray-950 translate-x-1 font-bold stroke-[2.5]"
                      : "text-gray-300 group-hover:text-yellow-700 group-hover:translate-x-0.5"
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Contact Card inside Sidebar */}
      <div className="bg-gradient-to-br from-[#561269] to-[#3a0847] rounded-2xl p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-purple-200 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-300" />
          Pusat Bantuan Resmi
        </div>
        <h4 className="font-bold text-base text-white mb-2">
          Ada Pertanyaan Terkait Privasi Anda?
        </h4>
        <p className="text-purple-100/90 text-xs leading-relaxed mb-4">
          Tim layanan klien dan tim operasional privasi kami siap membantu menjawab pertanyaan Anda dengan senang hati.
        </p>

        <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Mail className="w-4 h-4 text-purple-200 shrink-0" />
            <span className="truncate font-medium">{email}</span>
          </a>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate font-medium">{displayPhone}</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
