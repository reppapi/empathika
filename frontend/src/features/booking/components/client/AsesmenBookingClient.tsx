"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { layananService, type LayananApiResponse } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"

export default function AsesmenBookingClient() {
  const searchParams = useSearchParams()
  const paketParam = searchParams.get("paket")

  const [openAccordion, setOpenAccordion] = useState<string | number | null>(null)
  const [asesmenList, setAsesmenList] = useState<LayananApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const fetchAsesmen = async () => {
    try {
      setIsLoading(true)
      setIsError(false)
      const res = await layananService.getAll({ kategori: "ASESMEN", aktif: true })
      let list = (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []).filter(
        (l: any) => l.aktif !== false && l.status !== "Nonaktif"
      )
      if (list.length === 0) {
        const local = getStoredLayanan()
          .filter((it) => it.kategoriId === "05" && it.status === "Aktif")
          .map((it) => ({
            id: String(it.id),
            nama: it.layanan,
            kategori: "ASESMEN",
            metode: it.metode,
            harga_weekday: parseInt(it.weekday.replace(/[,.]00$/, "").replace(/[^0-9]/g, "") || "0", 10),
            harga_weekend: parseInt(it.weekend.replace(/[,.]00$/, "").replace(/[^0-9]/g, "") || "0", 10),
            deskripsi: it.deskripsi,
            banner_url: it.bannerUrl,
            aktif: true,
          }))
        list = local as any
      }
      setAsesmenList(list)

      if (list.length > 0) {
        if (paketParam) {
          const matched = list.find((a: any) =>
            a.nama.toLowerCase().includes(paketParam.toLowerCase())
          )
          setOpenAccordion(matched ? matched.id : list[0].id)
        } else {
          setOpenAccordion(list[0].id)
        }
      }
    } catch (err) {
      console.warn("Backend offline, menggunakan data asesmen terdaftar:", err)
      const local = getStoredLayanan()
        .filter((it) => it.kategoriId === "05")
        .map((it) => ({
          id: String(it.id),
          nama: it.layanan,
          kategori: "ASESMEN",
          metode: it.metode,
          harga_weekday: parseInt(it.weekday.replace(/[,.]00$/, "").replace(/[^0-9]/g, "") || "0", 10),
          harga_weekend: parseInt(it.weekend.replace(/[,.]00$/, "").replace(/[^0-9]/g, "") || "0", 10),
          deskripsi: it.deskripsi,
          banner_url: it.bannerUrl,
          aktif: it.status === "Aktif",
        }))
      if (local.length > 0) {
        setAsesmenList(local as any)
        if (paketParam) {
          const matched = local.find((a: any) =>
            a.nama.toLowerCase().includes(paketParam.toLowerCase())
          )
          setOpenAccordion(matched ? matched.id : local[0].id)
        } else {
          setOpenAccordion(local[0].id)
        }
      } else {
        setIsError(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAsesmen()
  }, [paketParam])

  const toggleAccordion = (id: string | number) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  const formatRp = (num?: number | string) => {
    if (!num && num !== 0) return "-"
    const n = typeof num === "string" ? parseInt(num.replace(/[^0-9]/g, "") || "0", 10) : num
    return `Rp ${n.toLocaleString("id-ID")}`
  }

  return (
    <div className="relative min-h-screen w-full font-poppins pb-24 overflow-hidden">
      {/* Background Shape & Hero Section */}
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

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[900px] px-6 mt-8 sm:mt-12 relative z-10">
        {/* Banner Error jika Backend Gagal */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-red-700 text-sm font-medium">
              ⚠️ Gagal memuat daftar asesmen. Silakan periksa koneksi Anda dan coba lagi.
            </div>
            <button
              onClick={fetchAsesmen}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {/* Title Daftar Harga */}
        <h2 className="text-left text-xl font-extrabold text-[#561269] mb-6 drop-shadow-sm">
          Daftar Harga
        </h2>

        {/* Card Daftar Harga */}
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
          {isLoading ? (
            <div className="py-8 flex flex-col gap-4 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 bg-gray-100 rounded-lg w-full" />
              ))}
            </div>
          ) : asesmenList.length === 0 && !isError ? (
            <div className="py-8 text-center text-gray-500 font-medium">
              Belum ada layanan asesmen yang terdaftar saat ini.
            </div>
          ) : (
            <div className="flex flex-col">
              {asesmenList.map((item) => {
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
                        <span className="[text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">{item.nama}</span>
                      </div>
                      <div className="text-center font-bold text-[#561269] text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
                        {formatRp(item.harga_weekday)}
                      </div>
                      <div className="text-center font-bold text-[#561269] text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
                        {formatRp(item.harga_weekend)}
                      </div>
                    </div>

                    {/* Accordion Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-24 opacity-100 pb-4" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-6 text-[11px] font-medium text-[#561269] pr-4 sm:w-2/3 leading-relaxed">
                        {item.deskripsi || "Layanan asesmen psikologi terstandar dan komprehensif."}
                      </div>
                    </div>

                    <hr className="border-t-2 border-[#DCD0E1]" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section Bawah / CTA */}
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
