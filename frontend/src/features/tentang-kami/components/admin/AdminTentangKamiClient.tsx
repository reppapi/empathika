"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Trash2,
} from "lucide-react"
import {
  tentangKamiService,
  DEFAULT_TENTANG_KAMI,
  type TentangKamiContent,
} from "@/services/tentang-kami.service"
import { uploadService } from "@/services/upload.service"

export default function AdminTentangKamiClient() {
  const [activeTab, setActiveTab] = useState<"hero" | "berkenalan" | "nilai" | "kenapaHadir" | "pemimpin">("hero")
  const [formData, setFormData] = useState<TentangKamiContent>(DEFAULT_TENTANG_KAMI)
  const [initialData, setInitialData] = useState<TentangKamiContent>(DEFAULT_TENTANG_KAMI)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  const [isUploadingTeamPhoto, setIsUploadingTeamPhoto] = useState(false)
  const [isUploadingPendiriPhoto, setIsUploadingPendiriPhoto] = useState(false)
  const [isUploadingManagerPhoto, setIsUploadingManagerPhoto] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const teamPhotoInputRef = useRef<HTMLInputElement | null>(null)
  const pendiriPhotoInputRef = useRef<HTMLInputElement | null>(null)
  const managerPhotoInputRef = useRef<HTMLInputElement | null>(null)

  // Panduan rasio foto untuk masing-masing slot galeri hero
  const GALLERY_SLOT_RATIOS = [
    "Rasio 4:3 (Landscape)",
    "Rasio 1:1 (Kotak)",
    "Rasio 3:4 (Portrait)",
    "Rasio 3:4 (Portrait)",
    "Rasio 1:1 (Kotak)",
    "Rasio 16:9 (Landscape)",
  ]

  // Ambil data konten saat halaman pertama kali dimuat
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await tentangKamiService.getAdmin()
        if (isMounted) {
          setFormData(data)
          setInitialData(data)
        }
      } catch (err: any) {
        console.error("Gagal memuat data Tentang Kami:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialData)

  const handleSave = async () => {
    // Validasi Keamanan & Integritas Input Sebelum Dikirim ke Backend
    const safeUrlRegex = /^(https?:\/\/|\/uploads\/|\/images\/|\/)/i

    if (!formData.hero.tagline?.trim()) {
      setToast({ type: "error", message: "Tagline hero tidak boleh kosong." })
      setActiveTab("hero")
      return
    }

    for (let i = 0; i < 6; i++) {
      const url = formData.hero.gallery[i]?.trim()
      if (url && !safeUrlRegex.test(url)) {
        setToast({
          type: "error",
          message: `Foto galeri slot ${i + 1} memiliki format yang tidak valid.`,
        })
        setActiveTab("hero")
        return
      }
    }

    if (
      !formData.berkenalan.judul?.trim() ||
      !formData.berkenalan.paragraf1?.trim() ||
      !formData.berkenalan.paragraf2?.trim()
    ) {
      setToast({
        type: "error",
        message: "Seluruh kolom judul dan paragraf pada tab Mari Berkenalan wajib diisi.",
      })
      setActiveTab("berkenalan")
      return
    }

    if (
      !formData.nilai.judulSection?.trim() ||
      !formData.nilai.subjudulSection?.trim()
    ) {
      setToast({
        type: "error",
        message: "Judul dan subjudul pada tab Nilai yang Kami Bawa wajib diisi.",
      })
      setActiveTab("nilai")
      return
    }

    for (let i = 0; i < formData.nilai.items.length; i++) {
      const it = formData.nilai.items[i]
      if (!it.judul?.trim() || !it.deskripsi?.trim()) {
        setToast({
          type: "error",
          message: `Judul dan deskripsi pilar nilai ke-${i + 1} tidak boleh kosong.`,
        })
        setActiveTab("nilai")
        return
      }
    }

    if (
      !formData.kenapaHadir.judul?.trim() ||
      !formData.kenapaHadir.fotoTim?.trim() ||
      !safeUrlRegex.test(formData.kenapaHadir.fotoTim.trim()) ||
      !formData.kenapaHadir.paragraf1?.trim() ||
      !formData.kenapaHadir.paragraf2?.trim() ||
      !formData.kenapaHadir.paragraf3?.trim()
    ) {
      setToast({
        type: "error",
        message: "Seluruh kolom narasi dan foto tim pada tab Kenapa Kami Hadir wajib terisi.",
      })
      setActiveTab("kenapaHadir")
      return
    }

    setIsSaving(true)
    try {
      const updated = await tentangKamiService.update(formData)
      setFormData(updated)
      setInitialData(updated)
      setToast({
        type: "success",
        message: "Perubahan halaman Tentang Kami berhasil disimpan!",
      })
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Gagal menyimpan perubahan. Periksa koneksi backend Anda.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handler upload foto galeri hero
  const handleUploadGalleryImage = async (slotIdx: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        message: "File yang diunggah harus berupa gambar (JPG, PNG, WEBP, atau GIF).",
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Ukuran file terlalu besar. Maksimal ukuran gambar adalah 5MB.",
      })
      return
    }

    setUploadingSlot(slotIdx)
    try {
      const uploadedUrl = await uploadService.uploadImage(file)
      setFormData((prev) => {
        const nextGallery = [...prev.hero.gallery] as [string, string, string, string, string, string]
        nextGallery[slotIdx] = uploadedUrl
        return {
          ...prev,
          hero: {
            ...prev.hero,
            gallery: nextGallery,
          },
        }
      })
      setToast({ type: "success", message: `Foto slot ${slotIdx + 1} berhasil diunggah!` })
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Gagal mengunggah foto slot galeri." })
    } finally {
      setUploadingSlot(null)
    }
  }

  // Handler upload foto tim kenapa hadir
  const handleUploadTeamPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        message: "File yang diunggah harus berupa gambar (JPG, PNG, WEBP, atau GIF).",
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Ukuran file terlalu besar. Maksimal ukuran foto tim adalah 5MB.",
      })
      return
    }

    setIsUploadingTeamPhoto(true)
    try {
      const uploadedUrl = await uploadService.uploadImage(file)
      setFormData((prev) => ({
        ...prev,
        kenapaHadir: {
          ...prev.kenapaHadir,
          fotoTim: uploadedUrl,
        },
      }))
      setToast({ type: "success", message: "Foto tim berhasil diunggah!" })
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Gagal mengunggah foto tim." })
    } finally {
      setIsUploadingTeamPhoto(false)
    }
  }

  // Handler upload foto figur pendiri (cutout/PNG transparan)
  const handleUploadPendiriPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        message: "File yang diunggah harus berupa gambar (JPG, PNG, atau WEBP).",
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Ukuran file terlalu besar. Maksimal ukuran foto adalah 5MB.",
      })
      return
    }

    setIsUploadingPendiriPhoto(true)
    try {
      const uploadedUrl = await uploadService.uploadImage(file)
      setFormData((prev) => ({
        ...prev,
        pemimpinSection: {
          ...prev.pemimpinSection,
          pendiri: {
            nama: prev.pemimpinSection?.pendiri?.nama || "",
            peran: prev.pemimpinSection?.pendiri?.peran || "",
            bio: prev.pemimpinSection?.pendiri?.bio || "",
            foto: uploadedUrl,
          },
        },
      }))
      setToast({ type: "success", message: "Foto pendiri berhasil diunggah!" })
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Gagal mengunggah foto pendiri." })
    } finally {
      setIsUploadingPendiriPhoto(false)
    }
  }

  // Handler upload foto figur manajer (cutout/PNG transparan)
  const handleUploadManagerPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        message: "File yang diunggah harus berupa gambar (JPG, PNG, atau WEBP).",
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Ukuran file terlalu besar. Maksimal ukuran foto adalah 5MB.",
      })
      return
    }

    setIsUploadingManagerPhoto(true)
    try {
      const uploadedUrl = await uploadService.uploadImage(file)
      setFormData((prev) => ({
        ...prev,
        pemimpinSection: {
          ...prev.pemimpinSection,
          manager: {
            nama: prev.pemimpinSection?.manager?.nama || "",
            peran: prev.pemimpinSection?.manager?.peran || "",
            bio: prev.pemimpinSection?.manager?.bio || "",
            foto: uploadedUrl,
          },
        },
      }))
      setToast({ type: "success", message: "Foto manajer berhasil diunggah!" })
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Gagal mengunggah foto manajer." })
    } finally {
      setIsUploadingManagerPhoto(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 font-poppins">
        <Loader2 className="w-9 h-9 text-[#561269] animate-spin" />
        <p className="text-sm font-medium text-gray-500">Memuat konfigurasi Tentang Kami...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 font-poppins pb-20">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "success" ? "bg-[#561269] text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Tabs Navigation: Modern Segmented Pill Controls Tanpa Scrollbar Abu-abu */}
      <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
          {[
            { key: "hero", label: "1. Hero & Galeri Foto" },
            { key: "berkenalan", label: "2. Mari Berkenalan" },
            { key: "nilai", label: "3. Nilai yang Kami Bawa" },
            { key: "kenapaHadir", label: "4. Kenapa Kami Hadir" },
            { key: "pemimpin", label: "5. Pendiri & Manajer" },
          ].map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#EAB308] text-gray-950 font-extrabold shadow-xs"
                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: HERO & GALERI FOTO                                */}
      {/* ======================================================== */}
      {activeTab === "hero" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Tagline Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Tagline & Kalimat Pengantar Hero</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Kalimat ini tampil tepat di bawah judul besar &quot;Tentang Empathika&quot; pada bagian paling atas halaman.
            </p>
            <textarea
              rows={3}
              value={formData.hero.tagline}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, tagline: e.target.value },
                }))
              }
              placeholder="Masukkan kalimat tagline..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-800 transition"
            />
          </div>

          {/* 6 Bento Gallery Images */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Galeri Foto Bento Hero (6 Slot)</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Foto-foto ini disusun berselang-seling di bawah tagline hero pada website.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formData.hero.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200/80 p-4 bg-gray-50/50 flex flex-col justify-between gap-4 transition hover:border-[#561269]/40"
                >
                  {/* Header Slot & Rasio */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                        Slot {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {GALLERY_SLOT_RATIOS[idx]}
                      </span>
                    </div>
                    {imgUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => {
                            const nextG = [...prev.hero.gallery] as [string, string, string, string, string, string]
                            nextG[idx] = ""
                            return { ...prev, hero: { ...prev.hero, gallery: nextG } }
                          })
                        }}
                        className="text-[11px] text-rose-500 hover:text-rose-700 transition cursor-pointer font-medium"
                        title="Kosongkan slot foto ini"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {/* Thumbnail Preview */}
                  <div
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 hover:border-[#561269] hover:bg-purple-50/20 group cursor-pointer flex items-center justify-center transition-all"
                  >
                    {imgUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imgUrl}
                        alt={`Galeri ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#561269] transition-colors p-4">
                        <ImageIcon className="w-7 h-7 mb-1" />
                        <span className="text-[11px] font-medium">Klik untuk unggah</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRefs.current[idx]?.click()
                        }}
                        disabled={uploadingSlot === idx}
                        className="px-3 py-1.5 rounded-xl bg-white text-[#561269] text-xs font-bold shadow-md hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {uploadingSlot === idx ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{imgUrl ? "Ganti Foto" : "Unggah Foto"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Action Button */}
                  <div>
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[idx] = el
                      }}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUploadGalleryImage(idx, file)
                        e.target.value = ""
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      disabled={uploadingSlot === idx}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {uploadingSlot === idx ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Ganti Foto Slot {idx + 1}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Bar inside Tab 5 */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-gray-500">
              {hasUnsavedChanges ? "Ada perubahan yang belum disimpan" : "Semua perubahan telah tersimpan"}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MARI BERKENALAN                                   */}
      {/* ======================================================== */}
      {activeTab === "berkenalan" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Narasi Pengenalan & Filosofi</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Bagian ini menjelaskan latar belakang dan filosofi Empathika dalam dua kolom teks yang elegan.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Judul Utama Section
              </label>
              <input
                type="text"
                value={formData.berkenalan.judul}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    berkenalan: { ...prev.berkenalan, judul: e.target.value },
                  }))
                }
                placeholder="Contoh: Mari Berkenalan dengan Empathika."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-800 transition font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Paragraf 1
                </label>
                <textarea
                  rows={8}
                  value={formData.berkenalan.paragraf1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      berkenalan: { ...prev.berkenalan, paragraf1: e.target.value },
                    }))
                  }
                  placeholder="Isi paragraf 1..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-800 leading-relaxed transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Paragraf 2
                </label>
                <textarea
                  rows={8}
                  value={formData.berkenalan.paragraf2}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      berkenalan: { ...prev.berkenalan, paragraf2: e.target.value },
                    }))
                  }
                  placeholder="Isi paragraf 2..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-800 leading-relaxed transition"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Bar inside Tab 5 */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-gray-500">
              {hasUnsavedChanges ? "Ada perubahan yang belum disimpan" : "Semua perubahan telah tersimpan"}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: NILAI-NILAI UTAMA (CORE VALUES)                   */}
      {/* ======================================================== */}
      {activeTab === "nilai" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Header Section Nilai yang Kami Bawa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Judul Section
                </label>
                <input
                  type="text"
                  value={formData.nilai.judulSection}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nilai: { ...prev.nilai, judulSection: e.target.value },
                    }))
                  }
                  placeholder="Nilai yang Kami Bawa"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-800 transition font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Subjudul Section
                </label>
                <input
                  type="text"
                  value={formData.nilai.subjudulSection}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nilai: { ...prev.nilai, subjudulSection: e.target.value },
                    }))
                  }
                  placeholder="Deskripsi singkat section..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-800 transition"
                />
              </div>
            </div>
          </div>

          {/* 4 Cards Values */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">4 Pilar Nilai</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Pilar nilai yang tampil pada halaman publik.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.nilai.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-2xl border border-gray-200/80 p-5 bg-gray-50/50 space-y-4 transition hover:border-[#561269]/40"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-800">
                      Pilar {idx + 1}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Judul Nilai
                      </label>
                      <input
                        type="text"
                        value={item.judul}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData((prev) => {
                            const nextItems = [...prev.nilai.items]
                            nextItems[idx] = { ...nextItems[idx], judul: val }
                            return { ...prev, nilai: { ...prev.nilai, items: nextItems } }
                          })
                        }}
                        placeholder="Contoh: Empati"
                        className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Deskripsi Penjelasan
                      </label>
                      <textarea
                        rows={3}
                        value={item.deskripsi}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData((prev) => {
                            const nextItems = [...prev.nilai.items]
                            nextItems[idx] = { ...nextItems[idx], deskripsi: val }
                            return { ...prev, nilai: { ...prev.nilai, items: nextItems } }
                          })
                        }}
                        placeholder="Penjelasan nilai..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269] leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Bar inside Tab 5 */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-gray-500">
              {hasUnsavedChanges ? "Ada perubahan yang belum disimpan" : "Semua perubahan telah tersimpan"}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: KENAPA KAMI HADIR                                */}
      {/* ======================================================== */}
      {activeTab === "kenapaHadir" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Kenapa Empathika Hadir?</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Bagian editorial ini menampilkan 1 foto tim bergaya 3D di sisi kiri dan 3 paragraf narasi di sisi kanan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Foto Tim 3D */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Foto Utama Tim (Frame 3D)
                </label>
                <span className="text-xs font-semibold text-gray-500">
                  Rasio 4:3 (Landscape)
                </span>
              </div>

              <div
                onClick={() => teamPhotoInputRef.current?.click()}
                className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-xl group cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.kenapaHadir.fotoTim}
                  alt="Foto Tim"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    ;(e.target as HTMLElement).setAttribute(
                      "src",
                      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                    )
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      teamPhotoInputRef.current?.click()
                    }}
                    disabled={isUploadingTeamPhoto}
                    className="px-4 py-2 rounded-2xl bg-white text-[#561269] text-xs font-bold shadow-lg hover:bg-gray-100 transition flex items-center gap-2 cursor-pointer"
                  >
                    {isUploadingTeamPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Ganti Foto Tim</span>
                  </button>
                </div>
              </div>

              <input
                type="file"
                ref={teamPhotoInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUploadTeamPhoto(file)
                  e.target.value = ""
                }}
              />

              <button
                type="button"
                onClick={() => teamPhotoInputRef.current?.click()}
                disabled={isUploadingTeamPhoto}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isUploadingTeamPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Unggah / Ganti Foto Tim</span>
              </button>
            </div>

            {/* Narasi 3 Paragraf */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Judul Section
                </label>
                <input
                  type="text"
                  value={formData.kenapaHadir.judul}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      kenapaHadir: { ...prev.kenapaHadir, judul: e.target.value },
                    }))
                  }
                  placeholder="Kenapa Empathika Hadir?"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-800 transition font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Paragraf 1
                </label>
                <textarea
                  rows={3}
                  value={formData.kenapaHadir.paragraf1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      kenapaHadir: { ...prev.kenapaHadir, paragraf1: e.target.value },
                    }))
                  }
                  placeholder="Paragraf 1..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Paragraf 2
                </label>
                <textarea
                  rows={3}
                  value={formData.kenapaHadir.paragraf2}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      kenapaHadir: { ...prev.kenapaHadir, paragraf2: e.target.value },
                    }))
                  }
                  placeholder="Paragraf 2..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Paragraf 3
                </label>
                <textarea
                  rows={3}
                  value={formData.kenapaHadir.paragraf3}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      kenapaHadir: { ...prev.kenapaHadir, paragraf3: e.target.value },
                    }))
                  }
                  placeholder="Paragraf 3..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Bar inside Tab 5 */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-gray-500">
              {hasUnsavedChanges ? "Ada perubahan yang belum disimpan" : "Semua perubahan telah tersimpan"}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: PENDIRI & MANAJER                                 */}
      {/* ======================================================== */}
      {activeTab === "pemimpin" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-8">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Berawal dari Mereka (Pendiri & Manajer)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Atur judul seksi serta profil lengkap Pendiri dan Manajer.
            </p>
          </div>

          {/* Judul Section & Tips */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Judul Section
              </label>
              <input
                type="text"
                value={formData.pemimpinSection?.judulSection || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pemimpinSection: {
                      ...prev.pemimpinSection,
                      judulSection: e.target.value,
                    },
                  }))
                }
                placeholder="Berawal dari Mereka"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-800 transition font-semibold"
              />
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/40 border border-purple-100 text-gray-800 text-xs leading-relaxed flex items-start gap-2.5">
              <span className="text-base select-none">💡</span>
              <p>
                Unggah foto berformat <strong>PNG transparan</strong> (tanpa background) potongan badan/setengah badan dengan <strong>rasio 3:4 (rekomendasi: 600 × 800 px, maks. 5MB)</strong> agar langsung berdiri rapi menyatu dengan warna latar belakang krem tanpa ada garis kotak.
              </p>
            </div>
          </div>

          {/* Form Pendiri & Manajer (2 Kolom Masing-Masing dengan Foto) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profil Pendiri (Atas / Kiri) */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <span className="w-2.5 h-2.5 rounded-full bg-[#561269]"></span>
                <h3 className="text-sm font-bold text-gray-900">Profil Pendiri</h3>
              </div>

              {/* Upload Foto Pendiri */}
              <div className="space-y-2">
                <div
                  onClick={() => pendiriPhotoInputRef.current?.click()}
                  className="relative aspect-[3/4] max-w-[180px] mx-auto rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 hover:border-[#561269] hover:bg-purple-50/20 flex items-end justify-center group shadow-xs cursor-pointer transition-all"
                >
                  {formData.pemimpinSection?.pendiri?.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.pemimpinSection.pendiri.foto}
                      alt="Foto Pendiri"
                      className="max-h-full max-w-full object-contain object-bottom drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4 self-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-[#561269] mx-auto mb-2 transition-colors" />
                      <p className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">Klik untuk unggah</p>
                    </div>
                  )}
                  {isUploadingPendiriPhoto && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-semibold">Mengunggah...</span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={pendiriPhotoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadPendiriPhoto(file)
                    e.target.value = ""
                  }}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => pendiriPhotoInputRef.current?.click()}
                    disabled={isUploadingPendiriPhoto}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {isUploadingPendiriPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {formData.pemimpinSection?.pendiri?.foto ? "Ganti Foto Pendiri" : "Unggah Foto Pendiri"}
                    </span>
                  </button>
                  {formData.pemimpinSection?.pendiri?.foto && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          pemimpinSection: {
                            ...prev.pemimpinSection,
                            pendiri: {
                              nama: prev.pemimpinSection?.pendiri?.nama || "",
                              peran: prev.pemimpinSection?.pendiri?.peran || "",
                              bio: prev.pemimpinSection?.pendiri?.bio || "",
                              foto: "",
                            },
                          },
                        }))
                        setToast({
                          type: "success",
                          message: "Foto Pendiri dihapus dari form. Jangan lupa klik 'Simpan Perubahan' untuk menerapkan ke website.",
                        })
                      }}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 transition cursor-pointer flex items-center justify-center shrink-0 shadow-2xs hover:scale-105 active:scale-95"
                      title="Hapus Foto Pendiri"
                      aria-label="Hapus Foto Pendiri"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-gray-400 text-center">
                  Format PNG transparan • Rekomendasi 600 × 800 px (Maks. 5MB)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={formData.pemimpinSection?.pendiri?.nama || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pemimpinSection: {
                        ...prev.pemimpinSection,
                        pendiri: {
                          nama: e.target.value,
                          peran: prev.pemimpinSection?.pendiri?.peran || "",
                          bio: prev.pemimpinSection?.pendiri?.bio || "",
                          foto: prev.pemimpinSection?.pendiri?.foto || "",
                        },
                      },
                    }))
                  }
                  placeholder="Contoh: Ifandi Khainur Rahim"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  value={formData.pemimpinSection?.pendiri?.peran || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pemimpinSection: {
                        ...prev.pemimpinSection,
                        pendiri: {
                          nama: prev.pemimpinSection?.pendiri?.nama || "",
                          peran: e.target.value,
                          bio: prev.pemimpinSection?.pendiri?.bio || "",
                          foto: prev.pemimpinSection?.pendiri?.foto || "",
                        },
                      },
                    }))
                  }
                  placeholder="Contoh: Founder & CEO"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Biografi Singkat
                </label>
                <textarea
                  rows={4}
                  value={formData.pemimpinSection?.pendiri?.bio || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pemimpinSection: {
                        ...prev.pemimpinSection,
                        pendiri: {
                          nama: prev.pemimpinSection?.pendiri?.nama || "",
                          peran: prev.pemimpinSection?.pendiri?.peran || "",
                          bio: e.target.value,
                          foto: prev.pemimpinSection?.pendiri?.foto || "",
                        },
                      },
                    }))
                  }
                  placeholder="Tuliskan latar belakang pendidikan, pengalaman, dan visi pendiri..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269] leading-relaxed"
                />
              </div>
            </div>

            {/* Profil Manajer (Bawah / Kanan) */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="text-sm font-bold text-gray-900">Profil Manajer</h3>
              </div>

              {/* Upload Foto Manajer */}
              <div className="space-y-2">
                <div
                  onClick={() => managerPhotoInputRef.current?.click()}
                  className="relative aspect-[3/4] max-w-[180px] mx-auto rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 hover:border-[#561269] hover:bg-purple-50/20 flex items-end justify-center group shadow-xs cursor-pointer transition-all"
                >
                  {formData.pemimpinSection?.manager?.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.pemimpinSection.manager.foto}
                      alt="Foto Manajer"
                      className="max-h-full max-w-full object-contain object-bottom drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4 self-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-[#561269] mx-auto mb-2 transition-colors" />
                      <p className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">Klik untuk unggah</p>
                    </div>
                  )}
                  {isUploadingManagerPhoto && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-semibold">Mengunggah...</span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={managerPhotoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadManagerPhoto(file)
                    e.target.value = ""
                  }}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => managerPhotoInputRef.current?.click()}
                    disabled={isUploadingManagerPhoto}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {isUploadingManagerPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {formData.pemimpinSection?.manager?.foto ? "Ganti Foto Manajer" : "Unggah Foto Manajer"}
                    </span>
                  </button>
                  {formData.pemimpinSection?.manager?.foto && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          pemimpinSection: {
                            ...prev.pemimpinSection,
                            manager: {
                              nama: prev.pemimpinSection?.manager?.nama || "",
                              peran: prev.pemimpinSection?.manager?.peran || "",
                              bio: prev.pemimpinSection?.manager?.bio || "",
                              foto: "",
                            },
                          },
                        }))
                        setToast({
                          type: "success",
                          message: "Foto Manajer dihapus dari form. Jangan lupa klik 'Simpan Perubahan' untuk menerapkan ke website.",
                        })
                      }}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 transition cursor-pointer flex items-center justify-center shrink-0 shadow-2xs hover:scale-105 active:scale-95"
                      title="Hapus Foto Manajer"
                      aria-label="Hapus Foto Manajer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-gray-400 text-center">
                  Format PNG transparan • Rekomendasi 600 × 800 px (Maks. 5MB)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={formData.pemimpinSection?.manager?.nama || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pemimpinSection: {
                        ...prev.pemimpinSection,
                        manager: {
                          nama: e.target.value,
                          peran: prev.pemimpinSection?.manager?.peran || "",
                          bio: prev.pemimpinSection?.manager?.bio || "",
                          foto: prev.pemimpinSection?.manager?.foto || "",
                        },
                      },
                    }))
                  }
                  placeholder="Contoh: Rizky Andriawan"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  value={formData.pemimpinSection?.manager?.peran || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pemimpinSection: {
                        ...prev.pemimpinSection,
                        manager: {
                          nama: prev.pemimpinSection?.manager?.nama || "",
                          peran: e.target.value,
                          bio: prev.pemimpinSection?.manager?.bio || "",
                          foto: prev.pemimpinSection?.manager?.foto || "",
                        },
                      },
                    }))
                  }
                  placeholder="Contoh: Co-founder & CTO"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Biografi Singkat
                </label>
                <textarea
                  rows={4}
                  value={formData.pemimpinSection?.manager?.bio || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pemimpinSection: {
                        ...prev.pemimpinSection,
                        manager: {
                          nama: prev.pemimpinSection?.manager?.nama || "",
                          peran: prev.pemimpinSection?.manager?.peran || "",
                          bio: e.target.value,
                          foto: prev.pemimpinSection?.manager?.foto || "",
                        },
                      },
                    }))
                  }
                  placeholder="Tuliskan latar belakang pendidikan, keahlian, dan peran operasional/teknis..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Bar inside Tab 5 */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-gray-500">
              {hasUnsavedChanges ? "Ada perubahan yang belum disimpan" : "Semua perubahan telah tersimpan"}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Save Bar on Mobile */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-gray-200 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-600 truncate">
          {hasUnsavedChanges ? "Belum disimpan" : "Tersimpan"}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaving ? "Simpan..." : "Simpan"}</span>
        </button>
      </div>
    </div>
  )
}

