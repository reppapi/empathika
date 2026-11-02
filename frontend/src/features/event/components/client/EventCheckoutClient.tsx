"use client"

import FormDataPeserta from "@/components/shared/checkout/FormDataPeserta"
import MetodePembayaranBox from "@/components/shared/checkout/MetodePembayaranBox"
import { useEventCheckout } from "../../hooks/useEventCheckout"

export default function EventCheckoutClient() {
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
    pembicaraParam,
    lokasiParam,
    tanggalParam,
    waktuParam,
    kategoriParam,
    hargaParam,
    isPsikotes,
    bannerUrlParam,
    tipeParam,
    handleSelectPayment,
    handleSubmit,
  } = useEventCheckout()

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32 pt-24 sm:pt-32">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 flex flex-col gap-6">

        {/* Title */}
        <div className="mb-2 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            {isPsikotes ? "Pendaftaran & Pembayaran Psikotes" : "Pendaftaran & Pembayaran Tiket"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            {isPsikotes
              ? "Lengkapi data kamu dan selesaikan pembayaran untuk mendapatkan akses tes serta laporan analisis lengkap."
              : "Isi data kamu dan pilih metode pembayaran untuk menyelesaikan pendaftaran event."}
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

        {/* ── Box 1: Detail Item / Event ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
            <h3 className="text-sm font-bold text-gray-800">{isPsikotes ? "Detail Layanan Psikotes" : "Detail Event"}</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="relative w-full sm:w-[200px] h-[120px] rounded-2xl bg-[#E6D9E9] overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
              {bannerUrlParam ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bannerUrlParam}
                  alt={judulParam}
                  className="w-full h-full object-cover"
                />
              ) : isPsikotes ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#561269" className="w-12 h-12 opacity-60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="#9B59B6" className="w-12 h-12 opacity-40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              )}
            </div>
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{kategoriParam}</span>
                {!isPsikotes && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      tipeParam === "Offline"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {tipeParam}
                  </span>
                )}
              </div>
              <div className="text-lg font-extrabold text-[#561269] mb-2">{judulParam}</div>
              <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                {subjudulParam}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {isPsikotes ? (
                  <>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#561269]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700">Akses Pengerjaan Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#561269]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700">Laporan Analisis Komprehensif</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    {/* Baris 1: Tanggal & Waktu */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">{tanggalParam}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">{waktuParam}</span>
                      </div>
                    </div>

                    {/* Baris 2: Pembicara & Tempat */}
                    {(pembicaraParam || lokasiParam) && (
                      <div className="flex flex-wrap items-center gap-4 pt-0.5">
                        {pembicaraParam && (
                          <span className="text-xs font-semibold text-[#561269]">
                            Pembicara: {pembicaraParam}
                          </span>
                        )}
                        {lokasiParam && (
                          <span className="text-xs font-medium text-gray-700">
                            Tempat: {lokasiParam}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Box 2: Data Peserta (Tanpa Kolom Email) ── */}
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
          biayaLabel={isPsikotes ? "Biaya Paket Psikotes" : "Biaya Tiket"}
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
