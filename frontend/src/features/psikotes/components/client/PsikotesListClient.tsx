"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service"
import { Loader2 } from "lucide-react"

const THEME_COLORS = ["#561269", "#1c352d", "#8e4a9e", "#0f766e", "#f48520"]

export default function PsikotesListClient() {
  const [tests, setTests] = useState<PaketPsikotesApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPublishedTests = async () => {
      try {
        const res = await psikotesService.getList({
          status: "PUBLISHED",
        })
        if (res && res.success && Array.isArray(res.data)) {
          setTests(res.data)
        }
      } catch (err) {
        console.error("Gagal mengambil data paket psikotes:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublishedTests()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-poppins pt-24 pb-20 sm:pt-32 sm:pb-28">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#561269] text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span>
            Layanan Psikotes Empathika
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#561269] tracking-tight mb-4">
            Kenali Dirimu dengan Psikotes <span className="text-[#561269]">Empathika</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Pilih asesmen psikologi yang ingin kamu ikuti untuk memahami kepribadian, gaya relasi, dan potensi terbaikmu.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
            <p className="text-sm text-gray-500 font-medium">Memuat paket psikotes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada paket psikotes yang dipublikasikan</h3>
            <p className="text-sm text-gray-500">Silakan kembali lagi nanti untuk melihat instrumen psikotes terbaru kami.</p>
          </div>
        )}

        {/* Grid Card Psikotes (Clean Standard Style) */}
        {!isLoading && tests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, index) => {
              const themeColor = THEME_COLORS[index % THEME_COLORS.length]

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  {/* Header Visual Card */}
                  <div
                    className="h-48 w-full overflow-hidden relative"
                    style={{ backgroundColor: themeColor }}
                  >
                    <div className="absolute inset-0 flex items-start p-6">
                      <div className="text-left w-full">
                        <h3 className="text-white font-bold text-2xl leading-tight mb-1 drop-shadow-sm line-clamp-2">
                          {test.judul}
                        </h3>
                        <p className="text-white/80 text-xs font-medium line-clamp-2 drop-shadow-sm">
                          {test.deskripsi || "Asesmen psikologi terstruktur untuk mengenali diri."}
                        </p>
                      </div>
                    </div>

                    {/* Abstract decorative shapes */}
                    <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay pointer-events-none">
                      <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                        <circle cx="150" cy="100" r="80" fill="white" />
                        <circle cx="50" cy="120" r="50" fill="white" />
                      </svg>
                    </div>
                  </div>

                  {/* Body Card */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight line-clamp-2">
                      {test.judul}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                      {test.deskripsi || "Tes psikologi ini dirancang untuk memberikan gambaran akurat mengenai karakteristik dan potensi dirimu."}
                    </p>

                    <div className="mt-auto pt-2">
                      <Link
                        href={`/psikotes/${test.id}` as any}
                        className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                      >
                        Ikuti Tes
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
