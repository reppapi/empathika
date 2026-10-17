"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { DATA_PSIKOLOG_DUMMY } from "@/features/psikolog/dummy"
import { PsikologCard } from "@/features/psikolog/components/client/PsikologCard"

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
    description: "Konselor adalah tenaga ahli yang membantu menyelesaikan permasalahan pribadi, relasi, dan adaptasi sosial.",
  },
  {
    id: "peer",
    title: "Peer Konselor",
    weekday: "Rp. 350.000",
    weekend: "Rp. 450.000",
    description: "Peer konselor adalah teman sebaya yang dilatih untuk memberikan dukungan emosional tanpa penghakiman.",
  },
]

const DAFTAR_HARGA_ASESMEN = [
  {
    id: "asesmen-minat-bakat",
    title: "Asesmen Minat Bakat",
    weekday: "Rp 400.000",
    weekend: "Rp 500.000",
    description: "Rangkaian asesmen komprehensif untuk memetakan potensi akademik, bakat karier, dan profil kecenderungan minat individu secara terstandar.",
  },
  {
    id: "asesmen-kesiapan-sekolah",
    title: "Asesmen Kesiapan Sekolah",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    description: "Pemeriksaan psikologis perkembangan anak untuk mengukur kematangan kognitif, motorik, dan emosional dalam memasuki jenjang sekolah formal.",
  },
  {
    id: "asesmen-klinis",
    title: "Asesmen Klinis",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    description: "Evaluasi psikologis mendalam untuk mengidentifikasi kondisi klinis, regulasi emosi, kecemasan, dan kesehatan mental secara menyeluruh.",
  },
]

