"use client"

import Link from "next/link"
import Script from "next/script"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { adminService } from "@/services/admin.service"
import { formatOrderId } from "@/lib/utils"
import { Video, MessageCircle, ExternalLink, KeyRound, Copy, Check } from "lucide-react"

// ─── Konfigurasi per tipe pembayaran ──────────────────────────────────────────
export type PaymentType = "konseling" | "event" | "psikotes"

interface Config {
  tanggalLabel: string
  waktuLabel: string
  showStepper: boolean
  backHref: string
  backLabel: string
}

const CONFIGS: Record<PaymentType, Config> = {
  konseling: {
    tanggalLabel: "TANGGAL KONSULTASI",
    waktuLabel: "WAKTU KONSULTASI",
    showStepper: true,
    backHref: "/",
    backLabel: "Kembali",
  },
  event: {
    tanggalLabel: "TANGGAL ACARA",
    waktuLabel: "WAKTU ACARA",
    showStepper: false,
    backHref: "/",
    backLabel: "Kembali ke Home",
  },
  psikotes: {
    tanggalLabel: "TANGGAL TRANSAKSI",
    waktuLabel: "WAKTU TRANSAKSI",
    showStepper: false,
    backHref: "/psikotes",
    backLabel: "Kembali ke Psikotes",
  },
}

