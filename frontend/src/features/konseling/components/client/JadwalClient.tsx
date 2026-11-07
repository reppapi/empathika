"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"
import { User } from "lucide-react"
import { useJadwalClient, formatDateToKey } from "@/features/konseling/hooks/useJadwalClient"

export default function JadwalClient() {
  const [showNonaktifModal, setShowNonaktifModal] = useState(false)
  const {
    MONTHS,
    today,
    date,
    setDate,
    metode,
    setMetode,
    layanan,
    setLayanan,
    waktu,
    setWaktu,
    setSelectedSlotId,
    datesWithSlots,
    earliestAvailableDate,
    availableSlots,
    isLoadingSlots,
    activePsikologName,
    buildBayarUrl,
    isSlotReady,
    isOnlineAllowed,
    isOfflineAllowed,
    isLayananNonaktif,
    nonaktifLayananNama,
  } = useJadwalClient()

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
            <span className="text-[10px] sm:text-xs text-gray-700 font-semibold">jadwal</span>
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
            Pilih metode konsultasi dan tanggal yang Anda inginkan. Slot waktu hanya dapat dipilih jika telah dibuka oleh psikolog.
          </p>
        </div>

        {/* Banner Peringatan Layanan Nonaktif */}
        {isLayananNonaktif && (
          <div className="mb-8 p-5 sm:p-6 bg-amber-50 border-2 border-amber-300 rounded-[1.5rem] shadow-sm flex items-start gap-4 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
              ⚠️
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-1">
                Layanan &ldquo;{nonaktifLayananNama || layanan}&rdquo; Sedang Dinonaktifkan
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                Layanan konsultasi ini saat ini sedang dinonaktifkan oleh administrator dan tidak dapat dijadwalkan. Silakan pilih layanan lain yang aktif.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-3">
                <Link
                  href="/layanan"
                  className="px-5 py-2 bg-[#561269] hover:bg-[#430e52] text-white text-xs font-semibold rounded-full transition shadow-xs"
                >
                  Kembali ke Daftar Layanan
                </Link>
                <Link
                  href="/konseling"
                  className="px-5 py-2 bg-white border border-[#561269] text-[#561269] hover:bg-purple-50 text-xs font-semibold rounded-full transition shadow-xs"
                >
                  Lihat Layanan Konsultasi Lainnya
                </Link>
              </div>
            </div>
          </div>
        )}

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
                  type="button"
                  onClick={() => isOnlineAllowed && setMetode("Online")}
                  disabled={!isOnlineAllowed}
                  className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                    !isOnlineAllowed
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                      : metode === "Online"
                      ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269] cursor-pointer"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                  }`}
                  title={!isOnlineAllowed ? "Layanan ini tidak tersedia secara Online" : undefined}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => isOfflineAllowed && setMetode("Offline")}
                  disabled={!isOfflineAllowed}
                  className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                    !isOfflineAllowed
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                      : metode === "Offline"
                      ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269] cursor-pointer"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                  }`}
                  title={!isOfflineAllowed ? "Layanan ini tidak tersedia secara Offline" : undefined}
                >
                  Offline
                </button>
              </div>

              {!isOnlineAllowed && isOfflineAllowed && (
                <p className="text-[11px] text-amber-700 font-medium mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  ℹ️ Layanan ini hanya dapat dilaksanakan secara tatap muka (Offline).
                </p>
              )}
              {isOnlineAllowed && !isOfflineAllowed && (
                <p className="text-[11px] text-emerald-700 font-medium mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  ℹ️ Layanan ini hanya dapat dilaksanakan secara daring (Online).
                </p>
              )}
            </div>

            {/* Box 2: Pilih Tanggal */}
            <div className="flex-1 bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[300px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Tanggal</h3>
              </div>

              <div className="flex justify-center w-full">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      const check = new Date(newDate)
                      check.setHours(0, 0, 0, 0)
                      if (check >= today) {
                        setDate(newDate)
                      }
                    }
                  }}
                  fromDate={today}
                  disabled={{ before: today }}
                  modifiers={{
                    hasSlots: datesWithSlots,
                  }}
                  modifiersClassNames={{
                    hasSlots:
                      "font-bold text-[#561269] relative after:content-[''] after:absolute after:bottom-1 after:w-1.5 after:h-1.5 after:bg-[#EAB308] after:rounded-full after:left-1/2 after:-translate-x-1/2",
                  }}
                  className="w-full max-w-[350px]"
                />
              </div>

              {/* Legend & Quick Switch Helper */}
              <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EAB308] inline-block shadow-xs shrink-0"></span>
                  <span className="text-gray-600 font-medium">Tanggal dengan slot tersedia</span>
                </div>
                {earliestAvailableDate && date && formatDateToKey(date) !== formatDateToKey(earliestAvailableDate) && (
                  <button
                    type="button"
                    onClick={() => setDate(earliestAvailableDate)}
                    className="text-[#561269] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lompat ke {earliestAvailableDate.getDate()} {MONTHS[earliestAvailableDate.getMonth()].substring(0, 3)}</span>
                    <span>&rarr;</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* KANAN */}
          <div className="flex flex-col gap-6">
            {/* Box 3: Pilih Layanan */}
            <div className="bg-white rounded-2xl border border-gray-300 p-5 sm:p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">3</div>
                <h3 className="text-sm font-semibold text-gray-800">Pilih Layanan</h3>
              </div>

              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Option Psikolog */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    layanan.toLowerCase().includes("psikolog") || layanan.toLowerCase().includes("konsultasi")
                      ? "border-[#C3A4CE] bg-[#FCFAFD]"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg shrink-0">P</div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#561269] text-[15px]">Psikolog Klinis</h4>
                    <p className="text-[10px] text-gray-500 mt-1 mb-2 leading-tight">
                      Konsultasi mendalam dengan psikolog klinis profesional berlisensi STR & SIPP.
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="layanan"
                    value="Psikolog"
                    checked={layanan.toLowerCase().includes("psikolog") || layanan.toLowerCase().includes("konsultasi")}
                    onChange={() => setLayanan("Psikolog")}
                    className="w-5 h-5 text-[#561269] focus:ring-[#561269]"
                  />
                </label>

                {/* Option Konselor */}
                <label
                  className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all shrink-0 ${
                    layanan.toLowerCase().includes("konselor") && !layanan.toLowerCase().includes("peer")
                      ? "border-[#C3A4CE] bg-[#FCFAFD]"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-14 h-14 rounded-md bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-base shrink-0">K</div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#561269] text-[14px]">Konselor</h4>
                    <p className="text-[9px] text-gray-500 mt-0.5 mb-1 leading-tight">
                      Konseling terarah bersama tenaga konselor berpengalaman.
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="layanan"
                    value="Konselor"
                    checked={layanan.toLowerCase().includes("konselor") && !layanan.toLowerCase().includes("peer")}
                    onChange={() => setLayanan("Konselor")}
                    className="w-4 h-4 text-[#561269] focus:ring-[#561269]"
                  />
                </label>

                {/* Option Peer Konselor */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    layanan.toLowerCase().includes("peer")
                      ? "border-[#C3A4CE] bg-[#FCFAFD]"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">PK</div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#561269] text-[15px]">Peer Konselor</h4>
                    <p className="text-[10px] text-gray-500 mt-1 mb-2 leading-tight">
                      Pendampingan teman sebaya yang terlatih, nyaman, dan terbuka tanpa stigma.
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="layanan"
                    value="Peer Konselor"
                    checked={layanan.toLowerCase().includes("peer")}
                    onChange={() => setLayanan("Peer Konselor")}
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

              {isLayananNonaktif ? (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-amber-300 rounded-xl bg-amber-50/70 text-center gap-2 my-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-base">
                    ⚠️
                  </div>
                  <p className="text-xs font-bold text-amber-900">
                    Layanan Sedang Dinonaktifkan
                  </p>
                  <p className="text-[11px] text-amber-700 max-w-[260px] leading-relaxed">
                    Sesi konsultasi tidak dapat dijadwalkan untuk layanan yang sedang dinonaktifkan.
                  </p>
                </div>
              ) : isLoadingSlots ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  Memeriksa ketersediaan jadwal...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((slot) => {
                    const timeVal = slot.jam_mulai.substring(0, 5)
                    const isSelected = waktu === slot.jam_mulai

                    return (
                      <button
                        key={slot.id || slot.jam_mulai}
                        type="button"
                        onClick={() => {
                          setWaktu(slot.jam_mulai)
                          setSelectedSlotId(slot.id)
                        }}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269]"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {timeVal}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-5 border border-dashed border-gray-200 rounded-xl bg-gray-50/70 text-center gap-2.5 my-2">
                  <div className="w-9 h-9 rounded-full bg-purple-50 text-[#561269] flex items-center justify-center text-base">
                    🕒
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-700">
                      Tidak Ada Slot {metode} Tersedia
                    </p>
                    <p className="text-[11px] text-gray-400 max-w-[260px] leading-relaxed">
                      Slot jadwal pada tanggal ini sudah dibooking atau belum dibuka oleh psikolog.
                    </p>
                  </div>
                  {earliestAvailableDate && date && formatDateToKey(date) !== formatDateToKey(earliestAvailableDate) && (
                    <button
                      type="button"
                      onClick={() => setDate(earliestAvailableDate)}
                      className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5FD] border border-[#C3A4CE] text-[#561269] text-[11px] font-semibold hover:bg-[#F3E8F7] transition-all cursor-pointer shadow-2xs"
                    >
                      <span>💡 Slot terdekat:</span>
                      <span className="font-bold underline">
                        {earliestAvailableDate.getDate()} {MONTHS[earliestAvailableDate.getMonth()]} {earliestAvailableDate.getFullYear()}
                      </span>
                      <span>&rarr;</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div suppressHydrationWarning className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
            {date ? `${date.getDate()} ${MONTHS[date.getMonth()].substring(0, 3)} ${date.getFullYear()}` : "Pilih Tanggal"}
          </div>
          <div className="text-sm sm:text-base font-bold text-black flex items-center gap-2 flex-wrap">
            {waktu ? (
              <>
                <span className="font-extrabold text-black">{waktu.substring(0, 5)} WIB</span>
                <span className="italic font-normal text-xs sm:text-sm text-gray-500">({metode})</span>
                {activePsikologName && (
                  <span className="text-xs sm:text-sm font-semibold text-[#561269] bg-[#FAF5FD] px-3 py-1 rounded-full border border-purple-100/80 flex items-center gap-1.5 shadow-2xs">
                    <User className="w-3.5 h-3.5 fill-[#561269] text-[#561269] shrink-0" />
                    <span>{activePsikologName}</span>
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400 font-normal text-xs sm:text-sm italic">
                (Belum ada slot waktu dipilih)
              </span>
            )}
          </div>
        </div>

        {isSlotReady && !isLayananNonaktif ? (
          <Link
            href={buildBayarUrl()}
            className="bg-[#EAB308] hover:bg-yellow-500 text-black font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-xl shadow-sm hover:scale-105 transition-all"
          >
            Bayar Sekarang
          </Link>
        ) : isLayananNonaktif ? (
          <button
            type="button"
            onClick={() => setShowNonaktifModal(true)}
            className="bg-[#EAB308] hover:bg-yellow-500 text-black font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-xl shadow-sm hover:scale-105 transition-all cursor-pointer"
          >
            Bayar Sekarang
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="bg-gray-200 text-gray-400 font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-xl cursor-not-allowed opacity-75"
          >
            Pilih Jadwal Tersedia
          </button>
        )}
      </div>

      {/* Modal Dialog Notifikasi Layanan Dinonaktifkan */}
      {showNonaktifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">
              Pendaftaran Sesi Tidak Tersedia
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              Mohon maaf, layanan konsultasi <span className="font-bold text-[#561269]">&ldquo;{nonaktifLayananNama || layanan}&rdquo;</span> sudah dinonaktifkan oleh admin. Anda saat ini tidak dapat melakukan pendaftaran sesi untuk layanan ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowNonaktifModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition cursor-pointer"
              >
                Tutup
              </button>
              <Link
                href="/layanan"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#561269] text-white font-bold text-xs sm:text-sm hover:bg-[#430e52] transition shadow-xs"
              >
                Lihat Layanan Lain
              </Link>
            </div>
          </div>
        </div>
      )}

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
