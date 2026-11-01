"use client"

import { useState, useRef, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { psikologService } from "@/services/psikolog.service"
import { PSIKOLOG_SHARE, formatRupiahPendapatan } from "@/config/constants"

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
}

export interface AgendaGrupTanggal {
  tanggal: string
  sesi: SesiAgendaItem[]
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
}: SesiAgendaItem) {
  // Aturan Bisnis Bagian 1:
  // 1. Tampilkan HANYA bagian Psikolog (60%).
  // 2. Format: "Pendapatan Anda: Rp120.000".
  // 3. Intl.NumberFormat("id-ID") dibulatkan tanpa desimal.
  // 4. Jika harga kosong, null, atau 0 -> tampilkan "-" bukan "Rp0" atau NaN.
  // 5. Jika refund/dibatalkan -> JANGAN tampilkan nominal. Ganti label status "Dibatalkan (Refund)".
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
    <div className="relative flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 pl-5 overflow-hidden">
      {/* Garis ungu kiri */}
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${isCanceledOrRefunded ? "bg-gray-400" : "bg-[#561269]"}`} />

      {/* Baris Waktu + Metode */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
        <span>{waktuMulai} - {waktuSelesai}</span>
        <span>{metode}</span>
      </div>

      {/* Nama Klien */}
      <p className="text-lg font-bold text-gray-900 leading-tight">{namaKlien}</p>

      {/* Keluhan italic */}
      <p className="text-xs italic text-gray-500">{keluhan}</p>

      {/* Garis pemisah */}
      <div className="h-[1px] w-full bg-gray-100 mt-1" />

      {/* Baris Informasi Transaksi (Hanya Bagian Psikolog 60%) & Layanan */}
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
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })

  const { user } = useAuthStore()
  const [psikologName, setPsikologName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("active_psikolog_name") || sessionStorage.getItem("active_psikolog_name");
      if (savedName && !savedName.toLowerCase().includes("admin")) return savedName;
      try {
        const authData = localStorage.getItem("empathika-auth");
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed?.state?.user?.name && !parsed.state.user.name.toLowerCase().includes("admin")) {
            return parsed.state.user.name;
          }
        }
      } catch {}
    }
    return "";
  })

  // State Agenda Riwayat Sesi (Murni Database PostgreSQL)
  const [allBookedSlots, setAllBookedSlots] = useState<any[]>([])
  const [agendaHariIni, setAgendaHariIni] = useState<SesiAgendaItem[]>([])
  const [agendaBerikutnya, setAgendaBerikutnya] = useState<AgendaGrupTanggal[]>([])

  // 1. Resolve Profil & Nama Psikolog
  useEffect(() => {
    const resolveName = () => {
      // 1. Jika akun yang login adalah PSIKOLOG murni (bukan admin)
      if (user?.role === "PSIKOLOG" && user?.name && !user.name.toLowerCase().includes("admin")) {
        setPsikologName(user.name)
        localStorage.setItem("active_psikolog_name", user.name)
        return
      }

      // 2. Ambil dari localStorage jika valid (bukan Admin)
      const savedName = localStorage.getItem("active_psikolog_name")
      const isInvalid = !savedName || savedName.toLowerCase().includes("admin")
      if (!isInvalid) {
        setPsikologName(savedName)
        return
      }

      // 3. Fallback ambil dari daftar psikolog (prioritaskan Dr. Jane Doe)
      const savedId = localStorage.getItem("active_psikolog_id")
      psikologService
        .getList()
        .then((list: any[]) => {
          if (list && list.length > 0) {
            const matched =
              (!isInvalid && savedId ? list.find((p) => p.id === savedId || p.account?.id === savedId) : null) ||
              list.find((p) => p.nama_gelar?.includes("Jane") || p.account?.email?.includes("psikolog@empathika")) ||
              list.find((p) => p.nama_gelar?.includes("Rizki") || p.account?.email?.includes("putriqoida")) ||
              list[0]

            if (matched) {
              const name = matched.nama_gelar || matched.account?.nama || "Dr. Jane Doe, M.Psi., Psikolog"
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
          // Sinkronkan nama profil psikolog resmi langsung dari response backend
          if (res.psikolog?.nama_gelar) {
            setPsikologName(res.psikolog.nama_gelar)
            localStorage.setItem("active_psikolog_name", res.psikolog.nama_gelar)
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

  // 3. Sinkronkan agenda hari ini & agenda berikutnya sesuai selectedDate / hari ini
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    const targetDate = selectedDate || todayStr

    const targetItems: SesiAgendaItem[] = []
    const futureMap = new Map<string, SesiAgendaItem[]>()

    allBookedSlots.forEach((s: any) => {
      const b = s.booking
      const isRefund = b.is_refunded || b.status_booking === "CANCELLED"
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
      }

      if (s.date === targetDate) {
        targetItems.push(item)
      } else {
        const dateKey = s.date.split("-").reverse().join("-")
        const existing = futureMap.get(dateKey) || []
        existing.push(item)
        futureMap.set(dateKey, existing)
      }
    })

    setAgendaHariIni(targetItems)
    const groups: AgendaGrupTanggal[] = Array.from(futureMap.entries()).map(([tanggal, sesi]) => ({
      tanggal,
      sesi,
    }))
    setAgendaBerikutnya(groups)
  }, [allBookedSlots, selectedDate])

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">

      {/* ── Header: Date Picker + Profil + Total Sesi ── */}
      <div className="flex flex-col gap-3">

        {/* Date picker pojok kanan */}
        <div className="flex justify-end">
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profil + Card Total Sesi */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#561269]">Selamat Datang!</p>
            <h2 suppressHydrationWarning className="text-2xl font-bold text-gray-900 mt-0.5">
              {psikologName || user?.name || "Psikolog Empathika"}
            </h2>
          </div>

          {/* Card kecil Total Sesi Hari Ini */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#561269] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-gray-500 font-medium">Total Sesi Hari Ini</span>
              <span className="text-xl font-extrabold text-gray-900">{agendaHariIni.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Judul Daftar Klien ── */}
      <h3 className="text-base font-bold text-[#561269] -mb-2">Daftar Klien</h3>

      {/* ── Agenda Hari Ini ── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-gray-700">Agenda Hari Ini</h4>
        {agendaHariIni.length > 0 ? (
          agendaHariIni.map((sesi) => (
            <SesiCard key={sesi.id} {...sesi} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-xs text-gray-400">
            Belum ada jadwal sesi klien hari ini.
          </div>
        )}
      </div>

      {/* ── Agenda Berikutnya ── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-gray-700">Agenda Berikutnya</h4>
        {agendaBerikutnya.length > 0 ? (
          agendaBerikutnya.map((grup) => (
            <div key={grup.tanggal} className="flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-500">{grup.tanggal}</p>
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

    </div>
  )
}
