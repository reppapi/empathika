"use client"

import {
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

import { TIME_SLOTS } from "@/features/konseling/data/jadwalAdminData"
import { useJadwalAdmin } from "@/features/konseling/hooks/useJadwalAdmin"

// Sub-components & Modals
import JadwalSummaryCards from "./JadwalSummaryCards"
import JadwalHariIniSection from "./JadwalHariIniSection"
import JadwalAsesmenPicker from "./JadwalAsesmenPicker"
import JadwalMingguanGrid from "./JadwalMingguanGrid"
import ModalDetailSesiKlien from "./ModalDetailSesiKlien"
import ModalBatalSesi from "./ModalBatalSesi"
import ModalTambahSesi from "@/features/dashboard/components/admin/ModalTambahSesi"

// Backward-compatible exports for external consumers (e.g. dashboardData, AdminDashboardClient)
export type { BookedAssessment, ClientSessionToday } from "@/features/konseling/types"
export { RAW_CLIENT_SESSIONS, getInitialSessionsBasedOnTime } from "@/features/konseling/data/jadwalAdminData"

interface JadwalAdminProps {
  isBiroContext?: boolean
}

export default function JadwalAdmin({ isBiroContext = false }: JadwalAdminProps) {
  const {
    // Dates & Filter State
    date,
    datePickerValue,
    formattedSelectedDate,
    formattedDate,
    dateInputRef,
    handleSelectDate,
    selectedLayanan,
    selectedStatus,
    isLayananDropdownOpen,
    setIsLayananDropdownOpen,
    handleLayananChange,
    handleStatusChange,
    layananOptions,
    matchLayanan,

    // Stats & Today's Sessions
    stats,
    today,
    todaySessions,
    filteredTodaySessions,
    nearestSession,
    nearestSessions,
    activeMenuId,
    setActiveMenuId,

    // Weekly Grid State & Actions
    weekRangeTitle,
    weekDays,
    currentWeekAllSessions,
    canGoPrevWeek,
    goToPrevWeek,
    goToNextWeek,
    handleSelectWeeklySession,

    // Booking & Slots
    bookedSessions,
    bookingSuccessMsg,
    handleBooking,
    handleRemoveWeeklySlot,

    // Modals & Action Handlers
    isModalOpen,
    setIsModalOpen,
    handleModalSuccess,
    selectedDetailSession,
    setSelectedDetailSession,
    sessionToCancel,
    setSessionToCancel,
    handleCancelSession,
    handleMarkCompleted,
    handleCopyWhatsAppMessage,
    handleCopyWhatsAppPsikologMessage,

    // Toast
    actionToast,
  } = useJadwalAdmin({ isBiroContext })

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 font-poppins pb-10">
      {/* Top Actions & Filters */}
      <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3">
        {/* Dropdown Layanan */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLayananDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 border px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-2xs cursor-pointer ${
              selectedLayanan !== "Semua Layanan"
                ? "border-[#561269] bg-purple-50 text-[#561269] font-semibold"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>{selectedLayanan}</span>
            <ChevronDown
              className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                isLayananDropdownOpen ? "rotate-180 text-[#561269]" : "text-gray-500"
              }`}
            />
          </button>

          {isLayananDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsLayananDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Filter Layanan
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {layananOptions.map((opt) => {
                    const isSelected = selectedLayanan === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          handleLayananChange(opt)
                          setIsLayananDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-purple-50 text-[#561269] font-bold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#561269] ml-2 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
                {selectedLayanan !== "Semua Layanan" && (
                  <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleLayananChange("Semua Layanan")
                        setIsLayananDropdownOpen(false)
                      }}
                      className="w-full text-center py-1.5 text-xs text-[#561269] hover:bg-purple-50 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Date Selector */}
        <div className="relative">
          <input
            ref={dateInputRef}
            type="date"
            className="sr-only"
            value={datePickerValue}
            onChange={(e) => {
              if (e.target.value) {
                handleSelectDate(new Date(e.target.value + "T00:00:00"))
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (dateInputRef.current) {
                try {
                  dateInputRef.current.showPicker()
                } catch {
                  dateInputRef.current.focus()
                }
              }
            }}
            className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
          >
            {formattedSelectedDate}
            <CalendarIcon className="w-4 h-4 ml-1 text-gray-500" />
          </button>
        </div>

        {/* Button Sesi Baru: Hanya ditampilkan untuk Admin Pusat */}
        {!isBiroContext && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Sesi Baru
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <JadwalSummaryCards
        stats={stats}
        activeStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      {/* Sesi Klien Hari Ini (Highlight & Table) */}
      <JadwalHariIniSection
        isReadOnly={isBiroContext}
        filteredTodaySessions={filteredTodaySessions}
        todaySessionsCount={todaySessions.length}
        nearestSession={nearestSession}
        nearestSessions={nearestSessions}
        selectedLayanan={selectedLayanan}
        formattedDate={formattedDate}
        activeMenuId={activeMenuId}
        setActiveMenuId={setActiveMenuId}
        onSelectDetail={(session) => setSelectedDetailSession(session)}
        onSelectCancel={(session) => setSessionToCancel(session)}
        onMarkCompleted={handleMarkCompleted}
        onCopyWhatsApp={handleCopyWhatsAppMessage}
        onCopyWhatsAppPsikolog={handleCopyWhatsAppPsikologMessage}
        onResetFilter={() => {
          handleLayananChange("Semua Layanan")
          handleStatusChange("semua")
        }}
      />

      {/* Jadwal Asesmen (Calendar & Time Slot Picker) */}
      <JadwalAsesmenPicker
        date={date}
        onSelectDate={handleSelectDate}
        bookedSessions={bookedSessions}
        bookingSuccessMsg={bookingSuccessMsg}
        onBooking={handleBooking}
        timeSlots={TIME_SLOTS}
      />

      {/* Jadwal Mingguan (Weekly Assessment Schedule Grid) */}
      <JadwalMingguanGrid
        canGoPrevWeek={canGoPrevWeek}
        goToPrevWeek={goToPrevWeek}
        goToNextWeek={goToNextWeek}
        weekRangeTitle={weekRangeTitle}
        weekDays={weekDays}
        currentWeekAllSessions={currentWeekAllSessions}
        selectedLayanan={selectedLayanan}
        matchLayanan={matchLayanan}
        today={today}
        onSelectSession={handleSelectWeeklySession}
        onRemoveSlot={handleRemoveWeeklySlot}
      />

      {/* ── Modal Tambah Sesi ── */}
      <ModalTambahSesi
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* ── Modal Detail Sesi Klien ── */}
      <ModalDetailSesiKlien
        isReadOnly={isBiroContext}
        session={selectedDetailSession}
        onClose={() => setSelectedDetailSession(null)}
        onCancelClick={(session) => {
          setSelectedDetailSession(null)
          setSessionToCancel(session)
        }}
        onMarkCompleted={(id, namaKlien) => {
          handleMarkCompleted(id, namaKlien)
          setSelectedDetailSession(null)
        }}
        onCopyWhatsApp={handleCopyWhatsAppMessage}
        onCopyWhatsAppPsikolog={handleCopyWhatsAppPsikologMessage}
      />

      {/* ── Modal Konfirmasi Pembatalan ── */}
      <ModalBatalSesi
        session={sessionToCancel}
        onClose={() => setSessionToCancel(null)}
        onConfirmCancel={handleCancelSession}
      />

      {/* ── Toast Notifikasi Aksi ── */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-5">
          {actionToast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{actionToast.message}</span>
        </div>
      )}
    </div>
  )
}
