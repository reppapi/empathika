"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useAuthStore } from "@/store/authStore"
import { psikologService } from "@/services/psikolog.service"
import { PSIKOLOG_SHARE, formatRupiahPendapatan } from "@/config/constants"
import { ChevronDown, Calendar, History, RotateCcw, Info, CheckCircle2 } from "lucide-react"

// Tipe data sesi agenda beranda psikolog
export interface SesiAgendaItem {
  id: string
  waktuMulai: string
  waktuSelesai: string
  metode: string
  namaKlien: string
  keluhan: string
  layanan: string
  hargaPenuh?: number | null
  pendapatanPsikolog?: number | null
  isRefunded?: boolean
  statusSesi?: string
  isPast?: boolean
}

export interface AgendaGrupTanggal {
  tanggal: string
  rawDate: string
  sesi: SesiAgendaItem[]
}

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const NAMA_HARI = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
]

export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return ""
  const parts = dateStr.split("-").map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr
  const [year, month, day] = parts
  const d = new Date(year, month - 1, day)
  const hari = NAMA_HARI[d.getDay()] || ""
  const bulan = NAMA_BULAN[month - 1] || ""
  return `${hari ? hari + ", " : ""}${day} ${bulan} ${year}`
}

export function formatBulanTahun(yearMonthStr: string): string {
  if (!yearMonthStr) return ""
  const parts = yearMonthStr.split("-").map(Number)
  if (parts.length !== 2 || parts.some(isNaN)) return yearMonthStr
  const [year, month] = parts
  return `${NAMA_BULAN[month - 1] || ""} ${year}`
}

