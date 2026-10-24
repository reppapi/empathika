"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { psikologService, JadwalSlotItem } from "@/services/psikolog.service"
import { useAuthStore } from "@/store/authStore"
import {
  getCancelledSessions,
  isSessionCancelled,
} from "@/features/konseling/utils/cancellationSync"

export type MetodeKonsultasi = "Online" | "Offline" | "Keduanya"

interface BookedSession {
  id: string
  date: string // format YYYY-MM-DD
  waktu: string
  layanan: string
  metode: MetodeKonsultasi
  namaKlien?: string
  id_psikolog?: string
  namaPsikolog?: string
  isAvailableSlot?: boolean
  status?: string
  isCancelled?: boolean
}

const INITIAL_BOOKINGS: BookedSession[] = [
  // Minggu 3 - 8 Agustus 2026
  {
    id: "b1",
    date: "2026-08-03",
    waktu: "10:00 - 11:00",
    layanan: "Hipnoterapi",
    metode: "Online",
    namaKlien: "Karen Sya",
  },
  {
    id: "b2",
    date: "2026-08-04",
    waktu: "13:30 - 14:30",
    layanan: "Home Visit",
    metode: "Offline",
    namaKlien: "Dimas Pratama",
  },
  {
    id: "b3",
    date: "2026-08-06",
    waktu: "14:30 - 15:30",
    layanan: "Konseling Individu",
    metode: "Online",
    namaKlien: "Amanda P.",
  },
  {
    id: "b4",
    date: "2026-08-07",
    waktu: "09:00 - 10:00",
    layanan: "Konseling Pasangan",
    metode: "Offline",
    namaKlien: "Sarah & David",
  },
  // Minggu 10 - 15 Agustus 2026
  {
    id: "b5",
    date: "2026-08-10",
    waktu: "09:00 - 10:00",
    layanan: "Konseling Individu",
    metode: "Online",
    namaKlien: "Budi Santoso",
  },
  {
    id: "b6",
    date: "2026-08-11",
    waktu: "13:30 - 14:30",
    layanan: "Hipnoterapi",
    metode: "Offline",
    namaKlien: "Karen Sya",
  },
  {
    id: "b7",
    date: "2026-08-14",
    waktu: "10:00 - 11:00",
    layanan: "Home Visit",
    metode: "Offline",
    namaKlien: "Riko Prasetya",
  },
  // Minggu 17 - 22 Agustus 2026
  {
    id: "b8",
    date: "2026-08-18",
    waktu: "10:00 - 11:00",
    layanan: "Konseling Individu",
    metode: "Online",
    namaKlien: "Nadia Fitri",
  },
  {
    id: "b9",
    date: "2026-08-20",
    waktu: "15:30 - 16:30",
    layanan: "Hipnoterapi",
    metode: "Offline",
    namaKlien: "Rendy P.",
  },
]

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.getFullYear(), date.getMonth(), diff)
}

function formatDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatFullDateIndonesian(d: Date): string {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

export default function PsikologJadwalClient() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const { user } = useAuthStore()

  // State daftar dan profil psikolog aktif yang diambil dari Database
  const [psikologList, setPsikologList] = useState<{ id: string; nama_gelar: string; kategori?: string; account?: any }[]>([])
  const [activePsikolog, setActivePsikolog] = useState<{ id: string; nama_gelar: string; kategori?: string; account?: any } | null>(null)

  const [selectedMetode, setSelectedMetode] = useState<MetodeKonsultasi>("Online")
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()))
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>(INITIAL_BOOKINGS)
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null)

  // Opsi input jam kustom sendiri
  const [isCustomTime, setIsCustomTime] = useState(false)
  const [customStart, setCustomStart] = useState("08:00")
  const [customEnd, setCustomEnd] = useState("09:00")

  const toggleTimeSlot = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTimes.length === timeSlots.length) {
      setSelectedTimes([])
    } else {
      setSelectedTimes([...timeSlots])
    }
  }

  // Tutup / Hapus slot jam ketersediaan yang dibuka
  const handleRemoveSlot = (timeToRemove: string) => {
    if (!date) return
    const dateKey = formatDateKey(date)
    const targetStart = timeToRemove.split(" - ")[0].trim().substring(0, 5)

    setBookedSessions((prev) =>
      prev.filter((s) => !(s.date === dateKey && s.waktu === timeToRemove))
    )

    try {
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      if (raw) {
        const list: JadwalSlotItem[] = JSON.parse(raw)
        const filtered = list.filter(
          (s) =>
            !(
              s.tanggal === dateKey &&
              (s.label_waktu === timeToRemove ||
                (s.jam_mulai || "").trim().substring(0, 5) === targetStart)
            )
        )
        localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(filtered))
        window.dispatchEvent(new Event("storage"))
      }
    } catch {}

    setSelectedTimes((prev) => prev.filter((t) => t !== timeToRemove))
  }

  // Daftar slot waktu bawaan awal
  const [timeSlots, setTimeSlots] = useState<string[]>([
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:30 - 14:30",
    "14:30 - 15:30",
    "15:30 - 16:30",
  ])

  // 1. Ambil data profil psikolog dari Database Backend PostgreSQL (Sesuai sesi login psikolog)
  useEffect(() => {
    psikologService
      .getList()
      .then((list: any[]) => {
        if (list && list.length > 0) {
          setPsikologList(list)
          // Prioritaskan psikolog yang sesuai dengan akun login auth store
          const savedId = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_id") : null
          const savedName = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_name") : null
          const found =
            (user?.id ? list.find((p) => p.account?.id === user.id || p.id === user.id || p.account?.email === user.email) : null) ||
            (user?.email ? list.find((p) => p.account?.email === user.email) : null) ||
            (savedId ? list.find((p) => p.id === savedId) : null) ||
            (savedName ? list.find((p) => p.nama_gelar === savedName) : null) ||
            list.find((p) => p.nama_gelar?.includes("Rizki") || p.account?.email?.includes("putriqoida")) ||
            list[0]

          setActivePsikolog(found)
          if (found) {
            localStorage.setItem("active_psikolog_id", found.id)
            localStorage.setItem("active_psikolog_name", found.nama_gelar || found.account?.nama)
          }
        }
      })
      .catch(() => {
        // Fallback jika API backend offline (gunakan ID aktif atau '1')
        const savedId = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_id") : null
        const savedName = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_name") : null
        const fallback = {
          id: user?.id || savedId || "1",
          nama_gelar: user?.name || savedName || "Rizki Putri Dzulqaidah, S.Psi.",
          kategori: "Konselor",
        }
        setPsikologList([fallback])
        setActivePsikolog(fallback)
      })
  }, [user])

  // 2. Sinkronkan jadwal dari Database dan LocalStorage
  const loadScheduleFromBackend = async () => {
    try {
      const res: any = await psikologService.getJadwalSaya()
      if (res) {
        if (res.psikolog) {
          setActivePsikolog((prev) => ({
            ...prev,
            id: res.psikolog.id,
            nama_gelar: res.psikolog.nama_gelar,
            kategori: res.psikolog.kategori,
          }))
        }
        if (res.slots) {
          const mappedFromDb: BookedSession[] = res.slots.map((s: any) => ({
            id: s.id,
            date: s.date,
            waktu: s.waktu,
            layanan: s.booking?.layanan || "Konsultasi Psikologi",
            metode: (s.booking?.metode === "OFFLINE" ? "Offline" : (s.metode || "Online")) as MetodeKonsultasi,
            namaKlien: s.booking?.nama_klien || "Tersedia",
            id_psikolog: res.psikolog?.id,
            namaPsikolog: res.psikolog?.nama_gelar,
            isAvailableSlot: s.status === "TERSEDIA",
          }))

          // Gabungkan dengan state awal
          setBookedSessions((prev) => {
            const map = new Map<string, BookedSession>()
            prev.forEach((item) => map.set(`${item.date}_${item.waktu}`, item))
            mappedFromDb.forEach((item) => map.set(`${item.date}_${item.waktu}`, item))
            return Array.from(map.values())
          })
        }
      }
    } catch {}

    // Baca dari localStorage dev cache
    try {
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      if (raw) {
        const localList: JadwalSlotItem[] = JSON.parse(raw)
        const localSessions: BookedSession[] = localList.map((s) => ({
          id: s.id,
          date: s.tanggal,
          waktu: s.label_waktu || `${s.jam_mulai} - ${s.jam_selesai}`,
          layanan: "Konseling Individu",
          metode: (s.metode as MetodeKonsultasi) || "Online",
          namaKlien: "Tersedia",
          id_psikolog: s.id_psikolog,
          namaPsikolog: s.nama_psikolog,
          isAvailableSlot: true,
        }))

        setBookedSessions((prev) => {
          const map = new Map<string, BookedSession>()
          prev.forEach((item) => map.set(`${item.date}_${item.waktu}`, item))
          localSessions.forEach((item) => map.set(`${item.date}_${item.waktu}`, item))
          return Array.from(map.values())
        })
      }
    } catch {}

    // 3. Terapkan status pembatalan yang dilakukan oleh admin
    try {
      const cancelledList = getCancelledSessions()
      if (cancelledList.length > 0) {
        setBookedSessions((prev) =>
          prev.map((item) => {
            if (item.isCancelled || item.status === "Dibatalkan" || isSessionCancelled(item, cancelledList)) {
              return { ...item, isCancelled: true, status: "Dibatalkan" }
            }
            return item
          })
        )
      }
    } catch {}
  }

  useEffect(() => {
    loadScheduleFromBackend()
  }, [currentWeekMonday])

  // Listener real-time: jika admin membatalkan sesi di halaman admin, otomatis jadwal psikolog ter-update
  useEffect(() => {
    const handleSyncCancelled = (e?: any) => {
      const cancelledList = getCancelledSessions()
      const newCancelled = e?.detail

      setBookedSessions((prev) =>
        prev.map((s) => {
          const matchDetail =
            newCancelled &&
            (s.id === newCancelled.id ||
              (newCancelled.date && s.date === newCancelled.date && s.waktu === newCancelled.waktu) ||
              (newCancelled.namaKlien &&
                s.namaKlien &&
                s.namaKlien.toLowerCase() === newCancelled.namaKlien.toLowerCase() &&
                s.waktu === newCancelled.waktu))

          if (matchDetail || isSessionCancelled(s, cancelledList)) {
            return { ...s, isCancelled: true, status: "Dibatalkan" }
          }
          return s
        })
      )
    }

    handleSyncCancelled()
    window.addEventListener("storage", handleSyncCancelled)
    window.addEventListener("empathika_session_cancelled", handleSyncCancelled as EventListener)

    return () => {
      window.removeEventListener("storage", handleSyncCancelled)
      window.removeEventListener("empathika_session_cancelled", handleSyncCancelled as EventListener)
    }
  }, [])

  // Sinkronkan minggu saat memilih tanggal dari kalender dan reset pilihan jam
  const handleSelectDate = (newDate: Date | undefined) => {
    if (newDate) {
      const check = new Date(newDate)
      check.setHours(0, 0, 0, 0)
      if (check >= today) {
        setDate(newDate)
        setCurrentWeekMonday(getMonday(newDate))
        // Reset centang pilihan jam agar keulang bersih saat ganti tanggal
        setSelectedTimes([])
        setIsCustomTime(false)
        setBookingSuccessMsg(null)
      }
    }
  }

  // 6 hari kerja dalam seminggu (Senin - Sabtu)
  const weekDays = useMemo(() => {
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agus", "Sep", "Okt", "Nov", "Des"]

    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(currentWeekMonday)
      d.setDate(currentWeekMonday.getDate() + i)
      const dateKey = formatDateKey(d)
      return {
        dayName: dayNames[i],
        dateKey,
        dateLabel: `${d.getDate()} ${monthNamesShort[d.getMonth()]}`,
        isSameAsSelected: date ? dateKey === formatDateKey(date) : false,
      }
    })
  }, [currentWeekMonday, date])

  // Judul range minggu: "3 - 8 Agustus 2026"
  const weekRangeLabel = useMemo(() => {
    const start = new Date(currentWeekMonday)
    const end = new Date(currentWeekMonday)
    end.setDate(currentWeekMonday.getDate() + 5)

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ]

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`
    } else {
      return `${start.getDate()} ${monthNames[start.getMonth()].slice(0, 4)} - ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`
    }
  }, [currentWeekMonday])

  const goToPrevWeek = () => {
    const prev = new Date(currentWeekMonday)
    prev.setDate(currentWeekMonday.getDate() - 7)
    setCurrentWeekMonday(prev)
    setSelectedTimes([])
    setIsCustomTime(false)
    setBookingSuccessMsg(null)
  }

  const goToNextWeek = () => {
    const next = new Date(currentWeekMonday)
    next.setDate(currentWeekMonday.getDate() + 7)
    setCurrentWeekMonday(next)
    setSelectedTimes([])
    setIsCustomTime(false)
    setBookingSuccessMsg(null)
  }

  // Simpan slot ketersediaan ke Database & LocalStorage (Bisa Sekaligus)
  const handleBooking = async () => {
    if (!date) return
    const dateKey = formatDateKey(date)

    const timesToOpen: string[] = [...selectedTimes]

    if (isCustomTime) {
      if (!customStart || !customEnd) {
        alert("Harap masukkan jam mulai dan jam selesai terlebih dahulu.")
        return
      }
      if (customEnd <= customStart) {
        alert("Jam selesai harus lebih akhir dari jam mulai.")
        return
      }
      const customSlot = `${customStart} - ${customEnd}`
      if (!timesToOpen.includes(customSlot)) {
        timesToOpen.push(customSlot)
      }
    }

    if (timesToOpen.length === 0) {
      alert("Harap pilih minimal satu jam slot terlebih dahulu.")
      return
    }

    const savedId = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_id") : null
    const savedName = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_name") : null
    const psikologId = activePsikolog?.id || savedId || "1"
    const psikologNama = activePsikolog?.nama_gelar || savedName || "Rizki Putri Dzulqaidah, S.Psi."

    const newSessions: BookedSession[] = []
    const newSlotItems: JadwalSlotItem[] = []

    for (const finalWaktu of timesToOpen) {
      const [start, end] = finalWaktu.split(" - ")
      const jamMulai = start?.trim() || "09:00"
      const jamSelesai = end?.trim() || "10:00"

      let savedSlotId = "slot-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6)

      // 1. Simpan ke Backend Database PostgreSQL
      try {
        const res: any = await psikologService.createJadwalSlot({
          id_psikolog: psikologId,
          tanggal: dateKey,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          tipe_jadwal: "KONSULTASI",
          metode: selectedMetode,
        })
        if (res && res.id) {
          savedSlotId = res.id
        }
      } catch (err: any) {
        console.warn("Notice save slot:", err?.response?.data?.message || err.message)
      }

      newSlotItems.push({
        id: savedSlotId,
        id_psikolog: psikologId,
        nama_psikolog: psikologNama,
        tanggal: dateKey,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        label_waktu: finalWaktu,
        metode: selectedMetode,
        status: "TERSEDIA",
        tipe_jadwal: "KONSULTASI",
      })

      newSessions.push({
        id: savedSlotId,
        date: dateKey,
        waktu: finalWaktu,
        layanan: "Konseling Individu",
        metode: selectedMetode,
        namaKlien: "Tersedia",
        id_psikolog: psikologId,
        namaPsikolog: psikologNama,
        isAvailableSlot: true,
      })

      if (!timeSlots.includes(finalWaktu)) {
        setTimeSlots((prev) => [...prev, finalWaktu].sort())
      }
    }

    // 2. Simpan ke LocalStorage agar Klien langsung dapat melihat
    try {
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      const list: JadwalSlotItem[] = raw ? JSON.parse(raw) : []
      const filtered = list.filter(
        (s) =>
          !(
            s.tanggal === dateKey &&
            timesToOpen.some((t) => {
              const startT = t.split(" - ")[0].trim().substring(0, 5)
              const startS = (s.jam_mulai || "").trim().substring(0, 5)
              return s.label_waktu === t || startS === startT
            })
          )
      )
      filtered.push(...newSlotItems)
      localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(filtered))
      window.dispatchEvent(new Event("storage"))
    } catch {}

    // 3. Tambahkan ke jadwal mingguan
    setBookedSessions((prev) => {
      const filtered = prev.filter(
        (s) => !(s.date === dateKey && timesToOpen.includes(s.waktu))
      )
      return [...filtered, ...newSessions]
    })

    setBookingSuccessMsg(`${timesToOpen.length} slot jam (${selectedMetode}) berhasil dibuka sekaligus atas nama ${psikologNama}! Slot ini sekarang aktif di halaman booking klien.`)
    setSelectedTimes([])
    setIsCustomTime(false)
    setTimeout(() => setBookingSuccessMsg(null), 4500)
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-gray-800 pb-16">
      {/* Card 1: Jadwal Sesi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Jadwal Sesi</h2>
            <p className="text-sm text-gray-500">
              Atur ketersediaan sesi konseling Anda. Pilih metode konsultasi, tentukan tanggal, lalu centang slot jam yang ingin dibuka untuk klien.
            </p>
          </div>
        </div>

        {/* Step 1: Pilih Metode Konsultasi (Identik dengan Desain Klien Booking) */}
        <div className="bg-white rounded-[1.5rem] border-2 border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-6 max-w-4xl">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Pilih Metode konsultasi</h3>
            </div>
            <span className="text-[11px] font-semibold text-[#561269] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Metode Dipilih: <span className="font-bold underline">{selectedMetode}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMetode("Online")}
              className={`py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                selectedMetode === "Online"
                  ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269] font-bold shadow-xs"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetode("Offline")}
              className={`py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                selectedMetode === "Offline"
                  ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269] font-bold shadow-xs"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Offline
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetode("Keduanya")}
              className={`py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                selectedMetode === "Keduanya"
                  ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269] font-bold shadow-xs"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Keduanya (Online & Offline)
            </button>
          </div>

          <p className="text-[11px] text-gray-500 mt-3 italic">
            {selectedMetode === "Online" && "• Slot jam yang Anda buka akan dikhususkan untuk sesi Online (Video Call / Google Meet)."}
            {selectedMetode === "Offline" && "• Slot jam yang Anda buka akan dikhususkan untuk sesi Tatap Muka (Offline di klinik Empathika)."}
            {selectedMetode === "Keduanya" && "• Slot jam fleksibel: klien bebas memilih ingin berkonsultasi secara Online maupun Offline."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Step 2: Calendar Picker (Left) */}
          <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Tanggal</h3>
              </div>

              <div className="flex justify-center w-full my-auto">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleSelectDate}
                  fromDate={today}
                  disabled={{ before: today }}
                  fixedWeeks
                  className="w-full max-w-[320px] mx-auto bg-transparent"
                />
              </div>
            </div>

            {date && (
              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-500">Tanggal dipilih: </span>
                <span className="text-xs font-bold text-[#561269]">{formatFullDateIndonesian(date)}</span>
              </div>
            )}
          </div>

          {/* Step 3: Time Picker (Right) */}
          <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <h3 suppressHydrationWarning className="font-bold text-[14px] text-gray-900 capitalize">
                    {date ? formatFullDateIndonesian(date) : "Pilih Tanggal"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-bold text-[#561269] hover:underline cursor-pointer"
                >
                  {selectedTimes.length === timeSlots.length ? "Batal Pilih Semua" : "Pilih Semua"}
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Pilih slot jam yang ingin dibuka dengan metode <span className="font-bold text-[#561269]">{selectedMetode}</span>:
              </p>

              {/* Checkbox List Slot Waktu */}
              <div className="flex flex-col gap-2.5 mb-6 max-h-[340px] overflow-y-auto pr-1">
                {timeSlots.map((time, idx) => {
                  const isChecked = selectedTimes.includes(time)
                  const openedSession = date
                    ? bookedSessions.find(
                        (s) => s.date === formatDateKey(date) && s.waktu === time && s.isAvailableSlot
                      )
                    : undefined
                  const isAlreadyOpened = Boolean(openedSession)
                  const openedMetode = openedSession?.metode || "Online"

                  const cancelledSession = date
                    ? bookedSessions.find(
                        (s) =>
                          s.date === formatDateKey(date) &&
                          s.waktu === time &&
                          (s.isCancelled || s.status === "Dibatalkan")
                      )
                    : undefined
                  const isAlreadyCancelled = Boolean(cancelledSession)

                  const bookedSession = date
                    ? bookedSessions.find(
                        (s) =>
                          s.date === formatDateKey(date) &&
                          s.waktu === time &&
                          !s.isAvailableSlot &&
                          s.namaKlien !== "Tersedia" &&
                          !s.isCancelled &&
                          s.status !== "Dibatalkan"
                      )
                    : undefined
                  const isAlreadyBooked = Boolean(bookedSession)

                  return (
                    <label
                      key={idx}
                      className={`flex items-center justify-between border rounded-xl px-4 py-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? "border-[#561269] bg-purple-50/70 shadow-2xs"
                          : isAlreadyCancelled
                          ? "border-rose-200 bg-rose-50/40"
                          : isAlreadyOpened
                          ? "border-purple-300 bg-purple-50/30"
                          : isAlreadyBooked
                          ? "border-blue-200 bg-blue-50/30"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTimeSlot(time)}
                          className="w-4 h-4 text-[#561269] focus:ring-[#561269] rounded border-gray-300 cursor-pointer"
                        />
                        <span className={`text-[13px] font-medium ${
                          isChecked
                            ? "text-[#561269] font-bold"
                            : isAlreadyCancelled
                            ? "text-gray-600 line-through"
                            : "text-gray-700"
                        }`}>
                          {time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isAlreadyCancelled && !isChecked && (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/90 border border-rose-200 px-2 py-0.5 rounded-full">
                            Dibatalkan Admin
                          </span>
                        )}
                        {isAlreadyOpened && !isChecked && !isAlreadyCancelled && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
                              Dibuka ({openedMetode})
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleRemoveSlot(time)
                              }}
                              title="Tutup / Hapus slot jam ini"
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {isAlreadyBooked && !isChecked && !isAlreadyCancelled && (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                            Ada Klien ({bookedSession?.metode})
                          </span>
                        )}
                        {isChecked && (
                          <span className="text-[11px] font-semibold text-[#561269] bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                            Dipilih ({selectedMetode})
                          </span>
                        )}
                      </div>
                    </label>
                  )
                })}

                {/* Opsi Tambahan: Tentukan Jam Kustom Sendiri */}
                <div
                  className={`border rounded-xl px-4 py-2.5 transition-colors cursor-pointer ${
                    isCustomTime
                      ? "border-[#561269] bg-purple-50/70 shadow-2xs"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomTime}
                      onChange={() => setIsCustomTime(!isCustomTime)}
                      className="w-4 h-4 text-[#561269] focus:ring-[#561269] rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-[13px] font-medium text-gray-700">
                      Tentukan Jam Kustom Sendiri
                    </span>
                  </label>

                  {isCustomTime && (
                    <div className="flex items-center gap-2 pl-7 pt-2.5">
                      <div className="flex-1">
                        <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                          Jam Mulai
                        </span>
                        <input
                          type="time"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full text-xs font-semibold p-1.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                        />
                      </div>
                      <span className="text-gray-400 mt-4 text-xs font-bold">-</span>
                      <div className="flex-1">
                        <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                          Jam Selesai
                        </span>
                        <input
                          type="time"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full text-xs font-semibold p-1.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {bookingSuccessMsg && (
                <p className="text-xs text-emerald-600 font-semibold text-center animate-fadeIn bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  ✓ {bookingSuccessMsg}
                </p>
              )}
              <button
                type="button"
                onClick={handleBooking}
                disabled={selectedTimes.length === 0 && !isCustomTime}
                className={`w-full font-bold py-3.5 rounded-full text-[13px] transition-all cursor-pointer ${
                  selectedTimes.length > 0 || isCustomTime
                    ? "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 shadow-sm hover:shadow-md active:scale-95"
                    : "bg-[#d6d6d6] text-gray-500 cursor-not-allowed"
                }`}
              >
                {selectedTimes.length > 0
                  ? `Buka ${selectedTimes.length} Jam Sesi Sekaligus (${selectedMetode})`
                  : isCustomTime
                  ? `Buka Jam Kustom (${selectedMetode})`
                  : "Pilih Jam Terlebih Dahulu"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Jadwal Mingguan (Sesuai Desain Grid Asli) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Jadwal Mingguan</h2>
        <p className="text-sm text-gray-500 mb-6">
          Lihat ringkasan jadwal sesi Anda yang sudah dibooking dalam satu minggu.
        </p>

        {/* Week Selector */}
        <div className="flex items-center gap-3 text-[13px] font-bold text-gray-800 mb-4">
          <button
            type="button"
            onClick={goToPrevWeek}
            aria-label="Minggu Sebelumnya"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 min-w-[150px] text-center">{weekRangeLabel}</span>
          <button
            type="button"
            onClick={goToNextWeek}
            aria-label="Minggu Berikutnya"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Weekly Grid (Grid Asli 6 Kolom) */}
        <div className="w-full border border-gray-200 rounded-xl overflow-x-auto hide-scrollbar">
          <div className="min-w-[720px]">
            {/* Header */}
            <div className="grid grid-cols-6 border-b border-gray-200 bg-gray-50/70">
              {weekDays.map((wd, i) => (
                <div
                  key={i}
                  onClick={() => {
                    const targetDate = new Date(currentWeekMonday)
                    targetDate.setDate(currentWeekMonday.getDate() + i)
                    handleSelectDate(targetDate)
                  }}
                  title="Klik untuk memilih tanggal ini"
                  className={`py-3 flex flex-col items-center justify-center border-r border-gray-200 last:border-0 cursor-pointer hover:bg-purple-50/50 transition-colors ${
                    wd.isSameAsSelected ? "bg-purple-50/80 ring-1 ring-inset ring-[#561269]/20" : ""
                  }`}
                >
                  <span
                    className={`text-[13px] font-bold ${
                      wd.isSameAsSelected ? "text-[#561269]" : "text-gray-800"
                    }`}
                  >
                    {wd.dayName}
                  </span>
                  <span
                    className={`text-[11px] ${
                      wd.isSameAsSelected ? "text-[#561269] font-bold" : "text-gray-500"
                    }`}
                  >
                    {wd.dateLabel}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-6 min-h-[360px] divide-x divide-gray-200">
              {weekDays.map((wd, i) => {
                const sessions = bookedSessions.filter((s) => s.date === wd.dateKey)

                return (
                  <div
                    key={i}
                    className={`p-2 flex flex-col gap-2 ${
                      wd.isSameAsSelected ? "bg-purple-50/20" : "bg-white"
                    }`}
                  >
                    {timeSlots.map((time, slotIdx) => {
                      const booking = sessions.find((s) => s.waktu === time)

                      // 1. Sesi Dibatalkan oleh Admin
                      if (booking && (booking.isCancelled || booking.status === "Dibatalkan" || (booking as any).status_booking === "CANCELLED")) {
                        return (
                          <div
                            key={booking.id || slotIdx}
                            className="bg-rose-50/90 border border-rose-200/90 rounded-lg p-2.5 flex items-start gap-2 shadow-xs transition-all"
                          >
                            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                            <div className="flex flex-col text-[10px] font-bold text-gray-800 leading-tight">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-rose-700 font-extrabold line-through">{booking.waktu}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                                  Dibatalkan
                                </span>
                              </div>
                              <span className="font-semibold text-gray-700 mt-0.5">{booking.layanan}</span>
                              <span className="font-normal italic text-[9px] text-gray-500">
                                {booking.namaKlien ? `${booking.namaKlien} ` : ""}({booking.metode})
                              </span>
                              <span className="text-[9px] text-rose-600 font-semibold mt-1">
                                * Dibatalkan oleh Admin
                              </span>
                            </div>
                          </div>
                        )
                      }

                      // 2. Sesi Dibooking Klien (Warna Hijau Sesuai Desain Asli)
                      if (booking && !booking.isAvailableSlot && booking.namaKlien !== "Tersedia") {
                        return (
                          <div
                            key={booking.id || slotIdx}
                            className="bg-[#d7e6dc] border border-[#b4d6be] rounded-lg p-2.5 flex items-start gap-2 shadow-xs hover:shadow-sm transition-all"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#185e26] shrink-0 mt-1" />
                            <div className="flex flex-col text-[10px] font-bold text-gray-800 leading-tight">
                              <span className="text-[#185e26]">{booking.waktu}</span>
                              <span className="font-semibold text-gray-900 mt-0.5">{booking.layanan}</span>
                              <span className="font-normal italic text-[9px] text-gray-600">
                                {booking.namaKlien ? `${booking.namaKlien} ` : ""}({booking.metode})
                              </span>
                            </div>
                          </div>
                        )
                      }

                      if (booking && booking.isAvailableSlot) {
                        return (
                          <div
                            key={booking.id || slotIdx}
                            className="bg-[#f7f2fa] border border-[#d8c3e8] rounded-lg p-2.5 flex items-start gap-2 shadow-2xs hover:bg-[#efe4f5] transition-all"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#561269] shrink-0 mt-1" />
                            <div className="flex flex-col text-[10px] font-bold text-gray-800 leading-tight">
                              <span className="text-[#561269]">{booking.waktu}</span>
                              <span className="font-semibold text-purple-900 mt-0.5">Tersedia</span>
                              <span className="font-normal text-[9px] text-purple-700 mt-0.5">
                                ({booking.metode})
                              </span>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={slotIdx}
                          className="bg-[#f9fafb] border border-gray-200/80 rounded-lg p-2 flex items-start gap-2 hover:bg-gray-100 transition-colors opacity-70"
                        >
                          <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0 mt-1" />
                          <div className="flex flex-col text-[10px] leading-tight">
                            <span className="font-bold text-gray-600">{time}</span>
                            <span className="text-[9px] text-gray-400 font-medium mt-0.5">Belum Dibuka</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-5 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#185e26]" />
            <span className="text-[11px] font-bold text-gray-700">Sudah Dibooking Klien</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#561269]" />
            <span className="text-[11px] font-bold text-gray-700">Slot Dibuka / Tersedia (Online / Offline / Keduanya)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[11px] font-bold text-rose-700">Sesi Dibatalkan oleh Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-[11px] font-bold text-gray-700">Belum Dibuka</span>
          </div>
        </div>
      </div>
    </div>
  )
}
