"use client"

import React from "react"
import { inputClass, labelClass, helperClass } from "./formStyles"
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
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={form.linkMeet}
              onChange={handleChange}
              className={`${inputClass} ${errors.linkMeet ? "border-red-400 bg-red-50/20" : ""}`}
            />
            {errors.linkMeet ? (
              <span className="block text-[11px] text-red-600 font-semibold mt-1">
                {errors.linkMeet}
              </span>
            ) : (
              <span className={helperClass}>
                Generate link secara manual dan tempelkan di sini (hanya untuk peserta yang telah lunas)
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
            placeholder="https://chat.whatsapp.com/invite/xxxx"
            value={form.linkWa}
            onChange={handleChange}
            className={`${inputClass} ${errors.linkWa ? "border-red-400 bg-red-50/20" : ""}`}
          />
          {errors.linkWa ? (
            <span className="block text-[11px] text-red-600 font-semibold mt-1">
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

