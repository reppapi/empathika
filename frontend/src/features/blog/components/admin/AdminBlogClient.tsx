"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { blogService } from "@/services/blog.service"
import { BackendBlogItem } from "@/features/blog/types"

export default function AdminBlogClient() {
  const [blogs, setBlogs] = useState<BackendBlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [blogToDelete, setBlogToDelete] = useState<BackendBlogItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBlogs = () => {
    setLoading(true)
    blogService
      .getList({ page: 1, limit: 100 })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setBlogs(res.data)
        } else {
          setBlogs([])
        }
      })
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleDelete = async () => {
    if (!blogToDelete) return
    setIsDeleting(true)
    try {
      await blogService.delete(blogToDelete.id)
      setBlogToDelete(null)
      fetchBlogs()
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus blog")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Bar Action: Tombol Tambah Blog ── */}
      <div className="flex justify-end">
        <Link
          href="/admin/blog/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
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
        {loading ? (
          <div className="py-20 text-center text-gray-500 font-medium">
            Memuat daftar blog...
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-[#CA8A04] mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800">Belum ada blog yang tersedia</p>
            <p className="mt-1 text-xs text-gray-400">Silakan tambahkan artikel blog pertama Anda.</p>
          </div>
        ) : (
          blogs.map((blog) => {
            const formattedDate = new Date(blog.tanggal_terbit).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
            const excerpt = blog.isi.length > 150 ? `${blog.isi.substring(0, 150)}...` : blog.isi

            return (
              <div
                key={blog.id}
                className="flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md"
              >
                {/* Kiri: Foto Thumbnail */}
                <div className="relative h-48 w-full md:h-auto md:w-72 shrink-0 bg-gray-100 overflow-hidden">
                  {blog.banner_url ? (
                    <Image
                      src={blog.banner_url}
                      alt={blog.judul}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 288px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-10 w-10 text-gray-300"
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
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    {/* Baris Meta Tanggal */}
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                      <span>{formattedDate}</span>
                    </div>

                    {/* Judul Blog */}
                    <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1 mb-2">
                      {blog.judul}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs md:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {excerpt}
                    </p>
                  </div>

                  {/* Tombol Action Bawah */}
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    {/* Hapus Blog */}
                    <button
                      type="button"
                      onClick={() => setBlogToDelete(blog)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.75}
                        stroke="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      Hapus Blog
                    </button>

                    {/* Edit Blog */}
                    <Link
                      href={`/admin/blog/${blog.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.75}
                        stroke="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                        />
                      </svg>
                      Edit Blog
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Modal Konfirmasi Hapus ── */}
      {blogToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setBlogToDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
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
              <h4 className="text-base font-bold text-gray-900">Hapus Artikel Blog?</h4>
              <p className="mt-1 text-xs text-gray-500">
                Apakah Anda yakin ingin menghapus &quot;{blogToDelete.judul}&quot;? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-6 flex w-full gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setBlogToDelete(null)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
