"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import SidebarPsikolog from "@/components/layout/SidebarPsikolog"
import AdminNavbar from "@/components/layout/AdminNavbar"

export default function PsikologWebLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  let pageTitle = "Beranda"
  if (pathname === "/admin/psikolog-web") pageTitle = "Beranda"
  else if (pathname?.startsWith("/admin/psikolog-web/jadwal")) pageTitle = "Jadwal & Sesi"
  else if (pathname?.startsWith("/admin/psikolog-web/profile")) pageTitle = "Profil Saya"

  return (
    <div className="min-h-screen bg-[#FBFBFC] font-poppins text-gray-800 flex">
      {/* Sidebar khusus psikolog — hanya Beranda & Jadwal & Sesi */}
      <SidebarPsikolog
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Area Konten Kanan */}
      <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0 w-full transition-all duration-300">
        <AdminNavbar
          title={pageTitle}
          adminName="Anindita Sari, M.Psi"
          subtitle="Psikolog"
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
