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

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 flex w-[280px] flex-col bg-gradient-to-b from-[#3d0c4d] to-[#7b2d93] py-8 font-poppins text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex min-h-full flex-col">
          {/* Logo */}
          <div className="px-5 mb-6">
            <Link
              href="/admin/psikolog-web"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <div className="h-6 w-6 shrink-0 rounded-full bg-white shadow-sm" />
              <span className="text-sm font-bold tracking-wide text-white uppercase">
                Empathika
              </span>
            </Link>
            <div className="mt-4 h-[1px] w-full bg-white/30" />
          </div>

          {/* Menu */}
          <div className="flex flex-1 flex-col gap-0.5 px-0">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.name}
                  href={item.path as any}
                  onClick={onClose}
                  className={`px-5 py-3 text-sm font-medium tracking-wide transition-colors [-webkit-tap-highlight-color:transparent] ${
                    active
                      ? "bg-white/20 text-white font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Log out */}
          <div className="px-5 pb-4 mt-8">
            <button
              type="button"
              onClick={() => { window.location.href = "/login" }}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              log out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default SidebarPsikolog
