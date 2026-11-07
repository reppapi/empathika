"use client"

import { useState } from "react"
import Image from "next/image"
import { BLOG_CONSTANTS } from "../../../constants/blogConstants"
import { BLOG_FORM_STYLES } from "./blogFormStyles"

interface BlogBannerUploadProps {
  id?: string
  previewUrl: string
  fileName?: string
  fileSize?: number
  onFileSelect: (file: File) => void
}

export function BlogBannerUpload({
  id = "file-upload-blog",
  previewUrl,
  fileName,
  fileSize,
  onFileSelect,
}: BlogBannerUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = (file?: File) => {
    if (!file) return
    if (file.size > BLOG_CONSTANTS.MAX_FILE_SIZE_BYTES) {
      alert("Ukuran file gambar maksimal 30MB.")
      return
    }
    onFileSelect(file)
  }

  return (
    <div>
      <label className={BLOG_FORM_STYLES.label}>Foto/Poster terkait blog</label>
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
            handleFile(e.dataTransfer.files[0])
          }
        }}
        className={`relative flex flex-col items-center justify-center w-full min-h-[220px] rounded-2xl border-2 border-dashed transition-all cursor-pointer p-4 overflow-hidden ${
          isDragOver
            ? "border-[#561269] bg-purple-50/60"
            : "border-gray-300 bg-gray-50/60 hover:bg-purple-50/30 hover:border-[#561269]"
        }`}
      >
        <input
          id={id}
          type="file"
          accept={BLOG_CONSTANTS.ALLOWED_IMAGE_TYPES.join(", ")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0])
            }
          }}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden shadow-sm">
              <Image
                src={previewUrl}
                alt="Preview banner"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium pointer-events-none">
                📐 1200 × 675 px (16:9)
              </div>
            </div>
            {fileName && (
              <p className="text-[11px] text-gray-400">
                {fileName} ({fileSize ? Math.round(fileSize / 1024) : 0} KB)
              </p>
            )}
            <label
              htmlFor={id}
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
            htmlFor={id}
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
              <span className="block text-xs font-medium text-gray-600 mt-1">
                Rekomendasi ukuran: <strong className="text-[#561269]">1200 × 675 px (rasio 16:9)</strong>
              </span>
              <span className="block text-[11px] text-gray-400 mt-0.5">
                Format JPG, PNG, atau WebP • Bebas ukuran berapa pun, otomatis dikompresi
              </span>
            </div>
          </label>
        )}
      </div>
    </div>
  )
}

