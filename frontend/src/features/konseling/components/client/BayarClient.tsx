"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { bookingService } from "@/services/booking.service"

// ── Dummy data ────────────────────────────────────────────────────────────────

const BANK_LIST = [
  { id: "bca", name: "BCA", va: "1234567890123" },
  { id: "mandiri", name: "Mandiri", va: "8881234567890" },
  { id: "bni", name: "BNI", va: "9876543210987" },
  { id: "bri", name: "BRI", va: "7771234567890" },
  { id: "bsi", name: "BSI", va: "4441234567890" },
]

const EWALLET_LIST = [
  { id: "gopay", name: "GoPay", color: "#00AA13" },
  { id: "ovo", name: "OVO", color: "#4C3494" },
  { id: "dana", name: "DANA", color: "#118EEA" },
  { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D" },
  { id: "linkaja", name: "LinkAja", color: "#E82529" },
]

// Tombol salin dengan feedback "Tersalin!"
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 text-[11px] font-bold text-[#561269] bg-white border border-[#DCD0E1] px-3 py-1.5 rounded-lg hover:bg-[#F0E6F6] transition-colors shrink-0"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#561269" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
        </svg>
      )}
      {copied ? "Tersalin!" : "Salin"}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BayarClient() {
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

  const activeBank = BANK_LIST.find((b) => b.id === selectedBank)
  const activeEwallet = EWALLET_LIST.find((e) => e.id === selectedEwallet)

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

    try {
      let targetDate = qFullDate
      if (!targetDate && qTanggal && qTahun) {
        const parts = qTanggal.split("/")
        if (parts.length === 2) {
          targetDate = `${qTahun}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
        }
      }

      // Simpan langsung booking & transaksi ke PostgreSQL database
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
            const updated = parsed.filter(
              (s: any) =>
                s.id !== qSlotId &&
                !(s.tanggal === targetDate && (s.jam_mulai === qWaktu || s.jam_mulai?.substring(0, 5) === qWaktu?.substring(0, 5)))
            )
            localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(updated))
            window.dispatchEvent(new Event("storage"))
          }
        }
      } catch {}

      // Arahkan ke halaman pending
      router.push(`/konseling/pending?${params.toString()}`)
    } catch (err: any) {
      console.error("Booking error:", err)
      const msg = err?.response?.data?.message || err?.message || "Gagal memproses booking. Silakan coba lagi."
      alert(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const paymentOptions = [
    {
      id: "ewallet",
      label: "E-Wallet",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
        </svg>
      ),
    },
    {
      id: "bank",
      label: "Transfer Bank",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
        </svg>
      ),
    },
    {
      id: "qris",
      label: "QRIS",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32">

      {/* 1. Stepper Area */}
      <div className="w-full pt-32 pb-10 flex flex-col items-center bg-white border-b border-gray-100">
        <div className="flex items-center w-full max-w-sm justify-center px-4 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">1</div>
            <span className="text-[10px] sm:text-xs text-gray-700">paket</span>
          </div>
          <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-6"></div>
          {/* Step 2 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">2</div>
            <span className="text-[10px] sm:text-xs text-gray-700">jadwal</span>
          </div>
          <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-6"></div>
          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">3</div>
            <span className="text-[10px] sm:text-xs text-gray-700">Bayar</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 mt-8 flex flex-col gap-6">

        {/* Title */}
        <div className="mb-2 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            Ringkasan &amp; Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Periksa data konsultasi dan selesaikan pembayaran untuk mengonfirmasi sesi Anda.
          </p>
        </div>

        {/* ── Banner Notifikasi Pembayaran Gagal ── */}
        {isFailed && (
          <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-red-900">Pembayaran Sebelumnya Gagal</h4>
                <button
                  type="button"
                  onClick={() => setFailedAlertDismissed(true)}
                  className="text-gray-400 hover:text-gray-600 p-1 -mr-1 rounded-lg"
                  aria-label="Tutup"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                {failedReason} Silakan periksa kembali data diri Anda di bawah ini dan pilih ulang metode pembayaran untuk mencoba kembali.
              </p>
            </div>
          </div>
        )}

        {/* ── Box 1: Data Peserta ── */}
        <div id="box-data-peserta" className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] scroll-mt-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
            <h3 className="text-sm font-bold text-gray-800">Data Peserta</h3>
          </div>

          {attemptedSubmit && (errors.nama || errors.whatsapp || errors.deskripsi) && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3 text-red-700 animate-in fade-in duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-xs">
                <p className="font-bold">Data peserta belum lengkap</p>
                <p className="text-red-600/90 mt-0.5">Mohon lengkapi seluruh kolom bertanda bintang (<span className="text-red-500 font-bold">*</span>) di bawah ini.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder-gray-400 ${
                    errors.nama
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-400 focus:border-red-500"
                      : "border-gray-300 bg-white focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                  }`}
                  value={nama}
                  onChange={(e) => {
                    const val = e.target.value
                    setNama(val)
                    if (attemptedSubmit) {
                      setErrors((prev) => ({ ...prev, nama: val.trim() ? undefined : "Nama lengkap wajib diisi." }))
                    }
                  }}
                />
                {errors.nama && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.nama}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  No WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder-gray-400 ${
                    errors.whatsapp
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-400 focus:border-red-500"
                      : "border-gray-300 bg-white focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                  }`}
                  value={whatsapp}
                  onChange={(e) => {
                    const val = e.target.value
                    setWhatsapp(val)
                    if (attemptedSubmit) {
                      if (!val.trim()) {
                        setErrors((prev) => ({ ...prev, whatsapp: "Nomor WhatsApp wajib diisi." }))
                      } else if (!/^[0-9+-\s]{8,16}$/.test(val.trim())) {
                        setErrors((prev) => ({ ...prev, whatsapp: "Nomor WhatsApp minimal 8 digit angka." }))
                      } else {
                        setErrors((prev) => ({ ...prev, whatsapp: undefined }))
                      }
                    }
                  }}
                />
                {errors.whatsapp && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.whatsapp}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">
                Deskripsi Ringkasan Hidup / Trauma <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ceritakan secara singkat keluhan, kondisi emosional, atau hal yang ingin Anda konsultasikan..."
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder-gray-400 resize-none ${
                  errors.deskripsi
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-400 focus:border-red-500"
                    : "border-gray-300 bg-white focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                }`}
                value={deskripsi}
                onChange={(e) => {
                  const val = e.target.value
                  setDeskripsi(val)
                  if (attemptedSubmit) {
                    setErrors((prev) => ({ ...prev, deskripsi: val.trim() ? undefined : "Deskripsi ringkasan hidup atau keluhan wajib diisi." }))
                  }
                }}
              />
              {errors.deskripsi ? (
                <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.deskripsi}
                </p>
              ) : (
                <p className="text-[11px] text-gray-500 mt-1">
                  Informasi ini akan membantu psikolog mempersiapkan sesi konseling Anda dengan lebih baik.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Box 2: Data Psikolog & Jadwal ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
            <h3 className="text-sm font-bold text-gray-800">Data Psikolog &amp; Jadwal yang Dipilih</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-center items-center sm:items-start sm:flex-row gap-4 h-full">
              <div className="w-[70px] h-[70px] rounded-full bg-[#E6D9E9] flex items-center justify-center shrink-0 text-[#561269] font-bold text-xl">
                {(qPsikologName ? qPsikologName.replace(/^(dr\.|drg\.|prof\.)\s*/i, "").slice(0, 2) : "EM").toUpperCase()}
              </div>
              <div className="text-center sm:text-left flex flex-col justify-center h-full pt-1">
                <div className="text-[10px] text-gray-500 mb-1">Psikolog Anda</div>
                <div className="text-sm font-extrabold text-[#561269]">
                  {qPsikologName ? (qPsikologName.includes(",") ? qPsikologName : `${qPsikologName}, M.Psi., Psikolog`) : "Psikolog Profesional Empathika"}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="shrink-0 text-[#561269]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Jadwal Sesi</div>
                  <div className="text-xs font-bold text-[#561269]">{qBottomDate}</div>
                  <div className="text-[10px] text-gray-500">{qBottomTime}</div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="shrink-0 text-[#561269]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Layanan Konsultasi</div>
                  <div className="text-sm font-bold text-[#561269]">{qLayanan}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Box 3: Metode Pembayaran ── */}
        <div id="box-metode-pembayaran" className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] scroll-mt-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">3</div>
            <h3 className="text-sm font-bold text-gray-800">
              Pilih Metode Pembayaran <span className="text-red-500">*</span>
            </h3>
          </div>

          {errors.metodePembayaran && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2 mb-4 animate-in fade-in duration-150">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errors.metodePembayaran}</span>
            </div>
          )}

          {errors.detailMetode && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium flex items-center gap-2 mb-4 animate-in fade-in duration-150">
              <svg className="w-4 h-4 shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errors.detailMetode}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-8">
            {paymentOptions.map((opt) => {
              const isActive = metodePembayaran === opt.id
              return (
                <div key={opt.id} className={`rounded-2xl border transition-all overflow-hidden ${isActive ? "border-[#561269] ring-1 ring-[#561269]" : "border-gray-200"}`}>

                  {/* Tombol header metode */}
                  <button
                    type="button"
                    onClick={() => handleSelectPayment(opt.id)}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${isActive ? "bg-[#F8EFFF]" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {opt.icon}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{opt.label}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      strokeWidth={2} stroke="currentColor"
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Konten inline — hanya muncul jika aktif */}
                  {isActive && (
                    <div className="border-t border-[#EDE0F2] bg-[#FDFBFF] px-4 pb-4 pt-4 flex flex-col gap-3">

                      {/* ─── E-Wallet ─── */}
                      {opt.id === "ewallet" && (
                        <>
                          <p className="text-[11px] font-semibold text-gray-500 mb-1">Pilih E-Wallet</p>
                          <div className="flex flex-col gap-2">
                            {EWALLET_LIST.map((ew) => {
                              const isSelected = selectedEwallet === ew.id
                              return (
                                <div
                                  key={ew.id}
                                  className={`rounded-xl border transition-all overflow-hidden ${isSelected
                                      ? "border-[#561269] bg-[#FAF5FC] shadow-sm"
                                      : "border-gray-200 bg-white hover:bg-gray-50"
                                    }`}
                                >
                                  {/* Baris item */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = isSelected ? null : ew.id
                                      setSelectedEwallet(next)
                                      if (attemptedSubmit) {
                                        setErrors((prev) => ({ ...prev, detailMetode: next ? undefined : "Silakan pilih jenis e-wallet yang ingin digunakan." }))
                                      }
                                    }}
                                    className="w-full flex items-center gap-3 px-3.5 py-3 text-sm text-left"
                                  >
                                    <span
                                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shrink-0"
                                      style={{ backgroundColor: ew.color }}
                                    >
                                      {ew.name.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span className="font-semibold text-gray-800">{ew.name}</span>
                                    <div className="ml-auto flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300 bg-white"}`}>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                      </div>
                                    </div>
                                  </button>

                                  {/* Petunjuk pembayaran via Xendit gateway */}
                                  {isSelected && (
                                    <div className="border-t border-[#EDE0F2] bg-white px-4 py-2.5 flex items-center gap-2 mx-2 mb-2 rounded-lg text-xs text-gray-600">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#561269" className="w-4 h-4 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-6-3.75h.008v.008H7.5v-.008Zm0 3.75h.008v.008H7.5v-.008Z" />
                                      </svg>
                                      <span className="text-[11px] leading-relaxed">
                                        Kamu akan langsung diarahkan ke aplikasi <strong className="text-gray-900">{ew.name}</strong> atau barcode QRIS otomatis saat menekan tombol bayar.
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}

                      {/* ─── Transfer Bank ─── */}
                      {opt.id === "bank" && (
                        <>
                          <p className="text-[11px] font-semibold text-gray-500 mb-1">Pilih Bank Tujuan</p>
                          <div className="flex flex-col gap-2">
                            {BANK_LIST.map((bank) => {
                              const isSelected = selectedBank === bank.id
                              return (
                                <div
                                  key={bank.id}
                                  className={`rounded-xl border transition-all overflow-hidden ${isSelected
                                      ? "border-[#561269] bg-[#FAF5FC] shadow-sm"
                                      : "border-gray-200 bg-white hover:bg-gray-50"
                                    }`}
                                >
                                  {/* Baris item */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = isSelected ? null : bank.id
                                      setSelectedBank(next)
                                      if (attemptedSubmit) {
                                        setErrors((prev) => ({ ...prev, detailMetode: next ? undefined : "Silakan pilih bank tujuan transfer." }))
                                      }
                                    }}
                                    className="w-full flex items-center gap-3 px-3.5 py-3 text-sm text-left"
                                  >
                                    <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-extrabold text-blue-700 shrink-0">
                                      {bank.name.slice(0, 3)}
                                    </span>
                                    <span className="font-semibold text-gray-800">Bank {bank.name}</span>
                                    <div className="ml-auto flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300 bg-white"}`}>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                      </div>
                                    </div>
                                  </button>

                                  {/* Detail VA langsung di bawah bank yang diklik */}
                                  {isSelected && (
                                    <div className="border-t border-[#EDE0F2] bg-white px-4 py-3 flex flex-col gap-1 mx-2 mb-2 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[7px] font-extrabold text-blue-700 shrink-0">
                                          {bank.name.slice(0, 3)}
                                        </span>
                                        <p className="text-[11px] text-gray-500 font-medium">Nomor Virtual Account Bank {bank.name}</p>
                                      </div>
                                      <div className="flex items-center justify-between gap-2 mt-0.5">
                                        <span className="text-base sm:text-lg font-extrabold text-[#561269] tracking-wider">{bank.va}</span>
                                        <CopyButton text={bank.va} />
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-0.5">Berlaku selama 24 jam · a.n. Empathika Indonesia</p>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}

                      {/* ─── QRIS ─── */}
                      {opt.id === "qris" && (
                        <div className="flex flex-col items-center gap-3 py-2">
                          <p className="text-[11px] text-gray-500 font-medium text-center">
                            Scan QRIS di bawah ini untuk melakukan pembayaran
                          </p>
                          <div className="relative w-[168px] h-[168px] bg-white border-2 border-[#561269] rounded-xl p-3 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-[#561269]" xmlns="http://www.w3.org/2000/svg">
                              <rect x="5" y="5" width="28" height="28" rx="3" fill="currentColor" opacity="0.12" />
                              <rect x="8" y="8" width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
                              <rect x="13" y="13" width="12" height="12" rx="1" fill="currentColor" />
                              <rect x="67" y="5" width="28" height="28" rx="3" fill="currentColor" opacity="0.12" />
                              <rect x="70" y="8" width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
                              <rect x="75" y="13" width="12" height="12" rx="1" fill="currentColor" />
                              <rect x="5" y="67" width="28" height="28" rx="3" fill="currentColor" opacity="0.12" />
                              <rect x="8" y="70" width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
                              <rect x="13" y="75" width="12" height="12" rx="1" fill="currentColor" />
                              {[38, 43, 48, 53, 58, 63].map((x) =>
                                [8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88].map((y) =>
                                  (x + y) % 10 < 5 ? <rect key={`p1-${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.5" fill="currentColor" opacity="0.65" /> : null
                                )
                              )}
                              {[8, 13, 18, 23, 28, 33].map((x) =>
                                [38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88].map((y) =>
                                  (x + y) % 8 < 4 ? <rect key={`p2-${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.5" fill="currentColor" opacity="0.65" /> : null
                                )
                              )}
                              {[68, 73, 78, 83, 88].map((x) =>
                                [38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88].map((y) =>
                                  (x * y) % 7 < 3 ? <rect key={`p3-${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.5" fill="currentColor" opacity="0.65" /> : null
                                )
                              )}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 bg-white rounded-lg border border-[#DCD0E1] shadow-sm flex items-center justify-center">
                                <span className="text-[8px] font-extrabold text-[#561269] leading-tight text-center">QRIS</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-[#561269]">Empathika Indonesia</p>
                            <p className="text-[10px] text-gray-400">Total: Rp 350.000</p>
                          </div>
                          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                            Berlaku untuk semua aplikasi pembayaran<br />(GoPay, OVO, DANA, dll)
                          </p>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pricing Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Biaya Konsultasi</span>
              <span className="text-xs font-medium text-gray-500">Rp 350.000</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-extrabold text-[#561269]">Total Bayar</span>
              <span className="text-sm font-extrabold text-[#561269]">Rp 350.000</span>
            </div>

            {attemptedSubmit && Object.keys(errors).some((k) => errors[k as keyof typeof errors]) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-2 text-red-600 text-xs font-semibold animate-in fade-in duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Harap periksa dan lengkapi kolom yang bertanda merah di atas.</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full font-bold text-sm py-4 rounded-xl shadow-sm transition-colors flex justify-center items-center ${
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#EAB308] hover:bg-[#FACC15] text-black cursor-pointer"
              }`}
            >
              {isSubmitting ? "Memproses Booking..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">{qBottomDate}</div>
          <div className="text-sm sm:text-[17px] font-bold text-black flex items-center gap-1.5 flex-wrap">
            <span>{qBottomTime}</span>
          </div>
        </div>
        <Link
          href="/konseling/jadwal"
          className="bg-white border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          Kembali
        </Link>
      </div>

    </div>
  )
}
