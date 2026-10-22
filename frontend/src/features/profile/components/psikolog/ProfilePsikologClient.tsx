"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { AdminProfileData, RoleType } from "../../types"
import { DEFAULT_ADMIN, DEFAULT_PSIKOLOG } from "../../data/profileData"
import { psikologService } from "@/services/psikolog.service"
import apiClient from "@/lib/axios"

export { type AdminProfileData, type RoleType }

interface ProfileClientProps {
  role?: RoleType
}

export default function ProfilePsikologClient({
  role = "psikolog",
}: ProfileClientProps) {
  const router = useRouter()
  const [adminData, setAdminData] = useState<AdminProfileData>(DEFAULT_ADMIN)
  const [psikologData, setPsikologData] = useState<AdminProfileData>(DEFAULT_PSIKOLOG)

  // Form input lokal berdasarkan role aktif
  const currentData = role === "admin" ? adminData : psikologData
  const [form, setForm] = useState<AdminProfileData>(currentData)

  // Tag keahlian baru
  const [newSkill, setNewSkill] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Status notifikasi simpan
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [isPlayingVideoPreview, setIsPlayingVideoPreview] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoFileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (role === "admin") {
      setForm(adminData)
    } else {
      // 1. Ambil dari API resmi backend psikolog
      psikologService
        .getMyProfile()
        .then((res: any) => {
          if (res) {
            const mapped: AdminProfileData = {
              nama: res.nama_gelar || res.account?.nama || DEFAULT_PSIKOLOG.nama,
              email: res.account?.email || DEFAULT_PSIKOLOG.email,
              noTelepon: res.account?.no_telepon || DEFAULT_PSIKOLOG.noTelepon,
              bio: res.bio || res.account?.bio || "",
              foto: res.foto || res.account?.foto || null,
              kategoriProfesi: res.kategori?.toLowerCase().includes("peer")
                ? "peer-konselor"
                : res.kategori?.toLowerCase().includes("konselor")
                ? "konselor"
                : "psikolog",
              spesialisasi: res.spesialisasi?.nama || res.spesialisasi || "",
              noStr: res.no_str || "",
              noSipp: res.no_sipp || "",
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
            if (res.no_silp) {
              (mapped as any).noSilp = res.no_silp
            }
            setPsikologData(mapped)
            setForm(mapped)
            if (res.id) localStorage.setItem("active_psikolog_id", res.id)
            if (mapped.nama) localStorage.setItem("active_psikolog_name", mapped.nama)
            return
          }
        })
        .catch(() => {
          // 2. Fallback ke shared storage tenaga ahli jika backend belum terkoneksi
          try {
            const saved = localStorage.getItem("empathika_tenaga_ahli_data")
            if (saved) {
              const list = JSON.parse(saved)
              const savedId = localStorage.getItem("active_psikolog_id")
              const savedName = localStorage.getItem("active_psikolog_name")
              const found =
                (savedId ? list.find((d: any) => d.id === savedId) : null) ||
                (savedName ? list.find((d: any) => d.nama === savedName) : null) ||
                list.find((d: any) => d.id === "1" || d.email === "putriqoida@empathika.com") ||
                list[0]
              if (found) {
                const mapped: AdminProfileData = {
                  nama: found.nama,
                  email: found.email,
                  noTelepon: found.noTelepon,
                  bio: found.bio,
                  foto: found.foto,
                  kategoriProfesi: found.kategori,
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
                setPsikologData(mapped)
                setForm(mapped)
                return
              }
            }
          } catch {}
          setForm(psikologData)
        })
    }
  }, [role, adminData])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Upload Foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPhotoFile(file)
      const url = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, foto: url }))
    }
  }

  // Hapus Foto
  const handleRemovePhoto = () => {
    setSelectedPhotoFile(null)
    setForm((prev) => ({ ...prev, foto: null }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Upload Video File (.mp4 langsung, max durasi 10 menit)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setVideoUploadError(null)

    // Validasi tipe file mp4
    if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4")) {
      setVideoUploadError("Hanya file video berformat .mp4 yang diizinkan.")
      if (videoFileInputRef.current) videoFileInputRef.current.value = ""
      return
    }

    const objectUrl = URL.createObjectURL(file)

    // Buat elemen video sementara untuk mengecek durasi
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

      // Format durasi MM:SS
      const mins = Math.floor(durationSeconds / 60)
      const secs = Math.floor(durationSeconds % 60)
      const formattedDuration = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

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

  // Hapus Video
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

  // Upload Thumbnail Video (JPG/PNG foto)
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedThumbnailFile(file)
      const url = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, videoThumbnail: url }))
    }
  }

  // Hapus Thumbnail Video
  const handleRemoveThumbnail = () => {
    setSelectedThumbnailFile(null)
    setForm((prev) => ({ ...prev, videoThumbnail: "" }))
    if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = ""
  }

  // Tambah & Hapus Keahlian (Psikolog)
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

  // Submit / Simpan
  const handleSave = async (e: React.FormEvent) => {
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

      // 1. Upload file foto jika pengguna memilih file baru
      let fotoUrl = form.foto
      if (selectedPhotoFile) {
        const photoFormData = new FormData()
        photoFormData.append("file", selectedPhotoFile)
        try {
          const resPhoto = await apiClient.post("/upload/image", photoFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          if (resPhoto.data?.data?.url) {
            fotoUrl = resPhoto.data.data.url
          }
        } catch (uploadErr) {
          console.warn("Gagal upload foto ke backend, menggunakan foto lama/data lokal:", uploadErr)
        }
      }

      // 2. Upload file video MP4 jika pengguna memilih file baru
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

      // 3. Upload file thumbnail video (JPG/PNG) jika pengguna memilih thumbnail baru
      let thumbnailUrl = form.videoThumbnail
      if (selectedThumbnailFile) {
        const thumbFormData = new FormData()
        thumbFormData.append("file", selectedThumbnailFile)
        try {
          const resThumb = await apiClient.post("/upload/image", thumbFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          if (resThumb.data?.data?.url) {
            thumbnailUrl = resThumb.data.data.url
          }
        } catch (uploadErr) {
          console.warn("Gagal upload thumbnail video ke backend:", uploadErr)
        }
      }

      // 4. Siapkan payload untuk API updateMyProfile
      const payload: Record<string, any> = {
        nama: form.nama,
        email: form.email,
        no_telepon: form.noTelepon,
        bio: form.bio,
        spesialisasi: form.spesialisasi,
        no_str: form.noStr,
        no_sipp: form.noSipp,
        no_silp: (form as any).noSilp || undefined,
        foto: fotoUrl,
        quote: form.quote,
        instagram: form.instagram,
        keahlian: form.keahlian,
        pendidikan: form.pendidikanText,
        video_intro_url: videoUrl,
        video_thumbnail: thumbnailUrl,
        video_duration: form.videoDuration,
      }

      if (form.password && form.password.trim()) {
        payload.password = form.password.trim()
      }

      // 5. Kirim ke backend
      try {
        await psikologService.updateMyProfile(payload)
      } catch (apiErr) {
        console.warn("Peringatan saat update profil ke backend:", apiErr)
      }

      // 6. Update local state & shared storage sebagai cadangan
      const updatedForm = {
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
        if (saved) {
          const list = JSON.parse(saved)
          const updated = list.map((item: any) => {
            if (item.id === "1" || item.email === form.email) {
              return {
                ...item,
                nama: form.nama,
                email: form.email,
                noTelepon: form.noTelepon,
                bio: form.bio,
                foto: fotoUrl,
                kategori: form.kategoriProfesi || item.kategori,
                spesialisasi: form.spesialisasi || item.spesialisasi,
                noStr: form.noStr,
                noSipp: form.noSipp,
                noSilp: (form as any).noSilp,
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
          localStorage.setItem("empathika_tenaga_ahli_data", JSON.stringify(updated))
        }
      } catch {}

      setToastMessage("Profil Psikolog berhasil diperbarui!")
      setShowToast(true)

      // 6. Langsung redirect ke halaman beranda psikolog sesuai instruksi
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
      {/* Toast Alert */}
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

      {/* Header Halaman */}
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

      {/* Form Utama */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. KOLOM PROFIL TENAGA AHLI */}
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
            {/* Quick Preview Client POV Button */}
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

          {/* Foto Profil Tenaga Ahli */}
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
                <p className="text-[11px] text-gray-400">
                  Format gambar JPG, PNG, atau WEBP rasio 1:1. Maksimal ukuran file 2MB.
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

        {/* 2. KOLOM AKUN LOGIN */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Akun Login & Pengaturan Keamanan
            </h3>
            <p className="text-xs text-gray-500">
              Kelola alamat email login dan kata sandi akun psikolog Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Login <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                required
                placeholder="contoh: psikolog@gmail.com"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 transition focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Ubah Kata Sandi (Opsional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password || ""}
                  onChange={handleInputChange}
                  placeholder="Masukkan kata sandi baru (kosongkan jika tidak diubah)"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-[#561269] transition cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. KOLOM LEGALITAS PRAKTIK */}
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
                value={(form as any).noSilp || ""}
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

        {/* 4. KOLOM TOPIK & KEAHLIAN KONSELING */}
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

        {/* 5. KOLOM VIDEO PERKENALAN (UPLOAD LANGSUNG MP4 DENGAN BATAS 10 MENIT) */}
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

            {/* Kontrol Upload File MP4 Langsung */}
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
              {/* Box Thumbnail Image Preview */}
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

              {/* Kontrol Upload Thumbnail */}
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



        {/* BOTTOM ACTION BAR */}
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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

      {/* MODAL POPUP: LIVE PREVIEW CLIENT POV (SEPERTI DI DETAIL PSIKOLOG POV KLIEN) */}
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

            {/* Isi Konten Replika DetailPsikologContent (tanpa hero banner & footer CTA) */}
            <div className="bg-white">
              {/* Main Content Container */}
              <div className="w-full px-6 sm:px-10 pt-6 pb-8 space-y-8">
                {/* Header Profil & Video Intro di Bagian Atas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Kolom Kiri: Foto Profil & Info Pokok */}
                  <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    {/* Avatar Foto Bundar */}
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

                    {/* Nama, Status, Sesi, dan Quote di Samping Foto */}
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
                        {form.noStr && (
                          <>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <p>
                              No. STR: <span className="font-semibold text-[#561269] font-mono">{form.noStr}</span>
                            </p>
                          </>
                        )}
                        {form.noSipp && (
                          <>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <p>
                              No. SIPP: <span className="font-semibold text-[#561269] font-mono">{form.noSipp}</span>
                            </p>
                          </>
                        )}
                        {(form as any).noSilp && (
                          <>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <p>
                              No. SILP: <span className="font-semibold text-[#561269] font-mono">{(form as any).noSilp}</span>
                            </p>
                          </>
                        )}
                      </div>

                      {/* Quote / Prinsip Singkat Diri */}
                      {form.quote && (
                        <div className="mt-3 bg-[#FAF5FD] border-l-4 border-[#561269] p-3.5 sm:p-4 rounded-r-2xl text-left">
                          <p className="text-gray-800 text-xs sm:text-sm italic leading-relaxed">
                            &ldquo;{form.quote}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kolom Kanan: Video Perkenalan Diri (Video Greeting / Intro) */}
                  <div className="lg:col-span-5 w-full">
                    <div className="relative rounded-3xl overflow-hidden shadow-lg border border-purple-100 bg-[#3B074B] aspect-video flex items-center justify-center group">
                      {isPlayingVideoPreview ? (
                        <video
                          src={form.videoIntroUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                          poster={form.videoThumbnail || undefined}
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                        >
                          Browser Anda tidak mendukung tag video.
                        </video>
                      ) : (
                        <>
                          {/* Thumbnail Video */}
                          {form.videoThumbnail || form.foto ? (
                            <Image
                              src={form.videoThumbnail || form.foto!}
                              alt="Thumbnail Video Perkenalan"
                              fill
                              className="object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-300"
                            />
                          ) : null}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                          {/* Badge Video Intro */}
                          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span>Video Perkenalan</span>
                          </div>

                          {/* Durasi */}
                          {form.videoDuration && (
                            <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[11px] font-mono">
                              {form.videoDuration}
                            </div>
                          )}

                          {/* Tombol Play Interaktif */}
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

                {/* Garis Horizontal Tipis */}
                <hr className="border-gray-200" />

                {/* 3. PROFIL PSIKOLOG / PERKENALAN PROFIL */}
                <section className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-[#561269] uppercase tracking-wider">
                    PERKENALAN PROFIL
                  </h3>
                  <div className="space-y-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                    <p className="whitespace-pre-line">
                      {form.bio || "Perkenalan profil belum dicantumkan."}
                    </p>
                  </div>

                  {/* Pendidikan & Lisensi */}
                  <div className="pt-2 space-y-2">
                    {form.pendidikanText && (
                      <div className="text-sm sm:text-base text-gray-600 font-semibold">
                        <span>Pendidikan / Institusi:</span>
                        <div className="font-normal text-gray-800 whitespace-pre-wrap leading-relaxed mt-1">
                          {form.pendidikanText}
                        </div>
                      </div>
                    )}
                    {(form.noStr || form.noSipp) && (
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

                {/* 4. KEAHLIAN PSIKOLOG (Area of Expertise) */}
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

                {/* 5. JADWAL PRAKTEK (Mockup Info Klien) */}
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
