"use client"

import Link from "next/link"
import { useBayarClient } from "../../hooks/useBayarClient"
import FormDataPeserta from "@/components/shared/checkout/FormDataPeserta"
import MetodePembayaranBox from "@/components/shared/checkout/MetodePembayaranBox"
import BayarRingkasanSesi from "./BayarRingkasanSesi"

export default function BayarClient() {
  const {
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
    setFailedAlertDismissed,
    isSubmitting,
    errors,
    setErrors,
    attemptedSubmit,
    isFailed,
    failedReason,
    isSlotUnavailable,
    slotUnavailableReason,
    qWaktu,
    qBottomDate,
    qBottomTime,
    qPsikologName,
    qLayanan,
    qHarga,
    qHari,
    handleSelectPayment,
    handleSubmit,
  } = useBayarClient()

  const isAsesmen = qLayanan.toLowerCase().includes("asesmen")
  const cleanBottomTime = isAsesmen && qBottomTime.includes("•")
    ? qBottomTime.split("•")[0].trim()
    : qBottomTime

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

        {/* ── Banner Peringatan: Slot Jadwal Dibatalkan / Dihapus oleh Admin / Psikolog ── */}
        {isSlotUnavailable && (
          <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 mt-0.5 border border-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-amber-950">
                  Slot Jadwal Ini Telah Dibatalkan / Dihapus
                </h4>
                <p className="text-xs sm:text-[13px] text-amber-900 mt-1 leading-relaxed max-w-xl">
                  {slotUnavailableReason || `Sesi jadwal yang Anda pilih pada ${qBottomDate} (${cleanBottomTime}) telah dihapus dari jadwal klinik atau dibatalkan oleh pihak admin. Anda tidak dapat melanjutkan proses pemesanan pada slot waktu ini.`}
                </p>
                <p className="text-[11px] text-amber-700 mt-2 font-medium">
                  Silakan kembali ke halaman jadwal untuk memilih slot tanggal atau jam lain yang tersedia.
                </p>
              </div>
            </div>
            <Link
              href={isAsesmen ? "/asesmen/jadwal" : "/konseling/jadwal"}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-[#EAB308] hover:bg-yellow-500 text-gray-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
            >
              Pilih Jadwal Lain &rarr;
            </Link>
          </div>
        )}

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
        <FormDataPeserta
          nama={nama}
          setNama={setNama}
          whatsapp={whatsapp}
          setWhatsapp={setWhatsapp}
          deskripsi={deskripsi}
          setDeskripsi={setDeskripsi}
          withDeskripsi={true}
          errors={errors}
          setErrors={setErrors}
          attemptedSubmit={attemptedSubmit}
        />

        {/* ── Box 2: Data Psikolog & Jadwal ── */}
        <BayarRingkasanSesi
          psikologName={isAsesmen ? undefined : qPsikologName}
          bottomDate={qBottomDate}
          bottomTime={cleanBottomTime}
          layanan={qLayanan}
        />

        {/* ── Box 3: Metode Pembayaran ── */}
        <MetodePembayaranBox
          metodePembayaran={metodePembayaran}
          onSelectPayment={handleSelectPayment}
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          selectedEwallet={selectedEwallet}
          setSelectedEwallet={setSelectedEwallet}
          errors={errors}
          setErrors={setErrors}
          attemptedSubmit={attemptedSubmit}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          biayaLabel={isAsesmen ? `Biaya Asesmen${qHari ? ` (${qHari})` : ""}` : "Biaya Konsultasi"}
          biayaNominal={qHarga}
          totalNominal={qHarga}
          isSubmitDisabled={isSlotUnavailable}
          submitButtonText={isSlotUnavailable ? "Jadwal Telah Dibatalkan" : "Bayar Sekarang"}
          submittingButtonText="Memproses Booking..."
        />

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">{qBottomDate}</div>
          <div className="text-sm sm:text-[17px] font-bold text-black flex items-center gap-1.5 flex-wrap">
            <span>{cleanBottomTime}</span>
            {isSlotUnavailable && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full ml-1">
                Dibatalkan
              </span>
            )}
          </div>
        </div>
        {isSlotUnavailable ? (
          <Link
            href={isAsesmen ? "/asesmen/jadwal" : "/konseling/jadwal"}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm transition-colors cursor-pointer"
          >
            Pilih Jadwal Lain
          </Link>
        ) : (
          <Link
            href={isAsesmen ? "/asesmen/jadwal" : "/konseling/jadwal"}
            className="bg-white border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            Kembali
          </Link>
        )}
      </div>

    </div>
  )
}
