"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, Users, Wallet, Users as UsersIcon, CheckCircle2 as CheckCircle2Icon, Sparkles, Clock } from "lucide-react"

import DashboardStatCards from "../admin/DashboardStatCards"
import BiroDashboardChart from "./BiroDashboardChart"
import BiroDashboardTodaySessions from "./BiroDashboardTodaySessions"
import BiroDashboardRecentTransactions from "./BiroDashboardRecentTransactions"
import BiroClientDetailModal from "./BiroClientDetailModal"
import BiroClientListModal from "./BiroClientListModal"

import { TodaySessionItem, RecentTransactionItem } from "../../types"
import { BiroClientProfile, BiroTenantData } from "../../data/biroDashboardData"
import { useAuthStore } from "@/store/authStore"
import { biroAdminService } from "@/services/biro.service"
import { adminService } from "@/services/admin.service"

const getCleanInitialTenant = (
  userId = "biro",
  userName = "Biro Mitra",
  cachedColor = "#561269"
): BiroTenantData => ({
  biroId: userId,
  biroName: userName,
  biroSlug: "biro",
  tagline: `Dashboard Layanan & Klien ${userName}`,
  color: cachedColor,
  metrics: [
    {
      title: "Pendapatan Bulan Ini",
      value: "Rp 0",
      change: "0% dari bulan lalu",
      icon: Wallet,
      color: cachedColor,
    },
    {
      title: "Klien Aktif Biro",
      value: "0 Klien",
      change: "Belum ada klien terdaftar",
      icon: UsersIcon,
      color: cachedColor,
    },
    {
      title: "Sesi Konseling Selesai",
      value: "0 Sesi",
      change: "Akumulasi bulan ini",
      icon: CheckCircle2Icon,
      color: cachedColor,
    },
    {
      title: "Pendaftar Layanan",
      value: "0 Peserta",
      change: "Belum ada program aktif",
      icon: Sparkles,
      color: cachedColor,
    },
    {
      title: "Menunggu Pembayaran",
      value: "0 Transaksi",
      change: "Tidak ada tagihan tertunda",
      icon: Clock,
      color: "#D97706",
    },
  ],
  chartData: {
    minggu: [
      { label: "Sen", value: 0, height: "0%" },
      { label: "Sel", value: 0, height: "0%" },
      { label: "Rab", value: 0, height: "0%" },
      { label: "Kam", value: 0, height: "0%" },
      { label: "Jum", value: 0, height: "0%" },
      { label: "Sab", value: 0, height: "0%" },
      { label: "Min", value: 0, height: "0%" },
    ],
    bulan: [
      { label: "M-1", value: 0, height: "0%" },
      { label: "M-2", value: 0, height: "0%" },
      { label: "M-3", value: 0, height: "0%" },
      { label: "M-4", value: 0, height: "0%" },
    ],
    bulan_lalu: [
      { label: "M-1", value: 0, height: "0%" },
      { label: "M-2", value: 0, height: "0%" },
      { label: "M-3", value: 0, height: "0%" },
      { label: "M-4", value: 0, height: "0%" },
    ],
  },
  agendaList: [],
  todaySessions: [],
  recentTransactions: [],
  clients: [],
})

