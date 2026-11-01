"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import SidebarPsikolog from "@/components/layout/SidebarPsikolog"
import AdminNavbar from "@/components/layout/AdminNavbar"
import { LOCAL_STORAGE_KEY_TENAGA, INITIAL_TENAGA_AHLI } from "@/features/psikolog/data/initialData"
import { TenagaAhli } from "@/features/psikolog/types"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import { psikologService } from "@/services/psikolog.service"
import { useAuthStore } from "@/store/authStore"
import dynamic from "next/dynamic"

const AuthGuard = dynamic(
  () => import("@/components/shared/AuthGuard").then((mod) => mod.AuthGuard),
  { ssr: false }
)

export default function PsikologWebLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuthStore()

  // Ambil data tenaga ahli aktif yang sedang login dari database
  const [currentPsikolog, setCurrentPsikolog] = useState<TenagaAhli | null>(null)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)

  const syncPsikologData = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      const savedName = localStorage.getItem("active_psikolog_name")
      const savedId = localStorage.getItem("active_psikolog_id")
      const isInvalidSaved = !savedName || savedName.toLowerCase().includes("admin")
      const found =
        (user?.role === "PSIKOLOG" && user?.email ? list.find((item) => item.email.toLowerCase() === user.email.toLowerCase()) : null) ||
        (user?.role === "PSIKOLOG" && user?.name ? list.find((item) => item.nama.toLowerCase().includes(user.name.toLowerCase())) : null) ||
        (!isInvalidSaved && savedName ? list.find((item) => item.nama === savedName) : null) ||
        (!isInvalidSaved && savedId ? list.find((item) => item.id === savedId) : null)
      setCurrentPsikolog(found || null)
    } catch {
      setCurrentPsikolog(null)
    } finally {
      setIsCheckingAccess(false)
    }

    // Sinkronkan juga dari database backend
    psikologService.getList().then((dbList: any[]) => {
      if (dbList && dbList.length > 0) {
        const savedId = localStorage.getItem("active_psikolog_id")
        const savedName = localStorage.getItem("active_psikolog_name")
        const isInvalidSaved = !savedName || savedName.toLowerCase().includes("admin")

        const matched =
          (user?.role === "PSIKOLOG" && user?.id
            ? dbList.find((p) => p.id === user.id || p.account?.id === user.id)
            : null) ||
          (user?.role === "PSIKOLOG" && user?.email
            ? dbList.find((p) => p.account?.email?.toLowerCase() === user.email.toLowerCase())
            : null) ||
          (user?.role === "PSIKOLOG" && user?.name
            ? dbList.find((p) => p.nama_gelar?.toLowerCase().includes(user.name.toLowerCase()) || p.account?.nama?.toLowerCase().includes(user.name.toLowerCase()))
            : null) ||
          (!isInvalidSaved && savedId ? dbList.find((p) => p.id === savedId || p.account?.id === savedId) : null) ||
          (!isInvalidSaved && savedName ? dbList.find((p) => p.nama_gelar === savedName) : null)

        if (matched) {
          const resolvedName = matched.nama_gelar || matched.account?.nama || user?.name || "Tenaga Ahli"
          localStorage.setItem("active_psikolog_id", matched.id)
          localStorage.setItem("active_psikolog_name", resolvedName)

          setCurrentPsikolog((prev) => ({
            id: matched.id,
            nama: resolvedName,
            email: matched.account?.email || user?.email || "",
            kategori: (matched.kategori?.toLowerCase().includes("peer")
              ? "peer-konselor"
              : matched.kategori?.toLowerCase().includes("konselor")
                ? "konselor"
                : "psikolog") as any,
            spesialisasi: matched.spesialisasi?.nama || matched.spesialisasi || "",
            foto: matched.foto || matched.account?.foto || null,
            statusAkses: "AKTIF",
            noTelepon: matched.account?.no_telepon || prev?.noTelepon || "",
            jumlahSesi: typeof matched.jumlah_sesi === "number" ? matched.jumlah_sesi : (prev?.jumlahSesi ?? 0),
            bio: matched.bio || matched.account?.bio || prev?.bio || "",
            quote: matched.quote || prev?.quote || "",
            instagram: matched.instagram || prev?.instagram || "",
            keahlian: Array.isArray(matched.keahlian)
              ? matched.keahlian
              : typeof matched.keahlian === "string"
                ? matched.keahlian.split(",").map((s: string) => s.trim())
                : prev?.keahlian || [],
            tanggalBergabung: prev?.tanggalBergabung || "Terdaftar",
          }))
        }
      }
    }).catch(() => { })
  }

  useEffect(() => {
    syncPsikologData()

    window.addEventListener("storage", syncPsikologData)
    return () => {
      window.removeEventListener("storage", syncPsikologData)
    }
  }, [pathname])

  let pageTitle = "Beranda"
  if (pathname?.startsWith("/psikolog-web/jadwal") || pathname?.startsWith("/jadwal") || pathname?.startsWith("/admin/psikolog-web/jadwal")) {
    pageTitle = "Jadwal dan Sesi Psikolog"
  } else if (pathname?.startsWith("/psikolog-web/profile") || pathname?.startsWith("/profile") || pathname?.startsWith("/admin/psikolog-web/profile")) {
    pageTitle = "Profil Saya"
  } else {
    pageTitle = "Beranda"
  }

  const isAktif = currentPsikolog?.statusAkses === "AKTIF"

  return (
    <AuthGuard allowedRoles={["PSIKOLOG", "ADMIN"]}>
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
              <AdminStatusBadge variant={isAktif ? "success" : "danger"} className="w-36">
                {isAktif ? "Akses Diberikan" : "Akses Dibatasi"}
              </AdminStatusBadge>
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
                    className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Buka Admin Utama
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
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
    </AuthGuard>
  )
}
