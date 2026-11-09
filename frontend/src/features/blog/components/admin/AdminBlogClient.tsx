"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { blogService } from "@/services/blog.service"
import { BackendBlogItem } from "@/features/blog/types"
import { formatBlogDate, createExcerpt } from "@/features/blog/utils/blogUtils"
import { BLOG_CONSTANTS } from "@/features/blog/constants/blogConstants"
import {
  ActionButtonDetail,
  ActionButtonEdit,
  ActionButtonDelete,
} from "@/components/shared/TableActionButtons"
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  ColumnDef,
} from "@/components/shared/AdminDataTable"
import AdminSummaryCard from "@/components/shared/AdminSummaryCard"
import { Newspaper, CalendarDays } from "lucide-react"
import AdminBlogDetailModal from "./AdminBlogDetailModal"

export default function AdminBlogClient() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<BackendBlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
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

  // Filter Search
  const filteredBlogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return blogs.filter((item) => {
      if (!q) return true
      const matchJudul = item.judul?.toLowerCase().includes(q)
      const matchIsi = item.isi?.toLowerCase().includes(q)
      return matchJudul || matchIsi
    })
  }, [blogs, searchQuery])

  const countTotal = blogs.length

  const columns: ColumnDef<BackendBlogItem>[] = [
    {
      key: "no",
      header: "No.",
      align: "center",
      width: "60px",
      render: (_, index) => (
        <span className="font-semibold text-gray-500">{index + 1}</span>
      ),
    },
    {
      key: "artikel",
      header: "Artikel & Banner",
      render: (blog: BackendBlogItem) => {
        const excerpt = createExcerpt(blog.isi, 90)
        return (
          <div className="flex items-center gap-3.5 py-1 min-w-[280px]">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
              {blog.banner_url ? (
                <Image
                  src={blog.banner_url}
                  alt={blog.judul}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-purple-50 text-purple-300">
                  <Newspaper className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setBlogDetail(blog)}
                className="text-left font-bold text-gray-900 hover:text-[#561269] transition line-clamp-1 text-sm block cursor-pointer"
              >
                {blog.judul}
              </button>
              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                {excerpt}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: "tanggal",
      header: "Tanggal Terbit",
      render: (blog: BackendBlogItem) => {
        const formattedDate = formatBlogDate(blog.tanggal_terbit)
        return (
          <div className="flex items-center gap-2 text-gray-700 whitespace-nowrap">
            <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{formattedDate}</span>
          </div>
        )
      },
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      width: "140px",
      render: (blog: BackendBlogItem) => (
        <div
          className="flex items-center justify-center gap-1.5 sm:gap-2"
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
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Bar: Summary Card Total Blog & Tombol Tambah Blog Sejajar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-72 md:w-80">
          <AdminSummaryCard
            label="Total Blog"
            value={countTotal}
            icon={<Newspaper className="w-6 h-6 text-purple-600" />}
            iconBgColor="bg-purple-50 text-purple-600"
          />
        </div>

        <Link
          href="/admin/blog/tambah"
          className="self-start sm:self-center inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
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

      {/* ── Main Table Container: Cukup Daftar Tabel & Search Saja ── */}
      <AdminTableContainer>
        {/* Search Bar */}
        <div className="flex justify-end mb-6">
          <AdminSearchInput
            placeholder="Cari judul atau isi blog..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Tabel Data Blog */}
        <AdminDataTable
          columns={columns}
          data={filteredBlogs}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          loadingMessage="Memuat daftar artikel blog..."
          emptyMessage="Belum ada artikel blog yang sesuai."
          maxRows={10}
        />
      </AdminTableContainer>

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
                className="rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
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
