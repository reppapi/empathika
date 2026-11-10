"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTenantContext } from "@/context/TenantContext"
import { layananService, type LayananApiResponse } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import ClientErrorState from "@/components/shared/ClientErrorState"

const CARD_THEMES = [
  {
    bgColor: "bg-[#f48520]",
    titleColor: "text-white",
    shape: "circles",
  },
  {
    bgColor: "bg-[#f0d164]",
    titleColor: "text-gray-900",
    shape: "circles-dark",
  },
  {
    bgColor: "bg-[#e31e3d]",
    titleColor: "text-white",
    shape: "heart",
  },
  {
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    shape: "circles",
  },
]

export default function KonselingClient() {
  const { isBiro, biroProfile, withBiro } = useTenantContext()
  const [layananList, setLayananList] = useState<LayananApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const fetchLayanan = async () => {
    try {
      setIsLoading(true)
      setIsError(false)
      const res = await layananService.getAll({ kategori: "KONSULTASI" })
      const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      const activeOnly = raw.filter((l: any) => l.aktif !== false && l.status !== "Nonaktif")
      setLayananList(activeOnly)
    } catch (err) {
      console.error("Gagal mengambil data layanan konsultasi:", err)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLayanan()

    const handleSync = () => {
      fetchLayanan()
    }

    window.addEventListener("focus", handleSync)
    window.addEventListener("storage", handleSync)

    return () => {
      window.removeEventListener("focus", handleSync)
      window.removeEventListener("storage", handleSync)
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-32 pb-12 lg:pt-36 lg:pb-20 font-poppins">
      {/* Judul Utama */}
      <h1 className="mb-8 text-center text-2xl font-bold text-[#561269] sm:text-3xl lg:mb-12 lg:text-[32px]">
        {isBiro && biroProfile?.nama_biro
          ? `Mulai jadwalkan konsultasi dengan ${biroProfile.nama_biro}!`
          : "Mulai jadwalkan konsultasi dengan kami!"}
      </h1>

      {/* Banner Error jika Backend Gagal */}
      {isError && (
        <div className="mb-8">
          <ClientErrorState
            onRetry={fetchLayanan}
            isRetrying={isLoading}
          />
        </div>
      )}

      {/* Container Putih */}
      <div className="rounded-2xl border border-gray-300 bg-white p-6 sm:p-8 lg:p-12 shadow-[0px_4px_16px_rgba(0,0,0,0.1)]">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm animate-pulse flex flex-col h-[380px]"
              >
                <div className="h-44 bg-gray-200 w-full" />
                <div className="p-6 flex flex-col flex-1 gap-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="mt-auto h-10 bg-gray-200 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : layananList.length === 0 && !isError ? (
          /* Empty / Inactive State */
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Layanan Konsultasi Sedang Dinonaktifkan
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              Seluruh layanan konsultasi saat ini sedang tidak aktif oleh administrator dan belum menerima pendaftaran sesi baru.
            </p>
            <Link
              href="/layanan"
              className="inline-flex px-6 py-2.5 bg-[#561269] text-white text-xs font-bold rounded-full hover:bg-[#430e52] transition shadow-xs"
            >
              Lihat Layanan Lainnya
            </Link>
          </div>
        ) : (
          /* Grid Kartu Nyata */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {layananList.map((item, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length]
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                >
                  <div className={`h-40 sm:h-48 w-full ${theme.bgColor} overflow-hidden relative shrink-0`}>
                    <div className="absolute inset-0 flex items-start p-6">
                      <div className="text-left w-full">
                        <h3 className={`${theme.titleColor} font-extrabold text-[22px] sm:text-[28px] leading-[1.1] mb-2 drop-shadow-sm uppercase`}>
                          {item.nama}
                        </h3>
                        <p className={`${theme.titleColor} text-xs sm:text-sm font-medium drop-shadow-sm opacity-90`}>
                          {item.metode || "Online / Offline"}
                        </p>
                      </div>
                    </div>

                    {/* Shapes */}
                    {theme.shape === "circles" && (
                      <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <circle cx="150" cy="100" r="80" fill="white" />
                          <circle cx="50" cy="120" r="50" fill="white" />
                        </svg>
                      </div>
                    )}
                    {theme.shape === "circles-dark" && (
                      <div className="absolute -bottom-4 right-0 opacity-20 mix-blend-overlay">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <circle cx="150" cy="100" r="80" fill="black" />
                          <circle cx="50" cy="120" r="50" fill="black" />
                        </svg>
                      </div>
                    )}
                    {theme.shape === "heart" && (
                      <div className="absolute bottom-4 right-10">
                        <svg className="w-16 h-16 text-pink-300 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 leading-tight line-clamp-2">
                      {item.nama}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">
                      {item.deskripsi || "Layanan konsultasi kesehatan mental profesional bersama tim ahli Empathika."}
                    </p>

                    <div className="mt-auto pt-2">
                      <Link
                        href={withBiro(`/booking?layanan=${encodeURIComponent(item.nama)}`) as any}
                        className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                      >
                        Booking Sesi
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
