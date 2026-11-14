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
    return getCleanInitialTenant(user?.id, user?.name, cachedColor || "#561269")
  })

  useEffect(() => {
    let isMounted = true

    // 1. Ambil akun dan profil biro yang sedang login dari backend
    biroAdminService
      .getMyAccount()
      .then((res) => {
        if (!isMounted || !res?.data) return
        const beBiro = (res.data as any).owned_biro?.[0] || res.data.biro
        const finalName = beBiro?.nama_biro || res.data.nama || user?.name || "Biro Mitra"
        const finalSlug = beBiro?.slug || "biro"
        const finalColor =
          beBiro?.warna_tema ||
          (typeof window !== "undefined" ? localStorage.getItem("biro_theme_color") : null) ||
          "#561269"

        if (beBiro?.warna_tema && typeof window !== "undefined") {
          localStorage.setItem("biro_theme_color", beBiro.warna_tema)
          document.documentElement.style.setProperty("--biro-theme-color", beBiro.warna_tema)
          document.documentElement.setAttribute("data-biro-theme", "true")
        }

        setActiveTenant((prev) => ({
          ...prev,
          biroId: beBiro?.id || res.data.id || prev.biroId,
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
      })
      .catch(() => {})

    // 2. Ambil 5 kartu metrik riil dari database PostgreSQL
    adminService
      .getDashboardMetrics()
      .then((res: any) => {
        if (!isMounted || !res) return
        const currentColor =
          (typeof window !== "undefined" ? localStorage.getItem("biro_theme_color") : null) ||
          activeTenant.color ||
          "#561269"

        setActiveTenant((prev) => ({
          ...prev,
          metrics: [
            {
              title: res.pendapatanBulanIni?.title || "Pendapatan Bulan Ini",
              value: res.pendapatanBulanIni?.value || "Rp 0",
              change: res.pendapatanBulanIni?.change || "0% dari bulan lalu",
              icon: Wallet,
              color: currentColor,
            },
            {
              title: "Klien Aktif Biro",
              value: res.totalKlienAktif?.value || "0 Klien",
              change: res.totalKlienAktif?.change || "Belum ada klien terdaftar",
              icon: UsersIcon,
              color: currentColor,
            },
            {
              title: res.sesiKonselingSelesai?.title || "Sesi Konseling Selesai",
              value: res.sesiKonselingSelesai?.value || "0 Sesi",
              change: res.sesiKonselingSelesai?.change || "Akumulasi bulan ini",
              icon: CheckCircle2Icon,
              color: currentColor,
            },
            {
              title: "Pendaftar Layanan",
              value: res.pendaftarEvent?.value || res.pendaftarWorkshop?.value || "0 Peserta",
              change: res.pendaftarEvent?.change || "Belum ada program aktif",
              icon: Sparkles,
              color: currentColor,
            },
            {
              title: res.menungguPembayaran?.title || "Menunggu Pembayaran",
              value: res.menungguPembayaran?.value || "0 Transaksi",
              change: res.menungguPembayaran?.change || "Tidak ada tagihan tertunda",
              icon: Clock,
              color: "#D97706",
            },
          ],
        }))
      })
      .catch(() => {})

    // 3. Ambil data grafik reservasi riil dari database
    adminService
      .getDashboardChart()
      .then((res: any) => {
        if (!isMounted || !res) return
        if (res.chartMinggu || res.chartBulan || res.chartBulanLalu) {
          setActiveTenant((prev) => ({
            ...prev,
            chartData: {
              minggu: res.chartMinggu || prev.chartData.minggu,
              bulan: res.chartBulan || prev.chartData.bulan,
              bulan_lalu: res.chartBulanLalu || prev.chartData.bulan_lalu,
            },
          }))
        }
      })
      .catch(() => {})

    // 4. Ambil sesi konseling hari ini riil dari database
    adminService
      .getDashboardTodaySessions({ limit: 5 })
      .then((res: any) => {
        if (!isMounted || !res?.sessions) return
        const mappedSessions: TodaySessionItem[] = res.sessions.map((s: any) => ({
          waktu: s.waktu,
          klien: s.klien,
          psikolog: s.psikolog,
          layanan: s.layanan,
          metode: s.metode,
          status: s.status,
        }))

        setActiveTenant((prev) => {
          const mergedClients = [...prev.clients]
          mappedSessions.forEach((s, idx) => {
            if (s.klien && s.klien !== "-" && !mergedClients.some((c) => c.nama.toLowerCase() === s.klien.toLowerCase())) {
              mergedClients.push({
                id: `kln_sesi_${idx}`,
                biroId: prev.biroId,
                biroName: prev.biroName,
                clientCode: `KLN-${100 + idx}`,
                nama: s.klien,
                email: `${s.klien.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
                telepon: "-",
                usia: 0,
                status: s.status === "Selesai" ? "Selesai" : "Aktif",
                fokusKonseling: s.layanan,
                totalSesi: 1,
                sesiTerakhir: "Hari ini",
                psikologPendamping: s.psikolog,
                layanan: s.layanan,
                metode: s.metode === "Offline" ? "Offline" : "Online",
                tanggalBergabung: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
              })
            }
          })

          return {
            ...prev,
            todaySessions: mappedSessions,
            clients: mergedClients,
          }
        })
      })
      .catch(() => {})

    // 5. Ambil riwayat transaksi terbaru riil dari database
    adminService
      .getDashboardRecentTransactions({ limit: 5 })
      .then((res: any) => {
        if (!isMounted || !res?.transactions) return
        const mappedTrx: RecentTransactionItem[] = res.transactions.map((t: any) => ({
          id: t.id,
          client: t.client,
          layanan: t.layanan,
          kategori: t.kategori,
          total: t.total,
          metode: t.metode,
          status: t.status,
          createdAt: t.createdAt,
        }))

        setActiveTenant((prev) => {
          const mergedClients = [...prev.clients]
          mappedTrx.forEach((trx, idx) => {
            if (trx.client && trx.client !== "-" && !mergedClients.some((c) => c.nama.toLowerCase() === trx.client.toLowerCase())) {
              mergedClients.push({
                id: `kln_trx_${idx}`,
                biroId: prev.biroId,
                biroName: prev.biroName,
                clientCode: `KLN-${200 + idx}`,
                nama: trx.client,
                email: `${trx.client.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
                telepon: "-",
                usia: 0,
                status: trx.status === "Lunas" ? "Selesai" : "Menunggu Pembayaran",
                fokusKonseling: trx.layanan,
                totalSesi: 1,
                sesiTerakhir: "-",
                psikologPendamping: "-",
                layanan: trx.layanan,
                metode: "Online",
                tanggalBergabung: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
              })
            }
          })

          return {
            ...prev,
            recentTransactions: mappedTrx,
            clients: mergedClients,
          }
        })
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [user])

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
