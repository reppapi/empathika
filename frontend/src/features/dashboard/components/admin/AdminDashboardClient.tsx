"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Calendar, Plus, CheckCircle2 } from "lucide-react"

import ModalTambahSesi, { NewSessionData } from "./ModalTambahSesi"
import DashboardStatCards from "./DashboardStatCards"
import DashboardChart from "./DashboardChart"
import DashboardAgenda from "./DashboardAgenda"
import DashboardTodaySessions from "./DashboardTodaySessions"
import DashboardRecentTransactions from "./DashboardRecentTransactions"

import { TodaySessionItem } from "../../types"
import {
  INITIAL_DASHBOARD_METRICS,
  INITIAL_AGENDA_LIST,
} from "../../data/dashboardData"
import {
  TransaksiItem,
  getTodayTransactions,
  getTodayDateKey,
} from "@/features/transaksi/data/transaksiData"
import { getInitialSessionsBasedOnTime } from "@/features/konseling/components/admin/JadwalAdmin"

export default function AdminDashboardClient() {
  // 1. Ambil sesi konseling hari ini langsung dari Sesi & Jadwal (JadwalAdmin) bagian Sesi Klien Hari Ini
  const [sessions, setSessions] = useState<TodaySessionItem[]>(() => {
    return getInitialSessionsBasedOnTime().map((item) => ({
      waktu: item.waktu.includes("WIB") ? item.waktu : `${item.waktu} WIB`,
      klien: item.namaKlien,
      psikolog: item.psikolog,
      layanan: item.layanan,
      metode: item.tipe.toLowerCase().includes("online") ? "Online" : "Offline",
      status: item.status,
    }))
  })

  // 2. Ambil transaksi pembayaran pada saat tanggal hari ini saja
  const [transactions, setTransactions] = useState<TransaksiItem[]>(() => {
    return getTodayTransactions()
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Reaktif terhadap jam berjalan agar status sesi konseling sinkron otomatis seperti di JadwalAdmin
  useEffect(() => {
    const interval = setInterval(() => {
      const liveSessions = getInitialSessionsBasedOnTime()
      setSessions((prev) =>
        prev.map((curr) => {
          const match = liveSessions.find((s) => s.namaKlien === curr.klien)
          return match ? { ...curr, status: match.status } : curr
        })
      )
    }, 30000)

    return () => clearInterval(interval)
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
    const newTrx: TransaksiItem = {
      id: "trx_" + Date.now(),
      orderId: "KL-0" + Math.floor(130 + Math.random() * 800),
      orderDate: `Hari Ini, ${newSession.waktu.split(" - ")[0]} WIB`,
      clientName: newSession.namaKlien,
      clientEmail: `${newSession.namaKlien.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      clientPhone: newSession.kontak || "0812-0000-0000",
      jenisLayanan: "konseling",
      namaLayanan: newSession.layanan,
      psikologOrFasilitator: newSession.psikolog,
      jadwal: `Hari Ini, ${newSession.waktu}`,
      status: "Menunggu Pembayaran",
      subtotal: 250000,
      biayaLayanan: 2500,
      totalBayar: 252500,
      metodePembayaran: "BCA Virtual Account",
      waktuPembayaran: "-",
      tanggalTransaksi: getTodayDateKey(),
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
