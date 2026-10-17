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
} from "../../data/biroDashboardData"

export default function AdminBiroDashboardClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Tenant Biro Aktif: Biro Konseling Cendekia Muda (id: biro-01)
  const currentTenant: BiroTenantData = useMemo(() => {
    return getBiroTenantData("biro-01")
  }, [])

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
