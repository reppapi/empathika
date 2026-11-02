"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { bookingService } from "@/services/booking.service"
import {
  CONFIGS,
  PaymentPendingType,
} from "./payment-pending/payment-pending.config"
import { PendingStepper } from "./payment-pending/PendingStepper"
import { PendingStatusSection } from "./payment-pending/PendingStatusSection"
import { PendingTicketCard } from "./payment-pending/PendingTicketCard"
import { PendingBottomWarning } from "./payment-pending/PendingBottomWarning"

export type { PaymentPendingType }

function PendingContent({ type }: { type: PaymentPendingType }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const config = CONFIGS[type] || CONFIGS.event

  const nama = searchParams.get("nama") ?? "PESERTA"
  const email = searchParams.get("email") ?? ""
  const whatsapp = searchParams.get("whatsapp") ?? ""
  const deskripsi = searchParams.get("deskripsi") ?? ""
  const orderId = searchParams.get("orderId") ?? "W-EMP-0000"
  const bookingId = searchParams.get("bookingId") ?? ""
  const slotId = searchParams.get("slotId") ?? ""
  const psikologId = searchParams.get("psikologId") ?? ""
  const psikologName = searchParams.get("psikologName") ?? ""
  const tanggal = searchParams.get("tanggal") ?? config.defaultTanggal
  const tahun = searchParams.get("tahun") ?? "2026"
  const waktu = searchParams.get("waktu") ?? config.defaultWaktu
  const judul = searchParams.get("judul") ?? config.defaultJudul
  const subjudul = searchParams.get("subjudul") ?? config.defaultSubjudul
  const testId = searchParams.get("testId")
  const kategori = searchParams.get("kategori") ?? (type === "konseling" ? "Konseling" : "Seminar")
  const harga = searchParams.get("harga") ?? config.defaultHarga
  const bottomDate = searchParams.get("bottomDate") ?? "31 Agu 2026"
  const bottomTime = searchParams.get("bottomTime") ?? "13:30 WIB (Online)"
  const metode = searchParams.get("metode") ?? "qris"
  const bank = searchParams.get("bank")
  const ewallet = searchParams.get("ewallet")
  const tipe = searchParams.get("tipe")
  const linkMeet = searchParams.get("linkMeet")
  const linkWa = searchParams.get("linkWa")

  // Timer mundur 5 menit (300 detik)
  const [seconds, setSeconds] = useState(300)
  // Fase: "waiting" → "checking" → "confirmed" | "failed"
  const [phase, setPhase] = useState<"waiting" | "checking" | "confirmed" | "failed">("waiting")
  // Animasi titik-titik
  const [dots, setDots] = useState(".")

  // Countdown timer
  useEffect(() => {
    if (phase === "confirmed" || phase === "failed") return
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id)
          setPhase("failed")
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  // Animasi dots
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500)
    return () => clearInterval(id)
  }, [])

  // Simulasi verifikasi otomatis
  useEffect(() => {
    const sim = searchParams.get("sim")
    if (sim === "failed") {
      const t1 = setTimeout(() => setPhase("checking"), 3000)
      const t2 = setTimeout(() => setPhase("failed"), 6000)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }

    const t1 = setTimeout(() => setPhase("checking"), 8000)
    const t2 = setTimeout(() => setPhase("confirmed"), 13000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [searchParams])

  const fallbackCreatedRef = useRef(false)

  // Ketika confirmed → konfirmasi backend jika konseling, lalu redirect ke success
  useEffect(() => {
    if (phase !== "confirmed") return

    if (type === "konseling") {
      if (bookingId) {
        bookingService.confirmPayment(bookingId).catch(() => {})
      } else if (whatsapp && nama && !fallbackCreatedRef.current) {
        fallbackCreatedRef.current = true
        bookingService
          .createBooking({
            id_jadwal: slotId || undefined,
            id_psikolog: psikologId || undefined,
            metode: metode.toUpperCase() === "OFFLINE" ? "OFFLINE" : "ONLINE",
            deskripsi_trauma: deskripsi,
            klien: {
              nama: nama.toUpperCase(),
              no_telepon: whatsapp,
            },
          })
          .then((res: any) => {
            if (res?.id) {
              bookingService.confirmPayment(res.id).catch(() => {})
            }
          })
          .catch(() => {})
      }
    }

    const t = setTimeout(() => {
      const params = new URLSearchParams({
        nama,
        ...(email && { email }),
        ...(whatsapp && { whatsapp }),
        orderId,
        tanggal,
        tahun,
        waktu,
        judul,
        subjudul,
        kategori,
        harga,
        metode,
        ...(bottomDate && { bottomDate }),
        ...(bottomTime && { bottomTime }),
        ...(testId && { testId }),
        ...(bank && { bank }),
        ...(ewallet && { ewallet }),
        ...(psikologName && { psikologName }),
        ...(tipe && { tipe }),
        ...(linkMeet && { linkMeet }),
        ...(linkWa && { linkWa }),
      })
      router.push(`${config.successHref}?${params.toString()}`)
    }, 2000)

    return () => clearTimeout(t)
  }, [
    phase,
    type,
    config.successHref,
    bookingId,
    whatsapp,
    nama,
    slotId,
    psikologId,
    metode,
    deskripsi,
    orderId,
    tanggal,
    tahun,
    waktu,
    judul,
    subjudul,
    kategori,
    harga,
    bottomDate,
    bottomTime,
    testId,
    bank,
    ewallet,
    psikologName,
    email,
    router,
  ])

  const handleBackToPayment = (reason?: string) => {
    const params = new URLSearchParams({
      status: "failed",
      reason: reason || "Pembayaran dibatalkan atau waktu pembayaran telah habis.",
      ...(nama && { nama }),
      ...(email && { email }),
      ...(whatsapp && { whatsapp }),
      ...(deskripsi && { deskripsi }),
      ...(judul && { judul }),
      ...(subjudul && { subjudul }),
      ...(testId && { testId }),
      ...(kategori && { kategori }),
      ...(harga && { harga }),
      ...(metode && { metode }),
      ...(bank && { bank }),
      ...(ewallet && { ewallet }),
    })
    router.push(`${config.checkoutHref}?${params.toString()}`)
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  const metodeLabel =
    metode === "bank"
      ? `Virtual Account Bank ${bank?.toUpperCase() ?? ""}`
      : metode === "ewallet"
        ? `E-Wallet ${ewallet ?? ""}`
        : "QRIS"

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32">
      {/* Stepper jika tipe konseling */}
      {config.showStepper && <PendingStepper />}

      {/* Main Content */}
      <div
        className={`max-w-[700px] mx-auto px-4 sm:px-6 flex flex-col items-center ${
          config.showStepper ? "mt-8" : "pt-24 sm:pt-32"
        }`}
      >
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269]">
            Menunggu Pembayaran
          </h1>
        </div>

        {/* Pending Card */}
        <div className="w-full bg-white rounded-3xl border border-[#DCD0E1] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden relative pb-10">
          {/* Top Gradient */}
          <div className="h-24 w-full bg-gradient-to-b from-[#E6D9E9]/50 to-white absolute top-0 left-0" />

          <div className="relative z-10 flex flex-col items-center px-6 pt-10">
            {/* 1. Indikator Status & Timer */}
            <PendingStatusSection
              phase={phase}
              dots={dots}
              config={config}
              mm={mm}
              ss={ss}
              onRetry={handleBackToPayment}
            />

            {/* 2. Rincian Tiket */}
            <PendingTicketCard
              judul={judul}
              subjudul={subjudul}
              tanggal={tanggal}
              tahun={tahun}
              waktu={waktu}
              nama={nama}
              orderId={orderId}
              metodeLabel={metodeLabel}
              harga={harga}
              config={config}
            />

            {/* 3. Peringatan & Tombol Batal */}
            {phase === "waiting" && (
              <PendingBottomWarning
                warningText={config.warningText}
                seconds={seconds}
                onCancel={handleBackToPayment}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Public Export ─────────────────────────────────────────────────────────────
export default function PaymentPendingClient({ type }: { type: PaymentPendingType }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-poppins text-gray-500 text-sm">
          Memuat...
        </div>
      }
    >
      <PendingContent type={type} />
    </Suspense>
  )
}
