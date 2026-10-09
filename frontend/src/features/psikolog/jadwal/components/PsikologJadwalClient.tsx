"use client"

import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export default function PsikologJadwalClient() {
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 4))

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:30 - 14:30",
    "14:30 - 15:30",
    "15:30 - 16:30"
  ]

  const calendarDays = [
    { day: "Min", date: "" },
    { day: "Sen", date: "1" },
    { day: "Sel", date: "2" },
    { day: "Rab", date: "3" },
    { day: "Kam", date: "4", active: true },
    { day: "Jum", date: "5" },
    { day: "Sab", date: "6" },
  ]

  const weeklyDays = [
    { day: "Sen", date: "1 Agus" },
    { day: "Sel", date: "2 Agus" },
    { day: "Rab", date: "3 Agus" },
    { day: "Kam", date: "4 Agus" },
    { day: "Jum", date: "5 Agus" },
    { day: "Sab", date: "6 Agus" },
  ]

  return (
    <div className="flex flex-col gap-6 font-sans text-gray-800 pb-16">
      
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
        nama, M.Psi., Psikolog
      </h1>

      {/* Card 1: Jadwal Sesi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Jadwal Sesi</h2>
        <p className="text-sm text-gray-500 mb-8">
          Atur jadwal sesi konseling Anda dengan mudah. Pilih tanggal dan waktu yang tersedia sesuai dengan preferensi Anda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Calendar Picker (Left) */}
          <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-4 h-full flex flex-col items-center justify-center min-h-[300px]">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="mx-auto bg-transparent"
            />
          </div>

          {/* Time Picker (Right) */}
          <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-6 h-full flex flex-col">
            <h3 className="font-bold text-[15px] mb-4">kamis, 4 Agustus 2026</h3>
            
            <div className="flex flex-col gap-2.5 mb-6">
              {timeSlots.map((time, idx) => (
                <label key={idx} className="flex items-center gap-3 border border-gray-200 rounded-md px-4 py-2.5 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="radio"
                    name="timeSlot"
                    value={time}
                    checked={selectedTime === time}
                    onChange={() => setSelectedTime(time)}
                    className="w-4 h-4 text-[#561269] focus:ring-[#561269] border-gray-300"
                  />
                  <span className="text-[13px] font-medium text-gray-700">{time}</span>
                </label>
              ))}
            </div>

            <button className="mt-auto w-full bg-[#d6d6d6] hover:bg-gray-300 text-gray-700 font-bold py-3.5 rounded-lg text-[13px] transition-colors">
              Pilih Jadwal Ini
            </button>
          </div>

        </div>
      </div>

      {/* Card 2: Jadwal Mingguan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Jadwal Mingguan</h2>
        <p className="text-sm text-gray-500 mb-6">
          Lihat ringkasan jadwal sesi Anda dalam satu minggu
        </p>

        {/* Week Selector */}
        <div className="flex items-center gap-3 text-[13px] font-bold text-gray-800 mb-4">
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          </button>
          <span>1-6 Agustus 2026</span>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>

        {/* Weekly Grid */}
        <div className="w-full border border-gray-200 rounded-lg overflow-x-auto hide-scrollbar">
          <div className="min-w-[700px]">
            {/* Header */}
            <div className="grid grid-cols-6 border-b border-gray-200">
              {weeklyDays.map((wd, i) => (
                <div key={i} className="py-3 flex flex-col items-center justify-center border-r border-gray-200 last:border-0">
                  <span className="text-[13px] font-bold text-gray-800">{wd.day}</span>
                  <span className="text-[11px] text-gray-500">{wd.date}</span>
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-6 h-[400px]">
              {/* Sen */}
              <div className="border-r border-gray-200 p-1.5 flex flex-col gap-2">
                <div className="bg-[#e4e4e4] rounded-md p-2 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0 mt-1" />
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">09:00 - 10:00</span>
                </div>
                <div className="bg-[#d7e6dc] rounded-md p-2 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#185e26] shrink-0 mt-1" />
                  <div className="flex flex-col text-[10px] font-bold text-gray-800 leading-tight">
                    <span>10:00 - 11:00</span>
                    <span className="font-normal mt-0.5">Hipnoterapi</span>
                    <span className="font-normal italic text-[9px]">(Online)</span>
                  </div>
                </div>
              </div>

              {/* Sel */}
              <div className="border-r border-gray-200 p-1.5 flex flex-col gap-2">
                <div className="mt-20 bg-[#d7e6dc] rounded-md p-2 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#185e26] shrink-0 mt-1" />
                  <div className="flex flex-col text-[10px] font-bold text-gray-800 leading-tight">
                    <span>13:00 - 14:00</span>
                    <span className="font-normal mt-0.5">Home Visit</span>
                    <span className="font-normal italic text-[9px]">(Offline)</span>
                  </div>
                </div>
              </div>

              {/* Rab */}
              <div className="border-r border-gray-200 p-1.5"></div>
              {/* Kam */}
              <div className="border-r border-gray-200 p-1.5"></div>
              {/* Jum */}
              <div className="border-r border-gray-200 p-1.5"></div>
              {/* Sab */}
              <div className="p-1.5"></div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-5 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#185e26]" />
            <span className="text-[11px] font-bold text-gray-600">Sudah Dibooking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-[11px] font-bold text-gray-600">Tersedia</span>
          </div>
        </div>

      </div>

    </div>
  )
}
