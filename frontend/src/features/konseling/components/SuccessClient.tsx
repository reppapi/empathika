"use client"

import Link from "next/link"
import Script from "next/script"

export default function SuccessClient() {
  const handleDownload = () => {
    const ticket = document.getElementById('ticket-container');
    if (ticket && (window as any).html2canvas) {
      (window as any).html2canvas(ticket, {
        scale: 2,
        backgroundColor: "#FAFAFA"
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = 'bukti-pembayaran-empathika.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    } else {
      alert("Sedang memuat sistem download, silakan coba beberapa detik lagi.");
    }
  }

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />

      {/* 1. Stepper Area - Green */}
      <div className="w-full pt-32 pb-10 flex flex-col items-center bg-white border-b border-gray-100">
        <div className="flex items-center w-full max-w-sm justify-center px-4 relative">

          {/* Step 1 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#7AC143] text-white flex items-center justify-center font-medium mb-2 shadow-sm text-sm">
              1
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700">paket</span>
          </div>

          {/* Line 1-2 */}
          <div className="h-[2px] bg-[#7AC143] flex-1 mx-2 -mt-6"></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#7AC143] text-white flex items-center justify-center font-medium mb-2 shadow-sm text-sm">
              2
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700">jadwal</span>
          </div>

          {/* Line 2-3 */}
          <div className="h-[2px] bg-[#7AC143] flex-1 mx-2 -mt-6"></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#7AC143] text-white flex items-center justify-center font-medium mb-2 shadow-sm text-sm">
              3
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700">Bayar</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[700px] mx-auto px-4 sm:px-6 mt-8 flex flex-col items-center">

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269]">
            Ringkasan & Pembayaran
          </h1>
        </div>

        {/* Success Card */}
        <div className="w-full bg-white rounded-3xl border border-[#DCD0E1] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden relative pb-10">

          {/* Top Gradient */}
          <div className="h-24 w-full bg-gradient-to-b from-[#E6D9E9]/50 to-white absolute top-0 left-0"></div>

          <div className="relative z-10 flex flex-col items-center px-6 pt-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-black mb-8">
              Transaksi Berhasil
            </h2>

            {/* Green Check Circle */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#9CD689] flex items-center justify-center mb-6 shadow-[0_4px_15px_rgba(156,214,137,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-[#2E681C]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>

            <div className="text-center mb-8 max-w-sm">
              <p className="text-sm font-semibold text-gray-700 mb-1">Transaksi anda berhasil!</p>
              <p className="text-xs text-gray-500">Silahkan simpan bukti pembayaran untuk keperluan apabila dibutuhkan</p>
            </div>

            {/* Ticket Information */}
            <div id="ticket-container" className="w-full max-w-md rounded-xl border border-dashed border-[#C3A4CE] bg-[#FCFAFD] p-6 mb-8 relative">
              <div className="border-b border-dashed border-[#C3A4CE] pb-5 mb-5 text-center">
                <h3 className="text-xl font-extrabold text-[#2F2F2F]">Layanan Konsultasi</h3>
                <p className="text-xs text-gray-500 mt-1">Psikolog Profesional Empathika</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-[9px] font-bold text-gray-500 mb-1">TANGGAL KONSULTASI</div>
                  <div className="text-xl font-extrabold text-[#2F2F2F]">31/08</div>
                  <div className="text-[8px] font-bold text-gray-500">TAHUN 2026</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold text-gray-500 mb-1">WAKTU KONSULTASI</div>
                  <div className="text-xl font-extrabold text-[#2F2F2F]">13:30</div>
                  <div className="text-[8px] font-bold text-gray-500">WIB - SELESAI</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[9px] font-bold text-gray-500 mb-1">NAMA PEMESAN</div>
                  <div className="text-sm font-extrabold text-[#2F2F2F]">KARENN SYA</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold text-gray-500 mb-1">ORDER ID</div>
                  <div className="text-xs font-bold text-[#2F2F2F]">W-EMP-0009</div>
                </div>
              </div>
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
                <p className="text-[10px] text-gray-500 mb-2 font-medium">Hubungi kontak ini setelah anda selesai melakukan pembayaran!</p>
                <Link
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Empathika,%20saya%20baru%20saja%20melakukan%20pembayaran%20untuk%20Layanan%20Konsultasi.%20Order%20ID:%20W-EMP-0009"
                  target="_blank"
                  className="w-full py-3 rounded-lg bg-[#25D366] text-white font-bold text-xs sm:text-sm flex justify-center items-center gap-2 hover:bg-[#1DA851] transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                  </svg>
                  Chat WA Admin
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 5. Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
            31 Agu 2026
          </div>
          <div className="text-sm sm:text-[17px] font-bold text-black flex items-center gap-1">
            13:30 WIB <span className="italic font-normal">(Online)</span>
          </div>
        </div>
        <Link
          href="/"
          className="bg-white border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          Kembali
        </Link>
      </div>

    </div>
  )
}
