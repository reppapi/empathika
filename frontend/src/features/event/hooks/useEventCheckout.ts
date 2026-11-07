"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function useEventCheckout() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [nama, setNama] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  const [metodePembayaran, setMetodePembayaran] = useState<string | null>(null)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedEwallet, setSelectedEwallet] = useState<string | null>(null)
  const [failedAlertDismissed, setFailedAlertDismissed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validasi form & error state
  const [errors, setErrors] = useState<{
    nama?: string
    whatsapp?: string
    metodePembayaran?: string
    detailMetode?: string
  }>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const isFailed = searchParams.get("status") === "failed" && !failedAlertDismissed
  const failedReason =
    searchParams.get("reason") ||
    "Pembayaran tidak dapat diproses atau waktu transaksi telah berakhir."

  useEffect(() => {
    const qNama = searchParams.get("nama")
    const qWa = searchParams.get("whatsapp")
    const qMetode = searchParams.get("metode")
    const qBank = searchParams.get("bank")
    const qEwallet = searchParams.get("ewallet")

    if (qNama) setNama(qNama)
    if (qWa) setWhatsapp(qWa)
    if (qMetode) setMetodePembayaran(qMetode)
    if (qBank) setSelectedBank(qBank)
    if (qEwallet) setSelectedEwallet(qEwallet)
  }, [searchParams])

  const eventIdParam = searchParams.get("eventId")
  const testIdParam = searchParams.get("testId")
  const judulParam = searchParams.get("judul") || "Workshop SEFT"
  const deskripsiParam = searchParams.get("deskripsi")
  const subjudulParam =
    deskripsiParam ||
    searchParams.get("subjudul") ||
    "Program workshop interaktif bersama para ahli Empathika."
  const pembicaraParam = searchParams.get("pembicara") || "Narasumber Empathika"
  const tipeParam = searchParams.get("tipe") || "Online"
  const linkMeetParam = searchParams.get("linkMeet") || ""
  const linkWaParam = searchParams.get("linkWa") || ""
  const bannerUrlParam = searchParams.get("bannerUrl") || ""
  const lokasiParam = searchParams.get("lokasi") || (tipeParam === "Online" ? "Google Meet (Online)" : "Lokasi Acara")
  const tanggalParam = searchParams.get("tanggal") || "Jadwal Segera Diumumkan"
  const waktuParam = searchParams.get("waktu") || "09:00"
  const kategoriParam = searchParams.get("kategori") || "Workshop"
  const hargaParam = searchParams.get("harga") || "Gratis"
  const isPsikotes = kategoriParam.toLowerCase().includes("psikotes")

  const handleSelectPayment = (id: string) => {
    if (metodePembayaran === id) {
      setMetodePembayaran(null)
      setSelectedBank(null)
      setSelectedEwallet(null)
      return
    }

    setMetodePembayaran(id)
    if (id !== "bank") setSelectedBank(null)
    if (id !== "ewallet") setSelectedEwallet(null)

    if (attemptedSubmit) {
      setErrors((prev) => ({
        ...prev,
        metodePembayaran: undefined,
        detailMetode: undefined,
      }))
    }
  }

  const handleSubmit = () => {
    setAttemptedSubmit(true)
    const newErrors: {
      nama?: string
      whatsapp?: string
      metodePembayaran?: string
      detailMetode?: string
    } = {}

    if (!nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi."
    }
    if (!whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp aktif wajib diisi."
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
    if (!metodePembayaran) {
      newErrors.metodePembayaran = "Harap pilih salah satu metode pembayaran."
    } else if (metodePembayaran === "bank" && !selectedBank) {
      newErrors.detailMetode = "Harap pilih salah satu bank tujuan transfer."
    } else if (metodePembayaran === "ewallet" && !selectedEwallet) {
      newErrors.detailMetode = "Harap pilih salah satu aplikasi e-wallet."
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstTargetId =
        newErrors.nama || newErrors.whatsapp
          ? "box-data-peserta"
          : "box-metode-pembayaran"
      const el = document.getElementById(firstTargetId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      return
    }

    setIsSubmitting(true)

    const params = new URLSearchParams({
      nama: nama.toUpperCase(),
      whatsapp,
      orderId:
        (isPsikotes ? "PSI-" : "EV-") +
        String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"),
      tanggal: tanggalParam,
      tahun: "2026",
      waktu: waktuParam,
      judul: judulParam,
      subjudul: subjudulParam,
      kategori: kategoriParam,
      harga: hargaParam,
      metode: metodePembayaran!,
      tipe: tipeParam,
      ...(eventIdParam && { eventId: eventIdParam }),
      ...(linkMeetParam && { linkMeet: linkMeetParam }),
      ...(linkWaParam && { linkWa: linkWaParam }),
      ...(testIdParam && { testId: testIdParam }),
      ...(selectedBank && { bank: selectedBank }),
      ...(selectedEwallet && { ewallet: selectedEwallet }),
    })

    router.push(`/event/pending?${params.toString()}`)
  }

  return {
    nama,
    setNama,
    whatsapp,
    setWhatsapp,
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
    judulParam,
    subjudulParam,
    pembicaraParam,
    lokasiParam,
    tanggalParam,
    waktuParam,
    kategoriParam,
    hargaParam,
    isPsikotes,
    tipeParam,
    linkMeetParam,
    linkWaParam,
    bannerUrlParam,
    handleSelectPayment,
    handleSubmit,
  }
}
