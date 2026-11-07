"use client";

import Link from "next/link";
import { PhoneCall } from "lucide-react";

export default function CrisisHotlineCard() {
  return (
    <div className="bg-[#fff1f2] rounded-3xl p-6 sm:p-7 border border-[#fecdd3] shadow-xs space-y-5">
      {/* Header Section */}
      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          Kamu Tidak Harus Menghadapinya Sendirian
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
          Dari jawabanmu, kami melihat adanya tanda-tanda perasaan putus asa atau pikiran untuk menyakiti diri sendiri. Kami tahu perasaan seperti ini tidak mudah untuk dihadapi. Namun, kamu tidak harus melewatinya sendirian. Selalu ada dukungan dan bantuan profesional yang bisa kamu jangkau kapan pun kamu membutuhkannya.
        </p>
      </div>

      {/* Sub-Card 1: Hotline Krisis (Atas) */}
      <div className="bg-white rounded-2xl p-5 border border-[#fecdd3] shadow-2xs space-y-3">
        <h4 className="text-sm sm:text-base font-bold text-gray-900">
          Layanan Bantuan & Hotline Krisis Darurat:
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Jika kamu sedang berada dalam situasi yang membahayakan diri, segera hubungi keluarga atau orang terdekat yang kamu percaya, dan datangi IGD rumah sakit terdekat jika diperlukan.
        </p>
        <a
          href="tel:119"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs sm:text-sm transition shadow-xs active:scale-98 cursor-pointer"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Hotline Kemenkes: 119 (ext. 8)</span>
        </a>
      </div>

      {/* Sub-Card 2: Konsultasi Psikolog (Bawah) */}
      <div className="bg-white rounded-2xl p-5 border border-[#fecdd3] shadow-2xs space-y-3">
        <h4 className="text-sm sm:text-base font-bold text-gray-900">
          Konsultasi dengan Psikolog
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Jika kamu merasa membutuhkan ruang aman dan pendampingan profesional untuk kondisimu saat ini, psikolog profesional Empathika siap menemanimu.
        </p>
        <Link href="/konseling" className="w-full block">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition shadow-xs active:scale-98 cursor-pointer"
          >
            <span>Konsultasi dengan Psikolog</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

