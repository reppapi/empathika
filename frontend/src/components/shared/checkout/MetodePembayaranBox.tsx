"use client"

import React, { useState } from "react"

export const BANK_LIST = [
  { id: "bca", name: "BCA", va: "1234567890123" },
  { id: "mandiri", name: "Mandiri", va: "8881234567890" },
  { id: "bni", name: "BNI", va: "9876543210987" },
  { id: "bri", name: "BRI", va: "7771234567890" },
  { id: "bsi", name: "BSI", va: "4441234567890" },
]

export const EWALLET_LIST = [
  { id: "gopay", name: "GoPay", color: "#00AA13" },
  { id: "ovo", name: "OVO", color: "#4C3494" },
  { id: "dana", name: "DANA", color: "#118EEA" },
  { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D" },
  { id: "linkaja", name: "LinkAja", color: "#E82529" },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
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

const PAYMENT_OPTIONS = [
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

export interface MetodePembayaranBoxProps {
  metodePembayaran: string | null
  onSelectPayment: (id: string) => void
  selectedBank: string | null
  setSelectedBank: (id: string | null) => void
  selectedEwallet: string | null
  setSelectedEwallet: (id: string | null) => void
  errors: {
    metodePembayaran?: string
    detailMetode?: string
    [key: string]: any
  }
  setErrors: React.Dispatch<React.SetStateAction<any>>
  attemptedSubmit: boolean
  isSubmitting: boolean
  onSubmit: () => void
  biayaLabel?: string
  biayaNominal?: string
  totalNominal?: string
  isSubmitDisabled?: boolean
  submitButtonText?: string
  submittingButtonText?: string
}

export default function MetodePembayaranBox({
  metodePembayaran,
  onSelectPayment,
  selectedBank,
  setSelectedBank,
  selectedEwallet,
  setSelectedEwallet,
  errors,
  setErrors,
  attemptedSubmit,
  isSubmitting,
  onSubmit,
  biayaLabel = "Biaya Konsultasi",
  biayaNominal = "Rp 350.000",
  totalNominal = "Rp 350.000",
  isSubmitDisabled,
  submitButtonText = "Bayar Sekarang",
  submittingButtonText = "Memproses Booking...",
}: MetodePembayaranBoxProps) {
  return (
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
        {PAYMENT_OPTIONS.map((opt) => {
          const isActive = metodePembayaran === opt.id
          return (
            <div key={opt.id} className={`rounded-2xl border transition-all overflow-hidden ${isActive ? "border-[#561269] ring-1 ring-[#561269]" : "border-gray-200"}`}>

              {/* Tombol header metode */}
              <button
                type="button"
                onClick={() => onSelectPayment(opt.id)}
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
                              className={`rounded-xl border transition-all overflow-hidden ${
                                isSelected
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
                                    setErrors((prev: any) => ({ ...prev, detailMetode: next ? undefined : "Silakan pilih jenis e-wallet yang ingin digunakan." }))
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
                              className={`rounded-xl border transition-all overflow-hidden ${
                                isSelected
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
                                    setErrors((prev: any) => ({ ...prev, detailMetode: next ? undefined : "Silakan pilih bank tujuan transfer." }))
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
                        <p className="text-[10px] text-gray-400">Total: {totalNominal}</p>
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
          <span className="text-xs text-gray-500">{biayaLabel}</span>
          <span className="text-xs font-medium text-gray-500">{biayaNominal}</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-extrabold text-[#561269]">Total Bayar</span>
          <span className="text-sm font-extrabold text-[#561269]">{totalNominal}</span>
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
          onClick={onSubmit}
          disabled={isSubmitting || isSubmitDisabled}
          className={`w-full font-bold text-sm py-4 rounded-xl shadow-sm transition-colors flex justify-center items-center ${
            isSubmitting || isSubmitDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#EAB308] hover:bg-[#FACC15] text-black cursor-pointer"
          }`}
        >
          {isSubmitting ? submittingButtonText : submitButtonText}
        </button>
      </div>
    </div>
  )
}

