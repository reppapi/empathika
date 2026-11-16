"use client"

import React, { useState, useEffect, useMemo } from "react"
import { ClientSessionToday } from "@/features/konseling/types"
import { CalendarClock, AlertCircle, X, Calendar, Clock, User, CheckCircle2 } from "lucide-react"
import { psikologService, JadwalSlotItem } from "@/services/psikolog.service"
import DatePickerMiniCalendar from "@/components/shared/DatePickerMiniCalendar"

interface ModalRescheduleSesiProps {
  session: ClientSessionToday | null
  onClose: () => void
  onConfirmReschedule: (id: string, newDate: string, newWaktu: string, alasan?: string) => Promise<void> | void
}

export const getSlotTimeLabel = (slot: { label_waktu?: string; jam_mulai: string; jam_selesai: string }) => {
  if (slot.label_waktu) {
    return slot.label_waktu.includes("WIB") ? slot.label_waktu : `${slot.label_waktu} WIB`
  }
  return `${slot.jam_mulai.substring(0, 5)} - ${slot.jam_selesai.substring(0, 5)} WIB`
}

export const isSlotPassed = (slot: { tanggal?: string; jam_mulai?: string; label_waktu?: string }): boolean => {
  if (!slot.tanggal) return false
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  if (slot.tanggal < todayKey) return true
  if (slot.tanggal > todayKey) return false

  // Jika hari ini: ambil jam mulai dan bandingkan dengan jam sekarang
  let timeStr = slot.jam_mulai || ""
  if (!timeStr && slot.label_waktu) {
    timeStr = slot.label_waktu.split("-")[0].trim()
  }
  timeStr = timeStr.replace(/\s*WIB/i, "").trim()
  const parts = timeStr.split(":")
  if (parts.length >= 2) {
    const slotStartMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    return slotStartMinutes <= currentMinutes
  }
  return false
}

const DEFAULT_ASESMEN_TIME_SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "14:30 - 15:30",
  "15:00 - 16:00",
  "15:30 - 16:30",
  "16:00 - 17:00",
  "16:30 - 17:30",
  "19:00 - 20:00",
  "20:00 - 21:00",
]

