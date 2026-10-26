'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { DATA_PSIKOLOG_DUMMY } from '@/features/psikolog/dummy'
import { PsikologCard } from '@/features/psikolog/components/client/PsikologCard'
import { HERO_SLIDES } from '../../data/homeData'
import { useHomeSlider } from '../../hooks/useHomeSlider'
import { usePsikologSlider } from '../../hooks/usePsikologSlider'
import { eventService, EventItemApi } from '@/services/event.service'
import { adminService } from '@/services/admin.service'
import { psikotesService, type PaketPsikotesApiResponse } from '@/services/psikotes.service'
import { psikologService } from '@/services/psikolog.service'
import { mapDbPsikologToUI } from '@/features/psikolog/utils/mapPsikolog'
import { PsikologUI } from '@/types/psikolog'
import { useTenantContext } from '@/context/TenantContext'
import { biroPublicService } from '@/services/biro.service'

export default function HomeClient() {
  const { isBiro, slug, biroProfile, biroPrefix, withBiro } = useTenantContext()

  const [publishedEvents, setPublishedEvents] = useState<EventItemApi[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [publishedPsikotes, setPublishedPsikotes] = useState<PaketPsikotesApiResponse[]>([])
  const [loadingPsikotes, setLoadingPsikotes] = useState(true)
  const [psychologists, setPsychologists] = useState<PsikologUI[]>(DATA_PSIKOLOG_DUMMY)
  const [loadingPsychologists, setLoadingPsychologists] = useState(true)
  const [adminProfile, setAdminProfile] = useState<{
    alamat: string
    linkMaps: string
    linkMapsEmbed: string
    email: string
    noTelepon: string
  }>({
    alamat: "Jl. Cikutra No.312, Neglasari\nKec. Cibeunying Kaler, Kota Bandung\nJawa Barat 41024",
    linkMaps: "https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw",
    linkMapsEmbed: "https://www.google.com/maps?q=EMPATHIKA,+Layanan+Konsultasi+Psikologi,+Jl.+Cikutra+No.312,+Neglasari,+Kec.+Cibeunying+Kaler,+Kota+Bandung,+Jawa+Barat+41024&output=embed",
    email: "empathika889@gmail.com",
    noTelepon: "0878-7878-5498",
  })

  useEffect(() => {
    // Ambil paket psikotes yang dipublikasi langsung dari database
    const fetchHomePsikotes = async () => {
      try {
        setLoadingPsikotes(true)
        const res = await psikotesService.getList({ status: 'PUBLISHED' })
        if (res?.data && res.data.length > 0) {
          setPublishedPsikotes(res.data)
        } else {
          setPublishedPsikotes([])
        }
      } catch (err) {
        console.error('Gagal memuat psikotes home:', err)
        setPublishedPsikotes([])
      } finally {
        setLoadingPsikotes(false)
      }
    }
    fetchHomePsikotes()
  }, [])

  useEffect(() => {
    // Ambil event yang berstatus UPCOMING / ONGOING langsung dari backend
    const fetchHomeEvents = async () => {
      try {
        setLoadingEvents(true)
        const res = await eventService.getList({ status: 'UPCOMING', limit: 4 })
        if (res?.data) {
          setPublishedEvents(res.data)
        } else {
          setPublishedEvents([])
        }
      } catch (err) {
        console.error('Gagal memuat event home:', err)
        setPublishedEvents([])
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchHomeEvents()
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("empathika_admin_profile")
      if (saved) {
        const parsed = JSON.parse(saved)
        setAdminProfile((prev) => ({
          ...prev,
          alamat: parsed.alamat || prev.alamat,
          linkMaps: parsed.linkMaps || parsed.link_maps || prev.linkMaps,
          linkMapsEmbed: parsed.linkMapsEmbed || parsed.link_maps_embed || prev.linkMapsEmbed,
          email: parsed.email || prev.email,
          noTelepon: parsed.noTelepon || parsed.no_telepon || prev.noTelepon,
        }))
      }
    } catch {}

    adminService
      .getPublicProfile()
      .then((res) => {
        if (res?.data) {
          const d = res.data
          setAdminProfile((prev) => ({
            ...prev,
            alamat: d.alamat || prev.alamat,
            linkMaps: d.link_maps || d.linkMaps || prev.linkMaps,
            linkMapsEmbed: d.link_maps_embed || d.linkMapsEmbed || prev.linkMapsEmbed,
            email: d.email || prev.email,
            noTelepon: d.no_telepon || d.noTelepon || prev.noTelepon,
          }))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isBiro && biroProfile) {
      setAdminProfile((prev) => ({
        ...prev,
        alamat: biroProfile.alamat || prev.alamat,
        email: biroProfile.owner?.email || prev.email,
        noTelepon: biroProfile.no_telepon || prev.noTelepon,
      }))
    }
  }, [isBiro, biroProfile])

  useEffect(() => {
    // Ambil data psikolog aktif langsung dari database
    const fetchHomePsychologists = async () => {
      try {
        setLoadingPsychologists(true)

        // 1. Jika dalam konteks biro, ambil psikolog terafiliasi dengan biro tersebut
        if (isBiro && slug) {
          try {
            const res = await biroPublicService.getPsikolog(slug)
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
              const mapped = res.data.map(mapDbPsikologToUI)
              setPsychologists(mapped)
              return
            }
          } catch (e) {
            console.warn("Gagal memuat psikolog khusus biro, fallback ke default:", e)
          }
        }

        // 2. Default: Ambil data psikolog platform Empathika
        const dbList = await psikologService.getList()
        const mappedFromDb = Array.isArray(dbList) ? dbList.map(mapDbPsikologToUI) : []
        let combined = mappedFromDb

        try {
          const local = localStorage.getItem("empathika_tenaga_ahli_data")
          if (local) {
            const parsed = JSON.parse(local)
            if (Array.isArray(parsed) && parsed.length > 0) {
              const dbIds = new Set(mappedFromDb.map((m) => m.id))
              const dbEmails = new Set(mappedFromDb.map((m) => m.email?.toLowerCase()).filter(Boolean))
              const localOnly = parsed
                .filter((loc: any) => !dbIds.has(loc.id) && (!loc.email || !dbEmails.has(loc.email.toLowerCase())) && loc.statusAkses !== "NONAKTIF" && loc.status !== "INACTIVE")
                .map(mapDbPsikologToUI)
              combined = [...mappedFromDb, ...localOnly]
            }
          }
        } catch {}

        if (combined.length > 0) {
          setPsychologists(combined)
        } else {
          setPsychologists(DATA_PSIKOLOG_DUMMY)
        }
      } catch (err) {
        console.error('Gagal memuat psikolog home:', err)
        try {
          const local = localStorage.getItem("empathika_tenaga_ahli_data")
          if (local) {
            const parsed = JSON.parse(local)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPsychologists(parsed.filter((loc: any) => loc.statusAkses !== "NONAKTIF" && loc.status !== "INACTIVE").map(mapDbPsikologToUI))
              return
            }
          }
        } catch {}
        setPsychologists(DATA_PSIKOLOG_DUMMY)
      } finally {
        setLoadingPsychologists(false)
      }
    }

    fetchHomePsychologists()

    window.addEventListener("storage", fetchHomePsychologists)
    window.addEventListener("focus", fetchHomePsychologists)

    return () => {
      window.removeEventListener("storage", fetchHomePsychologists)
      window.removeEventListener("focus", fetchHomePsychologists)
    }
  }, [])

  const {
    currentSlide,
    setCurrentSlide,
    setIsHovered,
    nextSlide,
    prevSlide,
  } = useHomeSlider(HERO_SLIDES.length);

  const {
    activePsyIndex,
    nextPsy,
    prevPsy,
    scrollPsyTo,
    handlePsyScroll,
  } = usePsikologSlider(psychologists.length);


  return (
    // Menghapus padding atas agar hero section menempel ke atas halaman dan berada di bawah navbar transparent
    <div className="w-full font-sans bg-[#f8f9fa] pb-16 lg:pb-24">

      {/* ======================================= */}
      {/* FULL WIDTH HERO CAROUSEL TEXT OVERLAY */}
      {/* ======================================= */}
      <section
        className="relative w-full h-[425px] md:h-[525px] lg:h-[610px] overflow-hidden bg-gray-900"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            {/* Background Image Full Width dengan Overlay Gelap */}
            <div className="absolute inset-0 w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay gelap kebiruan agar teks putih terbaca jelas seperti di referensi */}
              <div className="absolute inset-0 bg-[#0c232e]/60 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c232e]/80 to-transparent" />
            </div>

            {/* Konten Text Overlay di Kiri */}
            <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-12 md:px-16 lg:px-24 flex flex-col justify-center items-start pt-16 lg:pt-20">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-white mb-4 lg:mb-6 max-w-3xl leading-[1.2] drop-shadow-md">
                {slide.title}
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 lg:mb-8 max-w-2xl font-light leading-relaxed drop-shadow-sm">
                {slide.subtitle}
              </p>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                <Link
                  href={biroPrefix ? `${biroPrefix}/konseling` : "/konseling"}
                  className="bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-sm md:text-base py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Booking Sesi
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows di Kiri dan Kanan */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 text-white/50 hover:text-white transition-colors p-2"
          aria-label="Previous slide"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 text-white/50 hover:text-white transition-colors p-2"
          aria-label="Next slide"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* Dots Indicator Garis (Bottom Center) */}
        <div className="absolute bottom-20 lg:bottom-24 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`transition-all duration-300 rounded-full h-1.5 ${idx === currentSlide ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/80'
                }`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ======================================= */}
      {/* OVERLAPPING STATS SECTION */}
      {/* ======================================= */}
      <div className="relative z-40 max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 lg:-mt-12">
        <div className="bg-gradient-to-b from-[#e5e7eb] to-[#f3f4f6] rounded-[2rem] shadow-xl py-6 lg:py-8 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 lg:gap-6 text-center">
          
          <div className="flex-1 w-full flex flex-col items-center">
            <h3 className="text-2xl lg:text-4xl font-bold text-[#d97706] mb-1.5 lg:mb-2">0+</h3>
            <p className="text-gray-600 text-[12px] md:text-[13px] font-medium px-2 leading-snug max-w-[200px]">
              Cerita telah dipercayakan kepada kami
            </p>
          </div>
          
          <div className="flex-1 w-full flex flex-col items-center">
            <h3 className="text-2xl lg:text-4xl font-bold text-[#d97706] mb-1.5 lg:mb-2">0+</h3>
            <p className="text-gray-600 text-[12px] md:text-[13px] font-medium px-2 leading-snug max-w-[200px]">
              Praktisi profesional berlisensi dan berpengalaman
            </p>
          </div>
          
          <div className="flex-1 w-full flex flex-col items-center">
            <h3 className="text-2xl lg:text-4xl font-bold text-[#d97706] mb-1.5 lg:mb-2">0%</h3>
            <p className="text-gray-600 text-[12px] md:text-[13px] font-medium px-2 leading-snug max-w-[200px]">
              #PejuangKesehatanMental merasa puas
            </p>
          </div>
          
          <div className="flex-1 w-full flex flex-col items-center">
            <h3 className="text-2xl lg:text-4xl font-bold text-[#d97706] mb-1.5 lg:mb-2">0%</h3>
            <p className="text-gray-600 text-[12px] md:text-[13px] font-medium px-2 leading-snug max-w-[200px]">
              #PejuangKesehatanMental rutin kembali
            </p>
          </div>

        </div>
      </div>

      {/* ======================================= */}
      {/* UPCOMING EVENTS SECTION */}
      {/* ======================================= */}
      <section id="event" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32 scroll-mt-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#561269] mb-3">Yuk, Ikuti Event Kami</h2>
            <p className="text-gray-600 text-base max-w-2xl">
              Jangan lewatkan berbagai webinar dan kelas interaktif bersama psikolog ahli untuk mendukung kesehatan mentalmu.
            </p>
          </div>
          <Link href={biroPrefix ? `${biroPrefix}/layanan?category=04` : "/layanan?category=04"} className="text-[#561269] font-semibold flex items-center hover:text-[#763E8B] transition-colors whitespace-nowrap">
            Lihat Semua Event
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>

        {/* Jika ada event aktif dipublikasi */}
        {publishedEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {publishedEvents.map((ev) => {
              // Format tanggal
              let tanggalTeks = ev.tanggal
              try {
                const d = new Date(ev.tanggal)
                if (!isNaN(d.getTime())) {
                  tanggalTeks = d.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                }
              } catch {}

              // Format jam
              let jamTeks = "09:00 WIB"
              try {
                const t = new Date(ev.jam_mulai)
                if (!isNaN(t.getTime())) {
                  const hh = String(t.getUTCHours()).padStart(2, "0")
                  const mm = String(t.getUTCMinutes()).padStart(2, "0")
                  jamTeks = `${hh}:${mm} WIB`
                } else if (typeof ev.jam_mulai === "string") {
                  jamTeks = `${ev.jam_mulai.slice(0, 5)} WIB`
                }
              } catch {}

              const hargaNum = typeof ev.harga === "string" ? parseFloat(ev.harga) : ev.harga
              const hargaTeks = hargaNum > 0 ? `Rp ${hargaNum.toLocaleString("id-ID")}` : "Gratis"

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row group"
                >
                  <div className="relative h-56 sm:h-auto sm:w-2/5 shrink-0 overflow-hidden bg-gray-100">
                    <Image
                      unoptimized
                      src={ev.banner_url || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                      alt={ev.judul}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-extrabold text-[#561269] shadow-sm uppercase tracking-wider">
                      {ev.jenis_event}
                    </div>
                  </div>
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {ev.judul}
                    </h3>

                    <div className="space-y-1.5 mb-5">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {tanggalTeks}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {jamTeks}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-xs shrink-0">
                        {ev.nama_pembicara.charAt(0)}
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-gray-900">{ev.nama_pembicara}</p>
                        <p className="text-xs text-gray-500">Narasumber / Pembicara</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Harga Tiket</p>
                        <p className="text-lg font-black text-[#561269]">{hargaTeks}</p>
                      </div>
                      <Link
                        href={biroPrefix ? `${biroPrefix}/event/checkout?judul=${encodeURIComponent(ev.judul)}&pembicara=${encodeURIComponent(ev.nama_pembicara)}&kategori=${encodeURIComponent(ev.jenis_event)}&harga=${encodeURIComponent(hargaTeks)}&lokasi=${encodeURIComponent(ev.lokasi || "Online / Sesuai Pengumuman")}&tanggal=${encodeURIComponent(tanggalTeks)}&waktu=${encodeURIComponent(jamTeks)}` : `/event/checkout?judul=${encodeURIComponent(ev.judul)}&pembicara=${encodeURIComponent(ev.nama_pembicara)}&kategori=${encodeURIComponent(ev.jenis_event)}&harga=${encodeURIComponent(hargaTeks)}&lokasi=${encodeURIComponent(ev.lokasi || "Online / Sesuai Pengumuman")}&tanggal=${encodeURIComponent(tanggalTeks)}&waktu=${encodeURIComponent(jamTeks)}`}
                        className="bg-[#EAB308] hover:bg-yellow-500 text-black text-sm font-bold py-2.5 px-6 rounded-2xl transition-colors shrink-0 shadow-sm"
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
          /* Empty State: Belum ada event yang dipublikasi */
          <div className="w-full bg-gradient-to-br from-white via-purple-50/30 to-purple-100/20 rounded-[2.5rem] border border-purple-100/80 p-8 sm:p-12 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-100/80 text-[#561269] flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Saat Ini Belum Ada Event yang Sedang Berlangsung
            </h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mb-6 leading-relaxed">
              Mohon maaf, saat ini belum ada webinar atau workshop yang kami jadwalkan. Kamu bisa membaca informasi lengkap seputar rangkaian program event dan kegiatan menarik kami di halaman layanan.
            </p>
            <Link
              href={biroPrefix ? `${biroPrefix}/layanan?category=04` : "/layanan?category=04"}
              className="inline-flex items-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-sm sm:text-base py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <span>Pelajari Rangkaian Event Empathika</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* ======================================= */}
      {/* OUR SERVICES SECTION */}
      {/* ======================================= */}
      <section id="layanan" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32 pb-24 lg:pb-32 scroll-mt-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#561269] mb-3">Jelajahi Layanan Kami</h2>
            <p className="text-gray-600 text-base max-w-2xl">
              Pilih layanan psikologi dan konseling yang paling sesuai dengan kebutuhanmu saat ini. Kami siap mendengar dan membantu.
            </p>
          </div>
          <Link href={biroPrefix ? `${biroPrefix}/layanan` : "/layanan"} className="text-[#561269] font-semibold flex items-center hover:text-[#763E8B] transition-colors whitespace-nowrap">
            Lihat Semua Layanan
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Service Card 1 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <svg className="w-24 h-24 text-[#561269]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
            </div>
            <div className="w-14 h-14 bg-[#561269]/10 rounded-2xl flex items-center justify-center mb-6 text-[#561269] group-hover:bg-[#561269] group-hover:text-white transition-colors duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h3 className="font-bold text-2xl text-gray-900 mb-3 relative z-10">Konsultasi</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1 relative z-10 leading-relaxed">
              Dapatkan ruang aman untuk bercerita dan mencari solusi bersama tenaga ahli. Kami menyediakan konseling individu maupun kelompok sesuai dengan kebutuhan psikologis Anda.
            </p>
            <Link href={biroPrefix ? `${biroPrefix}/layanan?category=02` : "/layanan?category=02"} className="text-[#d97706] font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300 relative z-10">
              Lihat Detail
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>

          {/* Service Card 2 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <svg className="w-24 h-24 text-[#d97706]" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z"></path></svg>
            </div>
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-[#d97706] group-hover:bg-[#d97706] group-hover:text-white transition-colors duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h3 className="font-bold text-2xl text-gray-900 mb-3 relative z-10">Pelatihan Peer Helper</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1 relative z-10 leading-relaxed">
              Program pelatihan khusus yang dirancang untuk membekali Anda dengan keterampilan dasar konseling, empati, dan cara tepat dalam mendampingi teman sebaya.
            </p>
            <Link href={biroPrefix ? `${biroPrefix}/layanan?category=03` : "/layanan?category=03"} className="text-[#561269] font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300 relative z-10">
              Lihat Detail
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>

          {/* Service Card 3 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <svg className="w-24 h-24 text-[#561269]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path></svg>
            </div>
            <div className="w-14 h-14 bg-[#561269]/10 rounded-2xl flex items-center justify-center mb-6 text-[#561269] group-hover:bg-[#561269] group-hover:text-white transition-colors duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="font-bold text-2xl text-gray-900 mb-3 relative z-10">Asesmen</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1 relative z-10 leading-relaxed">
              Pemetaan kondisi psikologis secara komprehensif, mulai dari minat bakat, kepribadian, hingga evaluasi kesiapan kerja menggunakan alat ukur yang valid dan terpercaya.
            </p>
            <Link href={biroPrefix ? `${biroPrefix}/layanan?category=05` : "/layanan?category=05"} className="text-[#d97706] font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300 relative z-10">
              Lihat Detail
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>

        </div>
      </section>

      {/* ======================================= */}
      {/* PSYCHOLOGISTS / PROFESSIONALS SECTION */}
      {/* ======================================= */}
      <section id="psikolog" className="w-full bg-[#f4f2ee] pt-8 lg:pt-12 pb-12 lg:pb-16 relative overflow-hidden scroll-mt-28">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center mb-4 md:mb-6">
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#561269] mb-2 tracking-tight">Kenali Psikolog Kami</h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto font-medium">
            Temukan psikolog yang siap mendengarkan, memahami,<br className="hidden md:block" /> dan mendampingi perjalananmu.
          </p>
          
        </div>

        {/* Horizontal Scroll / Slider Container */}
        <div 
          id="psy-scroll-container"
          onScroll={handlePsyScroll}
          className="flex overflow-x-auto -space-x-1 md:-space-x-3 pb-4 pt-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] items-center"
        >
          {/* Spacer untuk memastikan card pertama dan terakhir bisa berada di tengah */}
          <div className="shrink-0 w-[calc(50%-120px)] md:w-[calc(50%-140px)]" aria-hidden="true"></div>
          
          {psychologists.map((psy, idx) => {
            const offset = Math.abs(idx - activePsyIndex);
            const isActive = offset === 0;
            const isLeft = idx < activePsyIndex;
            
            // Layout math for coverflow-like design
            let scale = 1;
            let filter = 'none';
            let opacity = 1;
            let zIndex = 30;
            
            if (offset === 1) {
              scale = 0.85;
              filter = 'none';
              opacity = 0.9;
              zIndex = 20;
            } else if (offset === 2) {
              scale = 0.75;
              filter = 'none';
              opacity = 0.7;
              zIndex = 10;
            } else if (offset > 2) {
              scale = 0.65;
              filter = 'none';
              opacity = 0.4;
              zIndex = 0;
            }

            return (
              <div 
                key={psy.id}
                className="psy-card snap-center shrink-0 w-[240px] md:w-[280px] transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ 
                  transform: `scale(${scale})`,
                  zIndex,
                  opacity,
                  filter,
                  transformOrigin: 'center center'
                }}
                onClick={() => scrollPsyTo(idx)}
              >
                <PsikologCard psikolog={psy} showJadwal={false} />
              </div>
            );
          })}
          
          {/* Spacer penutup */}
          <div className="shrink-0 w-[calc(50%-120px)] md:w-[calc(50%-140px)]" aria-hidden="true"></div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-1">
          <button 
            onClick={prevPsy}
            disabled={activePsyIndex === 0}
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-white hover:text-[#1c352d] transition-colors disabled:opacity-30 disabled:hover:bg-transparent shadow-sm"
          >
            <svg className="w-5 h-5 pr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          {/* Pagination Dots */}
          <div className="flex items-center gap-2">
            {psychologists.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => scrollPsyTo(idx)}
                className={`rounded-full transition-all duration-500 ${
                  idx === activePsyIndex ? 'bg-[#1c352d] w-3 h-3' : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextPsy}
            disabled={activePsyIndex === psychologists.length - 1}
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-white hover:text-[#1c352d] transition-colors disabled:opacity-30 disabled:hover:bg-transparent shadow-sm"
          >
            <svg className="w-5 h-5 pl-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </section>

      {/* ======================================= */}
      {/* PSIKOTES SECTION */}
      {/* ======================================= */}
      <section id="psikotes" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 scroll-mt-28">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#561269] tracking-tight">
            Kenali Dirimu dengan Psikotes <span className="font-bold">Empathika</span>
          </h2>
          <Link href={biroPrefix ? `${biroPrefix}/layanan?category=01` : "/layanan?category=01"} className="text-[#561269] font-semibold flex items-center hover:text-[#763E8B] transition-colors whitespace-nowrap">
            Lihat Semua Psikotes
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>

        {publishedPsikotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedPsikotes.map((item, idx) => {
              const bgColors = ["bg-[#f48520]", "bg-[#561269]", "bg-[#1c352d]", "bg-[#f0d164]", "bg-[#e31e3d]"]
              const textColors = ["text-white", "text-white", "text-white", "text-gray-900", "text-white"]
              const bgColor = bgColors[idx % bgColors.length]
              const textColor = textColors[idx % textColors.length]

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <div className={`h-48 w-full ${bgColor} overflow-hidden relative`}>
                    <div className="absolute inset-0 flex items-start p-6">
                      <div className="text-left w-full">
                        <h3 className={`${textColor} font-bold text-2xl leading-tight mb-1 uppercase drop-shadow-sm line-clamp-2`}>
                          {item.judul}
                        </h3>
                        <p className={`${textColor} text-xs font-medium opacity-90 drop-shadow-sm line-clamp-2`}>
                          {item.deskripsi || "Asesmen psikologi terstruktur untuk mengenali diri."}
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
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight line-clamp-2">
                      {item.judul}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2">
                      {item.deskripsi || "Tes psikologi ini dirancang untuk memberikan gambaran akurat mengenai dirimu."}
                    </p>

                    <div className="mt-auto">
                      <Link
                        href={biroPrefix ? `${biroPrefix}/psikotes/${item.id}` : `/psikotes/${item.id}`}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
              <div className="h-48 w-full bg-[#f48520] overflow-hidden relative">
                <div className="absolute inset-0 flex items-start p-6">
                  <div className="text-left w-full">
                    <h3 className="text-white font-bold text-[28px] leading-none mb-2 uppercase drop-shadow-sm">TES 16 KEPRIBADIAN</h3>
                    <p className="text-white text-sm font-medium drop-shadow-sm">(MBTI) Bahasa Indonesia</p>
                  </div>
                </div>
                {/* Abstract decorative shapes */}
                <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay">
                   <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="white"/><circle cx="50" cy="120" r="50" fill="white"/></svg>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-6 leading-tight">Tes Online 16 Kepribadian (MBTI)...</h3>
                
                <div className="mt-auto">
                  <Link href={biroPrefix ? `${biroPrefix}/psikotes/mbti` : "/psikotes/mbti"} className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
                    Ikuti Tes
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
              <div className="h-48 w-full bg-[#f0d164] overflow-hidden relative">
                <div className="absolute inset-0 flex items-start p-6">
                  <div className="text-left w-full">
                    <h3 className="text-gray-900 font-extrabold text-[28px] leading-[1.1] mb-2 drop-shadow-sm">Tes Online 16<br/>Kepribadian</h3>
                    <p className="text-gray-800 text-sm font-medium drop-shadow-sm">(MBTI) Bahasa Indonesia</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 right-0 opacity-20 mix-blend-overlay">
                   <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="black"/><circle cx="50" cy="120" r="50" fill="black"/></svg>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-6 leading-tight">Tes Online 16 Kepribadian (MBTI)...</h3>
                
                <div className="mt-auto">
                  <Link href={biroPrefix ? `${biroPrefix}/psikotes/mbti-2` : "/psikotes/mbti-2"} className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
                    Ikuti Tes
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
              <div className="h-48 w-full bg-[#e31e3d] overflow-hidden relative">
                <div className="absolute inset-0 flex items-start p-6">
                  <div className="text-left w-full">
                    <h3 className="text-white font-extrabold text-[28px] leading-none mb-2 drop-shadow-sm uppercase">TES LOVE<br/>LANGUAGE</h3>
                  </div>
                </div>
                <div className="absolute bottom-4 right-10">
                   <svg className="w-16 h-16 text-pink-300 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-6 leading-tight">Tes Love Language: 5 Tipe Bahasa Cinta...</h3>
                
                <div className="mt-auto">
                  <Link href={biroPrefix ? `${biroPrefix}/psikotes/love-language` : "/psikotes/love-language"} className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
                    Ikuti Tes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ======================================= */}
      {/* MAPS / LOCATION SECTION */}
      {/* ======================================= */}
      <section id="tentang-kami" className="w-full bg-[#f8f7f5] py-20 lg:py-28 border-t border-gray-200 scroll-mt-28">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#561269] mb-4 tracking-tight">Kunjungi Kami</h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
              Layanan tatap muka tersedia di klinik utama kami. Mari bertemu dan berdiskusi secara langsung.
            </p>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-gray-200">
              <iframe 
                src={adminProfile.linkMapsEmbed || `https://www.google.com/maps?q=${encodeURIComponent(adminProfile.alamat || "EMPATHIKA, Layanan Konsultasi Psikologi, Jl. Cikutra No.312, Neglasari, Kec. Cibeunying Kaler, Kota Bandung, Jawa Barat 41024")}&output=embed`} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
            
            <div className="w-full lg:w-1/3 flex flex-col justify-center">
              <h3 className="font-bold text-2xl text-gray-900 mb-4">Klinik Empathika</h3>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#1c352d]/10 flex items-center justify-center text-[#1c352d] shrink-0 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Alamat</p>
                  <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                    {adminProfile.alamat}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#1c352d]/10 flex items-center justify-center text-[#1c352d] shrink-0 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Kontak</p>
                  <p className="text-gray-500 text-sm mb-1.5 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    {adminProfile.email}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    {adminProfile.noTelepon}
                  </p>
                </div>
              </div>
              
              <a href={adminProfile.linkMaps || "https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw"} target="_blank" rel="noopener noreferrer" className="w-full bg-[#1c352d] text-white font-semibold py-3 rounded-xl hover:bg-[#2c4c41] transition-colors shadow-md flex items-center justify-center gap-2 mt-2">
                Dapatkan Petunjuk Arah
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>

            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
