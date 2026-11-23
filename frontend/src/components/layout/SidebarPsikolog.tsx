"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { removeAuthCookie } from "@/lib/cookie"
import { adminService } from "@/services/admin.service"

interface SidebarPsikologProps {
  isOpen?: boolean
  onClose?: () => void
  isReviewer?: boolean
  reviewBadgeCount?: number
}

export function SidebarPsikolog({ isOpen, onClose, isReviewer = false, reviewBadgeCount = 0 }: SidebarPsikologProps) {
  const pathname = usePathname()

  // Ambil foto/logo resmi Empathika dari cache lokal & database publik
  const [empathikaLogo, setEmpathikaLogo] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("empathika_admin_profile")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.foto) return parsed.foto
        }
      } catch {}
    }
    return null
  })

  useEffect(() => {
    const loadEmpathikaLogo = () => {
      try {
        const saved = localStorage.getItem("empathika_admin_profile")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.foto !== undefined && parsed.foto !== null) {
            setEmpathikaLogo(parsed.foto)
          }
        }
      } catch {}

      adminService
        .getPublicProfile()
        .then((res: any) => {
          if (res?.data?.foto !== undefined && res?.data?.foto !== null) {
            setEmpathikaLogo(res.data.foto)
            try {
              const currentSaved = localStorage.getItem("empathika_admin_profile")
              const currentParsed = currentSaved ? JSON.parse(currentSaved) : {}
              localStorage.setItem(
                "empathika_admin_profile",
                JSON.stringify({ ...currentParsed, foto: res.data.foto })
              )
            } catch {}
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
  }, [])

  const isActive = (path: string) => {
    if (path === "/psikolog-web/beranda") return pathname === "/psikolog-web/beranda" || pathname === "/beranda" || pathname === "/admin/psikolog-web"
    return pathname?.startsWith(path)
  }

  const isReviewerActive = Boolean(isReviewer || pathname?.startsWith("/psikolog-web/review-asesmen"))

  const navItems = [
    { name: "Beranda", path: "/psikolog-web/beranda" },
    { name: "Jadwal & Sesi", path: "/psikolog-web/jadwal" },
    ...(isReviewerActive ? [{ name: "Review Psikotes", path: "/psikolog-web/review-asesmen", badge: reviewBadgeCount }] : []),
  ]

  return (
    <>
      {/* Overlay Mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 flex w-[280px] flex-col bg-[#561269] font-poppins text-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo (Tetap Diam di Atas, Tidak Ikut Ter-scroll) */}
        <div className="shrink-0 px-5 pt-8 pb-2 sm:px-6">
          <Link
            href={"/psikolog-web/beranda" as any}
            prefetch={true}
            onClick={onClose}
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="h-11 w-11 shrink-0 rounded-full bg-white/90 shadow-sm overflow-hidden flex items-center justify-center text-[#561269] font-extrabold text-lg">
              {empathikaLogo ? (
                <img
                  src={empathikaLogo}
                  alt="Empathika"
                  className="h-full w-full object-cover"
                />
              ) : (
                "E"
              )}
            </div>
            <span className="text-[25px] font-extrabold tracking-wide text-white uppercase truncate">
              EMPATHIKA
            </span>
          </Link>
          <div className="mt-6 h-[1.5px] w-full bg-white/40" />
        </div>

        {/* ── Area Navigasi / Pilihan Menu (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto py-3 flex flex-col justify-between [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
          {/* List Menu Pilihan */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.name}
                  href={item.path as any}
                  prefetch={true}
                  onClick={onClose}
                  className={`px-6 py-3.5 text-[15px] font-normal capitalize tracking-wide transition-colors flex items-center justify-between gap-2 [-webkit-tap-highlight-color:transparent] ${active
                      ? "w-full bg-white/25 text-white shadow-sm font-semibold"
                      : "text-white/90 hover:bg-white/10"
                    }`}
                >
                  <span className="truncate">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs animate-pulse shrink-0">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Log out */}
          <div className="mt-8 px-6 pb-6">
            <button
              type="button"
              onClick={() => {
                removeAuthCookie("access_token");
                removeAuthCookie("remember_me");
                localStorage.removeItem("access_token");
                localStorage.removeItem("remember_me");
                sessionStorage.removeItem("access_token");
                localStorage.removeItem("empathika-auth");
                localStorage.removeItem("active_psikolog_id");
                localStorage.removeItem("active_psikolog_name");
                window.location.href = "/login";
              }}
              className="inline-block w-full text-left font-normal text-white/80 transition-colors hover:text-white py-3 text-[15px]"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default SidebarPsikolog
