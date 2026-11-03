"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Calendar, Plus, CheckCircle2 } from "lucide-react"

import ModalTambahSesi, { NewSessionData } from "./ModalTambahSesi"
import DashboardStatCards from "./DashboardStatCards"
import DashboardChart from "./DashboardChart"
import DashboardAgenda from "./DashboardAgenda"
import DashboardTodaySessions from "./DashboardTodaySessions"
import DashboardRecentTransactions from "./DashboardRecentTransactions"

import { TodaySessionItem, RecentTransactionItem } from "../../types"
import {
  INITIAL_DASHBOARD_METRICS,
  INITIAL_AGENDA_LIST,
} from "../../data/dashboardData"
import { adminService } from "@/services/admin.service"

export default function AdminDashboardClient() {
  // 1. Ambil sesi konseling hari ini langsung dari Database PostgreSQL via adminService
  const [sessions, setSessions] = useState<TodaySessionItem[]>([])

  // 2. State transaksi pembayaran terbaru (dari API)
  const [transactions, setTransactions] = useState<RecentTransactionItem[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Muat sesi konseling hari ini murni dari Database
  useEffect(() => {
    adminService
      .getJadwal()
      .then((res: any) => {
        if (res && Array.isArray(res.todaySessions)) {
          setSessions(
            res.todaySessions.map((item: any) => ({
              waktu: (item.waktuRange || item.waktu || "").includes("WIB")
                ? item.waktuRange || item.waktu
                : `${item.waktuRange || item.waktu || ""} WIB`,
              klien: item.namaKlien,
              psikolog: item.psikolog,
              layanan: item.layanan,
              metode: item.metode,
              status: item.status,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const currentDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date())

  const handleSessionSuccess = (newSession: NewSessionData) => {
    // 1. Tambahkan ke Sesi Konseling Hari Ini
    const item: TodaySessionItem = {
      waktu: newSession.waktu,
      klien: newSession.namaKlien,
      psikolog: newSession.psikolog,
      layanan: newSession.layanan,
      metode: newSession.metode,
      status: newSession.status,
    }
    setSessions((prev) => [item, ...prev])

    // 2. Tambahkan transaksi pada tanggal hari ini
    // 2. Tambahkan placeholder transaksi baru ke list (pending, belum bayar)
    const newTrx = {
      id: "trx_" + Date.now(),
      client: newSession.namaKlien,
      layanan: newSession.layanan,
      metode: "-",
      kategori: "Konseling",
      total: "Menunggu",
      status: "Menunggu Pembayaran" as const,
    }
    setTransactions((prev) => [newTrx, ...prev])

    setNotification(`Sesi konseling baru untuk "${newSession.namaKlien}" berhasil dijadwalkan!`)
    setTimeout(() => setNotification(null), 4000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 font-poppins pb-12 relative">
      {/* Toast Notifikasi Berhasil */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#5D205E] px-5 py-3.5 text-white shadow-2xl transition-all animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#E8C32A] shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">{notification}</p>
        </div>
      )}

      {/* 1. Welcome & Quick Actions Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Selamat Datang, Admin!
          </h1>
        </div>

        {/* Kolom Kanan: Tanggal & Tombol Tambah Sesi */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto justify-start sm:justify-end">
          {/* Tanggal Hari Ini */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/90 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#8a720d]" />
            <span>{currentDate}</span>
          </div>

          {/* Tombol Tambah Sesi */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all transform active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Sesi</span>
          </button>
        </div>
      </div>

      {/* 2. Grid Kartu Metrik (5 Kolom Seimbang & Rapi) */}
      <DashboardStatCards metrics={INITIAL_DASHBOARD_METRICS} />

      {/* 3. Baris Grafik & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardChart />
        <DashboardAgenda agendaList={INITIAL_AGENDA_LIST} />
      </div>

      {/* 4. Bagian Bawah: Jadwal Konseling Hari Ini & Transaksi Pembayaran Hari Ini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardTodaySessions sessions={sessions} />
        <DashboardRecentTransactions transactions={transactions} />
      </div>

      {/* Modal Tambah Sesi */}
      <ModalTambahSesi
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSessionSuccess}
      />
    </div>
  )
}
