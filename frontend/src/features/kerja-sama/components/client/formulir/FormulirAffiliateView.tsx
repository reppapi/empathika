import React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

export interface FormulirAffiliateViewProps {
  brandName: string
  waNumber: string
}

export default function FormulirAffiliateView({ brandName, waNumber }: FormulirAffiliateViewProps) {
  return (
    <div className="min-h-screen bg-[#FAF7FB] font-poppins pb-24">
      {/* ── HEADER NAVIGATION (AFFILIATE) ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#561269] via-[#6f1886] to-[#8B3A9C] text-white pt-32 sm:pt-36 md:pt-40 pb-20 sm:pb-24 md:pb-28 px-4 sm:px-6 lg:px-8 shadow-md">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.12)_1px,_transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top_right,black_40%,transparent_80%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#EAB308]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-fuchsia-400/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-60 h-60 rounded-full bg-purple-300/10 blur-2xl pointer-events-none" />
        <div className="absolute -top-16 right-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -top-28 right-4 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-24 left-12 w-60 h-60 rounded-full border border-white/10 pointer-events-none" />
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          preserveAspectRatio="none"
          viewBox="0 0 1200 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 220 C 300 380, 700 60, 1300 250"
            stroke="url(#affiliate-wave-1)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M-100 140 C 400 50, 800 360, 1300 160"
            stroke="url(#affiliate-wave-2)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="affiliate-wave-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#EAB308" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="affiliate-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Program Kemitraan
            </span>
            <span className="px-3 py-1 rounded-full bg-[#EAB308] text-[#0f172a] text-xs font-bold">
              Affiliate
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2">
            Program Affiliate {brandName}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Berkolaborasi bersama kami dalam memperluas jangkauan layanan kesehatan mental dan raih komisi kemitraan menarik.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        <div className="bg-white rounded-3xl border border-purple-100 shadow-xl p-8 sm:p-12 text-center space-y-8">
          <div className="w-20 h-20 bg-purple-100 text-[#561269] rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
            🤝
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Peluang Kolaborasi Affiliate
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Program ini ditujukan bagi kreator konten, komunitas, konsultan, dan individu yang ingin berbagi manfaat edukasi serta layanan psikologis profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-[#FAF7FB] border border-purple-100/70">
              <p className="font-bold text-[#561269] text-sm mb-1">💰 Komisi Menarik</p>
              <p className="text-xs text-gray-600">Bagi hasil kompetitif untuk setiap transaksi pengguna yang Anda ajak.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7FB] border border-purple-100/70">
              <p className="font-bold text-[#561269] text-sm mb-1">📊 Transparan</p>
              <p className="text-xs text-gray-600">Pencatatan rujukan rapi dan update laporan berkala dari tim kemitraan.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7FB] border border-purple-100/70">
              <p className="font-bold text-[#561269] text-sm mb-1">🎨 Dukungan Materi</p>
              <p className="text-xs text-gray-600">Materi promosi, konten edukatif, dan sesi briefing khusus bersama tim kami.</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                `Halo Tim Partnership ${brandName}, saya tertarik untuk bermitra dan berdiskusi seputar Program Affiliate.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all whitespace-nowrap shrink-0"
            >
              <span>Daftar / Konsultasi via WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <Link
              href="/kerja-sama"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Kerja Sama</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
