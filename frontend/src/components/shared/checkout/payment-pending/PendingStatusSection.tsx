import { PendingConfig } from "./payment-pending.config"

interface PendingStatusSectionProps {
  phase: "waiting" | "checking" | "confirmed" | "failed"
  dots: string
  config: PendingConfig
  mm: string
  ss: string
  onRetry: (reason?: string) => void
}

export function PendingStatusSection({
  phase,
  dots,
  config,
  mm,
  ss,
  onRetry,
}: PendingStatusSectionProps) {
  return (
    <>
      {/* ── Fase: Waiting ── */}
      {phase === "waiting" && (
        <>
          <h2 className="text-xl sm:text-2xl font-extrabold text-black mb-6">
            Menunggu Pembayaran{dots}
          </h2>

          {/* Spinner */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-6">
            <svg className="w-full h-full animate-spin" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#EDE0F2" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#561269"
                strokeWidth="6"
                strokeDasharray="90 130"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#561269"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-6 max-w-sm">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              {config.waitingSubtext}
            </p>
            <p className="text-xs text-gray-500">
              Sistem kami akan mendeteksi dan mengkonfirmasi pembayaran secara otomatis.
            </p>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-center gap-1 mb-8">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              BATAS WAKTU PEMBAYARAN
            </p>
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
              <circle cx="40" cy="40" r="34" fill="none" stroke="#EAB308" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="#FEF9C3" strokeWidth="0" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="#D97706"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8 max-w-sm">
            <p className="text-sm font-semibold text-gray-700 mb-1">Mengecek Transaksi Masuk</p>
            <p className="text-xs text-gray-500">{config.checkingSubtext}</p>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-12 h-12 text-[#2E681C]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <div className="text-center mb-8 max-w-sm">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Transaksi Anda Berhasil Diterima
            </p>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-12 h-12 text-[#DC2626]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>

          <div className="text-center mb-6 max-w-sm">
            <p className="text-sm font-semibold text-gray-800 mb-1.5">
              Transaksi Tidak Berhasil Diproses
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              Waktu pembayaran telah berakhir atau transaksi ditolak. Tenang, data pemesanan
              Anda tersimpan.
            </p>
            <button
              onClick={() =>
                onRetry(
                  "Pembayaran tidak berhasil atau waktu telah habis. Silakan ulangi proses pembayaran."
                )
              }
              className="w-full sm:w-auto px-6 py-2.5 bg-[#561269] hover:bg-[#6e1886] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Kembali &amp; Coba Bayar Lagi
            </button>
          </div>
        </>
      )}
    </>
  )
}