export default function AdminBiroDashboardClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const [activeTenant, setActiveTenant] = useState<BiroTenantData>(() => {
    const cachedColor = typeof window !== "undefined" ? localStorage.getItem("biro_theme_color") : null
    const cachedName = typeof window !== "undefined" ? localStorage.getItem("biro_name") : null
    return getCleanInitialTenant(user?.id, cachedName || user?.name || "Biro Mitra", cachedColor || "#561269")
  })

  useEffect(() => {
    let isMounted = true

    const loadBiroOperationalData = (targetBiroId?: string) => {
      const queryParams = targetBiroId ? { biroId: targetBiroId } : undefined

      // 2. Ambil 5 Kartu Ringkasan Operasional Biro real-time dari backend
      adminService
        .getDashboardMetrics(queryParams)
        .then((res: any) => {
          if (!isMounted || !res?.pendapatanBulanIni) return
          setActiveTenant((prev) => ({
            ...prev,
            metrics: [
              {
                title: "Pendapatan Bulan Ini",
                value: res.pendapatanBulanIni.value,
                change: res.pendapatanBulanIni.change,
                icon: Wallet,
                color: prev.color,
              },
              {
                title: "Klien Aktif Biro",
                value: res.totalKlienAktif?.value || `${res.menungguReview?.rawValue ?? 0} Klien`,
                change: res.totalKlienAktif?.change || "Klien aktif terdaftar",
                icon: UsersIcon,
                color: prev.color,
              },
              {
                title: "Sesi Konseling Selesai",
                value: res.sesiKonselingSelesai?.value || "0 Sesi",
                change: res.sesiKonselingSelesai?.change || "Akumulasi bulan ini",
                icon: CheckCircle2Icon,
                color: prev.color,
              },
              {
                title: "Pendaftar Layanan",
                value: res.pendaftarEvent?.value || res.pendaftarWorkshop?.value || "0 Peserta",
                change: res.pendaftarEvent?.change || "Program biro aktif",
                icon: Sparkles,
                color: prev.color,
              },
              {
                title: "Menunggu Pembayaran",
                value: res.menungguPembayaran?.value || "0 Transaksi",
                change: res.menungguPembayaran?.change || "Tagihan tertunda",
                icon: Clock,
                color: "#D97706",
              },
            ],
          }))
        })
        .catch((err) => {
          console.error("AdminBiroDashboard: Gagal memuat metrik ringkasan operasional:", err)
        })

      // 3. Ambil Sesi Konseling Hari Ini Biro (top 5 sesi terdekat)
      adminService
        .getDashboardTodaySessions({ limit: 5, ...(targetBiroId ? { biroId: targetBiroId } : {}) })
        .then((res: any) => {
          if (!isMounted || !Array.isArray(res?.sessions)) return
          setActiveTenant((prev) => ({
            ...prev,
            todaySessions: res.sessions,
          }))
        })
        .catch((err) => {
          console.error("AdminBiroDashboard: Gagal memuat sesi hari ini:", err)
        })

      // 4. Ambil Transaksi Pembayaran Terbaru Biro (top 5 transaksi)
      adminService
        .getDashboardRecentTransactions({ limit: 5, ...(targetBiroId ? { biroId: targetBiroId } : {}) })
        .then((res: any) => {
          if (!isMounted || !Array.isArray(res?.transactions)) return
          setActiveTenant((prev) => ({
            ...prev,
            recentTransactions: res.transactions,
          }))
        })
        .catch((err) => {
          console.error("AdminBiroDashboard: Gagal memuat transaksi terbaru:", err)
        })

      // 5. Ambil Grafik Reservasi Sesi Biro
      adminService
        .getDashboardChart(queryParams)
        .then((res: any) => {
          if (!isMounted || !res?.minggu || !res?.bulan) return
          setActiveTenant((prev) => ({
            ...prev,
            chartData: res,
          }))
        })
        .catch((err) => {
          console.error("AdminBiroDashboard: Gagal memuat chart reservasi:", err)
        })
    }

    // 1. Ambil akun dan profil biro yang sedang login dari backend
    biroAdminService
      .getMyAccount()
      .then((res) => {
        if (!isMounted || !res?.data) return
        const beBiro = (res.data as any).owned_biro?.[0] || res.data.biro
        const finalName = beBiro?.nama_biro || res.data.nama || user?.name || ""
        const finalSlug = beBiro?.slug || "biro"
        const finalColor =
          beBiro?.warna_tema ||
          (typeof window !== "undefined" ? localStorage.getItem("biro_theme_color") : null) ||
          "#561269"

        const resolvedBiroId = beBiro?.id || (res.data as any)?.id_biro || res.data.id

        if (beBiro?.warna_tema && typeof window !== "undefined") {
          localStorage.setItem("biro_theme_color", beBiro.warna_tema)
          document.documentElement.style.setProperty("--biro-theme-color", beBiro.warna_tema)
          document.documentElement.setAttribute("data-biro-theme", "true")
        }

        setActiveTenant((prev) => ({
          ...prev,
          biroId: resolvedBiroId || prev.biroId,
          biroName: finalName,
          biroSlug: finalSlug,
          tagline: `Dashboard Layanan & Klien ${finalName}`,
          color: finalColor,
          metrics: prev.metrics.map((m) =>
            m.title.includes("Menunggu Pembayaran")
              ? m
              : { ...m, color: finalColor }
          ),
        }))

        // Muat data operasional khusus biro ini
        loadBiroOperationalData(resolvedBiroId)
      })
      .catch((err) => {
        console.error("AdminBiroDashboard: Gagal memuat data akun biro dari backend:", err)
        loadBiroOperationalData((user as any)?.id_biro || user?.id)
      })

    // Listener reaktif saat ada booking baru atau perubahan data di tab lain
    const handleSync = () => {
      const activeId = activeTenant.biroId || (user as any)?.id_biro || user?.id
      loadBiroOperationalData(activeId)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("empathika_booking_created", handleSync)
      window.addEventListener("storage", handleSync)
      window.addEventListener("focus", handleSync)
    }

    return () => {
      isMounted = false
      if (typeof window !== "undefined") {
        window.removeEventListener("empathika_booking_created", handleSync)
        window.removeEventListener("storage", handleSync)
        window.removeEventListener("focus", handleSync)
      }
    }
  }, [user, activeTenant.biroId])

  const currentTenant: BiroTenantData = activeTenant

  const sessions = currentTenant.todaySessions
  const clients = currentTenant.clients

  // Modals state
  const modalParam = searchParams ? searchParams.get("modal") : null
  const [isClientListOpen, setIsClientListOpen] = useState(modalParam === "clients")
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<BiroClientProfile | null>(null)

  // Sinkronkan modal saat query param URL berubah (misal tombol Back / Forward browser)
  useEffect(() => {
    const m = searchParams ? searchParams.get("modal") : null
    setIsClientListOpen(m === "clients")
  }, [searchParams])

  const handleOpenClientList = () => {
    setIsClientListOpen(true)
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    params.set("modal", "clients")
    const qs = params.toString()
    const targetUrl = qs ? `/admin-biro?${qs}` : "/admin-biro"
    router.replace(targetUrl as any, { scroll: false })
  }

  const handleCloseClientList = () => {
    setIsClientListOpen(false)
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    params.delete("modal")
    const qs = params.toString()
    const targetUrl = qs ? `/admin-biro?${qs}` : "/admin-biro"
    router.replace(targetUrl as any, { scroll: false })
  }

  const currentDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date())

  // Buka detail klien berdasarkan nama dari daftar sesi hari ini
  const handleSelectClientByName = (clientName: string) => {
    const found = clients.find(
      (c) => c.nama.toLowerCase() === clientName.toLowerCase()
    )
    if (found) {
      setSelectedClient(found)
      setIsClientDetailOpen(true)
    } else {
      const fallbackProfile: BiroClientProfile = {
        id: "temp_" + Date.now(),
        biroId: currentTenant.biroId,
        biroName: currentTenant.biroName,
        clientCode: "KLN-" + Date.now().toString().slice(-4),
        nama: clientName,
        email: `${clientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        telepon: "-",
        usia: 0,
        status: "Aktif",
        fokusKonseling: "Konseling Terjadwal",
        totalSesi: 1,
        sesiTerakhir: "Hari ini",
        psikologPendamping: "-",
        layanan: "Konseling Klien Biro",
        metode: "Online",
        tanggalBergabung: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
      }
      setSelectedClient(fallbackProfile)
      setIsClientDetailOpen(true)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 font-poppins pb-12 relative">
      {/* ── 1. Header & Quick Actions (Desain Seragam dengan Admin Pusat) ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Selamat Datang, Admin Biro!
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Operasional Aktif
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-[#561269]">
              {currentTenant.biroName}
            </span>
          </div>

          <p className="text-gray-500 text-sm mt-1.5">
            Berikut adalah ringkasan performa dan aktivitas layanan klien di bawah naungan{" "}
            <strong className="text-[#561269]">{currentTenant.biroName}</strong> hari ini.
          </p>
        </div>

        {/* Kolom Kanan: Tanggal & Tombol Lihat Daftar Klien Biro */}
        <div className="flex flex-col items-start sm:items-end justify-center gap-2.5 shrink-0 w-full sm:w-auto">
          {/* Atas: Tanggal Hari Ini */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/90 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#8a720d]" />
            <span>{currentDate}</span>
          </div>

          {/* Bawah: Tombol Direktori Klien Biro */}
          <button
            type="button"
            onClick={handleOpenClientList}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#561269] hover:bg-[#430d52] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all active:scale-98 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Daftar Klien Biro ({clients.length})</span>
          </button>
        </div>
      </div>

      {/* ── 2. Grid Kartu Metrik (5 Kolom Seimbang & Rapi Tanpa Teks Terpotong) ── */}
      <DashboardStatCards metrics={currentTenant.metrics} />

      {/* ── 3. Baris Grafik Reservasi Klien Biro ── */}
      <BiroDashboardChart
        chartData={currentTenant.chartData}
        biroName={currentTenant.biroName}
      />

      {/* ── 4. Bagian Bawah: Sesi Konseling Hari Ini & Transaksi Pembayaran Klien Biro ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BiroDashboardTodaySessions
          sessions={sessions}
          clients={clients}
          biroName={currentTenant.biroName}
          onOpenClientList={handleOpenClientList}
          onSelectClientByName={handleSelectClientByName}
        />
        <BiroDashboardRecentTransactions
          transactions={currentTenant.recentTransactions}
          biroName={currentTenant.biroName}
        />
      </div>

      {/* ── Modal Direktori Roster Klien Biro ── */}
      <BiroClientListModal
        isOpen={isClientListOpen}
        onClose={handleCloseClientList}
        clients={clients}
        biroName={currentTenant.biroName}
        onSelectClient={(client) => {
          setSelectedClient(client)
          setIsClientDetailOpen(true)
        }}
      />

      {/* ── Modal Detail Profil Klien ── */}
      <BiroClientDetailModal
        isOpen={isClientDetailOpen}
        onClose={() => setIsClientDetailOpen(false)}
        client={selectedClient}
      />
    </div>
  )
}
