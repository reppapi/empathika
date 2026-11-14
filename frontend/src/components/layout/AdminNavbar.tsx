"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { removeAuthCookie } from "@/lib/cookie"

interface AdminNavbarProps {
  title?: string
  description?: string
  adminName?: string
  subtitle?: string
  onToggleSidebar?: () => void
}

const PAGE_CONFIG: {
  match: (path: string) => boolean
  title: string
  description: string
}[] = [
  {
    match: (p) => p === "/admin",
    title: "Ringkasan Operasional",
    description: "Pantau aktivitas, statistik, dan perkembangan operasional Empathika secara menyeluruh.",
  },
  {
    match: (p) => p.startsWith("/admin/jadwal"),
    title: "Jadwal & Sesi",
    description: "Kelola sesi konsultasi baru untuk client dan pantau daftar client yang melakukan booking konsultasi.",
  },
  {
    match: (p) => p.startsWith("/admin/event"),
    title: "Manajemen Event",
    description: "Kelola informasi event, jadwal pelaksanaan, pendaftaran peserta, dan publikasi kegiatan.",
  },
  {
    match: (p) => p.startsWith("/admin/transaksi"),
    title: "Manajemen Transaksi",
    description: "Pantau transaksi pembayaran dan status pembayaran dari berbagai layanan Empathika.",
  },
  {
    match: (p) => p.startsWith("/admin/psikolog"),
    title: "Manajemen Psikolog",
    description: "Kelola data psikolog, informasi profesional, spesialisasi, dan status keanggotaan.",
  },
  {
    match: (p) => p.startsWith("/admin/psikotes"),
    title: "Manajemen Psikotes",
    description: "Kelola paket psikotes, soal, interpretasi, dan hasil tes yang tersedia di Empathika.",
  },
  {
    match: (p) => p.startsWith("/admin/blog"),
    title: "Manajemen Blog",
    description: "Kelola artikel, dan publikasi konten edukasi di website Empathika.",
  },
  {
    match: (p) => p.startsWith("/admin/layanan"),
    title: "Manajemen Layanan",
    description: "Kelola informasi layanan, detail, harga, dan ketersediaan layanan Empathika.",
  },
  {
    match: (p) => p.startsWith("/admin/biro"),
    title: "Pengaturan Biro & Komunitas",
    description: "Kelola profil tenant mitra, registrasi biro, dan status aktivasi website multi-tenant.",
  },
  {
    match: (p) => p.startsWith("/admin/kerja-sama"),
    title: "Manajemen Kerja Sama",
    description: "Kelola data mitra, pengajuan kerja sama, dan status kolaborasi dengan Empathika.",
  },
  {
    match: (p) => p.startsWith("/admin/profile"),
    title: "Pengaturan Profil",
    description: "Kelola informasi identitas, foto profil, dan kredensial akun administrator.",
  },
]

export function AdminNavbar({
  title,
  description,
  adminName = "Admin Empathika",
  subtitle = "texttext",
  onToggleSidebar,
}: AdminNavbarProps) {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Otomatis deteksi konfigurasi route aktif
  const matchedConfig = pathname ? PAGE_CONFIG.find((c) => c.match(pathname)) : undefined
  const currentTitle = title || matchedConfig?.title || "Kelola Layanan Konsultasi"
  const currentDescription = description || matchedConfig?.description || ""

  // Inisial avatar misalnya "AE" dari Admin Empathika
  const initials =
    adminName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AE"

  return (
    <header className="sticky top-0 z-30 flex h-[101px] w-full items-center justify-between border-b border-gray-200/80 bg-white px-4 sm:px-6 lg:px-8 font-poppins shadow-sm">
      {/* Sisi Kiri: Tombol Burger (Mobile/Tablet) + Title & Deskripsi Halaman */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-4">
        {/* Tombol Hamburger di Mobile/Tablet (< lg) sama seperti di navbar user */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#561269] text-white shadow-md transition-transform active:scale-95 lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Title & Deskripsi Halaman */}
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#561269] tracking-tight leading-tight truncate">
            {currentTitle}
          </h1>
          {currentDescription && (
            <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5 sm:mt-1 truncate max-w-[260px] xs:max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-4xl">
              {currentDescription}
            </p>
          )}
        </div>
      </div>

      {/* Sisi Kanan: Profil Admin & Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 sm:gap-3.5 rounded-full p-1.5 transition-colors hover:bg-gray-50 focus:outline-none"
        >
          {/* Info Teks Admin (tersembunyi di layar sangat kecil, tampak di sm ke atas) */}
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm font-bold text-gray-900">{adminName}</p>
            <p className="text-[11px] text-gray-400 font-medium">{subtitle}</p>
          </div>

          {/* Avatar Bulat Inisial */}
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#E8D4F0] text-sm font-bold text-[#561269]">
            {initials}
          </div>

          {/* Chevron Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`h-4 w-4 text-gray-700 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
              }`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg ring-1 ring-black/5 z-50">
            <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
              <p className="text-xs font-bold text-gray-900">{adminName}</p>
              <p className="text-[10px] text-gray-400">{subtitle}</p>
            </div>
            <Link
              href={
                (pathname?.startsWith("/psikolog-web") ||
                pathname?.startsWith("/admin/psikolog-web") ||
                pathname === "/beranda" ||
                pathname?.startsWith("/jadwal") ||
                pathname?.startsWith("/profile")
                  ? "/psikolog-web/profile"
                  : pathname?.startsWith("/admin-biro")
                  ? "/admin-biro/profile"
                  : "/admin/profile") as any
              }
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-[#561269]"
            >
              Pengaturan Profil
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("access_token")
                localStorage.removeItem("remember_me")
                sessionStorage.removeItem("access_token")
                localStorage.removeItem("empathika-auth")
                localStorage.removeItem("active_psikolog_id")
                localStorage.removeItem("active_psikolog_name")
                localStorage.removeItem("biro_theme_color")
                if (typeof document !== "undefined") {
                  document.documentElement.removeAttribute("data-biro-theme")
                  document.documentElement.style.removeProperty("--biro-theme-color")
                }
                removeAuthCookie("access_token")
                removeAuthCookie("remember_me")
                window.location.href = "/login"
              }}
              className="block w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default AdminNavbar
