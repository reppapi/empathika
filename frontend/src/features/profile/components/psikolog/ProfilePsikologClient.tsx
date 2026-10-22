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
  // Paragraf profil lengkap baru
  const [newParagraph, setNewParagraph] = useState("")

  // Status notifikasi simpan
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [isPlayingVideoPreview, setIsPlayingVideoPreview] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoFileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
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

  // Tambah & Hapus Paragraf Profil Lengkap (Psikolog)
  const handleAddParagraph = () => {
    if (!newParagraph.trim()) return
    setForm((prev) => ({
      ...prev,
      profilLengkap: [...(prev.profilLengkap || []), newParagraph.trim()],
    }))
    setNewParagraph("")
  }

  const handleRemoveParagraph = (index: number) => {
    setForm((prev) => ({
      ...prev,
      profilLengkap: (prev.profilLengkap || []).filter((_, i) => i !== index),
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

      // 3. Siapkan payload untuk API updateMyProfile
      const payload: Record<string, any> = {
        nama: form.nama,
        email: form.email,
        no_telepon: form.noTelepon,
        spesialisasi: form.spesialisasi,
        no_str: form.noStr,
        no_sipp: form.noSipp,
        no_silp: (form as any).noSilp || undefined,
        foto: fotoUrl,
        quote: form.quote,
        instagram: form.instagram,
        keahlian: form.keahlian,
        pendidikan: form.pendidikanText,
        profil_lengkap: form.profilLengkap,
        video_intro_url: videoUrl,
        video_duration: form.videoDuration,
      }

      if (form.password && form.password.trim()) {
        payload.password = form.password.trim()
      }

      // 4. Kirim ke backend
      try {
        await psikologService.updateMyProfile(payload)
      } catch (apiErr) {
        console.warn("Peringatan saat update profil ke backend:", apiErr)
      }

      // 5. Update local state & shared storage sebagai cadangan
      const updatedForm = { ...form, foto: fotoUrl, videoIntroUrl: videoUrl, password: "" }
      setPsikologData(updatedForm)
      setForm(updatedForm)
      setSelectedPhotoFile(null)
      setSelectedVideoFile(null)

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

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Riwayat Pendidikan
              </label>
              <input
                type="text"
                name="pendidikanText"
                value={form.pendidikanText || ""}
                onChange={handleInputChange}
                placeholder="Contoh: S2 Psikologi - Universitas Indonesia"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
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
              <input
                type="password"
                name="password"
                value={form.password || ""}
                onChange={handleInputChange}
                placeholder="Masukkan kata sandi baru (kosongkan jika tidak diubah)"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
              />
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
        </div>

        {/* 6. KOLOM PROFIL LENGKAP & PRAKATA DIRI (NARATIF) */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Profil Lengkap & Prakata Klien
            </h3>
            <p className="text-xs text-gray-500">
              Naratif paragraf yang muncul pada bagian &ldquo;PROFIL PSIKOLOG&rdquo; di halaman profil publik klien.
            </p>
          </div>

          <div className="space-y-3">
            {(form.profilLengkap || []).map((paragraf, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl bg-gray-50 border border-gray-100 p-3.5 text-xs text-gray-700 leading-relaxed pr-10"
              >
                <p>{paragraf}</p>
                <button
                  type="button"
                  onClick={() => handleRemoveParagraph(idx)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 opacity-70 group-hover:opacity-100 transition cursor-pointer"
                  title="Hapus Paragraf"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Input Tambah Paragraf */}
          <div className="space-y-2 pt-2">
            <textarea
              rows={3}
              value={newParagraph}
              onChange={(e) => setNewParagraph(e.target.value)}
              placeholder="Tulis naratif atau paragraf prakata baru untuk klien..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-800 focus:border-[#561269] focus:outline-none transition resize-none"
            />
            <button
              type="button"
              onClick={handleAddParagraph}
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm cursor-pointer"
            >
              + Tambah Paragraf ke Profil
            </button>
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
                <h4 className="text-sm font-bold text-[#561269]">
                  Pratinjau Tampilan Profil (POV Klien Empathika)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false)
                  setIsPlayingVideoPreview(false)
                }}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Isi Konten Replika DetailPsikologContent */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Header Profil & Video */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Kolom Kiri: Foto Profil & Info */}
                <div className="md:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shrink-0 bg-[#D4B2E8] flex items-center justify-center shadow-inner border-2 border-purple-100">
                    {form.foto ? (
                      <Image
                        src={form.foto}
                        alt={form.nama}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[#561269] font-bold text-3xl select-none">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="inline-block px-3 py-1 text-[11px] font-semibold text-[#561269] bg-purple-100 rounded-full">
                        {form.spesialisasi || "Psikolog"}
                      </span>
                      {form.instagram && (
                        <span className="inline-block px-3 py-1 text-[11px] font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-200">
                          {form.instagram}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#561269] tracking-tight">
                      {form.nama}
                    </h2>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 text-xs text-gray-600">
                      {form.noStr && (
                        <p>
                          STR: <span className="font-semibold text-[#561269] font-mono">{form.noStr}</span>
                        </p>
                      )}
                      {form.noSipp && (
                        <p>
                          SIPP: <span className="font-semibold text-[#561269] font-mono">{form.noSipp}</span>
                        </p>
                      )}
                    </div>

                    {form.quote && (
                      <div className="mt-2 bg-[#FAF5FD] border-l-4 border-[#561269] p-3 rounded-r-2xl text-left">
                        <p className="text-gray-800 text-xs italic">
                          &ldquo;{form.quote}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kolom Kanan: Video Perkenalan */}
                <div className="md:col-span-5 w-full">
                  <div className="relative rounded-2xl overflow-hidden shadow-md border border-purple-100 bg-[#3B074B] aspect-video flex items-center justify-center">
                    {isPlayingVideoPreview || form.videoIntroUrl ? (
                      <video
                        src={form.videoIntroUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                        controls
                        autoPlay={isPlayingVideoPreview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        {form.foto ? (
                          <Image
                            src={form.foto}
                            alt="Foto Tenaga Ahli"
                            fill
                            className="object-cover opacity-60"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span>Video Perkenalan</span>
                        </div>
                        <div className="text-center p-4 z-10 text-white">
                          <p className="text-xs font-semibold">Belum Ada Video Perkenalan</p>
                          <p className="text-[10px] text-gray-300">Unggah file MP4 di form edit profil</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Bagian Profil */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#561269] uppercase tracking-wider">
                  PROFIL PSIKOLOG
                </h4>
                <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {(form.profilLengkap && form.profilLengkap.length > 0) ? (
                    form.profilLengkap.map((p, i) => <p key={i}>{p}</p>)
                  ) : (
                    <p className="text-gray-400 italic">Belum ada prakata atau deskripsi profil yang ditambahkan.</p>
                  )}
                </div>
                {form.pendidikanText && (
                  <p className="text-xs text-gray-500 pt-1">
                    <span className="font-semibold text-gray-700">Pendidikan: </span>
                    {form.pendidikanText}
                  </p>
                )}
              </div>

              {/* Bagian Keahlian */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#561269] uppercase tracking-wider">
                  KEAHLIAN PSIKOLOG
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(form.keahlian || []).map((k, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF5FD] border border-purple-200/80 text-[11px] font-medium text-[#561269]"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3.5 text-right">
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false)
                  setIsPlayingVideoPreview(false)
                }}
                className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
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
