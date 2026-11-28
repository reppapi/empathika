"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTenantContext } from "@/context/TenantContext"
import { adminService } from "@/services/admin.service"

export function Navbar() {
  const pathname = usePathname()
  const { isBiro, slug, biroProfile, withBiro } = useTenantContext()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [adminFoto, setAdminFoto] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isBiro) return
    const loadEmpathikaLogo = () => {
      try {
        const saved = localStorage.getItem("empathika_admin_profile")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.foto !== undefined) setAdminFoto(parsed.foto)
        }
      } catch {}

      adminService
        .getPublicProfile()
        .then((res) => {
          if (res?.data?.foto !== undefined) {
            setAdminFoto(res.data.foto)
          }
        })
        .catch(() => {})
    }

    loadEmpathikaLogo()
    window.addEventListener("storage", loadEmpathikaLogo)
    window.addEventListener("focus", loadEmpathikaLogo)
    window.addEventListener("empathika_admin_profile_updated", loadEmpathikaLogo)
    return () => {
      window.removeEventListener("storage", loadEmpathikaLogo)
      window.removeEventListener("focus", loadEmpathikaLogo)
      window.removeEventListener("empathika_admin_profile_updated", loadEmpathikaLogo)
    }
  }, [isBiro])

  const themeColor = isBiro
    ? (biroProfile?.warna_tema || "var(--biro-theme-color, #561269)")
    : "#561269"

  const navLinks = [
    { name: "home", path: withBiro("/") },
    { name: "layanan", path: withBiro("/layanan") },
    { name: "konsultasi", path: withBiro("/konseling") },
    { name: "psikolog", path: withBiro("/psikolog") },
    { name: "event", path: withBiro("/event") },
    { name: "kerja sama", path: withBiro("/kerja-sama") },
    { name: "tentang kami", path: withBiro("/tentang-kami") },
  ]

  const isActive = (path: string) => {
    if (path === withBiro("/konseling") && pathname === withBiro("/booking")) return true
    return pathname === path
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
      <header 
        className={`fixed top-0 left-0 right-0 z-50 w-full px-4 font-poppins transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3 lg:py-3.5"
            : "bg-transparent py-4 lg:py-6"
        }`}
      >
        <div className="mx-auto w-full max-w-[1400px]">
          
          {/* ============================== */}
          {/* TAMPILAN DESKTOP / LAPTOP      */}
          {/* ============================== */}
          <div className="hidden lg:flex items-center justify-center gap-10 xl:gap-14">
            <Link 
              href={withBiro("/") as any}
              prefetch={true}
              className="flex items-center gap-3 transition-transform hover:scale-105"
              aria-label="Home"
            >
              <div 
                suppressHydrationWarning
                className="h-14 w-14 shrink-0 rounded-full flex items-center justify-center text-white font-extrabold text-xl overflow-hidden shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                {isMounted && isBiro && biroProfile?.logoURI ? (
                  <img src={biroProfile.logoURI} alt="Logo" className="w-full h-full object-cover" />
                ) : isMounted && !isBiro && adminFoto ? (
                  <img src={adminFoto} alt="Empathika" className="w-full h-full object-cover" />
                ) : (
                  (biroProfile?.nama_biro?.trim()?.[0] || (slug ? slug.replace(/^biro[-_]/i, "").trim()?.[0] : null) || slug?.trim()?.[0] || "E").toUpperCase()
                )}
              </div>
              {isBiro ? (
                <div className="flex flex-col min-w-0 max-w-[280px]">
                  <span 
                    className="text-[18px] sm:text-[20px] font-extrabold tracking-wide uppercase truncate leading-tight"
                    style={{ color: themeColor }}
                  >
                    {biroProfile?.nama_biro?.trim() || (slug ? slug.replace(/^biro[-_]/i, "").trim().toUpperCase() : null) || "BIRO MITRA"}
                  </span>
                  <span className="text-[11px] font-medium tracking-normal text-gray-500 flex items-center gap-1.5 leading-none mt-1">
                    <span>powered by</span>
                    <span className="font-bold text-[12px]" style={{ color: "#561269" }}>
                      Empathika
                    </span>
                  </span>
                </div>
              ) : (
                <span 
                  className="text-[22px] font-extrabold tracking-widest uppercase max-w-[280px] truncate"
                  style={{ color: themeColor }}
                >
                  EMPATHIKA
                </span>
              )}
            </Link>

            <nav 
              className="flex items-center rounded-full px-2 py-1.5 shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              {navLinks.map((link) => {
                const active = isActive(link.path)
                return (
                  <Link
                    key={link.name}
                    href={link.path as any}
                    prefetch={true}
                    className={`rounded-full px-5 py-2 text-[14px] font-normal lowercase tracking-wide transition-colors ${
                      active 
                        ? "bg-white/20 text-white font-medium shadow-inner" 
                        : "text-white hover:text-white/80"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>

            <Link 
              href={withBiro("/konseling") as any}
              prefetch={true}
              className="flex h-14 shrink-0 items-center justify-center rounded-full px-6 text-[14px] font-normal lowercase tracking-wide text-white transition-transform hover:scale-105 shadow-md hover:opacity-90"
              style={{ backgroundColor: themeColor }}
            >
              booking sesi
            </Link>
          </div>

          {/* ============================== */}
          {/* TAMPILAN MOBILE / HP           */}
          {/* ============================== */}
          <div className="flex w-full items-center justify-between lg:hidden">
            {/* Logo Mobile Brand */}
            <Link 
              href={withBiro("/") as any}
              prefetch={true}
              className="flex items-center gap-2.5 transition-transform active:scale-95 min-w-0"
              aria-label="Home"
            >
              <div 
                suppressHydrationWarning
                className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-extrabold text-base overflow-hidden shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                {isMounted && isBiro && biroProfile?.logoURI ? (
                  <img src={biroProfile.logoURI} alt="Logo" className="w-full h-full object-cover" />
                ) : isMounted && !isBiro && adminFoto ? (
                  <img src={adminFoto} alt="Empathika" className="w-full h-full object-cover" />
                ) : (
                  (biroProfile?.nama_biro?.trim()?.[0] || (slug ? slug.replace(/^biro[-_]/i, "").trim()?.[0] : null) || slug?.trim()?.[0] || "E").toUpperCase()
                )}
              </div>
              {isBiro ? (
                <div className="flex flex-col min-w-0 max-w-[200px]">
                  <span 
                    className="text-[15px] font-extrabold tracking-wide uppercase truncate leading-tight"
                    style={{ color: themeColor }}
                  >
                    {biroProfile?.nama_biro?.trim() || (slug ? slug.replace(/^biro[-_]/i, "").trim().toUpperCase() : null) || "BIRO MITRA"}
                  </span>
                  <span className="text-[10px] font-medium tracking-normal text-gray-500 flex items-center gap-1 leading-none mt-0.5">
                    <span>by</span>
                    <span className="font-bold text-[11px]" style={{ color: "#561269" }}>
                      Empathika
                    </span>
                  </span>
                </div>
              ) : (
                <span 
                  className="text-[18px] font-extrabold tracking-widest uppercase max-w-[200px] truncate"
                  style={{ color: themeColor }}
                >
                  EMPATHIKA
                </span>
              )}
            </Link>

            {/* Hamburger Button */}
            <button 
              onClick={toggleMenu}
              className="relative z-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-transform active:scale-95 cursor-pointer"
              style={{ backgroundColor: themeColor }}
              aria-label="Toggle Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
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
        className={`fixed top-0 left-0 z-50 h-full w-[280px] overflow-hidden shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: themeColor }}
      >
        <div className="flex min-h-full flex-col py-8">
          
          {/* Header Sidebar: Profile & Empathika */}
          <div className="px-6">
            <Link
              href={withBiro("/") as any}
              prefetch={true}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4"
            >
              <div 
                suppressHydrationWarning
                className="h-12 w-12 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold text-lg overflow-hidden"
              >
                {isMounted && isBiro && biroProfile?.logoURI ? (
                  <img src={biroProfile.logoURI} alt="Logo" className="w-full h-full object-cover" />
                ) : isMounted && !isBiro && adminFoto ? (
                  <img src={adminFoto} alt="Empathika" className="w-full h-full object-cover" />
                ) : (
                  (biroProfile?.nama_biro?.trim()?.[0] || (slug ? slug.replace(/^biro[-_]/i, "").trim()?.[0] : null) || slug?.trim()?.[0] || "E").toUpperCase()
                )}
              </div>
              {isBiro ? (
                <div className="flex flex-col min-w-0">
                  <span className="text-[18px] sm:text-[20px] font-extrabold tracking-wide text-white uppercase truncate leading-tight">
                    {biroProfile?.nama_biro?.trim() || (slug ? slug.replace(/^biro[-_]/i, "").trim().toUpperCase() : null) || "BIRO MITRA"}
                  </span>
                  <span className="text-[11px] font-medium text-white/90 flex items-center gap-1.5 leading-none mt-1">
                    <span>powered by</span>
                    <span className="font-bold text-[11px] px-1.5 py-0.5 rounded-md bg-white shadow-xs" style={{ color: "#561269" }}>
                      Empathika
                    </span>
                  </span>
                </div>
              ) : (
                <span className="text-[22px] font-extrabold tracking-widest text-white uppercase truncate">
                  EMPATHIKA
                </span>
              )}
            </Link>
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
                  prefetch={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-6 py-3.5 text-[15px] font-normal capitalize tracking-wide transition-colors [-webkit-tap-highlight-color:transparent] ${
                    active 
                      ? "w-full bg-white/25 text-white shadow-sm font-semibold" 
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
              href={withBiro("/konseling") as any}
              prefetch={true}
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-block w-full text-center bg-white/15 hover:bg-white/25 text-white font-medium py-3 rounded-full text-[15px] transition-colors"
            >
              Booking sesi
            </Link>
          </div>
          
        </div>
      </div>
    </>
  )
}


