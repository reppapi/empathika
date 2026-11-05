"use client"

import React from "react"
import { labelClass, helperClass } from "./formStyles"

interface EventBannerUploadProps {
  bannerUrl: string
  isDragOver: boolean
  setIsDragOver: (val: boolean) => void
  onImageUpload: (file: File) => void
}

export function EventBannerUpload({
  bannerUrl,
  isDragOver,
  setIsDragOver,
  onImageUpload,
}: EventBannerUploadProps) {
  return (
    <div>
      <label className={labelClass}>Banner / Poster Event</label>
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
            onImageUpload(e.dataTransfer.files[0])
          }
        }}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all p-6 text-center cursor-pointer overflow-hidden ${
          isDragOver
            ? "border-[#561269] bg-purple-50/50"
            : bannerUrl
            ? "border-purple-200 bg-gray-50"
            : "border-gray-200 bg-[#FCFAFD] hover:bg-gray-50 hover:border-gray-300"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onImageUpload(e.target.files[0])
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />

        {bannerUrl ? (
          <div className="relative w-full max-w-md h-48 rounded-xl overflow-hidden shadow-sm group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerUrl}
              alt="Preview Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                />
              </svg>
              Klik atau drop untuk ganti gambar
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[#561269]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
            <div className="text-xs text-gray-600 font-medium">
              <span className="text-[#561269] font-bold">Pilih foto</span> atau tarik file ke sini
            </div>
            <p className="text-[11px] text-gray-400">PNG, JPG, JPEG hingga 10MB</p>
          </div>
        )}
      </div>
      <span className={helperClass}>
        Banner akan ditampilkan di kartu list event dan halaman rincian
      </span>
    </div>
  )
}

