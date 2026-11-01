"use client"

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { AdminProfileData, RoleType } from "../../types"
import { DEFAULT_ADMIN } from "../../data/profileData"
import { psikologService } from "@/services/psikolog.service"
import { uploadService } from "@/services/upload.service"
import apiClient from "@/lib/axios"
import { FormGantiEmail } from "./FormGantiEmail"
import { FormGantiPassword } from "./FormGantiPassword"
import { useAuthStore } from "@/store/authStore"

export { type AdminProfileData, type RoleType }

interface ProfileClientProps {
  role?: RoleType
}

// ── Konstanta & Helper Pure Function ──────────────────────────────────────
const EMPTY_TENAGA_DATA: AdminProfileData = {
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

function formatDurationSeconds(durationSeconds: number): string {
  const mins = Math.floor(durationSeconds / 60)
  const secs = Math.floor(durationSeconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function stripOuterQuotes(text?: string): string {
  if (!text) return ""
  return text.replace(/^["“”']+|["“”']+$/g, "").trim()
}

// ── Komponen Utama ────────────────────────────────────────────────────────
export default function ProfilePsikologClient({ role = "psikolog" }: ProfileClientProps) {
  const router = useRouter()

  // 1. State Data Profil
  const [adminData, setAdminData] = useState<AdminProfileData>(DEFAULT_ADMIN)
  const [psikologData, setPsikologData] = useState<AdminProfileData>(EMPTY_TENAGA_DATA)
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
          nama: res.nama_gelar || res.account?.nama || "",
          email: res.account?.email || "",
          noTelepon: res.account?.no_telepon || "",
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
            : [],
          profilLengkap: res.profil_lengkap
            ? res.profil_lengkap.split("\n\n").map((s: string) => s.trim()).filter(Boolean)
            : [],
          videoIntroUrl: res.video_intro_url || "",
          videoThumbnail: res.video_thumbnail || "",
          videoDuration: res.video_duration || "",
        }

        setPsikologData(mapped)
        setForm(mapped)

        // Cache identitas aktif untuk sinkronisasi antarkomponen
        if (res.id) localStorage.setItem("active_psikolog_id", res.id)
        if (mapped.nama) localStorage.setItem("active_psikolog_name", mapped.nama)
        if (mapped.email) localStorage.setItem("active_psikolog_email", mapped.email)
        if (mapped.kategoriProfesi) localStorage.setItem("active_psikolog_kategori", mapped.kategoriProfesi)
      })
      .catch(() => {
        // 2. Fallback aman ke shared storage jika koneksi backend offline
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
              kategoriProfesi: found.kategori || "konselor",
              spesialisasi: found.spesialisasi || "",
              noStr: isKonselorProfesi ? "" : (found.noStr || ""),
              noSipp: isKonselorProfesi ? "" : (found.noSipp || ""),
              noSilp: isKonselorProfesi ? "" : (found.noSilp || ""),
              pendidikanText: found.pendidikanText || "",
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
          } else if (authUser) {
            const mapped: AdminProfileData = {
              ...EMPTY_TENAGA_DATA,
              nama: authUser.name || "",
              email: authUser.email || "",
            }
            setPsikologData(mapped)
            setForm(mapped)
          }
        } catch {
          setForm(psikologData)
        }
      })
  }, [role, adminData])

  // ── Handlers Perubahan Input Teks & Upload Media ─────────────────────────
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Foto Profil
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPhotoFile(file)
      const url = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, foto: url }))
    }
  }

  const handleRemovePhoto = () => {
    setSelectedPhotoFile(null)
    setForm((prev) => ({ ...prev, foto: null }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Video Perkenalan (MP4, Maksimal 10 Menit)
  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setVideoUploadError(null)

    // Validasi format MP4
    if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4")) {
      setVideoUploadError("Hanya file video berformat .mp4 yang diizinkan.")
      if (videoFileInputRef.current) videoFileInputRef.current.value = ""
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const tempVideo = document.createElement("video")
    tempVideo.preload = "metadata"
    tempVideo.src = objectUrl

    tempVideo.onloadedmetadata = () => {
      window.URL.revokeObjectURL(tempVideo.src)
      const durationSeconds = tempVideo.duration

      // Validasi durasi maksimal 10 menit (600 detik)
      if (durationSeconds > 600) {
        setVideoUploadError(
          `Durasi video melebihi batas maksimal 10 menit (${Math.floor(durationSeconds / 60)} menit ${Math.round(
            durationSeconds % 60
          )} detik). Silakan unggah video dengan durasi 10 menit atau kurang.`
        )
        if (videoFileInputRef.current) videoFileInputRef.current.value = ""
        setSelectedVideoFile(null)
        return
      }

      const formattedDuration = formatDurationSeconds(durationSeconds)
      setSelectedVideoFile(file)
      setForm((prev) => ({
        ...prev,
        videoIntroUrl: objectUrl,
        videoDuration: formattedDuration,
      }))
    }

    tempVideo.onerror = () => {
      setVideoUploadError("Gagal memproses file video. Pastikan format file adalah MP4 yang valid.")
      if (videoFileInputRef.current) videoFileInputRef.current.value = ""
      setSelectedVideoFile(null)
    }
  }

  const handleRemoveVideo = () => {
    setSelectedVideoFile(null)
    setForm((prev) => ({
      ...prev,
      videoIntroUrl: "",
      videoDuration: "",
    }))
    setVideoUploadError(null)
    if (videoFileInputRef.current) videoFileInputRef.current.value = ""
  }

  // Thumbnail Video
  const handleThumbnailUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedThumbnailFile(file)
      const url = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, videoThumbnail: url }))
    }
  }

  const handleRemoveThumbnail = () => {
    setSelectedThumbnailFile(null)
    setForm((prev) => ({ ...prev, videoThumbnail: "" }))
    if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = ""
  }

  // Tag Keahlian
  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    const currentSkills = form.keahlian || []
    if (!currentSkills.includes(newSkill.trim())) {
      setForm((prev) => ({
        ...prev,
        keahlian: [...currentSkills, newSkill.trim()],
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

  // ── Submit / Penyimpanan Profil ──────────────────────────────────────────
  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    try {
      if (role === "admin") {
        setAdminData(form)
        setToastMessage("Profil Admin berhasil diperbarui!")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3500)
        return
      }

      // 1. Upload file foto baru jika ada
      let fotoUrl = form.foto
      if (selectedPhotoFile) {
        try {
          fotoUrl = await uploadService.uploadImage(selectedPhotoFile, "psikolog")
        } catch (uploadErr) {
          console.warn("Gagal upload foto ke backend, menggunakan foto lama/data lokal:", uploadErr)
        }
      }

      // 2. Upload file video MP4 baru jika ada
      let videoUrl = form.videoIntroUrl
      if (selectedVideoFile) {
        const videoFormData = new FormData()
        videoFormData.append("file", selectedVideoFile)
        try {
          const resVideo = await apiClient.post("/upload/video", videoFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          if (resVideo.data?.data?.url) {
            videoUrl = resVideo.data.data.url
          }
        } catch (uploadErr) {
          console.warn("Gagal upload video ke backend:", uploadErr)
        }
      }

      // 3. Upload thumbnail video baru jika ada
      let thumbnailUrl = form.videoThumbnail
      if (selectedThumbnailFile) {
        try {
          thumbnailUrl = await uploadService.uploadImage(selectedThumbnailFile)
        } catch (uploadErr) {
          console.warn("Gagal upload thumbnail video ke backend:", uploadErr)
        }
      }

      // 4. Siapkan payload resmi API updateMyProfile
      const payload: Record<string, any> = {
        nama: form.nama || undefined,
        no_telepon: form.noTelepon || undefined,
        bio: form.bio || undefined,
        spesialisasi: form.spesialisasi || undefined,
        no_str: form.noStr || null,
        no_sipp: form.noSipp || null,
        no_silp: form.noSilp || null,
        foto: fotoUrl || null,
        quote: form.quote ?? "",
        instagram: form.instagram || null,
        keahlian: form.keahlian || [],
        pendidikan: form.pendidikanText || null,
        video_intro_url: videoUrl || null,
        video_thumbnail: thumbnailUrl || null,
        video_duration: form.videoDuration || null,
        kategori: form.kategoriProfesi || undefined,
      }

      if (form.email && form.email.trim()) {
        payload.email = form.email.trim()
      }

      if (form.password && form.password.trim()) {
        payload.password = form.password.trim()
      }

      // 5. Kirim data pembaruan ke server backend
      try {
        await psikologService.updateMyProfile(payload)
      } catch (apiErr) {
        console.warn("Peringatan saat update profil ke backend:", apiErr)
      }

      // 6. Update local state & shared storage sebagai cadangan offline
      const updatedForm: AdminProfileData = {
        ...form,
        foto: fotoUrl,
        videoIntroUrl: videoUrl,
        videoThumbnail: thumbnailUrl,
        password: "",
      }
      setPsikologData(updatedForm)
      setForm(updatedForm)
      setSelectedPhotoFile(null)
      setSelectedVideoFile(null)
      setSelectedThumbnailFile(null)

      try {
        const saved = localStorage.getItem("empathika_tenaga_ahli_data")
        const list = saved ? JSON.parse(saved) : []
        const activeId = localStorage.getItem("active_psikolog_id")
        const activeEmail = localStorage.getItem("active_psikolog_email")
        const activeName = localStorage.getItem("active_psikolog_name")

        let matched = false
        const updated = list.map((item: any) => {
          const isMatch =
            (activeId && (item.id === activeId || item.accountId === activeId)) ||
            (form.email && item.email?.toLowerCase() === form.email.toLowerCase()) ||
            (activeEmail && item.email?.toLowerCase() === activeEmail.toLowerCase()) ||
            (form.nama && item.nama?.toLowerCase() === form.nama.toLowerCase()) ||
            (activeName && item.nama?.toLowerCase() === activeName.toLowerCase()) ||
            (form.nama && item.nama && (item.nama.toLowerCase().includes(form.nama.toLowerCase()) || form.nama.toLowerCase().includes(item.nama.toLowerCase()))) ||
            (activeName && item.nama && (item.nama.toLowerCase().includes(activeName.toLowerCase()) || activeName.toLowerCase().includes(item.nama.toLowerCase())))

          if (isMatch) {
            matched = true
            return {
              ...item,
              nama: form.nama || item.nama,
              email: form.email || item.email,
              noTelepon: form.noTelepon || item.noTelepon,
              bio: form.bio,
              foto: fotoUrl || item.foto,
              kategori: form.kategoriProfesi || item.kategori,
              spesialisasi: form.spesialisasi || item.spesialisasi,
              noStr: form.noStr,
              noSipp: form.noSipp,
              noSilp: form.noSilp,
              pendidikanText: form.pendidikanText,
              quote: form.quote,
              instagram: form.instagram,
              keahlian: form.keahlian,
              videoIntroUrl: videoUrl,
              videoThumbnail: thumbnailUrl,
              videoDuration: form.videoDuration,
            }
          }
          return item
        })

        if (!matched) {
          updated.push({
            id: activeId || `tenaga_${Date.now()}`,
            nama: form.nama,
            email: form.email,
            noTelepon: form.noTelepon,
            bio: form.bio,
            foto: fotoUrl,
            kategori: form.kategoriProfesi,
            spesialisasi: form.spesialisasi,
            noStr: form.noStr,
            noSipp: form.noSipp,
            noSilp: form.noSilp,
            pendidikanText: form.pendidikanText,
            quote: form.quote,
            instagram: form.instagram,
            keahlian: form.keahlian,
            videoIntroUrl: videoUrl,
            videoThumbnail: thumbnailUrl,
            videoDuration: form.videoDuration,
          })
        }

        localStorage.setItem("empathika_tenaga_ahli_data", JSON.stringify(updated))
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"))
        }
      } catch (err) {
        console.warn("Gagal simpan cadangan lokal:", err)
      }

      const roleLabel =
        form.kategoriProfesi === "peer-konselor"
          ? "Peer Konselor"
          : form.kategoriProfesi === "konselor"
          ? "Konselor"
          : "Psikolog"
      setToastMessage(`Profil ${roleLabel} berhasil diperbarui!`)
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

  return (
    <div className="space-y-6 font-poppins pb-12">
      {/* ── 1. TOAST NOTIFIKASI SUKSES ── */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-4 text-white shadow-2xl transition-all animate-bounce">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">Berhasil</p>
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* ── 2. HEADER HALAMAN ── */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#561269] tracking-tight">
          {role === "admin" ? "Pengaturan Profil Admin Utama" : "Pengaturan Profil Psikolog"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          {role === "admin"
            ? "Kelola identitas, foto profil, dan informasi kontak akun administrator Empathika."
            : "Kelola profil profesional, foto profil, kredensial STR/SIPP, dan informasi yang tampil di halaman klien."}
        </p>
      </div>

      {/* ── 3. FORM BAGIAN 1: PROFIL POKOK & IDENTITAS TENAGA AHLI ── */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#561269]">
                Profil Tenaga Ahli
              </h3>
              <p className="text-xs text-gray-500">
                Foto profil, biodata diri, riwayat pendidikan, dan kontak yang tampil pada sistem layanan.
              </p>
            </div>
            {/* Tombol Pratinjau Tampilan Klien (POV Klien) */}
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-purple-200 bg-purple-50/70 hover:bg-purple-100 px-3.5 py-1.5 text-xs font-bold text-[#561269] transition shadow-2xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Lihat Pratinjau (POV Klien)
            </button>
          </div>

          {/* Area Foto Profil */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Foto Profil Tenaga Ahli
            </label>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-purple-50/40 border border-purple-100">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-white shrink-0 border-2 border-purple-200 shadow-sm flex items-center justify-center">
                {form.foto ? (
                  <Image src={form.foto} alt="Preview Foto" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
                    <span className="text-3xl font-extrabold text-[#561269] select-none">
                      {initials}
                    </span>
                    <span className="text-[11px] font-semibold text-[#561269]">Pratinjau Foto</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs font-medium text-gray-700">
                  Ubah pas foto formal atau foto profil profesional tenaga ahli.
                </p>
                <p className="text-[11px] text-gray-600 font-medium">
                  Rekomendasi pas foto: <span className="font-bold text-[#561269]">600 × 600 px (rasio 1:1 / 4:3, wajah di tengah)</span>
                </p>
                <p className="text-[11px] text-gray-400">
                  Format JPG, PNG, atau WebP • Bebas ukuran berapa pun, otomatis dikompresi untuk kartu & profil klien
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    {form.foto ? "Ganti Foto" : "Pilih & Unggah Foto"}
                  </button>
                  {form.foto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-red-600 transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grid Input Data Pokok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleInputChange}
                required
                placeholder="contoh: Dr. Jane Doe, M.Psi., Psikolog"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="noTelepon"
                value={form.noTelepon}
                onChange={handleInputChange}
                required
                placeholder="081234567890"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 transition focus:border-[#561269] focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Wajib diawali dengan 08 (contoh: 081234567890).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Spesialisasi Bidang
              </label>
              <input
                type="text"
                name="spesialisasi"
                value={form.spesialisasi || ""}
                onChange={handleInputChange}
                placeholder="Contoh: Hubungan Keluarga, Kecemasan, Remaja"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Riwayat Pendidikan
              </label>
              <textarea
                rows={3}
                name="pendidikanText"
                value={form.pendidikanText || ""}
                onChange={handleInputChange}
                placeholder="Contoh:&#10;S1 Psikologi - Universitas Padjadjaran (2015 - 2019)&#10;S2 Magister Psikologi Profesi - Universitas Gadjah Mada (2020 - 2022)"
                className="w-full rounded-2xl border border-gray-200 p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none resize-y min-h-[80px] whitespace-pre-wrap leading-relaxed transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tekan <strong>Enter</strong> untuk membuat baris baru jika memiliki lebih dari satu riwayat pendidikan.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Perkenalan Profil
              </label>
              <textarea
                rows={5}
                name="bio"
                value={form.bio || ""}
                onChange={handleInputChange}
                placeholder="Tuliskan perkenalan dan pendekatan konseling psikolog... Tekan Enter untuk membuat paragraf baru."
                className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none resize-y min-h-[120px] whitespace-pre-wrap leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Quote Diri
              </label>
              <input
                type="text"
                name="quote"
                value={form.quote || ""}
                onChange={handleInputChange}
                placeholder="Prinsip konseling..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm italic text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
              />
              {form.quote ? (
                <div className="mt-2 bg-[#FAF5FD] border-l-4 border-[#561269] p-3 rounded-r-xl">
                  <p className="text-[11px] font-semibold text-[#561269] mb-0.5">
                    Tampilan Quote di Profil Klien:
                  </p>
                  <p className="text-xs italic text-gray-800 leading-relaxed">
                    &ldquo;{stripOuterQuotes(form.quote)}&rdquo;
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Quote singkat atau prinsip konseling yang akan tampil di halaman profil klien.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={form.instagram || ""}
                onChange={handleInputChange}
                placeholder="@username"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
              />
            </div>
          </div>
        </div>
      </form>

      {/* ── 4. KEAMANAN AKUN & KREDENSIAL LOGIN (Komponen Terisolasi) ── */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-bold text-[#561269]">
            Keamanan Akun & Kredensial Login
          </h3>
          <p className="text-xs text-gray-500">
            Perubahan email dan kata sandi diproteksi dengan verifikasi keamanan ketat (OWASP ASVS).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <FormGantiEmail initialEmail={form.email} />
          <FormGantiPassword />
        </div>
      </div>

      {/* ── 5. FORM BAGIAN 2: LEGALITAS, KEAHLIAN & VIDEO PERKENALAN ── */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 3. KOLOM LEGALITAS PRAKTIK (Dinamis: Psikolog vs Konselor vs Peer Konselor) */}
        {form.kategoriProfesi === "peer-konselor" ? (
          <div className="rounded-3xl border border-purple-200 bg-purple-50/50 p-6 sm:p-8 space-y-2">
            <h3 className="text-base font-bold text-[#561269]">
              Legalitas & Status Profesi
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Sebagai <strong>Peer Konselor (Teman Cerita Sebaya)</strong>, Anda berfokus pada pendampingan suportif dan ruang cerita yang aman tanpa penghakiman. Anda tidak diwajibkan menyertakan nomor STR dan SIPP klinis.
            </p>
          </div>
        ) : form.kategoriProfesi === "konselor" ? (
          <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 sm:p-8 space-y-4">
            <div className="border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-[#561269]">
                Legalitas & Sertifikasi Konselor
              </h3>
              <p className="text-xs text-gray-600">
                Sebagai <strong>Konselor</strong>, nomor STR dan izin praktik bersifat opsional dan dapat diisi jika Anda memiliki sertifikasi konseling resmi.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor STR / Sertifikasi Konselor (Opsional)
                </label>
                <input
                  type="text"
                  name="noStr"
                  value={form.noStr || ""}
                  onChange={handleInputChange}
                  placeholder="Contoh: STR-8921-2023"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor SIPP / Izin Praktik (Opsional)
                </label>
                <input
                  type="text"
                  name="noSipp"
                  value={form.noSipp || ""}
                  onChange={handleInputChange}
                  placeholder="Contoh: SIPP-1049-2024"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 sm:p-8 space-y-4">
            <div className="border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-[#561269]">
                Legalitas Praktik
              </h3>
              <p className="text-xs text-gray-600">
                Cantumkan nomor STR, SIPP resmi, serta SILP (Surat Izin Layanan Psikolog) untuk kredibilitas Anda di hadapan klien.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor STR (Surat Tanda Registrasi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="noStr"
                  value={form.noStr || ""}
                  onChange={handleInputChange}
                  placeholder="Contoh: STR-8921-2023"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
                />
                <p className="text-[11px] text-purple-600/70 mt-1">
                  Format resmi diawali dengan &apos;STR&apos; (contoh: STR-8921-2023).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor SIPP (Surat Izin Praktik Psikologi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="noSipp"
                  value={form.noSipp || ""}
                  onChange={handleInputChange}
                  placeholder="Contoh: SIPP-1049-2024"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
                />
                <p className="text-[11px] text-purple-600/70 mt-1">
                  Format resmi diawali dengan &apos;SIPP&apos; (contoh: SIPP-1049-2024).
                </p>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor SILP (Surat Izin Layanan Psikolog)
                </label>
                <input
                  type="text"
                  name="noSilp"
                  value={form.noSilp || ""}
                  onChange={handleInputChange}
                  placeholder="Contoh: SILP-2024-001"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
                />
                <p className="text-[11px] text-purple-600/70 mt-1">
                  Format resmi diawali dengan &apos;SILP&apos; (contoh: SILP-2024-001).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Kolom Topik & Keahlian Konseling */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">
              Topik & Keahlian Konseling
            </h3>
            <p className="text-xs text-gray-500">
              Tambahkan tag topik keahlian (contoh: Trauma Healing, Relasi, Depresi).
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddSkill()
                }
              }}
              placeholder="Tambah keahlian (contoh: Burnout & Stres)"
              className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-800 focus:border-[#561269] focus:outline-none transition"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2.5 text-xs font-bold text-gray-950 shadow-sm transition active:scale-95 cursor-pointer"
            >
              Tambah
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(form.keahlian || []).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-medium text-[#561269]"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="rounded hover:bg-purple-200/80 p-0.5 text-purple-600 hover:text-purple-900 transition leading-none cursor-pointer"
                  title={`Hapus ${skill}`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
            {(form.keahlian || []).length === 0 && (
              <p className="text-xs text-gray-400 italic">Belum ada keahlian yang ditambahkan.</p>
            )}
          </div>
        </div>

        {/* Kolom Video Perkenalan (MP4 Langsung, Maksimal 10 Menit) */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Video Perkenalan (Greeting Video)
            </h3>
            <p className="text-xs text-gray-500">
              Unggah file video MP4 perkenalan singkat untuk menyapa calon klien di halaman profil Anda (maksimal 10 menit).
            </p>
          </div>

          {videoUploadError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-2.5 text-red-700 text-xs">
              <svg className="w-4 h-4 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{videoUploadError}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
            {/* Pratinjau Video Box */}
            <div className="relative w-full md:w-72 aspect-video rounded-2xl overflow-hidden bg-black/90 shrink-0 border-2 border-purple-200 shadow-md flex items-center justify-center">
              {form.videoIntroUrl ? (
                <video
                  src={form.videoIntroUrl}
                  poster={form.videoThumbnail || undefined}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-1.5 p-4 text-center">
                  <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-purple-200">Belum ada video</span>
                  <span className="text-[10px] text-gray-400">Pilih file MP4 untuk mengunggah</span>
                </div>
              )}
            </div>

            {/* Kontrol Upload File MP4 */}
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div>
                <p className="text-xs font-bold text-gray-800">
                  Unggah File Video Langsung (.mp4)
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Format yang didukung khusus <strong>.mp4</strong>. Durasi maksimal yang diizinkan adalah <strong>10 menit (600 detik)</strong>.
                </p>
                {form.videoDuration && (
                  <p className="text-xs font-semibold text-[#561269] mt-1.5 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                    <svg className="w-3.5 h-3.5 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Durasi Video: {form.videoDuration}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/mp4,.mp4"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  {form.videoIntroUrl ? "Ganti File Video (.mp4)" : "Pilih File Video (.mp4)"}
                </button>
                {form.videoIntroUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:text-red-600 transition cursor-pointer"
                  >
                    Hapus Video
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sub-bagian Upload Thumbnail Video (JPG / PNG) */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
              <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-purple-100 shrink-0 border border-purple-200 flex items-center justify-center">
                {form.videoThumbnail ? (
                  <Image
                    src={form.videoThumbnail}
                    alt="Thumbnail Video"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-1 p-2 text-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] text-gray-500">Tanpa Cover</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Foto Cover / Thumbnail Video (JPG / PNG)
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Foto pratinjau yang ditampilkan sebelum klien memutar video (opsional).
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                  <input
                    ref={thumbnailFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => thumbnailFileInputRef.current?.click()}
                    className="rounded-full border border-gray-300 bg-white hover:bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    {form.videoThumbnail ? "Ganti Foto Cover" : "Unggah Foto Cover"}
                  </button>
                  {form.videoThumbnail && (
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition cursor-pointer"
                    >
                      Hapus Cover
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 6. BOTTOM ACTION BAR (TOMBOL SIMPAN UTAMA) ── */}
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-3xl bg-white/95 backdrop-blur-md border border-gray-200/80 p-4 sm:p-5 shadow-xl">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-gray-800">
              Perubahan belum disimpan otomatis
            </p>
            <p className="text-[11px] text-gray-400">
              Pastikan Anda mengklik tombol Simpan setelah melakukan penyesuaian.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                if (role === "admin") {
                  router.push("/admin")
                } else {
                  router.push("/psikolog-web/beranda" as any)
                }
              }}
              className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full px-7 py-2.5 text-xs font-bold transition-all shadow-sm ${
                isSaving
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 hover:shadow-md active:scale-95 cursor-pointer"
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── 7. MODAL PRATINJAU POV KLIEN (REPLIKA 1:1 DETAIL PSIKOLOG PUBLIK) ── */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Header Modal */}
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-md px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-[#561269]">
                    Pratinjau Tampilan Profil (POV Klien Empathika)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Tampilan langsung sama persis seperti yang dilihat oleh klien di halaman publik Empathika
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false)
                  setIsPlayingVideoPreview(false)
                }}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Isi Konten Pratinjau POV Klien */}
            <div className="bg-white">
              <div className="w-full px-6 sm:px-10 pt-6 pb-8 space-y-8">
                {/* Header Profil & Video Intro di Bagian Atas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Kolom Kiri: Foto Profil & Info Pokok */}
                  <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 bg-[#D4B2E8] flex items-center justify-center shadow-inner border-2 border-purple-100">
                      {form.foto ? (
                        <Image
                          src={form.foto}
                          alt={form.nama}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-[#561269] font-bold text-4xl select-none">
                          {initials}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-[#561269] bg-purple-100 rounded-full">
                          {form.spesialisasi || "Psikolog"}
                        </span>
                        {form.instagram && (
                          <span className="inline-block px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-200">
                            {form.instagram}
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#561269] tracking-tight leading-snug">
                        {form.nama || "Nama Tenaga Ahli"}
                      </h2>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                        <p>
                          Jumlah sesi: <span className="font-semibold text-gray-900">0 Sesi</span>
                        </p>
                        {form.kategoriProfesi === "psikolog" && form.noStr && (
                          <>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <p>
                              No. STR: <span className="font-semibold text-[#561269] font-mono">{form.noStr}</span>
                            </p>
                          </>
                        )}
                        {form.kategoriProfesi === "psikolog" && form.noSipp && (
                          <>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <p>
                              No. SIPP: <span className="font-semibold text-[#561269] font-mono">{form.noSipp}</span>
                            </p>
                          </>
                        )}
                        {form.kategoriProfesi === "psikolog" && form.noSilp && (
                          <>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <p>
                              No. SILP: <span className="font-semibold text-[#561269] font-mono">{form.noSilp}</span>
                            </p>
                          </>
                        )}
                      </div>

                      {/* Quote / Prinsip Diri */}
                      {form.quote && form.quote.trim() ? (
                        <div className="mt-3 bg-[#FAF5FD] border-l-4 border-[#561269] p-3.5 sm:p-4 rounded-r-2xl text-left shadow-2xs">
                          <p className="text-gray-800 text-xs sm:text-sm italic leading-relaxed">
                            &ldquo;{stripOuterQuotes(form.quote)}&rdquo;
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Kolom Kanan: Video Perkenalan Diri (Video Greeting) */}
                  <div className="lg:col-span-5 w-full">
                    <div className="relative rounded-3xl overflow-hidden shadow-lg border border-purple-100 bg-[#3B074B] aspect-video flex items-center justify-center group">
                      {isPlayingVideoPreview && form.videoIntroUrl ? (
                        <video
                          src={form.videoIntroUrl}
                          poster={form.videoThumbnail || undefined}
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                        >
                          Browser Anda tidak mendukung tag video.
                        </video>
                      ) : (
                        <>
                          {form.videoThumbnail || form.foto ? (
                            <Image
                              src={form.videoThumbnail || form.foto!}
                              alt="Thumbnail Video Perkenalan"
                              fill
                              className="object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-300"
                            />
                          ) : null}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span>Video Perkenalan</span>
                          </div>

                          {form.videoDuration && (
                            <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[11px] font-mono">
                              {form.videoDuration}
                            </div>
                          )}

                          {form.videoIntroUrl ? (
                            <button
                              type="button"
                              onClick={() => setIsPlayingVideoPreview(true)}
                              className="relative z-10 flex items-center gap-3 bg-white/90 hover:bg-white text-[#561269] px-6 py-3 rounded-full font-bold text-sm shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#561269] text-white flex items-center justify-center pl-0.5">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                              <span>Tonton Video Perkenalan</span>
                            </button>
                          ) : (
                            <div className="relative z-10 text-center p-4 text-white">
                              <p className="text-xs font-semibold">Belum Ada Video Perkenalan</p>
                              <p className="text-[10px] text-gray-300 mt-0.5">Unggah file MP4 di form edit profil</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Perkenalan Profil & Bio */}
                <section className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-[#561269] uppercase tracking-wider">
                    PERKENALAN PROFIL
                  </h3>
                  <div className="space-y-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                    {form.bio && form.bio.trim() ? (
                      form.bio
                        .split(/\n\s*\n/)
                        .filter(Boolean)
                        .map((paragraf, idx) => (
                          <p key={idx} className="whitespace-pre-line">
                            {paragraf}
                          </p>
                        ))
                    ) : (
                      <p className="whitespace-pre-line text-gray-400 italic">
                        Perkenalan profil belum dicantumkan.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 space-y-2">
                    {form.pendidikanText && (
                      <div className="text-sm sm:text-base text-gray-600 font-semibold">
                        <span>Pendidikan / Institusi:</span>
                        <div className="font-normal text-gray-800 whitespace-pre-wrap leading-relaxed mt-1">
                          {form.pendidikanText}
                        </div>
                      </div>
                    )}
                    {form.kategoriProfesi === "psikolog" && (form.noStr || form.noSipp) && (
                      <p className="text-sm sm:text-base text-gray-600 font-semibold">
                        Nomor Izin Praktik:{" "}
                        <span className="font-normal text-gray-800">
                          {form.noStr && `STR: ${form.noStr}`}
                          {form.noStr && form.noSipp && " | "}
                          {form.noSipp && `SIPP: ${form.noSipp}`}
                        </span>
                      </p>
                    )}
                  </div>
                </section>

                {/* Keahlian Konseling */}
                <section className="space-y-3 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#561269] uppercase tracking-wider">
                    KEAHLIAN
                  </h3>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {form.keahlian && form.keahlian.length > 0 ? (
                      form.keahlian.map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-50 text-gray-800 text-sm font-medium border border-gray-200/80 shadow-2xs hover:bg-purple-50/60 hover:border-purple-200 transition-colors"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Informasi keahlian belum tersedia.</p>
                    )}
                  </div>
                </section>

                {/* Jadwal Praktik Info */}
                <section className="space-y-3 pt-2 pb-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#561269] uppercase tracking-wider">
                    JADWAL PRAKTEK
                  </h3>
                  <div className="flex flex-wrap gap-3.5">
                    <div className="bg-[#FAF5FD] border border-purple-200/80 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-gray-800">
                      <span className="font-semibold text-[#561269]">Online & Offline:</span> Jadwal dibuka fleksibel sesuai ketersediaan slot
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="sticky bottom-0 z-30 border-t border-gray-100 bg-gray-50 px-6 py-3.5 text-right flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Mode Pratinjau POV Klien &bull; Perubahan belum otomatis tersimpan
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false)
                  setIsPlayingVideoPreview(false)
                }}
                className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
