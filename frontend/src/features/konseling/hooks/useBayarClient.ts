"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { bookingService } from "@/services/booking.service"

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
  const qLayanan = searchParams.get("layanan") || "Layanan Konsultasi"
  const qTanggal = searchParams.get("tanggal") || "31/08"
  const qTahun = searchParams.get("tahun") || "2026"
  const qWaktu = searchParams.get("waktu") || "13:30"

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
    } else if (!/^[0-9+-\s]{8,16}$/.test(whatsapp.trim())) {
      newErrors.whatsapp = "Nomor WhatsApp minimal 8 digit angka."
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

    setIsSubmitting(true)

    let targetDate = qFullDate
    if (!targetDate && qTanggal && qTahun) {
      const parts = qTanggal.split("/")
      if (parts.length === 2) {
        targetDate = `${qTahun}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
      }
    }

    try {
      const res: any = await bookingService.createBooking({
        id_jadwal: qSlotId || undefined,
        id_psikolog: qPsikologId || undefined,
        tanggal: targetDate || undefined,
        jam_mulai: qWaktu ? qWaktu.substring(0, 5) : undefined,
        metode: qMetodeKonseling.toUpperCase() === "OFFLINE" ? "OFFLINE" : "ONLINE",
        deskripsi_trauma: deskripsi.trim(),
        metode_pembayaran: (metodePembayaran || "QRIS").toUpperCase(),
        channel_pembayaran: selectedBank || selectedEwallet || "QRIS",
        klien: {
          nama: nama.trim().toUpperCase(),
          no_telepon: whatsapp.trim(),
        },
      })

      const finalOrderId = res?.kode_pesanan || ("W-EMP-" + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"))
      const bookingId = res?.id

      const params = new URLSearchParams({
        nama: nama.trim().toUpperCase(),
        whatsapp: whatsapp.trim(),
        deskripsi: deskripsi.trim(),
        orderId: finalOrderId,
        ...(bookingId && { bookingId }),
        ...(qSlotId && { slotId: qSlotId }),
        ...(qPsikologId && { psikologId: qPsikologId }),
        tanggal: qTanggal,
        tahun: qTahun,
        waktu: qWaktu,
        judul: qLayanan,
        subjudul: qPsikologName ? `Bersama ${qPsikologName}` : "Psikolog Profesional Empathika",
        bottomDate: qBottomDate,
        bottomTime: qBottomTime,
        metode: metodePembayaran || "qris",
        metodeKonseling: qMetodeKonseling,
        ...(qPsikologName && { psikologName: qPsikologName }),
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
    qBottomDate,
    qBottomTime,
    qPsikologName,
    qLayanan,
    handleSelectPayment,
    handleSubmit,
  }
}