export default function ModalRescheduleSesi({
  session,
  onClose,
  onConfirmReschedule,
}: ModalRescheduleSesiProps) {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = tomorrow.toISOString().split("T")[0]

  // Cek apakah sesi ini adalah sesi Asesmen (tanpa psikolog) atau Konseling (dengan psikolog)
  const isAsesmenSession = useMemo(() => {
    if (!session) return false
    const tj = ((session as any).tipe_jadwal || "").toUpperCase()
    if (tj === "ASESMEN") return true
    const lay = (session.layanan || "").toLowerCase()
    if (lay.includes("asesmen") || lay.includes("psikotes") || lay.includes("tes psikologi")) {
      return true
    }
    // Jika tidak memiliki ID psikolog dan nama psikolog kosong / Tenaga Ahli
    if (!session.idPsikolog && (!session.psikolog || session.psikolog === "Tenaga Ahli")) {
      return true
    }
    return false
  }, [session])

  const [newDate, setNewDate] = useState<string>(session?.date || session?.tanggal || tomorrowKey)
  const [newWaktu, setNewWaktu] = useState<string>(session?.waktu || "")
  const [alasan, setAlasan] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [psikologList, setPsikologList] = useState<any[]>([])
  const [isLoadingPsikolog, setIsLoadingPsikolog] = useState(false)

  const [availableSlots, setAvailableSlots] = useState<JadwalSlotItem[]>([])
  const [allPsikologSlots, setAllPsikologSlots] = useState<JadwalSlotItem[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Muat data psikolog untuk resolusi nama & id psikolog jika sesi Konseling
  useEffect(() => {
    if (isAsesmenSession) return
    let isMounted = true
    const loadPsikologs = async () => {
      setIsLoadingPsikolog(true)
      try {
        const list = await psikologService.getList({ status: "ALL" })
        if (isMounted && Array.isArray(list)) {
          setPsikologList(list)
        }
      } catch (err) {
        console.warn("Gagal mengambil data psikolog:", err)
      } finally {
        if (isMounted) setIsLoadingPsikolog(false)
      }
    }
    loadPsikologs()
    return () => {
      isMounted = false
    }
  }, [isAsesmenSession])

  // Resolusi profil psikolog yang menangani sesi ini (hanya jika sesi Konseling)
  const resolvedPsikolog = useMemo(() => {
    if (!session || isAsesmenSession) return null

    // 1. Berdasarkan idPsikolog jika tersedia
    if (session.idPsikolog) {
      const found = psikologList.find((p) => p.id === session.idPsikolog)
      if (found) return found
    }

    // 2. Berdasarkan kecocokan nama psikolog
    if (session.psikolog && session.psikolog !== "Tenaga Ahli" && session.psikolog !== "Belum Ditentukan") {
      const cleanName = session.psikolog.toLowerCase().trim()
      const found = psikologList.find((p) => {
        const pName = (p.nama_gelar || p.account?.nama || p.nama || "").toLowerCase()
        return pName.includes(cleanName) || cleanName.includes(pName)
      })
      if (found) return found
    }

    // 3. Fallback akun login (jika diakses dari portal psikolog)
    if (typeof window !== "undefined") {
      try {
        const savedUser = localStorage.getItem("auth_user")
        if (savedUser) {
          const parsed = JSON.parse(savedUser)
          const found = psikologList.find(
            (p) => p.id === parsed.id || p.id_account === parsed.id || p.account?.id === parsed.id
          )
          if (found) return found
        }
      } catch {}
    }

    // 4. Fallback ke entri psikolog pertama jika ada
    if (psikologList.length > 0) {
      return psikologList[0]
    }

    return null
  }, [session, isAsesmenSession, psikologList])

  const resolvedPsikologId = resolvedPsikolog?.id || session?.idPsikolog || ""
  const resolvedPsikologName =
    resolvedPsikolog?.nama_gelar ||
    resolvedPsikolog?.account?.nama ||
    resolvedPsikolog?.nama ||
    (session?.psikolog && session.psikolog !== "Tenaga Ahli" ? session.psikolog : "Psikolog Empathika")

  // Sinkronkan state tanggal dan waktu saat sesi berganti
  useEffect(() => {
    if (session) {
      const initDate = session.date || session.tanggal || tomorrowKey
      setNewDate(initDate)
      const cleanWaktu = (session.waktu || "").replace(/\s*WIB/i, "").trim()
      setNewWaktu(cleanWaktu || DEFAULT_ASESMEN_TIME_SLOTS[0])
      setAlasan("")
      setErrorMsg(null)
    }
  }, [session, tomorrowKey])

  // Ambil slot jadwal resmi yang dibuka oleh psikolog terpilih (HANYA untuk Konseling)
  useEffect(() => {
    if (!session || isAsesmenSession || !resolvedPsikologId || !newDate) return

    let isMounted = true
    const fetchSlots = async () => {
      setIsLoadingSlots(true)
      try {
        const [slotsForDate, allSlots] = await Promise.all([
          psikologService.getJadwalTersedia({
            id_psikolog: resolvedPsikologId,
            tanggal: newDate,
            tipe_jadwal: "KONSULTASI",
          }),
          psikologService.getJadwalTersedia({
            id_psikolog: resolvedPsikologId,
            tipe_jadwal: "KONSULTASI",
          }),
        ])

        if (!isMounted) return

        const rawDateSlots = Array.isArray(slotsForDate) ? slotsForDate : []
        const rawAllSlots = Array.isArray(allSlots) ? allSlots : []

        // FILTER JAM YANG SUDAH LEWAT:
        // Jika hari ini dan jam mulainya sudah lewat, atau tanggal lampau, jangan tampilkan!
        const activeDateSlots = rawDateSlots.filter((s) => !isSlotPassed(s))
        const activeAllSlots = rawAllSlots.filter((s) => !isSlotPassed(s))

        setAvailableSlots(activeDateSlots)
        setAllPsikologSlots(activeAllSlots)

        if (activeDateSlots.length > 0) {
          // Cari apakah jam yang sedang dipilih ada dalam slot tanggal baru
          const matching = activeDateSlots.find((s) => {
            const label = getSlotTimeLabel(s)
            const cleanLabel = label.replace(/\s*WIB/i, "").trim()
            const cleanCurrent = (newWaktu || session?.waktu || "").replace(/\s*WIB/i, "").trim()
            return cleanLabel === cleanCurrent
          })

          if (matching) {
            setNewWaktu(getSlotTimeLabel(matching))
          } else {
            // Default ke slot pertama yang dibuka psikolog
            setNewWaktu(getSlotTimeLabel(activeDateSlots[0]))
          }
        } else {
          setNewWaktu("")
        }
      } catch (err) {
        console.warn("Gagal mengambil slot psikolog:", err)
        if (isMounted) {
          setAvailableSlots([])
          setAllPsikologSlots([])
          setNewWaktu("")
        }
      } finally {
        if (isMounted) setIsLoadingSlots(false)
      }
    }

    fetchSlots()
    return () => {
      isMounted = false
    }
  }, [session, isAsesmenSession, resolvedPsikologId, newDate])

  // Pemetaan opsi slot jam yang dibuka oleh psikolog (untuk Konseling)
  const timeSlotOptions = useMemo(() => {
    const map = new Map<string, { allowsOnline: boolean; allowsOffline: boolean }>()

    availableSlots.forEach((slot) => {
      const label = getSlotTimeLabel(slot)
      const current = map.get(label) || { allowsOnline: false, allowsOffline: false }

      const m = (slot.metode || "").toUpperCase()
      if (m.includes("KEDUANYA") || (m.includes("ONLINE") && m.includes("OFFLINE")) || m === "SEMUA") {
        current.allowsOnline = true
        current.allowsOffline = true
      } else if (m.includes("OFFLINE")) {
        current.allowsOffline = true
      } else {
        current.allowsOnline = true
      }

      map.set(label, current)
    })

    return Array.from(map.entries()).map(([label, opts]) => {
      let metodeLabel = ""
      if (opts.allowsOnline && opts.allowsOffline) {
        metodeLabel = "[Online & Offline]"
      } else if (opts.allowsOffline) {
        metodeLabel = "[Offline]"
      } else {
        metodeLabel = "[Online]"
      }
      return {
        label,
        metodeLabel,
      }
    })
  }, [availableSlots])

  // Opsi jam bebas untuk Asesmen (admin leluasa menentukan jadwal)
  const asesmenTimeSlots = useMemo(() => {
    const now = new Date()
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    const isToday = newDate === todayKey
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const cleanCurrent = (session?.waktu || "").replace(/\s*WIB/i, "").trim()
    const baseList = cleanCurrent && !DEFAULT_ASESMEN_TIME_SLOTS.includes(cleanCurrent)
      ? [cleanCurrent, ...DEFAULT_ASESMEN_TIME_SLOTS]
      : DEFAULT_ASESMEN_TIME_SLOTS

    if (!isToday) return baseList

    // Jika hari ini: filter jam yang sudah lewat
    return baseList.filter((timeStr) => {
      const startParts = timeStr.split("-")[0].trim().split(":")
      if (startParts.length >= 2) {
        const slotStartMinutes = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10)
        return slotStartMinutes > currentMinutes
      }
      return true
    })
  }, [session?.waktu, newDate])

  // Daftar tanggal yang memiliki slot dibuka oleh psikolog ini
  const datesWithSlots = useMemo(() => {
    const dates = allPsikologSlots
      .map((s) => s.tanggal)
      .filter((t): t is string => Boolean(t))
    return Array.from(new Set(dates)).sort()
  }, [allPsikologSlots])

  // Jumlah slot ketersediaan per tanggal
  const slotsCountByDate = useMemo(() => {
    const map: Record<string, number> = {}
    allPsikologSlots.forEach((s) => {
      if (s.tanggal) {
        map[s.tanggal] = (map[s.tanggal] || 0) + 1
      }
    })
    return map
  }, [allPsikologSlots])

  if (!session) return null

  const cleanSessionWaktu = (session.waktu || "").replace(/\s*WIB/i, "").trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDate) {
      setErrorMsg("Silakan pilih tanggal jadwal baru.")
      return
    }

    if (!isAsesmenSession && (!newWaktu || availableSlots.length === 0)) {
      setErrorMsg("Tidak dapat menjadwalkan reschedule: Jam baru harus dipilih dari slot ketersediaan resmi yang dibuka oleh psikolog.")
      return
    }

    if (isAsesmenSession && !newWaktu) {
      setErrorMsg("Silakan pilih jam jadwal baru.")
      return
    }

    const oldDate = session.date || session.tanggal
    const cleanOldWaktu = (session.waktu || "").replace(/\s*WIB/i, "").trim()
    const cleanNewWaktu = (newWaktu || "").replace(/\s*WIB/i, "").trim()

    if (newDate === oldDate && cleanNewWaktu === cleanOldWaktu) {
      setErrorMsg("Jadwal baru tidak boleh sama persis dengan jadwal sebelumnya.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      const finalWaktu = newWaktu.replace(/\s*WIB/i, "").trim()
      await onConfirmReschedule(session.id, newDate, finalWaktu, alasan.trim())
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal melakukan reschedule sesi. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 sm:p-7 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                Reschedule Sesi {isAsesmenSession ? "Asesmen" : "Konseling"}
              </h3>
              <p className="text-xs text-gray-500">
                {isAsesmenSession
                  ? "Atur jadwal ulang sesi asesmen ke tanggal & jam baru"
                  : "Pindahkan jadwal sesi ke tanggal & jam baru sesuai slot psikolog"}
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

        {/* Ringkasan Sesi Lama */}
        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Klien:
            </span>
            <span className="font-bold text-gray-900">{session.namaKlien}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500">Layanan:</span>
            <span className="font-bold text-gray-800">{session.layanan || (isAsesmenSession ? "Asesmen Psikologi" : "Konsultasi")}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Jadwal Saat Ini:
            </span>
            <span className="font-bold text-gray-800">
              {session.date || session.tanggal || "Hari Ini"} ({cleanSessionWaktu ? `${cleanSessionWaktu} WIB` : "-"})
            </span>
          </div>

          {/* Hanya tampilkan Tenaga Ahli jika Konseling */}
          {!isAsesmenSession && (
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-500">Tenaga Ahli:</span>
              <span className="font-bold text-[#561269]">
                {isLoadingPsikolog && !resolvedPsikologName ? "Memuat..." : resolvedPsikologName}
              </span>
            </div>
          )}
        </div>

        {/* Form Reschedule */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tanggal Baru */}
          {isAsesmenSession ? (
            /* Desain Awal untuk Asesmen: Input Tanggal Bebas */
            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5D205E]" />
                Tanggal Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-gray-900 font-medium cursor-pointer"
                required
              />
            </div>
          ) : (
            /* Desain Dinamis untuk Konseling: Kalender Mini dengan Penanda Slot Psikolog */
            <div>
              <DatePickerMiniCalendar
                label="Tanggal Baru"
                required
                value={newDate}
                onChange={(newVal) => setNewDate(newVal)}
                datesWithSlots={datesWithSlots}
                slotsCountByDate={slotsCountByDate}
                minDate={todayStr}
                colorTheme="amber"
              />
            </div>
          )}

          {/* Kotak Peringatan jika Slot Belum Dibuka oleh Psikolog pada Tanggal Tersebut (HANYA Konseling) */}
          {!isAsesmenSession && availableSlots.length === 0 && !isLoadingSlots && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs animate-fadeIn">
              <div className="flex items-center gap-2 font-bold mb-1 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Slot Belum Dibuka Oleh Psikolog</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>{resolvedPsikologName || "Psikolog ini"}</strong> belum membuka jadwal slot ketersediaan pada tanggal{" "}
                <strong>{newDate}</strong>. Jadwal reschedule harus menyesuaikan slot yang dibuka oleh psikolog tersebut.
              </p>
              {datesWithSlots.length > 0 ? (
                <div className="mt-2.5 text-[11px]">
                  <span className="font-semibold text-gray-700">Pilih tanggal lain yang telah dibuka oleh psikolog ini: </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {datesWithSlots.slice(0, 6).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setNewDate(d)}
                        className="px-2.5 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-950 font-bold transition cursor-pointer text-[10px]"
                      >
                        📅 {d}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-1.5 text-[11px] text-gray-500 italic">
                  (Psikolog ini belum membuka slot konsultasi apapun di kalender portalnya)
                </p>
              )}
            </div>
          )}

          {/* Pilih Jam Baru */}
          {isAsesmenSession ? (
            /* Desain Awal untuk Asesmen: Dropdown Jam Lengkap Bebas Dipilih Admin */
            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5D205E]" />
                Pilih Jam Baru <span className="text-rose-500">*</span>
              </label>
              <select
                value={newWaktu}
                onChange={(e) => setNewWaktu(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-medium cursor-pointer"
                required
              >
                {asesmenTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} WIB
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Desain Dinamis untuk Konseling: Jam Berdasarkan Slot Terbuka Psikolog */
            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5D205E]" />
                  Pilih Jam Baru <span className="text-rose-500">*</span>
                </span>
                {isLoadingSlots && (
                  <span className="text-[10px] text-gray-400 font-normal">Memeriksa slot dibuka psikolog...</span>
                )}
              </label>
              <select
                value={newWaktu}
                onChange={(e) => setNewWaktu(e.target.value)}
                disabled={isLoadingSlots || timeSlotOptions.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-gray-900 font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                required
              >
                {isLoadingSlots ? (
                  <option value="">Memeriksa slot dibuka psikolog...</option>
                ) : timeSlotOptions.length === 0 ? (
                  <option value="">Tidak ada slot dibuka oleh psikolog pada tanggal ini</option>
                ) : (
                  timeSlotOptions.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label} {opt.metodeLabel}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Alasan Reschedule */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Alasan Reschedule (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Permohonan klien / Penyesuaian jadwal"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-xs text-gray-900"
            />
          </div>

          {/* Info Banner Kebijakan H-3 Jam */}
          <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Ketentuan Reschedule (Maksimal H-3 Jam):</strong> Pengajuan reschedule sesi hanya dapat dilakukan maksimal 3 jam sebelum jadwal sesi saat ini dimulai.
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !newDate ||
                !newWaktu ||
                (!isAsesmenSession && (isLoadingSlots || availableSlots.length === 0))
              }
              className="flex-1 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Reschedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
