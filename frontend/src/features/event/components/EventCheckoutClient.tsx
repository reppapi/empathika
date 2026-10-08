"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EventCheckoutClient() {
  const router = useRouter()
  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [metodePembayaran, setMetodePembayaran] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!nama || !email || !whatsapp) {
      alert("Harap isi semua data peserta terlebih dahulu.")
      return
    }
    if (!metodePembayaran) {
      alert("Harap pilih metode pembayaran terlebih dahulu.")
      return
    }

    // Encode info ke URL param lalu ke success page
    const params = new URLSearchParams({
      nama: nama.toUpperCase(),
      orderId: "W-SEFT-" + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"),
      tanggal: "05/09",
      tahun: "2026",
      waktu: "09:00",
      judul: "Workshop SEFT",
      subjudul: "Spiritual Emotional Freedom Technique",
    })
    router.push(`/event/success?${params.toString()}`)
  }

  const paymentOptions = [
    {
      id: "ewallet",
      label: "E-Wallet",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
        </svg>
      ),
      type: "dropdown",
    },
    {
      id: "bank",
      label: "Transfer Bank",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
        </svg>
      ),
      type: "dropdown",
    },
    {
      id: "qris",
      label: "Qris",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
        </svg>
      ),
      type: "radio",
    },
  ]

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32 pt-24 sm:pt-32">

      {/* Main Content Container */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 flex flex-col gap-6">

        {/* Title */}
        <div className="mb-2 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            Pendaftaran & Pembayaran Tiket
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Isi data kamu dan pilih metode pembayaran untuk menyelesaikan pendaftaran event.
          </p>
        </div>

        {/* Box 1: Detail Event */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
            <h3 className="text-sm font-bold text-gray-800">Detail Event</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="relative w-full sm:w-[200px] h-[120px] rounded-2xl bg-[#E6D9E9] overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="#9B59B6" className="w-12 h-12 opacity-40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <div className="flex flex-col w-full">
              <div className="text-xs text-gray-500 mb-1">Seminar</div>
              <div className="text-lg font-extrabold text-[#561269] mb-2">Workshop SEFT</div>
              <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                Spiritual Emotional Freedom Technique — program workshop interaktif bersama para ahli.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-500">05 September 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-500">09:00 - Selesai WIB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Data Peserta */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
            <h3 className="text-sm font-bold text-gray-800">Data Peserta</h3>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="user@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">No WhatsApp</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxx"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Box 3: Metode Pembayaran */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">3</div>
            <h3 className="text-sm font-bold text-gray-800">Pilih Metode Pembayaran</h3>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            {paymentOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMetodePembayaran(opt.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  metodePembayaran === opt.id
                    ? "border-[#561269] bg-[#F8EFFF] ring-1 ring-[#561269]"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {opt.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{opt.label}</span>
                </div>
                {opt.type === "dropdown" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    metodePembayaran === opt.id ? "border-[#561269]" : "border-gray-300"
                  }`}>
                    {metodePembayaran === opt.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#561269]" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Pricing Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Biaya Tiket</span>
              <span className="text-xs font-medium text-gray-500">Rp 200.000</span>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-extrabold text-[#561269]">Total Bayar</span>
              <span className="text-sm font-extrabold text-[#561269]">Rp 200.000</span>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-[#EAB308] hover:bg-[#FACC15] text-black font-bold text-sm py-4 rounded-xl shadow-sm transition-colors flex justify-center items-center"
            >
              Bayar Sekarang
            </button>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">05 Sep 2026</div>
          <div className="text-sm sm:text-[17px] font-bold text-black">09:00 WIB</div>
        </div>
        <button
          onClick={() => window.history.back()}
          className="bg-white border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          Kembali
        </button>
      </div>

    </div>
  )
}
