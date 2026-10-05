"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { name: "home", path: "/" },
    { name: "layanan", path: "/layanan" },
    { name: "konseling", path: "/konseling" },
    { name: "psikolog", path: "/psikolog" },
    { name: "blog", path: "/blog" },
    { name: "kerja sama", path: "/kerja-sama" },
    { name: "tentang kami", path: "/tentang-kami" },
  ]

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full pt-4 px-4 font-poppins lg:bg-transparent bg-white/90 lg:backdrop-blur-none backdrop-blur-md pb-3 lg:pb-0 lg:pt-6">
        <div className="mx-auto w-full max-w-[1400px]">
          
          {/* ============================== */}
          {/* TAMPILAN DESKTOP / LAPTOP      */}
          {/* ============================== */}
          <div className="hidden lg:flex items-center justify-center gap-10 xl:gap-14">
            <Link 
              href="/"
              className="flex items-center gap-3 transition-transform hover:scale-105"
              aria-label="Home"
            >
              <div className="h-14 w-14 shrink-0 rounded-full bg-[#561269]"></div>
              <span className="text-[24px] font-extrabold tracking-widest text-[#561269] uppercase">
                EMPATHIKA
              </span>
            </Link>

            <nav className="flex items-center rounded-full bg-[#561269] px-2 py-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.path)
                return (
                  <Link
                    key={link.name}
                    href={link.path as any}
                    className={`rounded-full px-5 py-2 text-[14px] font-normal lowercase tracking-wide transition-colors ${
                      active 
                        ? "bg-[#763E8B] text-white" 
                        : "text-white hover:text-gray-200"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>

            <Link 
              href={"/booking" as any}
              className="flex h-14 shrink-0 items-center justify-center rounded-full bg-[#561269] px-6 text-[14px] font-normal lowercase tracking-wide text-white transition-transform hover:scale-105"
            >
              booking sesi
            </Link>
          </div>

          {/* ============================== */}
          {/* TAMPILAN MOBILE / HP           */}
          {/* ============================== */}
          <div className="flex w-full items-center justify-end lg:hidden">
            {/* Hamburger Button Only */}
            <button 
              onClick={toggleMenu}
              className="relative z-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#561269] text-white transition-transform active:scale-95"
              aria-label="Toggle Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* Overlay Gelap Sidebar Mobile */}
      <div 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ============================== */}
      {/* SIDEBAR MOBILE (Muncul dari Kiri) */}
      {/* ============================== */}
      <div 
        className={`fixed top-0 left-0 z-50 h-full w-[280px] overflow-hidden bg-[#561269] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-full flex-col py-8">
          
          {/* Header Sidebar: Profile & Empathika */}
          <div className="px-6">
            <div className="flex items-center gap-4">
              {/* Lingkaran Profil */}
              <div className="h-12 w-12 shrink-0 rounded-full bg-gray-300"></div>
              {/* Teks EMPATHIKA */}
              <span className="text-[26px] font-extrabold tracking-widest text-white uppercase">
                EMPATHIKA
              </span>
            </div>
            
            {/* Garis Pemisah Putih Tipis */}
            <div className="mt-6 h-[1.5px] w-full bg-white/40"></div>
          </div>

          {/* List Menu */}
          <div className="mt-6 flex flex-1 flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.name}
                  href={link.path as any}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-6 py-3.5 text-[15px] font-normal capitalize tracking-wide transition-colors [-webkit-tap-highlight-color:transparent] ${
                    active 
                      ? "w-full bg-white/25 text-white shadow-sm" 
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* Booking Sesi (Bawah) */}
          <div className="mt-8 px-6 pb-6">
            <Link
              href={"/booking" as any}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[15px] font-normal text-white hover:text-white/80"
            >
              Booking sesi
            </Link>
          </div>
          
        </div>
      </div>
    </>
  )
}
