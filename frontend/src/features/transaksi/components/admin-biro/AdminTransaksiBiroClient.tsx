"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import { formatOrderId, formatIndoPhoneWithPrefix } from "@/lib/utils"
import { transaksiService } from "@/services/transaksi.service"
import { Clock, ChevronDown } from "lucide-react"

type JenisLayanan = "semua" | "konseling" | "psikotes" | "pelatihan peer helper" | "event" | "asesment"
type StatusFilter = "semua" | "Menunggu Pembayaran" | "Lunas" | "Refunded" | "Gagal"

const LAYANAN_OPTIONS: { id: JenisLayanan; label: string }[] = [
  { id: "semua", label: "Semua Layanan" },
  { id: "konseling", label: "Konseling" },
  { id: "psikotes", label: "Psikotes" },
  { id: "pelatihan peer helper", label: "Pelatihan Peer Helper" },
  { id: "event", label: "Event" },
  { id: "asesment", label: "Asesment" },
]

// ── Normalisasi data API → shape yang dipakai komponen ────────────────────────
function normalizeTransaksi(raw: any) {
  const booking = raw.booking_konsultasi || {}
  const bookingPsikotes = raw.booking_psikotes || {}
  const bookingEvent = raw.booking_event || {}
  const client = raw.client || {}

  const tipe = (raw.tipe_transaksi || "KONSULTASI").toLowerCase()
  const jenisLayanan: JenisLayanan =
    tipe.includes("event") ? "event"
    : tipe.includes("psikotes") ? "psikotes"
    : tipe.includes("asesmen") ? "asesment"
    : "konseling"

  let namaLayanan = "Layanan Konseling"
  let psikologName = ""
  let jadwalDisplay = "-"

  if (jenisLayanan === "konseling") {
    namaLayanan = booking.layanan?.nama || raw.layanan || "Konseling Psikologi"
    psikologName =
      booking.jadwal?.psikolog?.account?.nama ||
      booking.jadwal?.psikolog?.nama_gelar ||
      booking.jadwal?.psikolog?.nama ||
      ""
    const rawDate = booking.jadwal?.tanggal
    const rawJam = booking.jadwal?.jam_mulai
    if (rawDate) {
      const d = new Date(rawDate)
      const dateStr = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      jadwalDisplay = `${dateStr}${rawJam ? ` • ${new Date(rawJam).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : ""}`
    }
  } else if (jenisLayanan === "psikotes") {
    namaLayanan = bookingPsikotes.paket?.judul || "Tes Psikotes Berbayar"
    psikologName = bookingPsikotes.paket?.kategori || "Psikotes Mandiri"
    jadwalDisplay = "Akses Mandiri • Berlaku 3 Bulan"
  } else if (jenisLayanan === "event") {
    namaLayanan = bookingEvent.event?.judul || "Event / Webinar"
    psikologName = bookingEvent.event?.nama_pembicara || "Pemateri Empathika"
    const rawDate = bookingEvent.event?.tanggal
    const rawJam = bookingEvent.event?.jam_mulai
    if (rawDate) {
      const d = new Date(rawDate)
      const dateStr = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      jadwalDisplay = `${dateStr}${rawJam ? ` • ${new Date(rawJam).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB` : ""}`
    }
  }

  const rawKodePesanan = booking.kode_pesanan || bookingEvent.kode_tiket || (bookingPsikotes.id ? ("EMP-PSI-" + raw.id?.slice(0, 8)?.toUpperCase()) : "") || ""
  const rawKodeTransaksi = raw.kode_transaksi || raw.order_id || raw.id?.slice(0, 8)?.toUpperCase() || "-"
  const formattedKodePesanan = formatOrderId(rawKodePesanan || rawKodeTransaksi)
  const formattedOrderId = rawKodeTransaksi !== "-" ? rawKodeTransaksi : formattedKodePesanan

  let metodePembayaranFormatted = raw.channel_pembayaran || raw.metode_pembayaran || "QRIS"
  if (metodePembayaranFormatted === "TRANSFER_BANK") metodePembayaranFormatted = "Transfer Bank"
  else if (metodePembayaranFormatted === "E_WALLET") metodePembayaranFormatted = "E-Wallet"

  let status: "Lunas" | "Menunggu Pembayaran" | "Refunded" | "Gagal" = "Menunggu Pembayaran"
  if (raw.status_pembayaran === "PAID") status = "Lunas"
  else if (raw.status_pembayaran === "REFUNDED") status = "Refunded"
  else if (raw.status_pembayaran === "FAILED") status = "Gagal"

  const subtotal = Number(raw.subtotal || raw.jumlah || raw.total || 0)
  const biaya = Number(raw.biaya_layanan || raw.biaya_admin || 0)
  const total = Number(raw.total || raw.total_harga || subtotal + biaya)

  const createdAt = raw.createdAt ? new Date(raw.createdAt) : new Date()
  const tanggalTransaksi = createdAt.toISOString().slice(0, 10)

  let waktuPembayaran = "-"
  if (raw.tanggal_bayar) {
    const paidAt = new Date(raw.tanggal_bayar)
    waktuPembayaran = paidAt.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  }

  let parsedDataPembayaran: any = null
  if (raw.data_pembayaran) {
    try {
      parsedDataPembayaran = typeof raw.data_pembayaran === "string" ? JSON.parse(raw.data_pembayaran) : raw.data_pembayaran
    } catch {
      parsedDataPembayaran = null
    }
  }

  const clientName =
    parsedDataPembayaran?.nama_pemesan ||
    parsedDataPembayaran?.nama ||
    client.nama ||
    bookingPsikotes.client?.nama ||
    bookingEvent.client?.nama ||
    raw.nama_klien ||
    "–"

  const clientEmail =
    parsedDataPembayaran?.email_pemesan ||
    parsedDataPembayaran?.email ||
    client.email ||
    bookingPsikotes.client?.email ||
    bookingEvent.client?.email ||
    raw.email ||
    "–"

  const rawClientPhone =
    parsedDataPembayaran?.no_telepon_pemesan ||
    parsedDataPembayaran?.no_telepon ||
    parsedDataPembayaran?.phone ||
    client.no_telepon ||
    bookingPsikotes.client?.no_telepon ||
    bookingEvent.client?.no_telepon ||
    client.no_hp ||
    client.phone ||
    null

  const clientPhone = rawClientPhone ? formatIndoPhoneWithPrefix(rawClientPhone, rawClientPhone) : "–"

  const biroNama =
    raw.biro_tenant?.nama_biro ||
    client.biro?.nama_biro ||
    bookingPsikotes.client?.biro?.nama_biro ||
    bookingEvent.client?.biro?.nama_biro ||
    null

  return {
    id: raw.id,
    orderId: formattedOrderId,
    kodePesanan: formattedKodePesanan,
    kodeTransaksi: rawKodeTransaksi,
    invoiceNomor: raw.invoice?.nomor || "",
    biroNama,
    orderDate: createdAt.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB",
    clientName,
    clientEmail,
    clientPhone,
    jenisLayanan,
    namaLayanan,
    psikologOrFasilitator: psikologName,
    jadwal: jadwalDisplay,
    status,
    subtotal,
    biayaLayanan: biaya,
    totalBayar: total,
    metodePembayaran: metodePembayaranFormatted,
    waktuPembayaran,
    tanggalTransaksi,
    isRefunded: raw.status_pembayaran === "REFUNDED",
    refundAt: raw.refund_at
      ? new Date(raw.refund_at).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      : null,
    refundAmount: raw.refund_amount ? Number(raw.refund_amount) : null,
    refundReason: raw.refund_reason || null,
    hargaDasar: raw.harga_dasar ? Number(raw.harga_dasar) : null,
    komisiBiro: raw.komisi_biro ? Number(raw.komisi_biro) : null,
    nominalDitahan: raw.nominal_ditahan ? Number(raw.nominal_ditahan) : null,
    nominalDikembalikan: raw.nominal_dikembalikan ? Number(raw.nominal_dikembalikan) : null,
    alasanPenahanan: raw.alasan_penahanan || null,
    _raw: raw,
  }
}

export default function AdminTransaksiBiroClient() {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const filterBtnRef = useRef<HTMLButtonElement>(null)
  const statusFilterBtnRef = useRef<HTMLButtonElement>(null)
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)

  // Data state
  const [allTransaksi, setAllTransaksi] = useState<ReturnType<typeof normalizeTransaksi>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const searchParams = useSearchParams()

  // Filter State
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("semua")
  const [selectedLayanan, setSelectedLayanan] = useState<JenisLayanan>("semua")
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")

  // Sync parameter status dari URL
  useEffect(() => {
    const statusParam = searchParams.get("status")
    if (statusParam) {
      const lower = statusParam.toLowerCase()
      if (lower === "pending" || lower === "menunggu") {
        setSelectedStatus("Menunggu Pembayaran")
        setSelectedMonth("")
      } else if (lower === "paid" || lower === "lunas" || lower === "success") {
        setSelectedStatus("Lunas")
      } else if (lower === "refunded") {
        setSelectedStatus("Refunded")
      } else if (lower === "failed" || lower === "gagal") {
        setSelectedStatus("Gagal")
      }
    }
  }, [searchParams])

  // Detail item state
  const [selectedItem, setSelectedItem] = useState<ReturnType<typeof normalizeTransaksi> | null>(null)

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

  // Tutup dropdown jika tombol Escape ditekan
  useEffect(() => {
    if (!isFilterOpen && !isStatusFilterOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFilterOpen(false)
        setIsStatusFilterOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFilterOpen, isStatusFilterOpen])

  // ── Filter & Sort ──
  const filteredTransaksi = useMemo(() => {
    const list = allTransaksi.filter((item) => {
      if (selectedStatus !== "semua" && item.status !== selectedStatus) return false
      if (selectedLayanan !== "semua" && item.jenisLayanan !== selectedLayanan) return false
      if (selectedDate) {
        if (item.tanggalTransaksi !== selectedDate) return false
      } else if (selectedMonth) {
        if (!item.tanggalTransaksi.startsWith(selectedMonth)) return false
      }
      return true
    })
    return list.sort((a, b) => b.tanggalTransaksi.localeCompare(a.tanggalTransaksi))
  }, [allTransaksi, selectedStatus, selectedLayanan, selectedDate, selectedMonth])

  // Active detail item
  const activeDetailItem = useMemo(() => {
    if (!filteredTransaksi.length) return null
    const found = filteredTransaksi.find((t) => t.id === selectedItem?.id)
    return found || filteredTransaksi[0]
  }, [filteredTransaksi, selectedItem])

  // Label filter status aktif
  const activeStatusLabel = useMemo(() => {
    if (selectedStatus === "Menunggu Pembayaran") return "Menunggu"
    if (selectedStatus === "Lunas") return "Lunas"
    if (selectedStatus === "Refunded") return "Refunded"
    if (selectedStatus === "Gagal") return "Gagal"
    return "Semua"
  }, [selectedStatus])

  // Measure Detail Transaksi height so Daftar Transaksi can match it on desktop
  const detailCardRef = useRef<HTMLDivElement>(null)
  const [detailHeight, setDetailHeight] = useState<number | null>(null)
  const [isLgScreen, setIsLgScreen] = useState(false)

  useEffect(() => {
    const checkLg = () => {
      setIsLgScreen(window.innerWidth >= 1024)
    }
    checkLg()
    window.addEventListener("resize", checkLg)
    return () => window.removeEventListener("resize", checkLg)
  }, [])

  useEffect(() => {
    const el = detailCardRef.current
    if (!el) return

    const updateHeight = () => {
      if (el) {
        setDetailHeight(el.offsetHeight)
      }
    }

    updateHeight()

    const ro = new ResizeObserver(() => {
      updateHeight()
    })
    ro.observe(el)

    return () => ro.disconnect()
  }, [activeDetailItem])

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

    let pendapatanLabel = `Total Transaksi Klien Tahun ${new Date().getFullYear()}`
    if (selectedDate) pendapatanLabel = "Total Transaksi Klien Hari Ini"
    else if (selectedMonth) {
      const [y, m] = selectedMonth.split("-")
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
      pendapatanLabel = `Total Transaksi Klien ${monthNames[parseInt(m) - 1]} ${y}`
    }

    return { totalPendapatan, transaksiBerhasil, menungguBayar, pendapatanLabel }
  }, [allTransaksi, selectedDate, selectedMonth])

  const getMonthLabel = (ym: string) => {
    const [y, m] = ym.split("-")
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    return `${monthNames[parseInt(m) - 1]} ${y}`
  }

  const monthOptions = useMemo(() => {
    const opts: string[] = []
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    for (let m = currentMonth; m >= 1; m--) {
      opts.push(`${currentYear}-${String(m).padStart(2, "0")}`)
    }
    return opts
  }, [])

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Bar Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Pilih Periode Transaksi</h3>
          <p className="text-xs text-gray-500">
            Transaksi klien biro tahun {new Date().getFullYear()} • Data mutasi dikelola oleh sistem pusat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown Pilih Bulan */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setSelectedDate("")
              }}
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs sm:text-sm font-semibold text-gray-700 hover:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition cursor-pointer appearance-none shadow-sm"
            >
              <option value="">Semua Bulan ({new Date().getFullYear()})</option>
              {monthOptions.map((ym) => (
                <option key={ym} value={ym}>{getMonthLabel(ym)}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
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
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-semibold text-gray-700 hover:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none shadow-sm"
            />
            <button
              type="button"
              onClick={() => {
                try { dateInputRef.current?.showPicker?.() }
                catch { dateInputRef.current?.focus() }
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#561269] transition-colors p-1 cursor-pointer"
              title="Pilih tanggal spesifik"
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
              className="text-xs text-[#561269] hover:underline font-semibold cursor-pointer"
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <button
          type="button"
          onClick={() => setSelectedStatus("semua")}
          className={`text-left rounded-3xl border bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all cursor-pointer ${
            selectedStatus === "semua"
              ? "border-[#561269] ring-2 ring-[#561269]/20 shadow-md"
              : "border-gray-200/90 hover:border-gray-300 hover:shadow-sm"
          }`}
          title="Tampilkan semua transaksi"
        >
          <div className="flex items-center justify-between w-full">
            <p className="text-xs sm:text-sm font-semibold text-gray-500">{summaryMetrics.pendapatanLabel}</p>
            {selectedStatus === "semua" && (
              <span className="text-[10px] font-bold bg-purple-100 text-[#561269] px-2 py-0.5 rounded-full">
                Semua
              </span>
            )}
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#561269] mt-2">
            Rp. {summaryMetrics.totalPendapatan.toLocaleString("id-ID")}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "Lunas" ? "semua" : "Lunas")}
          className={`text-left rounded-3xl border bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all cursor-pointer ${
            selectedStatus === "Lunas"
              ? "border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/10 shadow-md"
              : "border-gray-200/90 hover:border-gray-300 hover:shadow-sm"
          }`}
          title="Klik untuk filter transaksi lunas"
        >
          <div className="flex items-center justify-between w-full">
            <p className="text-xs sm:text-sm font-semibold text-gray-500">Transaksi Berhasil</p>
            {selectedStatus === "Lunas" ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Difilter
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">Klik filter</span>
            )}
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mt-2">
            {summaryMetrics.transaksiBerhasil}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "Menunggu Pembayaran" ? "semua" : "Menunggu Pembayaran")}
          className={`text-left rounded-3xl border bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all cursor-pointer ${
            selectedStatus === "Menunggu Pembayaran"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 shadow-md"
              : "border-gray-200/90 hover:border-gray-300 hover:shadow-sm"
          }`}
          title="Klik untuk filter transaksi yang menunggu pembayaran"
        >
          <div className="flex items-center justify-between w-full">
            <p className="text-xs sm:text-sm font-semibold text-gray-500">Menunggu Pembayaran</p>
            {selectedStatus === "Menunggu Pembayaran" ? (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Difilter
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">Klik filter</span>
            )}
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#E5A800] mt-2">
            {summaryMetrics.menungguBayar}
          </p>
        </button>
      </div>

      {/* ── Daftar Transaksi ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Daftar Transaksi</h2>

          {/* Filter Status: Dropdown opsi pilihan dalam satu kotak rapi */}
          <div className="relative">
            <button
              type="button"
              ref={statusFilterBtnRef}
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center gap-2 rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-gray-800 shadow-sm hover:border-[#561269] hover:bg-gray-50/80 transition-all duration-300 ease-in-out cursor-pointer active:scale-95"
            >
              <span className="text-gray-400 font-medium text-xs">Status:</span>
              <span className="text-[#561269] font-bold transition-all duration-300 ease-in-out">
                {activeStatusLabel}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isStatusFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isStatusFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsStatusFilterOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 z-20 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 text-left text-xs font-semibold animate-in fade-in zoom-in-95 duration-150"
                >
                  <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-400">
                    Pilih Status
                  </p>
                  {(
                    [
                      { id: "semua", label: "Semua Status" },
                      { id: "Menunggu Pembayaran", label: "Menunggu Pembayaran" },
                      { id: "Lunas", label: "Lunas" },
                      { id: "Refunded", label: "Refunded" },
                      { id: "Gagal", label: "Gagal" },
                    ] as const
                  ).map((st) => {
                    const isSelected = selectedStatus === st.id
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedStatus(st.id)
                          setIsStatusFilterOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-purple-50 text-[#561269] font-bold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className={isSelected ? "font-bold text-[#561269]" : "font-semibold text-gray-800"}>
                          {st.label}
                        </span>
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="h-3.5 w-3.5 text-[#561269]"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-sm font-poppins">
            <div 
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-3"
              style={{
                borderColor: "rgba(0,0,0,0.08)",
                borderTopColor: "var(--biro-theme-color, #561269)",
              }}
            />
            <span 
              className="text-xs font-semibold animate-pulse"
              style={{ color: "var(--biro-theme-color, #561269)" }}
            >
              Memuat data transaksi biro...
            </span>
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
            {/* ════ Kolom Kiri: List Transaksi ════ */}
            <div
              className="lg:col-span-7 flex flex-col rounded-3xl border border-gray-200/90 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden"
              style={isLgScreen && detailHeight ? { height: `${detailHeight}px` } : undefined}
            >
              {/* Header List */}
              <div className="bg-[#EFE8F3] px-5 py-3.5 flex items-center justify-between border-b border-purple-100 min-h-[58px] shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedStatus !== "semua" || selectedLayanan !== "semua") {
                        setSelectedStatus("semua")
                        setSelectedLayanan("semua")
                      }
                    }}
                    className="rounded-full px-4 py-2 text-xs sm:text-sm font-bold shadow-sm transition-all duration-300 ease-in-out flex items-center justify-center bg-white text-[#561269] hover:bg-white/90 active:scale-95 cursor-pointer"
                    title={
                      selectedStatus !== "semua"
                        ? "Klik untuk reset filter status kembali ke Semua"
                        : undefined
                    }
                  >
                    <span className="transition-all duration-300 ease-in-out inline-block">
                      {activeStatusLabel}
                    </span>
                  </button>
                </div>

                {/* Filter Layanan Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    ref={filterBtnRef}
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
                      <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                      <div
                        className="absolute right-0 top-full mt-2 z-20 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 text-left text-xs font-semibold animate-in fade-in zoom-in-95 duration-150"
                      >
                        <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-400">Filter Layanan</p>
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
              <div className="divide-y divide-gray-100 flex-1 min-h-0 max-h-[500px] lg:max-h-none overflow-y-auto admin-table-scrollbar scroll-smooth">
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
                        className={`relative p-4 sm:p-5 sm:pr-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer transition-all duration-300 ease-in-out ${isSelected ? "bg-[#F7F0FA]" : "hover:bg-gray-50/90"
                          }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-y-0 left-0 w-[5px] bg-[#561269]" />
                        )}
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold tracking-wider text-[#561269] bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 uppercase">
                              Tiket: {item.kodePesanan}
                            </span>
                            {item.kodeTransaksi && item.kodeTransaksi !== "-" && (
                              <span className="text-[10px] font-semibold text-gray-500 tracking-wide font-mono">
                                Order: {item.kodeTransaksi}
                              </span>
                            )}
                            {item.biroNama && (
                              <span className="text-[10px] font-medium text-purple-700 bg-purple-50/70 px-1.5 py-0.5 rounded">
                                Dari Biro: {item.biroNama}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <span
                              className="font-bold text-gray-900 truncate w-20 sm:w-24 shrink-0"
                              title={item.clientName}
                            >
                              {item.clientName}
                            </span>
                            <span className="text-gray-300 shrink-0 select-none">|</span>
                            <span
                              className="text-gray-600 font-medium text-xs sm:text-sm truncate"
                              title={item.namaLayanan}
                            >
                              {item.namaLayanan}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-3.5 w-3.5 shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className="truncate">{item.jadwal}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
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

            {/* ════ Kolom Kanan: Detail Transaksi / Invoice (Read-Only) ════ */}
            <div
              ref={detailCardRef}
              className="lg:col-span-5 flex flex-col rounded-3xl border border-gray-200/90 bg-white overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.03)] lg:sticky lg:top-6 self-start"
            >
              <div className="bg-[#EFE8F3] px-5 py-3.5 border-b border-purple-100 min-h-[58px] flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold text-[#561269]">Detail Transaksi</h3>
                <span className="text-[11px] font-bold text-[#561269] bg-white/70 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Read Only
                </span>
              </div>

              {activeDetailItem ? (
                <div className="p-6 flex flex-col gap-4">
                  {/* Order Info */}
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        ID Tiket
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#561269] tracking-tight mt-0.5 font-mono">
                        {activeDetailItem.kodePesanan}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="font-semibold text-gray-400">Order ID:</span>
                      <span className="font-mono font-bold text-gray-800">{activeDetailItem.kodeTransaksi}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5">{activeDetailItem.orderDate}</span>
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
                        {activeDetailItem.clientEmail && activeDetailItem.clientEmail !== "–" && (
                          <span className="text-xs text-gray-500">{activeDetailItem.clientEmail}</span>
                        )}
                        <span className="text-xs text-gray-500">{activeDetailItem.clientPhone}</span>
                        {activeDetailItem.biroNama && (
                          <span className="text-xs font-medium text-purple-700 mt-1">
                            Dari Biro: {activeDetailItem.biroNama}
                          </span>
                        )}
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
                          {activeDetailItem.jenisLayanan === "psikotes"
                            ? "Kategori: "
                            : activeDetailItem.jenisLayanan === "event"
                              ? "Pemateri: "
                              : "Psikolog/Fasilitator: "}
                          <span className="font-semibold text-gray-800">{activeDetailItem.psikologOrFasilitator}</span>
                        </p>
                      )}
                      <p className="text-gray-500 mt-0.5">
                        {activeDetailItem.jenisLayanan === "psikotes" ? "Akses/Status: " : "Jadwal: "}
                        {activeDetailItem.jadwal}
                      </p>
                      {activeDetailItem.jenisLayanan === "psikotes" && (
                        <p className="text-gray-500">
                          Masa Berlaku: <span className="font-semibold text-gray-800">3 Bulan</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Biaya */}
                  <div className="rounded-2xl bg-gray-50 p-4 flex flex-col gap-2 text-xs">
                    {activeDetailItem.hargaDasar != null ? (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span>Harga Sesi</span>
                          <span className="font-medium text-gray-800">Rp. {activeDetailItem.hargaDasar.toLocaleString("id-ID")}</span>
                        </div>
                        {activeDetailItem.komisiBiro != null && activeDetailItem.komisiBiro > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Komisi Biro</span>
                            <span className="font-medium text-gray-800">Rp. {activeDetailItem.komisiBiro.toLocaleString("id-ID")}</span>
                          </div>
                        )}
                        {activeDetailItem.biayaLayanan > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Biaya Layanan</span>
                            <span className="font-medium text-gray-800">Rp. {activeDetailItem.biayaLayanan.toLocaleString("id-ID")}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-medium text-gray-800">Rp. {activeDetailItem.subtotal.toLocaleString("id-ID")}</span>
                        </div>
                        {activeDetailItem.biayaLayanan > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Biaya Layanan</span>
                            <span className="font-medium text-gray-800">Rp. {activeDetailItem.biayaLayanan.toLocaleString("id-ID")}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="h-[1px] w-full bg-gray-200 my-1" />
                    <div className="flex justify-between text-sm font-extrabold text-gray-900">
                      <span>Total Bayar</span>
                      <span className="text-[#561269]">Rp. {activeDetailItem.totalBayar.toLocaleString("id-ID")}</span>
                    </div>

                    {/* Informasi Pembagian & Komisi Biro */}
                    <div className="mt-2.5 pt-2.5 border-t border-dashed border-purple-200 bg-purple-50/50 -mx-1 p-2.5 rounded-xl text-[11px] text-[#561269] leading-relaxed">
                      <span className="font-bold block mb-0.5">Informasi Komisi & Bagi Hasil Biro:</span>
                      Nominal di atas merupakan total pembayaran yang masuk dari klien. Rincian pembagian hasil atau komisi biro akan dikonfirmasi dan disalurkan secara langsung oleh Founder / Tim Manajemen Empathika sesuai kesepakatan kerja sama.
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

                  {/* ── KETERANGAN STATUS REFUND (TEKS BIASA) ── */}
                  {activeDetailItem.isRefunded && (
                    <div className="pt-3 pb-1 border-t border-gray-100 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-600 uppercase tracking-wide">
                          Status: Transaksi Di-Refund
                        </span>
                        <span className="font-bold text-red-600">
                          Rp. {(activeDetailItem.refundAmount ?? 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500 text-[11px]">
                        <span>Waktu Refund:</span>
                        <span className="font-medium text-gray-700">{activeDetailItem.refundAt || "-"}</span>
                      </div>
                      <div className="text-[11px] text-gray-600 leading-relaxed">
                        <span className="text-gray-500 font-medium">Alasan / Catatan Refund: </span>
                        <span className="text-red-700 font-medium">{activeDetailItem.refundReason || "Tidak ada alasan spesifik"}</span>
                      </div>
                    </div>
                  )}

                  {/* ── KETERANGAN STATUS MENUNGGU PEMBAYARAN ── */}
                  {activeDetailItem.status === "Menunggu Pembayaran" && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-800 flex flex-col gap-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Menunggu Pembayaran dari Klien</span>
                      </div>
                      <p className="text-[11px] text-amber-700/90 leading-relaxed">
                        Transaksi ini tercatat dalam sistem dan sedang menunggu konfirmasi pembayaran.
                      </p>
                    </div>
                  )}

                  {/* Catatan Read-Only untuk Admin Biro */}
                  <div className="mt-2 rounded-xl bg-purple-50/60 border border-purple-100 p-3 text-center">
                    <p className="text-[11px] font-medium text-[#561269]">
                      Akun Biro bersifat Read-Only. Seluruh proses verifikasi dan mutasi keuangan dikelola langsung oleh sistem pusat Empathika.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm flex-1 flex items-center justify-center">
                  Pilih transaksi untuk melihat detail.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
