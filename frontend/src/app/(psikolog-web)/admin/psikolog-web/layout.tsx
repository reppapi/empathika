"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import SidebarPsikolog from "@/components/layout/SidebarPsikolog"
import AdminNavbar from "@/components/layout/AdminNavbar"
import { LOCAL_STORAGE_KEY_TENAGA, INITIAL_TENAGA_AHLI } from "@/features/admin/psikolog/initialData"
import { TenagaAhli } from "@/features/admin/psikolog/types"

export default function PsikologWebLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Ambil data tenaga ahli aktif (default akun psikolog web: Rizki Putri Dzulqaidah / akun aktif pertama)
  const [currentPsikolog, setCurrentPsikolog] = useState<TenagaAhli | null>(null)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      // Ambil akun login psikolog (default id "1" / Rizki Putri)
      const found = list.find((item) => item.email === "putriqoida@empathika.com") || list[0]
      setCurrentPsikolog(found || null)
    } catch {
      setCurrentPsikolog(INITIAL_TENAGA_AHLI[0])
    } finally {
      setIsCheckingAccess(false)
    }
  }, [pathname])

  let pageTitle = "Beranda"
  if (pathname === "/admin/psikolog-web") pageTitle = "Beranda"
  else if (pathname?.startsWith("/admin/psikolog-web/jadwal")) pageTitle = "Jadwal & Sesi"
  else if (pathname?.startsWith("/admin/psikolog-web/profile")) pageTitle = "Profil Saya"

  const isAktif = currentPsikolog?.statusAkses === "AKTIF"

  return (
    <div className="min-h-screen bg-[#FBFBFC] font-poppins text-gray-800 flex">
      {/* Sidebar khusus psikolog */}
      <SidebarPsikolog
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Area Konten Kanan */}
      <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0 w-full transition-all duration-300">
        <AdminNavbar
          title={pageTitle}
          adminName={currentPsikolog?.nama || "Psikolog Empathika"}
          subtitle={
            currentPsikolog?.kategori === "psikolog"
              ? "Psikolog Resmi"
              : currentPsikolog?.kategori === "konselor"
              ? "Konselor"
              : "Peer Konselor"
          }
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Banner Status Naungan Admin Utama */}
        <div className="bg-purple-50/70 border-b border-purple-100 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="text-gray-600">
            Terdaftar di bawah naungan <strong>Admin Utama Empathika</strong>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Izin Akses:</span>
            {isAktif ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                Akses Diberikan
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[11px] font-semibold text-red-700">
                Akses Dibatasi
              </span>
            )}
          </div>
        </div>

        {/* Konten Halaman */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {!isCheckingAccess && !isAktif ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-gray-200 shadow-sm text-center max-w-xl mx-auto my-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Akses Web Belum Aktif
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  Akun <strong>{currentPsikolog?.nama}</strong> belum diberikan akses masuk oleh Admin Utama. Silakan hubungi admin utama untuk aktivasi akun.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/admin/psikolog"
                  className="rounded-xl bg-[#561269] hover:bg-[#6f1b87] px-5 py-2 text-xs font-semibold text-white transition"
                >
                  Buka Admin Utama
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Kembali
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Footer Web Psikolog */}
        <footer className="border-t border-gray-200/80 bg-white py-4 px-6 sm:px-8 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p>© 2026 Empathika. All rights reserved.</p>
          <p className="text-gray-400 font-medium">Dashboard Management System</p>
        </footer>
      </div>
    </div>
  )
}
