"use client"

import { useRouter } from "next/navigation"

import { AdminProfileData, RoleType } from "../../types"
import { useProfilePsikologForm } from "../../hooks/useProfilePsikologForm"

import { FormGantiEmail } from "./FormGantiEmail"
import { FormGantiPassword } from "./FormGantiPassword"
import { CardInformasiDasar } from "./CardInformasiDasar"
import { CardLegalitasPraktik } from "./CardLegalitasPraktik"
import { CardTopikKeahlian } from "./CardTopikKeahlian"
import { CardMediaPerkenalan } from "./CardMediaPerkenalan"
import { ModalPreviewClientPov } from "./ModalPreviewClientPov"


export { type AdminProfileData, type RoleType }

interface ProfileClientProps {
  role?: RoleType
}

export default function ProfilePsikologClient({ role = "psikolog" }: ProfileClientProps) {
  const router = useRouter()

  // 1. Ekstraksi Seluruh Otak Logika, State & Handlers ke Custom Hook
  const {
    form,
    initials,
    newSkill,
    setNewSkill,
    showToast,
    toastMessage,
    isSaving,
    previewModalOpen,
    setPreviewModalOpen,
    isPlayingVideoPreview,
    setIsPlayingVideoPreview,
    videoUploadError,
    fileInputRef,
    videoFileInputRef,
    thumbnailFileInputRef,
    handleInputChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleVideoUpload,
    handleRemoveVideo,
    handleThumbnailUpload,
    handleRemoveThumbnail,
    handleAddSkill,
    handleRemoveSkill,
    handleSave,
    stripOuterQuotes,
    touched,
    setTouched,
  } = useProfilePsikologForm({ role })

  return (
    <div className="space-y-6 font-poppins pb-12">
      {/* ── 1. TOAST NOTIFIKASI SUKSES ── */}
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

      {/* ── 2. HEADER HALAMAN ── */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#561269] tracking-tight">
          {role === "admin" ? "Pengaturan Profil Admin Utama" : "Pengaturan Profil Psikolog"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          {role === "admin"
            ? "Kelola identitas, foto profil, dan informasi kontak akun administrator Empathika."
            : "Kelola profil profesional, foto profil, kredensial STR/SIPP, dan informasi yang tampil di halaman klien."}
        </p>
      </div>

      {/* ── 3. FORMULIR PROFIL LENGKAP ── */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Kartu Informasi Pokok & Identitas */}
        <CardInformasiDasar
          form={form}
          initials={initials}
          fileInputRef={fileInputRef}
          onPhotoUpload={handlePhotoUpload}
          onRemovePhoto={handleRemovePhoto}
          onChange={handleInputChange}
          onOpenPreview={() => setPreviewModalOpen(true)}
          stripOuterQuotes={stripOuterQuotes}
        />

        {/* Kartu Legalitas Praktik (Adaptif: Peer Konselor, Konselor, Psikolog) */}
        <CardLegalitasPraktik
          form={form}
          onChange={handleInputChange}
          touched={touched}
          setTouched={setTouched}
        />

        {/* Kartu Topik & Keahlian Konseling */}
        <CardTopikKeahlian
          keahlian={form.keahlian || []}
          newSkill={newSkill}
          setNewSkill={setNewSkill}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
        />

        {/* Kartu Media Video Perkenalan & Thumbnail Cover */}
        <CardMediaPerkenalan
          form={form}
          videoUploadError={videoUploadError}
          videoFileInputRef={videoFileInputRef}
          thumbnailFileInputRef={thumbnailFileInputRef}
          onVideoUpload={handleVideoUpload}
          onThumbnailUpload={handleThumbnailUpload}
          onRemoveVideo={handleRemoveVideo}
          onRemoveThumbnail={handleRemoveThumbnail}
        />

        {/* ── 4. BOTTOM ACTION BAR (TOMBOL SIMPAN UTAMA) ── */}
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
              disabled={isSaving}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full px-7 py-2.5 text-xs font-bold transition-all shadow-sm ${
                isSaving
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 hover:shadow-md active:scale-95 cursor-pointer"
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── 5. KEAMANAN AKUN & KREDENSIAL LOGIN (Komponen Terisolasi) ── */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-bold text-[#561269]">
            Keamanan Akun & Kredensial Login
          </h3>
          <p className="text-xs text-gray-500">
            Perubahan email dan kata sandi diproteksi dengan verifikasi keamanan ketat (OWASP ASVS).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <FormGantiEmail initialEmail={form.email} />
          <FormGantiPassword />
        </div>
      </div>

      {/* ── 6. MODAL PRATINJAU POV KLIEN (REPLIKA 1:1 DETAIL PSIKOLOG PUBLIK) ── */}
      <ModalPreviewClientPov
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        form={form}
        initials={initials}
        isPlayingVideoPreview={isPlayingVideoPreview}
        setIsPlayingVideoPreview={setIsPlayingVideoPreview}
        stripOuterQuotes={stripOuterQuotes}
      />
    </div>
  )
}
