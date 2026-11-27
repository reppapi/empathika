"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { removeAuthCookie } from "@/lib/cookie"
import { adminService } from "@/services/admin.service"
import { kerjaSamaService } from "@/services/kerja-sama.service"
import { internshipService } from "@/services/internship.service"
import {
  getUnreadKerjaSamaCount,
  getPengajuanKerjaSama,
} from "@/features/kerja-sama/data/initialData"
import { PengajuanKerjaSama } from "@/features/kerja-sama/types"

export interface NavItem {
  name: string
  path: string
  badge?: number
}

export const navItems: NavItem[] = [
  { name: "Ringkasan Operasional", path: "/admin" },
  { name: "Transaksi", path: "/admin/transaksi" },
  { name: "Pembagian Komisi", path: "/admin/pembagian" },
  { name: "Jadwal & Sesi", path: "/admin/jadwal" },
  { name: "Event", path: "/admin/event" },
  { name: "Psikotes", path: "/admin/psikotes" },
  { name: "Data psikolog", path: "/admin/psikolog" },
  { name: "Blog", path: "/admin/blog" },
  { name: "Layanan", path: "/admin/layanan" },
  { name: "Pengaturan Biro", path: "/admin/biro" },
  { name: "Kerja Sama", path: "/admin/kerja-sama" },
  { name: "Tentang Kami", path: "/admin/tentang-kami" },
  { name: "Internship", path: "/admin/internship" },
]

interface SidebarAdminProps {
  isOpen?: boolean
  onClose?: () => void
}

