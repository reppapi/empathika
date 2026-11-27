"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { psikologService } from "@/services/psikolog.service"
import { adminService } from "@/services/admin.service"
import {
  getCancelledSessions,
  isSessionCancelled,
  getRescheduledSessions,
} from "@/features/konseling/utils/cancellationSync"
import { BookedSession, MetodeKonsultasi } from "../../components/psikolog/types"
import { formatDateKey, matchPsikologSession } from "../../components/psikolog/utils/psikologDateUtils"

interface ScheduleDataProps {
  user: any
  resolveActivePsikolog: () => any
  activePsikolog: any
  setActivePsikolog: React.Dispatch<React.SetStateAction<any>>
  resolvedPsikologId: string
  resolvedPsikologName: string
  resolvedAccountId: string
  date: Date | undefined
  currentWeekMonday: Date
  deletedCustomSlots: string[]
  setTimeSlots: React.Dispatch<React.SetStateAction<string[]>>
}

const INITIAL_BOOKINGS: BookedSession[] = []

export function usePsikologScheduleData({
  user,
  resolveActivePsikolog,
  activePsikolog,
  setActivePsikolog,
  resolvedPsikologId,
  resolvedPsikologName,
  resolvedAccountId,
  date,
  currentWeekMonday,
  deletedCustomSlots,
  setTimeSlots,
}: ScheduleDataProps) {
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>(INITIAL_BOOKINGS)
  const isFetchingRef = useRef(false)

  // Indikator tanggal yang sudah memiliki jadwal aktif
  const datesWithSchedules = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`

    const dates: Date[] = []
    const dateSet = new Set<string>()
    bookedSessions.forEach((s) => {
      if ((s as any).tipe_jadwal === "ASESMEN" || (s.layanan || "").toLowerCase().includes("asesmen")) return

      if (s.date && s.date >= todayKey && !s.isCancelled && s.status !== "Dibatalkan") {
        dateSet.add(s.date)
      }
    })
    dateSet.forEach((dateStr) => {
      const parts = dateStr.split("-").map(Number)
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const d = new Date(parts[0], parts[1] - 1, parts[2])
        d.setHours(0, 0, 0, 0)
        if (d >= today) {
          dates.push(d)
        }
      }
    })
    return dates
  }, [bookedSessions])

  // Sinkronkan jadwal dari Database PostgreSQL, Admin Overview, dan LocalStorage
  const loadScheduleForPsikolog = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const currentPsi = resolveActivePsikolog()
      const effectivePsikologId = currentPsi?.id || ""
      const effectivePsikologName =
        currentPsi?.nama_gelar || (currentPsi as any)?.account?.nama || user?.name || "Tenaga Ahli"

      let res: any = null
      try {
        res = await psikologService.getJadwalSaya({ id_psikolog: effectivePsikologId })
      } catch (err: any) {
        console.warn("Notice getJadwalSaya notice:", err?.message)
      }

      if (res && res.psikolog) {
        setActivePsikolog(res.psikolog)
        if (typeof window !== "undefined") {
          localStorage.setItem("active_psikolog_id", res.psikolog.id)
          localStorage.setItem("active_psikolog_name", res.psikolog.nama_gelar)
          if (res.psikolog.kategori) {
            localStorage.setItem("active_psikolog_kategori", res.psikolog.kategori)
          }
        }
      } else if (!activePsikolog && currentPsi) {
        setActivePsikolog(currentPsi)
      }

      const sessionMap = new Map<string, BookedSession>()

      if (res && res.slots && Array.isArray(res.slots)) {
        res.slots.forEach((s: any) => {
          if ((s.tipe_jadwal || "").toUpperCase() === "ASESMEN") return

          const mapKey = `${s.date}_${s.waktu}`
          const isCancelled =
            Boolean(s.is_cancelled) ||
            s.booking?.is_cancelled ||
            s.booking?.status_booking === "CANCELLED" ||
            s.status === "Dibatalkan"
          const isAvailable = s.status === "TERSEDIA" || isCancelled
          const hasActiveBooking = Boolean(
            s.booking &&
              !isCancelled &&
              s.booking.nama_klien &&
              s.booking.nama_klien.toLowerCase() !== "tersedia"
          )
          const clientPhone = s.booking?.no_telepon_klien || s.booking?.kontak || undefined

          const existing = sessionMap.get(mapKey)
          if (!existing || (existing.isAvailableSlot && hasActiveBooking)) {
            sessionMap.set(mapKey, {
              id: s.id,
              date: s.date,
              waktu: s.waktu,
              layanan: isAvailable ? "Slot Tersedia" : s.booking?.layanan || "Konsultasi Psikologi",
              metode: (s.booking?.metode
                ? s.booking.metode === "OFFLINE"
                  ? "Offline"
                  : "Online"
                : s.metode === "OFFLINE"
                ? "Offline"
                : s.metode === "KEDUANYA"
                ? "Keduanya"
                : "Online") as MetodeKonsultasi,
              namaKlien: isAvailable ? "Tersedia" : s.booking?.nama_klien || "Tersedia",
              kontak: isAvailable ? undefined : clientPhone,
              klienId: isAvailable ? undefined : s.booking?.klien_id,
              catatan: isAvailable ? undefined : s.booking?.deskripsi_trauma,
              id_psikolog: res.psikolog?.id || effectivePsikologId,
              namaPsikolog: res.psikolog?.nama_gelar || effectivePsikologName,
              isAvailableSlot: isAvailable,
              isCancelled: false,
              status: isAvailable ? "TERSEDIA" : "Aktif",
            })
          }
        })
      }

      try {
        const adminRes: any = await adminService.getJadwal({ date: date ? formatDateKey(date) : undefined })
        if (adminRes) {
          if (Array.isArray(adminRes.todaySessions)) {
            adminRes.todaySessions.forEach((t: any) => {
              if (
                (t.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
                (t.layanan || "").toLowerCase().includes("asesmen")
              )
                return

              const isMatch = matchPsikologSession(
                { idPsikolog: t.idPsikolog || t.id_psikolog, psikolog: t.psikolog },
                resolvedPsikologId,
                resolvedPsikologName,
                resolvedAccountId
              )

              if (isMatch && t.tanggal && t.waktuRange) {
                const mapKey = `${t.tanggal}_${t.waktuRange}`
                const isCancelled =
                  t.status === "Dibatalkan" || t.status === "Dibatalkan (Refund)" || Boolean(t.isCancelled)
                const hasActiveBooking =
                  Boolean(t.namaKlien && t.namaKlien.toLowerCase() !== "tersedia") && !isCancelled
                const existing = sessionMap.get(mapKey)

                if (!existing || (existing.isAvailableSlot && hasActiveBooking)) {
                  sessionMap.set(mapKey, {
                    id: t.id,
                    date: t.tanggal,
                    waktu: t.waktuRange,
                    layanan: t.layanan || "Konsultasi Psikologi",
                    metode: t.tipe?.includes("Offline") ? "Offline" : "Online",
                    namaKlien: isCancelled ? "Tersedia" : t.namaKlien || "",
                    kontak: isCancelled ? "" : t.kontak || "",
                    klienId: isCancelled ? "" : t.klienId || "",
                    catatan: isCancelled ? undefined : t.catatan,
                    id_psikolog: t.idPsikolog || resolvedPsikologId,
                    namaPsikolog: t.psikolog || resolvedPsikologName,
                    isAvailableSlot: isCancelled,
                    isCancelled: false,
                    status: isCancelled ? "TERSEDIA" : t.status,
                  })
                }
              }
            })
          }

          if (Array.isArray(adminRes.weeklyGrid)) {
            adminRes.weeklyGrid.forEach((w: any) => {
              if (
                (w.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
                (w.layanan || "").toLowerCase().includes("asesmen")
              )
                return

              const isMatch = matchPsikologSession(
                { id_psikolog: w.id_psikolog, psikologName: w.psikologName },
                resolvedPsikologId,
                resolvedPsikologName,
                resolvedAccountId
              )

              if (isMatch && w.date && w.timeSlot) {
                const mapKey = `${w.date}_${w.timeSlot}`
                const isBookingCancelled =
                  w.status === "Dibatalkan" ||
                  Boolean(w.isCancelled) ||
                  (w as any).booking_status === "CANCELLED"
                const hasActiveBooking =
                  Boolean(w.clientName && w.clientName.toLowerCase() !== "tersedia") && !isBookingCancelled
                const isAvailable =
                  (w.statusSlot === "TERSEDIA" && (!w.clientName || w.clientName === "Tersedia")) ||
                  isBookingCancelled
                const clientPhone = w.kontak || w.no_telepon || undefined
                const existing = sessionMap.get(mapKey)

                if (!existing || (existing.isAvailableSlot && hasActiveBooking)) {
                  sessionMap.set(mapKey, {
                    id: w.id,
                    date: w.date,
                    waktu: w.timeSlot,
                    layanan: isAvailable ? "Slot Tersedia" : w.layanan || "Konsultasi Psikologi",
                    metode: w.metode === "Offline" ? "Offline" : w.metode === "Keduanya" ? "Keduanya" : "Online",
                    namaKlien: isAvailable ? "Tersedia" : w.clientName || w.namaKlien || "",
                    kontak: isAvailable ? undefined : clientPhone,
                    klienId: isAvailable ? undefined : w.klienId || undefined,
                    catatan: isAvailable ? undefined : w.catatan,
                    id_psikolog: resolvedPsikologId,
                    namaPsikolog: w.psikologName || resolvedPsikologName,
                    isAvailableSlot: isAvailable,
                    isCancelled: false,
                    status: isAvailable ? "TERSEDIA" : "Aktif",
                  })
                }
              }
            })
          }
        }
      } catch (err: any) {
        console.warn("Notice loading admin weekly sessions fallback:", err?.message)
      }

      try {
        const raw = localStorage.getItem("empathika_custom_jadwal_slots")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            parsed.forEach((s: any) => {
              if (
                (s.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
                (s.layanan || "").toLowerCase().includes("asesmen")
              )
                return

              const isMatch = matchPsikologSession(
                { id_psikolog: s.id_psikolog, nama_psikolog: s.nama_psikolog },
                resolvedPsikologId,
                resolvedPsikologName,
                resolvedAccountId
              )

              if (isMatch && s.tanggal && s.jam_mulai) {
                const timeStr =
                  s.label_waktu ||
                  `${s.jam_mulai.substring(0, 5)} - ${(s.jam_selesai || "10:00").substring(0, 5)}`
                const mapKey = `${s.tanggal}_${timeStr}`
                if (!sessionMap.has(mapKey)) {
                  const isTersedia = (s.status || "TERSEDIA").toUpperCase() === "TERSEDIA"
                  sessionMap.set(mapKey, {
                    id: s.id,
                    date: s.tanggal,
                    waktu: timeStr,
                    layanan: s.layanan || "Konseling Individu",
                    metode: s.metode === "Offline" ? "Offline" : s.metode === "Keduanya" ? "Keduanya" : "Online",
                    namaKlien: isTersedia ? "Tersedia" : s.namaKlien || "",
                    id_psikolog: s.id_psikolog || resolvedPsikologId,
                    namaPsikolog: s.nama_psikolog || resolvedPsikologName,
                    isAvailableSlot: isTersedia,
                    status: s.status || "TERSEDIA",
                  })
                }
              }
            })
          }
        }
      } catch { }

      try {
        const cancelledList = getCancelledSessions()
        if (cancelledList.length > 0) {
          sessionMap.forEach((item, key) => {
            if (isSessionCancelled(item, cancelledList)) {
              sessionMap.set(key, {
                ...item,
                isCancelled: false,
                isAvailableSlot: true,
                namaKlien: "Tersedia",
                status: "TERSEDIA",
              })
            }
          })
        }
      } catch { }

      try {
        const rescheduledList = getRescheduledSessions()
        if (rescheduledList.length > 0) {
          rescheduledList.forEach((r) => {
            if (!r.date || !r.waktu) return

            const isMatch = matchPsikologSession(
              { id_psikolog: r.idPsikolog, psikologName: r.psikolog },
              resolvedPsikologId,
              resolvedPsikologName,
              resolvedAccountId
            )

            if (!r.psikolog || isMatch) {
              const oldKey = `${r.date}_${r.waktu}`
              const existing = sessionMap.get(oldKey)

              sessionMap.set(oldKey, {
                id: r.id || existing?.id || `resched-${r.date}-${r.waktu}`,
                date: r.date,
                waktu: r.waktu,
                layanan: r.layanan || existing?.layanan || "Konsultasi Psikologi",
                metode: (r.metode === "Offline"
                  ? "Offline"
                  : r.metode === "Keduanya"
                  ? "Keduanya"
                  : existing?.metode || "Online") as MetodeKonsultasi,
                namaKlien: r.namaKlien || existing?.namaKlien || "",
                kontak: existing?.kontak || undefined,
                klienId: existing?.klienId || undefined,
                catatan: existing?.catatan,
                id_psikolog: r.idPsikolog || resolvedPsikologId,
                namaPsikolog: r.psikolog || resolvedPsikologName,
                isAvailableSlot: false,
                status: "Reschedule",
                isRescheduled: true,
              })

              if (r.newDate && r.newWaktu) {
                const newKey = `${r.newDate}_${r.newWaktu}`
                const existingNew = sessionMap.get(newKey)
                sessionMap.set(newKey, {
                  id: r.id || existingNew?.id || `resched-new-${r.newDate}-${r.newWaktu}`,
                  date: r.newDate,
                  waktu: r.newWaktu,
                  layanan:
                    r.layanan || existingNew?.layanan || existing?.layanan || "Konsultasi Psikologi",
                  metode: (r.metode === "Offline"
                    ? "Offline"
                    : r.metode === "Keduanya"
                    ? "Keduanya"
                    : existingNew?.metode || existing?.metode || "Online") as MetodeKonsultasi,
                  namaKlien:
                    r.namaKlien || existingNew?.namaKlien || existing?.namaKlien || "Klien Terdaftar",
                  kontak: existingNew?.kontak || existing?.kontak,
                  klienId: existingNew?.klienId || existing?.klienId,
                  catatan: existingNew?.catatan || existing?.catatan,
                  id_psikolog: r.idPsikolog || resolvedPsikologId,
                  namaPsikolog: r.psikolog || resolvedPsikologName,
                  isAvailableSlot: false,
                  status: "Aktif",
                  isRescheduled: false,
                })
              }
            }
          })
        }
      } catch (err) {
        console.warn("Gagal menerapkan status reschedule:", err)
      }

      const allSessions = Array.from(sessionMap.values())
      setBookedSessions(allSessions)

      allSessions.forEach((s) => {
        if (s.waktu && !deletedCustomSlots.includes(s.waktu)) {
          setTimeSlots((prev) => (prev.includes(s.waktu) ? prev : [...prev, s.waktu].sort()))
        }
      })
    } catch (err: any) {
      console.warn("Notice loading schedule:", err?.message)
    } finally {
      isFetchingRef.current = false
    }
  }, [
    date,
    deletedCustomSlots,
    user,
    resolveActivePsikolog,
    activePsikolog,
    resolvedPsikologId,
    resolvedPsikologName,
    resolvedAccountId,
    setActivePsikolog,
    setTimeSlots,
  ])

  useEffect(() => {
    loadScheduleForPsikolog()
  }, [loadScheduleForPsikolog, currentWeekMonday])

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
            return { ...s, isCancelled: false, isAvailableSlot: true, namaKlien: "Tersedia", status: "TERSEDIA" }
          }
          return s
        })
      )
    }

    const handleAutoRefetch = () => {
      loadScheduleForPsikolog()
    }

    handleSyncCancelled()
    window.addEventListener("storage", handleSyncCancelled)
    window.addEventListener("storage", loadScheduleForPsikolog)
    window.addEventListener("empathika_session_cancelled", handleSyncCancelled as EventListener)
    window.addEventListener("empathika_session_rescheduled", loadScheduleForPsikolog as EventListener)
    window.addEventListener("empathika_booking_created", handleAutoRefetch as EventListener)
    window.addEventListener("focus", handleAutoRefetch)
    document.addEventListener("visibilitychange", handleAutoRefetch)

    const pollInterval = setInterval(handleAutoRefetch, 12000)

    return () => {
      window.removeEventListener("storage", handleSyncCancelled)
      window.removeEventListener("storage", loadScheduleForPsikolog)
      window.removeEventListener("empathika_session_cancelled", handleSyncCancelled as EventListener)
      window.removeEventListener("empathika_session_rescheduled", loadScheduleForPsikolog as EventListener)
      window.removeEventListener("empathika_booking_created", handleAutoRefetch as EventListener)
      window.removeEventListener("focus", handleAutoRefetch)
      document.removeEventListener("visibilitychange", handleAutoRefetch)
      clearInterval(pollInterval)
    }
  }, [loadScheduleForPsikolog])

  return {
    bookedSessions,
    setBookedSessions,
    datesWithSchedules,
    loadScheduleForPsikolog,
  }
}
