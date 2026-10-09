"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { BlogPost } from "@/features/blog/types"
import { INITIAL_ADMIN_BLOGS } from "../data/adminBlogData"

export default function AdminBlogClient() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null)

  useEffect(() => {
    // Muat dari localStorage jika ada, jika tidak gunakan INITIAL_ADMIN_BLOGS
    const saved = localStorage.getItem("empathika_admin_blogs")
    if (saved) {
      try {
        setBlogs(JSON.parse(saved))
      } catch {
        setBlogs(INITIAL_ADMIN_BLOGS)
      }
    } else {
      setBlogs(INITIAL_ADMIN_BLOGS)
      localStorage.setItem("empathika_admin_blogs", JSON.stringify(INITIAL_ADMIN_BLOGS))
    }
  }, [])

  const handleDelete = () => {
    if (!blogToDelete) return
    const updated = blogs.filter((b) => b.slug !== blogToDelete.slug)
    setBlogs(updated)
    localStorage.setItem("empathika_admin_blogs", JSON.stringify(updated))
    setBlogToDelete(null)
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Header Konten: Heading & Tombol [+ Tambah Blog] ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Daftar Blog
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola dan pantau seluruh artikel blog Empathika
          </p>
        </div>

        <Link
          href="/admin/blog/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#561269] hover:bg-[#6f1b87] px-6 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Blog
        </Link>
      </div>

      {/* ── List Kartu Blog ── */}
      <div className="flex flex-col gap-5">
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-200/90 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-12 w-12 mb-3 text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
              />
            </svg>
            <p className="text-sm font-semibold">Belum ada blog yang tersedia</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.slug}
              className="group flex flex-col md:flex-row overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
            >
              {/* Kiri: Thumbnail Image */}
              <div className="relative h-52 sm:h-56 md:h-auto md:w-72 lg:w-80 shrink-0 overflow-hidden bg-gray-100">
                {blog.imageUrl ? (
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 320px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-purple-50 text-[#561269]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-10 w-10 opacity-40"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Kanan: Informasi Blog */}
              <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                <div>
                  {/* Header Card: Avatar bulat + Penulis + Tanggal */}
                  <div className="flex items-center gap-2.5 text-xs text-gray-600 mb-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8D4F0] font-bold text-[#561269] text-xs">
                      {blog.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <span className="font-semibold text-gray-800">
                      {blog.author.name}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">{blog.date}</span>
                  </div>

                  {/* Judul Blog (Bold) */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#561269] transition-colors">
                    {blog.title}
                  </h3>

                  {/* Deskripsi / Excerpt */}
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {blog.excerpt}
                  </p>
                </div>

                {/* Divider Line & Footer Card (Aksi) */}
                <div className="mt-5">
                  <div className="h-[1px] w-full bg-gray-100 mb-3.5" />

                  <div className="flex items-center justify-between">
                    {/* Hapus Blog (Kiri) */}
                    <button
                      type="button"
                      onClick={() => setBlogToDelete(blog)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      Hapus Blog
                    </button>

                    {/* Edit Blog (Kanan) */}
                    <Link
                      href={`/admin/blog/${blog.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#561269] hover:text-[#6f1b87] hover:underline transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                      Edit Blog
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal Konfirmasi Hapus ── */}
      {blogToDelete && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setBlogToDelete(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Hapus Blog?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus blog{" "}
                <span className="font-semibold text-gray-900">
                  &ldquo;{blogToDelete.title}&rdquo;
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBlogToDelete(null)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all active:scale-95"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
