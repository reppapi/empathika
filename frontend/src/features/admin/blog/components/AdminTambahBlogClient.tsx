"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { BlogPost } from "@/features/blog/types"
import { INITIAL_ADMIN_BLOGS } from "../data/adminBlogData"

export default function AdminTambahBlogClient() {
  const router = useRouter()
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Form states (kosongan dengan default tanggal hari ini)
  const todayStr = new Date().toISOString().split("T")[0]
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(todayStr)
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)

  const handleImageUpload = (file: File) => {
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Format tanggal ke Bahasa Indonesia (cth: "12 Oktober 2026")
    let displayDate = date
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y, m, d] = date.split("-")
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ]
      displayDate = `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]} ${y}`
    }

    // Buat slug otomatis dari judul blog
    const baseSlug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") || `blog-${Date.now()}`

    // Ambil data dari localStorage untuk cek keunikan slug
    let currentBlogs: BlogPost[] = INITIAL_ADMIN_BLOGS
    const saved = localStorage.getItem("empathika_admin_blogs")
    if (saved) {
      try {
        currentBlogs = JSON.parse(saved)
      } catch {
        currentBlogs = INITIAL_ADMIN_BLOGS
      }
    }

    // Pastikan slug unik jika ada yang sama
    let generatedSlug = baseSlug
    let counter = 1
    while (currentBlogs.some((b) => b.slug === generatedSlug)) {
      counter++
      generatedSlug = `${baseSlug}-${counter}`
    }

    const newBlog: BlogPost = {
      slug: generatedSlug,
      title,
      excerpt: content.split("\n")[0]?.slice(0, 150) || title,
      content: content.split("\n\n").filter(Boolean),
      author: {
        name: "Admin Empathika",
      },
      category: "Artikel",
      tags: ["kesehatan mental", "empathika"],
      date: displayDate,
      readTime: "4 menit baca",
      views: 0,
      likes: 0,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    }

    // Ambil data dari localStorage
    let currentBlogs: BlogPost[] = INITIAL_ADMIN_BLOGS
    const saved = localStorage.getItem("empathika_admin_blogs")
    if (saved) {
      try {
        currentBlogs = JSON.parse(saved)
      } catch {
        currentBlogs = INITIAL_ADMIN_BLOGS
      }
    }

    const updatedBlogs = [newBlog, ...currentBlogs]
    localStorage.setItem("empathika_admin_blogs", JSON.stringify(updatedBlogs))
    router.push("/admin/blog")
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"

  const labelClass = "block text-xs font-bold text-gray-700 mb-1.5"
  const helperClass = "block text-[11px] text-gray-400 mt-1 font-normal"

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 max-w-5xl mx-auto">
      {/* ── Heading Form ── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
          {title || "Tambah Blog Baru"}
        </h2>
      </div>

      {/* ── Container Form (Background putih, rounded corners, shadow tipis) ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ── Baris 1 (2 Kolom): Judul Blog & Tanggal Publikasi ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Kiri: Judul Blog * */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Judul Blog <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukan judul blog baru"
                className={inputClass}
              />
              <span className={helperClass}>Masukan judul blog baru</span>
            </div>

            {/* Kanan: Tanggal Publikasi */}
            <div>
              <label htmlFor="date" className={labelClass}>
                Tanggal Publikasi
              </label>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${inputClass} pr-11 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none`}
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
              <span className={helperClass}>Masukan tanggal publikasi blog baru</span>
            </div>
          </div>

          {/* ── Baris 2 (1 Kolom Penuh): Isi Blog ── */}
          <div>
            <label htmlFor="content" className={labelClass}>
              Isi Blog
            </label>
            <textarea
              id="content"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Masukan isi blog baru"
              className={`${inputClass} resize-y leading-relaxed font-normal`}
            />
            <span className={helperClass}>Masukan isi blog baru</span>
          </div>

          {/* ── Baris 4 (1 Kolom): Foto/Poster terkait blog * ── */}
          <div>
            <label className={labelClass}>
              Foto/Poster terkait blog <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                if (e.dataTransfer.files?.[0]) {
                  handleImageUpload(e.dataTransfer.files[0])
                }
              }}
              className={`relative flex flex-col items-center justify-center w-full min-h-[220px] rounded-2xl border-2 border-dashed transition-all cursor-pointer p-4 overflow-hidden ${
                isDragOver
                  ? "border-[#561269] bg-purple-50/60"
                  : "border-gray-300 bg-gray-50/60 hover:bg-purple-50/30 hover:border-[#561269]"
              }`}
            >
              <input
                id="file-upload-tambah"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageUpload(e.target.files[0])
                  }
                }}
              />

              {imageUrl ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={imageUrl}
                      alt="Preview banner"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <label
                    htmlFor="file-upload-tambah"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#561269] hover:underline cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    Ganti Foto / Upload Ulang
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="file-upload-tambah"
                  className="flex flex-col items-center gap-2 text-center cursor-pointer"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-[#561269]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.6}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">
                      Upload gambar poster / banner
                    </span>
                    <span className="block text-[11px] text-gray-400 mt-0.5">
                      Format: JPG, PNG (Max. 2MB)
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* ── Form Actions (Kanan Bawah): [Kembali] & [Simpan] ── */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push("/admin/blog")}
              className="rounded-xl border border-gray-200 bg-white px-7 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#561269] hover:bg-[#6f1b87] px-8 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all active:scale-95"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
