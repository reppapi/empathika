"use client"

import FormDataPeserta from "@/components/shared/checkout/FormDataPeserta"
import MetodePembayaranBox from "@/components/shared/checkout/MetodePembayaranBox"
import PsikotesRingkasanPaket from "./PsikotesRingkasanPaket"
import { usePsikotesBayar } from "../../hooks/usePsikotesBayar"
import { AlertCircle, X } from "lucide-react"

export default function PsikotesBayarClient() {
  const {
    nama,
    setNama,
    whatsapp,
    setWhatsapp,
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
    judulParam,
    subjudulParam,
    kategoriParam,
    hargaParam,
    handleSelectPayment,
    handleSubmit,
  } = usePsikotesBayar()

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32">
      {/* ── 1. Stepper Area ── */}
      <div className="w-full pt-32 pb-10 flex flex-col items-center bg-white border-b border-gray-100">
        <div className="flex items-center w-full max-w-sm justify-center px-4 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">
              1
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700">Pilih Paket</span>
          </div>
          <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-6"></div>
          {/* Step 2 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">
              2
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700 font-bold text-[#561269]">
              Pembayaran
            </span>
          </div>
          <div className="h-[2px] bg-gray-200 flex-1 mx-2 -mt-6"></div>
          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-black/5 flex items-center justify-center text-gray-500 font-medium mb-2 shadow-sm text-sm">
              3
            </div>
            <span className="text-[10px] sm:text-xs text-gray-400">Mulai Tes</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 mt-8 flex flex-col gap-6">
        {/* Title */}
        <div className="mb-2 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            Pendaftaran &amp; Pembayaran Psikotes
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Lengkapi data diri kamu dan selesaikan pembayaran untuk mengaktifkan paket tes psikotes serta laporan analisis profesional.
          </p>
        </div>

        {/* ── Banner Notifikasi Pembayaran Gagal ── */}
        {isFailed && (
          <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-red-900">Pembayaran Sebelumnya Gagal</h4>
                <button
                  type="button"
                  onClick={() => setFailedAlertDismissed(true)}
                  className="text-gray-400 hover:text-gray-600 p-1 -mr-1 rounded-lg cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                {failedReason} Silakan periksa kembali data diri di bawah ini dan pilih ulang metode pembayaran untuk mencoba kembali.
              </p>
            </div>
          </div>
        )}

        {/* ── Box 1: Detail Paket Psikotes ── */}
        <PsikotesRingkasanPaket
          judul={judulParam}
          subjudul={subjudulParam}
          kategori={kategoriParam}
        />

        {/* ── Box 2: Data Peserta (Shared Component) ── */}
        <FormDataPeserta
          stepNumber={2}
          nama={nama}
          setNama={setNama}
          whatsapp={whatsapp}
          setWhatsapp={setWhatsapp}
          withDeskripsi={false}
          errors={errors}
          setErrors={setErrors}
          attemptedSubmit={attemptedSubmit}
        />

        {/* ── Box 3: Metode Pembayaran (Shared Component) ── */}
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
          biayaLabel="Biaya Paket Psikotes"
          biayaNominal={hargaParam}
          totalNominal={hargaParam}
          submitButtonText="Bayar Sekarang"
          submittingButtonText="Memproses Pembayaran..."
        />
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium mb-0.5 line-clamp-1 max-w-[200px] sm:max-w-md">
            {judulParam}
          </div>
          <div className="text-sm sm:text-[17px] font-extrabold text-[#561269]">
            {hargaParam}
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-white border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Kembali
        </button>
      </div>
    </div>
  )
}
