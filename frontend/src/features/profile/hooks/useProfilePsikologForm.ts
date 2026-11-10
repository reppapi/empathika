import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"

import { AdminProfileData, RoleType } from "../types"
import { DEFAULT_ADMIN, DEFAULT_PSIKOLOG } from "../data/profileData"
import { psikologService } from "@/services/psikolog.service"
import { uploadService } from "@/services/upload.service"
import apiClient from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"

export const EMPTY_TENAGA_DATA: AdminProfileData = {
  nama: "",
  email: "",
  noTelepon: "",
  bio: "",
  foto: null,
  kategoriProfesi: "konselor",
  spesialisasi: "",
  noStr: "",
  noSipp: "",
  noSilp: "",
  pendidikanText: "",
  quote: "",
  instagram: "",
  keahlian: [],
  profilLengkap: [],
}

export function formatDurationSeconds(durationSeconds: number): string {
  const mins = Math.floor(durationSeconds / 60)
  const secs = Math.floor(durationSeconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function stripOuterQuotes(text?: string): string {
  if (!text) return ""
  return text.replace(/^["“”']+|["“”']+$/g, "").trim()
}

interface UseProfilePsikologFormProps {
  role?: RoleType
}

export function useProfilePsikologForm({ role = "psikolog" }: UseProfilePsikologFormProps = {}) {
  const router = useRouter()

  // 1. State Data Profil
  const [adminData] = useState<AdminProfileData>(DEFAULT_ADMIN)
  const [psikologData, setPsikologData] = useState<AdminProfileData>(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("active_psikolog_name") || sessionStorage.getItem("active_psikolog_name")
      const authUser = useAuthStore.getState().user
      const displayName = authUser?.role === "PSIKOLOG" && authUser?.name ? authUser.name : savedName
      if (displayName && !displayName.toLowerCase().includes("admin")) {
        return {
          ...DEFAULT_PSIKOLOG,
          nama: displayName,
          email: authUser?.email || DEFAULT_PSIKOLOG.email,
        }
      }
    }
    return DEFAULT_PSIKOLOG
  })
  const [form, setForm] = useState<AdminProfileData>(role === "admin" ? adminData : psikologData)

  // 2. State Input Tambahan & Keahlian
  const [newSkill, setNewSkill] = useState("")

  // 3. State Notifikasi & Loading
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // 4. State Modal Preview POV Klien
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [isPlayingVideoPreview, setIsPlayingVideoPreview] = useState(false)

  // 5. State & Refs Media Upload (Foto, Video, Thumbnail)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoFileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null)

  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)

  // ── Sinkronisasi Data Profil Saat Halaman Dimuat ────────────────────────
  useEffect(() => {
    if (role === "admin") {
      setForm(adminData)
      return
    }

    // 1. Ambil dari API resmi backend psikolog
    psikologService
      .getMyProfile()
      .then((res: any) => {
        if (!res) return

        const kategoriClean = res.kategori?.toLowerCase() || ""
        const kategoriProfesi: AdminProfileData["kategoriProfesi"] = kategoriClean.includes("peer")
          ? "peer-konselor"
          : kategoriClean.includes("konselor")
          ? "konselor"
          : "psikolog"

        const mapped: AdminProfileData = {
          nama: res.nama_gelar || res.account?.nama || DEFAULT_PSIKOLOG.nama,
          email: res.account?.email || DEFAULT_PSIKOLOG.email,
          noTelepon: res.account?.no_telepon || DEFAULT_PSIKOLOG.noTelepon,
          bio: res.bio || res.account?.bio || "",
          foto: res.foto || res.account?.foto || null,
          kategoriProfesi,
          spesialisasi: res.spesialisasi?.nama || res.spesialisasi || "",
          noStr: res.no_str || "",
          noSipp: res.no_sipp || "",
          noSilp: res.no_silp || "",
          pendidikanText: res.pendidikan || "",
          quote: res.quote || "",
          instagram: res.instagram || "",
          keahlian: typeof res.keahlian === "string"
            ? res.keahlian.split(",").map((s: string) => s.trim()).filter(Boolean)
            : Array.isArray(res.keahlian)
            ? res.keahlian
            : DEFAULT_PSIKOLOG.keahlian,
          profilLengkap: res.profil_lengkap
            ? res.profil_lengkap.split("\n\n").map((s: string) => s.trim()).filter(Boolean)
            : DEFAULT_PSIKOLOG.profilLengkap,
          videoIntroUrl: res.video_intro_url || "",
          videoThumbnail: res.video_thumbnail || "",
          videoDuration: res.video_duration || "",
        }

        setPsikologData(mapped)
        setForm(mapped)

        if (res.id) localStorage.setItem("active_psikolog_id", res.id)
        if (mapped.nama) localStorage.setItem("active_psikolog_name", mapped.nama)
      })
      .catch(() => {
        // 2. Fallback baca dari cache lokal (localStorage)
        try {
          const saved = localStorage.getItem("empathika_tenaga_ahli_data")
          if (!saved) {
            setForm(psikologData)
            return
          }

          const list = JSON.parse(saved)
          const savedId = localStorage.getItem("active_psikolog_id")
          const savedName = localStorage.getItem("active_psikolog_name")
          const authUser = useAuthStore.getState().user
          const authEmail = authUser?.email || localStorage.getItem("active_psikolog_email")

          const found =
            (savedId ? list.find((d: any) => d.id === savedId || d.accountId === savedId) : null) ||
            (authEmail ? list.find((d: any) => d.email?.toLowerCase() === authEmail.toLowerCase()) : null) ||
            (savedName ? list.find((d: any) => d.nama?.toLowerCase().includes(savedName.toLowerCase())) : null)

          if (found) {
            const isKonselorProfesi =
              found.kategori?.toLowerCase().includes("peer") ||
              found.kategori?.toLowerCase().includes("konselor")

            const mapped: AdminProfileData = {
              nama: found.nama || "",
              email: found.email || "",
              noTelepon: found.noTelepon || "",
              bio: found.bio || "",
              foto: found.foto || null,
              kategoriProfesi: found.kategori?.toLowerCase().includes("peer")
                ? "peer-konselor"
                : found.kategori?.toLowerCase().includes("konselor")
                ? "konselor"
                : "psikolog",
              spesialisasi: found.spesialisasi || "",
              noStr: isKonselorProfesi ? "" : (found.noStr || found.no_str || ""),
              noSipp: isKonselorProfesi ? "" : (found.noSipp || found.no_sipp || ""),
              noSilp: isKonselorProfesi ? "" : (found.noSilp || found.no_silp || ""),
              pendidikanText: found.pendidikan || found.pendidikanText || "",
              quote: found.quote || "",
              instagram: found.instagram || "",
              keahlian: Array.isArray(found.keahlian) ? found.keahlian : [],
              profilLengkap: Array.isArray(found.profilLengkap) ? found.profilLengkap : [],
              videoIntroUrl: found.videoIntroUrl || "",
              videoThumbnail: found.videoThumbnail || "",
              videoDuration: found.videoDuration || "",
            }

            setPsikologData(mapped)
            setForm(mapped)
          } else {
            setForm(psikologData)
          }
        } catch {
          setForm(psikologData)
        }
      })
  }, [role, adminData])

  // ── Handlers Formulir Dasar ──────────────────────────────────────────────
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // ── Handlers Foto Profil ─────────────────────────────────────────────────
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedPhotoFile(file)
    const previewUrl = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, foto: previewUrl }))
  }

  const handleRemovePhoto = () => {
    setSelectedPhotoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    setForm((prev) => ({ ...prev, foto: null }))
  }

  // ── Handlers Video Intro (MP4 Langsung, Maksimal 10 Menit) ───────────────
  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".mp4") && file.type !== "video/mp4") {
      setVideoUploadError("Format video tidak didukung. Harap unggah file dengan format .mp4.")
      if (videoFileInputRef.current) videoFileInputRef.current.value = ""
      return
    }

    setVideoUploadError(null)

    const videoEl = document.createElement("video")
    videoEl.preload = "metadata"

    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src)
      const duration = videoEl.duration

      // Batas durasi maksimal 10 menit (600 detik)
      if (duration > 600) {
        setVideoUploadError(
          `Durasi video (${formatDurationSeconds(duration)}) melebihi batas maksimal 10 menit.`
        )
        setSelectedVideoFile(null)
        if (videoFileInputRef.current) videoFileInputRef.current.value = ""
        return
      }

      setSelectedVideoFile(file)
      const videoUrl = URL.createObjectURL(file)
      setForm((prev) => ({
        ...prev,
        videoIntroUrl: videoUrl,
        videoDuration: formatDurationSeconds(duration),
      }))
    }

    videoEl.onerror = () => {
      window.URL.revokeObjectURL(videoEl.src)
      setVideoUploadError("Gagal membaca file video. Pastikan file MP4 tidak rusak.")
    }

    videoEl.src = URL.createObjectURL(file)
  }

  const handleRemoveVideo = () => {
    setSelectedVideoFile(null)
    setVideoUploadError(null)
    if (videoFileInputRef.current) videoFileInputRef.current.value = ""
    setForm((prev) => ({
      ...prev,
      videoIntroUrl: "",
      videoDuration: "",
    }))
  }

  // ── Handlers Thumbnail Video ─────────────────────────────────────────────
  const handleThumbnailUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedThumbnailFile(file)
    const previewUrl = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, videoThumbnail: previewUrl }))
  }

  const handleRemoveThumbnail = () => {
    setSelectedThumbnailFile(null)
    if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = ""
    setForm((prev) => ({ ...prev, videoThumbnail: "" }))
  }

  // ── Handlers Tag Keahlian ────────────────────────────────────────────────
  const handleAddSkill = () => {
    const trimmed = newSkill.trim()
    if (!trimmed) return

    const currentSkills = form.keahlian || []
    if (!currentSkills.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        keahlian: [...(prev.keahlian || []), trimmed],
      }))
    }
    setNewSkill("")
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      keahlian: (prev.keahlian || []).filter((s) => s !== skillToRemove),
    }))
  }

  // ── Simpan Perubahan (Persistensi API & LocalStorage) ──────────────────────
  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let finalFotoUrl = form.foto
      let finalVideoUrl = form.videoIntroUrl
      let finalThumbnailUrl = form.videoThumbnail

      // 1. Upload foto baru jika dipilih
      if (selectedPhotoFile) {
        try {
          const url = await uploadService.uploadImage(selectedPhotoFile, "avatar")
          if (url) finalFotoUrl = url
        } catch (uploadErr) {
          console.warn("Gagal unggah foto ke storage, fallback ke data lokal:", uploadErr)
        }
      }

      // 2. Upload video MP4 baru jika dipilih
      if (selectedVideoFile) {
        try {
          const formData = new FormData()
          formData.append("file", selectedVideoFile)
          const uploadRes: any = await apiClient.post("/upload/video", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          if (uploadRes?.data?.url) finalVideoUrl = uploadRes.data.url
        } catch (uploadErr) {
          console.warn("Gagal unggah video ke storage, fallback ke URL lokal:", uploadErr)
        }
      }

      // 3. Upload thumbnail baru jika dipilih
      if (selectedThumbnailFile) {
        try {
          const url = await uploadService.uploadImage(selectedThumbnailFile)
          if (url) finalThumbnailUrl = url
        } catch (uploadErr) {
          console.warn("Gagal unggah thumbnail ke storage:", uploadErr)
        }
      }

      const updatedForm: AdminProfileData = {
        ...form,
        foto: finalFotoUrl,
        videoIntroUrl: finalVideoUrl,
        videoThumbnail: finalThumbnailUrl,
      }

      // 4. Update data ke backend resmi
      try {
        await psikologService.updateMyProfile({
          nama_gelar: updatedForm.nama,
          bio: updatedForm.bio,
          foto: finalFotoUrl || undefined,
          spesialisasi: updatedForm.spesialisasi,
          no_str: updatedForm.noStr,
          no_sipp: updatedForm.noSipp,
          no_silp: updatedForm.noSilp,
          pendidikan: updatedForm.pendidikanText,
          quote: updatedForm.quote,
          instagram: updatedForm.instagram,
          keahlian: updatedForm.keahlian,
          video_intro_url: finalVideoUrl,
          video_thumbnail: finalThumbnailUrl,
          video_duration: updatedForm.videoDuration,
        })
      } catch (apiErr) {
        console.warn("API update profil gagal, melanjutkan penyimpanan lokal:", apiErr)
      }

      // 5. Update state & sync cache localStorage
      setPsikologData(updatedForm)
      setForm(updatedForm)

      try {
        const saved = localStorage.getItem("empathika_tenaga_ahli_data")
        if (saved) {
          const list = JSON.parse(saved)
          const savedId = localStorage.getItem("active_psikolog_id")
          const authUser = useAuthStore.getState().user
          const authEmail = authUser?.email || localStorage.getItem("active_psikolog_email")

          const idx = list.findIndex(
            (d: any) =>
              (savedId && (d.id === savedId || d.accountId === savedId)) ||
              (authEmail && d.email?.toLowerCase() === authEmail.toLowerCase())
          )

          if (idx !== -1) {
            list[idx] = {
              ...list[idx],
              nama: updatedForm.nama,
              noTelepon: updatedForm.noTelepon,
              bio: updatedForm.bio,
              foto: finalFotoUrl,
              spesialisasi: updatedForm.spesialisasi,
              noStr: updatedForm.noStr,
              noSipp: updatedForm.noSipp,
              noSilp: updatedForm.noSilp,
              pendidikan: updatedForm.pendidikanText,
              pendidikanText: updatedForm.pendidikanText,
              quote: updatedForm.quote,
              instagram: updatedForm.instagram,
              keahlian: updatedForm.keahlian,
              videoIntroUrl: finalVideoUrl,
              videoThumbnail: finalThumbnailUrl,
              videoDuration: updatedForm.videoDuration,
            }
            localStorage.setItem("empathika_tenaga_ahli_data", JSON.stringify(list))
          }
        }

        if (updatedForm.nama) {
          localStorage.setItem("active_psikolog_name", updatedForm.nama)
        }

        // Trigger sinkronisasi lintas komponen (Sidebar, Topbar, dll.)
        window.dispatchEvent(new Event("storage"))
      } catch (lsErr) {
        console.warn("Gagal sinkronisasi localStorage:", lsErr)
      }

      setToastMessage("Profil tenaga ahli berhasil diperbarui!")
      setShowToast(true)

      // Redirect otomatis ke beranda setelah berhasil menyimpan
      setTimeout(() => {
        router.push("/psikolog-web/beranda" as any)
      }, 1000)
    } catch (err) {
      console.error("Gagal menyimpan profil:", err)
      setToastMessage("Terjadi kesalahan saat menyimpan profil.")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3500)
    } finally {
      setIsSaving(false)
    }
  }

  const initials = form.nama
    ? form.nama
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EP"

  return {
    form,
    initials,
    newSkill,
    setNewSkill,
    showToast,
    toastMessage,
    isSaving,
    previewModalOpen,
    setPreviewModalOpen,
    isPlayingVideoPreview,
    setIsPlayingVideoPreview,
    videoUploadError,
    fileInputRef,
    videoFileInputRef,
    thumbnailFileInputRef,
    handleInputChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleVideoUpload,
    handleRemoveVideo,
    handleThumbnailUpload,
    handleRemoveThumbnail,
    handleAddSkill,
    handleRemoveSkill,
    handleSave,
    stripOuterQuotes,
  }
}

