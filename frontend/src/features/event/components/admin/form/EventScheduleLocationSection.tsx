"use client"

import React, { RefObject } from "react"
import { inputClass, inputErrorClass, labelClass, helperClass } from "./formStyles"
import { EventFormData } from "../AdminEventFormClient"

interface EventScheduleLocationSectionProps {
  form: EventFormData
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void
  dateInputRef: RefObject<HTMLInputElement>
  errors?: { [key: string]: string }
}

export function EventScheduleLocationSection({
  form,
  handleChange,
  dateInputRef,
  errors = {},
}: EventScheduleLocationSectionProps) {
  return (
    <>
      {/* Tanggal & Waktu Event */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        <div>
          <label htmlFor="tanggal" className={labelClass}>
            Tanggal Event <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              ref={dateInputRef}
              id="tanggal"
              name="tanggal"
              type="date"
              required
              value={form.tanggal}
              onChange={handleChange}
              className={`${inputClass} pr-11 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${
                errors.tanggal ? inputErrorClass : ""
              }`}
            />
            <button
              type="button"
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker?.()
                } catch {
                  dateInputRef.current?.focus()
                }
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#561269] transition-colors p-1"
              title="Pilih tanggal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </button>
          </div>
          {errors.tanggal ? (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              {errors.tanggal}
            </span>
          ) : (
            <span className={helperClass}>Tanggal penyelenggaraan event</span>
          )}
        </div>

        <div>
          <label htmlFor="waktuMulai" className={labelClass}>
            Waktu Mulai <span className="text-red-500">*</span>
          </label>
          <input
            id="waktuMulai"
            name="waktuMulai"
            type="time"
            required
            value={form.waktuMulai}
            onChange={handleChange}
            className={`${inputClass} ${errors.waktuMulai ? inputErrorClass : ""}`}
          />
          {errors.waktuMulai ? (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              {errors.waktuMulai}
            </span>
          ) : (
            <span className={helperClass}>Jam mulai event (WIB)</span>
          )}
        </div>

        <div>
          <label htmlFor="waktuSelesai" className={labelClass}>
            Waktu Selesai <span className="text-red-500">*</span>
          </label>
          <input
            id="waktuSelesai"
            name="waktuSelesai"
            type="time"
            required
            value={form.waktuSelesai}
            onChange={handleChange}
            className={`${inputClass} ${errors.waktuSelesai ? inputErrorClass : ""}`}
          />
          {errors.waktuSelesai ? (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              {errors.waktuSelesai}
            </span>
          ) : (
            <span className={helperClass}>Jam berakhir event (WIB)</span>
          )}
        </div>
      </div>

      {/* Lokasi & Pembicara */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label htmlFor="lokasi" className={labelClass}>
            Lokasi / Venue <span className="text-red-500">*</span>
          </label>
          <input
            id="lokasi"
            name="lokasi"
            type="text"
            required
            value={form.lokasi}
            onChange={handleChange}
            className={`${inputClass} ${errors.lokasi ? inputErrorClass : ""}`}
          />
          {errors.lokasi ? (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              {errors.lokasi}
            </span>
          ) : (
            <span className={helperClass}>
              {form.tipe === "Online"
                ? "Tulis platform pertemuan (misal: Google Meet / Zoom)"
                : "Tulis nama tempat atau alamat gedung acara"}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="pembicara" className={labelClass}>
            Pembicara / Narasumber <span className="text-red-500">*</span>
          </label>
          <input
            id="pembicara"
            name="pembicara"
            type="text"
            required
            value={form.pembicara}
            onChange={handleChange}
            className={`${inputClass} ${errors.pembicara ? inputErrorClass : ""}`}
          />
          {errors.pembicara ? (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              {errors.pembicara}
            </span>
          ) : (
            <span className={helperClass}>Nama pembicara beserta gelar lengkap</span>
          )}
        </div>
      </div>
    </>
  )
}
