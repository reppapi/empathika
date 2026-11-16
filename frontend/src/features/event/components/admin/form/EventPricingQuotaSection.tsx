"use client"

import React from "react"
import { inputClass, labelClass, helperClass } from "./formStyles"
import { EventFormData } from "../AdminEventFormClient"
import { Users2, Plus, Trash2 } from "lucide-react"

interface EventPricingQuotaSectionProps {
  form: EventFormData
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  setForm?: React.Dispatch<React.SetStateAction<EventFormData>>
  errors: { [key: string]: string }
}

export function EventPricingQuotaSection({
  form,
  handleChange,
  setForm,
  errors,
}: EventPricingQuotaSectionProps) {
  const bundlingList = form.paketBundlingList && form.paketBundlingList.length > 0
    ? form.paketBundlingList
    : [{ nama_paket: "Paket Duo Hemat", kuota_tiket: 2, harga_paket: 0 }]

  const handleAddBundle = () => {
    if (!setForm) return
    const nextCount = bundlingList.length + 2
    setForm((prev) => ({
      ...prev,
      paketBundlingList: [
        ...(prev.paketBundlingList || []),
        {
          nama_paket: `Paket ${nextCount} Orang`,
          kuota_tiket: nextCount,
          harga_paket: 0,
        },
      ],
    }))
  }

  const handleRemoveBundle = (index: number) => {
    if (!setForm) return
    setForm((prev) => {
      const updated = [...(prev.paketBundlingList || [])]
      updated.splice(index, 1)
      return {
        ...prev,
        paketBundlingList: updated.length > 0 ? updated : [{ nama_paket: "Paket Duo Hemat", kuota_tiket: 2, harga_paket: 0 }],
      }
    })
  }

  const handleUpdateBundle = (index: number, field: "nama_paket" | "kuota_tiket" | "harga_paket", value: any) => {
    if (!setForm) return
    setForm((prev) => {
      const updated = [...(prev.paketBundlingList || [])]
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: field === "harga_paket" || field === "kuota_tiket" ? Number(value) || 0 : value,
        }
      }
      return {
        ...prev,
        paketBundlingList: updated,
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Kuota, Harga Satuan, dan Harga Coret ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        <div>
          <label htmlFor="kuota" className={labelClass}>
            Kuota Peserta Total <span className="text-red-500">*</span>
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
            Harga Asli Satuan (Rp) <span className="text-red-500">*</span>
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
          <span className={helperClass}>Harga riil per 1 tiket peserta</span>
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
              Harga awal sebelum diskon (untuk coretan)
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Seksi Khusus Tiket Bundling (Opsi A: Paket Tetap) ── */}
      <div className="rounded-2xl border border-purple-100 bg-[#FAF7FC] p-5 sm:p-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#561269] text-white shrink-0 shadow-sm">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Fitur Tiket Bundling (Paket Berdua / Rombongan)
              </h4>
              <p className="text-xs text-gray-500">
                Tawarkan harga hemat untuk pembelian beberapa tiket sekaligus dalam 1 transaksi
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              name="isBundlingActive"
              checked={form.isBundlingActive}
              onChange={(e) => {
                if (setForm) {
                  setForm((prev) => ({
                    ...prev,
                    isBundlingActive: e.target.checked,
                  }))
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#561269]"></div>
            <span className="ml-2.5 text-xs font-bold text-gray-800">
              {form.isBundlingActive ? "Aktif" : "Nonaktif"}
            </span>
          </label>
        </div>

        {form.isBundlingActive && (
          <div className="mt-4 pt-4 border-t border-purple-100/80 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700">Daftar Paket Bundling yang Tersedia:</span>
              <button
                type="button"
                onClick={handleAddBundle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#561269] hover:bg-[#430e52] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Paket Lain
              </button>
            </div>

            <div className="space-y-3">
              {bundlingList.map((bundle, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs flex flex-col md:flex-row items-start md:items-center gap-3"
                >
                  <div className="flex-1 w-full md:w-auto">
                    <label className={labelClass}>Nama Paket</label>
                    <input
                      type="text"
                      placeholder="Misal: Paket Duo Hemat"
                      value={bundle.nama_paket}
                      onChange={(e) => handleUpdateBundle(idx, "nama_paket", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="w-full md:w-44">
                    <label className={labelClass}>Jumlah Tiket</label>
                    <select
                      value={bundle.kuota_tiket}
                      onChange={(e) => handleUpdateBundle(idx, "kuota_tiket", e.target.value)}
                      className={inputClass}
                    >
                      <option value="2">2 Tiket (Duo)</option>
                      <option value="3">3 Tiket (Trio)</option>
                      <option value="4">4 Tiket (Squad 4)</option>
                      <option value="5">5 Tiket (Tim 5)</option>
                      <option value="6">6 Tiket (Grup 6)</option>
                      <option value="10">10 Tiket (Rombongan)</option>
                    </select>
                  </div>

                  <div className="w-full md:w-48">
                    <label className={labelClass}>Harga Paket (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Contoh: 400000"
                      value={bundle.harga_paket || ""}
                      onChange={(e) => handleUpdateBundle(idx, "harga_paket", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {bundlingList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBundle(idx)}
                      className="p-2.5 mt-5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0"
                      title="Hapus paket ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 italic">
              * Anda dapat menambahkan beberapa paket sekaligus (misal: Paket Berdua, Bertiga, atau Berempat). Pembeli akan memilih salah satu paket ini saat checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


