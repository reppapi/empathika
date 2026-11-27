import React from "react"
import { Building2, Clock, Sparkles } from "lucide-react"

export interface FormulirHeaderProps {
  title: string
  description?: string
}

export default function FormulirHeader({ title, description }: FormulirHeaderProps) {
  return (
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
          stroke="url(#kerjasama-wave-1)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <path
          d="M-100 140 C 400 50, 800 360, 1300 160"
          stroke="url(#kerjasama-wave-2)"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="kerjasama-wave-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#EAB308" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kerjasama-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
          {title}
        </h1>

        <p className="text-white/85 text-xs sm:text-sm max-w-2xl leading-relaxed mb-4">
          {description}
        </p>

        {/* Quick Info Badges */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90">
          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
            <Building2 className="w-4 h-4 text-[#EAB308]" />
            <span>Institusi & Perusahaan</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
            <Clock className="w-4 h-4 text-[#EAB308]" />
            <span>Respon 1–2 Hari Kerja</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-[#EAB308]" />
            <span>Kemitraan Resmi & MoU</span>
          </div>
        </div>
      </div>
    </div>
  )
}
