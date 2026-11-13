"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { eventService, EventItemApi, EventDokumentasiApi } from "@/services/event.service"
import { useTenantContext } from "@/context/TenantContext"
import { ImageIcon } from "lucide-react"
import ClientDokumentasiDetailModal from "./ClientDokumentasiDetailModal"

export function EventListClient() {
  const { biroPrefix } = useTenantContext()
  const searchParams = useSearchParams()
  const tabQuery = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST">(
    tabQuery?.toLowerCase() === "past" ? "PAST" : "UPCOMING"
  )
  const [events, setEvents] = useState<EventItemApi[]>([])
  const [dokumentasiList, setDokumentasiList] = useState<EventDokumentasiApi[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedDokumentasi, setSelectedDokumentasi] = useState<EventDokumentasiApi | null>(null)

  useEffect(() => {
    if (tabQuery?.toLowerCase() === "past") {
      setActiveTab("PAST")
    } else if (tabQuery?.toLowerCase() === "upcoming") {
      setActiveTab("UPCOMING")
    }
  }, [tabQuery])

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
        {/* Header Hero Section */}
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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Riwayat &amp; Dokumentasi Kegiatan
            </button>
          </div>
        </div>

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
          (dokumentasiList.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Dokumentasi dari tabel EventDokumentasi (otomatis dari event selesai + manual) */}
              {dokumentasiList.map((dok) => {
                return (
                  <div
                    key={dok.id}
                    onClick={() => setSelectedDokumentasi(dok)}
                    className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer group bg-black"
                  >
                    {/* Foto Penuh */}
                    {dok.thumbnail ? (
                      <Image
                        unoptimized
                        src={dok.thumbnail}
                        alt={dok.judul}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-900">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                    )}

                    {/* Gradient Gelap di Ujung Bawah Foto */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                    {/* Counter Foto Kecil di Kanan Atas */}
                    {dok.jumlah_foto > 0 && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                        {dok.jumlah_foto} Foto
                      </div>
                    )}

                    {/* Judul & Deskripsi */}
                    <div className="absolute bottom-5 left-5 right-5 text-white z-10">
                      <h3 className="font-extrabold text-base sm:text-lg md:text-xl leading-snug drop-shadow-md line-clamp-2">
                        {dok.judul}
                      </h3>
                      {dok.deskripsi && (
                        <p className="text-white/80 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed drop-shadow-sm font-medium">
                          {dok.deskripsi}
                        </p>
                      )}
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
                Belum Ada Riwayat &amp; Dokumentasi Event
              </h3>
              <p className="text-gray-500 text-sm sm:text-base mb-6 leading-relaxed">
                Belum ada arsip dokumentasi kegiatan yang dipublikasikan saat ini.
              </p>
              <button
                onClick={() => setActiveTab("UPCOMING")}
                className="inline-flex items-center gap-2 bg-[#561269] text-white hover:bg-[#430e52] font-bold text-sm py-2.5 px-6 rounded-full transition-all cursor-pointer"
              >
                Lihat Event yang Akan Datang
              </button>
            </div>
          )
        )}
      </div>

      {/* Modal Lightbox Galeri Foto untuk Klien saat klik kartu dokumentasi */}
      <ClientDokumentasiDetailModal
        isOpen={Boolean(selectedDokumentasi)}
        onClose={() => setSelectedDokumentasi(null)}
        item={selectedDokumentasi}
      />

    </div>
  )
}
