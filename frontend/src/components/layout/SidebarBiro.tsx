"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { removeAuthCookie } from "@/lib/cookie"

export interface NavItem {
  name: string
  path: string
}

// Menu khusus Admin Biro di sidebar: Ringkasan Operasional, Jadwal dan Sesi, Psikotes, dan Transaksi
export const biroNavItems: NavItem[] = [
  { name: "Ringkasan Operasional", path: "/admin-biro" },
  { name: "Jadwal dan Sesi", path: "/admin-biro/jadwal" },
  { name: "Psikotes", path: "/admin-biro/psikotes" },
  { name: "Transaksi", path: "/admin-biro/transaksi" },
]

interface SidebarBiroProps {
  isOpen?: boolean
  onClose?: () => void
  biroName?: string
  biroColor?: string
  biroLogo?: string | null
}

export function SidebarBiro({
  isOpen,
  onClose,
  biroName = "Biro Mitra Empathika",
  biroColor = "#561269",
  biroLogo,
}: SidebarBiroProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/admin-biro") return pathname === "/admin-biro"
    return pathname?.startsWith(path)
  }

  return (
    <>
      {/* ── Overlay Gelap saat Mobile / Tablet ── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      {/* ── Sidebar Container ── */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 flex w-[280px] flex-col font-poppins text-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        style={{ backgroundColor: biroColor || "#561269" }}
      >
        {/* Header Sidebar: Profile & Empathika (Tetap Diam di Atas, Tidak Ikut Ter-scroll) */}
        <div className="shrink-0 px-5 pt-8 pb-2 sm:px-6">
          <Link
            href="/admin-biro"
            onClick={onClose}
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div 
              className="h-11 w-11 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-base overflow-hidden"
              style={{ color: biroColor || "#561269" }}
            >
              {biroLogo ? (
                <img src={biroLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                (biroName?.[0] || "B").toUpperCase()
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[20px] font-extrabold tracking-wide text-white uppercase truncate">
                EMPATHIKA
              </span>
              <span className="text-[11px] font-medium text-white/70 -mt-1 truncate">
                Portal Admin Biro
              </span>
            </div>
          </Link>

          {/* Chip Indikator Read-only Mitra */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-[11px] text-white/90 border border-white/10">
            <span className="truncate font-semibold">{biroName}</span>
            <span className="shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-100">
              Read-Only
            </span>
          </div>

          <div className="mt-5 h-[1.5px] w-full bg-white/20" />
        </div>

        {/* ── Area Navigasi / Pilihan Menu (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto py-3 flex flex-col justify-between [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
          {/* List Menu Pilihan */}
          <div className="flex flex-col gap-1">
            {biroNavItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.name}
                  href={item.path as any}
                  onClick={onClose}
                  className={`px-6 py-3.5 text-[15px] font-normal capitalize tracking-wide transition-colors [-webkit-tap-highlight-color:transparent] ${active
                      ? "w-full bg-white/25 text-white shadow-sm font-semibold"
                      : "text-white/90 hover:bg-white/10"
                    }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Bagian Bawah: Log out */}
          <div className="mt-8 px-6 pb-6">
            <button
              type="button"
              onClick={() => {
                removeAuthCookie("access_token")
                removeAuthCookie("remember_me")
                localStorage.removeItem("access_token")
                localStorage.removeItem("remember_me")
                sessionStorage.removeItem("access_token")
                localStorage.removeItem("empathika-auth")
                localStorage.removeItem("biro_theme_color")
                if (typeof document !== "undefined") {
                  document.documentElement.removeAttribute("data-biro-theme")
                  document.documentElement.style.removeProperty("--biro-theme-color")
                }
                window.location.href = "/login"
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

export default SidebarBiro
