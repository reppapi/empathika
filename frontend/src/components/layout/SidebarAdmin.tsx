"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  name: string
  path: string
}

const navItems: NavItem[] = [
  { name: "Ringkasan Operasional", path: "/admin" },
  { name: "Jadwal & Sesi", path: "/admin/jadwal" },
  { name: "Event", path: "/admin/event" },
  { name: "Transaksi", path: "/admin/transaksi" },
  { name: "Data psikolog", path: "/admin/psikolog" },
  { name: "Psikotes", path: "/admin/psikotes" },
  { name: "Pengaturan Biro", path: "/admin/pengaturan" },
  { name: "Blog", path: "/admin/blog" },
  { name: "Layanan", path: "/admin/layanan" },
]

export function SidebarAdmin() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin"
    return pathname?.startsWith(path)
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-[260px] flex-col justify-between overflow-y-auto bg-[#561269] px-6 py-7 font-poppins text-white shadow-xl">
      {/* Bagian Atas: Logo & Menu Navigasi */}
      <div className="flex flex-col">
        {/* Brand / Logo Empathika */}
        <Link href="/admin" className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-white/90 shadow-sm" />
          <span className="text-[24px] font-extrabold tracking-widest text-white uppercase">
            EMPATHIKA
          </span>
        </Link>

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
            // Log out handler / redirect
            window.location.href = "/login"
          }}
          className="flex w-full items-center px-4 py-2 text-left text-[14px] font-normal text-white/80 transition-colors hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}

export default SidebarAdmin
