"use client"

import React from "react"
import { CheckCircle2, AlertTriangle } from "lucide-react"
import ModalDetailSesiKlien from "@/features/konseling/components/admin/ModalDetailSesiKlien"
import ModalRescheduleSesi from "@/features/konseling/components/admin/ModalRescheduleSesi"
import { PsikologBukaJadwalSection } from "./sections/PsikologBukaJadwalSection"
import { PsikologJadwalMingguanSection } from "./sections/PsikologJadwalMingguanSection"
import { usePsikologJadwal } from "@/features/konseling/hooks/usePsikologJadwal"
import {
  DEFAULT_LAYANAN_KONSULTASI,
  DEFAULT_TIME_SLOTS,
  MetodeKonsultasi,
  BookedSession,
} from "./types"
import { matchPsikologSession } from "./utils/psikologDateUtils"

// Re-export types & utilities for full backward compatibility
export {
  DEFAULT_LAYANAN_KONSULTASI,
  DEFAULT_TIME_SLOTS,
  matchPsikologSession,
}
export type { MetodeKonsultasi, BookedSession }

export default function PsikologJadwalClient() {
  const {
    today,
    date,
    handleSelectDate,
    datesWithSchedules,
    activePsikolog,
    selectedLayanan,
    setSelectedLayanan,
    layananOptions,
    selectedMetode,
    setSelectedMetode,
    allowedMetode,
    timeSlots,
    setTimeSlots,
    selectedTimes,
    setSelectedTimes,
    toggleTimeSlot,
    toggleSelectAll,
    isCustomTime,
    setIsCustomTime,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    setDeletedCustomSlots,
    handleRemoveSlot,
    handleDeleteCustomTimeSlot,
    bookedSessions,
    isCurrentPsikolog,
    handleBooking,
    bookingSuccessMsg,
    weekRangeLabel,
    canGoPrevWeek,
    canGoNextWeek,
    isCurrentWeek,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
    weekDays,
    currentWeekMonday,
    handleSelectDetailSession,
    handleCancelClientBooking,
    selectedDetailSession,
    setSelectedDetailSession,
    sessionToReschedule,
    setSessionToReschedule,
    handleConfirmReschedule,
    handleMarkCompleted,
    handleCopyWhatsAppMessage,
    actionToast,
  } = usePsikologJadwal()

  return (
    <div className="flex flex-col gap-6 font-poppins text-gray-800 pb-16">
      {/* Card 1: Buka Jadwal Ketersediaan Praktik */}
      <PsikologBukaJadwalSection
        date={date}
        handleSelectDate={handleSelectDate}
        today={today}
        datesWithSchedules={datesWithSchedules}
        activePsikolog={activePsikolog}
        selectedLayanan={selectedLayanan}
        setSelectedLayanan={setSelectedLayanan}
        layananOptions={layananOptions}
        selectedMetode={selectedMetode}
        setSelectedMetode={setSelectedMetode}
        allowedMetode={allowedMetode}
        timeSlots={timeSlots}
        setTimeSlots={setTimeSlots}
        selectedTimes={selectedTimes}
        setSelectedTimes={setSelectedTimes}
        toggleTimeSlot={toggleTimeSlot}
        toggleSelectAll={toggleSelectAll}
        isCustomTime={isCustomTime}
        setIsCustomTime={setIsCustomTime}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
        setDeletedCustomSlots={setDeletedCustomSlots}
        handleRemoveSlot={handleRemoveSlot}
        handleDeleteCustomTimeSlot={handleDeleteCustomTimeSlot}
        bookedSessions={bookedSessions}
        isCurrentPsikolog={isCurrentPsikolog}
        handleBooking={handleBooking}
        bookingSuccessMsg={bookingSuccessMsg}
      />

      {/* Card 2: Jadwal Mingguan Praktik */}
      <PsikologJadwalMingguanSection
        weekRangeLabel={weekRangeLabel}
        canGoPrevWeek={canGoPrevWeek}
        canGoNextWeek={canGoNextWeek}
        isCurrentWeek={isCurrentWeek}
        goToPrevWeek={goToPrevWeek}
        goToNextWeek={goToNextWeek}
        goToCurrentWeek={goToCurrentWeek}
        weekDays={weekDays}
        currentWeekMonday={currentWeekMonday}
        today={today}
        bookedSessions={bookedSessions}
        handleSelectDate={handleSelectDate}
        handleSelectDetailSession={handleSelectDetailSession}
        handleCancelClientBooking={handleCancelClientBooking}
        handleRemoveSlot={handleRemoveSlot}
      />

      {/* ── Modal Detail Sesi Klien (Pop-up Portal Psikolog) ── */}
      <ModalDetailSesiKlien
        session={selectedDetailSession}
        onClose={() => setSelectedDetailSession(null)}
        onCancelClick={(session) => {
          handleCancelClientBooking(session)
          setSelectedDetailSession(null)
        }}
        onRescheduleClick={(session) => {
          setSelectedDetailSession(null)
          setSessionToReschedule(session)
        }}
        onMarkCompleted={(id, namaKlien) => {
          handleMarkCompleted(id, namaKlien)
          setSelectedDetailSession(null)
        }}
        onCopyWhatsApp={handleCopyWhatsAppMessage}
        isPsikologPortal={true}
      />

      {/* ── Modal Reschedule Sesi ── */}
      <ModalRescheduleSesi
        session={sessionToReschedule}
        onClose={() => setSessionToReschedule(null)}
        onConfirmReschedule={handleConfirmReschedule}
      />

      {/* ── Toast Notifikasi Aksi ── */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-5">
          {actionToast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{actionToast.message}</span>
        </div>
      )}
    </div>
  )
}
