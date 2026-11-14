"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { removeAuthCookie } from "@/lib/cookie"

export interface NavItem {
  name: string
  path: string
}

export const navItems: NavItem[] = [
  { name: "Ringkasan Operasional", path: "/admin" },
  { name: "Transaksi", path: "/admin/transaksi" },
  { name: "Jadwal & Sesi", path: "/admin/jadwal" },
  { name: "Event", path: "/admin/event" },
  { name: "Psikotes", path: "/admin/psikotes" },
  { name: "Data psikolog", path: "/admin/psikolog" },
  { name: "Blog", path: "/admin/blog" },
  { name: "Layanan", path: "/admin/layanan" },
  { name: "Pengaturan Biro", path: "/admin/biro" },
  { name: "Kerja Sama", path: "/admin/kerja-sama" },
]

interface SidebarAdminProps {
  isOpen?: boolean
  onClose?: () => void
}

export function SidebarAdmin({ isOpen, onClose }: SidebarAdminProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin"
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
        className={`fixed left-0 top-0 bottom-0 z-50 flex w-[280px] flex-col bg-[#561269] font-poppins text-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Header Sidebar: Profile & Empathika (Tetap Diam di Atas, Tidak Ikut Ter-scroll) */}
        <div className="shrink-0 px-5 pt-8 pb-2 sm:px-6">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="h-11 w-11 shrink-0 rounded-full bg-white/90 shadow-sm" />
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
                removeAuthCookie("access_token");
                removeAuthCookie("remember_me");
                localStorage.removeItem("access_token");
                localStorage.removeItem("remember_me");
                sessionStorage.removeItem("access_token");
                localStorage.removeItem("empathika-auth");
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

export default SidebarAdmin
