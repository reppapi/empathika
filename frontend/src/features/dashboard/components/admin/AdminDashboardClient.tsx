"use client"

import { useState } from "react"
import Link from "next/link"
import ModalTambahSesi, { NewSessionData } from "./ModalTambahSesi"
import {
  Calendar,
  ArrowUp,
  ChevronDown,
  Wallet,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Video,
  MapPin,
  AlertCircle
} from "lucide-react"

export default function AdminDashboardClient() {
  const [chartPeriod, setChartPeriod] = useState<"minggu" | "bulan" | "bulan_lalu">("minggu")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const currentDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date())

  // Data grafik reservasi dinamis berdasarkan filter
  const chartData = {
    minggu: [
      { label: "Sen", value: 4, height: "45%" },
      { label: "Sel", value: 9, height: "90%" },
      { label: "Rab", value: 3, height: "35%" },
      { label: "Kam", value: 7, height: "70%" },
      { label: "Jum", value: 6, height: "60%" },
      { label: "Sab", value: 8, height: "80%" },
      { label: "Min", value: 2, height: "25%" }
    ],
    bulan: [
      { label: "Mgg 1", value: 24, height: "65%" },
      { label: "Mgg 2", value: 38, height: "95%" },
      { label: "Mgg 3", value: 19, height: "50%" },
      { label: "Mgg 4", value: 31, height: "80%" }
    ],
    bulan_lalu: [
      { label: "Mgg 1", value: 18, height: "55%" },
      { label: "Mgg 2", value: 26, height: "75%" },
      { label: "Mgg 3", value: 32, height: "90%" },
      { label: "Mgg 4", value: 22, height: "65%" }
    ]
  }

  const activeChart = chartData[chartPeriod]

  const periodLabels = {
    minggu: "Minggu Ini",
    bulan: "Bulan Ini",
    bulan_lalu: "Bulan Lalu"
  }

  // Ringkasan metrik statistik
  const metrics = [
    {
      title: "Total Pendapatan Bulan Ini",
      value: "Rp 18.750.000",
      change: "+12.5% dari bulan lalu",
      icon: Wallet,
      color: "#5D205E"
    },
    {
      title: "Total Klien Aktif",
      value: "34 Klien",
      change: "+8% dari kemarin",
      icon: Users,
      color: "#5D205E"
    },
    {
      title: "Sesi Konseling Selesai",
      value: "42 Sesi",
      change: "Bulan berjalan",
      icon: CheckCircle2,
      color: "#5D205E"
    },
    {
      title: "Pendaftar Baru Workshop",
      value: "18 Peserta",
      change: "Dari 2 event aktif",
      icon: Sparkles,
      color: "#5D205E"
    },
    {
      title: "Menunggu Pembayaran",
      value: "3 Transaksi",
      change: "Perlu konfirmasi",
      icon: Clock,
      color: "#D97706"
    }
  ]

  // Data Agenda & Peringatan interaktif dengan Link
  const agendaList = [
    {
      title: "Workshop SEFT Batch 4",
      type: "Event",
      time: "Besok, 10:00 WIB",
      href: "/admin/event",
      badgeColor: "bg-[#5D205E] text-white",
      dotColor: "bg-[#5D205E]"
    },
    {
      title: "Konseling: Bpk. Andi Pratama",
      type: "Konseling",
      time: "Besok, 13:00 WIB",
      href: "/admin/jadwal",
      badgeColor: "bg-[#F3E8F5] text-[#5D205E]",
      dotColor: "bg-[#BFA3C5]"
    },
    {
      title: "Batas Pembayaran Klien (Invoice #EV-0071)",
      type: "Peringatan",
      time: "Hari Ini, 15:00",
      href: "/admin/transaksi",
      badgeColor: "bg-red-50 text-red-700",
      dotColor: "bg-red-500"
    },
    {
      title: "Webinar Mental Health Awareness",
      type: "Event",
      time: "Kamis, 19:00",
      href: "/admin/event",
      badgeColor: "bg-[#5D205E] text-white",
      dotColor: "bg-[#5D205E]"
    },
    {
      title: "Konseling: Ibu Sarah Melati",
      type: "Konseling",
      time: "Jumat, 09:00 WIB",
      href: "/admin/jadwal",
      badgeColor: "bg-[#F3E8F5] text-[#5D205E]",
      dotColor: "bg-[#BFA3C5]"
    },
    {
      title: "Pengajuan Kerja Sama Baru (Biro Sahabat)",
      type: "Kemitraan",
      time: "Menunggu Review",
      href: "/admin/kerja-sama",
      badgeColor: "bg-blue-50 text-blue-700",
      dotColor: "bg-blue-500"
    }
  ]

  // Transaksi terbaru
  const recentTransactions = [
    {
      id: "TRX-8821",
      client: "Rian Hidayat",
      layanan: "Seminar Resilience & Mindfulness",
      kategori: "Event",
      total: "Rp 102.500",
      metode: "QRIS",
      status: "Lunas"
    },
    {
      id: "TRX-8822",
      client: "Nadia Utami",
      layanan: "Konseling Individu (1 Sesi)",
      kategori: "Konseling",
      total: "Rp 250.000",
      metode: "Transfer BCA",
      status: "Lunas"
    },
    {
      id: "TRX-8823",
      client: "Dimas Wicaksono",
      layanan: "Workshop SEFT Batch 4",
      kategori: "Event",
      total: "Rp 150.000",
      metode: "Mandiri VA",
      status: "Menunggu Pembayaran"
    },
    {
      id: "TRX-8824",
      client: "Farah Salsabila",
      layanan: "Psikotes Minat & Bakat Karir",
      kategori: "Psikotes",
      total: "Rp 320.000",
      metode: "GoPay",
      status: "Lunas"
    }
  ]

  // Tipe data sesi hari ini
  interface TodaySessionItem {
    waktu: string
    klien: string
    psikolog: string
    layanan: string
    metode: "Online" | "Offline"
    status: "Selesai" | "Sedang Berjalan" | "Mendatang"
  }

  // Sesi konseling hari ini (stateful)
  const initialSessions: TodaySessionItem[] = [
    {
      waktu: "09:00 - 10:00 WIB",
      klien: "Karen Sya",
      psikolog: "Sarah Amalia, M.Psi",
      layanan: "Konseling Dewasa",
      metode: "Online",
      status: "Selesai"
    },
    {
      waktu: "13:30 - 14:30 WIB",
      klien: "Budi Santoso",
      psikolog: "Dr. Dimas Prasetyo",
      layanan: "Konseling Karir & Stres",
      metode: "Offline",
      status: "Sedang Berjalan"
    },
    {
      waktu: "16:00 - 17:00 WIB",
      klien: "Anisa Rahma",
      psikolog: "Rizki Putri D., M.Psi",
      layanan: "Konseling Remaja",
      metode: "Online",
      status: "Mendatang"
    }
  ]

  const [sessions, setSessions] = useState<TodaySessionItem[]>(initialSessions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const handleSessionSuccess = (newSession: NewSessionData) => {
    const item: TodaySessionItem = {
      waktu: newSession.waktu,
      klien: newSession.namaKlien,
      psikolog: newSession.psikolog,
      layanan: newSession.layanan,
      metode: newSession.metode,
      status: newSession.status,
    }
    setSessions((prev) => [item, ...prev])
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

      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Selamat Pagi, Admin!
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Operasional Aktif
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Berikut adalah ringkasan performa dan aktivitas layanan Empathika hari ini.
          </p>
        </div>

        {/* Kolom Kanan: Disusun Vertikal (Atas: Tanggal, Bawah: Tombol Tambah Sesi) */}
        <div className="flex flex-col items-start sm:items-end justify-center gap-2.5 shrink-0 w-full sm:w-auto">
          {/* Atas: Tanggal Hari Ini */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/90 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#8a720d]" />
            <span>{currentDate}</span>
          </div>

          {/* Bawah: Tombol Tambah Sesi */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#E8C32A] hover:bg-[#d4b024] text-gray-900 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all active:scale-98 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Sesi</span>
          </button>
        </div>
      </div>

      {/* 2. Grid Kartu Metrik (5 Kolom Seimbang & Rapi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {metrics.map((item, idx) => {
          const IconComp = item.icon
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="h-1.5 w-full bg-[#5D205E] absolute top-0 left-0"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider line-clamp-1">
                    {item.title}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#F9F5FA] flex items-center justify-center shrink-0">
                    <IconComp className="w-4 h-4 text-[#5D205E]" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {item.value}
                </h3>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-3">
                <ArrowUp className="w-3 h-3" />
                {item.change}
              </p>
            </div>
          )
        })}
      </div>

      {/* 3. Baris Grafik & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Reservasi Interaktif */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Grafik Reservasi Sesi</h3>
              <p className="text-xs text-gray-500 mt-0.5">Total janji temu & pendaftaran layanan klien</p>
            </div>

            {/* Filter Dropdown Aktif */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors"
              >
                {periodLabels[chartPeriod]}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 font-poppins text-xs">
                  {(["minggu", "bulan", "bulan_lalu"] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => {
                        setChartPeriod(period)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-[#F9F5FA] transition-colors ${
                        chartPeriod === period ? "font-bold text-[#5D205E] bg-[#F9F5FA]" : "text-gray-700"
                      }`}
                    >
                      {periodLabels[period]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="flex-1 flex items-end justify-between px-2 sm:px-6 gap-3 sm:gap-6 h-[240px] pt-4 pb-2 border-b border-gray-100">
            {activeChart.map((item, index) => (
              <div key={index} className="flex flex-col items-center w-full group relative h-full justify-end">
                <span className="text-gray-900 font-bold mb-2 text-sm sm:text-base group-hover:text-[#5D205E] transition-colors">
                  {item.value}
                </span>
                <div
                  className="w-full max-w-[55px] bg-[#BFA3C5] rounded-t-lg transition-all duration-300 group-hover:bg-[#5D205E] cursor-pointer"
                  style={{ height: item.height }}
                ></div>
                <span className="text-xs font-semibold text-gray-500 mt-3">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5D205E]"></span>
              Reservasi Terkonfirmasi
            </span>
            <span>Rata-rata: <strong>{Math.round(activeChart.reduce((a, b) => a + b.value, 0) / activeChart.length)} sesi / periode</strong></span>
          </div>
        </div>

        {/* Agenda & Peringatan Terhubung Link */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Agenda & Peringatan</h3>
              <span className="text-xs font-semibold text-gray-400">Hari ini & terdekat</span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {agendaList.map((item, index) => (
                <Link
                  key={index}
                  href={item.href as any}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#5D205E]/30 hover:bg-[#F9F5FA] transition-all group cursor-pointer"
                >
                  <div className={`mt-1.5 w-2 h-2 rounded-full ${item.dotColor} shrink-0`}></div>
                  <div className="flex flex-col gap-1 w-full min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.type}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 leading-snug group-hover:text-[#5D205E] transition-colors truncate">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/admin/jadwal"
            className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-[#5D205E] hover:underline"
          >
            Lihat Jadwal Selengkapnya
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Bagian Bawah: Jadwal Konseling Hari Ini & Transaksi Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sesi Konseling Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Sesi Konseling Hari Ini</h3>
              <p className="text-xs text-gray-500 mt-0.5">Jadwal konsultasi klien & psikolog</p>
            </div>
            <Link
              href="/admin/jadwal"
              className="text-xs font-bold text-[#5D205E] hover:underline flex items-center gap-1"
            >
              Kelola
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {sessions.map((session, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors animate-fadeIn"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#5D205E]/10 text-[#5D205E] flex items-center justify-center font-bold text-xs shrink-0">
                    {session.metode === "Online" ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{session.klien}</h4>
                    <p className="text-[11px] text-gray-500">
                      {session.layanan} • <span className="font-semibold text-gray-700">{session.psikolog}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                  <span className="text-xs font-semibold text-gray-800">{session.waktu}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      session.status === "Selesai"
                        ? "bg-emerald-100 text-emerald-800"
                        : session.status === "Sedang Berjalan"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaksi Terbaru */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Transaksi Pembayaran Terbaru</h3>
              <p className="text-xs text-gray-500 mt-0.5">Pantau konfirmasi pembayaran masuk</p>
            </div>
            <Link
              href="/admin/transaksi"
              className="text-xs font-bold text-[#5D205E] hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentTransactions.map((trx, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#5D205E] flex items-center justify-center font-bold text-xs shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-gray-900">{trx.client}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">({trx.id})</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {trx.layanan} • <span className="font-semibold text-gray-600">{trx.metode}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                  <span className="text-xs font-extrabold text-gray-900">{trx.total}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      trx.status === "Lunas"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {trx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
