"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { psikologService, JadwalSlotItem } from "@/services/psikolog.service"
import { User } from "lucide-react"

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

// Slot waktu sesi konsultasi standar klinik
const STANDARD_CLINIC_SLOTS = [
  { jam_mulai: "09:00", jam_selesai: "10:00", label: "09:00 - 10:00" },
  { jam_mulai: "10:00", jam_selesai: "11:00", label: "10:00 - 11:00" },
  { jam_mulai: "13:00", jam_selesai: "14:00", label: "13:00 - 14:00" },
  { jam_mulai: "13:30", jam_selesai: "14:30", label: "13:30 - 14:30" },
  { jam_mulai: "14:30", jam_selesai: "15:30", label: "14:30 - 15:30" },
  { jam_mulai: "15:30", jam_selesai: "16:30", label: "15:30 - 16:30" },
]

export default function JadwalClient() {
  const searchParams = useSearchParams()
  const initialLayanan = searchParams?.get("layanan") || "Psikolog"
  const psikologIdParam = searchParams?.get("psikologId") || undefined

  // Batas tanggal hari ini (pukul 00:00:00) agar tanggal masa lalu tidak bisa diklik
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [metode, setMetode] = useState("Online")
  const [layanan, setLayanan] = useState(initialLayanan)
  
  // Waktu & slot terpilih (hanya boleh terisi jika slot TERSEDIA)
  const [waktu, setWaktu] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  // Calendar state: default hari ini
  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  // Dynamic slots dari database backend
  const [availableSlots, setAvailableSlots] = useState<JadwalSlotItem[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedPsikolog, setSelectedPsikolog] = useState<any>(null)

  useEffect(() => {
    if (psikologIdParam) {
      psikologService
        .getBySlug(psikologIdParam)
        .then((res: any) => {
          if (res) setSelectedPsikolog(res)
        })
        .catch(() => {})
    }
  }, [psikologIdParam])

  // Fetch slot ketersediaan dari Backend saat tanggal berubah
  useEffect(() => {
    if (!date) return

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateKey = `${year}-${month}-${day}`

    const fetchSlots = async () => {
      setIsLoadingSlots(true)

      let apiSlots: JadwalSlotItem[] = []
      try {
        apiSlots =
          (await psikologService.getJadwalTersedia({
            tanggal: dateKey,
            id_psikolog: psikologIdParam,
            tipe_jadwal: "KONSULTASI",
          })) || []
      } catch (_err) {
        apiSlots = []
      }

      // Baca juga slot yang baru saja dibuka oleh psikolog dari localStorage
      let localSlots: JadwalSlotItem[] = []
      try {
        const raw = localStorage.getItem("empathika_custom_jadwal_slots")
        if (raw) {
          const allSlots = JSON.parse(raw)
          // Bersihkan slot default admin jika ada tersimpan
          const sanitized = Array.isArray(allSlots)
            ? allSlots.filter((s: any) => s.id_psikolog !== "psikolog-default-id" && s.tipe_jadwal !== "ASESMEN")
            : []
          if (sanitized.length !== allSlots.length) {
            localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(sanitized))
          }
          localSlots = sanitized.filter(
            (s: any) =>
              s.tanggal === dateKey &&
              s.tipe_jadwal === "KONSULTASI" &&
              (!psikologIdParam || s.id_psikolog === psikologIdParam)
          )
        }
      } catch {}

      // Gabungkan hasil API dan LocalStorage (dedupe berdasarkan jam_mulai)
      const mergedMap = new Map<string, JadwalSlotItem>()
      apiSlots.forEach((s) => mergedMap.set(s.jam_mulai, s))
      localSlots.forEach((s) => mergedMap.set(s.jam_mulai, s))

      const combined = Array.from(mergedMap.values()).sort((a, b) =>
        a.jam_mulai.localeCompare(b.jam_mulai)
      )

      setAvailableSlots(combined)
      if (combined.length > 0) {
        setWaktu(combined[0].jam_mulai)
        setSelectedSlotId(combined[0].id)
      } else {
        setWaktu(null)
        setSelectedSlotId(null)
      }
      setIsLoadingSlots(false)
    }

    fetchSlots()

    // Sync otomatis saat tab kembali aktif
    window.addEventListener("focus", fetchSlots)
    window.addEventListener("storage", fetchSlots)

    return () => {
      window.removeEventListener("focus", fetchSlots)
      window.removeEventListener("storage", fetchSlots)
    }
  }, [date, psikologIdParam])

  const selectedSlot = availableSlots.find((s) => s.jam_mulai === waktu)
  const activePsikologName =
    selectedSlot?.nama_psikolog ||
    selectedPsikolog?.nama_gelar ||
    selectedPsikolog?.account?.nama ||
    searchParams.get("psikologName") ||
    null

  const buildBayarUrl = () => {
    if (!date || !waktu) return "#"
    const dayStr = String(date.getDate()).padStart(2, "0")
    const monthStr = String(date.getMonth() + 1).padStart(2, "0")
    const timeDisplay = `${waktu.substring(0, 5)} WIB`
    const psiName = activePsikologName || ""

    const params = new URLSearchParams({
      layanan,
      metode,
      tanggal: `${dayStr}/${monthStr}`,
      tahun: String(date.getFullYear()),
      waktu: waktu.substring(0, 5),
      ...(selectedSlotId && { slotId: selectedSlotId }),
      ...(psiName && { psikologName: psiName }),
      ...((selectedSlot?.id_psikolog || psikologIdParam) && {
        psikologId: selectedSlot?.id_psikolog || psikologIdParam,
      }),
      bottomDate: `${date.getDate()} ${MONTHS[date.getMonth()].substring(0, 3)} ${date.getFullYear()}`,
      bottomTime: `${timeDisplay} (${metode})${psiName ? ` • ${psiName}` : ""}`,
    })
    return `/konseling/bayar?${params.toString()}`
  }

  const isSlotReady = Boolean(date && waktu)

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32">

      {/* 1. Stepper Area */}
      <div className="w-full pt-32 pb-10 flex flex-col items-center bg-white border-b border-gray-100">
        <div className="flex items-center w-full max-w-sm justify-center px-4 relative">

          {/* Step 1 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">
              1
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700">paket</span>
          </div>

          {/* Line 1-2 */}
          <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-6"></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">
              2
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700 font-semibold">jadwal</span>
          </div>

          {/* Line 2-3 */}
          <div className="h-[2px] bg-gray-300 flex-1 mx-2 -mt-6"></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#E6D9E9] border border-purple-200 flex items-center justify-center text-black font-medium mb-2 text-sm">
              3
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">Bayar</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 mt-8">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            Jadwalkan layanan anda
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
            Pilih metode konsultasi dan tanggal yang Anda inginkan. Slot waktu hanya dapat dipilih jika telah dibuka oleh psikolog.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* KIRI */}
          <div className="flex flex-col gap-6">

            {/* Box 1: Metode Konsultasi */}
            <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Metode konsultasi</h3>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMetode("Online")}
                  className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${metode === "Online"
                    ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269]"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setMetode("Offline")}
                  className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${metode === "Offline"
                    ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269]"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Offline
                </button>
              </div>
            </div>

            {/* Box 2: Pilih Tanggal */}
            <div className="flex-1 bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[300px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Tanggal</h3>
              </div>

              <div className="flex justify-center w-full">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      const check = new Date(newDate)
                      check.setHours(0, 0, 0, 0)
                      if (check >= today) {
                        setDate(newDate)
                      }
                    }
                  }}
                  fromDate={today}
                  disabled={{ before: today }}
                  className="w-full max-w-[350px]"
                />
              </div>
            </div>

          </div>

          {/* KANAN */}
          <div className="flex flex-col gap-6">

            {/* Box 3: Pilih Layanan */}
            <div className="bg-white rounded-2xl border border-gray-300 p-5 sm:p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">3</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Layanan</h3>
              </div>

              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Option Psikolog */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${layanan.toLowerCase().includes("psikolog") || layanan.toLowerCase().includes("konsultasi") ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <div className="w-16 h-16 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg shrink-0">P</div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#561269] text-[15px]">Psikolog Klinis</h4>
                    <p className="text-[10px] text-gray-500 mt-1 mb-2 leading-tight">
                      Konsultasi mendalam dengan psikolog klinis profesional berlisensi STR & SIPP.
                    </p>
                  </div>
                  <input
                    type="radio" name="layanan" value="Psikolog"
                    checked={layanan.toLowerCase().includes("psikolog") || layanan.toLowerCase().includes("konsultasi")}
                    onChange={() => setLayanan("Psikolog")}
                    className="w-5 h-5 text-[#561269] focus:ring-[#561269]"
                  />
                </label>

                {/* Option Konselor */}
                <label
                  className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all shrink-0 ${layanan.toLowerCase().includes("konselor") && !layanan.toLowerCase().includes("peer") ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <div className="w-14 h-14 rounded-md bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-base shrink-0">K</div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#561269] text-[14px]">Konselor</h4>
                    <p className="text-[9px] text-gray-500 mt-0.5 mb-1 leading-tight">
                      Konseling terarah bersama tenaga konselor berpengalaman.
                    </p>
                  </div>
                  <input
                    type="radio" name="layanan" value="Konselor"
                    checked={layanan.toLowerCase().includes("konselor") && !layanan.toLowerCase().includes("peer")}
                    onChange={() => setLayanan("Konselor")}
                    className="w-4 h-4 text-[#561269] focus:ring-[#561269]"
                  />
                </label>

                {/* Option Peer Konselor */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${layanan.toLowerCase().includes("peer") ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <div className="w-16 h-16 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">PK</div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#561269] text-[15px]">Peer Konselor</h4>
                    <p className="text-[10px] text-gray-500 mt-1 mb-2 leading-tight">
                      Pendampingan teman sebaya yang terlatih, nyaman, dan terbuka tanpa stigma.
                    </p>
                  </div>
                  <input
                    type="radio" name="layanan" value="Peer Konselor"
                    checked={layanan.toLowerCase().includes("peer")}
                    onChange={() => setLayanan("Peer Konselor")}
                    className="w-5 h-5 text-[#561269] focus:ring-[#561269]"
                  />
                </label>
              </div>
            </div>

            {/* Box 4: Pilih Slot Waktu */}
            <div className="flex-1 bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">4</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Slot Waktu</h3>
              </div>

              {isLoadingSlots ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  Memeriksa ketersediaan jadwal...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((slot) => {
                    const timeVal = slot.jam_mulai.substring(0, 5)
                    const isSelected = waktu === slot.jam_mulai

                    return (
                      <button
                        key={slot.id || slot.jam_mulai}
                        type="button"
                        onClick={() => {
                          setWaktu(slot.jam_mulai)
                          setSelectedSlotId(slot.id)
                        }}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269]"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {timeVal}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-3 gap-3">
                    {STANDARD_CLINIC_SLOTS.map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled
                        className="py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                      >
                        {slot.jam_mulai}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 italic text-center">
                    Belum ada slot waktu yang dibuka pada tanggal ini.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div suppressHydrationWarning className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
            {date ? `${date.getDate()} ${MONTHS[date.getMonth()].substring(0, 3)} ${date.getFullYear()}` : "Pilih Tanggal"}
          </div>
          <div className="text-sm sm:text-base font-bold text-black flex items-center gap-2 flex-wrap">
            {waktu ? (
              <>
                <span className="font-extrabold text-black">{waktu.substring(0, 5)} WIB</span>
                <span className="italic font-normal text-xs sm:text-sm text-gray-500">({metode})</span>
                {activePsikologName && (
                  <span className="text-xs sm:text-sm font-semibold text-[#561269] bg-[#FAF5FD] px-3 py-1 rounded-full border border-purple-100/80 flex items-center gap-1.5 shadow-2xs">
                    <User className="w-3.5 h-3.5 fill-[#561269] text-[#561269] shrink-0" />
                    <span>{activePsikologName}</span>
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400 font-normal text-xs sm:text-sm italic">
                (Belum ada slot waktu dipilih)
              </span>
            )}
          </div>
        </div>

        {isSlotReady ? (
          <Link
            href={buildBayarUrl()}
            className="bg-[#EAB308] hover:bg-yellow-500 text-black font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-xl shadow-sm hover:scale-105 transition-all"
          >
            Bayar Sekarang
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="bg-gray-200 text-gray-400 font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-xl cursor-not-allowed opacity-75"
          >
            Pilih Jadwal Tersedia
          </button>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #C3A4CE;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}
