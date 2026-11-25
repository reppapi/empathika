"use client"

import { useState, useEffect, useRef } from "react"
import {
  BannerPromoItem,
  DefaultSlideConfig,
  DEFAULT_HERO_SLIDE,
  getStoredBanners,
  getLocalDateString,
} from "../../types/banner"
import { bannerService } from "@/services/banner.service"
import { processAndUploadImage } from "@/lib/imageCompressor"
import { ActionButtonEdit, ActionButtonDelete } from "@/components/shared/TableActionButtons"

export function CardBannerPromoAdmin() {
  const [banners, setBanners] = useState<BannerPromoItem[]>([])
  const [defaultSlide, setDefaultSlide] = useState<DefaultSlideConfig>(DEFAULT_HERO_SLIDE)
  const [isMounted, setIsMounted] = useState(false)
  const [isEditingDefault, setIsEditingDefault] = useState(false)
  const [tempDefaultSlide, setTempDefaultSlide] = useState<DefaultSlideConfig>(DEFAULT_HERO_SLIDE)
  const [isSavingDefault, setIsSavingDefault] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // State Form Modal / Tambah / Edit
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // State Form Input (Nama Banner/Iklan, Gambar, Link Tujuan, Tanggal & Status)
  const [nama, setNama] = useState("")
  const [gambar, setGambar] = useState("")
  const [linkTujuan, setLinkTujuan] = useState("")
  const [aktif, setAktif] = useState(true)
  const [tanggalMulai, setTanggalMulai] = useState("")
  const [tanggalBerakhir, setTanggalBerakhir] = useState("")

  // Load data awal dari backend dengan fallback ke storage (hanya saat mount awal)
  useEffect(() => {
    setIsMounted(true)
    const loadData = async () => {
      // 1. Ambil data lokal terlebih dahulu agar instant
      const local = getStoredBanners()
      setBanners(local)

      // 2. Sinkronkan dengan data backend admin
      try {
        const res = await bannerService.getAdmin()
        if (res && Array.isArray(res.promoBanners)) {
          setBanners(res.promoBanners)
        }
        if (res && res.defaultSlide) {
          setDefaultSlide(res.defaultSlide)
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data banner dari server:", err)
      }
    }
    loadData()
  }, [])

  const resetForm = () => {
    setNama("")
    setGambar("")
    setLinkTujuan("")
    setAktif(true)
    setTanggalMulai("")
    setTanggalBerakhir("")
    setEditingId(null)
    setUploadError(null)
    setIsFormOpen(false)
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsEditingDefault(false)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (b: BannerPromoItem) => {
    setIsEditingDefault(false)
    setEditingId(b.id)
    setNama(b.nama || "")
    setGambar(b.gambar)
    setLinkTujuan(b.linkTujuan || "")
    setAktif(b.aktif)
    setTanggalMulai(b.tanggalMulai ? b.tanggalMulai.split("T")[0] : "")
    setTanggalBerakhir(b.tanggalBerakhir ? b.tanggalBerakhir.split("T")[0] : "")
    setUploadError(null)
    setIsFormOpen(true)
  }

  const handleOpenEditDefault = () => {
    setTempDefaultSlide(defaultSlide)
    resetForm()
    setIsEditingDefault(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    try {
      // 1. Coba upload via API server
      const res = await processAndUploadImage(file, "event")
      if (res?.url) {
        setGambar(res.url)
      } else {
        throw new Error("Gagal mendapatkan URL gambar")
      }
    } catch (err: any) {
      console.warn("Upload via server gagal, menggunakan pembacaan lokal DataURL sebagai fallback:", err)
      // 2. Fallback: Baca sebagai Data URL base64 sehingga tetap 100% bisa dipakai di development/lokal
      try {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setGambar(event.target.result as string)
            setUploadError(null)
          }
        }
        reader.readAsDataURL(file)
      } catch (readErr: any) {
        setUploadError("Gagal memproses gambar: " + (err?.message || "Format tidak didukung"))
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gambar) {
      alert("Harap unggah gambar banner promosi terlebih dahulu.")
      return
    }

    if (!linkTujuan.trim()) {
      alert("Harap isi link tujuan banner.")
      return
    }

    if (tanggalMulai && tanggalBerakhir && tanggalMulai > tanggalBerakhir) {
      alert("Tanggal mulai tidak boleh lebih besar dari tanggal berakhir.")
      return
    }

    setIsSaving(true)

    let updatedList: BannerPromoItem[] = []

    if (editingId) {
      updatedList = banners.map((item) =>
        item.id === editingId
          ? {
              ...item,
              nama: nama.trim() || null,
              judul: "",
              gambar,
              linkTujuan: linkTujuan.trim(),
              aktif,
              tanggalMulai: tanggalMulai || null,
              tanggalBerakhir: tanggalBerakhir || null,
            }
          : item
      )
    } else {
      const newBanner: BannerPromoItem = {
        id: "banner-" + Date.now(),
        nama: nama.trim() || null,
        judul: "",
        gambar,
        linkTujuan: linkTujuan.trim(),
        aktif,
        tanggalMulai: tanggalMulai || null,
        tanggalBerakhir: tanggalBerakhir || null,
        createdAt: new Date().toISOString(),
      }
      updatedList = [newBanner, ...banners]
    }

    try {
      const saved = await bannerService.save({ promoBanners: updatedList, defaultSlide })
      if (saved && Array.isArray(saved.promoBanners)) {
        setBanners(saved.promoBanners)
      } else {
        setBanners(updatedList)
      }
      resetForm()
    } catch {
      setBanners(updatedList)
      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus banner ini?")) {
      const updated = banners.filter((b) => b.id !== id)
      setBanners(updated)
      try {
        await bannerService.save({ promoBanners: updated, defaultSlide })
      } catch {}
    }
  }

  const handleSaveDefaultSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingDefault(true)
    try {
      setDefaultSlide(tempDefaultSlide)
      await bannerService.save({
        promoBanners: banners,
        defaultSlide: tempDefaultSlide,
      })
      setIsEditingDefault(false)
    } catch {
      alert("Gagal menyimpan slide default ke server.")
    } finally {
      setIsSavingDefault(false)
    }
  }

  const handleResetDefaultSlide = async () => {
    if (confirm("Reset slide utama ke teks bawaan Empathika?")) {
      setDefaultSlide(DEFAULT_HERO_SLIDE)
      setTempDefaultSlide(DEFAULT_HERO_SLIDE)
      await bannerService.save({
        promoBanners: banners,
        defaultSlide: DEFAULT_HERO_SLIDE,
      })
      setIsEditingDefault(false)
    }
  }

  if (!isMounted) return null

  return (
    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm transition-all">
      {/* Header Kartu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1.5">
            Banner Promosi Beranda (Hero Section)
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Kelola banner promosi layanan yang ada di Empathika
          </p>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2.5 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Banner Baru
          </button>
        )}
      </div>

      {/* Form Edit Slide Default (Jika Sedang Diedit dari Daftar) */}
      {isEditingDefault && (
        <div className="my-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/60 p-5 sm:p-6 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
              Edit Konten Slide Utama (Default)
            </h4>
            <button
              type="button"
              onClick={() => setIsEditingDefault(false)}
              className="text-xs text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
            >
              Tutup Form
            </button>
          </div>

          <form onSubmit={handleSaveDefaultSlide} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Judul Utama <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={tempDefaultSlide.title}
                onChange={(e) => setTempDefaultSlide({ ...tempDefaultSlide, title: e.target.value })}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Subjudul
              </label>
              <textarea
                rows={2}
                value={tempDefaultSlide.subtitle}
                onChange={(e) => setTempDefaultSlide({ ...tempDefaultSlide, subtitle: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Tautan Tombol
              </label>
              <input
                type="text"
                value={tempDefaultSlide.link}
                onChange={(e) => setTempDefaultSlide({ ...tempDefaultSlide, link: e.target.value })}
                placeholder="Contoh: /konseling"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/10"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleResetDefaultSlide}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                Reset ke Teks Bawaan
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingDefault(false)}
                  className="rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingDefault}
                  className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2 text-xs font-bold text-gray-950 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSavingDefault ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Form Input Banner (Jika Dibuka) */}
      {isFormOpen && (
        <div className="my-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/60 p-5 sm:p-6 transition-all">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
              {editingId ? "Edit Banner Promosi" : "Tambah Banner Promosi Baru"}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
            >
              Tutup Form
            </button>
          </div>

          <form onSubmit={handleSaveBanner} className="space-y-4">
            {/* 1. Upload Gambar / Banner */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Upload Gambar Banner <span className="text-rose-500">*</span>
              </label>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                {gambar ? (
                  <div className="relative group w-full sm:w-60 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gambar} alt="Preview Banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGambar("")}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                    >
                      Ganti Gambar
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-60 h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-white flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors group shrink-0"
                  >
                    <svg
                      className="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-1 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-[11px] font-bold text-gray-700 group-hover:text-[#561269]">
                      {isUploading ? "Mengunggah..." : "Klik untuk Pilih Gambar"}
                    </p>
                    <p className="text-[10px] text-gray-400">Rekomendasi 1920 × 610 px</p>
                  </div>
                )}

                <div className="flex-1 space-y-1.5 text-[11px] text-gray-500">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="font-semibold text-gray-700">Panduan Ukuran Banner:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-gray-500">
                    <li>Rekomendasi resolusi: <strong className="text-gray-800">1920 × 610 px</strong> (rasio lanskap lebar).</li>
                    <li>Pastikan teks/objek utama berada di tengah agar tidak terpotong di layar HP maupun laptop.</li>
                    <li>Format didukung: JPG, PNG, atau WebP (maks. 5MB).</li>
                  </ul>
                  {uploadError && <p className="text-xs text-rose-600 font-bold mt-1">{uploadError}</p>}
                </div>
              </div>
            </div>

            {/* 2. Nama Iklan */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nama Iklan
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Promo Diskon Hari Ayah / Banner Webinar Desember"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/10"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Nama ini hanya muncul di dashboard admin agar Anda mudah membedakan banner, tidak ditampilkan di website publik.
              </p>
            </div>

            {/* 3. Link Tujuan (URL Target) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Tautan Tombol <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={linkTujuan}
                onChange={(e) => setLinkTujuan(e.target.value)}
                placeholder="Contoh: /psikotes"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/10"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Link halaman di Empathika (contoh: /psikotes).
              </p>
            </div>

            {/* 4. Tanggal Mulai & Berakhir */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tanggal Mulai Tayang
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tanggal Berakhir Tayang
                </label>
                <input
                  type="date"
                  value={tanggalBerakhir}
                  onChange={(e) => setTanggalBerakhir(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/10"
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400">
              Jika tanggal berakhir diisi, banner akan otomatis tidak ditayangkan setelah tanggal tersebut lewat.
            </p>

            {/* 5. Status / Toggle Aktif */}
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aktif}
                  onChange={(e) => setAktif(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#561269]"></div>
              </label>
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                {aktif ? "🟢 Status Banner: Aktif (Akan tampil di beranda)" : "⚪ Draf (Tidak ditayangkan)"}
              </span>
            </div>

            {/* Tombol Simpan Form */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isUploading || isSaving}
                className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2 text-xs font-bold text-gray-950 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : editingId ? "Perbarui Banner" : "Simpan Banner"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Banner Terpasang */}
      <div className="mt-6 space-y-3">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          Daftar Banner ({banners.length + 1})
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {/* 1. Banner-banner Promosi Tambahan (jika ada) */}
          {banners.map((item) => {
            // Cek apakah expired sesuai tanggal lokal
            const todayStr = getLocalDateString()
            const isExpired = item.tanggalBerakhir && item.tanggalBerakhir.split("T")[0] < todayStr

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                        {item.nama || item.judul || `Banner Promosi #${banners.indexOf(item) + 1}`}
                      </h5>
                      <span className="text-xs text-gray-400 font-normal">
                        {item.aktif ? (isExpired ? "Kadaluarsa" : "Aktif") : "Nonaktif"}
                      </span>
                    </div>

                    {(item.tanggalMulai || item.tanggalBerakhir) && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {item.tanggalMulai ? item.tanggalMulai.split("T")[0] : "Sekarang"} s/d{" "}
                        {item.tanggalBerakhir ? item.tanggalBerakhir.split("T")[0] : "Seterusnya"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <ActionButtonEdit
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Banner"
                  />

                  <ActionButtonDelete
                    onClick={() => handleDelete(item.id)}
                    title="Hapus Banner"
                  />
                </div>
              </div>
            )
          })}

          {/* 2. Banner Utama Bawaan Sistem (Default) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border-2 border-purple-100 hover:border-purple-200 bg-purple-50/20 transition-all shadow-sm">
            <div className="flex items-center gap-3.5">
              {/* Thumbnail Branding */}
              <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-[#561269] to-[#7f1a9a] flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
                <span className="text-xl">✨</span>
                <span className="text-[9px] font-bold tracking-wider uppercase opacity-90">Empathika</span>
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                    {defaultSlide.title}
                  </h5>
                  <span className="text-xs text-gray-400 font-normal">
                    Aktif
                  </span>
                </div>

                {defaultSlide.subtitle && (
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-sm hidden sm:block">
                    {defaultSlide.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Actions: Edit Slide Default */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <ActionButtonEdit
                onClick={handleOpenEditDefault}
                title="Edit Slide Default"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

