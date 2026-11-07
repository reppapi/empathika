"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, Users, Building2, CheckCircle2 } from "lucide-react"

import DashboardStatCards from "../admin/DashboardStatCards"
import BiroDashboardChart from "./BiroDashboardChart"
import BiroDashboardAgenda from "./BiroDashboardAgenda"
import BiroDashboardTodaySessions from "./BiroDashboardTodaySessions"
import BiroDashboardRecentTransactions from "./BiroDashboardRecentTransactions"
import BiroClientDetailModal from "./BiroClientDetailModal"
import BiroClientListModal from "./BiroClientListModal"

import { TodaySessionItem } from "../../types"
import {
  getBiroTenantData,
  BiroClientProfile,
  BiroTenantData,
  BIRO_TENANT_DATA,
} from "../../data/biroDashboardData"
import { useAuthStore } from "@/store/authStore"
import { biroAdminService } from "@/services/biro.service"
import { Wallet, Users as UsersIcon, CheckCircle2 as CheckCircle2Icon, Sparkles, Clock } from "lucide-react"

export default function AdminBiroDashboardClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const [activeTenant, setActiveTenant] = useState<BiroTenantData>(() => {
    return getBiroTenantData(user?.id)
  })

  useEffect(() => {
    let isMounted = true

    // Coba temukan tenant yang cocok dari mock data atau buat representasi tenant dinamis dari akun yang login
    const resolveTenant = (biroInfo?: { id?: string; nama_biro?: string; slug?: string }) => {
      const targetId = biroInfo?.id || user?.id || ""
      const targetSlug = biroInfo?.slug || ""
      const foundMockKey = Object.keys(BIRO_TENANT_DATA).find(
        (key) => key === targetId || BIRO_TENANT_DATA[key].biroSlug === targetSlug
      )

      if (foundMockKey) {
        setActiveTenant(BIRO_TENANT_DATA[foundMockKey])
      } else {
        const biroName = biroInfo?.nama_biro || user?.name || "Biro Mitra Baru"
        // Biro Baru: Data transaksi, sesi, klien, agenda, dan grafik dimulai dari 0/kosong
        setActiveTenant({
          biroId: targetId || "biro-baru",
          biroName,
          biroSlug: targetSlug || targetId || "biro-baru",
          tagline: `Dashboard Layanan & Klien ${biroName}`,
          color: "#561269",
          metrics: [
            {
              title: "Pendapatan Bulan Ini",
              value: "Rp 0",
              change: "0% dari bulan lalu",
              icon: Wallet,
              color: "#561269",
            },
            {
              title: "Klien Aktif Biro",
              value: "0 Klien",
              change: "Belum ada klien terdaftar",
              icon: UsersIcon,
              color: "#561269",
            },
            {
              title: "Sesi Konseling Selesai",
              value: "0 Sesi",
              change: "Akumulasi bulan ini",
              icon: CheckCircle2Icon,
              color: "#561269",
            },
            {
              title: "Pendaftar Layanan",
              value: "0 Peserta",
              change: "Belum ada program aktif",
              icon: Sparkles,
              color: "#561269",
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
            tahun: [
              { label: "Jan", value: 0, height: "0%" },
              { label: "Feb", value: 0, height: "0%" },
              { label: "Mar", value: 0, height: "0%" },
              { label: "Apr", value: 0, height: "0%" },
              { label: "Mei", value: 0, height: "0%" },
              { label: "Jun", value: 0, height: "0%" },
              { label: "Jul", value: 0, height: "0%" },
              { label: "Agu", value: 0, height: "0%" },
              { label: "Sep", value: 0, height: "0%" },
              { label: "Okt", value: 0, height: "0%" },
              { label: "Nov", value: 0, height: "0%" },
              { label: "Des", value: 0, height: "0%" },
            ],
          },
          agendaList: [],
          todaySessions: [],
          recentTransactions: [],
          clients: [],
        })
      }
    }

    resolveTenant()

    biroAdminService
      .getMyAccount()
      .then((res) => {
        if (!isMounted || !res?.data) return
        const beBiro = (res.data as any).owned_biro?.[0] || res.data.biro
        resolveTenant(beBiro)
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
        biroId: "biro-01",
        biroName: currentTenant.biroName,
        clientCode: "KLN-REG",
        nama: clientName,
        email: `${clientName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        telepon: "0812-3456-7890",
        usia: 22,
        status: "Aktif",
        fokusKonseling: "Konseling Terjadwal Hari Ini",
        totalSesi: 1,
        sesiTerakhir: "Hari ini",
        psikologPendamping: "Sarah Amalia, M.Psi",
        layanan: "Konseling Klien Biro",
        metode: "Online",
        tanggalBergabung: "September 2026",
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

      {/* ── 3. Baris Grafik & Agenda Kemitraan Biro ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BiroDashboardChart
          chartData={currentTenant.chartData}
          biroName={currentTenant.biroName}
        />
        <BiroDashboardAgenda agendaList={currentTenant.agendaList} />
      </div>

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
