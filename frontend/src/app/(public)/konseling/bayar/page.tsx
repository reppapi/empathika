"use client"

import Link from "next/link"

export default function BookingBayarPage() {
  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32">
      
      {/* 1. Stepper Area */}
      <div className="w-full pt-32 pb-10 flex flex-col items-center bg-white border-b border-gray-100">
        <div className="flex items-center w-full max-w-sm justify-center px-4 relative">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">
              1
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700">paket</span>
          </div>

          {/* Line 1-2 */}
          <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-6"></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">
              2
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700">jadwal</span>
          </div>

          {/* Line 2-3 */}
          <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-6"></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">
              3
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700">Bayar</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 mt-8 flex flex-col gap-6">
        
        {/* Title */}
        <div className="mb-2 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            Ringkasan & Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor sit amet, consectetur
          </p>
        </div>

        {/* Box 1: Data Peserta */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
            <h3 className="text-sm font-bold text-gray-800">Data Peserta</h3>
          </div>
          
          <div className="flex flex-col gap-5">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">Nama Lengkap</label>
              <input 
                type="text" 
                placeholder="Masukkan nama lengkap" 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
              />
            </div>
            
            {/* Email & WA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="user@gmail.com" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">No WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="08xxxxxxxxx" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">Deskripsi Ringkasan Hidup/Trauma</label>
              <input 
                type="text" 
                placeholder="saya sering merasa.." 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Box 2: Data Psikolog & Jadwal yang Dipilih */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
            <h3 className="text-sm font-bold text-gray-800">Data Psikolog & Jadwal yang Dipilih</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Kiri: Psikolog */}
            <div className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-center items-center sm:items-start sm:flex-row gap-4 h-full">
              <div className="w-[70px] h-[70px] rounded-full bg-gray-200 shrink-0 object-cover overflow-hidden">
                {/* Dummy image */}
                <div className="w-full h-full bg-[#E6D9E9]"></div>
              </div>
              <div className="text-center sm:text-left flex flex-col justify-center h-full pt-1">
                <div className="text-[10px] text-gray-500 mb-1">Psikolog Anda</div>
                <div className="text-sm font-extrabold text-[#561269]">nama, M.Psi.,<br/>Psikolog</div>
              </div>
            </div>

            {/* Card Kanan: Jadwal & Layanan */}
            <div className="flex flex-col gap-3">
              {/* Jadwal */}
              <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="shrink-0 text-[#561269]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Jadwal</div>
                  <div className="text-xs font-bold text-[#561269]">2026-08-31 (weekday)</div>
                  <div className="text-[10px] text-gray-500">13:30 WIB (Online)</div>
                </div>
              </div>

              {/* Layanan */}
              <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="shrink-0 text-[#561269]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Layanan konsultasi</div>
                  <div className="text-sm font-bold text-[#561269]">Psikolog</div>
                </div>
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
            {/* E-Wallet */}
            <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-800">E-Wallet</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Transfer Bank */}
            <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-800">Transfer Bank</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Qris */}
            <label className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-800">Qris</span>
              </div>
              <input type="radio" name="payment" defaultChecked className="w-5 h-5 text-gray-600 focus:ring-gray-600" />
            </label>
          </div>

          {/* Pricing Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Biaya Konsultasi</span>
              <span className="text-xs font-medium text-gray-500">Rp 350.000</span>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-extrabold text-[#561269]">Total Bayar</span>
              <span className="text-sm font-extrabold text-[#561269]">Rp 350.000</span>
            </div>
            
            {/* Submit Button */}
            <Link 
              href="/konseling/success"
              className="w-full bg-[#EAB308] hover:bg-[#FACC15] text-black font-bold text-sm py-4 rounded-xl shadow-sm transition-colors flex justify-center items-center"
            >
              Bayar Sekarang
            </Link>
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
          href="/konseling/jadwal"
          className="bg-white border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          Kembali
        </Link>
      </div>

    </div>
  )
}
