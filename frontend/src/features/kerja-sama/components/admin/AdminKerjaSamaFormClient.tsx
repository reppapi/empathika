"use client"

import React from "react"
import { useAdminKerjaSamaForm } from "../../hooks/useAdminKerjaSamaForm"
import { FormProgramBasicSection } from "./FormProgramBasicSection"
import { FormProgramPelatihanSection } from "./FormProgramPelatihanSection"
import { FormProgramMitraSection } from "./FormProgramMitraSection"

interface AdminKerjaSamaFormClientProps {
  programId?: string
}

export default function AdminKerjaSamaFormClient({ programId }: AdminKerjaSamaFormClientProps) {
  const {
    isEditMode,
    formData,
    setFormData,
    loading,
    notFound,
    isSubmitting,
    toastMessage,
    errors,
    setErrors,
    handleImageUpload,
    handleSubmit,
    router,
  } = useAdminKerjaSamaForm(programId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-400 font-poppins text-sm">
        Memuat data program kerja sama...
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-center font-poppins gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800">Program Tidak Ditemukan</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Program kolaborasi dengan ID tersebut tidak ditemukan atau mungkin sudah dihapus.
        </p>
        <button
          type="button"
          onClick={() => router.push("/admin/kerja-sama")}
          className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 transition active:scale-95 cursor-pointer"
        >
          Kembali ke Kerja Sama
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 w-full max-w-5xl mx-auto">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-3 text-white shadow-xl transition-all">
          <p className="text-xs sm:text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* ── Heading Form & Tombol Kembali (Pola Event) ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#561269] transition-colors cursor-pointer"
          aria-label="Kembali"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {isEditMode ? "Edit Program Kerja Sama" : "Tambah Program Kerja Sama Baru"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isEditMode
              ? "Perbarui konten program kolaborasi yang tampil di halaman web client"
              : "Tambahkan pilihan program kolaborasi baru untuk halaman kerja sama"}
          </p>
        </div>
      </div>

      {/* ── Container Form Utama ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section 1: Informasi Dasar Program & Tema Gradasi */}
          <FormProgramBasicSection
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            isEditMode={isEditMode}
          />

          {/* Section 2: Bentuk Pelatihan / Workshop */}
          <FormProgramPelatihanSection
            formData={formData}
            setFormData={setFormData}
            onImageUpload={handleImageUpload}
          />

          {/* Section 3: Kemitraan Kami Sebelumnya */}
          <FormProgramMitraSection
            formData={formData}
            setFormData={setFormData}
            onImageUpload={handleImageUpload}
          />

          {/* Status Switch */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-5">
            <div>
              <span className="block text-sm font-bold text-gray-800">
                Tampilkan di Halaman Client Web
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                Jika diaktifkan, program ini akan langsung muncul pada pilihan kolaborasi di halaman web utama.
              </p>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={formData.status === "AKTIF"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.checked ? "AKTIF" : "NONAKTIF",
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#561269] relative" />
              <span className="text-xs font-bold text-gray-800">
                {formData.status === "AKTIF" ? "Aktif (Tampil)" : "Nonaktif (Sembunyi)"}
              </span>
            </label>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-8 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isEditMode ? "Simpan Perubahan" : "Tambahkan Program"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
