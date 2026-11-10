"use client"

import { useState, useRef, useEffect } from "react"
import { AdminProfileData, RoleType } from "../types"
import { DEFAULT_ADMIN, DEFAULT_PSIKOLOG } from "../data/profileData"
import { adminService } from "@/services/admin.service"
import { processAndUploadImage } from "@/lib/imageCompressor"

interface UseProfileAdminFormProps {
  role?: RoleType
}

export interface TenagaAhliStorageItem {
  id?: string
  nama?: string
  email?: string
  noTelepon?: string
  bio?: string
  foto?: string | null
  kategori?: AdminProfileData["kategoriProfesi"]
  spesialisasi?: string
  noStr?: string
  noSipp?: string
  pendidikanText?: string
  quote?: string
  instagram?: string
  keahlian?: string[]
  [key: string]: unknown
}

export function useProfileAdminForm({ role = "admin" }: UseProfileAdminFormProps) {
  const [adminData, setAdminData] = useState<AdminProfileData>(DEFAULT_ADMIN)
  const [psikologData, setPsikologData] = useState<AdminProfileData>(DEFAULT_PSIKOLOG)

  // Form input lokal berdasarkan role aktif
  const currentData = role === "admin" ? adminData : psikologData
  const [form, setForm] = useState<AdminProfileData>(currentData)

  // Tag keahlian & paragraf profil baru (Psikolog)
  const [newSkill, setNewSkill] = useState("")
  const [newParagraph, setNewParagraph] = useState("")

  // State toast notifikasi & live modal preview
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [isPlayingVideoPreview, setIsPlayingVideoPreview] = useState(false)

  // Ref DOM & status sinkronisasi
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isFetchedRef = useRef(false)

  // Sinkronisasi data awal saat mount atau role berubah
  useEffect(() => {
    if (role === "admin") {
      try {
        const savedAdmin = localStorage.getItem("empathika_admin_profile")
        if (savedAdmin) {
          const parsed = JSON.parse(savedAdmin)
          if (parsed.noTelepon === "081234567890" || parsed.no_telepon === "081234567890") {
            parsed.noTelepon = "0878-7878-5498"
            parsed.no_telepon = "0878-7878-5498"
            localStorage.setItem("empathika_admin_profile", JSON.stringify(parsed))
          }
          setForm((prev) => ({ ...prev, ...parsed }))
        }
      } catch {
        // Abaikan error saat akses/parse localStorage
      }

      // Ambil data resmi profil admin dari backend database (hanya sekali saat mount)
      if (!isFetchedRef.current) {
        isFetchedRef.current = true
        adminService
          .getProfile()
          .then((res) => {
            if (res?.data) {
              const p = res.data
              const rawTel = p.noTelepon || p.no_telepon || ""
              const effectiveTel = !rawTel || rawTel === "081234567890" ? "0878-7878-5498" : rawTel
              const mapped: AdminProfileData = {
                nama: p.nama || "",
                email: p.email || "",
                noTelepon: effectiveTel,
                bio: p.bio || "",
                foto: p.foto || null,
                alamat: p.alamat || "",
                linkMaps: p.linkMaps || p.link_maps || "",
                instagram: p.instagram || "",
                tiktok: p.tiktok || "",
                youtube: p.youtube || "",
                linkedin: p.linkedin || "",
              }
              setForm((prev) => ({ ...prev, ...mapped }))
              try {
                localStorage.setItem(
                  "empathika_admin_profile",
                  JSON.stringify({
                    ...mapped,
                    linkMapsEmbed: p.linkMapsEmbed || p.link_maps_embed,
                  })
                )
              } catch {}
            }
          })
          .catch(() => {
            // Jika token belum ada atau request gagal, coba getPublicProfile sebagai fallback
            adminService
              .getPublicProfile()
              .then((res) => {
                if (res?.data) {
                  const p = res.data
                  setForm((prev) => ({
                    ...prev,
                    nama: p.nama || prev.nama,
                    email: p.email || prev.email,
                    noTelepon: p.no_telepon || p.noTelepon || prev.noTelepon,
                    alamat: p.alamat || prev.alamat,
                    linkMaps: p.link_maps || p.linkMaps || prev.linkMaps,
                    bio: p.bio || prev.bio,
                    instagram: p.instagram || prev.instagram,
                    tiktok: p.tiktok || prev.tiktok,
                    youtube: p.youtube || prev.youtube,
                    linkedin: p.linkedin || prev.linkedin,
                  }))
                }
              })
              .catch(() => {})
          })
      }
    } else {
      // Ambil data dari shared storage tenaga ahli
      try {
        const saved = localStorage.getItem("empathika_tenaga_ahli_data")
        if (saved) {
          const list: TenagaAhliStorageItem[] = JSON.parse(saved)
          if (Array.isArray(list)) {
            const found =
              list.find((d) => !['0', '1', '2', '3', '4'].includes(d.id || '') && !d.email?.endsWith('@empathika.test')) || list[0]
            if (found) {
              const mapped: AdminProfileData = {
                nama: found.nama || "",
                email: found.email || "",
                noTelepon: found.noTelepon || "",
                bio: found.bio || "",
                foto: found.foto ?? null,
                kategoriProfesi: found.kategori || DEFAULT_PSIKOLOG.kategoriProfesi,
                spesialisasi: found.spesialisasi,
                noStr: found.noStr,
                noSipp: found.noSipp,
                pendidikanText: found.pendidikanText,
                quote: found.quote,
                instagram: found.instagram,
                keahlian: found.keahlian,
                profilLengkap: DEFAULT_PSIKOLOG.profilLengkap,
                videoIntroUrl: DEFAULT_PSIKOLOG.videoIntroUrl,
                videoThumbnail: DEFAULT_PSIKOLOG.videoThumbnail,
                videoDuration: DEFAULT_PSIKOLOG.videoDuration,
              }
              setForm(mapped)
              return
            }
          }
        }
      } catch {}
      setForm(psikologData)
    }
  }, [role, psikologData])

  // Handler input perubahan field
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Upload & Kompresi Foto Profil
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const { url } = await processAndUploadImage(file, "psikolog")
        setForm((prev) => ({ ...prev, foto: url }))
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Gagal memproses foto"
        alert(message)
      }
    }
  }

  // Hapus Foto Profil
  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, foto: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Tambah Keahlian (Psikolog)
  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim()
    if (!trimmedSkill) return

    const currentSkills = form.keahlian || []
    if (!currentSkills.includes(trimmedSkill)) {
      setForm((prev) => ({
        ...prev,
        keahlian: [...currentSkills, trimmedSkill],
      }))
    }
    setNewSkill("")
  }

  // Hapus Keahlian (Psikolog)
  const handleRemoveSkill = (skillToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      keahlian: (prev.keahlian || []).filter((s) => s !== skillToRemove),
    }))
  }

  // Tambah Paragraf Naratif Profil (Psikolog)
  const handleAddParagraph = () => {
    const trimmedParagraph = newParagraph.trim()
    if (!trimmedParagraph) return

    setForm((prev) => ({
      ...prev,
      profilLengkap: [...(prev.profilLengkap || []), trimmedParagraph],
    }))
    setNewParagraph("")
  }

  // Hapus Paragraf Naratif Profil (Psikolog)
  const handleRemoveParagraph = (index: number) => {
    setForm((prev) => ({
      ...prev,
      profilLengkap: (prev.profilLengkap || []).filter((_, i) => i !== index),
    }))
  }

  // Submit / Simpan
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (role === "admin") {
      setAdminData(form)
      try {
        localStorage.setItem("empathika_admin_profile", JSON.stringify(form))
      } catch {}

      // Simpan langsung ke database backend
      try {
        const res = await adminService.updateProfile({
          nama: form.nama,
          email: form.email,
          noTelepon: form.noTelepon,
          bio: form.bio,
          foto: form.foto,
          alamat: form.alamat,
          linkMaps: form.linkMaps,
          instagram: form.instagram,
          tiktok: form.tiktok,
          youtube: form.youtube,
          linkedin: form.linkedin,
        })

        if (res?.data) {
          const updated = res.data
          const mapped: AdminProfileData = {
            nama: updated.nama,
            email: updated.email,
            noTelepon: updated.noTelepon || updated.no_telepon || "",
            bio: updated.bio || "",
            foto: updated.foto || null,
            alamat: updated.alamat || "",
            linkMaps: updated.linkMaps || updated.link_maps || "",
            instagram: updated.instagram || "",
            tiktok: updated.tiktok || "",
            youtube: updated.youtube || "",
            linkedin: updated.linkedin || "",
          }
          setAdminData(mapped)
          setForm(mapped)

          try {
            localStorage.setItem(
              "empathika_admin_profile",
              JSON.stringify({
                ...mapped,
                linkMapsEmbed: updated.linkMapsEmbed || updated.link_maps_embed,
              })
            )

            // Sinkronkan ke konfigurasi kerja sama lokal
            const currentCfgStr = localStorage.getItem("empathika_kerjasama_config")
            if (currentCfgStr) {
              const parsedCfg = JSON.parse(currentCfgStr)
              const rawDigits = (mapped.noTelepon || "").replace(/\D/g, "")
              const cleanWa = rawDigits.startsWith("0") ? "62" + rawDigits.slice(1) : rawDigits
              parsedCfg.kontak = {
                ...parsedCfg.kontak,
                whatsapp: mapped.noTelepon,
                email: mapped.email || parsedCfg.kontak?.email,
                formAffiliate: `https://wa.me/${cleanWa}?text=Halo%20Empathika,%20saya%20tertarik%20dengan%20program%20Affiliate`,
              }
              localStorage.setItem("empathika_kerjasama_config", JSON.stringify(parsedCfg))
            }
          } catch {}
        }
      } catch (backendErr) {
        console.warn("Update profil ke backend gagal/offline, tetap tersimpan lokal:", backendErr)
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("empathika_admin_profile_updated"))
      }
    } else {
      setPsikologData(form)

      // Sinkronkan ke shared storage tenaga ahli agar Admin Utama dan POV Klien langsung terupdate
      try {
        const saved = localStorage.getItem("empathika_tenaga_ahli_data")
        if (saved) {
          const list: TenagaAhliStorageItem[] = JSON.parse(saved)
          if (Array.isArray(list)) {
            const updated = list.map((item) => {
              if (item.id === "1" || item.email === form.email) {
                return {
                  ...item,
                  nama: form.nama,
                  email: form.email,
                  noTelepon: form.noTelepon,
                  bio: form.bio,
                  foto: form.foto,
                  kategori: form.kategoriProfesi || item.kategori,
                  spesialisasi: form.spesialisasi || item.spesialisasi,
                  noStr: form.noStr,
                  noSipp: form.noSipp,
                  pendidikanText: form.pendidikanText,
                  quote: form.quote,
                  instagram: form.instagram,
                  keahlian: form.keahlian,
                }
              }
              return item
            })
            localStorage.setItem("empathika_tenaga_ahli_data", JSON.stringify(updated))
          }
        }
      } catch {}
    }

    setToastMessage(`Profil ${role === "admin" ? "Admin" : "Psikolog"} berhasil diperbarui!`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  // Inisial avatar cadangan jika foto profil belum diunggah
  const initials = form.nama
    ? form.nama
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EP"

  return {
    form,
    setForm,
    initials,
    newSkill,
    setNewSkill,
    newParagraph,
    setNewParagraph,
    showToast,
    toastMessage,
    previewModalOpen,
    setPreviewModalOpen,
    isPlayingVideoPreview,
    setIsPlayingVideoPreview,
    fileInputRef,
    handleInputChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleAddSkill,
    handleRemoveSkill,
    handleAddParagraph,
    handleRemoveParagraph,
    handleSave,
  }
}

