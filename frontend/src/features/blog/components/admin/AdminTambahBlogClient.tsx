"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { blogService } from "@/services/blog.service"
import { BlogBannerUpload } from "./form/BlogBannerUpload"
import { BLOG_FORM_STYLES } from "./form/blogFormStyles"
import { useBlogFormImage } from "../../hooks/useBlogFormImage"

export default function AdminTambahBlogClient() {
  const router = useRouter()
  const dateInputRef = useRef<HTMLInputElement>(null)

  const todayStr = new Date().toISOString().split("T")[0]
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(todayStr)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    imageFile,
    imagePreviewUrl,
    isUploading,
    handleSelectFile,
    uploadIfSelected,
  } = useBlogFormImage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const finalBannerUrl = await uploadIfSelected()

      await blogService.create({
        judul: title.trim(),
        isi: content.trim(),
        banner_url: finalBannerUrl,
        ...(date ? { tanggal_terbit: new Date(date).toISOString() } : {}),
      })

      router.push("/admin/blog")
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Gagal menyimpan artikel blog")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 max-w-5xl mx-auto">
      {/* ── Heading Form ── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
          {title || "Tambah Blog Baru"}
        </h2>
      </div>

      {/* ── Container Form ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Baris 1: Judul Blog & Tanggal Publikasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label htmlFor="title" className={BLOG_FORM_STYLES.label}>
                Judul Blog <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={BLOG_FORM_STYLES.input}
              />
              <span className={BLOG_FORM_STYLES.helper}>Masukan judul artikel blog</span>
            </div>

            <div>
              <label htmlFor="date" className={BLOG_FORM_STYLES.label}>
                Tanggal Publikasi
              </label>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${BLOG_FORM_STYLES.input} pr-11 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none`}
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#561269] transition-colors p-1"
                  title="Pilih tanggal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                </button>
              </div>
              <span className={BLOG_FORM_STYLES.helper}>Masukan tanggal publikasi blog baru</span>
            </div>
          </div>

          {/* Baris 2: Isi Blog */}
          <div>
            <label htmlFor="content" className={BLOG_FORM_STYLES.label}>
              Isi Blog <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${BLOG_FORM_STYLES.input} resize-y leading-relaxed font-normal`}
            />
            <span className={BLOG_FORM_STYLES.helper}>Tuliskan konten lengkap artikel blog</span>
          </div>

          {/* Baris 3: Foto/Poster Banner */}
          <BlogBannerUpload
            id="banner-upload-tambah"
            previewUrl={imagePreviewUrl}
            fileName={imageFile?.name}
            fileSize={imageFile?.size}
            onFileSelect={handleSelectFile}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push("/admin/blog")}
              disabled={isSubmitting}
              className="rounded-full border border-gray-300 bg-white px-7 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-8 py-2.5 text-xs sm:text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isUploading ? "Mengupload gambar..." : "Menyimpan..."}
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
