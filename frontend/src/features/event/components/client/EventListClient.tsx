"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { eventService, EventItemApi, EventDokumentasiApi } from "@/services/event.service"
import { useTenantContext } from "@/context/TenantContext"
import { ImageIcon, ArrowLeft, Sparkles, FolderArchive, ArrowRight } from "lucide-react"
import { DokumentasiCarouselItem } from "./DokumentasiCarouselItem"

type KategoriGaleri = "SEMINAR" | "WORKSHOP" | "KOLABORASI"

export function EventListClient() {
  const { biroPrefix } = useTenantContext()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabQuery = searchParams.get("tab")
  const kategoriQuery = searchParams.get("kategori") as KategoriGaleri | null
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST">(
    tabQuery?.toLowerCase() === "past" ? "PAST" : "UPCOMING"
  )
  const [events, setEvents] = useState<EventItemApi[]>([])
  const [dokumentasiList, setDokumentasiList] = useState<EventDokumentasiApi[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedKategori, setSelectedKategori] = useState<KategoriGaleri | null>(
    kategoriQuery && ["SEMINAR", "WORKSHOP", "KOLABORASI"].includes(kategoriQuery.toUpperCase())
      ? (kategoriQuery.toUpperCase() as KategoriGaleri)
      : null
  )

  useEffect(() => {
    if (tabQuery?.toLowerCase() === "past") {
      setActiveTab("PAST")
    } else if (tabQuery?.toLowerCase() === "upcoming") {
      setActiveTab("UPCOMING")
    }

    if (kategoriQuery && ["SEMINAR", "WORKSHOP", "KOLABORASI"].includes(kategoriQuery.toUpperCase())) {
      setSelectedKategori(kategoriQuery.toUpperCase() as KategoriGaleri)
    } else if (!kategoriQuery) {
      setSelectedKategori(null)
    }
  }, [tabQuery, kategoriQuery])

  const handleSelectKategori = (catId: KategoriGaleri | null) => {
    setSelectedKategori(catId)
    const params = new URLSearchParams(searchParams.toString())
    if (catId) {
      params.set("tab", "past")
      params.set("kategori", catId.toLowerCase())
    } else {
      params.delete("kategori")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    if (catId) {
      window.scrollTo({ top: 120, behavior: "smooth" })
    }
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [resEvents, resDokumentasi] = await Promise.all([
          eventService.getList({ limit: 50 }).catch((e) => {
            console.error("Gagal memuat event:", e)
            return null
          }),
          eventService.getDokumentasiList({ limit: 50 }).catch((e) => {
            console.error("Gagal memuat dokumentasi:", e)
            return null
          }),
        ])

        if (resEvents?.data) {
          setEvents(resEvents.data)
        }
        if (resDokumentasi?.data) {
          setDokumentasiList(resDokumentasi.data)
        }
      } catch (err) {
        console.error("Gagal memuat data event/dokumentasi:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Event yang aktif / akan datang
  const upcomingEvents = events.filter((e) => e.status === "UPCOMING" || e.status === "ONGOING")

  return (
    <div className="min-h-screen bg-[#FDFBF9] pt-28 sm:pt-36 pb-24 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Section: Disembunyikan ketika sedang membuka detail folder arsip */}
        {selectedKategori === null && (
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1.5 bg-purple-50 text-[#561269] text-xs sm:text-sm font-bold rounded-full mb-3 tracking-wide">
              PROGRAM &amp; KEGIATAN EMPATHIKA
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#561269] tracking-tight mb-4">
              Eksplorasi Event &amp; Workshop
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Ikuti berbagai workshop interaktif, webinar inspiratif, serta lihat jejak rekam kegiatan dan event seru yang telah kami laksanakan bersama para ahli.
            </p>

            {/* Tab Selector */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setActiveTab("UPCOMING")}
                className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                  activeTab === "UPCOMING"
                    ? "bg-[#561269] text-white shadow-purple-200"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Event yang Akan Datang
              </button>
              <button
                onClick={() => setActiveTab("PAST")}
                className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                  activeTab === "PAST"
                    ? "bg-[#561269] text-white shadow-purple-200"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Riwayat &amp; Dokumentasi Kegiatan
              </button>
            </div>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-2/5 h-48 bg-gray-200 rounded-2xl shrink-0"></div>
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "UPCOMING" ? (
          /* ==============================================================
             TAB: EVENT AKAN DATANG (UPCOMING)
             ============================================================== */
          upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {upcomingEvents.map((ev) => {
                const tanggalTeks = ev.tanggal
                  ? new Date(ev.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Jadwal Segera Diumumkan"

                let jamTeks = "Waktu Belum Ditentukan"
                if (ev.jam_mulai) {
                  try {
                    const d = new Date(ev.jam_mulai)
                    if (!isNaN(d.getTime())) {
                      const hh = String(d.getUTCHours()).padStart(2, "0")
                      const mm = String(d.getUTCMinutes()).padStart(2, "0")
                      const durasi = ev.durasi_menit || 120
                      const totalMins = d.getUTCHours() * 60 + d.getUTCMinutes() + durasi
                      const endH = String(Math.floor(totalMins / 60) % 24).padStart(2, "0")
                      const endM = String(totalMins % 60).padStart(2, "0")
                      jamTeks = `${hh}:${mm} - ${endH}:${endM}`
                    } else if (typeof ev.jam_mulai === "string") {
                      const timePart = ev.jam_mulai.includes("T")
                        ? ev.jam_mulai.split("T")[1]?.slice(0, 5)
                        : ev.jam_mulai.slice(0, 5)
                      jamTeks = timePart ? timePart : ev.jam_mulai
                    }
                  } catch {
                    jamTeks = String(ev.jam_mulai)
                  }
                }
                const hargaNum = Number(ev.harga) || 0
                const hargaCoretNum = ev.harga_coret ? Number(ev.harga_coret) : 0
                const hargaTeks = hargaNum === 0 ? "Gratis" : `Rp ${hargaNum.toLocaleString("id-ID")}`
                const hargaCoretTeks = hargaCoretNum > 0 ? `Rp ${hargaCoretNum.toLocaleString("id-ID")}` : null
                const diskonPersen =
                  hargaCoretNum > hargaNum && hargaCoretNum > 0
                    ? Math.round(((hargaCoretNum - hargaNum) / hargaCoretNum) * 100)
                    : 0

                const isOnline = ev.tipe_event !== "OFFLINE"
                const hasBundling = Boolean(ev.harga_bundling && Number(ev.harga_bundling) > 0)
                const hargaBundlingNum = hasBundling ? Number(ev.harga_bundling) : 0
                const kuotaBundling = ev.kuota_tiket_bundling || 2
                const namaBundling = ev.nama_bundling || `Paket ${kuotaBundling} Tiket`

                const bundlingParams = hasBundling
                  ? `&hargaBundling=${encodeURIComponent(String(hargaBundlingNum))}&kuotaBundling=${encodeURIComponent(String(kuotaBundling))}&namaBundling=${encodeURIComponent(namaBundling)}`
                  : ""

                const checkoutHref = biroPrefix
                  ? `${biroPrefix}/event/checkout?eventId=${encodeURIComponent(ev.id)}&judul=${encodeURIComponent(ev.judul)}&deskripsi=${encodeURIComponent(ev.deskripsi || "")}&pembicara=${encodeURIComponent(ev.nama_pembicara)}&kategori=${encodeURIComponent(ev.jenis_event)}&harga=${encodeURIComponent(hargaTeks)}&lokasi=${encodeURIComponent(ev.lokasi || (isOnline ? "Google Meet (Online)" : "Offline"))}&tanggal=${encodeURIComponent(tanggalTeks)}&waktu=${encodeURIComponent(jamTeks)}&tipe=${encodeURIComponent(isOnline ? "Online" : "Offline")}${ev.link_meet ? `&linkMeet=${encodeURIComponent(ev.link_meet)}` : ""}${ev.link_wa ? `&linkWa=${encodeURIComponent(ev.link_wa)}` : ""}${ev.banner_url ? `&bannerUrl=${encodeURIComponent(ev.banner_url)}` : ""}${bundlingParams}`
                  : `/event/checkout?eventId=${encodeURIComponent(ev.id)}&judul=${encodeURIComponent(ev.judul)}&deskripsi=${encodeURIComponent(ev.deskripsi || "")}&pembicara=${encodeURIComponent(ev.nama_pembicara)}&kategori=${encodeURIComponent(ev.jenis_event)}&harga=${encodeURIComponent(hargaTeks)}&lokasi=${encodeURIComponent(ev.lokasi || (isOnline ? "Google Meet (Online)" : "Offline"))}&tanggal=${encodeURIComponent(tanggalTeks)}&waktu=${encodeURIComponent(jamTeks)}&tipe=${encodeURIComponent(isOnline ? "Online" : "Offline")}${ev.link_meet ? `&linkMeet=${encodeURIComponent(ev.link_meet)}` : ""}${ev.link_wa ? `&linkWa=${encodeURIComponent(ev.link_wa)}` : ""}${ev.banner_url ? `&bannerUrl=${encodeURIComponent(ev.banner_url)}` : ""}${bundlingParams}`

                return (
                  <div
                    key={ev.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row group min-w-0 w-full"
                  >
                    <div className="relative h-56 sm:h-auto sm:w-[38%] md:w-[36%] lg:w-[38%] shrink-0 overflow-hidden bg-gray-100">
                      <Image
                        unoptimized
                        src={
                          ev.banner_url ||
                          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        }
                        alt={ev.judul}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-0.5 items-start">
                        <span className="text-[11px] font-bold text-white drop-shadow uppercase tracking-wider">
                          {ev.jenis_event}
                        </span>
                        <span className={`text-[10px] font-semibold drop-shadow ${isOnline ? "text-blue-200" : "text-emerald-200"}`}>
                          {isOnline ? "Online" : "Offline"}
                        </span>
                        {hasBundling && (
                          <span className="text-[10px] font-semibold text-amber-200 drop-shadow">
                            Tersedia {namaBundling}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 md:p-6 flex flex-col flex-1 min-w-0 justify-between">
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2 line-clamp-2 leading-tight break-words">
                          {ev.judul}
                        </h3>

                        {ev.deskripsi && (
                          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed break-words">
                            {ev.deskripsi}
                          </p>
                        )}

                        <div className="space-y-1.5 mb-5">
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 min-w-0">
                            <svg className="w-4 h-4 mr-2 text-[#d97706] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{tanggalTeks}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 min-w-0">
                            <svg className="w-4 h-4 mr-2 text-[#d97706] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">{jamTeks}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 min-w-0">
                            <svg className="w-4 h-4 mr-2 text-[#d97706] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">
                              {ev.lokasi || (isOnline ? "Google Meet (Online)" : "Lokasi Offline")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-xs shrink-0">
                            {ev.nama_pembicara ? ev.nama_pembicara.charAt(0) : "E"}
                          </div>
                          <div className="text-sm min-w-0 flex-1">
                            <p className="font-bold text-gray-900 truncate">{ev.nama_pembicara}</p>
                            <p className="text-xs text-gray-500">Narasumber / Pembicara</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 sm:gap-4 min-w-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5 truncate">Harga Tiket</p>
                          {hasBundling ? (
                            <div className="min-w-0">
                              <p className="text-base sm:text-lg font-black text-[#561269] leading-tight truncate">
                                Mulai dari {hargaTeks}
                              </p>
                              <div className="inline-flex items-center gap-1.5 mt-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-lg text-[10px] font-bold truncate max-w-full">
                                <span className="truncate">Tersedia {namaBundling} (Rp {hargaBundlingNum.toLocaleString("id-ID")})</span>
                              </div>
                            </div>
                          ) : hargaCoretTeks && hargaCoretNum > hargaNum ? (
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs text-gray-400 line-through font-medium">
                                  {hargaCoretTeks}
                                </span>
                                {diskonPersen > 0 && (
                                  <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100 whitespace-nowrap">
                                    Hemat {diskonPersen}%
                                  </span>
                                )}
                              </div>
                              <p className="text-base sm:text-lg font-black text-[#561269] leading-tight truncate">
                                {hargaTeks}
                              </p>
                            </div>
                          ) : (
                            <p className="text-base sm:text-lg font-black text-[#561269] truncate">{hargaTeks}</p>
                          )}
                        </div>
                        <Link
                          href={checkoutHref}
                          className="bg-[#EAB308] hover:bg-yellow-500 text-black text-xs sm:text-sm font-bold py-2.5 px-5 sm:px-6 rounded-2xl transition-colors shrink-0 shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Daftar
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="w-full bg-white rounded-[2.5rem] border border-purple-100/80 p-8 sm:p-14 text-center shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#561269] flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Belum Ada Event yang Sedang Berlangsung
              </h3>
              <p className="text-gray-500 text-sm sm:text-base mb-6 leading-relaxed">
                Saat ini belum ada event atau workshop yang dibuka untuk pendaftaran. Nantikan informasi kegiatan terbaru dari kami!
              </p>
              <button
                onClick={() => setActiveTab("PAST")}
                className="inline-flex items-center gap-2 bg-[#561269] text-white hover:bg-[#430e52] font-bold text-sm py-2.5 px-6 rounded-full transition-all cursor-pointer"
              >
                Lihat Riwayat &amp; Dokumentasi Kegiatan
              </button>
            </div>
          )
        ) : (
          /* ==============================================================
             TAB: RIWAYAT & ARSIP KEGIATAN (DOKUMENTASI EVENT SELESAI)
             ============================================================== */
          (() => {
            // Pengelompokan data berdasarkan kategori
            const seminarList = dokumentasiList.filter((d) => (d.kategori || "KOLABORASI") === "SEMINAR")
            const workshopList = dokumentasiList.filter((d) => (d.kategori || "KOLABORASI") === "WORKSHOP")
            const kolaborasiList = dokumentasiList.filter((d) => (d.kategori || "KOLABORASI") === "KOLABORASI")

            const categoriesConfig = [
              {
                id: "SEMINAR" as KategoriGaleri,
                title: "Seminar & Webinar",
                subtitle: "SEMINAR",
                description:
                  "Rangkaian sesi edukatif, seminar interaktif, dan webinar inspiratif yang menghadirkan psikolog serta praktisi ahli untuk memperluas wawasan seputar kesehatan mental, resiliensi diri, dan pengembangan potensi individu secara komprehensif.",
                badge: `${seminarList.length} Kegiatan`,
                count: seminarList.length,
                latestPhoto:
                  seminarList.find((d) => d.thumbnail || (d.foto && d.foto.length > 0))?.thumbnail ||
                  seminarList.find((d) => d.foto && d.foto.length > 0)?.foto?.[0]?.foto_url ||
                  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
                folderBg: "bg-[#F4ECE1]", // warm aesthetic beige folder
                folderBorder: "border-[#E5D7C3]",
                tabBg: "bg-[#F4ECE1]",
                tabBorder: "border-[#E5D7C3]",
                tapeAngle: "rotate-2",
              },
              {
                id: "WORKSHOP" as KategoriGaleri,
                title: "Workshop & Pelatihan",
                subtitle: "WORKSHOP",
                description:
                  "Program pelatihan berbasis praktik langsung (*hands-on*), lokakarya interaktif, dan simulasi kasus yang dirancang untuk membekali peserta dengan keterampilan psikologis aplikatif, manajemen stres, serta kepekaan emosional yang mendalam.",
                badge: `${workshopList.length} Kegiatan`,
                count: workshopList.length,
                latestPhoto:
                  workshopList.find((d) => d.thumbnail || (d.foto && d.foto.length > 0))?.thumbnail ||
                  workshopList.find((d) => d.foto && d.foto.length > 0)?.foto?.[0]?.foto_url ||
                  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
                folderBg: "bg-[#E6ECE8]", // sage / soft muted olive folder
                folderBorder: "border-[#CDD8D1]",
                tabBg: "bg-[#E6ECE8]",
                tabBorder: "border-[#CDD8D1]",
                tapeAngle: "-rotate-2",
              },
              {
                id: "KOLABORASI" as KategoriGaleri,
                title: "Kolaborasi & Kemitraan",
                subtitle: "KOLABORASI",
                description:
                  "Jejak rekam kemitraan strategis dan inisiatif bersama instansi pendidikan, universitas, korporasi, serta komunitas untuk menciptakan ekosistem lingkungan belajar dan kerja yang sehat, suportif, dan tanggap terhadap isu psikologis.",
                badge: `${kolaborasiList.length} Kegiatan`,
                count: kolaborasiList.length,
                latestPhoto:
                  kolaborasiList.find((d) => d.thumbnail || (d.foto && d.foto.length > 0))?.thumbnail ||
                  kolaborasiList.find((d) => d.foto && d.foto.length > 0)?.foto?.[0]?.foto_url ||
                  "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80",
                folderBg: "bg-[#E2EAF4]", // aesthetic pastel soft blue folder
                folderBorder: "border-[#CAD8E8]",
                tabBg: "bg-[#E2EAF4]",
                tabBorder: "border-[#CAD8E8]",
                tapeAngle: "rotate-3",
              },
            ]

            // 1. JIKA BELUM PILIH KATEGORI -> TAMPILKAN 3 FOLDER CARDS (REFERENSI GAMBAR 2)
            if (selectedKategori === null) {
              return (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 pt-10">
                    {categoriesConfig.map((cat) => {
                      return (
                        <div
                          key={cat.id}
                          className="relative group pt-20 flex flex-col justify-end transition-all duration-300"
                        >
                          {/* Foto Intip di Balik Folder (Polaroid / Photo Card Peeking) */}
                          <div className="absolute top-0 inset-x-0 mx-auto w-[82%] h-48 z-0 transition-transform duration-500 ease-out group-hover:-translate-y-4">
                            <div
                              className={`w-full h-full p-2 bg-white rounded-2xl shadow-md border border-gray-200/90 transform ${cat.tapeAngle} transition-transform group-hover:rotate-0 duration-500 overflow-hidden relative flex flex-col`}
                            >
                              <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-gray-200">
                                <Image
                                  unoptimized
                                  src={cat.latestPhoto}
                                  alt={cat.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Map / Folder Aesthetic Body */}
                          <div
                            className={`relative z-10 w-full ${cat.folderBg} border ${cat.folderBorder} rounded-3xl rounded-tl-none p-6 sm:p-7 shadow-sm group-hover:shadow-md transition-all duration-300 flex flex-col min-h-[250px]`}
                          >
                            {/* Tab Folder di Pojok Kiri Atas */}
                            <div
                              className={`absolute -top-7 left-[-1px] h-7 px-5 ${cat.tabBg} border-t border-l border-r ${cat.tabBorder} rounded-t-2xl flex items-center shadow-[-2px_-2px_4px_rgba(0,0,0,0.02)]`}
                            >
                              <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-gray-600">
                                {cat.subtitle}
                              </span>
                            </div>

                            {/* Badge Jumlah Kegiatan di Kanan Atas Folder */}
                            <div className="flex items-center justify-end mb-2 mt-1">
                              <span className="text-xs font-bold text-gray-700 bg-white/80 px-3 py-1 rounded-full border border-black/5 shadow-2xs">
                                {cat.badge}
                              </span>
                            </div>

                            {/* Judul & Deskripsi Simpel Kategori */}
                            <div className="flex-1 space-y-1 py-1">
                              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                {cat.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 leading-snug font-medium line-clamp-2">
                                {cat.description}
                              </p>
                            </div>

                            {/* Tombol Lihat Selengkapnya */}
                            <div className="pt-4 border-t border-black/5 mt-auto">
                              <button
                                onClick={() => handleSelectKategori(cat.id)}
                                className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs sm:text-sm shadow-xs border border-black/10 flex items-center justify-center gap-2 transition-all group-hover:bg-[#561269] group-hover:text-white group-hover:border-[#561269] cursor-pointer"
                              >
                                <span>Lihat Selengkapnya</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }

            // 2. JIKA SUDAH PILIH KATEGORI -> TAMPILKAN DAFTAR DOKUMENTASI (FLAT, TANPA KOTAK, FRAME 16:9)
            const currentCatConfig = categoriesConfig.find((c) => c.id === selectedKategori)
            const filteredItems = dokumentasiList
              .filter((d) => (d.kategori || "KOLABORASI") === selectedKategori)
              .sort((a, b) => {
                const dateA = a.tanggal ? new Date(a.tanggal).getTime() : new Date(a.createdAt).getTime()
                const dateB = b.tanggal ? new Date(b.tanggal).getTime() : new Date(b.createdAt).getTime()
                return dateB - dateA // Paling baru di paling atas
              })

            return (
              <div className="space-y-12 max-w-3xl mx-auto">
                {/* Header Judul Kategori Sesuai DetailKerjaSama (Clean + Gradient + Underline) */}
                <div className="flex flex-col items-center justify-center mb-2 mt-2 text-center">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    <span className="text-[#561269]">Dokumentasi </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#561269] via-[#8e4a9e] to-[#ba68c8]">
                      {currentCatConfig?.title || selectedKategori}
                    </span>
                  </h1>
                  <div className="w-16 h-1.5 bg-gradient-to-r from-[#561269] via-[#8e4a9e] to-[#ba68c8] rounded-full mt-4"></div>
                </div>

                {/* Deskripsi Panjang Penjelas Kategori Sesuai Format Kerja Sama */}
                {currentCatConfig?.description && (
                  <p className="text-gray-800 text-sm md:text-base leading-relaxed text-center whitespace-pre-wrap">
                    {currentCatConfig.description}
                  </p>
                )}

                {/* List Dokumentasi View: Flat (Tanpa Kotak Pembungkus) */}
                {filteredItems.length > 0 ? (
                  <div className="space-y-16 pt-2">
                    {filteredItems.map((dok) => (
                      <DokumentasiCarouselItem key={dok.id} item={dok} />
                    ))}
                  </div>
                ) : (
                  <div className="w-full bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto">
                    <FolderArchive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Belum Ada Dokumentasi
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Belum ada arsip foto untuk kategori {currentCatConfig?.title || selectedKategori} ini.
                    </p>
                    <button
                      onClick={() => handleSelectKategori(null)}
                      className="inline-flex items-center gap-2 bg-[#561269] text-white font-bold text-xs py-2 px-5 rounded-full hover:bg-[#430e52] transition-colors"
                    >
                      Pilih Kategori Lain
                    </button>
                  </div>
                )}
              </div>
            )
          })()
        )}
      </div>

    </div>
  )
}
