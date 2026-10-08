"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export interface NavItem {
  name: string
  path: string
}

export const navItems: NavItem[] = [
  { name: "Ringkasan Operasional", path: "/admin" },
  { name: "Jadwal & Sesi", path: "/admin/jadwal" },
  { name: "Event", path: "/admin/event" },
  { name: "Transaksi", path: "/admin/transaksi" },
  { name: "Data psikolog", path: "/admin/psikolog" },
  { name: "Psikotes", path: "/admin/psikotes" },
  { name: "Pengaturan Biro", path: "/admin/pengaturan" },
  { name: "Blog", path: "/admin/blog" },
  { name: "Layanan", path: "/admin/layanan" },
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
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ── Sidebar Container ── */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 flex w-[260px] flex-col justify-between overflow-y-auto bg-[#561269] px-6 py-7 font-poppins text-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Bagian Atas: Logo & Menu Navigasi */}
        <div className="flex flex-col">
          {/* Header Logo */}
          <div className="mb-4">
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 transition-transform hover:scale-105"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-white/90 shadow-sm" />
              <span className="text-[24px] font-extrabold tracking-widest text-white uppercase">
                EMPATHIKA
              </span>
            </Link>
          </div>

          {/* Divider Garis Tipis di Bawah Logo */}
          <div className="mb-6 h-[1.5px] w-full bg-white/30" />

          {/* Daftar Navigasi Menu */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.name}
                  href={item.path as any}
                  onClick={onClose}
                  className={`flex items-center rounded-xl px-4 py-3 text-[14px] transition-all duration-200 ${
                    active
                      ? "bg-white/20 font-bold text-white shadow-sm backdrop-blur-sm"
                      : "font-normal text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bagian Bawah: Log out */}
        <div className="pt-6">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/login"
            }}
            className="flex w-full items-center px-4 py-2 text-left text-[14px] font-normal text-white/80 transition-colors hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}

export default SidebarAdmin
