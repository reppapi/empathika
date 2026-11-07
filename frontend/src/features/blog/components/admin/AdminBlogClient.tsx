"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { blogService } from "@/services/blog.service"
import { BackendBlogItem } from "@/features/blog/types"
import { formatBlogDate, createExcerpt } from "@/features/blog/utils/blogUtils"
import { BLOG_CONSTANTS } from "@/features/blog/constants/blogConstants"
import { ActionButtonDetail, ActionButtonEdit, ActionButtonDelete } from "@/components/shared/TableActionButtons"
import AdminBlogDetailModal from "./AdminBlogDetailModal"

export default function AdminBlogClient() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<BackendBlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [blogToDelete, setBlogToDelete] = useState<BackendBlogItem | null>(null)
  const [blogDetail, setBlogDetail] = useState<BackendBlogItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBlogs = () => {
    setLoading(true)
    blogService
      .getList({ page: 1, limit: BLOG_CONSTANTS.MAX_PAGE_SIZE })
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
            const formattedDate = formatBlogDate(blog.tanggal_terbit)
            const excerpt = createExcerpt(blog.isi, 150)

            return (
              <div
                key={blog.id}
                onClick={() => setBlogDetail(blog)}
                className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {/* Bagian Kiri: Thumbnail & Ringkasan Konten */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                  {/* Thumbnail Gambar */}
                  <div className="relative h-44 w-full sm:h-24 sm:w-36 shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-100">
                    {blog.banner_url ? (
                      <Image
                        src={blog.banner_url}
                        alt={blog.judul}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
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
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Teks: Judul, Isi Singkat & Tanggal */}
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-[#561269] transition-colors">
                      {blog.judul}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {excerpt}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Bagian Kanan: Aksi (Lihat Detail, Edit & Hapus) */}
                <div
                  className="flex items-center justify-end sm:justify-start gap-1 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ActionButtonDetail
                    onClick={() => setBlogDetail(blog)}
                    title="Lihat Detail Blog"
                  />
                  <ActionButtonEdit
                    onClick={() => router.push(`/admin/blog/${blog.id}`)}
                    title="Edit Blog"
                  />
                  <ActionButtonDelete
                    onClick={() => setBlogToDelete(blog)}
                    title="Hapus Blog"
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Modal Detail Blog Admin (Khusus Admin) ── */}
      <AdminBlogDetailModal
        isOpen={Boolean(blogDetail)}
        blog={blogDetail}
        onClose={() => setBlogDetail(null)}
        onEdit={(id) => {
          setBlogDetail(null)
          router.push(`/admin/blog/${id}`)
        }}
        onDelete={(blog) => {
          setBlogDetail(null)
          setBlogToDelete(blog)
        }}
      />

      {/* ── Modal Konfirmasi Hapus ── */}
      {blogToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
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
            <div>
              <h4 className="text-lg font-bold text-gray-900">Hapus Artikel Blog</h4>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus artikel{" "}
                <span className="font-semibold text-gray-800">
                  &ldquo;{blogToDelete.judul}&rdquo;
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBlogToDelete(null)}
                disabled={isDeleting}
                className="rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
