"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// ── Komponen counting down + simulasi "cek pembayaran" ───────────────────────
function PendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nama      = searchParams.get("nama")      ?? "PESERTA"
  const email     = searchParams.get("email")     ?? ""
  const whatsapp  = searchParams.get("whatsapp")  ?? ""
  const orderId   = searchParams.get("orderId")   ?? "W-EMP-0000"
  const tanggal   = searchParams.get("tanggal")   ?? "05/09"
  const tahun     = searchParams.get("tahun")     ?? "2026"
  const waktu     = searchParams.get("waktu")     ?? "09:00"
  const judul     = searchParams.get("judul")     ?? "Workshop SEFT"
  const subjudul  = searchParams.get("subjudul")  ?? "Spiritual Emotional Freedom Technique"
  const testId    = searchParams.get("testId")
  const kategori  = searchParams.get("kategori")  ?? "Seminar"
  const harga     = searchParams.get("harga")     ?? "Rp 200.000"
  const metode    = searchParams.get("metode")    ?? "qris"
  const bank      = searchParams.get("bank")
  const ewallet   = searchParams.get("ewallet")

  // Timer mundur 5 menit (300 detik) — simulasi menunggu pembayaran
  const [seconds, setSeconds] = useState(300)
  // Fase: "waiting" → "checking" → "confirmed" | "failed"
  const [phase, setPhase]     = useState<"waiting" | "checking" | "confirmed" | "failed">("waiting")
  // Dots animasi
  const [dots, setDots]       = useState(".")

  // Countdown
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
    const id = setInterval(() => setDots((d) => d.length >= 3 ? "." : d + "."), 500)
    return () => clearInterval(id)
  }, [])

  // Simulasi: setelah 8 detik masuk fase "checking", 5 detik kemudian "confirmed"
  useEffect(() => {
    // Cek jika ada query param simulation 'sim=failed' untuk demo gagal otomatis
    const sim = searchParams.get("sim")
    if (sim === "failed") {
      const t1 = setTimeout(() => setPhase("checking"), 3000)
      const t2 = setTimeout(() => setPhase("failed"), 6000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }

    const t1 = setTimeout(() => setPhase("checking"), 8000)
    const t2 = setTimeout(() => setPhase("confirmed"),  13000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [searchParams])

  // Ketika confirmed → redirect ke success
  useEffect(() => {
    if (phase !== "confirmed") return
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
        ...(testId  && { testId }),
        ...(bank && { bank }),
        ...(ewallet && { ewallet }),
      })
      router.push(`/event/success?${params.toString()}`)
    }, 2000)
    return () => clearTimeout(t)
  }, [phase, nama, email, whatsapp, orderId, tanggal, tahun, waktu, judul, subjudul, kategori, harga, metode, testId, bank, ewallet, router])

  const handleBackToPayment = (reason?: string) => {
    const params = new URLSearchParams({
      status: "failed",
      reason: reason || "Pembayaran dibatalkan atau waktu pembayaran telah habis.",
      ...(nama && { nama }),
      ...(email && { email }),
      ...(whatsapp && { whatsapp }),
      ...(judul && { judul }),
      ...(subjudul && { subjudul }),
      ...(testId && { testId }),
      ...(kategori && { kategori }),
      ...(harga && { harga }),
      ...(metode && { metode }),
      ...(bank && { bank }),
      ...(ewallet && { ewallet }),
    })
    router.push(`/event/checkout?${params.toString()}`)
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  // Label metode
  const metodeLabel =
    metode === "bank"    ? `Virtual Account Bank ${bank?.toUpperCase() ?? ""}` :
    metode === "ewallet" ? `E-Wallet ${ewallet ?? ""}` :
    "QRIS"

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32">

      {/* Main Content */}
      <div className="max-w-[700px] mx-auto px-4 sm:px-6 flex flex-col items-center pt-24 sm:pt-32">

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269]">
            Menunggu Pembayaran
          </h1>
        </div>

        {/* Pending Card — Ukuran & style disamakan dengan Success Card */}
        <div className="w-full bg-white rounded-3xl border border-[#DCD0E1] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden relative pb-10">

          {/* Top Gradient */}
          <div className="h-24 w-full bg-gradient-to-b from-[#E6D9E9]/50 to-white absolute top-0 left-0" />

          <div className="relative z-10 flex flex-col items-center px-6 pt-10">

            {/* ── Fase: Waiting ── */}
            {phase === "waiting" && (
              <>
                <h2 className="text-xl sm:text-2xl font-extrabold text-black mb-6">
                  Menunggu Pembayaran{dots}
                </h2>

                {/* Spinner */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-6">
                  <svg className="w-full h-full animate-spin" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#EDE0F2" strokeWidth="6"/>
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#561269" strokeWidth="6"
                      strokeDasharray="90 130" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#561269" className="w-10 h-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                </div>

                <div className="text-center mb-6 max-w-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Silakan selesaikan pembayaran sebelum waktu habis
                  </p>
                  <p className="text-xs text-gray-500">
                    Sistem kami akan mendeteksi dan mengkonfirmasi pembayaran Anda secara otomatis.
                  </p>
                </div>

                {/* Timer */}
                <div className="flex flex-col items-center gap-1 mb-8">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">BATAS WAKTU PEMBAYARAN</p>
                  <div className="text-4xl sm:text-5xl font-extrabold text-[#561269] tabular-nums tracking-widest">
                    {mm}:{ss}
                  </div>
                </div>
              </>
            )}

            {/* ── Fase: Checking ── */}
            {phase === "checking" && (
              <>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#D97706] mb-6">
                  Memverifikasi Pembayaran{dots}
                </h2>

                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-6">
                  <svg className="w-full h-full animate-pulse" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#EAB308" strokeWidth="6"/>
                    <circle cx="40" cy="40" r="34" fill="#FEF9C3" strokeWidth="0"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#D97706" className="w-10 h-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                </div>

                <div className="text-center mb-8 max-w-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Mengecek Transaksi Masuk</p>
                  <p className="text-xs text-gray-500">
                    Sistem sedang memverifikasi dana transfer Anda. Mohon tunggu beberapa saat.
                  </p>
                </div>
              </>
            )}

            {/* ── Fase: Confirmed ── */}
            {phase === "confirmed" && (
              <>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#2E681C] mb-6">
                  Pembayaran Dikonfirmasi!
                </h2>

                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#9CD689] flex items-center justify-center mb-6 shadow-[0_4px_15px_rgba(156,214,137,0.4)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-[#2E681C]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>

                <div className="text-center mb-8 max-w-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Transaksi Anda Berhasil Diterima</p>
                  <p className="text-xs text-gray-500">
                    Mengarahkan ke halaman tiket bukti pembayaran{dots}
                  </p>
                </div>
              </>
            )}

            {/* ── Fase: Failed ── */}
            {phase === "failed" && (
              <>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#DC2626] mb-6">
                  Pembayaran Gagal
                </h2>

                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-100 flex items-center justify-center mb-6 shadow-[0_4px_15px_rgba(239,68,68,0.2)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12 text-[#DC2626]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </div>

                <div className="text-center mb-6 max-w-sm">
                  <p className="text-sm font-semibold text-gray-800 mb-1.5">
                    Transaksi Tidak Berhasil Diproses
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-5">
                    Waktu pembayaran telah berakhir atau transaksi ditolak. Tenang, data pemesanan tiket Anda tersimpan.
                  </p>
                  <button
                    onClick={() => handleBackToPayment("Pembayaran tidak berhasil atau waktu telah habis. Silakan ulangi proses pembayaran.")}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#561269] hover:bg-[#6e1886] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    Kembali &amp; Coba Bayar Lagi
                  </button>
                </div>
              </>
            )}

            {/* ── Ringkasan Tiket Pemesanan (Disamakan dengan layout tiket success) ── */}
            <div className="w-full max-w-md rounded-xl border border-dashed border-[#C3A4CE] bg-[#FCFAFD] p-6 mb-6">
              {/* Header Tiket */}
              <div className="border-b border-dashed border-[#C3A4CE] pb-5 mb-5">
                <h3 className="text-xl font-extrabold text-[#2F2F2F]">{judul}</h3>
                {subjudul && <p className="text-xs text-gray-500 mt-1">{subjudul}</p>}
              </div>

              {/* Tanggal & Waktu */}
              <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-dashed border-[#C3A4CE]">
                <div>
                  <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    TANGGAL ACARA
                  </div>
                  <div className="text-2xl font-extrabold text-[#2F2F2F]">{tanggal}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase">TAHUN {tahun}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    WAKTU ACARA
                  </div>
                  <div className="text-2xl font-extrabold text-[#2F2F2F]">{waktu}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase">WIB - SELESAI</div>
                </div>
              </div>

              {/* Nama & Order ID */}
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

              {/* Keterangan Metode Pembayaran & Total */}
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                    METODE PEMBAYARAN
                  </div>
                  <div className="text-xs font-extrabold text-[#561269]">
                    {metodeLabel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                    TOTAL TAGIHAN
                  </div>
                  <div className="text-sm font-extrabold text-[#561269]">
                    Rp 200.000
                  </div>
                </div>
              </div>
            </div>

            {/* Peringatan & Tombol Batal */}
            {phase === "waiting" && (
              <div className="w-full max-w-md flex flex-col items-center gap-4">
                <div className="w-full rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex gap-2.5 items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#D97706" className="w-5 h-5 shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <p className="text-xs text-amber-800 font-medium">
                    Jangan tutup halaman ini. Setelah proses transfer dilakukan, sistem akan mengkonfirmasi status tiket Anda.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B3A9C] to-[#651877] rounded-full transition-all duration-1000"
                      style={{ width: `${((300 - seconds) / 300) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-gray-400">0:00</span>
                    <span className="text-[10px] text-gray-400">5:00</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBackToPayment("Pembayaran dibatalkan oleh pengguna.")}
                  className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors mt-2"
                >
                  Batalkan &amp; kembali ke pembayaran
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Public Export ─────────────────────────────────────────────────────────────
export default function EventPendingClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center font-poppins text-gray-500 text-sm">
        Memuat...
      </div>
    }>
      <PendingContent />
    </Suspense>
  )
}