export function SidebarAdmin({ isOpen, onClose }: SidebarAdminProps) {
  const pathname = usePathname()
  const [adminFoto, setAdminFoto] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [unreadKerjaSamaCount, setUnreadKerjaSamaCount] = useState<number>(0)
  const [pendingInternshipCount, setPendingInternshipCount] = useState<number>(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const updatePendingInternship = () => {
      internshipService
        .getApplications()
        .then((apps) => {
          if (Array.isArray(apps)) {
            const count = apps.filter((a) => a.status === "MENUNGGU").length
            setPendingInternshipCount(count)
          }
        })
        .catch(() => {})
    }

    updatePendingInternship()
    window.addEventListener("storage", updatePendingInternship)
    window.addEventListener("focus", updatePendingInternship)
    window.addEventListener("empathika_internship_updated", updatePendingInternship)
    window.addEventListener("empathika_internship_applications_updated", updatePendingInternship)

    return () => {
      window.removeEventListener("storage", updatePendingInternship)
      window.removeEventListener("focus", updatePendingInternship)
      window.removeEventListener("empathika_internship_updated", updatePendingInternship)
      window.removeEventListener("empathika_internship_applications_updated", updatePendingInternship)
    }
  }, [])

  useEffect(() => {
    const updateUnreadKerjaSama = () => {
      try {
        const localCount = getUnreadKerjaSamaCount()
        setUnreadKerjaSamaCount(localCount)
      } catch {}

      kerjaSamaService
        .getPengajuanList()
        .then((res: any) => {
          if (res?.data && Array.isArray(res.data)) {
            const mappedLeads: PengajuanKerjaSama[] = res.data.map((item: any) => ({
              id: item.id,
              tanggal: "",
              namaInstansi: item.nama_instansi || "",
              kategori: item.kategori || "",
              namaPIC: item.nama_pic || "",
              email: item.email || "",
              telepon: item.no_telepon || "",
              pesan: item.pesan || "",
              status:
                item.status === "DIHUBUNGI"
                  ? "Dihubungi"
                  : item.status === "DISETUJUI"
                  ? "Disetujui"
                  : item.status === "DITOLAK"
                  ? "Ditolak"
                  : "Menunggu",
              tipeFormulir: item.tipe_formulir || "lainnya",
              formTitle: "",
              jawabanDetail: item.jawaban_detail || {},
            }))

            const localLeads = getPengajuanKerjaSama()
            const combined = [...mappedLeads]
            localLeads.forEach((ll) => {
              if (!combined.some((c) => c.id === ll.id)) {
                combined.push(ll)
              }
            })

            const count = getUnreadKerjaSamaCount(combined)
            setUnreadKerjaSamaCount(count)
          }
        })
        .catch(() => {
          setUnreadKerjaSamaCount(getUnreadKerjaSamaCount())
        })
    }

    updateUnreadKerjaSama()
    window.addEventListener("storage", updateUnreadKerjaSama)
    window.addEventListener("focus", updateUnreadKerjaSama)
    window.addEventListener("empathika_kerjasama_leads_updated", updateUnreadKerjaSama)

    return () => {
      window.removeEventListener("storage", updateUnreadKerjaSama)
      window.removeEventListener("focus", updateUnreadKerjaSama)
      window.removeEventListener("empathika_kerjasama_leads_updated", updateUnreadKerjaSama)
    }
  }, [])

  useEffect(() => {
    const loadProfile = () => {
      try {
        const saved = localStorage.getItem("empathika_admin_profile")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.foto !== undefined) setAdminFoto(parsed.foto)
        }
      } catch {}

      adminService
        .getProfile()
        .then((res) => {
          if (res?.data?.foto !== undefined) {
            setAdminFoto(res.data.foto)
          }
        })
        .catch(() => {
          adminService
            .getPublicProfile()
            .then((res: any) => {
              if (res?.data?.foto !== undefined) {
                setAdminFoto(res.data.foto)
              }
            })
            .catch(() => {})
        })
    }

    loadProfile()
    window.addEventListener("storage", loadProfile)
    window.addEventListener("focus", loadProfile)
    window.addEventListener("empathika_admin_profile_updated", loadProfile)
    return () => {
      window.removeEventListener("storage", loadProfile)
      window.removeEventListener("focus", loadProfile)
      window.removeEventListener("empathika_admin_profile_updated", loadProfile)
    }
  }, [])

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin"
    return pathname?.startsWith(path)
  }

  return (
    <>
      {/* ── Overlay Gelap saat Mobile / Tablet ── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      {/* ── Sidebar Container ── */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 flex w-[280px] flex-col bg-[#561269] font-poppins text-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Header Sidebar: Profile & Empathika (Tetap Diam di Atas, Tidak Ikut Ter-scroll) */}
        <div className="shrink-0 px-5 pt-8 pb-2 sm:px-6">
          <Link
            href="/admin"
            prefetch={true}
            onClick={onClose}
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="h-11 w-11 shrink-0 rounded-full bg-white/90 shadow-sm overflow-hidden flex items-center justify-center text-[#561269] font-extrabold text-lg">
              {isMounted && adminFoto ? (
                <img src={adminFoto} alt="Empathika" className="h-full w-full object-cover" />
              ) : (
                "E"
              )}
            </div>
            <span className="text-[25px] font-extrabold tracking-wide text-white uppercase truncate">
              EMPATHIKA
            </span>
          </Link>
          <div className="mt-6 h-[1.5px] w-full bg-white/40" />
        </div>

        {/* ── Area Navigasi / Pilihan Menu (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto py-3 flex flex-col justify-between [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
          {/* List Menu Pilihan */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path)
              const badge =
                item.name === "Kerja Sama"
                  ? unreadKerjaSamaCount
                  : item.name === "Internship"
                  ? pendingInternshipCount
                  : item.badge

              return (
                <Link
                  key={item.name}
                  href={item.path as any}
                  prefetch={true}
                  onClick={onClose}
                  className={`px-6 py-3.5 text-[15px] font-normal capitalize tracking-wide transition-colors flex items-center justify-between gap-2 [-webkit-tap-highlight-color:transparent] ${
                    active
                      ? "w-full bg-white/25 text-white shadow-sm font-semibold"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs animate-pulse shrink-0">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Bagian Bawah: Log out */}
          <div className="mt-8 px-6 pb-6">
            <button
              type="button"
              onClick={() => {
                removeAuthCookie("access_token");
                removeAuthCookie("remember_me");
                localStorage.removeItem("access_token");
                localStorage.removeItem("remember_me");
                sessionStorage.removeItem("access_token");
                localStorage.removeItem("empathika-auth");
                window.location.href = "/login";
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

export default SidebarAdmin
