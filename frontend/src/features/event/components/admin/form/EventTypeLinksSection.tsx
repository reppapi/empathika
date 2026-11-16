"use client"

import React from "react"
import { inputClass, inputErrorClass, labelClass, helperClass } from "./formStyles"
import { EventFormData } from "../AdminEventFormClient"

interface EventTypeLinksSectionProps {
  form: EventFormData
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void
  errors: { [key: string]: string }
}

export function EventTypeLinksSection({
  form,
  handleChange,
  errors,
}: EventTypeLinksSectionProps) {
  return (
    <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4">
      <div>
        <label htmlFor="tipe" className={labelClass}>
          Tipe Event <span className="text-red-500">*</span>
        </label>
        <select
          id="tipe"
          name="tipe"
          required
          value={form.tipe}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>
        <span className={helperClass}>
          Pilih apakah event diselenggarakan secara online (virtual) atau offline (tatap muka)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Kolom Link Google Meet: Tampil jika tipe Online */}
        {form.tipe === "Online" && (
          <div>
            <label htmlFor="linkMeet" className={labelClass}>
              Link Google Meet <span className="text-red-500">*</span>
            </label>
            <input
              id="linkMeet"
              name="linkMeet"
              type="url"
              required={form.tipe === "Online"}
              value={form.linkMeet}
              onChange={handleChange}
              className={`${inputClass} ${errors.linkMeet ? inputErrorClass : ""}`}
            />
            {errors.linkMeet ? (
              <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                {errors.linkMeet}
              </span>
            ) : (
              <span className={helperClass}>
                Tempelkan link Google Meet (hanya untuk peserta yang telah lunas)
              </span>
            )}
          </div>
        )}

        {/* Kolom Link Grup WhatsApp: Wajib untuk Online maupun Offline */}
        <div className={form.tipe === "Offline" ? "md:col-span-2" : ""}>
          <label htmlFor="linkWa" className={labelClass}>
            Link Grup WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            id="linkWa"
            name="linkWa"
            type="url"
            required
            value={form.linkWa}
            onChange={handleChange}
            className={`${inputClass} ${errors.linkWa ? inputErrorClass : ""}`}
          />
          {errors.linkWa ? (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              {errors.linkWa}
            </span>
          ) : (
            <span className={helperClass}>
              Link grup WhatsApp koordinasi peserta (generate manual dan tempelkan di sini)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

