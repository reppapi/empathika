"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { BlogPost } from "@/features/blog/types"
import { INITIAL_ADMIN_BLOGS } from "../../data/adminBlogData"

interface Props {
  slug: string
}

export default function AdminEditBlogClient({ slug }: Props) {
  const router = useRouter()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  // Form states
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    // Cari blog dari localStorage atau INITIAL_ADMIN_BLOGS
    let currentBlogs: BlogPost[] = INITIAL_ADMIN_BLOGS
    const saved = localStorage.getItem("empathika_admin_blogs")
    if (saved) {
      try {
        currentBlogs = JSON.parse(saved)
      } catch {
        currentBlogs = INITIAL_ADMIN_BLOGS
      }
    }

    const found = currentBlogs.find((b) => b.slug === slug)
    if (found) {
      setBlog(found)
      setTitle(found.title)
      // Konversi format tanggal ke YYYY-MM-DD jika formatnya teks seperti "12 Oktober 2026"
      let dateValue = "2026-10-12"
      if (found.date) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(found.date)) {
          dateValue = found.date
        } else {
          // Coba parse format teks atau DD/MM/YYYY
          const parts = found.date.split(" ")
          if (parts.length === 3) {
            const months: Record<string, string> = {
              Januari: "01",
              Februari: "02",
              Maret: "03",
              April: "04",
              Mei: "05",
              Juni: "06",
              Juli: "07",
              Agustus: "08",
              September: "09",
              Oktober: "10",
              November: "11",
              Desember: "12",
            }
            const day = parts[0].padStart(2, "0")
            const month = months[parts[1]] || "10"
            const year = parts[2]
            dateValue = `${year}-${month}-${day}`
          }
        }
      }
      setDate(dateValue)
      setContent(Array.isArray(found.content) ? found.content.join("\n\n") : found.content)
      setImageUrl(found.imageUrl || "")
    }
    setLoading(false)
  }, [slug])

  const handleImageUpload = (file: File) => {
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!blog) return

    // Update data di localStorage
    let currentBlogs: BlogPost[] = INITIAL_ADMIN_BLOGS
    const saved = localStorage.getItem("empathika_admin_blogs")
    if (saved) {
      try {
        currentBlogs = JSON.parse(saved)
      } catch {
        currentBlogs = INITIAL_ADMIN_BLOGS
      }
    }

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

    const updatedBlogs = currentBlogs.map((b) => {
      if (b.slug === slug) {
        return {
          ...b,
          title,
          date: displayDate,
          content: content.split("\n\n").filter(Boolean),
          imageUrl,
        }
      }
      return b
    })

    localStorage.setItem("empathika_admin_blogs", JSON.stringify(updatedBlogs))
    router.push("/admin/blog")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400 font-poppins">
        Memuat data blog...
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 font-poppins">
        <p className="text-lg font-bold">Blog tidak ditemukan.</p>
        <button
          onClick={() => router.push("/admin/blog")}
          className="mt-4 text-sm text-[#561269] font-semibold hover:underline"
        >
          ← Kembali ke Daftar Blog
        </button>
      </div>
    )
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
          {title || blog.title}
        </h2>
      </div>

      {/* ── Container Form (Background putih, rounded corners, shadow tipis) ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ── Baris 1 (2 Kolom): Ubah Judul Blog & Ubah Tanggal Publikasi ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Kiri: Ubah Judul Blog * */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Ubah Judul Blog <span className="text-red-500">*</span>
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

            {/* Kanan: Ubah Tanggal Publikasi */}
            <div>
              <label htmlFor="date" className={labelClass}>
                Ubah Tanggal Publikasi
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

          {/* ── Baris 2 (1 Kolom Penuh): Ubah Isi Blog ── */}
          <div>
            <label htmlFor="content" className={labelClass}>
              Ubah Isi Blog
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

          {/* ── Baris 3 (1 Kolom): Ubah Foto/Poster terkait blog * ── */}
          <div>
            <label className={labelClass}>
              Ubah Foto/Poster terkait blog <span className="text-red-500">*</span>
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
                id="file-upload"
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
                    htmlFor="file-upload"
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
                  htmlFor="file-upload"
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
              className="rounded-full border border-gray-300 bg-white px-7 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-8 py-2.5 text-xs sm:text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