export default function BookingClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const typeParam = searchParams.get("type")
  const paketParam = searchParams.get("paket")

  const [serviceType, setServiceType] = useState<"konsultasi" | "asesmen">(
    typeParam === "asesmen" ? "asesmen" : "konsultasi"
  )
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    typeParam === "asesmen" ? "asesmen-minat-bakat" : "psikolog"
  )
  const [activeFilter, setActiveFilter] = useState("Psikolog")

  useEffect(() => {
    if (typeParam === "asesmen") {
      setServiceType("asesmen")
      if (paketParam) {
        const matched = DAFTAR_HARGA_ASESMEN.find(
          (a) => a.title.toLowerCase() === paketParam.toLowerCase()
        )
        if (matched) setOpenAccordion(matched.id)
      } else {
        setOpenAccordion("asesmen-minat-bakat")
      }
    } else if (typeParam === "konsultasi") {
      setServiceType("konsultasi")
    }
  }, [typeParam, paketParam])

  const handleTabChange = (type: "konsultasi" | "asesmen") => {
    setServiceType(type)
    setOpenAccordion(type === "asesmen" ? "asesmen-minat-bakat" : "psikolog")
    router.replace(`/booking?type=${type}` as any, { scroll: false })
  }

  const filters = ["Psikolog", "Konselor", "Peer Konselor"]

  const filteredProfessionals = DATA_PSIKOLOG_DUMMY.filter((p) => {
    if (activeFilter === "Psikolog") return p.category === "psikolog"
    if (activeFilter === "Konselor") return p.category === "konselor"
    if (activeFilter === "Peer Konselor") return p.category === "peer-konselor"
    return true
  })

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  const isAsesmen = serviceType === "asesmen"

  return (
    <div className="relative min-h-screen w-full font-poppins pb-24 overflow-hidden">
      {/* Background Shape & Hero Section */}
      <div className="w-full overflow-hidden">
        <div
          className="w-full pt-28 sm:pt-32 pb-16 sm:pb-20 bg-gradient-to-b from-[#8B3A9C] via-[#651877] to-[#400B4D] shadow-md text-center px-4 sm:px-6 lg:px-8 transition-all duration-300 [border-bottom-left-radius:50%_60px] [border-bottom-right-radius:50%_60px] sm:[border-bottom-left-radius:50%_80px] sm:[border-bottom-right-radius:50%_80px] lg:[border-bottom-left-radius:50%_120px] lg:[border-bottom-right-radius:50%_120px]"
        >
          <div className="max-w-4xl mx-auto">
            {/* Segmented Control Switcher */}
            <div className="inline-flex items-center p-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mb-5">
              <button
                type="button"
                onClick={() => handleTabChange("konsultasi")}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  !isAsesmen
                    ? "bg-white text-[#561269] shadow-md"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Konsultasi
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("asesmen")}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  isAsesmen
                    ? "bg-white text-[#561269] shadow-md"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Asesmen
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-tight">
              {isAsesmen ? "Jadwalkan Sesi Asesmen Anda" : "Jadwalkan Sesi Konsultasi Anda"}
            </h1>
            <p className="mt-2 text-purple-200 text-xs sm:text-sm lg:text-base max-w-xl mx-auto font-light">
              {isAsesmen
                ? "Pilih paket evaluasi psikologis terstandar untuk minat bakat, kesiapan sekolah, dan asesmen klinis."
                : "Temukan profesional yang tepat dan mulai perjalanan pemulihan Anda bersama Empathika."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[960px] px-4 sm:px-6 mt-8 sm:mt-12 relative z-10">
        {/* Title Daftar Harga */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-left text-xl font-extrabold text-[#561269] drop-shadow-sm">
            {isAsesmen ? "Daftar Harga & Paket Asesmen" : "Daftar Harga Konsultasi"}
          </h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-[#561269]">
            {isAsesmen ? "Paket Terstandar" : "Pilihan Psikolog"}
          </span>
        </div>

        {/* Card Daftar Harga */}
        <div className="bg-white rounded-[1.5rem] shadow-sm p-5 sm:p-8 mb-12 border border-gray-100">
          {/* Header */}
          <div className="grid grid-cols-12 text-center mb-4 items-center gap-2">
            <div className="col-span-5 sm:col-span-5 text-left font-extrabold text-[#561269] text-[15px] sm:text-[17px]">
              {isAsesmen ? "Layanan Asesmen" : "Konsultasi"}
            </div>
            <div className="col-span-2 sm:col-span-2 font-extrabold text-[#561269] text-[13px] sm:text-[16px]">
              Weekday
            </div>
            <div className="col-span-2 sm:col-span-2 font-extrabold text-[#561269] text-[13px] sm:text-[16px]">
              Weekend
            </div>
            <div className="col-span-3 sm:col-span-3 text-right pr-2 font-extrabold text-[#561269] text-[13px] sm:text-[16px]">
              Aksi
            </div>
          </div>

          <hr className="border-t-2 border-[#DCD0E1]" />

          {/* Rows: Asesmen Flow */}
          {isAsesmen ? (
            <div className="flex flex-col">
              {DAFTAR_HARGA_ASESMEN.map((item) => {
                const isOpen = openAccordion === item.id
                return (
                  <div key={item.id} className="flex flex-col">
                    <div className="grid grid-cols-12 items-center py-5 gap-2">
                      <div
                        className="col-span-5 sm:col-span-5 flex items-center gap-2 font-bold text-[#561269] text-[14px] sm:text-[15px] cursor-pointer"
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
                        <span className="leading-snug">{item.title}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-2 text-center font-bold text-[#561269] text-[12px] sm:text-[14px]">
                        {item.weekday}
                      </div>
                      <div className="col-span-2 sm:col-span-2 text-center font-bold text-[#561269] text-[12px] sm:text-[14px]">
                        {item.weekend}
                      </div>
                      <div className="col-span-3 sm:col-span-3 text-right">
                        <Link
                          href={
                            `/konseling/jadwal?layanan=asesmen&paket=${encodeURIComponent(
                              item.title
                            )}` as any
                          }
                          className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all transform active:scale-95"
                        >
                          Daftar
                        </Link>
                      </div>
                    </div>

                    {/* Accordion Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-24 opacity-100 pb-4" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-6 text-[11px] sm:text-xs font-medium text-gray-600 pr-4 max-w-2xl leading-relaxed">
                        {item.description}
                      </div>
                    </div>

                    <hr className="border-t border-[#EDE0F2]" />
                  </div>
                )
              })}
            </div>
          ) : (
            /* Rows: Konsultasi Flow */
            <div className="flex flex-col">
              {DAFTAR_HARGA.map((item) => {
                const isOpen = openAccordion === item.id
                return (
                  <div key={item.id} className="flex flex-col">
                    <div
                      className="grid grid-cols-12 items-center py-5 cursor-pointer hover:bg-gray-50/50 transition-colors gap-2"
                      onClick={() => toggleAccordion(item.id)}
                    >
                      <div className="col-span-5 sm:col-span-5 flex items-center gap-2 font-bold text-[#561269] text-[14px] sm:text-[15px]">
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
                        <span>{item.title}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-2 text-center font-bold text-[#561269] text-[12px] sm:text-[14px]">
                        {item.weekday}
                      </div>
                      <div className="col-span-2 sm:col-span-2 text-center font-bold text-[#561269] text-[12px] sm:text-[14px]">
                        {item.weekend}
                      </div>
                      <div className="col-span-3 sm:col-span-3 text-right">
                        <span className="text-[11px] text-[#561269] font-semibold underline">
                          Pilih di bawah ↓
                        </span>
                      </div>
                    </div>

                    {/* Accordion Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-24 opacity-100 pb-4" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-6 text-[11px] sm:text-xs font-medium text-gray-600 pr-4 max-w-2xl leading-relaxed">
                        {item.description}
                      </div>
                    </div>

                    <hr className="border-t border-[#EDE0F2]" />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Conditional Bottom Section: Asesmen Info Banner vs Konsultasi Psychologist Grid */}
        {isAsesmen ? (
          /* Asesmen Info Card (NO LIST OF PSYCHOLOGISTS) */
          <div className="bg-gradient-to-r from-purple-50 via-purple-50/50 to-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#561269] text-white flex items-center justify-center shrink-0 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-7 h-7 text-yellow-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-base sm:text-lg text-[#561269]">
                Penugasan Asesor Psikolog Terverifikasi
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                Untuk layanan Asesmen, psikolog / asesor terstandar akan ditugaskan langsung oleh Empathika sesuai dengan bidang asesmen dan ketersediaan jadwal yang Anda tentukan di langkah berikutnya.
              </p>
            </div>
          </div>
        ) : (
          /* Konsultasi Psychologist Filter & Grid */
          <>
            <div className="mb-8 flex justify-center gap-3 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm ${
                    activeFilter === f
                      ? "bg-[#561269] text-white shadow-md"
                      : "bg-white text-[#561269] hover:bg-[#561269]/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[400px]">
              {filteredProfessionals.map((doc, i) => (
                <PsikologCard key={i} psikolog={doc} mode="konseling" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

