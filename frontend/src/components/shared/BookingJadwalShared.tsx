"use client"

import Link from "next/link"
import { PilihTanggalBox } from "@/components/shared/PilihTanggalBox"
import { User, CheckCircle2 } from "lucide-react"
import {
  useJadwalClient,
  formatDateToKey,
  type UseJadwalClientOptions,
} from "@/features/konseling/hooks/useJadwalClient"

export interface BookingJadwalSharedProps {
  mode?: "konseling" | "asesmen"
  showStepper?: boolean
  stepNumber?: number
  title?: string
  subtitle?: string
  asesmenPackage?: {
    id: string
    title: string
    shortTitle?: string
    subtitle?: string
    tagline?: string
    description?: string
    weekday: string
    weekend: string
    duration?: string
    offlineBenefits?: string[]
    [key: string]: any
  }
  initialMetode?: "Online" | "Offline"
  initialDate?: Date
  initialOfflinePlan?: "weekday" | "weekend"
  onDateChange?: (date: Date) => void
  onOfflinePlanChange?: (plan: "weekday" | "weekend") => void
  onMetodeChange?: (metode: "Online" | "Offline") => void
  customBayarUrl?: string
}

export function BookingJadwalShared({
  mode = "konseling",
  showStepper = true,
  title,
  subtitle,
  asesmenPackage,
  initialMetode,
  initialDate,
  initialOfflinePlan,
  onDateChange,
  onOfflinePlanChange,
  onMetodeChange,
  customBayarUrl,
}: BookingJadwalSharedProps) {
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
    selectedOfflinePlan,
    setSelectedOfflinePlan,
    activePrice,
    buildBayarUrl,
    isSlotReady,
  } = useJadwalClient({
    mode,
    tipeJadwal: mode === "asesmen" ? "ASESMEN" : "KONSULTASI",
    initialMetode,
    asesmenPackage,
    initialDate,
    initialOfflinePlan,
    onDateChange,
    onOfflinePlanChange,
    onMetodeChange: (m) => onMetodeChange?.(m as "Online" | "Offline"),
  })

  const pageTitle = title || "Jadwalkan layanan anda"
  const pageSubtitle =
    subtitle ||
    (mode === "asesmen"
      ? "Pilih tanggal dan slot waktu tatap muka di klinik. Slot waktu hanya dapat dipilih jika telah dibuka oleh admin klinik."
      : "Pilih metode konsultasi dan tanggal yang Anda inginkan. Slot waktu hanya dapat dipilih jika telah dibuka oleh psikolog.")

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-36">
      {/* 1. Stepper Area */}
      {showStepper && (
        <div className="w-full pt-28 pb-8 flex flex-col items-center bg-white border-b border-gray-100">
          <div className="flex items-center w-full max-w-sm justify-center px-4 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-bold mb-1.5 shadow-sm text-sm">
                1
              </div>
              <span className="text-[10px] sm:text-xs text-gray-700">paket</span>
            </div>

            {/* Line 1-2 */}
            <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-5"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-bold mb-1.5 shadow-sm text-sm">
                2
              </div>
              <span className="text-[10px] sm:text-xs text-gray-900 font-extrabold">jadwal</span>
            </div>

            {/* Line 2-3 */}
            <div className="h-[2px] bg-gray-300 flex-1 mx-2 -mt-5"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-[#E6D9E9] border border-purple-200 flex items-center justify-center text-black font-medium mb-1.5 text-sm">
                3
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500">Bayar</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 mt-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            {pageSubtitle}
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:auto-rows-fr gap-5 lg:gap-6 items-stretch">
          {/* KIRI */}
          <div className="flex flex-col gap-5 h-full">
            {/* Box 1: Metode Konsultasi / Asesmen */}
            <div className="bg-white rounded-2xl border border-[#DCD0E1] p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-5 h-5 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {mode === "asesmen" || layanan.toLowerCase().includes("asesmen") || !!asesmenPackage
                    ? "Pilih Metode Asesmen"
                    : "Pilih Metode Konsultasi"}
                </h3>
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setMetode("Online")}
                  className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                    metode === "Online"
                      ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269]"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setMetode("Offline")}
                  className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
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
            <PilihTanggalBox
              date={date}
              setDate={setDate}
              stepNumber={2}
              title="Pilih Tanggal"
              minDate={today}
              datesWithSlots={datesWithSlots}
              earliestAvailableDate={earliestAvailableDate}
              months={MONTHS}
              formatDateToKey={formatDateToKey}
              legendLabel={mode === "asesmen" ? "Slot jadwal asesmen tersedia" : "Tanggal dengan slot tersedia"}
              showLegend={true}
              className="flex-1 h-full min-h-0"
            />
          </div>

          {/* KANAN */}
          <div className="flex flex-col gap-5 h-full">
            {/* Box 3: Pilih Layanan (Konseling vs Asesmen) */}
            {mode === "asesmen" ? (
              <div className="bg-white rounded-2xl border border-[#DCD0E1] p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-5 h-5 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Pilih Layanan
                    </h3>
                    <p className="text-[10px] text-gray-400 font-normal">
                      {asesmenPackage?.title || "Sesi Asesmen Klinis"} &bull; Tatap Muka
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {/* Option Weekday */}
                  <label
                    onClick={() => setSelectedOfflinePlan("weekday")}
                    className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedOfflinePlan === "weekday"
                        ? "border-[#C3A4CE] bg-[#FCFAFD]"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-[#561269] font-bold text-sm shrink-0">
                      WD
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-[#561269] text-xs sm:text-[13px]">
                          Hari Kerja (Weekday)
                        </h4>
                        <span className="font-extrabold text-[#561269] text-xs shrink-0">
                          {asesmenPackage?.weekday || "Rp 400.000"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight truncate">
                        Senin - Jumat &bull; Sesi tatap muka di klinik
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="asesmenPlan"
                      value="weekday"
                      checked={selectedOfflinePlan === "weekday"}
                      onChange={() => setSelectedOfflinePlan("weekday")}
                      className="w-4 h-4 text-[#561269] focus:ring-[#561269] shrink-0"
                    />
                  </label>

                  {/* Option Weekend */}
                  <label
                    onClick={() => setSelectedOfflinePlan("weekend")}
                    className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedOfflinePlan === "weekend"
                        ? "border-[#C3A4CE] bg-[#FCFAFD]"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm shrink-0">
                      WE
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-amber-900 text-xs sm:text-[13px]">
                          Akhir Pekan (Weekend)
                        </h4>
                        <span className="font-extrabold text-[#CA8A04] text-xs shrink-0">
                          {asesmenPackage?.weekend || "Rp 500.000"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight truncate">
                        Sabtu - Minggu &bull; Jadwal khusus bersama asesor
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="asesmenPlan"
                      value="weekend"
                      checked={selectedOfflinePlan === "weekend"}
                      onChange={() => setSelectedOfflinePlan("weekend")}
                      className="w-4 h-4 text-[#CA8A04] focus:ring-[#CA8A04] shrink-0"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#DCD0E1] p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-5 h-5 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Pilih Layanan</h3>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {/* Option Psikolog */}
                  <label
                    className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      layanan.toLowerCase().includes("psikolog") || layanan.toLowerCase().includes("konsultasi")
                        ? "border-[#C3A4CE] bg-[#FCFAFD]"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-base shrink-0">
                      P
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-[#561269] text-xs sm:text-[13px]">Psikolog Klinis</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight truncate">
                        Konsultasi mendalam dengan psikolog klinis profesional berlisensi STR &amp; SIPP.
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="layanan"
                      value="Psikolog"
                      checked={layanan.toLowerCase().includes("psikolog") || layanan.toLowerCase().includes("konsultasi")}
                      onChange={() => setLayanan("Psikolog")}
                      className="w-4 h-4 text-[#561269] focus:ring-[#561269] shrink-0"
                    />
                  </label>

                  {/* Option Konselor */}
                  <label
                    className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all shrink-0 ${
                      layanan.toLowerCase().includes("konselor") && !layanan.toLowerCase().includes("peer")
                        ? "border-[#C3A4CE] bg-[#FCFAFD]"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-base shrink-0">
                      K
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-[#561269] text-xs sm:text-[13px]">Konselor</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight truncate">
                        Konseling terarah bersama tenaga konselor berpengalaman.
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="layanan"
                      value="Konselor"
                      checked={layanan.toLowerCase().includes("konselor") && !layanan.toLowerCase().includes("peer")}
                      onChange={() => setLayanan("Konselor")}
                      className="w-4 h-4 text-[#561269] focus:ring-[#561269] shrink-0"
                    />
                  </label>

                  {/* Option Peer Konselor */}
                  <label
                    className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      layanan.toLowerCase().includes("peer")
                        ? "border-[#C3A4CE] bg-[#FCFAFD]"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-base shrink-0">
                      PK
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-[#561269] text-xs sm:text-[13px]">Peer Konselor</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight truncate">
                        Pendampingan teman sebaya yang terlatih, nyaman, dan terbuka tanpa stigma.
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="layanan"
                      value="Peer Konselor"
                      checked={layanan.toLowerCase().includes("peer")}
                      onChange={() => setLayanan("Peer Konselor")}
                      className="w-4 h-4 text-[#561269] focus:ring-[#561269] shrink-0"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Box 4: Pilih Slot Waktu */}
            <div className="flex-1 h-full min-h-0 bg-white rounded-2xl border border-[#DCD0E1] p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-5 h-5 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Pilih Slot Waktu</h3>
                </div>

                {isLoadingSlots ? (
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
                          className={`h-10 flex items-center justify-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#E6D9E9] border-[#C3A4CE] text-[#561269] shadow-xs"
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
                        {mode === "asesmen"
                          ? "Slot jadwal asesmen offline pada tanggal ini sudah dibooking atau belum dibuka oleh admin klinik."
                          : "Slot jadwal pada tanggal ini sudah dibooking atau belum dibuka oleh psikolog."}
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
                {mode !== "asesmen" && !layanan.toLowerCase().includes("asesmen") && !asesmenPackage && activePsikologName && (
                  <span className="text-xs sm:text-sm font-semibold text-[#561269] bg-[#FAF5FD] px-3 py-1 rounded-full border border-purple-100/80 flex items-center gap-1.5 shadow-2xs">
                    <User className="w-3.5 h-3.5 fill-[#561269] text-[#561269] shrink-0" />
                    <span>{activePsikologName}</span>
                  </span>
                )}
                {activePrice && (
                  <span className="text-xs sm:text-sm font-extrabold text-[#561269] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                    {activePrice}
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

        {isSlotReady ? (
          <Link
            href={customBayarUrl || buildBayarUrl()}
            className="bg-[#EAB308] hover:bg-yellow-500 text-black font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-xl shadow-sm hover:scale-105 transition-all cursor-pointer"
          >
            Bayar Sekarang
          </Link>
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c3a4ce;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}

