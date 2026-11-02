"use client"

import Image from "next/image"
import Link from "next/link"
import { AdminEventData } from "@/features/event/data/adminEventData"

interface Props {
  id: string
  event?: AdminEventData
}

export default function WorkshopDetailClient({ id: _id, event }: Props) {
  const judul = event?.judul ?? "Workshop SEFT"
  const subjudul = event?.subjudul
  const tanggal = event?.tanggal ?? "-"
  const waktu = event?.waktu ?? "-"
  const lokasi = event?.lokasi ?? "-"
  const tipe = event?.tipe ?? "Online"
  const hargaNum = Number(event?.harga) || 0
  const hargaCoretNum = event?.hargaCoret ? Number(event?.hargaCoret) : 0
  const hargaTeks = hargaNum === 0 ? "Gratis" : `Rp ${hargaNum.toLocaleString("id-ID")}`
  const hargaCoretTeks = hargaCoretNum > 0 ? `Rp ${hargaCoretNum.toLocaleString("id-ID")}` : null
  const diskonPersen =
    hargaCoretNum > hargaNum && hargaCoretNum > 0
      ? Math.round(((hargaCoretNum - hargaNum) / hargaCoretNum) * 100)
      : 0

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800 overflow-x-hidden">
      
      {/* 1. Hero Section (Workshop SEFT) */}
      <section className="w-full">
        <div className="relative w-full flex flex-col md:block">
          
          {/* Mobile Text (Top) */}
          <div className="md:hidden w-full px-6 py-8 bg-gradient-to-b from-white to-[#F8EFFF]">
            <h1 className="text-4xl font-extrabold text-[#561269] mb-4 leading-tight">
              {judul}
            </h1>
            {subjudul && <p className="text-sm font-semibold text-[#7B2D8B] mb-2">{subjudul}</p>}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#561269]">
                {tipe}
              </span>
              <span className="text-[11px] font-semibold text-gray-600">{tanggal}</span>
              {hargaCoretTeks && hargaCoretNum > hargaNum && (
                <span className="text-[11px] line-through text-gray-400">{hargaCoretTeks}</span>
              )}
              <span className="text-xs font-bold text-[#561269]">{hargaTeks}</span>
              {diskonPersen > 0 && (
                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.2 rounded-full">
                  -{diskonPersen}%
                </span>
              )}
            </div>
            <p className="text-base text-gray-700 font-medium leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-[4/3] md:aspect-[21/9]">
            <Image 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
              alt="Workshop Background" 
              fill
              className="object-cover"
              unoptimized
            />
            {/* Desktop Gradient overlay from left (white) to transparent right */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent w-2/3"></div>
            
            {/* Desktop Text Overlay */}
            <div className="hidden md:flex absolute inset-0 items-center">
              <div className="w-full max-w-[1200px] mx-auto px-6">
                <div className="w-1/2 pr-8">
                  <h1 className="text-5xl lg:text-[4rem] xl:text-[5rem] font-extrabold text-[#561269] mb-3 leading-tight drop-shadow-sm">
                    {judul}
                  </h1>
                  {subjudul && <p className="text-base font-semibold text-[#7B2D8B] mb-2">{subjudul}</p>}
                  <div className="flex flex-wrap items-center gap-2.5 mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      tipe === "Offline" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {tipe}
                    </span>
                    <span className="text-xs font-semibold text-gray-600 bg-white/80 px-2.5 py-1 rounded-full shadow-2xs">
                      {tanggal} • {waktu}
                    </span>
                    <div className="inline-flex items-center gap-1.5 bg-[#561269] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {hargaCoretTeks && hargaCoretNum > hargaNum && (
                        <span className="line-through text-white/60 text-[11px]">{hargaCoretTeks}</span>
                      )}
                      <span>{hargaTeks}</span>
                      {diskonPersen > 0 && (
                        <span className="bg-yellow-400 text-black text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                          -{diskonPersen}%
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-lg xl:text-xl text-gray-700 font-medium leading-relaxed max-w-lg">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Second Section (Text on Right, Purple Overlay) */}
      <section className="w-full">
        <div className="relative w-full flex flex-col-reverse md:block">
          
          {/* Mobile Text (Bottom) */}
          <div className="md:hidden w-full px-6 py-8 bg-gradient-to-t from-white to-[#F8EFFF]">
            <p className="text-base text-gray-700 font-medium leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-[4/3] md:aspect-[21/9]">
            <Image 
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
              alt="Workshop Background 2" 
              fill
              className="object-cover"
              unoptimized
            />
            {/* Desktop Gradient overlay from right (purple) to transparent left */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-l from-[#561269]/95 via-[#561269]/80 to-transparent w-full"></div>
            
            {/* Desktop Text Overlay */}
            <div className="hidden md:flex absolute inset-0 items-center">
              <div className="w-full max-w-[1200px] mx-auto px-6 flex justify-end">
                <div className="w-1/2 pl-8 text-right">
                  <p className="text-lg lg:text-xl text-white font-medium leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mind Record */}
      <section className="relative w-full py-20 bg-[#F8EFFF]">
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#561269] text-center mb-16">
            Mind Record
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 relative h-[300px] md:h-[450px]">
              <Image 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Mind Record" 
                fill 
                className="object-cover rounded-2xl shadow-xl hover:scale-[1.02] transition-transform duration-500"
                unoptimized
              />
            </div>
            <div className="w-full md:w-1/2">
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AMTR (A Moment To Remember) */}
      <section className="relative w-full py-24 bg-white">
        <div className="w-full max-w-[1200px] mx-auto px-6 mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#561269] text-right">
            AMTR (A Moment To <br /> Remember)
          </h2>
        </div>
        
        <div className="relative w-full h-[50vh] min-h-[400px] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
              alt="AMTR" 
              fill 
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-white/60"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex justify-end">
            <div className="md:w-1/2 bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-lg border border-white/50">
              <p className="text-lg text-gray-900 leading-relaxed font-semibold text-right">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. workshop Empty Chair */}
      <section className="relative w-full py-24 bg-gradient-to-b from-white to-[#F8EFFF]">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#561269] mb-8">
                workshop Empty Chair
              </h2>
              <p className="text-lg text-gray-800 leading-relaxed font-medium">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden shadow-2xl ring-8 ring-white">
                <Image 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Empty Chair" 
                  fill 
                  className="object-cover hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. workshop Helper */}
      <section className="relative w-full py-24 mt-10 bg-[#561269]">
        
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <div className="relative h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/20">
                <Image 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Workshop Helper" 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-right">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">
                workshop Helper
              </h2>
              <p className="text-lg text-white/90 leading-relaxed font-medium">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Helper (Bottom Section) */}
      <section className="relative w-full py-24 bg-white mt-12">
        <div className="w-full max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#561269] mb-8">
            Helper
          </h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium max-w-4xl mx-auto mb-16">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          
          <div className="relative w-full h-[40vh] md:h-[60vh] rounded-3xl overflow-hidden shadow-xl">
            <Image 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
              alt="Helper Team" 
              fill 
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* 8. CTA Footer */}
      <section className="relative w-full py-20 bg-[#F8EFFF]">
        <div className="w-full max-w-[800px] mx-auto px-6 text-center">
          <p className="text-xl md:text-2xl text-[#561269] font-bold mb-10 leading-relaxed">
            Tertarik untuk mengadakan program kolaborasi ini di sekolah, kampus, institusi, atau komunitas kamu?
          </p>
          <Link 
            href="/kerja-sama" 
            className="inline-flex items-center justify-center bg-[#EAB308] hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-full shadow-lg transition-transform hover:scale-105"
          >
            Hubungi kami sekarang 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

    </div>
  )
}
