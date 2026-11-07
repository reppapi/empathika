"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { KerjaSamaItem } from "../types"
import { getKerjaSamaItems, saveKerjaSamaItems } from "../data/initialData"
import { kerjaSamaService } from "@/services/kerja-sama.service"
import { normalizeColorTheme } from "../utils/colorThemes"
import { processAndUploadImage } from "../utils/imageCompressor"

export const DEFAULT_FORM: Partial<KerjaSamaItem> = {
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

export function useAdminKerjaSamaForm(programId?: string) {
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
          pelatihanImage:
            payload.pelatihan_image ||
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
          mitraTitle: payload.mitra_title || "",
          mitraDeskripsi: payload.mitra_deskripsi || "",
          mitraImage:
            payload.mitra_image ||
            "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
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

  return {
    isEditMode,
    formData,
    setFormData,
    loading,
    notFound,
    isSubmitting,
    toastMessage,
    showToast,
    errors,
    setErrors,
    handleImageUpload,
    handleSubmit,
    router,
  }
}

