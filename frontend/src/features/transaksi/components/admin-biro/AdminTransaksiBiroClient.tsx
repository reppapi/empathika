"use client"

import { useState, useMemo, useRef } from "react"
import { DUMMY_TRANSAKSI, JenisLayanan, TransaksiItem } from "../../data/transaksiData"

const LAYANAN_OPTIONS: { id: JenisLayanan; label: string }[] = [
  { id: "semua", label: "Semua Layanan" },
  { id: "konseling", label: "Konseling" },
  { id: "psikotes", label: "Psikotes" },
  { id: "pelatihan peer helper", label: "Pelatihan Peer Helper" },
  { id: "event", label: "Event" },
  { id: "asesment", label: "Asesment" },
]

export default function AdminTransaksiBiroClient() {
  const dateInputRef = useRef<HTMLInputElement>(null)

  // State Filter
  const [selectedLayanan, setSelectedLayanan] = useState<JenisLayanan>("semua")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("") // YYYY-MM-DD atau kosong
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-09") // Default September 2026

  // Transaksi yang dipilih untuk ditampilkan di kolom kanan
  const [selectedItem, setSelectedItem] = useState<TransaksiItem>(DUMMY_TRANSAKSI[0])

  // Filter & Urutkan Data (Ascending tanggal)
  const filteredTransaksi = useMemo(() => {
    const list = DUMMY_TRANSAKSI.filter((item) => {
      // 1. Filter Layanan
      if (selectedLayanan !== "semua" && item.jenisLayanan !== selectedLayanan) {
        return false
      }

      // 2. Filter Tanggal
      if (selectedDate) {
        if (item.tanggalTransaksi !== selectedDate) {
          return false
        }
      } else if (selectedMonth) {
        if (!item.tanggalTransaksi.startsWith(selectedMonth)) {
          return false
        }
      }

      return true
    })

    return list.sort((a, b) => {
      return a.tanggalTransaksi.localeCompare(b.tanggalTransaksi)
    })
  }, [selectedLayanan, selectedDate, selectedMonth])

  // Update selectedItem jika item saat ini tidak ada di filtered result
  const activeDetailItem = useMemo(() => {
    if (!filteredTransaksi.length) return null
    const found = filteredTransaksi.find((t) => t.id === selectedItem?.id)
    return found || filteredTransaksi[0]
  }, [filteredTransaksi, selectedItem])

  // Summary Metrics Biro (Khusus read-only monitoring)
  const summaryMetrics = useMemo(() => {
    const transaksiInPeriod = DUMMY_TRANSAKSI.filter((item) => {
      if (selectedDate) {
        return item.tanggalTransaksi === selectedDate
      }
      if (selectedMonth) {
        return item.tanggalTransaksi.startsWith(selectedMonth)
      }
      return true
    })

    const lunasList = transaksiInPeriod.filter((t) => t.status === "Lunas")
    const menungguList = transaksiInPeriod.filter((t) => t.status === "Menunggu Pembayaran")

    let totalPendapatan = 12500000
    let transaksiBerhasil = 154
    let menungguBayar = 3

    if (selectedDate) {
      totalPendapatan = lunasList.reduce((acc, curr) => acc + curr.totalBayar, 0)
      transaksiBerhasil = lunasList.length
      menungguBayar = menungguList.length
    } else if (selectedMonth === "") {
      totalPendapatan = 37850000
      transaksiBerhasil = 462
      menungguBayar = 9
    } else if (selectedMonth === "2026-10") {
      totalPendapatan = 14200000
      transaksiBerhasil = 168
      menungguBayar = 4
    } else if (selectedMonth === "2026-08") {
      totalPendapatan = 11150000
      transaksiBerhasil = 140
      menungguBayar = 2
    }

    let pendapatanLabel = "Total Transaksi Biro Bulan Ini"
    if (selectedDate) {
      pendapatanLabel = "Total Transaksi Hari Ini"
    } else if (selectedMonth === "") {
      pendapatanLabel = "Total Transaksi Semua Bulan"
    } else if (selectedMonth === "2026-10") {
      pendapatanLabel = "Total Transaksi Oktober 2026"
    } else if (selectedMonth === "2026-08") {
      pendapatanLabel = "Total Transaksi Agustus 2026"
    }

    return {
      totalPendapatan,
      transaksiBerhasil,
      menungguBayar,
      pendapatanLabel,
    }
  }, [selectedMonth, selectedDate])

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Info Box: Read-only Notice ── */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-5 h-5 shrink-0 text-blue-600 mt-0.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
        <div>
          <p className="font-bold">Akses Monitoring Transaksi Mitra Biro (Read-Only)</p>
          <p className="text-blue-700/90 mt-0.5">
            Admin Biro dapat memantau data seluruh pesanan, status pembayaran, dan rincian transaksi klien yang terhubung ke biro secara real-time tanpa izin modifikasi data finansial.
          </p>
        </div>
      </div>

      {/* ── Top Bar Filter Periode / Tanggal ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">
            Pilih Periode Transaksi Biro
          </h3>
          <p className="text-xs text-gray-500">
            Pantau transaksi per bulan atau tentukan tanggal spesifik
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Pilih Bulan */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setSelectedDate("")
              }}
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs sm:text-sm font-semibold text-gray-700 hover:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition cursor-pointer appearance-none"
            >
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-10">Oktober 2026</option>
              <option value="">Semua Bulan</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Pilih Tanggal Spesifik */}
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-semibold text-gray-700 hover:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <button
              type="button"
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker?.()
                } catch {
                  dateInputRef.current?.focus()
                }
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#561269] transition-colors p-1"
              title="Pilih tanggal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </button>
          </div>

          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shadow-xs"
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* ── 1. Baris Kartu Ringkasan (Summary Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-500">
            {summaryMetrics.pendapatanLabel}
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#561269] mt-2">
            Rp. {summaryMetrics.totalPendapatan.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-500">
            Transaksi Berhasil
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mt-2">
            {summaryMetrics.transaksiBerhasil}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-500">
            Menunggu Pembayaran
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-600 mt-2">
            {summaryMetrics.menungguBayar}
          </p>
        </div>
      </div>

      {/* ── 2. Konten Utama: 2 Kolom (Kiri: List Transaksi, Kanan: Detail Transaksi) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── KOLOM KIRI: List Transaksi (8 Kolom di LG) ── */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          {/* Header Bar: Filter Jenis Layanan */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200/90 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
            <span className="text-xs sm:text-sm font-bold text-gray-700">
              Menampilkan {filteredTransaksi.length} Transaksi
            </span>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:border-[#561269] hover:text-[#561269] transition shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.41A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                  />
                </svg>
                <span>
                  {LAYANAN_OPTIONS.find((o) => o.id === selectedLayanan)?.label || "Semua Layanan"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl">
                    {LAYANAN_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedLayanan(opt.id)
                          setIsFilterOpen(false)
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition flex items-center justify-between ${
                          selectedLayanan === opt.id
                            ? "bg-purple-50/70 font-bold text-[#561269]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedLayanan === opt.id && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#561269]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* List Card Transaksi */}
          {filteredTransaksi.length === 0 ? (
            <div className="rounded-3xl border border-gray-200/90 bg-white p-12 text-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mx-auto h-12 w-12 text-gray-300 mb-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6H2.25m0 0v1.5c0 .414.336.75.75.75H4.5m-2.25 0a60.07 60.07 0 0 0 15.797 2.101c.727.198 1.453-.342 1.453-1.096V7.5M3.75 12h16.5m-16.5 3.75h16.5"
                />
              </svg>
              <p className="text-sm font-semibold text-gray-600">
                Tidak ada transaksi pada filter yang dipilih.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Coba ganti filter layanan, bulan, atau reset filter tanggal.
              </p>
            </div>
          ) : (
            filteredTransaksi.map((item) => {
              const isSelected = activeDetailItem?.id === item.id

              let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200"
              if (item.status === "Menunggu Pembayaran") {
                badgeBg = "bg-amber-50 text-amber-700 border-amber-200"
              } else if (item.status === "Gagal") {
                badgeBg = "bg-red-50 text-red-700 border-red-200"
              }

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer rounded-3xl border bg-white p-5 sm:p-6 transition-all duration-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-md ${
                    isSelected
                      ? "border-[#561269] ring-2 ring-[#561269]/15"
                      : "border-gray-200/90 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {item.orderId}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{item.orderDate}</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-gray-900 mt-0.5">
                        {item.clientName}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="capitalize">{item.jenisLayanan}</span>
                        <span>-</span>
                        <span className="font-medium text-gray-700">
                          {item.namaLayanan}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold ${badgeBg}`}
                      >
                        {item.status}
                      </span>
                      <p className="text-sm sm:text-base font-extrabold text-[#561269]">
                        Rp. {item.totalBayar.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── KOLOM KANAN: Detail Transaksi (Sticky 4-5 Kolom di LG) ── */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-gray-200/90 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Header Detail */}
            <div className="border-b border-gray-100 p-5 sm:p-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Rincian Transaksi
                </h3>
                <p className="text-xs text-gray-400">
                  Data lengkap pesanan klien
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                Read Only
              </span>
            </div>

            {activeDetailItem ? (
              <div className="p-5 sm:p-6 flex flex-col gap-5">
                {/* Section 1: Order Info & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {activeDetailItem.orderId}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {activeDetailItem.orderDate}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      activeDetailItem.status === "Lunas"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : activeDetailItem.status === "Menunggu Pembayaran"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {activeDetailItem.status}
                  </span>
                </div>

                {/* Section 2: Informasi Klien */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Informasi Klien
                  </h4>
                  <div className="flex flex-col gap-1 text-xs">
                    <p className="text-sm font-bold text-gray-900">
                      {activeDetailItem.clientName}
                    </p>
                    <p className="text-gray-600">{activeDetailItem.clientEmail}</p>
                    <p className="text-gray-600">{activeDetailItem.clientPhone}</p>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gray-100" />

                {/* Section 3: Rincian Layanan */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Rincian Layanan
                  </h4>
                  <div className="flex flex-col gap-1 text-xs">
                    <p className="text-sm font-bold text-gray-900">
                      {activeDetailItem.namaLayanan}
                    </p>
                    {activeDetailItem.psikologOrFasilitator && (
                      <p className="text-gray-600">
                        Psikolog/Fasilitator:{" "}
                        <span className="font-semibold text-gray-800">
                          {activeDetailItem.psikologOrFasilitator}
                        </span>
                      </p>
                    )}
                    <p className="text-gray-500 mt-0.5">
                      Jadwal: {activeDetailItem.jadwal}
                    </p>
                  </div>
                </div>

                {/* Section 4: Rincian Biaya */}
                <div className="rounded-2xl bg-gray-50 p-4 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">
                      Rp. {activeDetailItem.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Layanan</span>
                    <span className="font-medium text-gray-800">
                      Rp. {activeDetailItem.biayaLayanan.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="h-[1px] w-full bg-gray-200 my-1" />
                  <div className="flex justify-between text-sm font-extrabold text-gray-900">
                    <span>Total Bayar</span>
                    <span className="text-[#561269]">
                      Rp. {activeDetailItem.totalBayar.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gray-100" />

                {/* Section 5: Metode Pembayaran */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Metode Pembayaran
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-[#561269]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {activeDetailItem.metodePembayaran}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Dibayar pada: {activeDetailItem.waktuPembayaran || activeDetailItem.orderDate}
                  </p>
                </div>

                {/* Info Note Read-Only */}
                <div className="mt-2 rounded-xl bg-purple-50/60 border border-purple-100 p-3 text-center">
                  <p className="text-[11px] font-medium text-[#561269]">
                    Status dan mutasi keuangan dikelola langsung oleh sistem pusat Empathika
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                Pilih transaksi untuk melihat detail.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
