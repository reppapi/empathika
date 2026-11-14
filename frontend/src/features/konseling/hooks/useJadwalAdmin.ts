"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { adminService } from "@/services/admin.service"
import {
  recordCancelledSession,
  getCancelledSessions,
  isSessionCancelled,
  canCancelSession,
} from "@/features/konseling/utils/cancellationSync"

import {
  BookedAssessment,
  ClientSessionToday,
  ClientSessionStatus,
} from "@/features/konseling/types"
import {
  WEEK_VARIATIONS,
  parseTimeRangeMinutes,
  getMonday,
  formatDateKey,
  formatWhatsAppMessage,
  formatWhatsAppPsikologReminder,
} from "@/features/konseling/data/jadwalAdminData"

import { NewSessionData } from "@/features/dashboard/components/admin/ModalTambahSesi"
import { useAuthStore } from "@/store/authStore"

export function useJadwalAdmin(options?: { isBiroContext?: boolean }) {
  const isBiroContext = options?.isBiroContext ?? false
  const { user } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  const layananParam = searchParams ? (searchParams.get("layanan") || searchParams.get("filter")) : null
  const statusParam = searchParams ? searchParams.get("status") : null
  const dateParam = searchParams ? searchParams.get("date") : null

  const getInitialDate = () => {
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const parsed = new Date(dateParam + "T00:00:00")
      if (!isNaN(parsed.getTime())) return parsed
    }
    return new Date()
  }

  // ── 1. State & Refs ──
  const [date, setDate] = useState<Date | undefined>(getInitialDate)
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(getInitialDate()))
  const [bookedSessions, setBookedSessions] = useState<BookedAssessment[]>([])
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null)

  // State Sesi Klien Hari Ini (Murni dari Database)
  const [todaySessions, setTodaySessions] = useState<ClientSessionToday[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [selectedDetailSession, setSelectedDetailSession] = useState<ClientSessionToday | null>(null)
  const [sessionToCancel, setSessionToCancel] = useState<ClientSessionToday | null>(null)
  const [actionToast, setActionToast] = useState<{ message: string; type: "success" | "danger" } | null>(null)

  // State Modal Tambah Sesi
  const [isModalOpen, setIsModalOpen] = useState(false)

  // State Filter Layanan, Status, & Tanggal
  const [selectedLayanan, setSelectedLayanan] = useState<string>(layananParam || "Semua Layanan")
  const [selectedStatus, setSelectedStatus] = useState<string>(statusParam || "semua")
  const [isLayananDropdownOpen, setIsLayananDropdownOpen] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Sinkronkan state saat URL query param berubah (Back / Forward browser)
  useEffect(() => {
    const lp = searchParams ? (searchParams.get("layanan") || searchParams.get("filter")) : null
    if (lp !== null && lp !== undefined) {
      setSelectedLayanan(lp || "Semua Layanan")
    }
    const sp = searchParams ? searchParams.get("status") : null
    if (sp !== null && sp !== undefined) {
      setSelectedStatus(sp || "semua")
    }
    const dp = searchParams ? searchParams.get("date") : null
    if (dp && /^\d{4}-\d{2}-\d{2}$/.test(dp)) {
      const parsed = new Date(dp + "T00:00:00")
      if (!isNaN(parsed.getTime())) {
        setDate(parsed)
        setCurrentWeekMonday(getMonday(parsed))
      }
    }
  }, [searchParams])

  // Helper update URL query param tanpa reload halaman
  const updateUrlParams = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === "semua" || val === "Semua Layanan") {
        params.delete(key)
      } else {
        params.set(key, val)
      }
    })
    const qs = params.toString()
    const targetUrl = qs ? `/admin/jadwal?${qs}` : "/admin/jadwal"
    router.replace(targetUrl as any, { scroll: false })
  }

  const handleLayananChange = (newLayanan: string) => {
    setSelectedLayanan(newLayanan)
    updateUrlParams({ layanan: newLayanan })
  }

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
    updateUrlParams({ status: newStatus })
  }

  // ── 2. Toast Trigger & Action Handlers ──
  const triggerToast = (message: string, type: "success" | "danger" = "success") => {
    setActionToast({ message, type })
    setTimeout(() => setActionToast(null), 3500)
  }

  const handleCopyWhatsAppMessage = (session: ClientSessionToday) => {
    const text = formatWhatsAppMessage(session)
    navigator.clipboard.writeText(text)
    triggerToast(`Pesan jadwal untuk ${session.namaKlien} berhasil disalin ke clipboard!`, "success")
  }

  const handleCopyWhatsAppPsikologMessage = (session: ClientSessionToday) => {
    const text = formatWhatsAppPsikologReminder(session)
    navigator.clipboard.writeText(text)
    triggerToast(`Pesan pengingat jadwal untuk ${session.psikolog} berhasil disalin!`, "success")
  }

  const handleMarkCompleted = async (id: string, namaKlien: string) => {
    try {
      await adminService.updateBookingStatus(id, "COMPLETED")
    } catch (err: any) {
      console.warn("Update status error:", err?.response?.data?.message || err.message)
    }
    setTodaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Selesai", isUpcomingNearest: false } : s))
    )
    triggerToast(`Sesi ${namaKlien} berhasil ditandai Selesai!`, "success")
    fetchJadwalData()
  }

  const handleCancelSession = async (id: string, namaKlien: string) => {
    const targetToday = todaySessions.find((s) => s.id === id)
    const targetBooked = bookedSessions.find((s) => s.id === id)
    const targetCombined = currentWeekAllSessions.find((s) => s.id === id)

    const dateKey =
      (targetBooked && targetBooked.date) ||
      (targetCombined && targetCombined.date) ||
      targetToday?.date ||
      formatDateKey(date || new Date())

    // Validasi aturan bisnis: Pembatalan hanya bisa dilakukan sebelum hari H (maksimal H-1)
    if (!canCancelSession(dateKey)) {
      triggerToast(
        "Pembatalan tidak dapat dilakukan pada hari H konseling. Pembatalan hanya dapat dilakukan sebelum hari H.",
        "danger"
      )
      return
    }

    const waktu = targetToday?.waktu || targetBooked?.waktu || targetCombined?.waktu || ""
    const psikolog = targetToday?.psikolog || targetBooked?.psikolog || targetCombined?.psikolog || ""

    try {
      await adminService.updateBookingStatus(id, "CANCELLED")
    } catch (err: any) {
      console.warn("Cancel status error:", err?.response?.data?.message || err.message)
    }

    recordCancelledSession({
      id,
      date: dateKey,
      waktu,
      namaKlien,
      psikolog,
    })

    setTodaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Dibatalkan", isUpcomingNearest: false } : s))
    )

    setBookedSessions((prev) =>
      prev.map((b) =>
        b.id === id || (b.date === dateKey && b.waktu === waktu)
          ? { ...b, status: "Dibatalkan" }
          : b
      )
    )

    // Kembalikan slot ke localStorage empathika_custom_jadwal_slots agar langsung muncul kembali di halaman client
    try {
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      const currentSlots: any[] = raw ? JSON.parse(raw) : []
      const time5 = (waktu || "").replace("WIB", "").trim().split("-")[0].trim().substring(0, 5)
      const end5 = (waktu || "").includes("-")
        ? (waktu || "").split("-")[1].replace("WIB", "").trim().substring(0, 5)
        : ""

      const alreadyExists = currentSlots.some(
        (s: any) =>
          s.tanggal === dateKey &&
          (s.jam_mulai || "").trim().substring(0, 5) === time5
      )

      if (!alreadyExists && time5) {
        currentSlots.push({
          id: id || `slot-restored-${Date.now()}`,
          tanggal: dateKey,
          jam_mulai: time5,
          jam_selesai: end5 || "10:00",
          nama_psikolog: psikolog,
          id_psikolog: targetToday?.idPsikolog || undefined,
          status: "TERSEDIA",
          tipe_jadwal: "KONSULTASI",
          metode:
            targetToday?.tipe?.includes("Online")
              ? "Online"
              : targetToday?.tipe?.includes("Offline")
              ? "Offline"
              : "Keduanya",
        })
        localStorage.setItem(
          "empathika_custom_jadwal_slots",
          JSON.stringify(currentSlots)
        )
      } else if (alreadyExists && time5) {
        const updated = currentSlots.map((s: any) => {
          if (
            s.tanggal === dateKey &&
            (s.jam_mulai || "").trim().substring(0, 5) === time5
          ) {
            return { ...s, status: "TERSEDIA" }
          }
          return s
        })
        localStorage.setItem(
          "empathika_custom_jadwal_slots",
          JSON.stringify(updated)
        )
      }
      window.dispatchEvent(new Event("storage"))
    } catch (e) {
      console.warn("Gagal mengembalikan slot ke localStorage:", e)
    }

    triggerToast(`Sesi ${namaKlien} (${waktu}) telah dibatalkan.`, "danger")
    fetchJadwalData()
  }

  const handleSelectWeeklySession = (session: BookedAssessment) => {
    const converted: ClientSessionToday = {
      id: session.id,
      date: session.date,
      waktu: session.waktu,
      namaKlien: session.namaKlien || "Klien Terdaftar",
      klienId: "010" + Math.floor(100 + Math.random() * 900),
      psikolog: session.psikolog || "Tenaga Ahli",
      layanan: session.layanan,
      tipe: session.metode === "Online" ? "Online [Zoom]" : "Offline [Klinik]",
      status: session.status === "Dibatalkan" ? "Dibatalkan" : "Menunggu Jadwal",
    }
    setSelectedDetailSession(converted)
  }

  // ── 3. Filter Layanan & Derived Values ──
  const layananOptions = useMemo(() => {
    const defaultList = [
      "Semua Layanan",
      "Konseling",
      "Konseling Individu",
      "Konseling Pasangan",
      "Konseling Remaja",
      "Konseling Karir",
      "Konseling Pribadi",
      "Hipnoterapi",
      "Home Visit",
      "Asesmen",
      "Asesmen Klinis",
    ]
    const set = new Set<string>(defaultList)
    todaySessions.forEach((s) => {
      if (s.layanan) set.add(s.layanan.trim())
    })
    bookedSessions.forEach((b) => {
      if (b.layanan) set.add(b.layanan.trim())
    })
    WEEK_VARIATIONS.forEach((v) => {
      v.forEach((item) => {
        if (item.layanan) set.add(item.layanan.trim())
      })
    })
    return Array.from(set)
  }, [todaySessions, bookedSessions])

  const matchLayanan = (itemLayanan: string, filter: string) => {
    if (!filter || filter === "Semua Layanan" || filter === "semua") return true
    const itemNorm = (itemLayanan || "").trim().toLowerCase()
    const filterNorm = (filter || "").trim().toLowerCase()
    if (itemNorm === filterNorm) return true
    if (
      (filterNorm.includes("konseling") || filterNorm.includes("konsultasi")) &&
      (itemNorm.includes("konseling") || itemNorm.includes("konsultasi"))
    ) {
      return true
    }
    if (filterNorm.includes("asesmen") && itemNorm.includes("asesmen")) return true
    if (filterNorm.includes("hipnoterapi") && itemNorm.includes("hipnoterapi")) return true
    return itemNorm.includes(filterNorm)
  }

  const filteredTodaySessions = useMemo(() => {
    return todaySessions.filter((s) => {
      const matchLay = matchLayanan(s.layanan, selectedLayanan)
      if (!matchLay) return false
      if (selectedStatus === "berlangsung") {
        return s.status === "Sedang Berlangsung"
      }
      if (selectedStatus === "selesai") {
        return s.status === "Selesai"
      }
      if (selectedStatus === "menunggu") {
        return s.status === "Menunggu Jadwal" || s.status === "Segera Dimulai"
      }
      return true
    })
  }, [todaySessions, selectedLayanan, selectedStatus])

  const stats = useMemo(() => {
    const byLayanan = todaySessions.filter((s) => matchLayanan(s.layanan, selectedLayanan))
    const total = byLayanan.length
    const sedangBerlangsung = byLayanan.filter((s) => s.status === "Sedang Berlangsung").length
    const selesai = byLayanan.filter((s) => s.status === "Selesai").length
    const menunggu = byLayanan.filter(
      (s) => s.status === "Menunggu Jadwal" || s.status === "Segera Dimulai"
    ).length
    return { total, sedangBerlangsung, selesai, menunggu }
  }, [todaySessions, selectedLayanan])

  // ── 4. Calendar & Date Configurations ──
  const today = useMemo(() => new Date(), [])
  const formattedSelectedDate = useMemo(() => {
    const d = date || today
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
  }, [date, today])
  const formattedDate = formattedSelectedDate

  const datePickerValue = useMemo(() => {
    const d = date || today
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }, [date, today])

  // Helper menghitung status sesi secara dinamis berdasarkan jam lokal riil saat ini
  const applyTimeStatusToSessions = useCallback(
    (sessions: ClientSessionToday[], targetDateKey?: string): ClientSessionToday[] => {
      const now = new Date()
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      const activeDateKey = targetDateKey || todayKey
      const isTargetToday = activeDateKey === todayKey
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      let foundNearestStartMinutes: number | null = null

      return sessions.map((item) => {
        if (item.status === "Dibatalkan" || (item.status as string) === "Dibatalkan (Refund)") {
          return { ...item, isUpcomingNearest: false }
        }
        if (item.status === "Selesai") {
          return { ...item, isUpcomingNearest: false }
        }

        const sessionDateKey = item.date || item.tanggal || activeDateKey

        if (sessionDateKey < todayKey || (!isTargetToday && activeDateKey < todayKey)) {
          return { ...item, status: "Selesai" as const, isUpcomingNearest: false }
        }

        if (sessionDateKey > todayKey || (!isTargetToday && activeDateKey > todayKey)) {
          return { ...item, status: "Menunggu Jadwal" as const, isUpcomingNearest: false }
        }

        const { startMinutes, endMinutes } = parseTimeRangeMinutes(item.waktu)

        if (endMinutes && currentMinutes >= endMinutes) {
          return { ...item, status: "Selesai" as const, isUpcomingNearest: false }
        }

        if (startMinutes && endMinutes && currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          return {
            ...item,
            status: "Sedang Berlangsung" as const,
            isUpcomingNearest: false,
          }
        }

        if (startMinutes && currentMinutes < startMinutes) {
          if (foundNearestStartMinutes === null) {
            foundNearestStartMinutes = startMinutes
          }
          if (startMinutes === foundNearestStartMinutes) {
            return {
              ...item,
              status: "Segera Dimulai" as const,
              isUpcomingNearest: true,
            }
          }
          return {
            ...item,
            status: "Menunggu Jadwal" as const,
            isUpcomingNearest: false,
          }
        }

        return {
          ...item,
          status: item.status || "Menunggu Jadwal",
          isUpcomingNearest: false,
        }
      })
    },
    []
  )

  const nearestSessions = useMemo(() => {
    const now = new Date()
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    if (datePickerValue && datePickerValue !== todayKey) {
      return []
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    // 1. Cek sesi yang sedang berlangsung saat ini (bisa multiple paralel dari psikolog berbeda)
    const ongoing = filteredTodaySessions.filter((s) => {
      if (s.status === "Dibatalkan" || (s.status as string) === "Dibatalkan (Refund)" || s.status === "Selesai") return false
      if (s.status === "Sedang Berlangsung") return true
      const { startMinutes, endMinutes } = parseTimeRangeMinutes(s.waktu)
      return Boolean(startMinutes && endMinutes && currentMinutes >= startMinutes && currentMinutes < endMinutes)
    })
    if (ongoing.length > 0) return ongoing

    // 2. Cek semua sesi yang segera dimulai di jam terdekat yang sama
    const upcoming = filteredTodaySessions.filter((s) => {
      if (s.status === "Selesai" || s.status === "Dibatalkan" || (s.status as string) === "Dibatalkan (Refund)") return false
      if (s.status !== "Segera Dimulai" && !s.isUpcomingNearest) return false
      const { endMinutes } = parseTimeRangeMinutes(s.waktu)
      return endMinutes > currentMinutes
    })
    if (upcoming.length > 0) return upcoming

    // 3. Fallback: ambil semua sesi terdekat yang belum mulai (jam paling awal berikutnya)
    const validFuture = filteredTodaySessions
      .filter((s) => {
        if (s.status === "Selesai" || s.status === "Dibatalkan" || (s.status as string) === "Dibatalkan (Refund)") return false
        const { startMinutes } = parseTimeRangeMinutes(s.waktu)
        return startMinutes && startMinutes > currentMinutes
      })
      .sort((a, b) => {
        const aMin = parseTimeRangeMinutes(a.waktu).startMinutes || 0
        const bMin = parseTimeRangeMinutes(b.waktu).startMinutes || 0
        return aMin - bMin
      })

    if (validFuture.length > 0) {
      const earliestStart = parseTimeRangeMinutes(validFuture[0].waktu).startMinutes
      return validFuture.filter((s) => parseTimeRangeMinutes(s.waktu).startMinutes === earliestStart)
    }

    return []
  }, [filteredTodaySessions, datePickerValue])

  const nearestSession = nearestSessions.length > 0 ? nearestSessions[0] : null

  // ── 5. Dynamic Time Update (Sinkronisasi Jam Lokal Real-Time) ──
  useEffect(() => {
    setTodaySessions((prev) => applyTimeStatusToSessions(prev, datePickerValue))

    const interval = setInterval(() => {
      setTodaySessions((prev) => applyTimeStatusToSessions(prev, datePickerValue))
    }, 15000)

    return () => clearInterval(interval)
  }, [applyTimeStatusToSessions, datePickerValue])

  // Muat data jadwal & sesi riil langsung dari Database PostgreSQL
  const fetchJadwalData = useCallback(async () => {
    if (isBiroContext) {
      // Data jadwal biro belum diatur, jangan ambil data jadwal dari Admin Utama
      setTodaySessions([])
      setBookedSessions([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const res: any = await adminService.getJadwal({ date: datePickerValue })
      if (res) {
        if (Array.isArray(res.todaySessions)) {
          const mappedToday: ClientSessionToday[] = res.todaySessions.map((s: any) => {
            const isAsesmen =
              (s.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
              (s.layanan || "").toLowerCase().includes("asesmen")
            return {
              id: s.id,
              date: s.tanggal,
              waktu: s.waktuRange,
              namaKlien: s.namaKlien,
              klienId: s.idKlien,
              kontak: s.noTelepon,
              psikolog: isAsesmen ? "" : s.psikolog,
              idPsikolog: isAsesmen ? null : s.idPsikolog,
              noTeleponPsikolog: isAsesmen ? null : s.noTeleponPsikolog,
              layanan: s.layanan,
              tipe: s.metode === "Online" ? "Online [Zoom]" : "Offline [Klinik]",
              catatan: s.deskripsiTrauma || undefined,
              status: s.status as ClientSessionStatus,
              tanggal: s.tanggal,
              canRefund: s.canRefund,
              isPastH1: s.isPastH1,
              isRefunded: s.isRefunded,
              isPaid: s.isPaid,
              refundDeadline: s.refundDeadline,
              nominalRefund: s.nominalRefund,
              idTransaksi: s.idTransaksi,
              kodeTransaksi: s.kodeTransaksi,
            }
          })
          setTodaySessions(applyTimeStatusToSessions(mappedToday, datePickerValue))
        } else {
          setTodaySessions([])
        }

        if (Array.isArray(res.weeklyGrid)) {
          const mappedWeekly: BookedAssessment[] = res.weeklyGrid.map((w: any) => {
            const isAsesmen =
              (w.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
              (w.layanan || "").toLowerCase().includes("asesmen")
            return {
              id: w.id,
              date: w.date,
              waktu: w.timeSlot,
              layanan: w.layanan,
              metode: w.metode,
              namaKlien: w.clientName || (w.statusSlot === "TERSEDIA" ? "Tersedia" : undefined),
              psikolog: isAsesmen ? "" : w.psikologName,
              status: w.statusSlot === "TERSEDIA" ? "Tersedia" : "Aktif",
              isAvailableSlot: w.statusSlot === "TERSEDIA",
              tipe_jadwal: isAsesmen ? "ASESMEN" : "KONSULTASI",
              isBooked:
                w.isBooked ??
                (w.statusSlot === "SUDAH_DIBOOKING" ||
                  (Boolean(w.clientName) && w.clientName !== "Tersedia")),
            }
          })
          // Gabungkan slot dari empathika_custom_jadwal_slots ke weeklyGrid (hanya slot manual yang valid, abaikan seed dummy)
          try {
            const raw = localStorage.getItem("empathika_custom_jadwal_slots")
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed)) {
                // Bersihkan seed_asesmen dummy jika masih tersimpan di browser
                const validCustomList = parsed.filter((s: any) => !s.id?.startsWith("seed_asesmen_"))
                if (validCustomList.length !== parsed.length) {
                  localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(validCustomList))
                }

                validCustomList.forEach((s: any) => {
                  if (s.tanggal && s.jam_mulai) {
                    const timeStr = s.label_waktu || `${s.jam_mulai.substring(0, 5)} - ${(s.jam_selesai || "10:00").substring(0, 5)}`
                    const exists = mappedWeekly.some(
                      (w) => w.date === s.tanggal && w.waktu === timeStr
                    )
                    if (!exists) {
                      const isTersedia = (s.status || "TERSEDIA").toUpperCase() === "TERSEDIA"
                      mappedWeekly.push({
                        id: s.id || `custom_${s.tanggal}_${timeStr}`,
                        date: s.tanggal,
                        waktu: timeStr,
                        layanan: s.layanan || (((s.tipe_jadwal || "").toUpperCase() === "ASESMEN") ? "Asesmen Klinis" : "Konseling Individu"),
                        metode: s.metode === "Offline" ? "Offline" : "Online",
                        namaKlien: isTersedia ? "Tersedia" : (s.namaKlien || "Klien Terdaftar"),
                        psikolog: ((s.tipe_jadwal || "").toUpperCase() === "ASESMEN" || (s.layanan || "").toLowerCase().includes("asesmen")) ? "" : (s.nama_psikolog || "Tenaga Ahli"),
                        isAvailableSlot: isTersedia,
                        status: isTersedia ? "Tersedia" : "Aktif",
                        isBooked: !isTersedia,
                        tipe_jadwal: ((s.tipe_jadwal || "").toUpperCase() === "ASESMEN") ? "ASESMEN" : "KONSULTASI",
                      })
                    }
                  }
                })
              }
            }
          } catch {}

          setBookedSessions(mappedWeekly)
        } else {
          setBookedSessions([])
        }
      }
    } catch (err: any) {
      console.warn("Notice loading admin jadwal:", err?.message)
    } finally {
      setIsLoading(false)
    }
  }, [datePickerValue, applyTimeStatusToSessions])

  useEffect(() => {
    fetchJadwalData()

    const handleStorageChange = () => {
      fetchJadwalData()
    }
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("empathika_session_cancelled", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("empathika_session_cancelled", handleStorageChange)
    }
  }, [fetchJadwalData])

  const handleSelectDate = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setCurrentWeekMonday(getMonday(newDate))
      const y = newDate.getFullYear()
      const m = String(newDate.getMonth() + 1).padStart(2, "0")
      const day = String(newDate.getDate()).padStart(2, "0")
      updateUrlParams({ date: `${y}-${m}-${day}` })
    } else {
      updateUrlParams({ date: null })
    }
  }

  // ── 6. Weekly Grid & Navigation Logic ──
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

  const currentWeekAllSessions = useMemo(() => {
    const combined: BookedAssessment[] = []

    todaySessions.forEach((ts) => {
      if (!ts.namaKlien || ts.namaKlien.toLowerCase() === "tersedia") return

      const sessionDateKey = ts.date || (ts as any).tanggal || formatDateKey(today)
      combined.push({
        id: `today_sync_${ts.id}`,
        date: sessionDateKey,
        waktu: ts.waktu,
        layanan: ts.layanan,
        metode: ts.tipe.toLowerCase().includes("online") ? "Online" : "Offline",
        namaKlien: ts.namaKlien,
        psikolog: ts.psikolog,
        status: ts.status,
        isBooked: true,
      })
    })

    bookedSessions.forEach((bs) => {
      if (
        !combined.some(
          (c) =>
            c.id === bs.id ||
            (c.date === bs.date && c.waktu === bs.waktu && c.namaKlien === bs.namaKlien)
        )
      ) {
        combined.push(bs)
      }
    })

    const cancelledList = getCancelledSessions()
    return combined.map((s) => {
      if (s.status === "Dibatalkan" || isSessionCancelled(s, cancelledList)) {
        return { ...s, status: "Dibatalkan" }
      }
      return s
    })
  }, [bookedSessions, todaySessions, today])

  const thisWeekMonday = useMemo(() => getMonday(today), [today])
  const weeksDiff = useMemo(() => {
    return Math.round(
      (currentWeekMonday.getTime() - thisWeekMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
  }, [currentWeekMonday, thisWeekMonday])

  const canGoPrevWeek = weeksDiff > -4

  const weekRangeTitle = useMemo(() => {
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
    if (!canGoPrevWeek) return
    const prev = new Date(currentWeekMonday)
    prev.setDate(currentWeekMonday.getDate() - 7)
    setCurrentWeekMonday(prev)
  }

  const goToNextWeek = () => {
    const next = new Date(currentWeekMonday)
    next.setDate(currentWeekMonday.getDate() + 7)
    setCurrentWeekMonday(next)
  }

  const handleBooking = async (times: string[], metode: "Online" | "Offline" | "Keduanya" = "Online") => {
    if (!date || times.length === 0) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const tanggalStr = `${y}-${m}-${day}`

    setIsLoading(true)
    let successCount = 0
    const failErrors: string[] = []

    for (const finalWaktu of times) {
      const parts = finalWaktu.split("-").map((p) => p.trim())
      const jamMulai = parts[0]?.substring(0, 5) || "09:00"
      const jamSelesai = parts[1]?.substring(0, 5) || "10:00"

      try {
        await adminService.createJadwalSlot({
          tanggal: tanggalStr,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          tipe_jadwal: "KONSULTASI",
          metode: metode.toUpperCase(),
        })
        successCount++
      } catch (err: any) {
        console.warn(`Gagal membuka slot ${finalWaktu}:`, err?.response?.data?.message || err.message)
        failErrors.push(err?.response?.data?.message || `${finalWaktu} gagal dibuka`)
      }
      try {
        const raw = localStorage.getItem("empathika_custom_jadwal_slots");
        const currentList = raw ? JSON.parse(raw) : [];
        const exists = currentList.some(
          (s: any) =>
            s.tanggal === tanggalStr &&
            (s.jam_mulai || "").substring(0, 5) === jamMulai
        );
        if (!exists) {
          currentList.push({
            id: "slot_" + tanggalStr + "_" + jamMulai + "_" + Date.now(),
            tanggal: tanggalStr,
            jam_mulai: jamMulai,
            jam_selesai: jamSelesai,
            label_waktu: jamMulai + " - " + jamSelesai,
            tipe_jadwal: "KONSULTASI",
            metode: metode.toUpperCase(),
            status: "TERSEDIA",
            nama_psikolog: "",
          });
          localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(currentList));
          window.dispatchEvent(new Event("storage"));
        }
      } catch {}
    }

    await fetchJadwalData()
    setIsLoading(false)

    if (successCount > 0) {
      triggerToast(
        successCount === 1
          ? `Slot jadwal asesmen ${metode} (${times[0]}) berhasil dibuka di database!`
          : `${successCount} slot jadwal asesmen ${metode} berhasil dibuka di database!`,
        "success"
      )
      setBookingSuccessMsg(
        successCount === 1
          ? `Slot jam ${times[0]} (${metode}) berhasil dibuka!`
          : `${successCount} slot jam (${metode}) berhasil dibuka sekaligus!`
      )
      setTimeout(() => setBookingSuccessMsg(null), 4500)
    }

    if (failErrors.length > 0 && successCount === 0) {
      triggerToast(`Gagal membuka slot: ${failErrors[0]}`, "danger")
    }
  }

  const handleModalSuccess = async (newSession: NewSessionData) => {
    const cleanWaktu = newSession.waktu.replace(" WIB", "").trim()
    const parts = cleanWaktu.split("-").map((p) => p.trim())
    const jamMulai = parts[0]?.substring(0, 5) || "13:00"
    const jamSelesai = parts[1]?.substring(0, 5) || "14:00"

    const newBooked: BookedAssessment = {
      id: "ab_" + Date.now(),
      date: newSession.tanggal,
      waktu: cleanWaktu,
      layanan: newSession.layanan,
      metode: newSession.metode,
      namaKlien: newSession.namaKlien,
      psikolog: newSession.psikolog,
    }
    setBookedSessions((prev) => [newBooked, ...prev])

    const todayKey = new Date().toISOString().split("T")[0]
    if (newSession.tanggal === todayKey || newSession.tanggal === formatDateKey(new Date())) {
      const newToday: ClientSessionToday = {
        id: "cs_" + Date.now(),
        waktu: cleanWaktu,
        namaKlien: newSession.namaKlien,
        klienId: "010" + Math.floor(100 + Math.random() * 900),
        kontak: newSession.kontak,
        psikolog: newSession.psikolog,
        layanan: newSession.layanan,
        tipe: newSession.metode === "Online" ? "Online [Zoom]" : "Offline [Klinik]",
        catatan: newSession.catatan || undefined,
        status: "Menunggu Jadwal",
      }
      setTodaySessions((prev) => [newToday, ...prev])
    }

    setBookingSuccessMsg(`Sesi baru untuk ${newSession.namaKlien} (${newSession.waktu}) berhasil dijadwalkan!`)
    setTimeout(() => setBookingSuccessMsg(null), 4000)

    try {
      await adminService.createSesiBaru({
        id_psikolog: newSession.idPsikolog || newSession.psikolog,
        id_layanan: newSession.idLayanan || newSession.layanan,
        tanggal: newSession.tanggal,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        metode: newSession.metode.toUpperCase() === "OFFLINE" ? "OFFLINE" : "ONLINE",
        deskripsi_trauma: newSession.catatan,
        klien: {
          nama: newSession.namaKlien.trim(),
          no_telepon: newSession.kontak.trim() || "081234567890",
        },
      })
      triggerToast(`Sesi ${newSession.layanan} untuk ${newSession.namaKlien} berhasil disimpan ke database!`, "success")
    } catch (err: any) {
      console.warn("Gagal menyimpan sesi baru ke database:", err?.response?.data?.message || err?.message)
      triggerToast(`Gagal menyimpan ke database: ${err?.response?.data?.message || err?.message}`, "danger")
    }

    await fetchJadwalData()
  }

  const handleRemoveWeeklySlot = async (timeToRemove: string, targetDateKey?: string) => {
    const effectiveDateKey = targetDateKey || (date ? formatDateKey(date) : undefined)
    if (!effectiveDateKey) return

    // 1. Cari target session jika ada id real
    const targetSession = bookedSessions.find(
      (s) => s.date === effectiveDateKey && (s.waktu === timeToRemove || s.waktu.includes(timeToRemove))
    )

    // Guard: Admin tidak berwenang menghapus slot jadwal konsultasi yang dibuka mandiri oleh psikolog
    const isPsikologSlot =
      targetSession &&
      ((targetSession.tipe_jadwal || "").toUpperCase() === "KONSULTASI" ||
        (!targetSession.layanan?.toLowerCase().includes("asesmen") &&
          Boolean(targetSession.psikolog) &&
          targetSession.psikolog !== "Admin Asesmen" &&
          targetSession.psikolog !== "Asesor Klinis Empathika" &&
          targetSession.psikolog !== "Belum Ditentukan"))

    if (
      isPsikologSlot &&
      (targetSession.isAvailableSlot ||
        targetSession.status === "Tersedia" ||
        !targetSession.namaKlien ||
        targetSession.namaKlien.trim().toLowerCase() === "tersedia")
    ) {
      triggerToast(
        "Slot jadwal ini dibuka oleh psikolog. Admin tidak dapat menghapus slot psikolog karena hanya dapat dikelola mandiri oleh psikolog bersangkutan melalui portal mereka.",
        "danger"
      )
      return
    }

    // 2. Optimistic update: hapus dari state lokal bookedSessions
    setBookedSessions((prev) =>
      prev.filter(
        (s) => !(s.date === effectiveDateKey && (s.waktu === timeToRemove || s.waktu.includes(timeToRemove)))
      )
    )

    // 3. Bersihkan dari localStorage
    try {
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      if (raw) {
        const currentList = JSON.parse(raw)
        const updated = currentList.filter(
          (s: any) =>
            !(
              s.tanggal === effectiveDateKey &&
              ((s.label_waktu && s.label_waktu.includes(timeToRemove)) ||
                (s.jam_mulai && timeToRemove.startsWith(s.jam_mulai.substring(0, 5))))
            )
        )
        localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(updated))
        window.dispatchEvent(new Event("storage"))
      }
    } catch {}

    // 4. Jika ada id database asli, hapus dari backend
    if (
      targetSession &&
      targetSession.id &&
      !targetSession.id.startsWith("slot_asesmen_") &&
      !targetSession.id.startsWith("ab_") &&
      !targetSession.id.startsWith("slot-admin-")
    ) {
      try {
        await adminService.deleteJadwalSlot(targetSession.id)
      } catch (err: any) {
        console.warn("Gagal hapus slot dari DB:", err?.message)
      }
    }

    triggerToast(`Slot jam ${timeToRemove} berhasil dihapus dari jadwal.`, "success")
    await fetchJadwalData()
  }

  return {
    // ── Dates & Filtering ──
    date,
    datePickerValue,
    formattedSelectedDate,
    formattedDate,
    dateInputRef,
    handleSelectDate,
    selectedLayanan,
    selectedStatus,
    isLayananDropdownOpen,
    setIsLayananDropdownOpen,
    handleLayananChange,
    handleStatusChange,
    layananOptions,
    matchLayanan,

    // ── Stats & Today's Sessions ──
    stats,
    today,
    todaySessions,
    filteredTodaySessions,
    nearestSession,
    nearestSessions,
    activeMenuId,
    setActiveMenuId,

    // ── Weekly Schedule Grid ──
    weekRangeTitle,
    weekDays,
    currentWeekAllSessions,
    canGoPrevWeek,
    goToPrevWeek,
    goToNextWeek,
    handleSelectWeeklySession,

    // ── Slot Booking ──
    bookedSessions,
    bookingSuccessMsg,
    handleBooking,
    handleRemoveWeeklySlot,

    // ── Modals & Actions ──
    isModalOpen,
    setIsModalOpen,
    handleModalSuccess,
    selectedDetailSession,
    setSelectedDetailSession,
    sessionToCancel,
    setSessionToCancel,
    handleCancelSession,
    handleMarkCompleted,
    handleCopyWhatsAppMessage,
    handleCopyWhatsAppPsikologMessage,

    // ── Toast & Loading State ──
    actionToast,
    isLoading,
  }
}

