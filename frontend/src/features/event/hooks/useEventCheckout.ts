"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { eventService, PaketBundlingItem } from "@/services/event.service"
import { transaksiService } from "@/services/transaksi.service"

export function useEventCheckout() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [nama, setNama] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  // State untuk Paket Bundling
  const [selectedTicketType, setSelectedTicketType] = useState<string>("SINGLE")
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [pesertaTambahan, setPesertaTambahan] = useState<{ nama: string; whatsapp: string }[]>([])

  // State data bundling yang diambil langsung dari database server
  const [serverEventData, setServerEventData] = useState<{
    harga_bundling?: number | string | null
    kuota_tiket_bundling?: number | null
    nama_bundling?: string | null
    paket_bundling?: PaketBundlingItem[] | null
    harga?: number | string
  } | null>(null)

  const [metodePembayaran, setMetodePembayaran] = useState<string | null>(null)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedEwallet, setSelectedEwallet] = useState<string | null>(null)
  const [failedAlertDismissed, setFailedAlertDismissed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Status validasi event dari server (fallback jika pendaftaran sudah ditutup/nonaktif)
  const [isEventLoading, setIsEventLoading] = useState(false)
  const [isEventClosed, setIsEventClosed] = useState(false)
  const [eventClosedReason, setEventClosedReason] = useState<string>("")

  // Validasi form & error state
  const [errors, setErrors] = useState<{
    nama?: string
    whatsapp?: string
    pesertaTambahanErrors?: { nama?: string; whatsapp?: string }[]
    namaPeserta2?: string
    whatsappPeserta2?: string
    metodePembayaran?: string
    detailMetode?: string
  }>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const isFailed = searchParams.get("status") === "failed" && !failedAlertDismissed
  const failedReason =
    searchParams.get("reason") ||
    "Pembayaran tidak dapat diproses atau waktu transaksi telah berakhir."

  const eventIdParam = searchParams.get("eventId")
  const testIdParam = searchParams.get("testId")

  // Cek ketersediaan event dari server jika ada eventIdParam
  useEffect(() => {
    if (!eventIdParam) return

    let isMounted = true
    setIsEventLoading(true)

    eventService
      .getById(eventIdParam)
      .then((res) => {
        if (!isMounted) return
        const ev = res?.data
        if (!ev) {
          setIsEventClosed(true)
          setEventClosedReason("Event tidak ditemukan atau pendaftaran telah dihapus.")
          return
        }

        setServerEventData({
          harga_bundling: ev.harga_bundling,
          kuota_tiket_bundling: ev.kuota_tiket_bundling,
          nama_bundling: ev.nama_bundling,
          paket_bundling: ev.paket_bundling,
          harga: ev.harga,
        })

        // Jika status selesai, dibatalkan, atau masih draft (dinonaktifkan oleh admin)
        if (ev.status === "COMPLETED") {
          setIsEventClosed(true)
          setEventClosedReason("Pendaftaran untuk event ini telah selesai.")
        } else if (ev.status === "CANCELLED") {
          setIsEventClosed(true)
          setEventClosedReason("Event ini telah dibatalkan oleh pihak penyelenggara.")
        } else if (ev.status === "DRAFT") {
          setIsEventClosed(true)
          setEventClosedReason("Pendaftaran untuk event ini sedang dinonaktifkan.")
        } else if (typeof ev.sisa_kuota === "number" && ev.sisa_kuota <= 0) {
          setIsEventClosed(true)
          setEventClosedReason("Mohon maaf, kuota pendaftaran untuk event ini sudah penuh.")
        }
      })
      .catch((err) => {
        if (!isMounted) return
        if (err?.response?.status === 404) {
          setIsEventClosed(true)
          setEventClosedReason("Event tidak ditemukan atau pendaftaran telah dihapus.")
        }
      })
      .finally(() => {
        if (isMounted) setIsEventLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [eventIdParam])

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

  // Parameter Bundling (Gabungan dari URL params dan Server DB response)
  const serverBundlingList: PaketBundlingItem[] =
    serverEventData?.paket_bundling && Array.isArray(serverEventData.paket_bundling) && serverEventData.paket_bundling.length > 0
      ? serverEventData.paket_bundling
      : serverEventData?.harga_bundling && Number(serverEventData.harga_bundling) > 0
      ? [
          {
            nama_paket: serverEventData.nama_bundling || "Paket Duo Hemat",
            kuota_tiket: serverEventData.kuota_tiket_bundling || 2,
            harga_paket: Number(serverEventData.harga_bundling),
          },
        ]
      : []

  const urlHargaBundling = searchParams.get("hargaBundling") ? parseFloat(searchParams.get("hargaBundling")!) : 0
  const urlKuotaBundling = parseInt(searchParams.get("kuotaBundling") || "2", 10)
  const urlNamaBundling = searchParams.get("namaBundling") || "Paket Duo Hemat"

  const finalBundlingOptions: PaketBundlingItem[] =
    serverBundlingList.length > 0
      ? serverBundlingList
      : urlHargaBundling > 0
      ? [
          {
            nama_paket: urlNamaBundling,
            kuota_tiket: urlKuotaBundling,
            harga_paket: urlHargaBundling,
          },
        ]
      : []

  const hasBundling = finalBundlingOptions.length > 0

  // Cari paket yang sedang dipilih
  const currentSelectedBundle =
    selectedTicketType !== "SINGLE"
      ? finalBundlingOptions.find((p, idx) => `BUNDLE_${idx}` === selectedTicketType || p.nama_paket === selectedTicketType) ||
        finalBundlingOptions[0]
      : null

  const activeHargaTeks = currentSelectedBundle
    ? `Rp ${Number(currentSelectedBundle.harga_paket).toLocaleString("id-ID")}`
    : hargaParam

  // Sesuaikan jumlah form peserta tambahan jika paket bundling dipilih
  useEffect(() => {
    if (currentSelectedBundle) {
      const neededExtra = Math.max(0, currentSelectedBundle.kuota_tiket - 1)
      setPesertaTambahan((prev) => {
        if (prev.length === neededExtra) return prev
        const updated = [...prev]
        while (updated.length < neededExtra) {
          updated.push({ nama: "", whatsapp: "" })
        }
        return updated.slice(0, neededExtra)
      })
    } else {
      setPesertaTambahan([])
    }
  }, [currentSelectedBundle])

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
      pesertaTambahanErrors?: { nama?: string; whatsapp?: string }[]
      namaPeserta2?: string
      whatsappPeserta2?: string
      metodePembayaran?: string
      detailMetode?: string
    } = {}

    if (!nama.trim()) {
      newErrors.nama = "Nama lengkap peserta 1 wajib diisi."
    }
    if (!whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp aktif peserta 1 wajib diisi."
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

    // Validasi Peserta Tambahan jika memilih paket BUNDLING
    const additionalErrors: { nama?: string; whatsapp?: string }[] = []
    let hasAdditionalError = false

    if (currentSelectedBundle && pesertaTambahan.length > 0) {
      const allNumbers = [whatsapp.replace(/\D/g, "")]
      const allNames = [nama.trim().toLowerCase()]

      pesertaTambahan.forEach((p, pIdx) => {
        const itemErr: { nama?: string; whatsapp?: string } = {}
        const pNama = p.nama.trim()
        const pWa = p.whatsapp.trim()

        if (!pNama) {
          itemErr.nama = `Nama lengkap peserta ${pIdx + 2} wajib diisi.`
          hasAdditionalError = true
        } else if (allNames.includes(pNama.toLowerCase())) {
          itemErr.nama = `Nama peserta ${pIdx + 2} tidak boleh sama dengan peserta lainnya.`
          hasAdditionalError = true
        } else {
          allNames.push(pNama.toLowerCase())
        }

        if (!pWa) {
          itemErr.whatsapp = `Nomor WhatsApp peserta ${pIdx + 2} wajib diisi.`
          hasAdditionalError = true
        } else {
          const clean = pWa.replace(/\D/g, "")
          const local = clean.startsWith("62") ? clean.slice(2) : clean
          if (!local.startsWith("8")) {
            itemErr.whatsapp = `Nomor WhatsApp peserta ${pIdx + 2} harus diawali angka 8.`
            hasAdditionalError = true
          } else if (local.length < 9) {
            itemErr.whatsapp = `Nomor WhatsApp peserta ${pIdx + 2} terlalu pendek.`
            hasAdditionalError = true
          } else if (local.length > 13) {
            itemErr.whatsapp = `Nomor WhatsApp peserta ${pIdx + 2} terlalu panjang.`
            hasAdditionalError = true
          } else if (allNumbers.includes(clean)) {
            itemErr.whatsapp = `Nomor WhatsApp peserta ${pIdx + 2} tidak boleh sama dengan peserta lainnya.`
            hasAdditionalError = true
          } else {
            allNumbers.push(clean)
          }
        }
        additionalErrors.push(itemErr)
      })

      if (hasAdditionalError) {
        newErrors.pesertaTambahanErrors = additionalErrors
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
    setCheckoutError(null)

    // Format metode pembayaran untuk backend transaksi
    let backendMetode: "TRANSFER_BANK" | "E_WALLET" | "QRIS" = "QRIS"
    let backendChannel: string | undefined = undefined
    if (metodePembayaran === "bank") {
      backendMetode = "TRANSFER_BANK"
      backendChannel = selectedBank?.toUpperCase()
    } else if (metodePembayaran === "ewallet") {
      backendMetode = "E_WALLET"
      backendChannel = selectedEwallet?.toUpperCase()
    } else if (metodePembayaran === "qris") {
      backendMetode = "QRIS"
      backendChannel = "QRIS"
    }

    const kuotaBundlingNum = currentSelectedBundle ? currentSelectedBundle.kuota_tiket : 1

    const proceedToPending = (transaksiId?: string, bookingId?: string, orderKode?: string) => {
      const finalOrderId = orderKode || (isPsikotes ? "PSI-" : "EV-") + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")
      const params = new URLSearchParams({
        nama: nama.toUpperCase(),
        whatsapp,
        orderId: finalOrderId,
        ...(transaksiId && { transaksiId }),
        ...(bookingId && { bookingId }),
        tanggal: tanggalParam,
        tahun: "2026",
        waktu: waktuParam,
        judul: judulParam,
        subjudul: subjudulParam,
        kategori: kategoriParam,
        harga: activeHargaTeks,
        tipeTiket: selectedTicketType,
        ...(currentSelectedBundle && {
          namaBundling: currentSelectedBundle.nama_paket,
          kuotaBundling: String(currentSelectedBundle.kuota_tiket),
          dataPesertaTambahan: JSON.stringify(pesertaTambahan),
        }),
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

    if (eventIdParam && !isPsikotes) {
      transaksiService
        .checkout({
          tipe: "EVENT",
          id_item: eventIdParam,
          nama: nama.trim(),
          no_telepon: whatsapp.trim(),
          metode_pembayaran: backendMetode,
          channel_pembayaran: backendChannel,
          kuota_bundling: kuotaBundlingNum,
          nama_bundling: currentSelectedBundle?.nama_paket,
          nama_peserta_tambahan: pesertaTambahan.length > 0 ? pesertaTambahan : undefined,
        })
        .then((res) => {
          const tId = res?.data?.transaksi?.id
          const bId = res?.data?.booking?.id
          const code = res?.data?.booking?.kode_tiket || res?.data?.transaksi?.kode_transaksi
          proceedToPending(tId, bId, code)
        })
        .catch((err) => {
          console.error("Gagal create transaksi event via API:", err)
          setIsSubmitting(false)
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Gagal memproses pendaftaran event ke server. Pastikan server backend sedang aktif."
          setCheckoutError(msg)
          window.scrollTo({ top: 0, behavior: "smooth" })
        })
    } else {
      proceedToPending()
    }
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
    hargaParam: activeHargaTeks,
    hargaNormalParam: hargaParam,
    selectedTicketType,
    setSelectedTicketType,
    hasBundling,
    finalBundlingOptions,
    currentSelectedBundle,
    pesertaTambahan,
    setPesertaTambahan,
    isPsikotes,
    tipeParam,
    linkMeetParam,
    linkWaParam,
    bannerUrlParam,
    isEventLoading,
    isEventClosed,
    eventClosedReason,
    handleSelectPayment,
    handleSubmit,
    checkoutError,
    setCheckoutError,
  }
}
