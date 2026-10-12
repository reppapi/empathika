"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export interface NavItem {
  name: string
  path: string
}

// Menu khusus Admin Biro di sidebar: Ringkasan Operasional dan Transaksi (Pengaturan Profil ada di dropdown navbar)
export const biroNavItems: NavItem[] = [
  { name: "Ringkasan Operasional", path: "/admin-biro" },
  { name: "Transaksi", path: "/admin-biro/transaksi" },
]

interface SidebarBiroProps {
  isOpen?: boolean
  onClose?: () => void
  biroName?: string
}

export function SidebarBiro({
  isOpen,
  onClose,
  biroName = "Biro Mitra Empathika",
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
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ── Sidebar Container ── */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 flex w-[280px] flex-col overflow-y-auto bg-[#561269] py-8 font-poppins text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex min-h-full flex-col">
          {/* Header Sidebar: Profile & Empathika */}
          <div className="px-5 sm:px-6">
            <Link
              href="/admin-biro/transaksi"
              onClick={onClose}
              className="flex items-center gap-3 transition-transform hover:scale-105"
            >
              <div className="h-11 w-11 shrink-0 rounded-full bg-white/90 shadow-sm flex items-center justify-center font-bold text-[#561269] text-base">
                B
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

          {/* List Menu */}
          <div className="mt-6 flex flex-1 flex-col gap-1">
            {biroNavItems.map((item) => {
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

          {/* Bagian Bawah: Log out */}
          <div className="mt-8 px-6 pb-6">
            <button
              type="button"
              onClick={() => {
                document.cookie = "access_token=; path=/; max-age=0;"
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
