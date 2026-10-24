"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import { transaksiService } from "@/services/transaksi.service"
import { AlertCircle, RotateCcw, X, DollarSign } from "lucide-react"

type JenisLayanan = "semua" | "konseling" | "psikotes" | "pelatihan peer helper" | "event" | "asesment"

const LAYANAN_OPTIONS: { id: JenisLayanan; label: string }[] = [
  { id: "semua", label: "Semua Layanan" },
  { id: "konseling", label: "Konseling" },
  { id: "psikotes", label: "Psikotes" },
  { id: "pelatihan peer helper", label: "Pelatihan Peer Helper" },
  { id: "event", label: "Event" },
  { id: "asesment", label: "Asesment" },
]

// ── Modal Konfirmasi Refund ──
function ModalRefundTransaksi({
  transaksi,
  onClose,
  onConfirm,
}: {
  transaksi: any | null
  onClose: () => void
  onConfirm: (id: string, alasan: string) => Promise<void>
}) {
  const [alasan, setAlasan] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (transaksi) {
      setAlasan("")
      setErrorMsg(null)
    }
  }, [transaksi])

  if (!transaksi) return null

  const nominalStr = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(transaksi.jumlah || transaksi.total_harga || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alasan.trim()) {
      setErrorMsg("Alasan refund wajib diisi oleh Admin")
      return
    }
    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      await onConfirm(transaksi.id, alasan.trim())
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Gagal memproses refund. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const klienName =
    transaksi.user?.name ||
    transaksi.nama_klien ||
    transaksi.nama_user ||
    "Klien"

  const layananName =
    transaksi.booking?.layanan?.nama_layanan ||
    transaksi.nama_layanan ||
    transaksi.layanan ||
    "-"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-poppins">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-7 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Konfirmasi Refund Transaksi
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pengembalian dana penuh 100% (Maksimal H-1)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ringkasan */}
        <div className="space-y-3 mb-5 text-xs">
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-gray-600">
              <span className="font-medium">Klien</span>
              <span className="font-bold text-gray-900">{klienName}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="font-medium">Layanan</span>
              <span className="font-bold text-gray-900">{layananName}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="font-medium">Order ID</span>
              <span className="font-bold text-gray-900">{transaksi.order_id || transaksi.id?.slice(0, 8)?.toUpperCase() || "-"}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Nominal Refund (100%)
              </span>
              <span className="font-extrabold text-emerald-700 text-sm">{nominalStr}</span>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-semibold text-[11px] leading-snug">
              Refund hanya dapat dilakukan maksimal H-1 sebelum jadwal sesi.
              Pastikan permintaan klien memenuhi syarat sebelum mengkonfirmasi.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Alasan Refund <span className="text-red-500">*</span>
            </label>
            <textarea
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value)
                if (errorMsg) setErrorMsg(null)
              }}
              rows={3}
              placeholder="Contoh: Klien berhalangan karena urusan mendadak dan mengajukan sebelum batas H-1"
              className="w-full text-xs rounded-xl border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] transition"
              required
            />
            {errorMsg && (
              <p className="text-[11px] font-semibold text-red-600 mt-1">{errorMsg}</p>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                "Konfirmasi Refund"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Helper: normalize Prisma API response → display shape ──
function normalizeTransaksi(raw: any) {
  const booking = raw.booking || {}
  const user = raw.user || raw.klien || {}
  const layanan = booking.layanan || {}
  const psikolog = booking.psikolog || {}
  const jadwal = booking.jadwal_slot || booking.jadwal || {}

  const jenisRaw = (layanan.kategori || layanan.jenis_layanan || "konseling")
    .toLowerCase()
    .replace(/_/g, " ")

  const jenisMap: Record<string, JenisLayanan> = {
    konseling: "konseling",
    psikotes: "psikotes",
    "pelatihan peer helper": "pelatihan peer helper",
    event: "event",
    asesment: "asesment",
    asesmen: "asesment",
  }
  const jenisLayanan: JenisLayanan =
    (Object.keys(jenisMap).find((k) => jenisRaw.includes(k))
      ? jenisMap[Object.keys(jenisMap).find((k) => jenisRaw.includes(k))!]
      : "konseling") as JenisLayanan

  const statusRaw = (raw.status_pembayaran || raw.status || "").toUpperCase()
  let status: "Lunas" | "Menunggu Pembayaran" | "Gagal" | "Refunded"
  if (statusRaw === "PAID" || statusRaw === "SUCCESS" || statusRaw === "LUNAS") {
    status = "Lunas"
  } else if (statusRaw === "REFUNDED") {
    status = "Refunded"
  } else if (
    statusRaw === "FAILED" ||
    statusRaw === "FAILURE" ||
    statusRaw === "EXPIRED" ||
    statusRaw === "GAGAL"
  ) {
    status = "Gagal"
  } else {
    status = "Menunggu Pembayaran"
  }

  const createdAt = raw.created_at ? new Date(raw.created_at) : new Date()
  const tanggalTransaksi = createdAt.toISOString().split("T")[0]

  const jadwalDate = jadwal.tanggal ? new Date(jadwal.tanggal + "T00:00:00") : null
  const jadwalDisplay = jadwalDate
    ? jadwalDate.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) +
      (jadwal.jam_mulai ? `, ${jadwal.jam_mulai}` : "") +
      (jadwal.jam_selesai ? ` - ${jadwal.jam_selesai}` : "")
    : "-"

  const total = Number(raw.jumlah || raw.total_harga || raw.nominal || 0)
  const biaya = Number(raw.biaya_admin || raw.biaya_layanan || 0)
  const subtotal = total - biaya

  return {
    id: raw.id,
    orderId: raw.order_id || raw.id?.slice(0, 8)?.toUpperCase() || "-",
    orderDate: createdAt.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB",
    clientName: user.name || user.nama || "–",
    clientEmail: user.email || "–",
    clientPhone: user.no_hp || user.phone || "–",
    jenisLayanan,
    namaLayanan: layanan.nama_layanan || layanan.nama || "–",
    psikologOrFasilitator:
      psikolog.name ||
      psikolog.nama ||
      (booking.psikolog_id ? `Psikolog #${booking.psikolog_id}` : undefined),
    jadwal: jadwalDisplay,
    status,
    subtotal,
    biayaLayanan: biaya,
    totalBayar: total,
    metodePembayaran:
      raw.metode_pembayaran || raw.payment_type || raw.channel || "–",
    waktuPembayaran: raw.paid_at
      ? new Date(raw.paid_at).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      : undefined,
    tanggalTransaksi,
    // raw for refund
    _raw: raw,
  }
}

export default function AdminTransaksiClient() {
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Data state
  const [allTransaksi, setAllTransaksi] = useState<ReturnType<typeof normalizeTransaksi>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Filter State
  const [selectedLayanan, setSelectedLayanan] = useState<JenisLayanan>("semua")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  // Detail & Refund state
  const [selectedItem, setSelectedItem] = useState<ReturnType<typeof normalizeTransaksi> | null>(null)
  const [transaksiToRefund, setTransaksiToRefund] = useState<any | null>(null)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" } | null>(null)

  const triggerToast = useCallback((message: string, type: "success" | "danger" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Fetch data
  const fetchTransaksi = useCallback(async () => {
    try {
      setIsLoading(true)
      setFetchError(null)
      const res = await transaksiService.getAllAdmin()
      const normalized = (res.data || []).map(normalizeTransaksi)
      setAllTransaksi(normalized)
      if (normalized.length > 0 && !selectedItem) {
        setSelectedItem(normalized[0])
      }
    } catch (err: any) {
      setFetchError(err?.response?.data?.message || err?.message || "Gagal memuat data transaksi")
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchTransaksi()
  }, [fetchTransaksi])

  // Filter & Sort
  const filteredTransaksi = useMemo(() => {
    const list = allTransaksi.filter((item) => {
      if (selectedLayanan !== "semua" && item.jenisLayanan !== selectedLayanan) return false
      if (selectedDate) {
        if (item.tanggalTransaksi !== selectedDate) return false
      } else if (selectedMonth) {
        if (!item.tanggalTransaksi.startsWith(selectedMonth)) return false
      }
      return true
    })
    return list.sort((a, b) => b.tanggalTransaksi.localeCompare(a.tanggalTransaksi))
  }, [allTransaksi, selectedLayanan, selectedDate, selectedMonth])

  // Active detail item
  const activeDetailItem = useMemo(() => {
    if (!filteredTransaksi.length) return null
    const found = filteredTransaksi.find((t) => t.id === selectedItem?.id)
    return found || filteredTransaksi[0]
  }, [filteredTransaksi, selectedItem])

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const inPeriod = allTransaksi.filter((item) => {
      if (selectedDate) return item.tanggalTransaksi === selectedDate
      if (selectedMonth) return item.tanggalTransaksi.startsWith(selectedMonth)
      return true
    })
    const lunasList = inPeriod.filter((t) => t.status === "Lunas")
    const menungguList = inPeriod.filter((t) => t.status === "Menunggu Pembayaran")
    const totalPendapatan = lunasList.reduce((acc, t) => acc + t.totalBayar, 0)
    const transaksiBerhasil = lunasList.length
    const menungguBayar = menungguList.length

    let pendapatanLabel = "Total Pendapatan"
    if (selectedDate) pendapatanLabel = "Total Pendapatan Hari Ini"
    else if (selectedMonth) {
      const [y, m] = selectedMonth.split("-")
      const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
      pendapatanLabel = `Total Pendapatan ${monthNames[parseInt(m) - 1]} ${y}`
    }

    return { totalPendapatan, transaksiBerhasil, menungguBayar, pendapatanLabel }
  }, [allTransaksi, selectedDate, selectedMonth])

  // Refund handler
  const handleRefund = async (id: string, alasan: string) => {
    await transaksiService.processRefund(id, { alasan })
    setAllTransaksi((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "Refunded" as any }
          : t
      )
    )
    triggerToast("Refund berhasil diproses.", "success")
  }

  // Invoice send handler
  const handleSendInvoice = (item: ReturnType<typeof normalizeTransaksi>) => {
    const phone = item.clientPhone
      .replace(/[^0-9]/g, "")
      .replace(/^0/, "62")
    const text = encodeURIComponent(
      `Halo ${item.clientName},\n\nTerima kasih atas kepercayaan Anda kepada Empathika.\nBerikut rincian invoice transaksi Anda:\n- Order ID: ${item.orderId}\n- Layanan: ${item.namaLayanan}\n- Total Bayar: Rp. ${item.totalBayar.toLocaleString("id-ID")}\n- Status: ${item.status}\n\nUntuk informasi lebih lanjut, hubungi kami di 081234567890.\n\nSalam hangat,\nTim Empathika`
    )
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank")
  }

  // Month label for select
  const getMonthLabel = (ym: string) => {
    const [y, m] = ym.split("-")
    const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
    return `${monthNames[parseInt(m) - 1]} ${y}`
  }

  // Generate month options: 12 months back from now
  const monthOptions = useMemo(() => {
    const opts: string[] = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
    }
    return opts
  }, [])

  // ── Render ──
  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Bar Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Pilih Periode Transaksi</h3>
          <p className="text-xs text-gray-500">Pantau transaksi per bulan atau tentukan tanggal spesifik</p>
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
              {monthOptions.map((ym) => (
                <option key={ym} value={ym}>{getMonthLabel(ym)}</option>
              ))}
              <option value="">Semua Bulan</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Pilih Tanggal */}
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
                try { dateInputRef.current?.showPicker?.() }
                catch { dateInputRef.current?.focus() }
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#561269] transition-colors p-1"
              title="Pilih tanggal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </button>
          </div>

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

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-500">{summaryMetrics.pendapatanLabel}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#561269] mt-2">
            Rp. {summaryMetrics.totalPendapatan.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-500">Transaksi Berhasil</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mt-2">
            {summaryMetrics.transaksiBerhasil}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-500">Menunggu Pembayaran</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#E5A800] mt-2">
            {summaryMetrics.menungguBayar}
          </p>
        </div>
      </div>

      {/* ── Daftar Transaksi ── */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Daftar Transaksi</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            <div className="w-6 h-6 border-2 border-[#561269] border-t-transparent rounded-full animate-spin mr-3" />
            Memuat data transaksi...
          </div>
        ) : fetchError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm font-semibold text-center">
            {fetchError}
            <button
              type="button"
              onClick={fetchTransaksi}
              className="mt-3 block mx-auto text-xs text-[#561269] hover:underline font-bold"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ════ Kolom Kiri: List ════ */}
            <div className="lg:col-span-7 flex flex-col rounded-3xl border border-gray-200/90 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] relative">
              {/* Header List */}
              <div className="bg-[#EFE8F3] px-5 py-3.5 flex items-center justify-between border-b border-purple-100 rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLayanan("semua")}
                    className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold shadow-sm transition-all ${
                      selectedLayanan === "semua"
                        ? "bg-white text-[#561269]"
                        : "bg-white/70 text-gray-700 hover:bg-white"
                    }`}
                  >
                    Semua
                  </button>
                </div>

                {/* Filter dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-[#561269]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                    <span>Filter {selectedLayanan !== "semua" ? `(${selectedLayanan})` : ""}</span>
                  </button>

                  {isFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                      <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 text-left text-xs font-semibold">
                        <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-400">Filter Layanan</p>
                        {LAYANAN_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSelectedLayanan(opt.id)
                              setIsFilterOpen(false)
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                              selectedLayanan === opt.id
                                ? "bg-purple-50 text-[#561269] font-bold"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {selectedLayanan === opt.id && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* List Items */}
              <div className="divide-y divide-gray-100 max-h-[680px] overflow-y-auto rounded-b-3xl">
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
                          isSelected ? "bg-[#F7F0FA]" : "hover:bg-gray-50/90"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-y-0 left-0 w-[5px] bg-[#561269]" />
                        )}
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">{item.orderId}</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-gray-900">{item.clientName}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-600 font-medium text-xs sm:text-sm">{item.namaLayanan}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-3.5 w-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span>{item.jadwal}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                          {item.status === "Lunas" ? (
                            <AdminStatusBadge variant="success" className="w-28">Lunas</AdminStatusBadge>
                          ) : item.status === "Refunded" ? (
                            <AdminStatusBadge variant="neutral" className="w-28">Refunded</AdminStatusBadge>
                          ) : item.status === "Gagal" ? (
                            <AdminStatusBadge variant="danger" className="w-28">Gagal</AdminStatusBadge>
                          ) : (
                            <AdminStatusBadge variant="warning" className="w-28">Menunggu</AdminStatusBadge>
                          )}
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

            {/* ════ Kolom Kanan: Detail ════ */}
            <div className="lg:col-span-5 flex flex-col rounded-3xl border border-gray-200/90 bg-white overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-24">
              <div className="bg-[#EFE8F3] px-5 py-4 border-b border-purple-100">
                <h3 className="text-base font-bold text-[#561269]">Detail Transaksi</h3>
              </div>

              {activeDetailItem ? (
                <div className="p-6 flex flex-col gap-5">
                  {/* Order Info */}
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">ORDER ID</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                      {activeDetailItem.orderId}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">{activeDetailItem.orderDate}</span>
                  </div>

                  <div className="h-[1px] w-full bg-gray-100" />

                  {/* Klien */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informasi Klien</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE58F] text-base font-extrabold text-[#874D00]">
                        {activeDetailItem.clientName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{activeDetailItem.clientName}</span>
                        <span className="text-xs text-gray-500">{activeDetailItem.clientEmail}</span>
                        <span className="text-xs text-gray-500">{activeDetailItem.clientPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gray-100" />

                  {/* Layanan */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rincian Layanan</h4>
                    <div className="flex flex-col gap-1 text-xs">
                      <p className="text-sm font-bold text-gray-900">{activeDetailItem.namaLayanan}</p>
                      {activeDetailItem.psikologOrFasilitator && (
                        <p className="text-gray-600">
                          Psikolog/Fasilitator:{" "}
                          <span className="font-semibold text-gray-800">{activeDetailItem.psikologOrFasilitator}</span>
                        </p>
                      )}
                      <p className="text-gray-500 mt-0.5">Jadwal: {activeDetailItem.jadwal}</p>
                    </div>
                  </div>

                  {/* Biaya */}
                  <div className="rounded-2xl bg-gray-50 p-4 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-800">Rp. {activeDetailItem.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Biaya Layanan</span>
                      <span className="font-medium text-gray-800">Rp. {activeDetailItem.biayaLayanan.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200 my-1" />
                    <div className="flex justify-between text-sm font-extrabold text-gray-900">
                      <span>Total Bayar</span>
                      <span className="text-[#561269]">Rp. {activeDetailItem.totalBayar.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gray-100" />

                  {/* Metode Pembayaran */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Metode Pembayaran</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-[#561269]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{activeDetailItem.metodePembayaran}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Dibayar pada: {activeDetailItem.waktuPembayaran || activeDetailItem.orderDate}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2.5 mt-1">
                    {/* Invoice WA */}
                    <button
                      type="button"
                      onClick={() => handleSendInvoice(activeDetailItem)}
                      className="w-full rounded-full border-2 border-[#25D366] bg-transparent hover:bg-[#25D366]/10 px-4 py-3 text-xs sm:text-sm font-bold text-[#25D366] transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.668-.699c.969.54 1.769.88 2.792.88 3.182 0 5.77-2.587 5.77-5.766.001-3.187-2.575-5.766-5.77-5.766zm3.393 8.307c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.18-.544-1.897-.789-3.125-2.73-3.22-2.856-.095-.126-.768-1.021-.768-1.947 0-.925.485-1.38.658-1.57.172-.19.376-.238.502-.238.125 0 .251.002.36.008.117.006.275-.045.43.328.16.386.544 1.332.593 1.43.049.098.082.213.016.342-.066.13-.099.21-.197.324-.099.115-.207.257-.297.345-.102.099-.208.207-.09.41.118.203.526.868 1.13 1.405.779.692 1.435.906 1.639 1.007.204.099.324.086.444-.051.121-.137.518-.602.656-.809.138-.207.276-.172.464-.103.189.069 1.201.566 1.408.669.207.103.345.155.394.241.049.086.049.502-.095.907z" />
                      </svg>
                      Kirim Invoice ke WA
                    </button>

                    {/* Refund button - only for PAID transactions */}
                    {activeDetailItem.status === "Lunas" && (
                      <button
                        type="button"
                        onClick={() => setTransaksiToRefund(activeDetailItem._raw)}
                        className="w-full rounded-full border-2 border-amber-400 bg-transparent hover:bg-amber-50 px-4 py-3 text-xs sm:text-sm font-bold text-amber-600 transition-all flex items-center justify-center gap-2 active:scale-98"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Proses Refund (H-1)
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Pilih transaksi untuk melihat detail.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Refund ── */}
      <ModalRefundTransaksi
        transaksi={transaksiToRefund}
        onClose={() => setTransaksiToRefund(null)}
        onConfirm={handleRefund}
      />

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-5 ${
          toast.type === "success" ? "bg-gray-900 border-gray-700" : "bg-red-900 border-red-700"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
