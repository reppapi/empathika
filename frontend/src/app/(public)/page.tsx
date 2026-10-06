'use client'
import Image from 'next/image'

import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Data disesuaikan dengan teks dari referensi gambar
  const heroSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Konseling dengan Psikolog Profesional, Terbaik dan Terpercaya di Indonesia",
      subtitle: "Sedang merasa tidak baik-baik saja? Jangan simpan sendiri masalah yang kamu miliki, mari berproses bersama Empathika",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Tingkatkan Kualitas Hidup Anda Melalui Sesi Edukasi Interaktif",
      subtitle: "Ikuti berbagai sesi edukasi dan workshop interaktif dari para pakar psikologi yang dirancang untuk mendukung keseharian mental Anda.",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1516302752946-609c4d68e2f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Kenali Potensi Diri Lebih Dalam Melalui Psikotes Terpercaya",
      subtitle: "text deskripsi",
    }
  ]

  // Auto slide
  useEffect(() => {
    if (isHovered) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))
    }, 6000)
    return () => clearInterval(interval)
  }, [isHovered, heroSlides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))

  // Data Psikolog
  const psychologists = [
    {
      id: 1,
      name: "Putri, M.Psi",
      role: "Psikolog Klinis",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      name: "Raka Aditya, M.Psi",
      role: "Psikolog Klinis",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      name: "Amara Putri, M.Psi",
      role: "Psikolog Klinis",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      name: "Davin Pratama, M.Psi",
      role: "Konselor",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      name: "Salsabila Rahma, M.Psi",
      role: "Psikolog Klinis",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 6,
      name: "Fadhil Satria, M.Psi",
      role: "Konselor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ]

  const [activePsyIndex, setActivePsyIndex] = useState(2)

  useEffect(() => {
    // Center the carousel on initial load
    const timer = setTimeout(() => {
      scrollPsyTo(2);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollPsyTo = (index: number) => {
    const container = document.getElementById('psy-scroll-container')
    const cards = container?.querySelectorAll('.psy-card')
    if (container && cards && cards[index]) {
      const card = cards[index] as HTMLElement
      const scrollTarget = card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2
      container.scrollTo({ left: scrollTarget, behavior: 'smooth' })
    }
  }

  const nextPsy = () => {
    if (activePsyIndex < psychologists.length - 1) scrollPsyTo(activePsyIndex + 1)
  }
  const prevPsy = () => {
    if (activePsyIndex > 0) scrollPsyTo(activePsyIndex - 1)
  }

  const handlePsyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollCenter = container.scrollLeft + container.clientWidth / 2
    
    const cards = container.querySelectorAll('.psy-card')
    let closestIdx = 0
    let minDistance = Infinity
    
    cards.forEach((card, idx) => {
      const el = card as HTMLElement
      const cardCenter = el.offsetLeft + el.clientWidth / 2
      const distance = Math.abs(cardCenter - scrollCenter)
      
      if (distance < minDistance) {
        minDistance = distance
        closestIdx = idx
      }
    })
    
    if (activePsyIndex !== closestIdx) {
      setActivePsyIndex(closestIdx)
    }
  }

  return (
    // Menghilangkan padding atas agar hero banner berada di bawah navbar (overlap) karena navbar transparent
    <div className="w-full font-sans bg-[#f8f9fa] pb-16 lg:pb-24">

      {/* ======================================= */}
      {/* FULL WIDTH HERO CAROUSEL TEXT OVERLAY */}
      {/* ======================================= */}
      <section
        className="relative w-full h-[425px] md:h-[525px] lg:h-[610px] overflow-hidden bg-gray-900"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {heroSlides.map((slide, idx) => (
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

              {/* Dua Tombol (Solid Orange & Outlined Orange) */}
              <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                <button className="bg-[#d97706] hover:bg-[#b45309] text-white font-medium text-sm md:text-base py-3 px-8 rounded-full transition-colors shadow-lg">
                  Booking Sesi
                </button>
                <button className="bg-transparent hover:bg-white/10 text-[#d97706] border border-[#d97706] font-medium text-sm md:text-base py-3 px-8 rounded-full transition-colors">
                  Tes Psikologis
                </button>
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
          {heroSlides.map((_, idx) => (
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
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Yuk, Ikuti Event Kami</h2>
            <p className="text-gray-600 text-base max-w-2xl">
              Jangan lewatkan berbagai webinar dan kelas interaktif bersama psikolog ahli untuk mendukung kesehatan mentalmu.
            </p>
          </div>
          <button className="text-[#561269] font-semibold flex items-center hover:text-[#763E8B] transition-colors whitespace-nowrap">
            Lihat Semua Event
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Card 1 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row group">
            <div className="relative h-56 sm:h-auto sm:w-2/5 shrink-0 overflow-hidden">
              <Image unoptimized src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Event" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-extrabold text-[#561269] shadow-sm uppercase tracking-wider">Webinar</div>
            </div>
            <div className="p-5 md:p-6 flex flex-col flex-1">
              <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2 line-clamp-2 leading-tight">Overcoming Burnout: Mengelola Lelah Mental di Tempat Kerja</h3>
              
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Sabtu, 24 Oktober 2026
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  19:00 - 21:00 WIB
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 relative"><Image unoptimized src="https://ui-avatars.com/api/?name=Sarah+M&background=561269&color=fff" alt="Speaker" fill className="object-cover" /></div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">Sarah M., M.Psi</p>
                  <p className="text-xs text-gray-500">Psikolog Klinis</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Harga Tiket</p>
                  <p className="text-lg font-black text-[#561269]">Rp 50.000</p>
                </div>
                <button className="bg-[#561269] hover:bg-[#763E8B] text-white text-sm font-bold py-2.5 px-6 rounded-2xl transition-colors shrink-0">Daftar</button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row group">
            <div className="relative h-56 sm:h-auto sm:w-2/5 shrink-0 overflow-hidden">
              <Image unoptimized src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Event" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-extrabold text-[#d97706] shadow-sm uppercase tracking-wider">Workshop</div>
            </div>
            <div className="p-5 md:p-6 flex flex-col flex-1">
              <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2 line-clamp-2 leading-tight">Seni Mengenali Diri Sendiri & Self-Healing Therapy</h3>
              
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Minggu, 1 November 2026
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  10:00 - 14:00 WIB
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 relative"><Image unoptimized src="https://ui-avatars.com/api/?name=Dr+Andi&background=d97706&color=fff" alt="Speaker" fill className="object-cover" /></div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">Dr. Andi Pratama</p>
                  <p className="text-xs text-gray-500">Pakar Mindfulness</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Harga Tiket</p>
                  <p className="text-lg font-black text-[#561269]">Rp 150.000</p>
                </div>
                <button className="bg-[#561269] hover:bg-[#763E8B] text-white text-sm font-bold py-2.5 px-6 rounded-2xl transition-colors shrink-0">Daftar</button>
              </div>
            </div>
          </div>



        </div>
      </section>

      {/* ======================================= */}
      {/* OUR SERVICES SECTION */}
      {/* ======================================= */}
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32 pb-24 lg:pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Jelajahi Layanan Kami</h2>
            <p className="text-gray-600 text-base max-w-2xl">
              Pilih layanan psikologi dan konseling yang paling sesuai dengan kebutuhanmu saat ini. Kami siap mendengar dan membantu.
            </p>
          </div>
          <button className="text-[#561269] font-semibold flex items-center hover:text-[#763E8B] transition-colors whitespace-nowrap">
            Lihat Semua Layanan
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
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
            <button className="text-[#d97706] font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300 relative z-10">
              Pelajari Lebih Lanjut
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
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
            <button className="text-[#561269] font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300 relative z-10">
              Pelajari Lebih Lanjut
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
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
            <button className="text-[#d97706] font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300 relative z-10">
              Pelajari Lebih Lanjut
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
          </div>

        </div>
      </section>

      {/* ======================================= */}
      {/* PSYCHOLOGISTS / PROFESSIONALS SECTION */}
      {/* ======================================= */}
      <section className="w-full bg-[#f4f2ee] pt-8 lg:pt-12 pb-12 lg:pb-16 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center mb-4 md:mb-6">
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1c352d] mb-2 tracking-tight">Kenali Psikolog Kami</h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto font-medium">
            Temukan psikolog yang siap mendengarkan, memahami,<br className="hidden md:block" /> dan mendampingi perjalananmu.
          </p>
          
        </div>

        {/* Horizontal Scroll / Slider Container */}
        <div 
          id="psy-scroll-container"
          onScroll={handlePsyScroll}
          className="flex overflow-x-auto gap-2 md:gap-6 pb-16 pt-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] items-center"
        >
          {/* Spacer untuk memastikan card pertama dan terakhir bisa berada di tengah */}
          <div className="shrink-0 w-[calc(50%-120px)] md:w-[calc(50%-140px)]" aria-hidden="true"></div>
          
          {psychologists.map((psy, idx) => {
            const offset = Math.abs(idx - activePsyIndex);
            const isActive = offset === 0;
            const isLeft = idx < activePsyIndex;
            
            // Perhitungan fan-out effect (rotateZ) yang lebih halus (subtle)
            let scale = 1;
            let rotate = 0;
            let translateY = 0;
            let opacity = 1;
            let zIndex = 30;
            
            if (offset === 1) {
              scale = 0.95;
              rotate = isLeft ? -3 : 3;
              translateY = 8;
              opacity = 0.95;
              zIndex = 20;
            } else if (offset === 2) {
              scale = 0.9;
              rotate = isLeft ? -6 : 6;
              translateY = 16;
              opacity = 0.75;
              zIndex = 10;
            } else if (offset > 2) {
              scale = 0.85;
              rotate = isLeft ? -9 : 9;
              translateY = 24;
              opacity = 0.4;
              zIndex = 0;
            }

            return (
              <div 
                key={psy.id}
                className="psy-card snap-center shrink-0 w-[240px] md:w-[280px] rounded-3xl overflow-hidden shadow-xl group cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col"
                style={{ 
                  transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                  zIndex,
                  opacity,
                  transformOrigin: 'bottom center'
                }}
                onClick={() => scrollPsyTo(idx)}
              >
                <div className="relative h-56 md:h-64 w-full overflow-hidden bg-gray-200">
                  <Image unoptimized src={psy.image} alt={psy.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className={`p-5 md:p-6 flex-1 flex flex-col transition-colors duration-500 border-x border-b border-gray-100/50 rounded-b-3xl ${isActive ? 'bg-[#f8f7f5]' : 'bg-white'}`}>
                  <h3 className="font-bold text-lg md:text-xl text-[#1c352d] mb-1">{psy.name}</h3>
                  <p className="text-gray-500 text-xs md:text-sm font-medium mb-6">{psy.role}</p>
                  
                  <div className="mt-auto">
                    <button className={`w-full py-2.5 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isActive 
                        ? 'bg-[#2c4c41] text-white hover:bg-[#1c352d] shadow-md' 
                        : 'bg-transparent text-[#2c4c41] border border-[#2c4c41]/20 hover:bg-[#2c4c41]/5'
                    }`}>
                      Lihat Profil
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Spacer penutup */}
          <div className="shrink-0 w-[calc(50%-120px)] md:w-[calc(50%-140px)]" aria-hidden="true"></div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-4">
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
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Kenali Dirimu dengan Psikotes <span className="font-bold">Empathika</span>
          </h2>
          <a href="#" className="text-[#561269] font-semibold flex items-center hover:text-[#763E8B] transition-colors whitespace-nowrap">
            Lihat Semua Psikotes
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>

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
                <button className="w-full py-3 rounded-[100px] border border-gray-400 text-gray-900 font-bold text-sm hover:bg-gray-100 transition-colors">
                  Ikuti Tes
                </button>
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
                <button className="w-full py-3 rounded-[100px] border border-gray-400 text-gray-900 font-bold text-sm hover:bg-gray-100 transition-colors">
                  Ikuti Tes
                </button>
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
                <button className="w-full py-3 rounded-[100px] border border-gray-400 text-gray-900 font-bold text-sm hover:bg-gray-100 transition-colors">
                  Ikuti Tes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================= */}
      {/* MAPS / LOCATION SECTION */}
      {/* ======================================= */}
      <section className="w-full bg-[#f8f7f5] py-20 lg:py-28 border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1c352d] mb-4 tracking-tight">Kunjungi Kami</h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
              Layanan tatap muka tersedia di klinik utama kami. Mari bertemu dan berdiskusi secara langsung.
            </p>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-gray-200">
              <iframe 
                src="https://www.google.com/maps?q=EMPATHIKA,+Layanan+Konsultasi+Psikologi,+Jl.+Cikutra+No.312,+Neglasari,+Kec.+Cibeunying+Kaler,+Kota+Bandung,+Jawa+Barat+41024&output=embed" 
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
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Jl. Cikutra No.312, Neglasari<br />
                    Kec. Cibeunying Kaler, Kota Bandung<br />
                    Jawa Barat 41024
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
                    empathika889@gmail.com
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    0878-7878-5498
                  </p>
                </div>
              </div>
              
              <a href="https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw" target="_blank" rel="noopener noreferrer" className="w-full bg-[#1c352d] text-white font-semibold py-3 rounded-xl hover:bg-[#2c4c41] transition-colors shadow-md flex items-center justify-center gap-2 mt-2">
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
