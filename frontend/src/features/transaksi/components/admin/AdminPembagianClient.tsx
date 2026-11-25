"use client"

import { useState, useEffect, useRef } from "react"
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  CreditCard,
  Check,
  CheckCheck,
  ChevronRight,
  AlertCircle,
  X
} from "lucide-react"
import { transaksiService } from "@/services/transaksi.service"

interface RekapItem {
  id: string
  idTransaksi: string
  kodeTransaksi?: string
  tanggal: string
  layanan: string
  namaKlien: string
  totalTransaksi: number
  bagianPsikolog: number
  alasan: string
  status: "BELUM_DICAIRKAN" | "BERHASIL"
  tanggalDibayarkan?: string
  dibayarkanOleh?: string
  catatanPembayaran?: string
}

interface PsikologRekap {
  idPsikolog: string
  namaPsikolog: string
  rekeningBank: string
  jumlahSesi: number
  totalPendapatan: number
  totalBagianPsikolog: number
  totalBelumDibayarkan: number
  totalSudahDibayarkan: number
  status: "BELUM_DICAIRKAN" | "BERHASIL"
  items: RekapItem[]
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const currentYear = new Date().getFullYear()
const currentMonthIndex = new Date().getMonth() + 1 // 1-12
const monthOptions = Array.from({ length: currentMonthIndex }, (_, i) => {
  const m = String(i + 1).padStart(2, "0")
  return `${currentYear}-${m}`
}).reverse()

function getMonthLabel(ym: string) {
  const [, m] = ym.split("-")
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${currentYear}`
}

export default function AdminPembagianClient() {
  const now = new Date()
  const defaultYm = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const [data, setData] = useState<PsikologRekap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(defaultYm)
  const [selectedDate, setSelectedDate] = useState("")
  const [statusCardFilter, setStatusCardFilter] = useState<"semua" | "belum" | "sudah">("semua")
  const [selectedPsikologId, setSelectedPsikologId] = useState<string>("")

  // Selection ala SMS HP
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" } | null>(null)

  const dateInputRef = useRef<HTMLInputElement>(null)

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      const parsedMonth = selectedMonth && !selectedDate ? parseInt(selectedMonth.split("-")[1], 10) : undefined
      const parsedYear = selectedMonth && !selectedDate ? parseInt(selectedMonth.split("-")[0], 10) : !selectedDate ? currentYear : undefined

      const res = await transaksiService.getRekapPembagian({
        search: search.trim() || undefined,
        bulan: parsedMonth,
        tahun: parsedYear,
        tanggal: selectedDate || undefined,
      })

      if (res?.data) {
        setData(res.data)
        if (res.data.length > 0) {
          if (!res.data.some((p: any) => p.idPsikolog === selectedPsikologId)) {
            setSelectedPsikologId(res.data[0].idPsikolog)
          }
        } else {
          setSelectedPsikologId("")
        }
      } else {
        setData([])
        setSelectedPsikologId("")
      }
    } catch (err: any) {
      console.error("Gagal memuat data rekap pembagian:", err)
      setData([])
      setSelectedPsikologId("")
      showToast(err?.response?.data?.message || "Gagal memuat data dari server", "danger")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedDate])

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(val)

  // Hitung jumlah sesi (tanpa nominal)
  const totalSesiBelum = data.reduce(
    (acc, curr) => acc + curr.items.filter((it) => it.status === "BELUM_DICAIRKAN").length,
    0
  )
  const totalSesiSudah = data.reduce(
    (acc, curr) => acc + curr.items.filter((it) => it.status === "BERHASIL").length,
    0
  )

  // Filter realtime berdasarkan nama psikolog (live search tiap ketikan/hapus) & filter status card
  const displayedPsikologList = data.filter((p) => {
    const query = search.trim().toLowerCase()
    const matchName = query ? p.namaPsikolog.toLowerCase().includes(query) : true
    if (!matchName) return false

    if (statusCardFilter === "belum") return p.totalBelumDibayarkan > 0
    if (statusCardFilter === "sudah") return p.totalBelumDibayarkan === 0 && p.jumlahSesi > 0
    return true
  })

  // Sinkronisasi otomatis psikolog aktif jika list hasil filter berubah
  useEffect(() => {
    if (displayedPsikologList.length > 0) {
      if (!displayedPsikologList.some((p) => p.idPsikolog === selectedPsikologId)) {
        setSelectedPsikologId(displayedPsikologList[0].idPsikolog)
      }
    }
  }, [search, statusCardFilter, displayedPsikologList, selectedPsikologId])

  const selectedPsikolog =
    displayedPsikologList.find((p) => p.idPsikolog === selectedPsikologId) ||
    displayedPsikologList[0] ||
    null

  // Toggle item per sesi
  const toggleSelectItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  // Pilih semua yang belum dibayar
  const handleSelectAllUnpaid = () => {
    if (!selectedPsikolog) return
    const unpaidIds = selectedPsikolog.items
      .filter((it) => it.status === "BELUM_DICAIRKAN")
      .map((it) => it.id)
    const allSelected = unpaidIds.every((id) => selectedItemIds.includes(id))
    if (allSelected) {
      setSelectedItemIds((prev) => prev.filter((id) => !unpaidIds.includes(id)))
    } else {
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...unpaidIds])))
    }
  }

  // 1-klik: Tandai 1 Sesi Selesai (tanpa popup modal)
  const handleMarkOneItemDone = async (psikologId: string, itemId: string) => {
    try {
      await transaksiService.markPembagianDibayarkan({
        idPembagian: itemId,
        dibayarkanOleh: "Direktur",
        tanggalDibayarkan: new Date().toISOString(),
      })
      showToast("Sesi berhasil ditandai selesai dibayar!", "success")
      await loadData()
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Gagal menandai pembayaran", "danger")
    }
    setSelectedItemIds((prev) => prev.filter((id) => id !== itemId))
  }

  // 1-klik: Tandai yang dicentang selesai (ala SMS HP)
  const handleMarkSelectedDone = async () => {
    if (selectedItemIds.length === 0 || !selectedPsikolog) return

    try {
      for (const itemId of selectedItemIds) {
        await transaksiService.markPembagianDibayarkan({
          idPembagian: itemId,
          dibayarkanOleh: "Direktur",
          tanggalDibayarkan: new Date().toISOString(),
        })
      }
      showToast(`${selectedItemIds.length} sesi terpilih selesai dibayar!`, "success")
      await loadData()
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Gagal memproses beberapa pembayaran", "danger")
    }
    setSelectedItemIds([])
  }

  // 1-klik: Tandai semua sesi psikolog ini selesai
  const handleMarkAllDone = async (psikologId: string) => {
    try {
      await transaksiService.markPembagianDibayarkan({
        idPsikolog: psikologId,
        dibayarkanOleh: "Direktur",
        tanggalDibayarkan: new Date().toISOString(),
      })
      showToast("Semua sesi psikolog ini telah selesai dibayar!", "success")
      await loadData()
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Gagal memproses pembayaran seluruh sesi", "danger")
    }
    setSelectedItemIds([])
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Bar Filter Periode Rentang Waktu (Persis Tampilan Transaksi) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Pilih Periode Pembagian</h3>
          <p className="text-xs text-gray-500">
            Transaksi tahun {currentYear} • Riwayat tahun sebelumnya otomatis terhapus
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown Bulan */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setSelectedDate("")
              }}
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs sm:text-sm font-semibold text-gray-700 hover:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition cursor-pointer appearance-none shadow-sm"
            >
              <option value="">Semua Bulan ({currentYear})</option>
              {monthOptions.map((ym) => (
                <option key={ym} value={ym}>
                  {getMonthLabel(ym)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Kalender Tanggal Spesifik */}
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

      {/* ── Summary Cards (Hanya Sesi, Tanpa Nominal) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setStatusCardFilter((prev) => (prev === "belum" ? "semua" : "belum"))}
          className={`text-left p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            statusCardFilter === "belum"
              ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30"
              : "bg-white border-gray-200/90 shadow-sm hover:border-amber-200"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Belum Dibayarkan</span>
              {statusCardFilter === "belum" && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-full">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {totalSesiBelum} <span className="text-sm font-semibold text-amber-700/70">Sesi</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusCardFilter((prev) => (prev === "sudah" ? "semua" : "sudah"))}
          className={`text-left p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            statusCardFilter === "sudah"
              ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400/30"
              : "bg-white border-gray-200/90 shadow-sm hover:border-emerald-200"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Sudah Dibayar</span>
              {statusCardFilter === "sudah" && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {totalSesiSudah} <span className="text-sm font-semibold text-emerald-700/70">Sesi</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* ── Search Bar Simpel dengan Live Search & Tombol X ── */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/90 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama psikolog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs rounded-2xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] text-gray-800"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-0.5 rounded-full hover:bg-gray-100 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {statusCardFilter !== "semua" && (
          <button
            type="button"
            onClick={() => setStatusCardFilter("semua")}
            className="text-xs text-[#561269] hover:underline font-semibold cursor-pointer"
          >
            Tampilkan Semua ({data.length})
          </button>
        )}
      </div>

      {/* ── Main 2 Kolom Layout (Persis Holder & Header Awal) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Tabel Ringkasan Per Psikolog (Holder Awal) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#EFE8F3] px-5 py-3.5 border-b border-purple-100 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-[#561269]">Daftar Rekap Per Psikolog</h2>
            <span className="text-[11px] font-bold text-[#561269] bg-white/80 px-2.5 py-0.5 rounded-full border border-purple-200">
              {displayedPsikologList.length} Psikolog
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-[#561269] border-t-transparent rounded-full animate-spin" />
              <span>Memuat data rekap...</span>
            </div>
          ) : displayedPsikologList.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              Tidak ada data pembagian yang ditemukan.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              {displayedPsikologList.map((p) => {
                const isSelected = selectedPsikolog?.idPsikolog === p.idPsikolog
                return (
                  <div
                    key={p.idPsikolog}
                    onClick={() => {
                      setSelectedPsikologId(p.idPsikolog)
                      setSelectedItemIds([])
                    }}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer transition ${
                      isSelected ? "bg-purple-50/70 border-l-4 border-l-[#561269]" : "hover:bg-gray-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-sm shrink-0">
                        {p.namaPsikolog.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {p.namaPsikolog}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          {p.rekeningBank}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {p.jumlahSesi} sesi konseling
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-[#561269]">
                        {formatRupiah(p.totalBagianPsikolog)}
                      </span>
                      {p.totalBelumDibayarkan > 0 ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Belum: {formatRupiah(p.totalBelumDibayarkan)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Lunas Dibayarkan
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Rincian Transaksi Sesi (Holder Awal dengan Header Ungu) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col lg:sticky lg:top-6">
          <div className="bg-[#EFE8F3] px-5 py-3 border-b border-purple-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#561269]">Rincian Transaksi Sesi</h3>
              {selectedPsikolog && (
                <span className="text-[11px] font-bold text-[#561269] bg-white/80 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {selectedPsikolog.items.length} Sesi
                </span>
              )}
            </div>

            {/* Tombol Tandai Semua Selesai di Header Paling Atas */}
            {selectedPsikolog && selectedPsikolog.totalBelumDibayarkan > 0 && (
              <button
                type="button"
                onClick={() => handleMarkAllDone(selectedPsikolog.idPsikolog)}
                className="px-3.5 py-1.5 rounded-full bg-[#561269] hover:bg-[#6b1a81] text-white text-[11px] font-bold transition shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tandai Semua Selesai</span>
              </button>
            )}
          </div>

          {selectedPsikolog ? (
            <div className="p-5 flex flex-col gap-4">
              {/* Info Header Psikolog Simpel (Teks Ringkas, Tanpa Kotak Bertingkat) */}
              <div className="flex flex-col gap-1.5 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">{selectedPsikolog.namaPsikolog}</h4>
                  <span className="text-xs font-extrabold text-[#561269]">
                    Total Bulan Ini: {formatRupiah(selectedPsikolog.totalBagianPsikolog)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {selectedPsikolog.rekeningBank}
                </p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">
                    Belum Dibayar: <strong className="text-amber-600 font-bold">{formatRupiah(selectedPsikolog.totalBelumDibayarkan)}</strong>
                  </span>
                  <span className="text-gray-500">
                    Sudah Ditransfer: <strong className="text-emerald-600 font-bold">{formatRupiah(selectedPsikolog.totalSudahDibayarkan)}</strong>
                  </span>
                </div>
              </div>

              {/* List Sesi Bersih (Tanpa Kotak Checkbox, Cukup Tombol Hijau) */}
              <div className="divide-y divide-gray-100 max-h-[490px] overflow-y-auto pr-1">
                {selectedPsikolog.items.length === 0 ? (
                  <p className="text-center py-8 text-xs text-gray-400">
                    Tidak ada rincian sesi pada periode ini.
                  </p>
                ) : (
                  selectedPsikolog.items.map((it) => (
                    <div
                      key={it.id}
                      className="py-3 px-1 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 truncate">{it.namaKlien}</span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className="text-[11px] text-gray-500 truncate">{it.layanan}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(it.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Nominal & Tombol Sudah Dibayar 1-Klik */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className="font-extrabold text-[#561269] text-xs">
                          {formatRupiah(it.bagianPsikolog)}
                        </span>

                        {it.status === "BERHASIL" ? (
                          <span className="font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px]">
                            <CheckCircle className="w-3 h-3" /> Selesai Dibayar
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkOneItemDone(selectedPsikolog.idPsikolog, it.id)}
                            className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <Check className="w-3 h-3" />
                            <span>Tandai Selesai</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              Pilih salah satu psikolog di samping untuk melihat rincian sesi.
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-5 ${
            toast.type === "success" ? "bg-gray-900 border-gray-700" : "bg-red-900 border-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
