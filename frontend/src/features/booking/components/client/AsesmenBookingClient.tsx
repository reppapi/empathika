"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const DAFTAR_HARGA_ASESMEN = [
  {
    id: "asesmen-minat-bakat",
    title: "Asesmen Minat Bakat",
    weekday: "Rp 400.000",
    weekend: "Rp 500.000",
    description:
      "Rangkaian asesmen komprehensif untuk memetakan potensi akademik, bakat karier, dan profil kecenderungan minat individu secara terstandar.",
  },
  {
    id: "asesmen-kesiapan-sekolah",
    title: "Asesmen Kesiapan Sekolah",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    description:
      "Pemeriksaan psikologis perkembangan anak untuk mengukur kematangan kognitif, motorik, dan emosional dalam memasuki jenjang sekolah formal.",
  },
  {
    id: "asesmen-klinis",
    title: "Asesmen Klinis",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    description:
      "Evaluasi psikologis mendalam untuk mengidentifikasi kondisi klinis, regulasi emosi, kecemasan, dan kesehatan mental secara menyeluruh.",
  },
]

export default function AsesmenBookingClient() {
  const searchParams = useSearchParams()
  const paketParam = searchParams.get("paket")

  const [openAccordion, setOpenAccordion] = useState<string | null>("asesmen-minat-bakat")

  useEffect(() => {
    if (paketParam) {
      const matched = DAFTAR_HARGA_ASESMEN.find(
        (a) => a.title.toLowerCase() === paketParam.toLowerCase()
      )
      if (matched) {
        setOpenAccordion(matched.id)
      }
    }
  }, [paketParam])

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  return (
    <div className="relative min-h-screen w-full font-poppins pb-24 overflow-hidden">
      {/* Background Shape & Hero Section (Persis Konsultasi) */}
      <div className="w-full overflow-hidden">
        <div
          className="w-full pt-28 sm:pt-32 pb-16 sm:pb-20 bg-gradient-to-b from-[#8B3A9C] via-[#651877] to-[#400B4D] shadow-md text-center px-4 sm:px-6 lg:px-8 transition-all duration-300 [border-bottom-left-radius:50%_60px] [border-bottom-right-radius:50%_60px] sm:[border-bottom-left-radius:50%_80px] sm:[border-bottom-right-radius:50%_80px] lg:[border-bottom-left-radius:50%_120px] lg:[border-bottom-right-radius:50%_120px]"
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-tight">
              Jadwalkan Layanan Asesmen Anda
            </h1>
            <p className="mt-2 text-purple-200 text-xs sm:text-sm lg:text-base max-w-xl mx-auto font-light">
              Pilih paket asesmen psikologis terstandar bersama tim profesional Empathika.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content (Desain persis seperti booking konsultasi) */}
      <div className="mx-auto w-full max-w-[900px] px-6 mt-8 sm:mt-12 relative z-10">
        {/* Title Daftar Harga */}
        <h2 className="text-left text-xl font-extrabold text-[#561269] mb-6 drop-shadow-sm">
          Daftar Harga Asesmen
        </h2>

        {/* Card Daftar Harga */}
        <div className="bg-white rounded-[1.5rem] shadow-sm p-6 sm:p-10 mb-12 border border-gray-100">
          {/* Header */}
          <div className="grid grid-cols-12 text-center mb-4 items-center">
            <div className="col-span-5 text-left font-extrabold text-[#561269] text-[15px] sm:text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
              Layanan Asesmen
            </div>
            <div className="col-span-2 font-extrabold text-[#561269] text-[14px] sm:text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
              Weekday
            </div>
            <div className="col-span-2 font-extrabold text-[#561269] text-[14px] sm:text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
              Weekend
            </div>
            <div className="col-span-3 text-right pr-2 font-extrabold text-[#561269] text-[14px] sm:text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
              Aksi
            </div>
          </div>

          <hr className="border-t-2 border-[#DCD0E1]" />

          {/* Rows */}
          <div className="flex flex-col">
            {DAFTAR_HARGA_ASESMEN.map((item) => {
              const isOpen = openAccordion === item.id
              return (
                <div key={item.id} className="flex flex-col">
                  <div className="grid grid-cols-12 items-center py-5 gap-1">
                    <div
                      className="col-span-5 flex items-center gap-2 font-bold text-[#561269] text-[14px] sm:text-[15px] cursor-pointer"
                      onClick={() => toggleAccordion(item.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className={`h-3.5 w-3.5 transition-transform duration-300 shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                      <span className="[text-shadow:2px_2px_4px_rgba(0,0,0,0.3)] leading-snug">
                        {item.title}
                      </span>
                    </div>
                    <div className="col-span-2 text-center font-bold text-[#561269] text-[13px] sm:text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
                      {item.weekday}
                    </div>
                    <div className="col-span-2 text-center font-bold text-[#561269] text-[13px] sm:text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
                      {item.weekend}
                    </div>
                    <div className="col-span-3 text-right">
                      <Link
                        href={
                          `/konseling/jadwal?layanan=asesmen&paket=${encodeURIComponent(
                            item.title
                          )}` as any
                        }
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-4 sm:px-6 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all transform active:scale-95"
                      >
                        <span>Daftar</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-24 opacity-100 pb-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-6 text-[11px] sm:text-xs font-medium text-[#561269] pr-4 max-w-2xl leading-relaxed">
                      {item.description}
                    </div>
                  </div>

                  <hr className="border-t-2 border-[#DCD0E1]" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Informasi Penugasan Asesor (Pengganti list psikolog) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-[#561269]">
              Asesor Psikolog Terverifikasi
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-relaxed">
              Untuk layanan Asesmen, psikolog / asesor terstandar akan ditugaskan langsung oleh Empathika sesuai dengan bidang kebutuhan asesmen yang Anda pilih pada tahap penjadwalan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
