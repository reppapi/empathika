"use client"

import Image from "next/image"
import { BackendBlogItem } from "@/features/blog/types"
import { formatBlogDate } from "@/features/blog/utils/blogUtils"
import { X, Calendar, Edit3, Trash2 } from "lucide-react"

interface AdminBlogDetailModalProps {
  isOpen: boolean
  onClose: () => void
  blog: BackendBlogItem | null
  onEdit: (id: string) => void
  onDelete: (blog: BackendBlogItem) => void
}

export default function AdminBlogDetailModal({
  isOpen,
  onClose,
  blog,
  onEdit,
  onDelete,
}: AdminBlogDetailModalProps) {
  if (!isOpen || !blog) return null

  const formattedDate = formatBlogDate(blog.tanggal_terbit)
  const paragraphs = (blog.isi || "")
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs transition-all duration-200 font-poppins"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-[28px] bg-white shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-8 rounded-full bg-[#561269]" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                Detail Artikel Blog
              </h3>
              <p className="text-xs text-gray-500">
                Pratinjau konten artikel dan informasi publikasi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 bg-[#FBFBFC]">
          {/* Banner Image */}
          {blog.banner_url ? (
            <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs">
              <Image
                src={blog.banner_url}
                alt={blog.judul}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-36 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-400 text-sm font-medium">
              Tidak ada gambar banner untuk artikel ini
            </div>
          )}

          {/* Info Tanggal */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-3.5 py-2 rounded-xl border border-gray-100 w-fit">
            <Calendar className="w-4 h-4 text-[#561269]" />
            <span>Tanggal Terbit: {formattedDate}</span>
          </div>

          {/* Judul Blog */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {blog.judul}
            </h2>
          </div>

          {/* Isi Konten Blog */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 border border-gray-100 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Isi Konten
            </h4>
            <div className="text-sm text-gray-700 leading-relaxed space-y-3 whitespace-pre-line font-normal">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p className="text-gray-400 italic">Tidak ada isi konten.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={() => {
              onClose()
              onDelete(blog)
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Artikel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit(blog.id)
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Artikel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

