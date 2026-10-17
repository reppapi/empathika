"use client"

import Image from "next/image"
import { AdminEventData } from "@/features/event/data/adminEventData"

interface Props {
  id: string
  event?: AdminEventData
}

export default function EventDetailClient({ id: _id, event }: Props) {
  const judul = event?.judul ?? "Seminar Empathika"
  const subjudul = event?.subjudul
  const tanggal = event?.tanggal ?? "-"
  const waktu = event?.waktu ?? "-"
  const lokasi = event?.lokasi ?? "-"
  const deskripsi = event?.deskripsi ?? ""

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F3E8F5] to-[#B583C2] font-poppins pb-10">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Event Background" 
            fill 
            className="object-cover"
            unoptimized
          />
          {/* Overlay purple */}
          <div className="absolute inset-0 bg-[#561269]/40 mix-blend-multiply"></div>
          {/* Top gradient for navbar blending if needed */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#561269] to-transparent opacity-90"></div>
          
          {/* Bottom diagonal shape if we want to match exactly, but based on image it's a soft gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 mt-8">
          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white drop-shadow-md">
            {judul}
          </h1>
          {subjudul && (
            <p className="mt-3 text-lg md:text-xl text-white/90 font-medium drop-shadow">{subjudul}</p>
          )}
        </div>
      </div>

      {/* Middle Text Section */}
      <div className="w-full max-w-[900px] mx-auto px-6 py-12 md:py-20 text-center relative z-10">
        {deskripsi ? (
          <p className="text-[16px] md:text-[20px] text-gray-900 leading-[1.8] font-medium">{deskripsi}</p>
        ) : (
          <p className="text-[16px] md:text-[20px] text-gray-900 leading-[1.8] font-medium">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        )}
        {/* Info pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <span className="bg-[#F3E8F5] text-[#561269] text-xs font-bold px-4 py-1.5 rounded-full">{tanggal}</span>
          <span className="bg-[#F3E8F5] text-[#561269] text-xs font-bold px-4 py-1.5 rounded-full">{waktu}</span>
          {lokasi && <span className="bg-[#F3E8F5] text-[#561269] text-xs font-bold px-4 py-1.5 rounded-full">{lokasi}</span>}
        </div>
      </div>

      {/* Split Section */}
      <div className="w-full max-w-[1100px] mx-auto px-6 pb-20 relative z-10 mt-8">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="w-full md:w-1/2">
            <p className="text-[16px] md:text-[20px] text-gray-900 leading-[1.8] font-medium text-left">
              Lorem ipsum dolor sit amet, <br />
              consectetur adipiscing elit. Sed <br />
              do eiusmod tempor incididunt ut <br />
              labore et dolore magna aliqua. <br />
              Ut enim ad minim veniam, quis <br />
              nostrud exercitation ullamco <br />
              laboris nisi ut aliquip ex ea <br />
              commodo consequat.
            </p>
          </div>
          <div className="w-full md:w-1/2 relative h-[250px] md:h-[350px]">
            <Image 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Event Preview" 
              fill 
              className="object-cover shadow-lg"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  )
}
