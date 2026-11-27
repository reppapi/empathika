import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PrivacyHeroProps } from "../../types/privacy.types";

export default function PrivacyHero({ brandName, withBiro }: PrivacyHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/80 via-white to-[#faf8fb] pt-28 pb-14 border-b border-purple-100/60">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
          <Link
            href={withBiro("/") as any}
            className="hover:text-[#561269] transition-colors"
          >
            Beranda
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#561269] font-semibold">Kebijakan Privasi</span>
        </nav>

        <div className="max-w-3xl">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.2] mb-4">
            Kebijakan Privasi <span className="text-[#561269]">{brandName}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            Kami menjunjung tinggi kerahasiaan dan privasi Anda. Pedoman ini menjelaskan secara terbuka bagaimana data pribadi Anda dihimpun, dikelola, serta dilindungi selama Anda menggunakan layanan pendampingan kami.
          </p>
        </div>
      </div>
    </section>
  );
}
