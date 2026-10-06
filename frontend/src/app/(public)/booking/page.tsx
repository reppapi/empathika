"use client"

import { useState } from "react"
import Link from "next/link"

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

const ALL_PROFESSIONALS = [
  ...Array(6).fill({
    name: "Nama, M.Psi.,\nPsikolog",
    sessions: "99+ sesi",
    role: "Psikolog"
  }),
  ...Array(3).fill({
    name: "Nama, M.Psi.,\nKonselor", 
    sessions: "99+ sesi",
    role: "Konselor"
  }),
  ...Array(3).fill({
    name: "Nama,\nPeer Konselor", 
    sessions: "50+ sesi",
    role: "Peer Konselor"
  })
]

export default function BookingPage() {
  const [openAccordion, setOpenAccordion] = useState<string | null>("konselor")
  const [activeFilter, setActiveFilter] = useState("Psikolog")

  const filters = ["Psikolog", "Konselor", "Peer Konselor"]

  const filteredProfessionals = ALL_PROFESSIONALS.filter(
    (p) => p.role === activeFilter
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[400px]">
          {filteredProfessionals.map((doc, i) => (
            <DoctorCard key={i} doctor={doc} />
          ))}
        </div>

      </div>
    </div>
  )
}

function DoctorCard({ doctor }: { doctor: any }) {
  return (
    <div className="flex flex-col items-center bg-[#F9F4FA] rounded-[2rem] p-8 pb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow border border-[#f0e6f2]">
      {/* Avatar Placeholder */}
      <div className="h-[90px] w-[90px] rounded-full bg-[#D5BCE1] mb-5"></div>
      
      {/* Pill */}
      <div className="bg-[#FCE163] text-black px-4 py-1 rounded-full text-[10px] font-bold mb-4 shadow-sm">
        {doctor.sessions}
      </div>
      
      {/* Name */}
      <div className="text-center text-[12px] font-bold text-black whitespace-pre-line mb-6 h-8 leading-relaxed">
        {doctor.name}
      </div>
      
      {/* Button */}
      <Link 
        href="/konseling/jadwal"
        className="bg-[#FCE163] text-black hover:bg-[#FACC15] transition-colors px-8 py-1.5 rounded-full text-[11px] font-bold shadow-sm"
      >
        Daftar
      </Link>
    </div>
  )
}
