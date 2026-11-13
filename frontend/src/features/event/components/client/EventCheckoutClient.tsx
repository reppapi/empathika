"use client"

import FormDataPeserta from "@/components/shared/checkout/FormDataPeserta"
import PhoneInputField from "@/components/shared/PhoneInputField"
import MetodePembayaranBox from "@/components/shared/checkout/MetodePembayaranBox"
import Link from "next/link"
import { useEventCheckout } from "../../hooks/useEventCheckout"
import { Users, User, Sparkles } from "lucide-react"

export default function EventCheckoutClient() {
  const {
    nama,
    setNama,
    whatsapp,
    setWhatsapp,
    selectedTicketType,
    setSelectedTicketType,
    hasBundling,
    finalBundlingOptions,
    currentSelectedBundle,
    pesertaTambahan,
    setPesertaTambahan,
    hargaNormalParam,
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
    isEventLoading,
    isEventClosed,
    eventClosedReason,
    handleSelectPayment,
    handleSubmit,
  } = useEventCheckout()

  // ── Fallback 1: Loading verifikasi event ──
  if (isEventLoading) {
    return (
      <div className="min-h-screen w-full font-poppins bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-[#561269]/20 border-t-[#561269] rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-600">Memverifikasi status pendaftaran event...</p>
      </div>
    )
  }

  // ── Fallback 2: Event sudah selesai, dibatalkan, atau dinonaktifkan oleh admin ──
  if (isEventClosed) {
    return (
      <div className="min-h-screen w-full font-poppins bg-[#FAFAFA] flex items-center justify-center px-4 py-24 sm:py-32">
        <div className="max-w-[560px] w-full bg-white rounded-[2rem] border border-purple-100 p-8 sm:p-12 text-center shadow-[0_4px_25px_rgba(86,18,105,0.06)] animate-in fade-in zoom-in-95 duration-300">
          {/* Icon Badge */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.5a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 14.25h.008v.008H12v-.008Z" />
            </svg>
          </div>

          {/* Heading */}
          <span className="inline-block px-3 py-1 bg-purple-50 text-[#561269] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
            Status Pendaftaran
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#561269] mb-3 leading-tight">
            Pendaftaran Telah Ditutup
          </h2>

          {/* Message */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {eventClosedReason || "Mohon maaf, pendaftaran untuk event ini sudah selesai atau telah dinonaktifkan oleh admin penyelenggara."}
          </p>

          {/* Card Info Event Singkat */}
          {judulParam && (
            <div className="bg-[#FAF5FD] border border-purple-100/80 rounded-2xl p-4 mb-8 text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Event yang Diakses
              </span>
              <p className="text-sm font-extrabold text-[#561269] line-clamp-2">
                {judulParam}
              </p>
              {tanggalParam && tanggalParam !== "Jadwal Segera Diumumkan" && (
                <p className="text-xs text-gray-500 mt-1">
                  Jadwal: {tanggalParam} • {waktuParam}
                </p>
              )}
            </div>
          )}

          {/* Action Button (Cukup 1 tombol saja) */}
          <div className="flex items-center justify-center pt-1">
            <Link
              href="/event"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#EAB308] hover:bg-yellow-500 text-black font-bold text-sm px-8 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <span>Lihat Event Lainnya</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
        <div id="box-data-peserta" className="space-y-6">
          {/* Pilihan Paket Tiket (Jika Tersedia Bundling) */}
          {hasBundling && !isPsikotes && (
            <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
                <h3 className="text-sm font-bold text-gray-800">Pilih Kategori Tiket</h3>
              </div>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Pilih paket tiket yang Anda inginkan. Pembelian paket bundling mewajibkan pengisian identitas untuk seluruh peserta.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Opsi Tiket Satuan */}
                <div
                  onClick={() => setSelectedTicketType("SINGLE")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedTicketType === "SINGLE"
                      ? "border-[#561269] bg-purple-50/40 shadow-xs"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className={`w-4 h-4 ${selectedTicketType === "SINGLE" ? "text-[#561269]" : "text-gray-400"}`} />
                      <span className="text-xs font-bold text-gray-900">Tiket Satuan (1 Orang)</span>
                    </div>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedTicketType === "SINGLE" ? "border-[#561269] bg-[#561269]" : "border-gray-300"
                    }`}>
                      {selectedTicketType === "SINGLE" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-[#561269]">{hargaNormalParam}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Untuk 1 peserta terdaftar</p>
                </div>

                {/* Opsi Semua Paket Bundling */}
                {finalBundlingOptions.map((pkg, bIdx) => {
                  const bId = `BUNDLE_${bIdx}`
                  const isSelected = selectedTicketType === bId || (bIdx === 0 && selectedTicketType === "BUNDLING")

                  return (
                    <div
                      key={bIdx}
                      onClick={() => setSelectedTicketType(bId)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                        isSelected
                          ? "border-[#561269] bg-purple-50/40 shadow-xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="absolute top-0 right-0 bg-[#EAB308] text-black font-extrabold text-[9px] px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Lebih Hemat
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className={`w-4 h-4 ${isSelected ? "text-[#561269]" : "text-gray-400"}`} />
                          <span className="text-xs font-bold text-gray-900">{pkg.nama_paket}</span>
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300"
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-base font-extrabold text-[#561269]">
                        Rp {Number(pkg.harga_paket).toLocaleString("id-ID")}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Paket langsung untuk {pkg.kuota_tiket} orang peserta</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Form Peserta 1 */}
          <FormDataPeserta
            stepNumber={hasBundling && !isPsikotes ? 3 : 2}
            nama={nama}
            setNama={setNama}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            withDeskripsi={false}
            errors={errors}
            setErrors={setErrors}
            attemptedSubmit={attemptedSubmit}
          />

          {/* Form Peserta Tambahan (Jika Bundling Terpilih) */}
          {currentSelectedBundle && pesertaTambahan.length > 0 && (
            <div className="space-y-4">
              {pesertaTambahan.map((p, idx) => {
                const pErr = errors.pesertaTambahanErrors?.[idx]
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-[#561269] text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 2}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">
                            Data Peserta {idx + 2} ({currentSelectedBundle.nama_paket})
                          </h3>
                          <p className="text-xs text-gray-500">
                            Identitas orang ke-{idx + 2} yang berbeda dari peserta lainnya
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-purple-50 text-[#561269] font-bold px-2 py-0.5 rounded-full">
                        Tiket ke-{idx + 2}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Nama Lengkap Peserta {idx + 2} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder={`Nama lengkap peserta ${idx + 2}`}
                          value={p.nama}
                          onChange={(e) => {
                            const val = e.target.value
                            setPesertaTambahan((prev) => {
                              const next = [...prev]
                              next[idx] = { ...next[idx], nama: val }
                              return next
                            })
                            if (pErr?.nama) {
                              setErrors((prev) => {
                                const next = { ...prev }
                                if (next.pesertaTambahanErrors?.[idx]) {
                                  delete next.pesertaTambahanErrors[idx].nama
                                }
                                return next
                              })
                            }
                          }}
                          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 ${
                            pErr?.nama
                              ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-200 focus:border-[#561269] focus:ring-[#561269]"
                          }`}
                        />
                        {pErr?.nama && (
                          <span className="block text-[11px] text-red-600 font-semibold mt-1">
                            {pErr.nama}
                          </span>
                        )}
                      </div>

                      <div>
                        <PhoneInputField
                          label={`No WhatsApp Peserta ${idx + 2}`}
                          required
                          value={p.whatsapp}
                          onChange={(formatted, cleanDigits) => {
                            setPesertaTambahan((prev) => {
                              const next = [...prev]
                              next[idx] = { ...next[idx], whatsapp: formatted }
                              return next
                            })
                            if (setErrors) {
                              if (cleanDigits.length > 0 && !cleanDigits.startsWith("8")) {
                                setErrors((prev: any) => {
                                  const next = { ...prev }
                                  if (!next.pesertaTambahanErrors) next.pesertaTambahanErrors = []
                                  next.pesertaTambahanErrors[idx] = {
                                    ...next.pesertaTambahanErrors[idx],
                                    whatsapp: `Nomor WhatsApp peserta ${idx + 2} harus diawali angka 8.`,
                                  }
                                  return next
                                })
                              } else if (cleanDigits.length > 13) {
                                setErrors((prev: any) => {
                                  const next = { ...prev }
                                  if (!next.pesertaTambahanErrors) next.pesertaTambahanErrors = []
                                  next.pesertaTambahanErrors[idx] = {
                                    ...next.pesertaTambahanErrors[idx],
                                    whatsapp: `Nomor WhatsApp peserta ${idx + 2} terlalu panjang.`,
                                  }
                                  return next
                                })
                              } else if (attemptedSubmit && cleanDigits.length < 9) {
                                setErrors((prev: any) => {
                                  const next = { ...prev }
                                  if (!next.pesertaTambahanErrors) next.pesertaTambahanErrors = []
                                  next.pesertaTambahanErrors[idx] = {
                                    ...next.pesertaTambahanErrors[idx],
                                    whatsapp: `Nomor WhatsApp peserta ${idx + 2} terlalu pendek.`,
                                  }
                                  return next
                                })
                              } else {
                                setErrors((prev: any) => {
                                  const next = { ...prev }
                                  if (next.pesertaTambahanErrors?.[idx]) {
                                    delete next.pesertaTambahanErrors[idx].whatsapp
                                  }
                                  return next
                                })
                              }
                            }
                          }}
                          error={pErr?.whatsapp}
                          helperText="Otomatis diawali +62 (Indonesia). Nomor harus aktif untuk tiket & pengumuman."
                          theme="purple"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

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
