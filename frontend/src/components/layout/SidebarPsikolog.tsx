"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarPsikologProps {
  isOpen?: boolean
  onClose?: () => void
}

export function SidebarPsikolog({ isOpen, onClose }: SidebarPsikologProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/admin/psikolog-web") return pathname === "/admin/psikolog-web"
    return pathname?.startsWith(path)
  }

  const navItems = [
    { name: "Beranda", path: "/admin/psikolog-web" },
    { name: "Jadwal & Sesi", path: "/admin/psikolog-web/jadwal" },
  ]

  return (
    <>
      {/* Overlay Mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 flex w-[280px] flex-col overflow-y-auto bg-[#561269] py-8 font-poppins text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex min-h-full flex-col">
          {/* Logo */}
          <div className="px-5 sm:px-6">
            <Link
              href="/admin/psikolog-web"
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

          {/* Menu */}
          <div className="mt-6 flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.name}
                  href={item.path as any}
                  onClick={onClose}
                  className={`px-6 py-3.5 text-[15px] font-normal capitalize tracking-wide transition-colors [-webkit-tap-highlight-color:transparent] ${
                    active
                      ? "w-full bg-white/25 text-white shadow-sm font-semibold"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Log out */}
          <div className="mt-8 px-6 pb-6">
            <button
              type="button"
              onClick={() => { window.location.href = "/login" }}
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
