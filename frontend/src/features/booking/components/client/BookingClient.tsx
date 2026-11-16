"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { PsikologCard } from "@/features/psikolog/components/client/PsikologCard"
import { psikologService } from "@/services/psikolog.service"
import { mapDbPsikologToUI } from "@/features/psikolog/utils/mapPsikolog"
import { PsikologUI } from "@/types/psikolog"
import { layananService } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"

const DAFTAR_HARGA = [
  {
    id: "psikolog",
    title: "Psikolog",
    weekday: "-",
    weekend: "-",
    description: "Psikolog adalah tenaga profesional yang memiliki kewenangan untuk melakukan asesmen dan memberikan intervensi klinis.",
  },
  {
    id: "konselor",
    title: "Konselor",
    weekday: "-",
    weekend: "-",
    description: "Konselor adalah tenaga konseling terarah untuk mendampingi isu-isu kehidupan harian dan relasi.",
  },
  {
    id: "peer",
    title: "Peer Konselor",
    weekday: "-",
    weekend: "-",
    description: "Peer konselor adalah teman sebaya yang dilatih untuk memberikan dukungan emosional tanpa stigma.",
  },
]

export default function BookingClient() {
  const searchParams = useSearchParams()
  const initialLayanan = searchParams?.get("layanan") || ""

  const [openAccordion, setOpenAccordion] = useState<string | null>("konselor")
  const [daftarHarga, setDaftarHarga] = useState(DAFTAR_HARGA)
  const [activeFilter, setActiveFilter] = useState(() => {
    const l = initialLayanan.toLowerCase()
    if (l.includes("peer")) return "Peer Konselor"
    if (l.includes("konselor")) return "Konselor"
    return "Psikolog"
  })

  const [dbProfessionals, setDbProfessionals] = useState<PsikologUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isLayananNonaktif, setIsLayananNonaktif] = useState(false)
  const [namaLayananTerpilih, setNamaLayananTerpilih] = useState(initialLayanan || "Konsultasi")
  const [showNonaktifModal, setShowNonaktifModal] = useState(false)

  const formatRp = (num: any) => {
    if (!num && num !== 0) return "-"
    const n = typeof num === "string" ? parseInt(num.replace(/[,.]00$/, "").replace(/[^0-9]/g, "") || "0", 10) : num
    return `Rp ${n.toLocaleString("id-ID")}`
  }

  // Ambil daftar harga murni dari database backend & deteksi status aktif/nonaktif
  const fetchDaftarHarga = () => {
    layananService
      .getAll({ kategori: "KONSULTASI" })
      .then((res: any) => {
        const allConsultation = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []

        // Deteksi apakah ada item spesifik yang cocok dengan initialLayanan
        const targetByName = initialLayanan
          ? allConsultation.find(
              (l: any) =>
                (l.nama || "").toLowerCase().includes(initialLayanan.toLowerCase()) ||
                initialLayanan.toLowerCase().includes((l.nama || "").toLowerCase())
            )
          : null

        const isTargetExplicitlyNonaktif =
          targetByName && (targetByName.aktif === false || targetByName.status === "Nonaktif")

        const activeList = allConsultation.filter(
          (l: any) => l.aktif !== false && l.status !== "Nonaktif"
        )

        if (isTargetExplicitlyNonaktif) {
          setIsLayananNonaktif(true)
          setNamaLayananTerpilih(targetByName?.nama || initialLayanan)
        } else if (initialLayanan && !targetByName && activeList.length === 0 && allConsultation.length > 0) {
          setIsLayananNonaktif(true)
          setNamaLayananTerpilih(initialLayanan)
        } else if (!initialLayanan && activeList.length === 0 && allConsultation.length > 0) {
          setIsLayananNonaktif(true)
          setNamaLayananTerpilih("Konsultasi")
        } else {
          setIsLayananNonaktif(false)
          const targetLayanan = targetByName || activeList[0] || allConsultation[0]
          if (targetLayanan) {
            setNamaLayananTerpilih(targetLayanan.nama)
            const t = targetLayanan.tarif_tenaga_ahli
            const items: typeof DAFTAR_HARGA = []

            // 1. Cek Psikolog
            if (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) {
              items.push({
                id: "psikolog",
                title: "Psikolog",
                weekday: formatRp(t.psikolog.weekday),
                weekend: formatRp(t.psikolog.weekend),
                description:
                  "Psikolog adalah tenaga profesional yang memiliki kewenangan untuk melakukan asesmen dan memberikan intervensi klinis.",
              })
            }

            // 2. Cek Konselor
            if (t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0)) {
              items.push({
                id: "konselor",
                title: "Konselor",
                weekday: formatRp(t.konselor.weekday),
                weekend: formatRp(t.konselor.weekend),
                description:
                  "Konselor adalah tenaga konseling terarah untuk mendampingi isu-isu kehidupan harian dan relasi.",
              })
            }

            // 3. Cek Peer Konselor
            if (t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0)) {
              items.push({
                id: "peer",
                title: "Peer Konselor",
                weekday: formatRp(t.peer.weekday),
                weekend: formatRp(t.peer.weekend),
                description:
                  "Peer konselor adalah teman sebaya yang dilatih untuk memberikan dukungan emosional tanpa stigma.",
              })
            }

            // Fallback jika belum ada objek tarif_tenaga_ahli tapi ada harga_weekday
            if (items.length === 0) {
              items.push({
                id: "psikolog",
                title: "Psikolog",
                weekday: formatRp(targetLayanan.harga_weekday),
                weekend: formatRp(targetLayanan.harga_weekend),
                description:
                  "Psikolog adalah tenaga profesional yang memiliki kewenangan untuk melakukan asesmen dan memberikan intervensi klinis.",
              })
            }

            setDaftarHarga(items)
            if (items.length > 0) {
              setOpenAccordion(items[0].id)
            }
          }
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil tarif layanan konsultasi:", err)
        const stored = getStoredLayanan().filter((l) => l.kategoriId === "01")
        const localTarget = initialLayanan
          ? stored.find(
              (l) =>
                l.layanan.toLowerCase().includes(initialLayanan.toLowerCase()) ||
                initialLayanan.toLowerCase().includes(l.layanan.toLowerCase())
            )
          : null
        if (localTarget && localTarget.status === "Nonaktif") {
          setIsLayananNonaktif(true)
          setNamaLayananTerpilih(localTarget.layanan)
        } else if (localTarget) {
          const t = localTarget.tarif_tenaga_ahli
          const items: typeof DAFTAR_HARGA = []
          if (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) {
            items.push({
              id: "psikolog",
              title: "Psikolog",
              weekday: formatRp(t.psikolog.weekday),
              weekend: formatRp(t.psikolog.weekend),
              description: "Psikolog adalah tenaga profesional yang memiliki kewenangan untuk melakukan asesmen dan memberikan intervensi klinis.",
            })
          }
          if (t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0)) {
            items.push({
              id: "konselor",
              title: "Konselor",
              weekday: formatRp(t.konselor.weekday),
              weekend: formatRp(t.konselor.weekend),
              description: "Konselor adalah tenaga konseling terarah untuk mendampingi isu-isu kehidupan harian dan relasi.",
            })
          }
          if (t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0)) {
            items.push({
              id: "peer",
              title: "Peer Konselor",
              weekday: formatRp(t.peer.weekday),
              weekend: formatRp(t.peer.weekend),
              description: "Peer konselor adalah teman sebaya yang dilatih untuk memberikan dukungan emosional tanpa stigma.",
            })
          }
          if (items.length > 0) {
            setDaftarHarga(items)
            setOpenAccordion(items[0].id)
          }
        } else {
          setIsError(true)
        }
      })
  }

  // Ambil daftar tenaga profesional murni dari database backend (tanpa data tiruan/localStorage)
  const fetchProfessionals = () => {
    setIsLoading(true)
    psikologService
      .getList()
      .then((list: any[]) => {
        const mappedFromDb = Array.isArray(list) ? list.map(mapDbPsikologToUI) : []
        setDbProfessionals(mappedFromDb)
      })
      .catch((err) => {
        console.error("Gagal mengambil data tenaga profesional:", err)
        setIsError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)
    fetchDaftarHarga()
    fetchProfessionals()
  }

  useEffect(() => {
    fetchDaftarHarga()
    fetchProfessionals()

    const handleSync = () => {
      fetchDaftarHarga()
      fetchProfessionals()
    }

    window.addEventListener("storage", handleSync)

    return () => {
      window.removeEventListener("storage", handleSync)
    }
  }, [initialLayanan])

  const availableFilters = useMemo(() => {
    const titles = daftarHarga.map((d) => d.title)
    return titles.length > 0 ? titles : ["Psikolog", "Konselor", "Peer Konselor"]
  }, [daftarHarga])

  // Ambil filter aktif yang valid secara aman tanpa useEffect berulang
  const currentFilter = availableFilters.includes(activeFilter)
    ? activeFilter
    : availableFilters[0] || "Psikolog"

  const filteredProfessionals = useMemo(() => {
    return dbProfessionals.filter((p) => {
      if (currentFilter === "Psikolog") return p.category === "psikolog"
      if (currentFilter === "Konselor") return p.category === "konselor"
      if (currentFilter === "Peer Konselor") return p.category === "peer-konselor"
      return true
    })
  }, [dbProfessionals, currentFilter])

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

        {/* Status Error Jika Koneksi Gagal */}
        {isError && (
          <div className="p-8 sm:p-10 text-center bg-amber-50 border border-amber-200 rounded-[1.5rem] shadow-sm mb-12 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 text-xl">
              ⚠️
            </div>
            <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-1">
              Gagal memuat daftar layanan &amp; profesional
            </h3>
            <p className="text-xs sm:text-sm text-amber-700 mb-5">
              Silakan periksa koneksi Anda dan coba lagi.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-2.5 bg-[#561269] hover:bg-[#430e52] text-white text-xs sm:text-sm font-bold rounded-full transition shadow-xs active:scale-95 cursor-pointer"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {!isError && (
          <>
            {/* Banner Informasi Layanan Nonaktif */}
            {isLayananNonaktif && (
              <div className="p-4 sm:p-5 bg-amber-50 border border-amber-300 rounded-[1.2rem] shadow-xs mb-8 flex items-center gap-3.5 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-lg shrink-0">
                  ⚠️
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs sm:text-sm font-semibold text-amber-900">
                    Layanan &ldquo;{namaLayananTerpilih}&rdquo; sedang dinonaktifkan oleh admin. Pendaftaran sesi untuk layanan ini sementara ditutup.
                  </p>
                </div>
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
                <div className="text-left font-extrabold text-[#561269] text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">Konsultasi</div>
                <div className="font-extrabold text-[#561269] text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">Weekday</div>
                <div className="font-extrabold text-[#561269] text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">Weekend</div>
              </div>

              <hr className="border-t-2 border-[#DCD0E1]" />

              {/* Rows */}
              <div className="flex flex-col">
                {daftarHarga.map((item, idx) => {
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
                          <span className="[text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">{item.title}</span>
                        </div>
                        <div className="text-center font-bold text-[#561269] text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">{item.weekday}</div>
                        <div className="text-center font-bold text-[#561269] text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">{item.weekend}</div>
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

            {/* Filter Section (Hanya tampilkan kategori tenaga ahli yang tersedia) */}
            <div className="mb-10 flex justify-center gap-3 flex-wrap">
              {availableFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm cursor-pointer ${currentFilter === f
                    ? "bg-[#561269] text-white"
                    : "bg-white text-[#561269] hover:bg-[#561269]/10"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Dynamic Grid Professionals */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                <div className="w-8 h-8 border-3 border-[#561269] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-500">Memuat data tenaga ahli...</p>
              </div>
            ) : filteredProfessionals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[400px]">
                {filteredProfessionals.map((doc, i) => (
                  <PsikologCard
                    key={doc.id || i}
                    psikolog={doc}
                    mode="konseling"
                    isLayananNonaktif={isLayananNonaktif}
                    onAttemptBooking={() => setShowNonaktifModal(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <p className="text-sm font-semibold text-gray-600">
                  Belum ada tenaga profesional yang terdaftar untuk kategori {activeFilter}.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Silakan pilih kategori lain atau periksa kembali nanti.
                </p>
              </div>
            )}
          </>
        )}

      </div>

      {/* Modal Dialog Notifikasi Layanan Dinonaktifkan */}
      {showNonaktifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">
              Pendaftaran Sesi Tidak Tersedia
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              Mohon maaf, layanan konsultasi <span className="font-bold text-[#561269]">&ldquo;{namaLayananTerpilih}&rdquo;</span> sudah dinonaktifkan oleh admin. Anda saat ini tidak dapat melakukan pendaftaran sesi untuk layanan ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowNonaktifModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition cursor-pointer"
              >
                Tutup
              </button>
              <Link
                href="/layanan"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#561269] text-white font-bold text-xs sm:text-sm hover:bg-[#430e52] transition shadow-xs"
              >
                Lihat Layanan Lain
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