export function SesiCard({
  waktuMulai,
  waktuSelesai,
  metode,
  namaKlien,
  keluhan,
  layanan,
  pendapatanPsikolog,
  hargaPenuh,
  isRefunded,
  statusSesi,
  isPast,
}: SesiAgendaItem) {
  // Aturan Bisnis:
  // 1. Tampilkan HANYA bagian Psikolog (60%).
  // 2. Format: "Pendapatan Anda: Rp120.000".
  // 3. Jika harga kosong, null, atau 0 -> tampilkan "-" bukan "Rp0" atau NaN.
  // 4. Jika refund/dibatalkan -> JANGAN tampilkan nominal. Ganti label status "Dibatalkan (Refund)".
  const isCanceledOrRefunded =
    isRefunded ||
    statusSesi === "CANCELLED" ||
    statusSesi === "REFUNDED" ||
    statusSesi === "Dibatalkan (Refund)"

  let nominalKalkulasi = pendapatanPsikolog
  if (nominalKalkulasi === undefined && hargaPenuh !== undefined && hargaPenuh !== null && hargaPenuh > 0) {
    nominalKalkulasi = Math.round(hargaPenuh * PSIKOLOG_SHARE)
  }

  const formattedPendapatan = formatRupiahPendapatan(nominalKalkulasi)

  return (
    <div className="relative flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 pl-5 overflow-hidden transition-all hover:border-gray-300 hover:shadow-2xs">
      {/* Garis indikator kiri */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[4px] ${
          isCanceledOrRefunded ? "bg-gray-400" : isPast ? "bg-emerald-600" : "bg-[#561269]"
        }`}
      />

      {/* Baris Waktu + Metode */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-2">
          <span>{waktuMulai} - {waktuSelesai}</span>
          {isPast && !isCanceledOrRefunded && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
              Selesai
            </span>
          )}
        </div>
        <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md text-[11px] font-medium">
          {metode}
        </span>
      </div>

      {/* Nama Klien */}
      <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight mt-0.5">{namaKlien}</p>

      {/* Keluhan italic */}
      <p className="text-xs italic text-gray-500 line-clamp-2">{keluhan}</p>

      {/* Garis pemisah */}
      <div className="h-[1px] w-full bg-gray-100 mt-1" />

      {/* Baris Informasi Transaksi & Layanan */}
      <div className="flex items-center justify-between pt-0.5 text-xs">
        <div>
          {isCanceledOrRefunded ? (
            <span className="text-xs font-semibold text-gray-500">
              Dibatalkan (Refund)
            </span>
          ) : (
            <span className="font-semibold text-gray-700">
              Pendapatan Anda:{" "}
              <strong className="font-bold text-gray-900">
                {formattedPendapatan}
              </strong>
            </span>
          )}
        </div>
        <p className="italic text-gray-500 text-right">{layanan}</p>
      </div>
    </div>
  )
}

export default function PsikologBerandaClient() {
  const dateInputRef = useRef<HTMLInputElement>(null)

  const todayStr = useMemo(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [])

  const oneMonthAgoStr = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [])

  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [filterBulan, setFilterBulan] = useState<string>("1-bulan")

  const { user } = useAuthStore()
  const [psikologName, setPsikologName] = useState<string>(() => {
    if (user?.name && !user.name.toLowerCase().includes("admin")) return user.name
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("active_psikolog_name") || sessionStorage.getItem("active_psikolog_name")
      if (savedName && !savedName.toLowerCase().includes("admin")) return savedName
      try {
        const authData = localStorage.getItem("empathika-auth")
        if (authData) {
          const parsed = JSON.parse(authData)
          if (parsed?.state?.user?.name && !parsed.state.user.name.toLowerCase().includes("admin")) {
            return parsed.state.user.name
          }
        }
      } catch {}
    }
    return user?.name || ""
  })

  // State Agenda Riwayat Sesi dari Database
  const [allBookedSlots, setAllBookedSlots] = useState<any[]>([])

  // 1. Resolve Profil & Nama Psikolog
  useEffect(() => {
    const resolveName = () => {
      if (user?.role === "PSIKOLOG" && user?.name && !user.name.toLowerCase().includes("admin")) {
        setPsikologName(user.name)
        localStorage.setItem("active_psikolog_name", user.name)
        return
      }

      const savedName = localStorage.getItem("active_psikolog_name")
      const isInvalid = !savedName || savedName.toLowerCase().includes("admin")
      if (!isInvalid) {
        setPsikologName(savedName)
        return
      }

      const savedId = localStorage.getItem("active_psikolog_id")
      psikologService
        .getList()
        .then((list: any[]) => {
          if (list && list.length > 0) {
            const matched =
              (user?.role === "PSIKOLOG" && user?.id
                ? list.find((p) => p.id === user.id || p.account?.id === user.id)
                : null) ||
              (user?.role === "PSIKOLOG" && user?.email
                ? list.find((p) => p.account?.email?.toLowerCase() === user.email.toLowerCase())
                : null) ||
              (!isInvalid && savedId ? list.find((p) => p.id === savedId || p.account?.id === savedId) : null)

            if (matched) {
              const name = matched.nama_gelar || matched.account?.nama || user?.name || "Tenaga Ahli"
              localStorage.setItem("active_psikolog_id", matched.id)
              localStorage.setItem("active_psikolog_name", name)
              setPsikologName(name)
            }
          }
        })
        .catch(() => {})
    }

    resolveName()
    window.addEventListener("storage", resolveName)
    return () => window.removeEventListener("storage", resolveName)
  }, [user])

  // 2. Fetch data riwayat sesi real-time dari BE PostgreSQL
  useEffect(() => {
    psikologService
      .getJadwalSaya()
      .then((res: any) => {
        if (res) {
          if (res.psikolog?.nama_gelar) {
            setPsikologName(res.psikolog.nama_gelar)
            localStorage.setItem("active_psikolog_name", res.psikolog.nama_gelar)
            if (res.psikolog.kategori) {
              localStorage.setItem("active_psikolog_kategori", res.psikolog.kategori)
            }
            if (res.psikolog.id) {
              localStorage.setItem("active_psikolog_id", res.psikolog.id)
            }
          }

          if (res.slots && Array.isArray(res.slots)) {
            const bookedOnly = res.slots.filter((s: any) => s.booking)
            setAllBookedSlots(bookedOnly)
          }
        }
      })
      .catch(() => {})
  }, [])

  // 3. Pengelompokan & Filter:
  //    - Agenda Hari Ini / Terpilih (date === selectedDate)
  //    - Agenda Berikutnya (Mendatang: date > todayStr, urut Ascending)
  //    - Agenda yang Sudah Lewat (date < todayStr, urut Descending, filter bulan)
  const {
    agendaHariIni,
    agendaBerikutnya,
    agendaLewat,
    availablePastMonths,
    olderThanOneMonthCount,
    totalSesiBerikutnya,
    totalSesiLewat,
  } = useMemo(() => {
    const targetDate = selectedDate || todayStr

    const todayItems: SesiAgendaItem[] = []
    const futureMap = new Map<string, { rawDate: string; sesi: SesiAgendaItem[] }>()
    const pastMap = new Map<string, { rawDate: string; sesi: SesiAgendaItem[] }>()

    const allPastSlots: { rawDate: string; item: SesiAgendaItem }[] = []
    const uniquePastMonthsSet = new Set<string>()

    allBookedSlots.forEach((s: any) => {
      const b = s.booking
      if (!b) return

      const isRefund = b.is_refunded || b.status_booking === "CANCELLED"
      const dateStr = s.date // format "YYYY-MM-DD"
      const isPastSession = dateStr < todayStr

      const item: SesiAgendaItem = {
        id: s.id,
        waktuMulai: s.jam_mulai,
        waktuSelesai: s.jam_selesai,
        metode: b.metode === "OFFLINE" ? "Offline" : "Online",
        namaKlien: b.nama_klien || "Klien Empathika",
        keluhan: b.deskripsi_trauma ? `"${b.deskripsi_trauma}"` : '"Konsultasi terjadwal"',
        layanan: b.layanan || "Konseling Individu",
        hargaPenuh: b.harga_penuh,
        pendapatanPsikolog: b.pendapatan_psikolog,
        isRefunded: isRefund,
        statusSesi: b.status_booking,
        isPast: isPastSession,
      }

      // A. Sesi Hari Ini / Tanggal Terpilih
      if (dateStr === targetDate) {
        todayItems.push(item)
      }

      // B. Agenda Berikutnya (Mendatang: date > todayStr)
      if (dateStr > todayStr && dateStr !== targetDate) {
        const existing = futureMap.get(dateStr) || { rawDate: dateStr, sesi: [] as SesiAgendaItem[] }
        existing.sesi.push(item)
        futureMap.set(dateStr, existing)
      }

      // C. Agenda yang Sudah Lewat (Masa Lalu: date < todayStr)
      if (dateStr < todayStr && dateStr !== targetDate) {
        allPastSlots.push({ rawDate: dateStr, item })
        const ym = dateStr.slice(0, 7) // "YYYY-MM"
        uniquePastMonthsSet.add(ym)
      }
    })

    // Urutkan agenda hari ini berdasarkan jam mulai
    todayItems.sort((a, b) => (a.waktuMulai || "").localeCompare(b.waktuMulai || ""))

    // Proses Agenda Berikutnya (Urut Ascending: tanggal terdekat lebih dulu)
    const sortedFutureDates = Array.from(futureMap.keys()).sort((a, b) => a.localeCompare(b))
    const futureGroups: AgendaGrupTanggal[] = sortedFutureDates.map((dateKey) => {
      const entry = futureMap.get(dateKey)!
      entry.sesi.sort((a, b) => (a.waktuMulai || "").localeCompare(b.waktuMulai || ""))
      return {
        tanggal: formatTanggalIndo(dateKey),
        rawDate: dateKey,
        sesi: entry.sesi,
      }
    })

    // Filter Agenda yang Sudah Lewat sesuai pilihan user:
    // "1-bulan" (default) -> date >= oneMonthAgoStr
    // "semua" -> semua masa lalu
    // "YYYY-MM" -> hanya bulan yang dipilih
    let filteredPastSlots = allPastSlots
    if (filterBulan === "1-bulan") {
      filteredPastSlots = allPastSlots.filter((s) => s.rawDate >= oneMonthAgoStr)
    } else if (filterBulan !== "semua") {
      filteredPastSlots = allPastSlots.filter((s) => s.rawDate.startsWith(filterBulan))
    }

    // Kelompokkan sesi lewat per tanggal
    filteredPastSlots.forEach(({ rawDate, item }) => {
      const existing = pastMap.get(rawDate) || { rawDate, sesi: [] as SesiAgendaItem[] }
      existing.sesi.push(item)
      pastMap.set(rawDate, existing)
    })

    // Urutkan Agenda yang Sudah Lewat (Urut Descending: tanggal terbaru di paling atas)
    const sortedPastDates = Array.from(pastMap.keys()).sort((a, b) => b.localeCompare(a))
    const pastGroups: AgendaGrupTanggal[] = sortedPastDates.map((dateKey) => {
      const entry = pastMap.get(dateKey)!
      entry.sesi.sort((a, b) => (a.waktuMulai || "").localeCompare(b.waktuMulai || ""))
      return {
        tanggal: formatTanggalIndo(dateKey),
        rawDate: dateKey,
        sesi: entry.sesi,
      }
    })

    // Bulan-bulan unik yang tersedia untuk dropdown filter (Urut Descending)
    const availableMonths = Array.from(uniquePastMonthsSet).sort((a, b) => b.localeCompare(a))

    // Hitung berapa sesi yang tersembunyi karena lebih dari 1 bulan
    const olderCount = allPastSlots.filter((s) => s.rawDate < oneMonthAgoStr).length

    const countBerikutnya = futureGroups.reduce((acc, g) => acc + g.sesi.length, 0)
    const countLewat = pastGroups.reduce((acc, g) => acc + g.sesi.length, 0)

    return {
      agendaHariIni: todayItems,
      agendaBerikutnya: futureGroups,
      agendaLewat: pastGroups,
      availablePastMonths: availableMonths,
      olderThanOneMonthCount: olderCount,
      totalSesiBerikutnya: countBerikutnya,
      totalSesiLewat: countLewat,
    }
  }, [allBookedSlots, selectedDate, todayStr, oneMonthAgoStr, filterBulan])

  const isTodaySelected = selectedDate === todayStr

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">

      {/* ── Header: Date Picker + Profil + Total Sesi ── */}
      <div className="flex flex-col gap-3">

        {/* Date picker pojok kanan */}
        <div className="flex items-center justify-end gap-2">
          {!isTodaySelected && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#561269] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors cursor-pointer"
              title="Kembali ke agenda hari ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hari Ini</span>
            </button>
          )}

          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-10 text-xs font-semibold text-gray-700 hover:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <button
              type="button"
              onClick={() => {
                try { dateInputRef.current?.showPicker?.() }
                catch { dateInputRef.current?.focus() }
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#561269] transition-colors"
              title="Pilih tanggal"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Profil + Card Total Sesi */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#561269]">Selamat Datang!</p>
            <h2 suppressHydrationWarning className="text-2xl font-bold text-gray-900 mt-0.5">
              {psikologName || user?.name || "Tenaga Ahli Empathika"}
            </h2>
          </div>

          {/* Card kecil Total Sesi */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#561269] text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-gray-500 font-medium">
                {isTodaySelected ? "Total Sesi Hari Ini" : "Total Sesi Terpilih"}
              </span>
              <span className="text-xl font-extrabold text-gray-900">{agendaHariIni.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Judul Daftar Klien ── */}
      <h3 className="text-base font-bold text-[#561269] -mb-2">Daftar Klien</h3>

      {/* ── 1. Agenda Hari Ini / Terpilih ── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span>{isTodaySelected ? "Agenda Hari Ini" : `Agenda Tanggal ${formatTanggalIndo(selectedDate)}`}</span>
            <span className="text-[11px] font-semibold text-[#561269] bg-purple-100/70 px-2 py-0.5 rounded-full">
              {agendaHariIni.length} sesi
            </span>
          </h4>
        </div>

        {agendaHariIni.length > 0 ? (
          agendaHariIni.map((sesi) => (
            <SesiCard key={sesi.id} {...sesi} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-xs text-gray-400">
            Belum ada jadwal sesi klien {isTodaySelected ? "hari ini" : "pada tanggal ini"}.
          </div>
        )}
      </div>

      {/* ── 2. Agenda Berikutnya (Mendatang / Upcoming) ── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span>Agenda Berikutnya</span>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
              {totalSesiBerikutnya} sesi mendatang
            </span>
          </h4>
        </div>

        {agendaBerikutnya.length > 0 ? (
          agendaBerikutnya.map((grup) => (
            <div key={grup.rawDate} className="flex flex-col gap-2">
              <p className="text-xs font-bold text-[#561269] flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{grup.tanggal}</span>
              </p>
              {grup.sesi.map((sesi) => (
                <SesiCard key={sesi.id} {...sesi} />
              ))}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-xs text-gray-400">
            Belum ada agenda sesi mendatang yang terdaftar.
          </div>
        )}
      </div>

      {/* ── 3. Agenda yang Sudah Lewat (Riwayat Sesi) ── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              <span>Agenda yang Sudah Lewat</span>
              <span className="text-[11px] font-semibold text-gray-600 bg-gray-200/80 px-2 py-0.5 rounded-full">
                {totalSesiLewat} sesi
              </span>
            </h4>
          </div>

          {/* Filter Bulan Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label htmlFor="filter-bulan" className="text-xs text-gray-500 font-medium whitespace-nowrap">
              Filter:
            </label>
            <div className="relative">
              <select
                id="filter-bulan"
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="appearance-none text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 hover:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition cursor-pointer shadow-2xs"
              >
                <option value="1-bulan">1 Bulan Terakhir (Default)</option>
                {availablePastMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {formatBulanTahun(ym)}
                  </option>
                ))}
                <option value="semua">Semua Riwayat</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Info banner jika ada sesi lama yang disembunyikan */}
        {olderThanOneMonthCount > 0 && filterBulan === "1-bulan" && (
          <div className="text-[11px] text-gray-600 bg-purple-50/70 border border-purple-100/90 rounded-xl px-3 py-2 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#561269] shrink-0" />
            <span>
              Menampilkan sesi dalam <strong>1 bulan terakhir</strong>. Sesi yang lebih lama disembunyikan agar beranda tetap rapi. Pilih opsi bulan pada filter di atas jika ingin melihat riwayat sebelumnya.
            </span>
          </div>
        )}

        {agendaLewat.length > 0 ? (
          agendaLewat.map((grup) => (
            <div key={grup.rawDate} className="flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{grup.tanggal}</span>
              </p>
              {grup.sesi.map((sesi) => (
                <SesiCard key={sesi.id} {...sesi} />
              ))}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-xs text-gray-400">
            Tidak ada riwayat sesi yang sudah lewat pada periode ini.
          </div>
        )}
      </div>

    </div>
  )
}
