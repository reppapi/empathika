"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import SidebarAdmin from "@/components/layout/SidebarAdmin"
import AdminNavbar from "@/components/layout/AdminNavbar"

import dynamic from "next/dynamic"

const AuthGuard = dynamic(
  () => import("@/components/shared/AuthGuard").then((mod) => mod.AuthGuard),
  { ssr: false }
)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Menentukan judul dan deskripsi navbar berdasarkan URL
  let pageTitle = "Ringkasan Operasional"
  let pageDescription = "Pantau aktivitas, statistik, dan perkembangan operasional Empathika secara menyeluruh."

  if (pathname === "/admin") {
    pageTitle = "Ringkasan Operasional"
    pageDescription = "Pantau aktivitas, statistik, dan perkembangan operasional Empathika secara menyeluruh."
  } else if (pathname?.startsWith("/admin/jadwal")) {
    pageTitle = "Jadwal & Sesi"
    pageDescription = "Kelola sesi konsultasi baru untuk client dan pantau daftar client yang melakukan booking konsultasi."
  } else if (pathname?.startsWith("/admin/event")) {
    pageTitle = "Manajemen Event"
    pageDescription = "Kelola informasi event, jadwal pelaksanaan, pendaftaran peserta, dan publikasi kegiatan."
  } else if (pathname?.startsWith("/admin/transaksi")) {
    pageTitle = "Manajemen Transaksi"
    pageDescription = "Pantau transaksi pembayaran dan status pembayaran dari berbagai layanan Empathika."
  } else if (pathname?.startsWith("/admin/psikolog")) {
    pageTitle = "Manajemen Psikolog"
    pageDescription = "Kelola data psikolog, informasi profesional, spesialisasi, dan status keanggotaan."
  } else if (pathname?.startsWith("/admin/psikotes")) {
    pageTitle = "Manajemen Psikotes"
    pageDescription = "Kelola paket psikotes, soal, interpretasi, dan hasil tes yang tersedia di Empathika."
  } else if (pathname?.startsWith("/admin/blog")) {
    pageTitle = "Manajemen Blog"
    pageDescription = "Kelola artikel, dan publikasi konten edukasi di website Empathika."
  } else if (pathname?.startsWith("/admin/layanan")) {
    pageTitle = "Manajemen Layanan"
    pageDescription = "Kelola informasi layanan, detail, harga, dan ketersediaan layanan Empathika."
  } else if (pathname?.startsWith("/admin/biro")) {
    pageTitle = "Pengaturan Biro & Komunitas"
    pageDescription = "Kelola profil tenant mitra, registrasi biro, dan status aktivasi website multi-tenant."
  } else if (pathname?.startsWith("/admin/kerja-sama")) {
    pageTitle = "Manajemen Kerja Sama"
    pageDescription = "Kelola data mitra, pengajuan kerja sama, dan status kolaborasi dengan Empathika."
  } else if (pathname?.startsWith("/admin/profile")) {
    pageTitle = "Pengaturan Profil"
    pageDescription = "Kelola informasi identitas, foto profil, dan kredensial akun administrator."
  }

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
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
            description={pageDescription}
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
    </AuthGuard>
  )
}
