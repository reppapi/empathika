"use client"

import React, { useState, useRef } from "react"
import { Upload, Loader2, FileText, Check, AlertCircle, ExternalLink } from "lucide-react"
import { kerjaSamaService } from "@/services/kerja-sama.service"

export interface FormProposalUploadProps {
  value: string
  onChange: (val: string) => void
  label?: string
}

export default function FormProposalUpload({ value, onChange }: FormProposalUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  let parsedFile: { url: string; filename: string; size?: number } | null = null
  if (value) {
    try {
      if (value.startsWith("{")) {
        parsedFile = JSON.parse(value)
      } else {
        parsedFile = { url: value, filename: "Proposal_Kerjasama.pdf" }
      }
    } catch {
      parsedFile = { url: value, filename: "Proposal_Kerjasama.pdf" }
    }
  }

  const handleProcessFile = async (file: File) => {
    if (!file) return
    setUploadError(null)

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar. Maksimal 15 MB.")
      return
    }

    setIsUploading(true)
    try {
      const res = await kerjaSamaService.uploadProposal(file)
      if (res?.data?.url) {
        const filePayload = {
          url: res.data.url,
          filename: res.data.originalName || file.name,
          size: res.data.size || file.size,
        }
        onChange(JSON.stringify(filePayload))
        setIsUploading(false)
        return
      }
    } catch (err: any) {
      console.warn("Upload proposal to backend failed, falling back to local reader:", err?.message || err)
    }

    try {
      const reader = new FileReader()
      reader.onload = () => {
        const filePayload = {
          url: reader.result as string,
          filename: file.name,
          size: file.size,
        }
        onChange(JSON.stringify(filePayload))
        setIsUploading(false)
      }
      reader.onerror = () => {
        setUploadError("Gagal membaca file proposal.")
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (fallbackErr) {
      setUploadError("Terjadi kesalahan saat memproses file.")
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleProcessFile(file)
    e.target.value = ""
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="border border-purple-200 bg-purple-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-[#561269] animate-spin mb-2" />
          <p className="text-sm font-bold text-gray-900">Mengunggah berkas proposal...</p>
          <p className="text-xs text-gray-500 mt-0.5">Harap tunggu proses unggah selesai</p>
        </div>
      ) : parsedFile ? (
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {parsedFile.filename || "Proposal_Kerjasama.pdf"}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                  <Check className="w-3 h-3" /> Terunggah
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {parsedFile.size && <span>{(parsedFile.size / (1024 * 1024)).toFixed(2)} MB • </span>}
                {parsedFile.url && !parsedFile.url.startsWith("data:") && (
                  <a
                    href={parsedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#561269] hover:underline font-medium inline-flex items-center gap-0.5"
                  >
                    Lihat Berkas <ExternalLink className="w-3 h-3 inline" />
                  </a>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-[#561269] bg-purple-100 hover:bg-purple-200 px-3.5 py-2 rounded-xl cursor-pointer transition-colors"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl cursor-pointer transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleProcessFile(file)
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#561269] bg-purple-100/50 scale-[1.01]"
              : "border-gray-300 hover:border-[#561269] bg-purple-50/20 hover:bg-purple-50/50"
          } group`}
        >
          <div className="w-12 h-12 rounded-full bg-purple-100 text-[#561269] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Pilih berkas proposal atau seret ke sini
          </p>
          <p className="text-xs text-gray-500">
            Format PDF, Word (DOC/DOCX), atau Gambar (Maksimal 15 MB)
          </p>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>{uploadError}</span>
        </p>
      )}
    </div>
  )
}
