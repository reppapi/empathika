"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { KerjaSamaItem } from "../../types"
import { getKerjaSamaItems, saveKerjaSamaItems } from "../../data/initialData"
import { kerjaSamaService } from "@/services/kerja-sama.service"
import { COLOR_THEMES, normalizeColorTheme, getColorTheme } from "../../utils/colorThemes"
import { processAndUploadImage } from "../../utils/imageCompressor"

interface AdminKerjaSamaFormClientProps {
  programId?: string
}

const DEFAULT_FORM: Partial<KerjaSamaItem> = {
  title: "Empathika untuk ",
  shortName: "",
  slug: "",
  description: "",
  pelatihanTitle: "",
  pelatihanDeskripsi: "",
  pelatihanImage:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
  mitraTitle: "",
  mitraDeskripsi: "",
  mitraImage:
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
  color: "from-purple-500 to-indigo-600",
  status: "AKTIF",
}

export default function AdminKerjaSamaFormClient({ programId }: AdminKerjaSamaFormClientProps) {
  const router = useRouter()
  const isEditMode = Boolean(programId)

  const [formData, setFormData] = useState<Partial<KerjaSamaItem>>(DEFAULT_FORM)
  const [loading, setLoading] = useState(isEditMode)
  const [notFound, setNotFound] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    if (!programId) return

    // 1. Cek dari local storage terlebih dahulu agar form langsung terisi
    const currentItems = getKerjaSamaItems()
    const found = currentItems.find((it) => it.id === programId || it.slug === programId)
    if (found) {
      setFormData({
        ...found,
        color: normalizeColorTheme(found.color),
      })
      setLoading(false)
    }

    // 2. Sinkronkan dengan data backend resmi agar warna dan teks selalu presisi
    kerjaSamaService
      .getProgramByIdOrSlug(programId)
      .then((res: any) => {
        if (res?.data) {
          const p = res.data
          setFormData({
            id: p.id,
            slug: p.slug,
            title: p.title,
            shortName: p.short_name,
            description: p.deskripsi,
            pelatihanTitle: p.pelatihan_title || "",
            pelatihanDeskripsi: p.pelatihan_deskripsi || "",
            pelatihanImage:
              p.pelatihan_image ||
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
            mitraTitle: p.mitra_title || "",
            mitraDeskripsi: p.mitra_deskripsi || "",
            mitraImage:
              p.mitra_image ||
              "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
            color: normalizeColorTheme(p.warna_tema),
            status: p.status === "NONAKTIF" ? "NONAKTIF" : "AKTIF",
            urutan: p.urutan || 1,
          })
          setNotFound(false)
        }
      })
      .catch(() => {
        if (!found) setNotFound(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [programId])

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { url, infoText } = await processAndUploadImage(file, (msg) => showToast(msg))
      onSuccess(url)
      showToast(`Foto berhasil dioptimalkan! (${infoText})`)
    } catch (err: any) {
      showToast(err?.message || "Gagal memproses foto!")
    } finally {
      e.target.value = ""
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.title?.trim()) {
      errs.title = "Judul program wajib diisi"
    }
    if (!formData.slug?.trim()) {
      errs.slug = "Slug URL wajib diisi"
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      errs.slug = "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"
    } else {
      const currentItems = getKerjaSamaItems()
      const isDuplicate = currentItems.some(
        (it) => it.slug.toLowerCase() === formData.slug?.trim().toLowerCase() && it.id !== programId
      )
      if (isDuplicate) {
        errs.slug = `Slug '${formData.slug?.trim()}' sudah digunakan oleh program lain.`
      }
    }
    if (!formData.description?.trim()) {
      errs.description = "Deskripsi program wajib diisi"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const currentItems = getKerjaSamaItems()

      const payload = {
        slug: formData.slug?.trim() || "program-baru",
        title: formData.title?.trim() || "",
        short_name:
          formData.shortName?.trim() ||
          formData.title?.replace("Empathika untuk ", "").trim() ||
          "Program",
        deskripsi: formData.description?.trim() || "",
        pelatihan_title: formData.pelatihanTitle?.trim() || null,
        pelatihan_deskripsi: formData.pelatihanDeskripsi?.trim() || null,
        pelatihan_image: formData.pelatihanImage || null,
        mitra_title: formData.mitraTitle?.trim() || null,
        mitra_deskripsi: formData.mitraDeskripsi?.trim() || null,
        mitra_image: formData.mitraImage || null,
        warna_tema: normalizeColorTheme(formData.color),
        status: (formData.status as "AKTIF" | "NONAKTIF") || "AKTIF",
        urutan: formData.urutan || currentItems.length + 1,
      }

      let backendId = programId || `ks_${Date.now()}`

      if (isEditMode && programId) {
        // Update ke API Backend resmi
        try {
          await kerjaSamaService.updateProgram(programId, payload)
        } catch (apiErr) {
          console.warn("Backend update program error (fallback to local):", apiErr)
        }

        const updated = currentItems.map((it) =>
          it.id === programId || it.slug === programId
            ? ({ ...it, ...formData, color: payload.warna_tema } as KerjaSamaItem)
            : it
        )
        saveKerjaSamaItems(updated)
      } else {
        // Buat ke API Backend resmi
        try {
          const res = await kerjaSamaService.createProgram(payload)
          if (res?.data?.id) {
            backendId = res.data.id
          }
        } catch (apiErr) {
          console.warn("Backend create program error (fallback to local):", apiErr)
        }

        const newItem: KerjaSamaItem = {
          id: backendId,
          slug: payload.slug,
          title: payload.title,
          shortName: payload.short_name,
          description: payload.deskripsi,
          pelatihanTitle: payload.pelatihan_title || "",
          pelatihanDeskripsi: payload.pelatihan_deskripsi || "",
          pelatihanImage: payload.pelatihan_image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
          mitraTitle: payload.mitra_title || "",
          mitraDeskripsi: payload.mitra_deskripsi || "",
          mitraImage: payload.mitra_image || "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
          color: payload.warna_tema,
          status: payload.status,
          urutan: payload.urutan,
        }
        const updated = [...currentItems, newItem]
        saveKerjaSamaItems(updated)
      }

      router.push("/admin/kerja-sama")
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-400 font-poppins text-sm">
        Memuat data program kerja sama...
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-center font-poppins gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800">Program Tidak Ditemukan</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Program kolaborasi dengan ID tersebut tidak ditemukan atau mungkin sudah dihapus.
        </p>
        <button
          type="button"
          onClick={() => router.push("/admin/kerja-sama")}
          className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 transition active:scale-95 cursor-pointer"
        >
          Kembali ke Kerja Sama
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 w-full max-w-5xl mx-auto">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-3 text-white shadow-xl transition-all">
          <p className="text-xs sm:text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* ── Heading Form & Tombol Kembali (Pola Event) ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#561269] transition-colors cursor-pointer"
          aria-label="Kembali"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {isEditMode ? "Edit Program Kerja Sama" : "Tambah Program Kerja Sama Baru"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isEditMode
              ? "Perbarui konten program kolaborasi yang tampil di halaman web client"
              : "Tambahkan pilihan program kolaborasi baru untuk halaman kerja sama"}
          </p>
        </div>
      </div>

      {/* ── Container Form Utama ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Baris 1: Judul Program & Slug URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Judul Program <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => {
                  const t = e.target.value
                  const slugGen = t
                    .toLowerCase()
                    .replace("empathika untuk ", "")
                    .trim()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]/g, "")
                  setFormData((prev) => ({
                    ...prev,
                    title: t,
                    slug: isEditMode ? prev.slug : slugGen,
                    shortName: t.replace("Empathika untuk ", ""),
                  }))
                  if (errors.title) setErrors((prev) => ({ ...prev, title: "" }))
                }}
                placeholder="Contoh: Empathika untuk Mahasiswa"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                  errors.title
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
                }`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1 font-medium">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Slug URL (Path Client) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 px-3.5 py-3 bg-gray-50 focus-within:border-[#561269] focus-within:ring-1 focus-within:ring-[#561269] transition shadow-xs">
                <span className="text-gray-400 text-sm font-mono shrink-0">/kerja-sama/</span>
                <input
                  type="text"
                  required
                  value={formData.slug || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }))
                  }}
                  placeholder="mahasiswa"
                  className="w-full bg-transparent text-sm font-mono text-gray-900 focus:outline-none pl-1"
                />
              </div>
              {errors.slug && <p className="text-xs text-red-500 mt-1 font-medium">{errors.slug}</p>}
            </div>
          </div>

          {/* Baris 2: Warna Gradasi Kartu */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Tema Warna Gradasi Kartu <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-500 font-medium">
                Pilih palet warna yang mewakili program ini
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {COLOR_THEMES.map((c) => {
                const isSelected = normalizeColorTheme(formData.color) === c.value
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color: c.value }))}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? "border-[#561269] bg-purple-50/70 shadow-sm ring-2 ring-[#561269]/20"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-full ${c.dotClass} shadow-xs shrink-0 ring-2 ring-white`} />
                      <span className={`text-xs font-semibold truncate ${isSelected ? "text-[#561269] font-bold" : "text-gray-700"}`}>
                        {c.label}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="text-[#561269] shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Preview Banner Aksen */}
            <div className="mt-3 p-3.5 rounded-2xl border border-gray-200/80 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-gray-500 font-medium">Preview Kartu Client:</span>
                <div className="flex items-center gap-2">
                  <span className={`w-16 h-2.5 rounded-full ${getColorTheme(formData.color).dotClass} shadow-xs`} />
                  <span className="text-xs font-bold text-gray-800">
                    {getColorTheme(formData.color).label}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-gray-400">
                Warna ini akan menjadi aksen garis atas dan efek hover di halaman utama.
              </span>
            </div>
          </div>

          {/* Baris 3: Deskripsi Singkat Program */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Deskripsi Singkat Program <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={formData.description || ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, description: e.target.value }))
                if (errors.description) setErrors((prev) => ({ ...prev, description: "" }))
              }}
              placeholder="Ringkasan tentang program kolaborasi ini..."
              className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs leading-relaxed ${
                errors.description
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Sub-section: Bentuk Pelatihan / Workshop */}
          <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 space-y-4">
            <h4 className="font-bold text-[#561269] text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#561269]" />
              Bentuk Pelatihan / Workshop
            </h4>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Judul Pelatihan
              </label>
              <input
                type="text"
                value={formData.pelatihanTitle || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pelatihanTitle: e.target.value }))
                }
                placeholder="Contoh: Pelatihan Peer Counselor & Manajemen Stres Kampus"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Deskripsi Pelatihan
              </label>
              <textarea
                rows={2}
                value={formData.pelatihanDeskripsi || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pelatihanDeskripsi: e.target.value }))
                }
                placeholder="Jelaskan gambaran pelatihan..."
                className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-white focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Foto Pelatihan
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {formData.pelatihanImage && (
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.pelatihanImage}
                      alt="Preview Pelatihan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-[#561269] hover:bg-purple-100 border border-purple-200 font-semibold text-xs cursor-pointer transition active:scale-95">
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
                        handleImageUpload(e, (dataUrl) =>
                          setFormData((prev) => ({ ...prev, pelatihanImage: dataUrl }))
                        )
                      }
                    />
                  </label>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Format PNG, JPG, WebP (otomatis dikompresi & dioptimalkan untuk web).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-section: Kemitraan Kami Sebelumnya */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-4">
            <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Kemitraan Kami Sebelumnya
            </h4>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nama Mitra / Judul Sinergi
              </label>
              <input
                type="text"
                value={formData.mitraTitle || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mitraTitle: e.target.value }))
                }
                placeholder="Contoh: Empathika x BEM Universitas Padjadjaran"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Deskripsi Dampak Kemitraan
              </label>
              <textarea
                rows={2}
                value={formData.mitraDeskripsi || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mitraDeskripsi: e.target.value }))
                }
                placeholder="Jelaskan dampak dan hasil kemitraan..."
                className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-white focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Foto Dokumentasi Mitra
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {formData.mitraImage && (
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.mitraImage}
                      alt="Preview Mitra"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-xs cursor-pointer transition active:scale-95">
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
                        handleImageUpload(e, (dataUrl) =>
                          setFormData((prev) => ({ ...prev, mitraImage: dataUrl }))
                        )
                      }
                    />
                  </label>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Format PNG, JPG, WebP (otomatis dikompresi & dioptimalkan untuk web).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Switch */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-5">
            <div>
              <span className="block text-sm font-bold text-gray-800">
                Tampilkan di Halaman Client Web
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                Jika diaktifkan, program ini akan langsung muncul pada pilihan kolaborasi di halaman web utama.
              </p>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={formData.status === "AKTIF"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.checked ? "AKTIF" : "NONAKTIF",
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#561269] relative" />
              <span className="text-xs font-bold text-gray-800">
                {formData.status === "AKTIF" ? "Aktif (Tampil)" : "Nonaktif (Sembunyi)"}
              </span>
            </label>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-8 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isEditMode ? "Simpan Perubahan" : "Tambahkan Program"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
