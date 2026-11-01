"use client"

import { useRouter } from "next/navigation"

import { AdminProfileData, RoleType } from "../../types"
import { useProfileAdminForm } from "../../hooks/useProfileAdminForm"

import { CardFotoAdmin } from "./CardFotoAdmin"
import { CardInformasiKontakAdmin } from "./CardInformasiKontakAdmin"
import { CardKhususPsikologAdmin } from "./CardKhususPsikologAdmin"
import { AdminCredentialSection } from "./AdminCredentialSection"
import { ModalPreviewClientAdmin } from "./ModalPreviewClientAdmin"

export { type AdminProfileData, type RoleType }

interface ProfileClientProps {
  role?: RoleType
}

export default function ProfileAdminClient({
  role = "admin",
}: ProfileClientProps) {
  const router = useRouter()

  // Ekstraksi Logika, State & Handlers ke custom hook
  const {
    form,
    initials,
    newSkill,
    setNewSkill,
    newParagraph,
    setNewParagraph,
    showToast,
    toastMessage,
    previewModalOpen,
    setPreviewModalOpen,
    isPlayingVideoPreview,
    setIsPlayingVideoPreview,
    fileInputRef,
    handleInputChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleAddSkill,
    handleRemoveSkill,
    handleAddParagraph,
    handleRemoveParagraph,
    handleSave,
  } = useProfileAdminForm({ role })

  return (
    <div className="space-y-6 font-poppins pb-12">
      {/* ── 1. TOAST ALERT NOTIFIKASI ── */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-4 text-white shadow-2xl transition-all animate-bounce">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">Berhasil</p>
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* ── 2. HEADER HALAMAN (Hanya jika role bukan admin) ── */}
      {role !== "admin" && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#561269] tracking-tight">
            Pengaturan Profil Psikolog
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Kelola profil profesional, foto profil, kredensial STR/SIPP, dan informasi yang tampil di halaman klien.
          </p>
        </div>
      )}

      {/* ── 3. FORM UTAMA PROFIL ── */}
      <form id="admin-profile-form" onSubmit={handleSave} className="space-y-6">
        {/* KARTU 1: FOTO PROFIL & IDENTITAS CEPAT */}
        <CardFotoAdmin
          role={role}
          foto={form.foto}
          nama={form.nama}
          initials={initials}
          spesialisasi={form.spesialisasi}
          fileInputRef={fileInputRef}
          onPhotoUpload={handlePhotoUpload}
          onRemovePhoto={handleRemovePhoto}
          onOpenPreview={() => setPreviewModalOpen(true)}
        />

        {/* KARTU 2: INFORMASI DASAR & KONTAK */}
        <CardInformasiKontakAdmin
          role={role}
          form={form}
          onChange={handleInputChange}
        />

        {/* KARTU 3: KHUSUS PSIKOLOG (Kredensial, Video Intro, Keahlian & Paragraf Profil) */}
        {role === "psikolog" && (
          <CardKhususPsikologAdmin
            form={form}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            newParagraph={newParagraph}
            setNewParagraph={setNewParagraph}
            onChange={handleInputChange}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            onAddParagraph={handleAddParagraph}
            onRemoveParagraph={handleRemoveParagraph}
          />
        )}
      </form>

      {/* ── 4. SEKSI KEAMANAN AKUN: Ganti Email & Ganti Password (Khusus Admin Utama) ── */}
      {role === "admin" && (
        <AdminCredentialSection email={form.email} />
      )}

      {/* ── 5. BOTTOM ACTION BAR ── */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-3xl bg-white/95 backdrop-blur-md border border-gray-200/80 p-4 sm:p-5 shadow-xl">
        <div className="hidden sm:block">
          <p className="text-xs font-bold text-gray-800">
            Perubahan belum disimpan otomatis
          </p>
          <p className="text-[11px] text-gray-400">
            Pastikan Anda mengklik tombol Simpan setelah melakukan penyesuaian.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              if (role === "admin") {
                router.push("/admin")
              } else {
                router.push("/psikolog-web/beranda" as any)
              }
            }}
            className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          >
            Batalkan
          </button>
          <button
            type="submit"
            form="admin-profile-form"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-7 py-2.5 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* ── 6. MODAL POPUP: LIVE PREVIEW CLIENT POV ── */}
      <ModalPreviewClientAdmin
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        form={form}
        initials={initials}
        isPlayingVideoPreview={isPlayingVideoPreview}
        setIsPlayingVideoPreview={setIsPlayingVideoPreview}
      />
    </div>
  )
}
