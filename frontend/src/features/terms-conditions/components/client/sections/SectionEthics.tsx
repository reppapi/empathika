import React from "react";
import { ShieldCheck } from "lucide-react";

export default function SectionEthics() {
  return (
    <article
      id="etika-kerahasiaan"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          6
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Kode Etik, Kerahasiaan Sesi & Hak Kekayaan Intelektual
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Standar etika profesional dan perlindungan materi konten.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/60 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <ShieldCheck className="w-4 h-4 text-[#561269]" />
            <span>Larangan Perekaman Tanpa Izin</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Demi melindungi privasi dan integritas proses terapeutik, <strong>klien dilarang keras merekam (baik audio, video, maupun tangkapan layar)</strong> selama sesi konsultasi berlangsung tanpa persetujuan tertulis dari psikolog pendamping. Pelanggaran atas ketentuan ini dapat berujung pada penghentian sepihak atas sesi.
          </p>
        </div>

        <p>
          Seluruh instrumen alat tes psikologi, modul seminar, materi workshop, desain antarmuka, dan konten artikel yang tersedia di situs web merupakan hak kekayaan intelektual milik Empathika atau mitra resminya, dan dilindungi oleh undang-undang hak cipta Republik Indonesia. Penggandaan atau penyebarluasan tanpa izin merupakan tindakan melanggar hukum.
        </p>
      </div>
    </article>
  );
}
