"use client"

import React, { useRef } from "react"
import { FileText, Globe, Upload, Loader2, Check } from "lucide-react"

interface ApplyUploadSectionProps {
  sectionNumber: number
  formData: {
    cvUrl: string
    portfolioUrl: string
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      nama: string
      email: string
      telepon: string
      universitas: string
      jurusan: string
      semester: string
      cvUrl: string
      portfolioUrl: string
    }>
  >
  cvFile: File | null
  cvFileName: string
  cvFileSize: string
  uploadingCv: boolean
  isDragging: boolean
  setIsDragging: (val: boolean) => void
  cvUploadMode: "file" | "link"
  setCvUploadMode: (mode: "file" | "link") => void
  handleCvFileChange: (file: File) => void

  portfolioFile: File | null
  portfolioFileName: string
  portfolioFileSize: string
  uploadingPortfolio: boolean
  isDraggingPortfolio: boolean
  setIsDraggingPortfolio: (val: boolean) => void
  portfolioUploadMode: "file" | "link"
  setPortfolioUploadMode: (mode: "file" | "link") => void
  handlePortfolioFileChange: (file: File) => void
}

export function ApplyUploadSection({
  sectionNumber,
  formData,
  setFormData,
  cvFile,
  cvFileName,
  cvFileSize,
  uploadingCv,
  isDragging,
  setIsDragging,
  cvUploadMode,
  setCvUploadMode,
  handleCvFileChange,
  portfolioFile,
  portfolioFileName,
  portfolioFileSize,
  uploadingPortfolio,
  isDraggingPortfolio,
  setIsDraggingPortfolio,
  portfolioUploadMode,
  setPortfolioUploadMode,
  handlePortfolioFileChange,
}: ApplyUploadSectionProps) {
  const fileInputCvRef = useRef<HTMLInputElement>(null)
  const fileInputPortfolioRef = useRef<HTMLInputElement>(null)

  return (
    <div className="pt-6 border-t border-gray-100">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
          {sectionNumber}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Unggah Berkas & Portofolio</h2>
          <p className="text-xs text-gray-500">
            Unggah CV/Resume Anda dan tautan portofolio pendukung jika ada.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* CV / Resume Upload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-700">
              CURRICULUM VITAE (CV) / RESUME <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCvUploadMode("file")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  cvUploadMode === "file"
                    ? "bg-[#561269] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setCvUploadMode("link")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  cvUploadMode === "link"
                    ? "bg-[#561269] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Gunakan Link
              </button>
            </div>
          </div>

          {cvUploadMode === "file" ? (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  if (e.dataTransfer.files?.[0]) {
                    handleCvFileChange(e.dataTransfer.files[0])
                  }
                }}
                onClick={() => fileInputCvRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-[#561269] bg-purple-50/60"
                    : cvFile || formData.cvUrl
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-gray-300 hover:border-[#561269] bg-[#FAF7FB]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputCvRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleCvFileChange(e.target.files[0])
                    }
                  }}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />

                {uploadingCv ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#561269] animate-spin" />
                    <p className="text-xs font-semibold text-[#561269]">
                      Sedang mengunggah berkas CV...
                    </p>
                  </>
                ) : cvFile || formData.cvUrl ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-gray-900">
                      {cvFileName || "Berkas CV Berhasil Terunggah"}
                    </p>
                    {cvFileSize && (
                      <span className="text-[11px] text-gray-500 font-medium">{cvFileSize}</span>
                    )}
                    <span className="text-[11px] text-[#561269] font-medium underline mt-1">
                      Klik untuk ganti file
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-[#561269] flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Klik untuk unggah atau seret file ke sini
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Format PDF, DOC, DOCX (Maksimal 15 MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={formData.cvUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, cvUrl: e.target.value }))}
                placeholder="https://drive.google.com/... (Pastikan akses disetel publik)"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
              />
            </div>
          )}
        </div>

        {/* Portofolio Upload / Link */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-700">
              PORTOFOLIO / LINK BERKAS PENDUKUNG (OPSIONAL)
            </label>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPortfolioUploadMode("file")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  portfolioUploadMode === "file"
                    ? "bg-[#561269] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setPortfolioUploadMode("link")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  portfolioUploadMode === "link"
                    ? "bg-[#561269] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Gunakan Link
              </button>
            </div>
          </div>

          {portfolioUploadMode === "file" ? (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDraggingPortfolio(true)
                }}
                onDragLeave={() => setIsDraggingPortfolio(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDraggingPortfolio(false)
                  if (e.dataTransfer.files?.[0]) {
                    handlePortfolioFileChange(e.dataTransfer.files[0])
                  }
                }}
                onClick={() => fileInputPortfolioRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                  isDraggingPortfolio
                    ? "border-[#561269] bg-purple-50/60"
                    : portfolioFile || formData.portfolioUrl
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-gray-300 hover:border-[#561269] bg-[#FAF7FB]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputPortfolioRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handlePortfolioFileChange(e.target.files[0])
                    }
                  }}
                  accept=".pdf,.zip,.rar"
                  className="hidden"
                />

                {uploadingPortfolio ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#561269] animate-spin" />
                    <p className="text-xs font-semibold text-[#561269]">
                      Sedang mengunggah portofolio...
                    </p>
                  </>
                ) : portfolioFile || formData.portfolioUrl ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-gray-900">
                      {portfolioFileName || "Berkas Portofolio Terunggah"}
                    </p>
                    {portfolioFileSize && (
                      <span className="text-[11px] text-gray-500 font-medium">
                        {portfolioFileSize}
                      </span>
                    )}
                    <span className="text-[11px] text-[#561269] font-medium underline mt-1">
                      Klik untuk ganti file
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-[#561269] flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Klik untuk unggah berkas portofolio
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Format PDF, ZIP, RAR (Maksimal 25 MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <Globe className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, portfolioUrl: e.target.value }))}
                placeholder="https://drive.google.com/... atau https://behance.net/..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
