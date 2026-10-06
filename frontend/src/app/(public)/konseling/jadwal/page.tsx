"use client"

import { useState } from "react"
import Link from "next/link"

// Helper function to get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

// Helper to get day of week (0-6) of first day of month
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export default function BookingJadwalPage() {
  const [metode, setMetode] = useState("Online")
  const [layanan, setLayanan] = useState("Psikolog")
  const [waktu, setWaktu] = useState("13:30")
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7)) // Default Agustus 2026
  const [selectedDate, setSelectedDate] = useState<number | null>(31)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth())
  
  // Generate days array
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null) // empty slots
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Dummy slots
  const timeSlots = ["09:30", "10:00", "13:00", "13:30", "14:30"]

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
          <div className="h-[2px] bg-gray-300 flex-1 mx-2 -mt-6"></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#E6D9E9] border border-purple-200 flex items-center justify-center text-black font-medium mb-2 text-sm">
              3
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">Bayar</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 mt-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            Jadwalkan layanan anda
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
            Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor sit amet, consectetur
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* KIRI */}
          <div className="flex flex-col gap-6">
            
            {/* Box 1: Metode Konsultasi */}
            <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Metode konsultasi</h3>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setMetode("Online")}
                  className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                    metode === "Online" 
                      ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269]" 
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Online
                </button>
                <button 
                  onClick={() => setMetode("Offline")}
                  className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                    metode === "Offline" 
                      ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269]" 
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>

            {/* Box 2: Pilih Tanggal */}
            <div className="flex-1 bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <h3 className="text-sm font-semibold text-gray-800">Pilih Tanggal</h3>
                </div>
                <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
                  <button onClick={handlePrevMonth} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button onClick={handleNextMonth} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="text-center font-bold text-[15px] mb-4 text-black">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              
              <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-gray-500 mb-2">
                <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
              </div>
              
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
                {days.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="w-8 h-8"></div>
                  }
                  const isSelected = selectedDate === day && currentDate.getMonth() === 7 && currentDate.getFullYear() === 2026;
                  return (
                    <button 
                      key={`day-${day}`}
                      onClick={() => {
                        setSelectedDate(day)
                        // In real app, you'd also track the month/year of the selection
                        if (currentDate.getMonth() !== 7 || currentDate.getFullYear() !== 2026) {
                           // For dummy purposes, we only really let them select the date if it's the current viewed month
                        }
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        isSelected 
                          ? "bg-[#561269] text-white shadow-sm" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
            
          </div>

          {/* KANAN */}
          <div className="flex flex-col gap-6">
            
            {/* Box 3: Pilih Layanan */}
            <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">3</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Layanan</h3>
              </div>
              
              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Option Psikolog */}
                <label 
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    layanan === "Psikolog" ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 rounded-md bg-gray-200 shrink-0"></div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#561269] text-[15px]">Psikolog</h4>
                    <p className="text-[10px] text-gray-500 mt-1 mb-2 leading-tight">
                      Lorem ipsum dolor sit amet, consectetur .
                    </p>
                    <div className="text-[10px] text-black font-semibold">Weekday: Rp350.000</div>
                    <div className="text-[10px] text-black font-semibold">Weekend: Rp450.000</div>
                  </div>
                  <input 
                    type="radio" name="layanan" value="Psikolog" 
                    checked={layanan === "Psikolog"} onChange={() => setLayanan("Psikolog")}
                    className="w-5 h-5 text-[#561269] focus:ring-[#561269]" 
                  />
                </label>

                {/* Option Konselor */}
                <label 
                  className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all shrink-0 ${
                    layanan === "Konselor" ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-14 h-14 rounded-md bg-gray-200 shrink-0"></div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#561269] text-[14px]">Konselor</h4>
                    <p className="text-[9px] text-gray-500 mt-0.5 mb-1 leading-tight">
                      Lorem ipsum dolor sit amet, consectetur .
                    </p>
                    <div className="text-[9px] text-black font-semibold">Weekday: Rp350.000</div>
                    <div className="text-[9px] text-black font-semibold">Weekend: Rp450.000</div>
                  </div>
                  <input 
                    type="radio" name="layanan" value="Konselor" 
                    checked={layanan === "Konselor"} onChange={() => setLayanan("Konselor")}
                    className="w-4 h-4 text-[#561269] focus:ring-[#561269]" 
                  />
                </label>

                {/* Option Peer Konselor */}
                <label 
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    layanan === "Peer Konselor" ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 rounded-md bg-gray-200 shrink-0"></div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#561269] text-[15px]">Peer Konselor</h4>
                    <p className="text-[10px] text-gray-500 mt-1 mb-2 leading-tight">
                      Lorem ipsum dolor sit amet, consectetur .
                    </p>
                    <div className="text-[10px] text-black font-semibold">Weekday: Rp350.000</div>
                    <div className="text-[10px] text-black font-semibold">Weekend: Rp450.000</div>
                  </div>
                  <input 
                    type="radio" name="layanan" value="Peer Konselor" 
                    checked={layanan === "Peer Konselor"} onChange={() => setLayanan("Peer Konselor")}
                    className="w-5 h-5 text-[#561269] focus:ring-[#561269]" 
                  />
                </label>
              </div>
            </div>

            {/* Box 4: Pilih Slot Waktu */}
            <div className="flex-1 bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">4</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Slot Waktu</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(slot => (
                  <button 
                    key={slot}
                    onClick={() => setWaktu(slot)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      waktu === slot 
                        ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269]" 
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
            {selectedDate || "31"} {MONTHS[currentDate.getMonth()].substring(0, 3)} {currentDate.getFullYear()} (weekday)
          </div>
          <div className="text-sm sm:text-[17px] font-bold text-black flex items-center gap-1">
            {waktu} WIB <span className="italic font-normal">({metode})</span>
          </div>
        </div>
        <Link 
          href="/konseling/bayar"
          className="bg-[#EAB308] text-black font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-xl shadow-sm hover:scale-105 transition-transform"
        >
          Bayar Sekarang
        </Link>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #C3A4CE;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}
