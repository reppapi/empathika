"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import SidebarAdmin from "@/components/layout/SidebarAdmin"
import AdminNavbar from "@/components/layout/AdminNavbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Menentukan judul navbar berdasarkan URL
  let pageTitle = "Kelola Layanan Konsultasi"
  if (pathname === "/admin") pageTitle = "Ringkasan Operasional"
  else if (pathname?.startsWith("/admin/jadwal")) pageTitle = "Jadwal & Sesi"
  else if (pathname?.startsWith("/admin/event")) pageTitle = "Event"
  else if (pathname?.startsWith("/admin/transaksi")) pageTitle = "Riwayat Transaksi & Pembayaran"
  else if (pathname?.startsWith("/admin/psikolog") && !pathname?.startsWith("/admin/psikolog-web")) pageTitle = "Data Psikolog"
  else if (pathname?.startsWith("/admin/psikotes")) pageTitle = "Psikotes"
  else if (pathname?.startsWith("/admin/blog")) pageTitle = "Kelola Blog Empathika"
  else if (pathname?.startsWith("/admin/layanan")) pageTitle = "Kelola Layanan Konsultasi"
  else if (pathname?.startsWith("/admin/biro")) pageTitle = "Pengaturan Biro & Komunitas"
  else if (pathname?.startsWith("/admin/kerja-sama")) pageTitle = "Kerja Sama"
  else if (pathname?.startsWith("/admin/profile")) pageTitle = "Pengaturan Profil"

  return (
    <div className="min-h-screen bg-[#FBFBFC] font-poppins text-gray-800 flex">
      {/* 1. Sidebar Navigasi Kiri (Fixed desktop, Drawer drawer mobile/tablet) */}
      <SidebarAdmin
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Area Konten Kanan */}
      <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0 w-full transition-all duration-300">
        {/* Top Header Navbar dengan tombol Burger responsif */}
        <AdminNavbar
          title={pageTitle}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Konten Halaman */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>

        {/* Footer Admin */}
        <footer className="border-t border-gray-200/80 bg-white py-4 px-6 sm:px-8 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p>© 2026 Empathika. All rights reserved.</p>
          <p className="text-gray-400 font-medium">Dashboard Management System</p>
        </footer>
      </div>
    </div>
  )
}