// ─── Stepper Component ────────────────────────────────────────────────────────
function Stepper() {
  const steps = ["paket", "jadwal", "Bayar"]
  return (
    <div className="w-full pt-32 pb-10 flex flex-col items-center bg-white border-b border-gray-100">
      <div className="flex items-center w-full max-w-sm justify-center px-4">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#7AC143] text-white flex items-center justify-center font-medium mb-2 shadow-sm text-sm">
                {i + 1}
              </div>
              <span className="text-[10px] sm:text-xs text-gray-700">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-[2px] bg-[#7AC143] w-16 sm:w-24 mx-2 mb-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Inner Content (akses useSearchParams di sini) ───────────────────────────
function PaymentSuccessContent({ type }: { type: PaymentType }) {
  const router = useRouter()
  const cfg = CONFIGS[type]
  const searchParams = useSearchParams()

  const nama = searchParams.get("nama") ?? "PESERTA"
  const rawOrderId = searchParams.get("orderId") ?? "W-EMP-0000"
  const orderId = formatOrderId(rawOrderId)
  const tanggal = searchParams.get("tanggal") ?? "31/08"
  const tahun = searchParams.get("tahun") ?? "2026"
  const waktu = searchParams.get("waktu") ?? "13:30"
  const rawJudul = searchParams.get("judul")
  const isAsesmen = Boolean(
    (rawJudul && rawJudul.toLowerCase().includes("asesmen")) ||
    (searchParams.get("kategori") && searchParams.get("kategori")!.toLowerCase().includes("asesmen"))
  )
  const judul =
    rawJudul === "Tes Psikotes Empathika"
      ? "Paket Psikotes"
      : (rawJudul ?? (isAsesmen ? "Layanan Asesmen Offline" : (type === "konseling" ? "Layanan Konsultasi" : type === "psikotes" ? "Paket Psikotes" : "Event Empathika")))
  const subjudul =
    searchParams.get("subjudul") === "Tes Psikotes Empathika"
      ? ""
      : (searchParams.get("subjudul") ?? (isAsesmen ? "Sesi Asesmen Klinis di Klinik Empathika" : (type === "konseling" ? "Psikolog Profesional Empathika" : "")))
  const bottomDate = searchParams.get("bottomDate") ?? `${tanggal} ${tahun}`
  const bottomTime = searchParams.get("bottomTime") ?? `${waktu} WIB`
  const metode = searchParams.get("metode") ?? "qris"
  const bank = searchParams.get("bank")
  const ewallet = searchParams.get("ewallet")
  const kategori = searchParams.get("kategori") ?? ""
  const tipe = searchParams.get("tipe") ?? "Online"
  const linkMeet = searchParams.get("linkMeet")
  const linkWa = searchParams.get("linkWa")
  const isOnlineEvent = type === "event" && tipe !== "Offline"

  const testId = searchParams.get("testId")
  const backTarget = testId ? `/psikotes/${testId}` : cfg.backHref

  // Tangani gestur back-swipe browser / mobile agar tidak terjebak di alur pending / checkout
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      router.replace(backTarget as any);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [backTarget, router]);

  const isPsikotes =
    type === "psikotes" ||
    Boolean(testId) ||
    kategori.toLowerCase().includes("psikotes") ||
    judul.toLowerCase().includes("mbti") ||
    judul.toLowerCase().includes("love language") ||
    judul.toLowerCase().includes("kepribadian") ||
    orderId.startsWith("PSI-")

  useEffect(() => {
    if (isPsikotes && nama && nama !== "PESERTA") {
      try {
        let existingWa = "";
        let existingEmail = "";
        const rawOld = localStorage.getItem("empathika_peserta_psikotes");
        if (rawOld) {
          const parsed = JSON.parse(rawOld);
          existingWa = parsed.no_telepon || parsed.whatsapp || "";
          existingEmail = parsed.email || "";
        }

        const finalWa = searchParams.get("whatsapp") || existingWa;
        const finalEmail = searchParams.get("email") || existingEmail;
        const finalBookingId = searchParams.get("bookingId") || undefined;

        localStorage.setItem(
          "empathika_peserta_psikotes",
          JSON.stringify({
            nama,
            no_telepon: finalWa,
            whatsapp: finalWa,
            email: finalEmail,
            orderId,
            ...(finalBookingId && { bookingId: finalBookingId }),
          })
        )
      } catch {}
    }
  }, [isPsikotes, nama, searchParams, orderId])

  const getTestStartUrl = () => {
    let savedWa = "";
    let savedEmail = "";
    try {
      const raw = localStorage.getItem("empathika_peserta_psikotes");
      if (raw) {
        const parsed = JSON.parse(raw);
        savedWa = parsed.no_telepon || parsed.whatsapp || "";
        savedEmail = parsed.email || "";
      }
    } catch {}

    const q = new URLSearchParams()
    q.set("paket", "berbayar")
    // Nama peserta tidak di-prefill dengan nama pembeli agar peserta dapat mengisi identitas sendiri
    const wa = searchParams.get("whatsapp") || savedWa
    if (wa) q.set("whatsapp", wa)
    const em = searchParams.get("email") || savedEmail
    if (em) q.set("email", em)
    const bookingId = searchParams.get("bookingId")
    if (bookingId) q.set("bookingId", bookingId)
    if (orderId) q.set("orderId", orderId)

    const queryString = q.toString()
    if (testId) return `/psikotes/${testId}/mulai?${queryString}`
    const j = judul.toLowerCase()
    if (j.includes("dass") || j.includes("stres") || j.includes("emosional")) return `/psikotes/dass-42/mulai?${queryString}`
    if (j.includes("love")) return `/psikotes/love-language/mulai?${queryString}`
    if (j.includes("lanjutan") || j.includes("mbti-2")) return `/psikotes/mbti-2/mulai?${queryString}`
    return `/psikotes/mbti/mulai?${queryString}`
  }

  const [copiedTicket, setCopiedTicket] = useState(false)
  const handleCopyTicket = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(orderId)
      setCopiedTicket(true)
      setTimeout(() => setCopiedTicket(false), 2000)
    }
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://empathika.id"
  const psikotesAccessUrl = testId ? `${baseUrl}/psikotes/${testId}?kode=${orderId}` : `${baseUrl}/psikotes?kode=${orderId}`
  const shareWhatsAppText = `Halo! Ini adalah kode akses untuk tes psikotes di Empathika:
*Paket:* ${judul}
*Kode Akses:* ${orderId}
*Pemesan:* ${nama}

*Link Pengerjaan:*
${psikotesAccessUrl}

Silakan buka link di atas dan masukkan kode akses tersebut untuk mulai mengerjakan tes. Selesaikan tes dalam satu sesi agar jawaban tersimpan dengan baik.`

  const shareWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareWhatsAppText)}`

  const [adminPhone, setAdminPhone] = useState<string>("+62 878-7878-5498")

  useEffect(() => {
    const syncAdminPhone = () => {
      // 1. Cek cache lokal profil admin (instan)
      try {
        const saved = localStorage.getItem("empathika_admin_profile")
        if (saved) {
          const parsed = JSON.parse(saved)
          const p = parsed.noTelepon || parsed.no_telepon
          if (p && p !== "081234567890" && p !== "08123456789") {
            setAdminPhone(p)
          } else {
            setAdminPhone("+62 878-7878-5498")
            localStorage.setItem(
              "empathika_admin_profile",
              JSON.stringify({ ...parsed, noTelepon: "+62 878-7878-5498", no_telepon: "+62 878-7878-5498" })
            )
          }
        }
      } catch {}

      // 2. Ambil data profil resmi terbaru dari database backend (PostgreSQL)
      adminService
        .getPublicProfile()
        .then((res) => {
          if (res?.data) {
            const p = res.data.no_telepon || res.data.noTelepon
            if (p && p !== "081234567890" && p !== "08123456789") {
              setAdminPhone(p)
              try {
                const saved = localStorage.getItem("empathika_admin_profile")
                const existing = saved ? JSON.parse(saved) : {}
                localStorage.setItem(
                  "empathika_admin_profile",
                  JSON.stringify({ ...existing, noTelepon: p, no_telepon: p })
                )
              } catch {}
            } else {
              setAdminPhone("+62 878-7878-5498")
            }
          }
        })
        .catch(() => {})
    }

    syncAdminPhone()
    window.addEventListener("storage", syncAdminPhone)
    window.addEventListener("focus", syncAdminPhone)
    window.addEventListener("empathika_admin_profile_updated", syncAdminPhone)

    return () => {
      window.removeEventListener("storage", syncAdminPhone)
      window.removeEventListener("focus", syncAdminPhone)
      window.removeEventListener("empathika_admin_profile_updated", syncAdminPhone)
    }
  }, [])

  const cleanDigits = (adminPhone || "").replace(/\D/g, "")
  const isLegacyDummy = !cleanDigits || cleanDigits === "081234567890" || cleanDigits === "6281234567890"
  const finalWaNumber = isLegacyDummy
    ? "6287878785498"
    : cleanDigits.startsWith("0")
    ? "62" + cleanDigits.slice(1)
    : cleanDigits.startsWith("62")
    ? cleanDigits
    : "62" + cleanDigits

  const displayWaNumber =
    finalWaNumber === "6287878785498"
      ? "+62 878-7878-5498"
      : `+${finalWaNumber.slice(0, 2)} ${finalWaNumber.slice(2, 5)}-${finalWaNumber.slice(5, 9)}-${finalWaNumber.slice(9)}`

  const metodeLabel =
    metode === "bank"
      ? `Virtual Account Bank ${bank?.toUpperCase() ?? ""}`
      : metode === "ewallet"
      ? `E-Wallet ${ewallet ?? ""}`
      : "QRIS"

  const waMessage = `Halo Admin Empathika, saya baru saja melakukan pembayaran untuk ${judul}. Order ID: ${orderId} atas nama ${nama}`
  const waAdminUrl = `https://wa.me/${finalWaNumber}?text=${encodeURIComponent(waMessage)}`

  const handleDownload = () => {
    const ticket = document.getElementById("ticket-container")
    if (ticket && (window as any).html2canvas) {
      ;(window as any)
        .html2canvas(ticket, { scale: 2, backgroundColor: "#FAFAFA" })
        .then((canvas: HTMLCanvasElement) => {
          const link = document.createElement("a")
          link.download = `bukti-${isPsikotes ? "psikotes" : type}-${orderId}.png`
          link.href = canvas.toDataURL("image/png")
          link.click()
        })
    } else {
      alert("Sedang memuat sistem download, silakan coba beberapa detik lagi.")
    }
  }

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        strategy="lazyOnload"
      />

      {/* Stepper — hanya untuk konseling */}
      {cfg.showStepper && <Stepper />}

      {/* Main Content */}
      <div className={`max-w-[700px] mx-auto px-4 sm:px-6 flex flex-col items-center ${cfg.showStepper ? "mt-8" : "pt-24 sm:pt-32"}`}>

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269]">
            Ringkasan &amp; Pembayaran
          </h1>
        </div>

        {/* Success Card */}
        <div className="w-full bg-white rounded-3xl border border-[#DCD0E1] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden relative pb-10">

          {/* Top Gradient */}
          <div className="h-24 w-full bg-gradient-to-b from-[#E6D9E9]/50 to-white absolute top-0 left-0" />

          <div className="relative z-10 flex flex-col items-center px-6 pt-10">

            <h2 className="text-xl sm:text-2xl font-extrabold text-black mb-8">
              Transaksi Berhasil
            </h2>

            {/* Checkmark */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#9CD689] flex items-center justify-center mb-6 shadow-[0_4px_15px_rgba(156,214,137,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-[#2E681C]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>

            <div className="text-center mb-8 max-w-sm">
              <p className="text-sm font-semibold text-gray-700 mb-1">Transaksi anda berhasil!</p>
              <p className="text-xs text-gray-500">
                Silahkan simpan bukti pembayaran untuk keperluan apabila dibutuhkan
              </p>
            </div>

            {/* Tiket */}
            <div
              id="ticket-container"
              className="w-full max-w-md rounded-xl border border-dashed border-[#C3A4CE] bg-[#FCFAFD] p-6 mb-8"
            >
              {/* Header Tiket */}
              <div className="border-b border-dashed border-[#C3A4CE] pb-5 mb-5">
                <h3 className="text-xl font-extrabold text-[#2F2F2F] leading-snug">{judul}</h3>
                {subjudul && !subjudul.toLowerCase().includes("tes psikotes empathika") && (
                  <p className="text-xs text-gray-500 mt-1">{subjudul}</p>
                )}
              </div>

              {/* Tanggal & Waktu — ukuran font diperkecil agar tidak mendominasi tiket */}
              <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-dashed border-[#C3A4CE]">
                <div>
                  <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    {isPsikotes ? "TANGGAL TRANSAKSI" : cfg.tanggalLabel}
                  </div>
                  <div className="text-sm font-bold text-[#2F2F2F] leading-snug">{tanggal}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase mt-0.5">TAHUN {tahun}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    {isPsikotes ? "WAKTU TRANSAKSI" : cfg.waktuLabel}
                  </div>
                  <div className="text-sm font-bold text-[#2F2F2F] leading-snug">{waktu}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase mt-0.5">WIB (Waktu Indonesia Barat)</div>
                </div>
              </div>

              {/* Nama, Order ID, & Metode Pembayaran */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-[#C3A4CE]">
                <div>
                  <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    NAMA PEMESAN
                  </div>
                  <div className="text-sm font-extrabold text-[#2F2F2F]">{nama}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    ORDER ID
                  </div>
                  <div className="text-xs font-bold text-[#2F2F2F]">{orderId}</div>
                </div>
              </div>

              {/* Keterangan Metode Pembayaran */}
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                    METODE PEMBAYARAN
                  </div>
                  <div className="text-xs font-extrabold text-[#561269]">
                    {metodeLabel}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  LUNAS
                </span>
              </div>

              {/* Akses Event: hanya Google Meet (di dalam tiket).
                  Tombol Gabung Grup WhatsApp dipindahkan ke luar tiket (Action Buttons). */}
              {type === "event" && isOnlineEvent && linkMeet && (
                <div className="pt-3.5 mt-3 border-t border-dashed border-[#DCD0E1] flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                    Akses Event Anda
                  </div>
                  <a
                    href={linkMeet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-between shadow-sm transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 shrink-0" />
                      <span>Gabung Google Meet</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}

              {/* Kode Akses Tiket Psikotes */}
              {isPsikotes && (
                <div className="pt-3.5 mt-3 border-t border-dashed border-[#DCD0E1]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#561269]" />
                      <span>KODE AKSES TIKET</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTicket}
                      className="text-[11px] font-bold text-[#561269] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedTicket ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Kode</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/60 flex items-center justify-between">
                    <span className="font-mono font-black text-sm sm:text-base text-[#561269] tracking-wider">
                      {orderId}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-normal">
                    1x akses tes • Berlaku 14 hari (2 minggu)
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col w-full max-w-xs gap-3">
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-lg border border-[#C3A4CE] bg-[#FCFAFD] text-[#561269] font-bold text-xs sm:text-sm hover:bg-[#F2E8F5] transition-colors"
              >
                Download Bukti
              </button>

              <div className="text-center mt-2">
                <p className="text-[10px] text-gray-500 mb-2 font-medium">
                  {isPsikotes
                    ? "Pembayaran paket psikotes berhasil! Tiket pengerjaan & akses hasil berlaku selama 14 hari. Silakan mulai tes sekarang atau simpan tiket untuk dikerjakan nanti."
                    : type === "event" && linkWa
                    ? "Bergabunglah ke grup WhatsApp untuk info event terbaru dan pengumuman penting."
                    : "Hubungi kontak ini setelah anda selesai melakukan pembayaran!"}
                </p>
                {isPsikotes ? (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href={getTestStartUrl() as any}
                      className="w-full py-3.5 rounded-xl bg-[#EAB308] hover:bg-[#FACC15] text-black font-extrabold text-xs sm:text-sm flex justify-center items-center gap-2 transition-colors shadow-sm"
                    >
                      <span>Mulai Tes Sekarang</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                ) : type === "event" && linkWa ? (
                  /* Tombol Gabung Grup WhatsApp — hanya muncul jika event memiliki link WA */
                  <a
                    href={linkWa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-lg bg-[#25D366] text-white font-bold text-xs sm:text-sm flex justify-center items-center gap-2 hover:bg-[#1DA851] transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    Gabung Grup WhatsApp
                  </a>
                ) : !isPsikotes ? (
                  /* Tombol Chat WA Admin — hanya untuk konseling & psikotes (bukan event) */
                  <a
                    href={waAdminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-lg bg-[#25D366] text-white font-bold text-xs sm:text-sm flex justify-center items-center gap-2 hover:bg-[#1DA851] transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                    </svg>
                    Chat WA Admin
                  </a>
                ) : null}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">{bottomDate}</div>
          <div className="text-sm sm:text-[17px] font-bold text-black">{bottomTime}</div>
        </div>
        <Link
          href={backTarget as any}
          className="bg-white border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          {cfg.backLabel}
        </Link>
      </div>
    </div>
  )
}

// ─── Public Export ────────────────────────────────────────────────────────────
export default function PaymentSuccessClient({ type }: { type: PaymentType }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-poppins text-gray-500">
          Memuat...
        </div>
      }
    >
      <PaymentSuccessContent type={type} />
    </Suspense>
  )
}
