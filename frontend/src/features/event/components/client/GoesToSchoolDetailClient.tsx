"use client"

import Image from "next/image"
import { AdminEventData } from "@/features/event/data/adminEventData"

interface Props {
  id: string
  event?: AdminEventData
}

export default function GoesToSchoolDetailClient({ id: _id, event }: Props) {
  const judul = event?.judul ?? "Empathika Goes To School"
  const subjudul = event?.subjudul
  const tanggal = event?.tanggal ?? "-"
  const waktu = event?.waktu ?? "-"
  const lokasi = event?.lokasi ?? "-"
  const tipe = event?.tipe ?? "Offline"

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800 overflow-x-hidden pb-24">
      
      {/* 1. Header Section */}
      <section className="relative w-full pt-32 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#561269] drop-shadow-sm px-6">
          {judul}
        </h1>
        {subjudul && <p className="mt-2 text-base md:text-lg text-[#7B2D8B] font-semibold">{subjudul}</p>}
        {/* Info pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          <span className="bg-[#F3E8F5] text-[#561269] text-xs font-bold px-4 py-1.5 rounded-full">{tanggal}</span>
          <span className="bg-[#F3E8F5] text-[#561269] text-xs font-bold px-4 py-1.5 rounded-full">{waktu}</span>
          <span
            className={`text-xs font-bold px-4 py-1.5 rounded-full ${
              tipe === "Offline"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {tipe}
          </span>
          {lokasi && <span className="bg-[#F3E8F5] text-[#561269] text-xs font-bold px-4 py-1.5 rounded-full">{lokasi}</span>}
        </div>
        {/* Soft decorative background element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-[#F8EFFF] to-transparent -z-10 rounded-bl-[100px]"></div>
      </section>

      {/* 2. Counselor Road To School (CRTS) */}
      <section className="relative w-full py-20 bg-white">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2">
              <div className="relative h-[300px] md:h-[400px] w-full rounded-[2rem] overflow-hidden bg-gray-100 shadow-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Counselor Road To School" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#561269] mb-6 leading-tight">
                Counselor Road To School <br className="hidden lg:block"/>(CRTS)
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bentuk Layanan:</h3>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tuntas Luka Tumbuh Cinta */}
      <section className="relative w-full py-24 bg-[#F8EFFF]/60">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#561269] mb-6 leading-tight">
                Tuntas Luka Tumbuh <br className="hidden lg:block"/>Cinta
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bentuk Layanan:</h3>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative h-[300px] md:h-[400px] w-full rounded-[2rem] overflow-hidden bg-gray-100 shadow-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Tuntas Luka Tumbuh Cinta" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dengar dengan Empathy */}
      <section className="relative w-full py-24 bg-white">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2">
              <div className="relative h-[300px] md:h-[400px] w-full rounded-[2rem] overflow-hidden bg-gray-100 shadow-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Dengar dengan Empathy" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#561269] mb-6 leading-tight">
                Dengar dengan <br className="hidden lg:block"/>Empathy
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bentuk Layanan:</h3>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Reses Caleg */}
      <section className="relative w-full py-24 bg-[#F8EFFF]/60">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#561269] mb-6 leading-tight">
                Reses Caleg
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bentuk Layanan:</h3>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
                <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#EAB308] mr-3"></span> text</li>
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative h-[300px] md:h-[400px] w-full rounded-[2rem] overflow-hidden bg-gray-100 shadow-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Reses Caleg" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
