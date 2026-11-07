"use client"

import React from "react"
import { inputClass, labelClass, helperClass } from "./formStyles"
import { EventFormData } from "../AdminEventFormClient"

interface EventPricingQuotaSectionProps {
  form: EventFormData
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  errors: { [key: string]: string }
}

export function EventPricingQuotaSection({
  form,
  handleChange,
  errors,
}: EventPricingQuotaSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      <div>
        <label htmlFor="kuota" className={labelClass}>
          Kuota Peserta <span className="text-red-500">*</span>
        </label>
        <input
          id="kuota"
          name="kuota"
          type="number"
          min={1}
          required
          placeholder="Jumlah peserta maksimal"
          value={form.kuota}
          onChange={handleChange}
          className={inputClass}
        />
        <span className={helperClass}>Kapasitas maksimal pendaftaran tiket</span>
      </div>

      <div>
        <label htmlFor="harga" className={labelClass}>
          Harga Asli / Bayar (Rp) <span className="text-red-500">*</span>
        </label>
        <input
          id="harga"
          name="harga"
          type="number"
          min={0}
          placeholder="0 jika gratis"
          value={form.harga}
          onChange={handleChange}
          className={inputClass}
        />
        <span className={helperClass}>Harga riil yang dibayar peserta (invoice)</span>
      </div>

      <div>
        <label htmlFor="hargaCoret" className={labelClass}>
          Harga Coret (Rp) <span className="text-gray-400 font-normal">(Opsional)</span>
        </label>
        <input
          id="hargaCoret"
          name="hargaCoret"
          type="number"
          min={0}
          value={form.hargaCoret}
          onChange={handleChange}
          className={`${inputClass} ${errors.hargaCoret ? "border-red-400 bg-red-50/20" : ""}`}
        />
        {errors.hargaCoret ? (
          <span className="block text-[11px] text-red-600 font-semibold mt-1">
            {errors.hargaCoret}
          </span>
        ) : (
          <span className={helperClass}>
            Harga pura-pura lebih tinggi untuk efek diskon psikologis
          </span>
        )}
      </div>
    </div>
  )
}

