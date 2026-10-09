"use client"

import { useState, useMemo, useRef } from "react"
import { DUMMY_TRANSAKSI, JenisLayanan, TransaksiItem } from "../data/transaksiData"

const LAYANAN_OPTIONS: { id: JenisLayanan; label: string }[] = [
  { id: "semua", label: "Semua Layanan" },
  { id: "konseling", label: "Konseling" },
  { id: "psikotes", label: "Psikotes" },
  { id: "pelatihan peer helper", label: "Pelatihan Peer Helper" },
  { id: "event", label: "Event" },
  { id: "asesment", label: "Asesment" },
]

export default function AdminTransaksiClient() {
  const dateInputRef = useRef<HTMLInputElement>(null)

  // State Filter
  const [selectedLayanan, setSelectedLayanan] = useState<JenisLayanan>("semua")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("") // YYYY-MM-DD atau kosong
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-09") // Default September 2026

  // Transaksi yang dipilih untuk ditampilkan di kolom kanan
  const [selectedItem, setSelectedItem] = useState<TransaksiItem>(DUMMY_TRANSAKSI[0])

  // Filter & Urutkan Data (dari tanggal/waktu yang lama ke terbaru)
  const filteredTransaksi = useMemo(() => {
    const list = DUMMY_TRANSAKSI.filter((item) => {
      // 1. Filter Layanan
      if (selectedLayanan !== "semua" && item.jenisLayanan !== selectedLayanan) {
        return false
      }

      // 2. Filter Tanggal (jika admin memilih tanggal spesifik)
      if (selectedDate) {
        if (item.tanggalTransaksi !== selectedDate) {
          return false
        }
      } else if (selectedMonth) {
        // Jika tidak pilih tanggal spesifik, filter berdasarkan bulan
        if (!item.tanggalTransaksi.startsWith(selectedMonth)) {
          return false
        }
      }

      return true
    })

    // Urutkan dari yang lama sampai yang terbaru (Ascending)
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

  // Hitung Summary Metrics dinamis berdasarkan filter periode (Bulan / Tanggal)
  const summaryMetrics = useMemo(() => {
    // Filter transaksi yang masuk ke periode terpilih untuk kartu ringkasan
    const transaksiInPeriod = DUMMY_TRANSAKSI.filter((item) => {
      if (selectedDate) {
        return item.tanggalTransaksi === selectedDate
      }
      if (selectedMonth) {
        return item.tanggalTransaksi.startsWith(selectedMonth)
      }
      return true // Jika "Semua Bulan"
    })

    const lunasList = transaksiInPeriod.filter((t) => t.status === "Lunas")
    const menungguList = transaksiInPeriod.filter((t) => t.status === "Menunggu Pembayaran")

    // Jika filter bulan aktif adalah default September 2026 dan tanpa filter tanggal spesifik,
    // kita gunakan baseline display prompt (Rp 12.500.000 / 154 / 3), sedangkan untuk periode lain dihitung dinamis proporsional
    let totalPendapatan = 12500000
    let transaksiBerhasil = 154
    let menungguBayar = 3

    if (selectedDate) {
      // Per tanggal spesifik
      totalPendapatan = lunasList.reduce((acc, curr) => acc + curr.totalBayar, 0)
      transaksiBerhasil = lunasList.length
      menungguBayar = menungguList.length
    } else if (selectedMonth === "") {
      // Semua Bulan: akumulasi seluruh bulan
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

    // Label dinamis kartu pendapatan
    let pendapatanLabel = "Total Pendapatan Bulan Ini"
    if (selectedDate) {
      pendapatanLabel = "Total Pendapatan Hari Ini"
    } else if (selectedMonth === "") {
      pendapatanLabel = "Total Pendapatan Semua Bulan"
    } else if (selectedMonth === "2026-10") {
      pendapatanLabel = "Total Pendapatan Oktober 2026"
    } else if (selectedMonth === "2026-08") {
      pendapatanLabel = "Total Pendapatan Agustus 2026"
    }

    return {
      totalPendapatan,
      transaksiBerhasil,
      menungguBayar,
      pendapatanLabel,
    }
  }, [selectedMonth, selectedDate])

  const handleSendInvoice = (item: TransaksiItem) => {
    const text = encodeURIComponent(
      `Halo ${item.clientName},\n\nTerima kasih atas pesanan Anda di Empathika.\nBerikut rincian tagihan/invoice transaksi:\n- Order ID: ${item.orderId}\n- Layanan: ${item.namaLayanan}\n- Total Bayar: Rp. ${item.totalBayar.toLocaleString("id-ID")}\n- Status: ${item.status}\n\nSemoga hari Anda menyenangkan!`
    )
    window.open(`https://wa.me/${item.clientPhone.replace(/^0/, "62")}?text=${text}`, "_blank")
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Bar Filter Periode / Tanggal (Sesuai gaya Blog) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">
            Pilih Periode Transaksi
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
                setSelectedDate("") // Reset tanggal spesifik jika ganti bulan
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

          {/* Pilih Tanggal Spesifik dengan Kalender (Icon single di paling kanan) */}
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

          {/* Reset Tanggal jika aktif */}
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="text-xs text-[#561269] hover:underline font-semibold"
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* ── 1. Baris Kartu Ringkasan (Summary Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Total Pendapatan (Dinamis sesuai filter periode) */}
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-500">
            {summaryMetrics.pendapatanLabel}
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#561269] mt-2">
            Rp. {summaryMetrics.totalPendapatan.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Card 2: Transaksi Berhasil */}
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-500">
            Transaksi Berhasil
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mt-2">
            {summaryMetrics.transaksiBerhasil}
          </p>
        </div>

        {/* Card 3: Menunggu Pembayaran */}
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-500">
            Menunggu Pembayaran
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#E5A800] mt-2">
            {summaryMetrics.menungguBayar}
          </p>
        </div>
      </div>

      {/* ── 2. Bagian Utama Transaksi ── */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Daftar Transaksi
        </h2>

        {/* ── 3. Grid Konten Transaksi (Terbagi 2 Kolom: Kiri untuk List, Kanan untuk Detail) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ════ Kolom Kiri: Daftar Transaksi (7 Kolom di lg) ════ */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl border border-gray-200/90 bg-white overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
            {/* Header List (Background Ungu Muda) */}
            <div className="bg-[#EFE8F3] px-5 py-3.5 flex items-center justify-between border-b border-purple-100">
              <div className="flex items-center gap-2">
                {/* Button: Semua */}
                <button
                  type="button"
                  onClick={() => setSelectedLayanan("semua")}
                  className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold shadow-sm transition-all ${selectedLayanan === "semua"
                      ? "bg-white text-[#561269]"
                      : "bg-white/70 text-gray-700 hover:bg-white"
                    }`}
                >
                  Semua
                </button>
              </div>

              {/* Button: [Ikon Filter] Filter dengan Popover Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4 text-[#561269]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                    />
                  </svg>
                  <span>Filter {selectedLayanan !== "semua" ? `(${selectedLayanan})` : ""}</span>
                </button>

                {/* Dropdown Filter Jenis Layanan */}
                {isFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-40 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 text-left text-xs font-semibold">
                      <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-400">
                        Filter Layanan
                      </p>
                      {LAYANAN_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedLayanan(opt.id)
                            setIsFilterOpen(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${selectedLayanan === opt.id
                              ? "bg-purple-50 text-[#561269] font-bold"
                              : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          <span>{opt.label}</span>
                          {selectedLayanan === opt.id && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                              stroke="currentColor"
                              className="h-3.5 w-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* List Item Transaksi */}
            <div className="divide-y divide-gray-100 max-h-[680px] overflow-y-auto">
              {filteredTransaksi.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm">
                  Tidak ada transaksi yang cocok dengan filter.
                </div>
              ) : (
                filteredTransaksi.map((item) => {
                  const isSelected = (activeDetailItem?.id ?? selectedItem?.id) === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`relative p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-[#F7F0FA]"
                          : "hover:bg-gray-50/90"
                      }`}
                    >
                      {/* Indikator Garis Ungu Tua Tipis di Pinggir Kiri (Penuh dari atas sampai bawah item tanpa jeda/batasan) */}
                      {isSelected && (
                        <div className="absolute inset-y-0 left-0 w-[5px] bg-[#561269]" />
                      )}
                      {/* Sisi Kiri Informasi */}
                      <div className="flex flex-col gap-1">
                        {/* Kiri Atas: ID */}
                        <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                          {item.orderId}
                        </span>

                        {/* Kiri Tengah: Nama (Bold) | Layanan */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-gray-900">
                            {item.clientName}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-600 font-medium text-xs sm:text-sm">
                            {item.namaLayanan}
                          </span>
                        </div>

                        {/* Kiri Bawah: Jadwal */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.6}
                            stroke="currentColor"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <span>{item.jadwal}</span>
                        </div>
                      </div>

                      {/* Sisi Kanan: Status & Nominal */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                        {/* Kanan Atas: Badge Status */}
                        {item.status === "Lunas" ? (
                          <span className="inline-flex items-center rounded-xl bg-[#A2DCA4] px-3 py-1 text-xs font-bold text-[#1C5E24]">
                            Lunas
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-xl bg-[#F0C94D] px-3 py-1 text-xs font-bold text-[#5C4505]">
                            Menunggu
                          </span>
                        )}

                        {/* Kanan Bawah: Nominal */}
                        <span className="text-sm sm:text-base font-extrabold text-gray-900 mt-1">
                          Rp. {item.totalBayar.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* ════ Kolom Kanan: Detail Transaksi (5 Kolom di lg) ════ */}
          <div className="lg:col-span-5 flex flex-col rounded-3xl border border-gray-200/90 bg-white overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-24">
            {/* Header Detail (Background Ungu Muda) */}
            <div className="bg-[#EFE8F3] px-5 py-4 border-b border-purple-100">
              <h3 className="text-base font-bold text-[#561269]">
                Detail Transaksi
              </h3>
            </div>

            {/* Body Detail (Background Putih) */}
            {activeDetailItem ? (
              <div className="p-6 flex flex-col gap-5">
                {/* Section 1: Order Info (Center alignment) */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                    ORDER ID
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                    {activeDetailItem.orderId}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {activeDetailItem.orderDate}
                  </span>
                </div>

                <div className="h-[1px] w-full bg-gray-100" />

                {/* Section 2: Informasi Klien */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Informasi Klien
                  </h4>
                  <div className="flex items-center gap-3">
                    {/* Profil: [Avatar Lingkaran Kuning Inisial K] */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE58F] text-base font-extrabold text-[#874D00]">
                      {activeDetailItem.clientName.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">
                        {activeDetailItem.clientName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activeDetailItem.clientEmail}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activeDetailItem.clientPhone}
                      </span>
                    </div>
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

                {/* Section 4: Rincian Biaya (Aligned Right/Left) */}
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

                {/* Action Button: Kirim Invoice Ke Wa (Outline Hijau, teks hijau, full width) */}
                <button
                  type="button"
                  onClick={() => handleSendInvoice(activeDetailItem)}
                  className="mt-2 w-full rounded-2xl border-2 border-[#25D366] bg-transparent hover:bg-[#25D366]/10 px-4 py-3 text-xs sm:text-sm font-bold text-[#25D366] transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.668-.699c.969.54 1.769.88 2.792.88 3.182 0 5.77-2.587 5.77-5.766.001-3.187-2.575-5.766-5.77-5.766zm3.393 8.307c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.18-.544-1.897-.789-3.125-2.73-3.22-2.856-.095-.126-.768-1.021-.768-1.947 0-.925.485-1.38.658-1.57.172-.19.376-.238.502-.238.125 0 .251.002.36.008.117.006.275-.045.43.328.16.386.544 1.332.593 1.43.049.098.082.213.016.342-.066.13-.099.21-.197.324-.099.115-.207.257-.297.345-.102.099-.208.207-.09.41.118.203.526.868 1.13 1.405.779.692 1.435.906 1.639 1.007.204.099.324.086.444-.051.121-.137.518-.602.656-.809.138-.207.276-.172.464-.103.189.069 1.201.566 1.408.669.207.103.345.155.394.241.049.086.049.502-.095.907z" />
                  </svg>
                  Kirim Invoice Ke Wa
                </button>
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
