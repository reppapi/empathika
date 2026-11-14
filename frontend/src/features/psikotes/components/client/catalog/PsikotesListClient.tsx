/** Halaman katalog daftar tes psikotes yang sudah berstatus published. */
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service"
import { Loader2, WifiOff, RefreshCw } from "lucide-react"

export default function PsikotesListClient() {
  const [tests, setTests] = useState<PaketPsikotesApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchPublishedTests = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await psikotesService.getList({
        status: "PUBLISHED",
      })
      if (res && res.success && Array.isArray(res.data)) {
        setTests(res.data)
      } else {
        setErrorMessage("Gagal memuat daftar paket psikotes dari server.")
      }
    } catch (err: any) {
      console.error("Gagal mengambil data paket psikotes:", err)
      setErrorMessage("Tidak dapat terhubung ke server backend. Silakan periksa koneksi atau coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPublishedTests()
  }, [fetchPublishedTests])

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

        {/* Error State — Jika koneksi backend mati / server down */}
        {!isLoading && errorMessage && (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-red-100 p-8 shadow-xs max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Gagal Menghubungkan ke Server</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">{errorMessage}</p>
            <button
              type="button"
              onClick={() => fetchPublishedTests()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#561269] hover:bg-[#763E8B] text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* Empty State — Jika server aktif tetapi belum ada paket berstatus PUBLISHED */}
        {!isLoading && !errorMessage && tests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada paket psikotes yang dipublikasikan</h3>
            <p className="text-sm text-gray-500">Silakan kembali lagi nanti untuk melihat instrumen psikotes terbaru kami.</p>
          </div>
        )}

        {/* Grid Card Psikotes (Clean Standard Style - No Text on Photo) */}
        {!isLoading && !errorMessage && tests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => {
              const bannerImage =
                test.banner_url ||
                (() => {
                  if (process.env.NODE_ENV === "development") {
                    console.warn(`[DEV WARNING][PsikotesList] 'banner_url' untuk paket '${test.id}' kosong di DB.`);
                  }
                  return "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800";
                })();

              const deskripsiText =
                test.deskripsi ||
                (() => {
                  if (process.env.NODE_ENV === "development") {
                    console.warn(`[DEV WARNING][PsikotesList] 'deskripsi' untuk paket '${test.id}' kosong di DB.`);
                  }
                  return "Kenali kondisi dirimu dan pahami bagaimana perasaan serta pikiranmu melalui asesmen psikologi terstandar ini.";
                })();

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  {/* Foto Bersih (Tanpa Tulisan Apapun) */}
                  <div className="h-52 w-full overflow-hidden relative bg-gray-100">
                    <Image
                      src={bannerImage}
                      alt={test.judul}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>

                  {/* Body Card */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight line-clamp-2">
                      {test.judul}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2">
                      {deskripsiText}
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
