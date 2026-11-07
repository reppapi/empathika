"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { bookingService } from "@/services/booking.service"
import { layananService } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"

export const BANK_LIST = [
  { id: "bca", name: "BCA", va: "1234567890123" },
  { id: "mandiri", name: "Mandiri", va: "8881234567890" },
  { id: "bni", name: "BNI", va: "9876543210987" },
  { id: "bri", name: "BRI", va: "7771234567890" },
  { id: "bsi", name: "BSI", va: "4441234567890" },
]

export const EWALLET_LIST = [
  { id: "gopay", name: "GoPay", color: "#00AA13" },
  { id: "ovo", name: "OVO", color: "#4C3494" },
  { id: "dana", name: "DANA", color: "#118EEA" },
  { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D" },
  { id: "linkaja", name: "LinkAja", color: "#E82529" },
]

export function useBayarClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [nama, setNama] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [deskripsi, setDeskripsi] = useState("")

  const [metodePembayaran, setMetodePembayaran] = useState<string | null>(null)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedEwallet, setSelectedEwallet] = useState<string | null>(null)
  const [failedAlertDismissed, setFailedAlertDismissed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validasi form & status error peringatan
  const [errors, setErrors] = useState<{
    nama?: string
    whatsapp?: string
    deskripsi?: string
    metodePembayaran?: string
    detailMetode?: string
  }>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const isFailed = searchParams.get("status") === "failed" && !failedAlertDismissed
  const failedReason = searchParams.get("reason") || "Pembayaran tidak dapat diproses atau waktu transaksi telah berakhir."

  const qSlotId = searchParams.get("slotId") || searchParams.get("id_jadwal") || ""
  const qPsikologId = searchParams.get("psikologId") || searchParams.get("id_psikolog") || ""
  const qFullDate = searchParams.get("fullDate") || ""
  const qMetodeKonseling = searchParams.get("metodeKonseling") || searchParams.get("metode") || "Online"
  const qBottomDate = searchParams.get("bottomDate") || "31 Agu 2026"
  const qBottomTime = searchParams.get("bottomTime") || "13:30 WIB (Online)"
  const qPsikologName = searchParams.get("psikologName") || ""
  const qHari = searchParams.get("hari") || ""
  const isAsesmenParam =
    searchParams.get("mode") === "asesmen" ||
    Boolean(qHari) ||
    searchParams.get("kategori")?.toLowerCase() === "asesmen" ||
    (searchParams.get("paket") || "").toLowerCase().includes("asesmen")
  const rawLayanan = searchParams.get("layanan")
  const qLayanan = rawLayanan
    ? rawLayanan
    : isAsesmenParam
      ? `Asesmen Minat Bakat${qHari ? ` (${qHari === "weekend" ? "Weekend" : "Weekday"})` : " (Offline)"}`
      : "Layanan Konsultasi"
  const qTanggal = searchParams.get("tanggal") || "31/08"
  const qTahun = searchParams.get("tahun") || "2026"
  const qWaktu = searchParams.get("waktu") || "13:30"
  const qHarga = searchParams.get("harga") || searchParams.get("biaya") || "Rp 350.000"

  // Status ketersediaan slot (mendeteksi pembatalan/penghapusan slot oleh admin secara realtime)
  const [isSlotUnavailable, setIsSlotUnavailable] = useState(false)
  const [slotUnavailableReason, setSlotUnavailableReason] = useState("")
  const [isCheckingSlot, setIsCheckingSlot] = useState(true)

  const isAsesmenLayanan =
    qLayanan.toLowerCase().includes("asesmen") || isAsesmenParam

  const checkSlotStatus = useCallback(async () => {
    let targetDate = qFullDate
    if (!targetDate && qTanggal && qTahun) {
      const parts = qTanggal.split("/")
      if (parts.length === 2) {
        targetDate = `${qTahun}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
      }
    }

    const qTime5 = qWaktu ? qWaktu.trim().substring(0, 5) : ""

    // 1. Cek LocalStorage (apabila slot berasal dari custom admin/dummy)
    try {
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          if (
            qSlotId &&
            (qSlotId.startsWith("slot_asesmen_") ||
              qSlotId.startsWith("ab_") ||
              qSlotId.startsWith("slot-admin-"))
          ) {
            const found = parsed.find((s: any) => s.id === qSlotId)
            if (!found) {
              setIsSlotUnavailable(true)
              setSlotUnavailableReason(
                "Slot jadwal ini telah dihapus dari jadwal klinik atau dibatalkan oleh admin."
              )
              setIsCheckingSlot(false)
              return
            }
          }
        }
      }
    } catch {}

    // 2. Cek status ke Backend API
    try {
      const res: any = await bookingService.checkSlotAvailability({
        id: qSlotId || undefined,
        tanggal: targetDate || undefined,
        waktu: qTime5 || undefined,
        tipe_jadwal: isAsesmenLayanan ? "ASESMEN" : "KONSULTASI",
        id_psikolog: !isAsesmenLayanan ? qPsikologId || undefined : undefined,
      })

      if (res && res.available === false) {
        setIsSlotUnavailable(true)
        setSlotUnavailableReason(
          res.reason ||
            "Slot jadwal ini telah dibatalkan atau tidak tersedia lagi dari jadwal klinik."
        )
        return
      }

      setIsSlotUnavailable(false)
      setSlotUnavailableReason("")
    } catch (err: any) {
      console.warn("Cek status slot:", err?.message)
    } finally {
      setIsCheckingSlot(false)
    }
  }, [qSlotId, qFullDate, qTanggal, qTahun, qWaktu, isAsesmenLayanan, qPsikologId])

  useEffect(() => {
    checkSlotStatus()

    if (typeof window !== "undefined") {
      window.addEventListener("focus", checkSlotStatus)
      window.addEventListener("storage", checkSlotStatus)
      return () => {
        window.removeEventListener("focus", checkSlotStatus)
        window.removeEventListener("storage", checkSlotStatus)
      }
    }
  }, [checkSlotStatus])

  // Perhitungan tarif dinamis (menyesuaikan hari kerja vs akhir pekan & kualifikasi tenaga ahli)
  const [hargaNominal, setHargaNominal] = useState("Rp 350.000")
  const [isLayananNonaktif, setIsLayananNonaktif] = useState(false)

  useEffect(() => {
    let isWeekend = false
    let targetDateStr = qFullDate
    if (!targetDateStr && qTanggal && qTahun) {
      const parts = qTanggal.split("/")
      if (parts.length === 2) {
        targetDateStr = `${qTahun}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
      }
    }
    if (targetDateStr) {
      const d = new Date(targetDateStr)
      if (!isNaN(d.getTime())) {
        const day = d.getDay()
        isWeekend = day === 0 || day === 6
      }
    }

    const psiLower = (qPsikologName || "").toLowerCase()
    const roleKey: "psikolog" | "konselor" | "peer" = psiLower.includes("peer")
      ? "peer"
      : psiLower.includes("konselor")
      ? "konselor"
      : "psikolog"

    const formatRp = (num: number | string) => {
      const n = typeof num === "string" ? parseInt(num.replace(/[,.]00$/, "").replace(/[^0-9]/g, "") || "0", 10) : num
      return `Rp ${n.toLocaleString("id-ID")}`
    }

    const checkService = () => {
      layananService
        .getAll({ kategori: "KONSULTASI" })
        .then((res: any) => {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
          const item =
            list.find((l: any) => {
              if (qLayanan) return l.nama.toLowerCase().includes(qLayanan.toLowerCase()) || qLayanan.toLowerCase().includes(l.nama.toLowerCase())
              return true
            }) || list[0]

          const stored = getStoredLayanan().filter((l) => l.kategoriId === "01")
          const localItem = stored.find((l) => {
            if (qLayanan) return l.layanan.toLowerCase().includes(qLayanan.toLowerCase()) || qLayanan.toLowerCase().includes(l.layanan.toLowerCase())
            return true
          })

          const isNonaktif =
            (item && (item.aktif === false || item.status === "Nonaktif")) ||
            (localItem && localItem.status === "Nonaktif")
          setIsLayananNonaktif(Boolean(isNonaktif))

          if (item?.tarif_tenaga_ahli?.[roleKey]) {
            const rate = isWeekend
              ? item.tarif_tenaga_ahli[roleKey].weekend
              : item.tarif_tenaga_ahli[roleKey].weekday
            setHargaNominal(formatRp(rate))
          } else if (item) {
            const rate = isWeekend ? item.harga_weekend : item.harga_weekday
            setHargaNominal(formatRp(rate))
          }
        })
        .catch((err) => {
          console.warn("Gagal sinkronisasi tarif dinamis pembayaran:", err)
        })
    }

    checkService()
    window.addEventListener("focus", checkService)
    window.addEventListener("storage", checkService)

    return () => {
      window.removeEventListener("focus", checkService)
      window.removeEventListener("storage", checkService)
    }
  }, [qFullDate, qTanggal, qTahun, qPsikologName, qLayanan])

  useEffect(() => {
    const qNama = searchParams.get("nama")
    const qWa = searchParams.get("whatsapp")
    const qDeskripsi = searchParams.get("deskripsi")
    const qMetode = searchParams.get("metode")
    const qBank = searchParams.get("bank")
    const qEwallet = searchParams.get("ewallet")

    if (qNama) setNama(qNama)
    if (qWa) setWhatsapp(qWa)
    if (qDeskripsi) setDeskripsi(qDeskripsi)
    if (qMetode) setMetodePembayaran(qMetode)
    if (qBank) setSelectedBank(qBank)
    if (qEwallet) setSelectedEwallet(qEwallet)
  }, [searchParams])

  const handleSelectPayment = (id: string) => {
    if (metodePembayaran === id) {
      setMetodePembayaran(null)
      setSelectedBank(null)
      setSelectedEwallet(null)
      if (attemptedSubmit) {
        setErrors((prev) => ({ ...prev, metodePembayaran: "Silakan pilih salah satu metode pembayaran." }))
      }
      return
    }

    setMetodePembayaran(id)
    if (id !== "bank") { setSelectedBank(null) }
    if (id !== "ewallet") { setSelectedEwallet(null) }

    if (attemptedSubmit) {
      setErrors((prev) => ({
        ...prev,
        metodePembayaran: undefined,
        detailMetode: undefined,
      }))
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (isSlotUnavailable) {
      alert("Slot jadwal ini telah dihapus atau dibatalkan oleh pihak klinik/psikolog. Anda tidak dapat melanjutkan proses booking. Silakan pilih jadwal lain.")
      return
    }

    setAttemptedSubmit(true)

    const newErrors: {
      nama?: string
      whatsapp?: string
      deskripsi?: string
      metodePembayaran?: string
      detailMetode?: string
    } = {}

    if (!nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi."
    }

    if (!whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp wajib diisi."
    } else {
      const cleanWa = whatsapp.replace(/\D/g, "")
      const local = cleanWa.startsWith("62") ? cleanWa.slice(2) : cleanWa
      if (!local.startsWith("8")) {
        newErrors.whatsapp = "Nomor tidak valid. Nomor WhatsApp harus diawali angka 8 (contoh: +62 812-xxxx-xxxx)."
      } else if (local.length < 9) {
        newErrors.whatsapp = "Nomor WhatsApp terlalu pendek (minimal 10 digit, contoh: +62 812-3456-7890)."
      } else if (local.length > 13) {
        newErrors.whatsapp = "Nomor WhatsApp terlalu panjang (maksimal 14 digit angka)."
      }
    }

    if (!deskripsi.trim()) {
      newErrors.deskripsi = "Deskripsi ringkasan hidup atau keluhan wajib diisi."
    }

    if (!metodePembayaran) {
      newErrors.metodePembayaran = "Silakan pilih salah satu metode pembayaran."
    } else if (metodePembayaran === "bank" && !selectedBank) {
      newErrors.detailMetode = "Silakan pilih bank tujuan transfer."
    } else if (metodePembayaran === "ewallet" && !selectedEwallet) {
      newErrors.detailMetode = "Silakan pilih jenis e-wallet yang ingin digunakan."
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.nama || newErrors.whatsapp || newErrors.deskripsi) {
        const el = document.getElementById("box-data-peserta")
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
      } else if (newErrors.metodePembayaran || newErrors.detailMetode) {
        const el = document.getElementById("box-metode-pembayaran")
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      return
    }

    if (isLayananNonaktif) {
      alert("Layanan konsultasi ini sedang dinonaktifkan oleh administrator dan tidak dapat diproses.")
      return
    }

    setIsSubmitting(true)

    let targetDate = qFullDate
    if (!targetDate && qTanggal && qTahun) {
      const parts = qTanggal.split("/")
      if (parts.length === 2) {
        targetDate = `${qTahun}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
      }
    }

    const isAsesmenLayanan = qLayanan.toLowerCase().includes("asesmen") || isAsesmenParam

    try {
      const res: any = await bookingService.createBooking({
        id_jadwal: qSlotId || undefined,
        id_psikolog: !isAsesmenLayanan ? (qPsikologId || undefined) : undefined,
        tanggal: targetDate || undefined,
        jam_mulai: qWaktu ? qWaktu.substring(0, 5) : undefined,
        metode: qMetodeKonseling.toUpperCase() === "OFFLINE" ? "OFFLINE" : "ONLINE",
        tipe_jadwal: isAsesmenLayanan ? "ASESMEN" : "KONSULTASI",
        layanan: qLayanan,
        nama_layanan: qLayanan,
        deskripsi_trauma: deskripsi.trim() || (isAsesmenLayanan ? `Sesi ${qLayanan}` : undefined),
        metode_pembayaran: (metodePembayaran || "QRIS").toUpperCase(),
        channel_pembayaran: selectedBank || selectedEwallet || "QRIS",
        klien: {
          nama: nama.trim().toUpperCase(),
          no_telepon: whatsapp.trim(),
        },
      } as any)

      const finalOrderId = res?.kode_pesanan || ("W-EMP-" + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"))
      const bookingId = res?.id

      const cleanBottomTime = isAsesmenLayanan && qBottomTime.includes("•")
        ? qBottomTime.split("•")[0].trim()
        : qBottomTime

      const params = new URLSearchParams({
        nama: nama.trim().toUpperCase(),
        whatsapp: whatsapp.trim(),
        deskripsi: deskripsi.trim(),
        orderId: finalOrderId,
        ...(bookingId && { bookingId }),
        ...(qSlotId && { slotId: qSlotId }),
        ...(!isAsesmenLayanan && qPsikologId && { psikologId: qPsikologId }),
        tanggal: qTanggal,
        tahun: qTahun,
        waktu: qWaktu,
        judul: qLayanan,
        subjudul: isAsesmenLayanan
          ? "Sesi Asesmen Klinis Empathika"
          : qPsikologName
            ? `Bersama ${qPsikologName}`
            : "Psikolog Profesional Empathika",
        harga: qHarga,
        ...(qHari && { hari: qHari }),
        bottomDate: qBottomDate,
        bottomTime: cleanBottomTime,
        metode: metodePembayaran || "qris",
        metodeKonseling: qMetodeKonseling,
        ...(!isAsesmenLayanan && qPsikologName && { psikologName: qPsikologName }),
        ...(selectedBank && { bank: selectedBank }),
        ...(selectedEwallet && { ewallet: selectedEwallet }),
      })

      // Hapus slot yang baru saja dibooking dari cache lokal agar tidak pernah muncul lagi
      try {
        const raw = localStorage.getItem("empathika_custom_jadwal_slots")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            const qTime5 = qWaktu ? qWaktu.trim().substring(0, 5) : ""
            const updated = parsed.filter((s: any) => {
              if (qSlotId && s.id === qSlotId) return false
              const sTime5 = (s.jam_mulai || "").trim().substring(0, 5)
              const sDate = s.tanggal || ""
              const isMatchDate = targetDate ? sDate === targetDate : true
              if (isMatchDate && qTime5 && sTime5 === qTime5) return false
              return true
            })
            localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(updated))
            window.dispatchEvent(new Event("storage"))
          }
        }
      } catch {}

      router.push(`/konseling/pending?${params.toString()}`)
    } catch (err: any) {
      console.error("Booking error:", err)
      const msg = err?.response?.data?.message || err?.message || "Gagal memproses booking. Silakan coba lagi."

      if (
        err?.response?.status === 409 ||
        msg.toLowerCase().includes("dihapus") ||
        msg.toLowerCase().includes("dibatalkan") ||
        msg.toLowerCase().includes("tidak tersedia")
      ) {
        setIsSlotUnavailable(true)
        setSlotUnavailableReason(msg)
      }

      try {
        const raw = localStorage.getItem("empathika_custom_jadwal_slots")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            const qTime5 = qWaktu ? qWaktu.trim().substring(0, 5) : ""
            const updated = parsed.filter((s: any) => {
              if (qSlotId && s.id === qSlotId) return false
              const sTime5 = (s.jam_mulai || "").trim().substring(0, 5)
              const sDate = s.tanggal || ""
              const isMatchDate = targetDate ? sDate === targetDate : true
              if (isMatchDate && qTime5 && sTime5 === qTime5) return false
              return true
            })
            localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(updated))
            window.dispatchEvent(new Event("storage"))
          }
        }
      } catch {}

      alert(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    BANK_LIST,
    EWALLET_LIST,
    nama,
    setNama,
    whatsapp,
    setWhatsapp,
    deskripsi,
    setDeskripsi,
    metodePembayaran,
    selectedBank,
    setSelectedBank,
    selectedEwallet,
    setSelectedEwallet,
    failedAlertDismissed,
    setFailedAlertDismissed,
    isSubmitting,
    errors,
    setErrors,
    attemptedSubmit,
    isFailed,
    failedReason,
    isSlotUnavailable,
    slotUnavailableReason,
    isCheckingSlot,
    qWaktu,
    qBottomDate,
    qBottomTime,
    qPsikologName,
    qLayanan,
    qHarga,
    qHari,
    hargaNominal,
    isLayananNonaktif,
    handleSelectPayment,
    handleSubmit,
  }
}
