"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { eventService, EventItemApi } from "@/services/event.service"
import { useTenantContext } from "@/context/TenantContext"

export function EventListClient() {
  const { biroPrefix } = useTenantContext()
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST">("UPCOMING")
  const [events, setEvents] = useState<EventItemApi[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      try {
        const res = await eventService.getList({ limit: 50 })
        if (res?.data) {
          setEvents(res.data)
        }
      } catch (err) {
        console.error("Gagal memuat event:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Event yang aktif / akan datang
  const upcomingEvents = events.filter((e) => e.status === "UPCOMING" || e.status === "ONGOING")

  // Event yang sudah selesai / riwayat / portofolio
  const pastEvents = events.filter((e) => e.status === "COMPLETED")

  const displayList = activeTab === "UPCOMING" ? upcomingEvents : pastEvents

  return (
    <div className="min-h-screen bg-[#FDFBF9] pt-28 sm:pt-36 pb-24 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block px-4 py-1.5 bg-purple-50 text-[#561269] text-xs sm:text-sm font-bold rounded-full mb-3 tracking-wide">
            PROGRAM & KEGIATAN EMPATHIKA
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#561269] tracking-tight mb-4">
            Eksplorasi Event & Workshop
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Ikuti berbagai workshop interaktif, webinar inspiratif, serta lihat jejak rekam kegiatan dan event seru yang telah kami laksanakan bersama para ahli.
          </p>

          {/* Tab Selector */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setActiveTab("UPCOMING")}
              className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
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
              className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                activeTab === "PAST"
                  ? "bg-[#561269] text-white shadow-purple-200"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Riwayat & Arsip Kegiatan
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
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
        ) : displayList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {displayList.map((ev) => {
              const tanggalTeks = ev.tanggal
                ? new Date(ev.tanggal).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Jadwal Segera Diumumkan"

              const jamTeks = ev.jam_mulai ? `${ev.jam_mulai} WIB` : "Waktu Belum Ditentukan"
              const hargaNum = Number(ev.harga) || 0
              const hargaTeks = hargaNum === 0 ? "Gratis" : `Rp ${hargaNum.toLocaleString("id-ID")}`
              const isPast = activeTab === "PAST"

              const checkoutHref = biroPrefix
                ? `${biroPrefix}/event/checkout?eventId=${encodeURIComponent(ev.id)}&judul=${encodeURIComponent(ev.judul)}&pembicara=${encodeURIComponent(ev.nama_pembicara)}&kategori=${encodeURIComponent(ev.jenis_event)}&harga=${encodeURIComponent(hargaTeks)}&lokasi=${encodeURIComponent(ev.lokasi || "Online / Sesuai Pengumuman")}&tanggal=${encodeURIComponent(tanggalTeks)}&waktu=${encodeURIComponent(jamTeks)}`
                : `/event/checkout?eventId=${encodeURIComponent(ev.id)}&judul=${encodeURIComponent(ev.judul)}&pembicara=${encodeURIComponent(ev.nama_pembicara)}&kategori=${encodeURIComponent(ev.jenis_event)}&harga=${encodeURIComponent(hargaTeks)}&lokasi=${encodeURIComponent(ev.lokasi || "Online / Sesuai Pengumuman")}&tanggal=${encodeURIComponent(tanggalTeks)}&waktu=${encodeURIComponent(jamTeks)}`

              return (
                <div
                  key={ev.id}
                  className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row group ${
                    isPast ? "opacity-95" : ""
                  }`}
                >
                  <div className="relative h-56 sm:h-auto sm:w-2/5 shrink-0 overflow-hidden bg-gray-100">
                    <Image
                      unoptimized
                      src={
                        ev.banner_url ||
                        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      }
                      alt={ev.judul}
                      fill
                      className={`object-cover transition-transform duration-700 ${
                        isPast ? "grayscale-[20%] group-hover:scale-105" : "group-hover:scale-105"
                      }`}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-extrabold text-[#561269] shadow-sm uppercase tracking-wider">
                      {ev.jenis_event}
                    </div>

                    {isPast && (
                      <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Telah Selesai
                      </div>
                    )}
                  </div>

                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {ev.judul}
                    </h3>

                    {ev.deskripsi && (
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
                        {ev.deskripsi}
                      </p>
                    )}

                    <div className="space-y-1.5 mb-5 mt-auto">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-[#d97706] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{tanggalTeks}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-[#d97706] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">{jamTeks}</span>
                      </div>
                      {ev.lokasi && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2 text-[#d97706] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{ev.lokasi}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-xs shrink-0">
                        {ev.nama_pembicara ? ev.nama_pembicara.charAt(0) : "E"}
                      </div>
                      <div className="text-sm min-w-0">
                        <p className="font-bold text-gray-900 truncate">{ev.nama_pembicara}</p>
                        <p className="text-xs text-gray-500">Narasumber / Pembicara</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                      {isPast ? (
                        <>
                          <div>
                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Status Acara</p>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                              Selesai Dilaksanakan
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 font-medium italic">
                            Arsip Kegiatan
                          </span>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Harga Tiket</p>
                            <p className="text-lg font-black text-[#561269]">{hargaTeks}</p>
                          </div>
                          <Link
                            href={checkoutHref}
                            className="bg-[#EAB308] hover:bg-yellow-500 text-black text-sm font-bold py-2.5 px-6 rounded-2xl transition-colors shrink-0 shadow-sm"
                          >
                            Daftar
                          </Link>
                        </>
                      )}
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
              {activeTab === "UPCOMING"
                ? "Belum Ada Event yang Sedang Berlangsung"
                : "Belum Ada Riwayat Event"}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mb-6 leading-relaxed">
              {activeTab === "UPCOMING"
                ? "Saat ini belum ada event atau workshop yang dibuka untuk pendaftaran. Nantikan informasi kegiatan terbaru dari kami!"
                : "Belum ada event yang ditandai selesai sebagai riwayat arsip kegiatan."}
            </p>
            {activeTab === "UPCOMING" && (
              <button
                onClick={() => setActiveTab("PAST")}
                className="inline-flex items-center gap-2 bg-[#561269] text-white hover:bg-[#430e52] font-bold text-sm py-2.5 px-6 rounded-full transition-all"
              >
                Lihat Riwayat Event Sebelumnya
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

