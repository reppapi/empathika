/** Hook logika form checkout psikotes berbayar (validasi peserta, metode pembayaran, dan submit booking). */
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { psikotesService } from "@/services/psikotes.service"

export function usePsikotesBayar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State Form Peserta (Hanya Nama & WhatsApp)
  const [nama, setNama] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  // State Metode Pembayaran
  const [metodePembayaran, setMetodePembayaran] = useState<string | null>(null)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedEwallet, setSelectedEwallet] = useState<string | null>(null)

  // State Notifikasi Gagal / Retry
  const [failedAlertDismissed, setFailedAlertDismissed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    nama?: string
    whatsapp?: string
    metodePembayaran?: string
    detailMetode?: string
    [key: string]: any
  }>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const isFailed = searchParams.get("status") === "failed" && !failedAlertDismissed
  const failedReason = searchParams.get("reason") || "Pembayaran gagal diproses."

  // Form pendaftaran psikotes berbayar dibiarkan kosong secara default agar peserta mengisi identitas sendiri

  // Prefill dari searchParams jika ada (misal kembali dari pending / retry gagal)
  useEffect(() => {
    const qNama = searchParams.get("nama")
    const qWhatsapp = searchParams.get("whatsapp")
    const qMetode = searchParams.get("metode")
    const qBank = searchParams.get("bank")
    const qEwallet = searchParams.get("ewallet")

    if (qNama) setNama(qNama)
    if (qWhatsapp) setWhatsapp(qWhatsapp)
    if (qMetode) setMetodePembayaran(qMetode)
    if (qBank) setSelectedBank(qBank)
    if (qEwallet) setSelectedEwallet(qEwallet)
  }, [searchParams])

  // Parameter Detail Layanan Psikotes
  const testIdParam = searchParams.get("testId") || "mbti"
  const judulParam = searchParams.get("judul") || "Tes Psikotes (Paket Lengkap)"
  const subjudulParam =
    searchParams.get("subjudul") ||
    "Akses paket tes psikotes lengkap beserta laporan analisis profesional."
  const kategoriParam = searchParams.get("kategori") || "Psikotes"
  const hargaParam = searchParams.get("harga") || "Rp 150.000"
  const bannerUrlParam =
    searchParams.get("bannerUrl") ||
    searchParams.get("banner_url") ||
    searchParams.get("image") ||
    (() => {
      const t = testIdParam.toLowerCase();
      if (t.includes("dass")) return "/images/psikotes/banner-dass42.jpg";
      if (t.includes("phq") || t.includes("depresi") || t.includes("cdi")) return "/images/psikotes/banner-depresi.jpg";
      if (t.includes("gad") || t.includes("cemas")) return "/images/psikotes/banner-kecemasan.jpg";
      if (t.includes("rcmas") || (t.includes("anak") && !t.includes("depresi"))) return "/images/psikotes/banner-rcmas.jpg";
      if (t.includes("igds") || t.includes("game")) return "/images/psikotes/banner-game.jpg";
      return "";
    })();

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.()
    if (isSubmitting) return
    setAttemptedSubmit(true)

    const newErrors: {
      nama?: string
      whatsapp?: string
      metodePembayaran?: string
      detailMetode?: string
      [key: string]: any
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

    const now = new Date()
    const dd = String(now.getDate()).padStart(2, "0")
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const yyyy = String(now.getFullYear())
    const hh = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")

    const orderId = `PSI-${Math.floor(Math.random() * 9000) + 1000}`

    const params = new URLSearchParams({
      nama: nama.trim().toUpperCase(),
      whatsapp: whatsapp.trim(),
      orderId,
      tanggal: `${dd}/${mm}`,
      tahun: yyyy,
      waktu: `${hh}:${min}`,
      judul: judulParam,
      kategori: kategoriParam,
      harga: hargaParam,
      metode: metodePembayaran!,
      testId: testIdParam,
      ...(bannerUrlParam && { bannerUrl: bannerUrlParam }),
      ...(selectedBank && { bank: selectedBank }),
      ...(selectedEwallet && { ewallet: selectedEwallet }),
    })

    // Simpan data peserta psikotes ke localStorage
    try {
      localStorage.setItem(
        "empathika_peserta_psikotes",
        JSON.stringify({
          nama: nama.trim(),
          no_telepon: whatsapp.trim(),
          whatsapp: whatsapp.trim(),
          orderId,
          testId: testIdParam,
        })
      )
    } catch {}

    setIsSubmitting(true)

    // Daftarkan booking psikotes ke backend API
    try {
      const res = await psikotesService.createBooking({
        id_paket: testIdParam,
        testId: testIdParam,
        kode_transaksi: orderId,
        metode_pembayaran: metodePembayaran!,
        channel_pembayaran: selectedBank || selectedEwallet || "QRIS",
        status_pembayaran: "PAID",
        nama: nama.trim(),
        no_telepon: whatsapp.trim(),
      })
      const createdBookingId = (res?.data as any)?.id_booking || res?.data?.booking?.id
      if (createdBookingId) {
        params.set("bookingId", createdBookingId)
      }
    } catch (err) {
      console.warn("Sinkronisasi booking psikotes ke backend:", err)
    } finally {
      setIsSubmitting(false)
    }

    router.push(`/psikotes/pending?${params.toString()}`)
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
    testIdParam,
    judulParam,
    subjudulParam,
    kategoriParam,
    hargaParam,
    bannerUrlParam,
    handleSelectPayment,
    handleSubmit,
  }
}
