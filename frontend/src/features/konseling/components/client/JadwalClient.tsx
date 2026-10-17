"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"

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

export default function JadwalClient() {
  const searchParams = useSearchParams()
  const isAsesmen = searchParams.get("layanan") === "asesmen" || searchParams.get("type") === "asesmen"
  const paketParam = searchParams.get("paket")

  const [metode, setMetode] = useState("Online")
  const [layanan, setLayanan] = useState(
    isAsesmen ? (paketParam || "Asesmen Minat Bakat") : "Psikolog"
  )
  const [waktu, setWaktu] = useState("13:30")

  useEffect(() => {
    if (isAsesmen && paketParam) {
      setLayanan(paketParam)
    }
  }, [isAsesmen, paketParam])

  // Calendar state
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 31))

  // Dummy slots
  const timeSlots = ["09:30", "10:00", "13:00", "13:30", "14:30"]

  const isWeekend = date ? date.getDay() === 0 || date.getDay() === 6 : false

  const getBiaya = () => {
    if (isAsesmen) {
      if (layanan === "Asesmen Minat Bakat") return isWeekend ? "Rp 500.000" : "Rp 400.000"
      return isWeekend ? "Rp 450.000" : "Rp 350.000"
    }
    return isWeekend ? "Rp 450.000" : "Rp 350.000"
  }

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
            {isAsesmen ? "Jadwalkan Sesi Asesmen Anda" : "Jadwalkan Layanan Konsultasi Anda"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            {isAsesmen
              ? "Tentukan metode, tanggal pelaksanaan, paket asesmen psikologis, dan slot waktu yang Anda butuhkan."
              : "Pilih metode pelaksanaan, tanggal konsultasi, paket layanan profesional, serta slot waktu yang paling nyaman untuk Anda."}
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* KIRI */}
          <div className="flex flex-col gap-6">

            {/* Box 1: Metode Konsultasi / Asesmen */}
            <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {isAsesmen ? "Pilih Metode Asesmen" : "Pilih Metode Konsultasi"}
                </h3>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMetode("Online")}
                  className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${metode === "Online"
                    ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269]"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setMetode("Offline")}
                  className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${metode === "Offline"
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Tanggal Pelaksanaan</h3>
              </div>

              <div className="flex justify-center w-full">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full max-w-[350px]"
                />
              </div>
            </div>

          </div>

          {/* KANAN */}
          <div className="flex flex-col gap-6">

            {/* Box 3: Pilih Layanan / Paket */}
            <div className="bg-white rounded-2xl border border-gray-300 p-5 sm:p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">3</div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {isAsesmen ? "Pilih Paket Asesmen" : "Pilih Layanan"}
                </h3>
              </div>

              <div className="flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                {isAsesmen ? (
                  <>
                    {/* Option Asesmen Minat Bakat */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        layanan === "Asesmen Minat Bakat" ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-purple-100 text-[#561269] font-bold flex items-center justify-center shrink-0 text-sm">
                        MB
                      </div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-[#561269] text-[15px]">Asesmen Minat Bakat</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 mb-1.5 leading-tight">
                          Pemetaan potensi akademik, karier, dan profil kecenderungan minat.
                        </p>
                        <div className="text-[10px] text-black font-semibold">Weekday: Rp 400.000 • Weekend: Rp 500.000</div>
                      </div>
                      <input
                        type="radio" name="layanan" value="Asesmen Minat Bakat"
                        checked={layanan === "Asesmen Minat Bakat"} onChange={() => setLayanan("Asesmen Minat Bakat")}
                        className="w-5 h-5 text-[#561269] focus:ring-[#561269]"
                      />
                    </label>

                    {/* Option Asesmen Kesiapan Sekolah */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        layanan === "Asesmen Kesiapan Sekolah" ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-sm">
                        KS
                      </div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-[#561269] text-[15px]">Asesmen Kesiapan Sekolah</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 mb-1.5 leading-tight">
                          Pemeriksaan psikologis kognitif, motorik, dan emosional anak.
                        </p>
                        <div className="text-[10px] text-black font-semibold">Weekday: Rp 350.000 • Weekend: Rp 450.000</div>
                      </div>
                      <input
                        type="radio" name="layanan" value="Asesmen Kesiapan Sekolah"
                        checked={layanan === "Asesmen Kesiapan Sekolah"} onChange={() => setLayanan("Asesmen Kesiapan Sekolah")}
                        className="w-5 h-5 text-[#561269] focus:ring-[#561269]"
                      />
                    </label>

                    {/* Option Asesmen Klinis */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        layanan === "Asesmen Klinis" ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-red-100 text-red-800 font-bold flex items-center justify-center shrink-0 text-sm">
                        KL
                      </div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-[#561269] text-[15px]">Asesmen Klinis</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 mb-1.5 leading-tight">
                          Evaluasi psikologis mendalam kondisi klinis, regulasi emosi, & kesehatan mental.
                        </p>
                        <div className="text-[10px] text-black font-semibold">Weekday: Rp 350.000 • Weekend: Rp 450.000</div>
                      </div>
                      <input
                        type="radio" name="layanan" value="Asesmen Klinis"
                        checked={layanan === "Asesmen Klinis"} onChange={() => setLayanan("Asesmen Klinis")}
                        className="w-5 h-5 text-[#561269] focus:ring-[#561269]"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    {/* Option Psikolog */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${layanan === "Psikolog" ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className="w-14 h-14 rounded-md bg-purple-100 flex items-center justify-center font-bold text-[#561269] shrink-0">PS</div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-[#561269] text-[15px]">Psikolog</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 mb-1.5 leading-tight">
                          Konsultasi profesional mendalam bersama psikolog berizin.
                        </p>
                        <div className="text-[10px] text-black font-semibold">Weekday: Rp 350.000 • Weekend: Rp 450.000</div>
                      </div>
                      <input
                        type="radio" name="layanan" value="Psikolog"
                        checked={layanan === "Psikolog"} onChange={() => setLayanan("Psikolog")}
                        className="w-5 h-5 text-[#561269] focus:ring-[#561269]"
                      />
                    </label>

                    {/* Option Konselor */}
                    <label
                      className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all shrink-0 ${layanan === "Konselor" ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className="w-12 h-12 rounded-md bg-purple-100 flex items-center justify-center font-bold text-[#561269] shrink-0">KS</div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-[#561269] text-[14px]">Konselor</h4>
                        <p className="text-[9px] text-gray-500 mt-0.5 mb-1 leading-tight">
                          Pendampingan solusi praktis permasalahan relasi dan emosi.
                        </p>
                        <div className="text-[9px] text-black font-semibold">Weekday: Rp 350.000 • Weekend: Rp 450.000</div>
                      </div>
                      <input
                        type="radio" name="layanan" value="Konselor"
                        checked={layanan === "Konselor"} onChange={() => setLayanan("Konselor")}
                        className="w-4 h-4 text-[#561269] focus:ring-[#561269]"
                      />
                    </label>

                    {/* Option Peer Konselor */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${layanan === "Peer Konselor" ? "border-[#C3A4CE] bg-[#FCFAFD]" : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className="w-14 h-14 rounded-md bg-purple-100 flex items-center justify-center font-bold text-[#561269] shrink-0">PK</div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-[#561269] text-[15px]">Peer Konselor</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 mb-1.5 leading-tight">
                          Teman sebaya terlatih untuk mendengarkan tanpa menghakimi.
                        </p>
                        <div className="text-[10px] text-black font-semibold">Weekday: Rp 350.000 • Weekend: Rp 450.000</div>
                      </div>
                      <input
                        type="radio" name="layanan" value="Peer Konselor"
                        checked={layanan === "Peer Konselor"} onChange={() => setLayanan("Peer Konselor")}
                        className="w-5 h-5 text-[#561269] focus:ring-[#561269]"
                      />
                    </label>
                  </>
                )}
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
                    type="button"
                    onClick={() => setWaktu(slot)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${waktu === slot
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
            {date ? `${date.getDate()} ${MONTHS[date.getMonth()].substring(0, 3)} ${date.getFullYear()}` : "Pilih Tanggal"}{" "}
            ({isWeekend ? "Weekend" : "Weekday"}) • <span className="font-bold text-[#561269]">{getBiaya()}</span>
          </div>
          <div className="text-sm sm:text-[17px] font-bold text-black flex items-center gap-1.5 flex-wrap">
            <span>{waktu} WIB</span>
            <span className="italic font-normal">({metode})</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-[#561269]">
              {layanan}
            </span>
          </div>
        </div>
        <Link
          href={
            `/konseling/bayar?layanan=${isAsesmen ? "asesmen" : "konsultasi"}&paket=${encodeURIComponent(
              layanan
            )}&metode=${encodeURIComponent(metode)}&waktu=${encodeURIComponent(
              waktu
            )}&biaya=${encodeURIComponent(getBiaya())}&tanggal=${
              date
                ? encodeURIComponent(
                    `${date.getDate()} ${MONTHS[date.getMonth()].substring(0, 3)} ${date.getFullYear()}`
                  )
                : ""
            }` as any
          }
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

