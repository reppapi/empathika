"use client"

import React from "react"
import { Compass, Users, Award, CheckCircle2 } from "lucide-react"

export function InternshipPillars() {
  return (
    <section id="tiga-pilar" className="py-16 sm:py-24 bg-white border-b border-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            3 Nilai Utama Internship Empathika
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Program ini dirancang bukan sekadar untuk magang, namun menjadi perjalanan berharga
            bagi pengembangan diri dan dampak sosial yang nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Pilar 1: EKSPLORASI */}
          <div className="group relative bg-[#FCF8FD] border border-purple-100 rounded-3xl p-8 hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#561269] to-[#8B3A9C] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
              <Compass className="w-8 h-8 text-[#EAB308]" />
            </div>
            <span className="text-xs font-black tracking-widest text-[#561269] uppercase">
              Pilar 01
            </span>
            <h3 className="text-2xl font-black text-gray-900 mt-1 mb-3 tracking-wide">
              EKSPLORASI
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              Menjelajahi dinamika industri kesehatan mental dan digital media, serta mengasah keahlian
              baru secara aplikatif melalui bimbingan dan mentorship intensif dari praktisi berpengalaman.
            </p>
            <div className="mt-auto pt-6 border-t border-purple-100/80 flex items-center text-xs font-semibold text-[#561269] gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0" />
              <span>Mentorship 1-on-1 & Pembelajaran Aplikatif</span>
            </div>
          </div>

          {/* Pilar 2: KOLABORASI */}
          <div className="group relative bg-[#FCF8FD] border border-purple-100 rounded-3xl p-8 hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#561269] to-[#8B3A9C] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-[#EAB308]" />
            </div>
            <span className="text-xs font-black tracking-widest text-[#561269] uppercase">
              Pilar 02
            </span>
            <h3 className="text-2xl font-black text-gray-900 mt-1 mb-3 tracking-wide">
              KOLABORASI
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              Bekerja berdampingan dalam tim multidisiplin yang suportif—mulai dari psikolog, content creator,
              hingga tim operasional—untuk merancang program dan kampanye kreatif yang inovatif.
            </p>
            <div className="mt-auto pt-6 border-t border-purple-100/80 flex items-center text-xs font-semibold text-[#561269] gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0" />
              <span>Lingkungan Inklusif & Kerja Tim Multidisiplin</span>
            </div>
          </div>

          {/* Pilar 3: KONTRIBUSI */}
          <div className="group relative bg-[#FCF8FD] border border-purple-100 rounded-3xl p-8 hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#561269] to-[#8B3A9C] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
              <Award className="w-8 h-8 text-[#EAB308]" />
            </div>
            <span className="text-xs font-black tracking-widest text-[#561269] uppercase">
              Pilar 03
            </span>
            <h3 className="text-2xl font-black text-gray-900 mt-1 mb-3 tracking-wide">
              KONTRIBUSI
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              Memberikan sumbangsih nyata dalam meningkatkan kesadaran kesehatan mental masyarakat luas,
              sekaligus membangun portofolio kredibel dan jejaring karir masa depanmu.
            </p>
            <div className="mt-auto pt-6 border-t border-purple-100/80 flex items-center text-xs font-semibold text-[#561269] gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0" />
              <span>Sertifikat Resmi & Portofolio Berdampak</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
