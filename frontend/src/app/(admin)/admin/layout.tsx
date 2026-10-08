"use client"

import { useState } from "react"
import SidebarAdmin from "@/components/layout/SidebarAdmin"
import AdminNavbar from "@/components/layout/AdminNavbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FBFBFC] font-poppins text-gray-800 flex">
      {/* 1. Sidebar Navigasi Kiri (Fixed desktop, Drawer drawer mobile/tablet) */}
      <SidebarAdmin
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Area Konten Kanan */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-w-0 w-full transition-all duration-300">
        {/* Top Header Navbar dengan tombol Burger responsif */}
        <AdminNavbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Konten Halaman */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
