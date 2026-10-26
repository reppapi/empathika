"use client"

import React from "react"
import { KerjaSamaItem } from "../../types"

interface ModalProgramFormProps {
  isOpen: boolean
  editingItem: KerjaSamaItem | null
  formData: Partial<KerjaSamaItem>
  setFormData: React.Dispatch<React.SetStateAction<Partial<KerjaSamaItem>>>
  onClose: () => void
  onSave: (e: React.FormEvent) => void
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => void
  colorOptions: { label: string; value: string }[]
}

export default function ModalProgramForm({
  isOpen,
  editingItem,
  formData,
  setFormData,
  onClose,
  onSave,
  onImageUpload,
  colorOptions,
}: ModalProgramFormProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {editingItem ? "Edit Program Kerja Sama" : "Tambah Program Kerja Sama Baru"}
            </h3>
            <p className="text-xs text-gray-500">
              Perubahan akan langsung terhubung dan tampil di halaman client.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Judul Program</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  const t = e.target.value
                  const slugGen = t
                    .toLowerCase()
                    .replace("empathika untuk ", "")
                    .trim()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]/g, "")
                  setFormData({
                    ...formData,
                    title: t,
                    slug: editingItem ? formData.slug : slugGen,
                    shortName: t.replace("Empathika untuk ", ""),
                  })
                }}
                placeholder="Empathika untuk Mahasiswa"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#561269]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Slug URL (Path Client)</label>
              <div className="flex items-center rounded-xl border border-gray-200 px-3 py-2 bg-gray-50">
                <span className="text-gray-400 text-xs">/kerja-sama/</span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="mahasiswa"
                  className="w-full bg-transparent text-xs text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Warna Gradasi Kartu</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                    formData.color === c.value
                      ? "border-[#561269] bg-purple-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${c.value}`} />
                  <span className="text-[11px] font-medium text-gray-800">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Deskripsi Singkat Program</label>
            <textarea
              rows={2}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ringkasan tentang program kolaborasi ini..."
              className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-1 focus:ring-[#561269]"
            />
          </div>

          {/* Sub-section: Pelatihan */}
          <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 space-y-3">
            <h4 className="font-bold text-[#561269] text-xs">Bentuk Pelatihan / Workshop</h4>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Judul Pelatihan</label>
              <input
                type="text"
                value={formData.pelatihanTitle}
                onChange={(e) => setFormData({ ...formData, pelatihanTitle: e.target.value })}
                placeholder="Pelatihan Peer Counselor..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Deskripsi Pelatihan</label>
              <textarea
                rows={2}
                value={formData.pelatihanDeskripsi}
                onChange={(e) => setFormData({ ...formData, pelatihanDeskripsi: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Foto Pelatihan</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {formData.pelatihanImage && (
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                    <img
                      src={formData.pelatihanImage}
                      alt="Preview Pelatihan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 text-[#561269] hover:bg-purple-100 border border-purple-200 font-semibold text-xs cursor-pointer transition">
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
                          setFormData((prev) => ({ ...prev, pelatihanImage: dataUrl }))
                        )
                      }
                    />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1">
                    PNG, JPG, WebP (maks. 5MB, otomatis dioptimalkan). Ambil langsung dari file laptop/HP.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-section: Mitra Sebelumnya */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
            <h4 className="font-bold text-blue-900 text-xs">Kemitraan Kami Sebelumnya</h4>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Nama Mitra / Judul Sinergi
              </label>
              <input
                type="text"
                value={formData.mitraTitle}
                onChange={(e) => setFormData({ ...formData, mitraTitle: e.target.value })}
                placeholder="Empathika x BEM Universitas..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Deskripsi Dampak Kemitraan
              </label>
              <textarea
                rows={2}
                value={formData.mitraDeskripsi}
                onChange={(e) => setFormData({ ...formData, mitraDeskripsi: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Foto Dokumentasi Mitra</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {formData.mitraImage && (
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                    <img
                      src={formData.mitraImage}
                      alt="Preview Mitra"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-xs cursor-pointer transition">
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
                          setFormData((prev) => ({ ...prev, mitraImage: dataUrl }))
                        )
                      }
                    />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1">
                    PNG, JPG, WebP (maks. 5MB, otomatis dioptimalkan). Ambil langsung dari file laptop/HP.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Switch */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="font-bold text-gray-700">Tampilkan di Halaman Client Web</span>
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={formData.status === "AKTIF"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value ? "AKTIF" : "NONAKTIF" })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#561269] relative" />
              <span>{formData.status === "AKTIF" ? "Aktif (Tampil)" : "Nonaktif (Sembunyi)"}</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
            >
              {editingItem ? "Simpan Perubahan" : "Tambahkan Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
