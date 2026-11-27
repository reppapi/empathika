"use client"

import React from "react"
import { GraduationCap, Laptop, Sparkles, ArrowRight } from "lucide-react"

interface InternshipBenefitsProps {
  onScrollToPositions: () => void
}

export function InternshipBenefits({ onScrollToPositions }: InternshipBenefitsProps) {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-purple-100/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
              Apa yang Akan Kamu Dapatkan Selama Magang di Empathika?
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Kami berkomitmen memberikan lingkungan belajar yang suportif, inklusif, dan
              menantang agar kamu dapat mencapai potensi terbaikmu.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-[#561269]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Mentorship Profesional</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
                    Bimbingan langsung dari psikolog dan praktisi media kreatif berpengalaman.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
                  <Laptop className="w-5 h-5 text-[#561269]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    Fleksibilitas Kerja (Remote / WFA)
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
                    Bekerja secara fleksibel dari mana saja dengan jam kerja yang bersahabat untuk
                    mahasiswa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#561269]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    Sertifikat & Peluang Karir Lanjutan
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
                    Sertifikat resmi magang dan kesempatan direkrut sebagai tim inti atau project-based.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Banner samping / highlight box */}
          <div className="bg-gradient-to-br from-[#561269] to-[#8B3A9C] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                &ldquo;Setiap langkah kecil yang kamu buat membawa dampak besar bagi kesehatan mental
                banyak orang.&rdquo;
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Mari bergabung bersama kami menjadi jembatan empati dan perubahan positif bagi
                lingkungan sekitar.
              </p>

              <div className="pt-4 border-t border-white/20">
                <button
                  onClick={onScrollToPositions}
                  className="w-full py-3.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
