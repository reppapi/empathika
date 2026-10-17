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
          Daftar Harga
        </h2>

        {/* Card Daftar Harga (3 Kolom persis Konsultasi) */}
        <div className="bg-white rounded-[1.5rem] shadow-sm p-6 sm:p-10 mb-16 border border-gray-100">
          {/* Header */}
          <div className="grid grid-cols-3 text-center mb-4">
            <div className="text-left font-extrabold text-[#561269] text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
              Asesmen
            </div>
            <div className="font-extrabold text-[#561269] text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
              Weekday
            </div>
            <div className="font-extrabold text-[#561269] text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
              Weekend
            </div>
          </div>

          <hr className="border-t-2 border-[#DCD0E1]" />

          {/* Rows */}
          <div className="flex flex-col">
            {DAFTAR_HARGA_ASESMEN.map((item) => {
              const isOpen = openAccordion === item.id
              return (
                <div key={item.id} className="flex flex-col">
                  <div
                    className="grid grid-cols-3 items-center py-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleAccordion(item.id)}
                  >
                    <div className="flex items-center gap-2 font-bold text-[#561269] text-[15px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                      <span className="[text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">{item.title}</span>
                    </div>
                    <div className="text-center font-bold text-[#561269] text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
                      {item.weekday}
                    </div>
                    <div className="text-center font-bold text-[#561269] text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
                      {item.weekend}
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-24 opacity-100 pb-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-6 text-[11px] font-medium text-[#561269] pr-4 sm:w-2/3 leading-relaxed">
                      {item.description}
                    </div>
                  </div>

                  <hr className="border-t-2 border-[#DCD0E1]" />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Section Bawah / CTA (Persis seperti di bawah profil psikolog) */}
      <section className="w-full bg-[#EAEAEA] py-16 sm:py-24 px-4 sm:px-6 mt-16 sm:mt-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3B074B] leading-tight">
            Satu cerita bisa menjadi awal dari perubahan.
            <br />
            Mulai konsultasimu hari ini.
          </h2>

          <div>
            <Link
              href={"/konseling/jadwal?layanan=asesmen" as any}
              className="inline-block bg-[#EAB308] hover:bg-[#CA9A06] text-black font-bold text-base sm:text-lg md:text-xl px-10 sm:px-14 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Daftar Sesi
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
