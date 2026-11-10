"use client"

import React from "react"
import { KerjaSamaPageConfig } from "../../types"
import PhoneInputField from "@/components/shared/PhoneInputField"

interface TabHeroKontakProps {
  config: KerjaSamaPageConfig
  setConfig: React.Dispatch<React.SetStateAction<KerjaSamaPageConfig>>
  onSaveConfig: (e: React.FormEvent) => void
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => void
}

export default function TabHeroKontak({
  config,
  setConfig,
  onSaveConfig,
  onImageUpload,
}: TabHeroKontakProps) {
  return (
    <form
      onSubmit={onSaveConfig}
      className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs flex flex-col gap-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pengaturan Teks & Kontak Web Client</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Teks ini muncul di bagian atas dan bawah halaman{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded text-[#561269]">/kerja-sama</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Judul Hero */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Judul Utama Hero</label>
          <input
            type="text"
            value={config.heroTitle}
            onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#561269] focus:outline-none"
            placeholder="Bangun Kolaborasi"
          />
        </div>

        {/* Highlight Hero */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Highlight Judul (Gradasi Ungu)
          </label>
          <input
            type="text"
            value={config.heroHighlight}
            onChange={(e) => setConfig({ ...config, heroHighlight: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#561269] focus:outline-none"
            placeholder="Bersama Empathika!"
          />
        </div>
      </div>

      {/* Deskripsi Paragraf 1 */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Paragraf Pembuka Atas</label>
        <textarea
          rows={3}
          value={config.heroDescription1}
          onChange={(e) => setConfig({ ...config, heroDescription1: e.target.value })}
          className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-1 focus:ring-[#561269] focus:outline-none"
        />
      </div>

      {/* Upload Foto Banner Hero */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Banner Gambar Tengah (Hero Client)
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {config.heroBannerImage && (
            <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
              <img
                src={config.heroBannerImage}
                alt="Hero Banner Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-bold text-xs cursor-pointer transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Pilih Foto dari Perangkat...</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  onImageUpload(e, (dataUrl) =>
                    setConfig((prev) => ({ ...prev, heroBannerImage: dataUrl }))
                  )
                }
              />
            </label>
            <p className="text-xs text-gray-600 font-medium mt-2">
              Rekomendasi ukuran: <span className="font-bold text-[#561269]">1200 × 675 piksel (Landscape / Memanjang, Rasio 16:9)</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Format didukung: PNG, JPG, WebP • Otomatis disesuaikan untuk banner tengah halaman kerja sama
            </p>
          </div>
        </div>
      </div>

      {/* Deskripsi Paragraf 2 */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Paragraf Setelah Gambar Banner
        </label>
        <textarea
          rows={3}
          value={config.heroDescription2}
          onChange={(e) => setConfig({ ...config, heroDescription2: e.target.value })}
          className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-1 focus:ring-[#561269] focus:outline-none"
        />
      </div>

      {/* Teks Callout Bawah */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Teks Ajakan Kolaborasi di Bagian Bawah
        </label>
        <textarea
          rows={3}
          value={config.footerCallout}
          onChange={(e) => setConfig({ ...config, footerCallout: e.target.value })}
          className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-1 focus:ring-[#561269] focus:outline-none"
        />
      </div>

      {/* Detail Kontak & WhatsApp */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Informasi Kontak & Narahubung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Email Partnership
            </label>
            <input
              type="email"
              value={config.kontak.email}
              onChange={(e) =>
                setConfig({ ...config, kontak: { ...config.kontak, email: e.target.value } })
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <PhoneInputField
              label="Nomor WhatsApp Official"
              value={config.kontak.whatsapp}
              onChange={(val) =>
                setConfig({ ...config, kontak: { ...config.kontak, whatsapp: val } })
              }
              placeholder="812-3456-7890"
              helperText="Nomor ini digunakan untuk kontak web serta link chat langsung calon mitra Program Affiliate."
              theme="purple"
            />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          💡{" "}
          <em>
            Catatan: Calon mitra Affiliate langsung diarahkan ke kontak WhatsApp di atas tanpa mengisi formulir web. Formulir web hanya berlaku untuk In House Training, Asesmen & Tes, serta Kerjasama Lainnya.
          </em>
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
        >
          Simpan Pengaturan Web Client
        </button>
      </div>
    </form>
  )
}
