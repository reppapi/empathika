"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { eventService, EventDokumentasiApi } from "@/services/event.service"
import { uploadService } from "@/services/upload.service"
import { ArrowLeft, Upload, X, Loader2, ImagePlus, AlertCircle, Calendar } from "lucide-react"

import { EVENT_LIMITS } from "../../constants/eventConstants"
interface AdminDokumentasiFormClientProps {
  id?: string // Jika ada id, mode EDIT. Jika tidak, mode TAMBAH.
}

interface PhotoItem {
  id: string // temporary client id
  url: string // url foto server
  file?: File // file jika baru diupload
  isUploading?: boolean
}

export default function AdminDokumentasiFormClient({ id }: AdminDokumentasiFormClientProps) {
  const router = useRouter()
  const isEdit = Boolean(id)

  const [judul, setJudul] = useState("")
  const [tanggal, setTanggal] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [photos, setPhotos] = useState<PhotoItem[]>([])

  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Ambil data jika mode EDIT
  useEffect(() => {
    if (!id) return

    async function fetchDetail() {
      try {
        setInitialLoading(true)
        const res = await eventService.getDokumentasiById(id!)
        if (res?.data) {
          const d = res.data
          setJudul(d.judul || "")
          // format tanggal YYYY-MM-DD
          const tglStr = d.tanggal ? d.tanggal.split("T")[0] : ""
          setTanggal(tglStr)
          setDeskripsi(d.deskripsi || "")
          if (Array.isArray(d.foto)) {
            setPhotos(
              d.foto.map((f, idx) => ({
                id: f.id || `photo-${idx}-${Date.now()}`,
                url: f.foto_url,
              }))
            )
          }
        }
      } catch (err: any) {
        console.error("Gagal memuat detail dokumentasi:", err)
        setErrorMsg("Gagal memuat data dokumentasi event.")
      } finally {
        setInitialLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  // Handler Pilih Foto
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Reset input agar bisa pilih ulang file yang sama jika dihapus
    e.target.value = ""

    const allowedMime = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const invalidFiles = files.filter((f) => !allowedMime.includes(f.type))
    if (invalidFiles.length > 0) {
      alert("Hanya file gambar (JPG, JPEG, PNG, WEBP) yang diperbolehkan.")
      return
    }

    // Cek batas total foto maksimal 10
    const availableSlots = EVENT_LIMITS.MAX_DOKUMENTASI_FOTO - photos.length
    if (files.length > availableSlots) {
      alert(
        `Total foto melebihi batas maksimal ${EVENT_LIMITS.MAX_DOKUMENTASI_FOTO} foto! Anda saat ini memiliki ${photos.length} foto, hanya bisa menambah ${Math.max(
          0,
          availableSlots
        )} foto lagi.`
      )
      return
    }

    setUploadingFiles(true)
    setErrorMsg(null)

    // Upload setiap file ke backend via uploadService.uploadImage
    // Layanan ini otomatis melewati fungsi/middleware kompresi gambar standar
    const newItems: PhotoItem[] = []
    try {
      for (const file of files) {
        const uploadedUrl = await uploadService.uploadImage(file, "event")
        newItems.push({
          id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          url: uploadedUrl,
        })
      }
      setPhotos((prev) => [...prev, ...newItems])
    } catch (err: any) {
      console.error("Gagal upload foto:", err)
      alert("Gagal mengunggah satu atau lebih foto. Pastikan ukuran file sesuai.")
    } finally {
      setUploadingFiles(false)
    }
  }

  // Hapus foto satu per satu
  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!judul.trim()) {
      setErrorMsg("Judul event wajib diisi.")
      return
    }
    if (!tanggal) {
      setErrorMsg("Tanggal pelaksanaan wajib diisi.")
      return
    }
    if (!deskripsi.trim()) {
      setErrorMsg("Deskripsi wajib diisi.")
      return
    }
    if (photos.length > 10) {
      setErrorMsg("Jumlah foto maksimal 10 foto.")
      return
    }

    try {
      setSubmitting(true)
      setErrorMsg(null)

      const payload = {
        judul: judul.trim(),
        tanggal,
        deskripsi: deskripsi.trim(),
        foto: photos.map((p, idx) => ({
          foto_url: p.url,
          urutan: idx,
        })),
      }

      if (isEdit && id) {
        await eventService.updateDokumentasi(id, payload)
      } else {
        await eventService.createDokumentasi(payload)
      }

      router.push("/admin/event?section=selesai")
      router.refresh()
    } catch (err: any) {
      console.error("Gagal menyimpan dokumentasi:", err)
      const msg = err.response?.data?.message || err.message || "Gagal menyimpan data."
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-poppins">
        <Loader2 className="w-8 h-8 text-[#561269] animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Memuat formulir dokumentasi...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto font-poppins pb-24">
      {/* Tombol Kembali & Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => router.push("/admin/event?section=selesai")}
          className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#561269]">
            {isEdit ? "Edit Dokumentasi Event" : "Tambah Dokumentasi Event Selesai"}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Dokumentasikan kegiatan dan arsip foto acara yang telah sukses diselenggarakan.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Field 1: Judul Event */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Judul Event <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-900 transition-all placeholder:text-gray-400 font-medium"
          />
        </div>

        {/* Field 2: Tanggal Pelaksanaan */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Tanggal Pelaksanaan <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full sm:w-72">
            <input
              ref={dateInputRef}
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-4 py-3 pr-11 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-900 transition-all font-medium cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <button
              type="button"
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker?.()
                } catch {
                  dateInputRef.current?.focus()
                }
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#561269] transition-colors p-1 cursor-pointer"
              title="Pilih tanggal dari kalender"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Field 3: Deskripsi */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Deskripsi Acara <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Tuliskan rangkuman kegiatan, pembicara, antusiasme peserta, atau dampak dari acara yang telah diselenggarakan..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm text-gray-900 transition-all placeholder:text-gray-400 font-medium resize-y"
          />
        </div>

        {/* Field 4: Foto Dokumentasi (Maksimal 10) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Foto Dokumentasi
            </label>
            <span
              className={`text-xs font-bold ${
                photos.length >= 10 ? "text-amber-600" : "text-gray-500"
              }`}
            >
              {photos.length} / 10 Foto
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Pilih foto-foto momen terbaik kegiatan (maksimal 10 foto, format JPG, PNG, atau WEBP). Foto pertama akan menjadi sampul utama (thumbnail).
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Grid Preview Foto */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative group aspect-video sm:aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm"
              >
                <Image
                  src={photo.url}
                  alt={`Dokumentasi ${idx + 1}`}
                  fill
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105"
                />

                {/* Badge Foto Utama */}
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-[#561269] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                    Sampul
                  </span>
                )}

                {/* Nomor Urut */}
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  #{idx + 1}
                </span>

                {/* Tombol Hapus */}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md cursor-pointer"
                  title="Hapus foto ini"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Tombol Tambah Foto */}
            {photos.length < 10 && (
              <button
                type="button"
                disabled={uploadingFiles}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video sm:aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#561269] bg-gray-50 hover:bg-purple-50/40 text-gray-500 hover:text-[#561269] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer p-4 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {uploadingFiles ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-[#561269]" />
                    <span className="text-[11px] font-bold text-[#561269] text-center">
                      Mengompres &amp; Mengunggah...
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white group-hover:bg-purple-100 flex items-center justify-center shadow-sm text-gray-500 group-hover:text-[#561269] transition-colors">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-center">Tambah Foto</span>
                    <span className="text-[10px] text-gray-400 text-center">
                      Maksimal {10 - photos.length} lagi
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={submitting || uploadingFiles}
            onClick={() => router.push("/admin/event?section=selesai")}
            className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingFiles}
            className="px-8 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>{isEdit ? "Simpan Perubahan" : "Simpan Dokumentasi"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

