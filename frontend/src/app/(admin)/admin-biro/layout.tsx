"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import SidebarBiro from "@/components/layout/SidebarBiro"
import AdminNavbar from "@/components/layout/AdminNavbar"

export default function AdminBiroLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Menentukan judul navbar berdasarkan URL
  let pageTitle = "Riwayat Transaksi & Pembayaran"
  if (pathname === "/admin-biro") pageTitle = "Ringkasan Operasional"
  else if (pathname?.startsWith("/admin-biro/transaksi")) pageTitle = "Riwayat Transaksi & Pembayaran"
  else if (pathname?.startsWith("/admin-biro/profile")) pageTitle = "Pengaturan Profil Biro"

  return (
    <div className="min-h-screen bg-[#FBFBFC] font-poppins text-gray-800 flex">
      {/* 1. Sidebar Navigasi Biro */}
      <SidebarBiro
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        biroName="Biro Cendekia Muda"
      />

      {/* 2. Area Konten Kanan */}
      <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0 w-full transition-all duration-300">
        {/* Top Header Navbar */}
        <AdminNavbar
          title={pageTitle}
          adminName="Admin Biro"
          subtitle="Mitra Biro (Read-Only)"
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Banner Keterangan Read-Only / Naungan Biro */}
        <div className="bg-amber-50/80 border-b border-amber-200/60 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <p>
              Mode <strong>Akses Admin Biro (Read-Only)</strong> — Terintegrasi dengan sistem pusat Empathika
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[11px] font-semibold text-amber-800">
            Mitra Biro
          </span>
        </div>

        {/* Konten Halaman */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200/80 bg-white py-4 px-6 sm:px-8 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p>© 2026 Empathika x Biro Mitra. All rights reserved.</p>
          <p className="text-gray-400 font-medium">Biro Dashboard Management System</p>
        </footer>
      </div>
    </div>
  )
}
