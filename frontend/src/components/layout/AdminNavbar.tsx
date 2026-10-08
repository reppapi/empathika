"use client"

import { useState } from "react"

interface AdminNavbarProps {
  title?: string
  adminName?: string
  subtitle?: string
  onToggleSidebar?: () => void
}

export function AdminNavbar({
  title = "Kelola Layanan Konsultasi",
  adminName = "Admin Empathika",
  subtitle = "texttext",
  onToggleSidebar,
}: AdminNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Inisial avatar misalnya "AE" dari Admin Empathika
  const initials =
    adminName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AE"

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-gray-200/80 bg-white px-4 sm:px-6 lg:px-8 font-poppins shadow-sm">
      {/* Sisi Kiri: Tombol Burger (Mobile/Tablet) + Title Halaman */}
      <div className="flex items-center gap-3 sm:gap-4">
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

        {/* Title Halaman */}
        <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#561269] tracking-tight truncate max-w-[200px] sm:max-w-md lg:max-w-none">
          {title}
        </h1>
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
            <a
              href="/admin/profile"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-[#561269]"
            >
              Pengaturan Profil
            </a>
            <button
              type="button"
              onClick={() => {
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
