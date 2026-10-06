"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { DATA_PSIKOLOG_DUMMY } from "@/features/psikolog/dummy"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

const DAFTAR_HARGA = [
  {
    id: "psikolog",
    title: "Psikolog",
    weekday: "Rp. 350.000",
    weekend: "Rp. 450.000",
    description: "Psikolog adalah tenaga profesional yang memiliki kewenangan untuk melakukan asesmen dan memberikan intervensi klinis.",
  },
  {
    id: "konselor",
    title: "Konselor",
    weekday: "Rp. 350.000",
    weekend: "Rp. 450.000",
    description: "Konselor adalah lorem ipsum dolor sit amet.",
  },
  {
    id: "peer",
    title: "Peer Konselor",
    weekday: "Rp. 350.000",
    weekend: "Rp. 450.000",
    description: "Peer konselor adalah teman sebaya yang dilatih untuk memberikan dukungan emosional.",
  },
]



export default function BookingPage() {
  const [openAccordion, setOpenAccordion] = useState<string | null>("konselor")
  const [activeFilter, setActiveFilter] = useState("Psikolog")

  const filters = ["Psikolog", "Konselor", "Peer Konselor"]

  const filteredProfessionals = DATA_PSIKOLOG_DUMMY.filter(
    (p) => {
      if (activeFilter === "Psikolog") return p.category === "psikolog";
      if (activeFilter === "Konselor") return p.category === "konselor" && p.tarif_per_jam > 100000;
      if (activeFilter === "Peer Konselor") return p.category === "konselor" && p.tarif_per_jam <= 100000;
      return true;
    }
  )

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  return (
    <div className="relative min-h-screen w-full font-poppins pb-24 overflow-hidden">
      
      {/* Background Shape & Hero Section (Lebih kecil dan proporsional) */}
      <div className="w-full overflow-hidden">
        <div 
          className="w-full pt-28 sm:pt-32 pb-16 sm:pb-20 bg-gradient-to-b from-[#8B3A9C] via-[#651877] to-[#400B4D] shadow-md text-center px-4 sm:px-6 lg:px-8 transition-all duration-300 [border-bottom-left-radius:50%_60px] [border-bottom-right-radius:50%_60px] sm:[border-bottom-left-radius:50%_80px] sm:[border-bottom-right-radius:50%_80px] lg:[border-bottom-left-radius:50%_120px] lg:[border-bottom-right-radius:50%_120px]"
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-tight">
              Jadwalkan Sesi Konsultasi Anda
            </h1>
            <p className="mt-2 text-purple-200 text-xs sm:text-sm lg:text-base max-w-xl mx-auto font-light">
              Temukan profesional yang tepat dan mulai perjalanan pemulihan Anda bersama Empathika.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content (Tanpa overlap, persis psikolog) */}
      <div className="mx-auto w-full max-w-[900px] px-6 mt-8 sm:mt-12 relative z-10">
        
        {/* Title Daftar Harga */}
        <h2 className="text-left text-xl font-extrabold text-[#561269] mb-6 drop-shadow-sm">
          Daftar Harga
        </h2>

        {/* Card Daftar Harga */}
        <div className="bg-white rounded-[1.5rem] shadow-sm p-6 sm:p-10 mb-16 border border-gray-100">
          
          {/* Header */}
          <div className="grid grid-cols-3 text-center mb-4">
            <div className="text-left font-extrabold text-[#561269] text-[17px]">Konsultasi</div>
            <div className="font-extrabold text-[#561269] text-[17px]">Weekday</div>
            <div className="font-extrabold text-[#561269] text-[17px]">Weekend</div>
          </div>

          <hr className="border-t-2 border-[#DCD0E1]" />

          {/* Rows */}
          <div className="flex flex-col">
            {DAFTAR_HARGA.map((item, idx) => {
              const isOpen = openAccordion === item.id;
              return (
                <div key={item.id} className="flex flex-col">
                  <div 
                    className="grid grid-cols-3 items-center py-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleAccordion(item.id)}
                  >
                    <div className="flex items-center gap-2 font-bold text-[#561269] text-[15px]">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" 
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                      {item.title}
                    </div>
                    <div className="text-center font-bold text-[#561269] text-[14px]">{item.weekday}</div>
                    <div className="text-center font-bold text-[#561269] text-[14px]">{item.weekend}</div>
                  </div>
                  
                  {/* Accordion Content */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-20 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-6 text-[11px] font-medium text-[#561269] pr-4 sm:w-1/2">
                      {item.description}
                    </div>
                  </div>
                  
                  <hr className="border-t-2 border-[#DCD0E1]" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-10 flex justify-center gap-3 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm ${
                activeFilter === f 
                  ? "bg-[#561269] text-white" 
                  : "bg-white text-[#561269] hover:bg-[#561269]/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Dynamic Grid Professionals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[400px]">
          {filteredProfessionals.map((doc, i) => (
            <DoctorCard key={i} doctor={doc} />
          ))}
        </div>

      </div>
    </div>
  )
}

function DoctorCard({ doctor }: { doctor: any }) {
  const peran = doctor.spesialisasi?.nama || (doctor.category === "konselor" ? "Konselor" : "Psikolog")
  const labelJadwal = doctor.labelJadwal || "Jadwal Terdekat"
  const jadwalList = doctor.jadwalTersedia || []
  const keahlianList = doctor.keahlian || []
  const initial = doctor.nama_gelar ? doctor.nama_gelar.charAt(0) : "P"

  return (
    <Card className="p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 h-full flex flex-col justify-between border-gray-100 bg-white rounded-3xl group">
      <div>
        {/* Header Profil (Foto & Info Utama) */}
        <div className="flex gap-4 items-start">
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 border border-purple-100 bg-purple-50 shadow-sm">
            {doctor.foto ? (
              <Image 
                src={doctor.foto} 
                alt={doctor.nama_gelar} 
                fill 
                sizes="72px"
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#8B3A9C] to-[#561269] text-white flex items-center justify-center font-bold text-2xl select-none">
                {initial}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[#007EA7] text-xs sm:text-sm font-semibold tracking-wide uppercase truncate">
              {peran}
            </p>
            <h3 className="text-gray-900 font-bold text-base sm:text-lg leading-snug group-hover:text-[#6B2FA0] transition-colors line-clamp-2">
              {doctor.nama_gelar}
            </h3>
          </div>
        </div>

        {/* Spesialisasi & Pendidikan Badge */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {doctor.spesialisasi?.nama && (
            <Badge variant="info" className="text-xs font-medium">
              {doctor.spesialisasi.nama}
            </Badge>
          )}
          {doctor.pendidikanText && (
            <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium text-purple-900 bg-purple-50 rounded-full border border-purple-100 truncate max-w-[210px]">
              {doctor.pendidikanText}
            </span>
          )}
        </div>

        {/* Area Keahlian / Bidang */}
        {keahlianList.length > 0 && (
          <div className="mt-3.5 space-y-1.5">
            <p className="text-[11px] font-bold text-[#561269] uppercase tracking-wider">
              Fokus Keahlian
            </p>
            <div className="flex flex-wrap gap-1.5">
              {keahlianList.slice(0, 4).map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-block bg-[#FAF5FD] hover:bg-[#F3E8FC] text-[#561269] text-xs font-medium px-2.5 py-1 rounded-lg border border-purple-100 transition-colors"
                >
                  {item}
                </span>
              ))}
              {keahlianList.length > 4 && (
                <span className="inline-block bg-gray-50 text-gray-500 text-xs font-medium px-2 py-1 rounded-lg border border-gray-100">
                  +{keahlianList.length - 4} lainnya
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sesi */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 text-xs sm:text-sm font-medium text-gray-700">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
            <svg className="w-4 h-4 text-[#561269]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            <span>{doctor.jumlah_sesi}+ Sesi</span>
          </div>
        </div>

        <hr className="my-4 border-gray-100" />

        {/* Jadwal Terdekat */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{labelJadwal}</p>
          {jadwalList.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {jadwalList.map((jadwal: any, idx: number) => (
                <span 
                  key={idx} 
                  className="bg-purple-50/70 border border-purple-100/60 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700"
                >
                  {jadwal.waktu}{" "}
                  <span className={jadwal.tipe === "online" ? "text-[#007EA7] font-semibold" : "text-rose-600 font-semibold"}>
                    ({jadwal.tipe})
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Jadwal belum tersedia</span>
          )}
        </div>
      </div>

      {/* Footer Card: Aksi */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <Link 
          href={`/psikolog/${doctor.id}`}
          className="block w-full text-center bg-[#EAB308] text-black hover:bg-[#CA9A06] transition-colors px-6 py-2.5 rounded-full text-xs font-bold shadow-sm"
        >
          Daftar
        </Link>
      </div>
    </Card>
  )
}
