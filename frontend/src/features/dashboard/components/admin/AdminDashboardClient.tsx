"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Calendar, Plus, CheckCircle2, Wallet, Users, Sparkles, Clock, FileText } from "lucide-react"

import ModalTambahSesi, { NewSessionData } from "./ModalTambahSesi"
import DashboardStatCards from "./DashboardStatCards"
import DashboardChart from "./DashboardChart"
import DashboardAgenda from "./DashboardAgenda"
import DashboardTodaySessions from "./DashboardTodaySessions"
import DashboardRecentTransactions from "./DashboardRecentTransactions"

import { TodaySessionItem, RecentTransactionItem, MetricItem, AgendaItem } from "../../types"
import { adminService } from "@/services/admin.service"

export default function AdminDashboardClient() {
  // 1. Ambil 5 kartu metrik ringkasan operasional real-time dari database
  const [metrics, setMetrics] = useState<MetricItem[]>([])
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  // 2. Ambil sesi konseling hari ini langsung dari Database PostgreSQL via adminService
  const [sessions, setSessions] = useState<TodaySessionItem[]>([])
  const [totalTodayCount, setTotalTodayCount] = useState<number>(0)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState<string | null>(null)

  // 3. State transaksi pembayaran terbaru (dari API)
  const [transactions, setTransactions] = useState<RecentTransactionItem[]>([])
  const [totalTransactionsCount, setTotalTransactionsCount] = useState<number>(0)
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)

  // 4. Agenda & Peringatan langsung dari Database PostgreSQL
  const [agendaList, setAgendaList] = useState<AgendaItem[]>([])
  const [agendaLoading, setAgendaLoading] = useState(true)
  const [agendaError, setAgendaError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Muat 5 kartu metrik ringkasan operasional murni dari Database
  const fetchMetrics = useCallback(() => {
    setMetricsLoading(true)
    setMetricsError(null)
    adminService
      .getDashboardMetrics()
      .then((res: any) => {
        if (res && res.pendapatanBulanIni) {
          setMetrics([
            {
              title: res.pendapatanBulanIni.title,
              value: res.pendapatanBulanIni.value,
              change: res.pendapatanBulanIni.change,
              icon: Wallet,
              color: res.pendapatanBulanIni.color || "#5D205E",
            },
            {
              title: res.menungguReview?.title || res.totalKlienAktif?.title || "Menunggu Review",
              value: res.menungguReview?.value || (res.totalKlienAktif?.value ? `${String(res.totalKlienAktif.value).replace(/[^0-9]/g, '') || 0} Tes` : "0 Tes"),
              change: res.menungguReview?.change || "Perlu ditinjau psikolog",
              icon: FileText,
              color: res.menungguReview?.color || res.totalKlienAktif?.color || "#5D205E",
            },
            {
              title: res.sesiKonselingSelesai.title,
              value: res.sesiKonselingSelesai.value,
              change: res.sesiKonselingSelesai.change,
              icon: CheckCircle2,
              color: res.sesiKonselingSelesai.color || "#5D205E",
            },
            {
              title: res.pendaftarEvent?.title || res.pendaftarWorkshop?.title || "Pendaftar Event",
              value: res.pendaftarEvent?.value || res.pendaftarWorkshop?.value || "0 Peserta",
              change: res.pendaftarEvent?.change || res.pendaftarWorkshop?.change || "Event dibuka",
              icon: Sparkles,
              color: res.pendaftarEvent?.color || res.pendaftarWorkshop?.color || "#5D205E",
            },
            {
              title: res.menungguPembayaran.title,
              value: res.menungguPembayaran.value,
              change: res.menungguPembayaran.change,
              icon: Clock,
              color: res.menungguPembayaran.color || "#D97706",
            },
          ])
        } else {
          setMetricsError("Format data metrik ringkasan operasional tidak valid.")
        }
      })
      .catch((err) => {
        setMetricsError(err?.response?.data?.message || err?.message || "Gagal memuat ringkasan operasional dari database.")
      })
      .finally(() => {
        setMetricsLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Muat sesi konseling hari ini murni dari Database (top 5 sesi terdekat)
  const fetchSessions = useCallback(() => {
    setSessionsLoading(true)
    setSessionsError(null)
    adminService
      .getDashboardTodaySessions({ limit: 5 })
      .then((res: any) => {
        if (res && Array.isArray(res.sessions)) {
          setSessions(res.sessions)
          setTotalTodayCount(res.totalCount || res.sessions.length)
        } else {
          setSessionsError("Format data sesi konseling tidak valid.")
        }
      })
      .catch((err) => {
        setSessionsError(err?.response?.data?.message || err?.message || "Gagal memuat jadwal sesi hari ini dari database.")
      })
      .finally(() => {
        setSessionsLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Muat transaksi pembayaran terbaru murni dari Database PostgreSQL
  const fetchTransactions = useCallback(() => {
    setTransactionsLoading(true)
    setTransactionsError(null)
    adminService
      .getDashboardRecentTransactions({ limit: 5 })
      .then((res: any) => {
        if (res && Array.isArray(res.transactions)) {
          setTransactions(res.transactions)
          setTotalTransactionsCount(res.totalCount || res.transactions.length)
        } else {
          setTransactionsError("Format data transaksi tidak valid.")
        }
      })
      .catch((err) => {
        setTransactionsError(err?.response?.data?.message || err?.message || "Gagal memuat transaksi terbaru dari database.")
      })
      .finally(() => {
        setTransactionsLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Muat agenda operasional mendatang murni dari Database PostgreSQL
  const fetchAgenda = useCallback(() => {
    setAgendaLoading(true)
    setAgendaError(null)
    adminService
      .getDashboardAgenda({ limit: 6 })
      .then((res: any) => {
        if (res && Array.isArray(res.agendaList)) {
          setAgendaList(res.agendaList)
        } else {
          setAgendaError("Format data agenda tidak valid.")
        }
      })
      .catch((err) => {
        setAgendaError(err?.response?.data?.message || err?.message || "Gagal memuat agenda operasional dari database.")
      })
      .finally(() => {
        setAgendaLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchAgenda()
  }, [fetchAgenda])

  const currentDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date())

  const handleSessionSuccess = async (newSession: NewSessionData) => {
    setNotification(`Sesi konseling baru untuk "${newSession.namaKlien}" berhasil dijadwalkan!`)
    setTimeout(() => setNotification(null), 4000)

    try {
      const cleanWaktu = newSession.waktu.replace(" WIB", "").trim()
      const parts = cleanWaktu.split("-").map((p) => p.trim())
      const jamMulai = parts[0]?.substring(0, 5) || "09:00"
      const jamSelesai = parts[1]?.substring(0, 5) || "10:00"

      await adminService.createSesiBaru({
        id_psikolog: newSession.idPsikolog || newSession.psikolog,
        id_layanan: newSession.idLayanan || newSession.layanan,
        tanggal: newSession.tanggal,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        metode: newSession.metode.toUpperCase() === "OFFLINE" ? "OFFLINE" : "ONLINE",
        deskripsi_trauma: newSession.catatan,
        klien: {
          nama: newSession.namaKlien.trim(),
          no_telepon: newSession.kontak.trim(),
        },
      })

      // Muat ulang seluruh metrik, jadwal, transaksi, dan agenda murni dari database PostgreSQL
      await Promise.all([
        fetchSessions(),
        fetchMetrics(),
        fetchAgenda(),
        fetchTransactions(),
      ])
    } catch (err: any) {
      console.warn("Gagal simpan sesi dari dashboard:", err?.response?.data?.message || err?.message)
    }
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
      <DashboardStatCards
        metrics={metrics}
        isLoading={metricsLoading}
        error={metricsError}
        onRetry={fetchMetrics}
      />

      {/* 3. Baris Grafik & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardChart />
        <DashboardAgenda
          agendaList={agendaList}
          isLoading={agendaLoading}
          error={agendaError}
          onRetry={fetchAgenda}
        />
      </div>

      {/* 4. Bagian Bawah: Jadwal Konseling Hari Ini & Transaksi Pembayaran Hari Ini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardTodaySessions
          sessions={sessions}
          totalCount={totalTodayCount}
          isLoading={sessionsLoading}
          error={sessionsError}
          onRetry={fetchSessions}
        />
        <DashboardRecentTransactions
          transactions={transactions}
          totalCount={totalTransactionsCount}
          isLoading={transactionsLoading}
          error={transactionsError}
          onRetry={fetchTransactions}
        />
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
