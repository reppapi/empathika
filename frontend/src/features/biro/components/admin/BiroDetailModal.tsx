"use client"

import { useState } from "react"
import Image from "next/image"
import { BiroKomunitas } from "../../types"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"

interface BiroDetailModalProps {
  isOpen: boolean
  onClose: () => void
  biro: BiroKomunitas | null
  onEdit: (biro: BiroKomunitas) => void
  onSimulateAktivasi: (biro: BiroKomunitas) => void
}

export default function BiroDetailModal({
  isOpen,
  onClose,
  biro,
  onEdit,
  onSimulateAktivasi,
}: BiroDetailModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null)

  if (!isOpen || !biro) return null

  // Tautan simulasi
  const activationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tenant-activate?token=${biro.aktivasiToken || `act_${biro.id}`}&tenant=${biro.slug}`
      : `https://empathika.id/tenant-activate?token=${biro.aktivasiToken || `act_${biro.id}`}&tenant=${biro.slug}`

  const websiteTenantUrl =
    biro.websiteUrl || `https://${biro.slug}.empathika.id`

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => {
      setCopiedType(null)
    }, 2200)
  }

  const handleKirimWA = () => {
    const rawPhone = (biro.telepon || "").trim().replace(/[^0-9]/g, "")
    const waNumber = rawPhone
      ? rawPhone.startsWith("0")
        ? "62" + rawPhone.slice(1)
        : rawPhone.startsWith("62")
        ? rawPhone
        : "62" + rawPhone
      : ""

    const namaText = biro.nama.trim() || "Biro Mitra"
    const pesan =
      `Halo *${namaText}*, selamat bergabung di ekosistem Empathika! 🌿\n\n` +
      `Biro/Komunitas Anda telah berhasil didaftarkan di platform kami. ` +
      `Silakan klik tautan resmi di bawah ini untuk mengaktifkan akun dan mengatur kata sandi admin biro Anda:\n\n` +
      `🔗 ${activationUrl}\n\n` +
      `Catatan: Tautan aktivasi ini berlaku selama 3 hari demi keamanan akun Anda. Jangan bagikan tautan ini ke siapa pun.\n\n` +
      `Salam hangat,\n*Tim Empathika*`

    const waUrl = waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(pesan)}`

    window.open(waUrl, "_blank")
  }

  const brandColor = biro.warnaIdentitas || "#561269"

  // Komponen Kartu Link Aktivasi Akun yang menyatu dengan aksi WhatsApp
  const renderActivationCard = (infoText: string) => (
    <div className="rounded-2xl bg-white p-3.5 sm:p-4 border border-purple-200/90 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#561269] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span className="text-xs font-bold text-gray-900">Link Aktivasi Akun</span>
        </div>
        <button
          type="button"
          onClick={() => handleCopy(activationUrl, "activation")}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#561269] hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition active:scale-95 cursor-pointer"
          title="Salin tautan aktivasi"
        >
          {copiedType === "activation" ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-700">Tersalin!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Salin Link</span>
            </>
          )}
        </button>
      </div>

      <div className="text-[11px] font-mono text-purple-950 break-all select-all bg-purple-50/70 p-2.5 rounded-xl border border-purple-100 leading-relaxed">
        {activationUrl}
      </div>

      <p className="text-[11px] text-gray-500 leading-snug">
        {infoText}
      </p>

      {/* Tombol WhatsApp di dalam wadah Link Aktivasi */}
      <button
        type="button"
        onClick={handleKirimWA}
        className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xs hover:shadow-sm transition active:scale-95 cursor-pointer"
        title="Kirim link aktivasi"
      >
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <span>Kirim Link Aktivasi</span>
      </button>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-[28px] bg-white shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal Bersih & Rapi */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-8 rounded-full"
              style={{ backgroundColor: brandColor }}
            />
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                Detail Biro & Komunitas
              </h3>
              <p className="text-xs text-gray-500">
                Informasi profil mitra, alamat, kontak, dan alur aktivasi multi-tenant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition active:scale-95"
            aria-label="Tutup popup"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Konten Utama Terpadu */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 bg-[#FBFBFC]">
          {/* Baris Profil: Logo, Nama, Status & Tombol Edit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-4">
              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 bg-slate-50 shrink-0 flex items-center justify-center shadow-xs"
                style={{ borderColor: brandColor }}
              >
                {biro.logo ? (
                  <Image src={biro.logo} alt={biro.nama} fill className="object-cover" />
                ) : (
                  <span
                    className="text-xl sm:text-2xl font-black uppercase"
                    style={{ color: brandColor }}
                  >
                    {biro.nama.slice(0, 2)}
                  </span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <AdminStatusBadge
                    className="w-44"
                    variant={
                      biro.statusAktivasi === "Aktif"
                        ? "success"
                        : biro.statusAktivasi === "Menunggu Aktivasi"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {biro.statusAktivasi === "Aktif"
                      ? "Aktif Beroperasi"
                      : biro.statusAktivasi}
                  </AdminStatusBadge>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  {biro.nama}
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-0.5">
                  <span>subdomain:</span>
                  <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                    {biro.slug}.empathika.id
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit(biro)
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-gray-950 bg-[#EAB308] hover:bg-[#CA8A04] shadow-sm hover:shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Biro
            </button>
          </div>

          {/* Grid Informasi Detail & Alur Multi-Tenant */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {/* Sisi Kiri: Satu Kotak Terpadu Informasi & Kontak Biro */}
            <div className="md:col-span-3">
              <div className="rounded-3xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                {/* Deskripsi */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Deskripsi Biro / Komunitas
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {biro.deskripsi}
                  </p>
                </div>

                <div className="border-t border-gray-100" />

                {/* Detail Data Biro */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5">
                    Informasi & Identitas Mitra
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                    {/* Email Admin */}
                    <div>
                      <span className="text-gray-400 text-[11px] font-medium block">
                        Email Admin Biro
                      </span>
                      <span className="font-semibold text-gray-900 break-all mt-0.5 block">
                        {biro.emailAdmin}
                      </span>
                    </div>

                    {/* Nomor Telepon */}
                    <div>
                      <span className="text-gray-400 text-[11px] font-medium block">
                        No. Telepon / Hotline
                      </span>
                      <span className="font-semibold text-gray-900 mt-0.5 block">
                        {biro.telepon || "+62 812-3456-7890"}
                      </span>
                    </div>

                    {/* Slug / Subdomain URL */}
                    <div>
                      <span className="text-gray-400 text-[11px] font-medium block">
                        Slug & Subdomain URL
                      </span>
                      <span className="font-mono font-semibold text-[#561269] break-all mt-0.5 block">
                        https://{biro.slug}.empathika.id
                      </span>
                    </div>

                    {/* Kode Warna Identitas */}
                    <div>
                      <span className="text-gray-400 text-[11px] font-medium block">
                        Kode Warna Identitas
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="w-4 h-4 rounded-md border border-gray-200 shadow-2xs shrink-0"
                          style={{ backgroundColor: brandColor }}
                        />
                        <span className="font-mono font-bold text-gray-800">
                          {brandColor}
                        </span>
                      </div>
                    </div>

                    {/* Alamat Kantor / Komunitas */}
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 text-[11px] font-medium block">
                        Alamat Kantor / Komunitas
                      </span>
                      <span className="font-semibold text-gray-800 leading-relaxed mt-0.5 block">
                        {biro.alamat || "Indonesia"}
                      </span>
                    </div>

                    {/* Tanggal Registrasi */}
                    <div>
                      <span className="text-gray-400 text-[11px] font-medium block">
                        Tanggal Registrasi
                      </span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">
                        {new Date(biro.tanggalDibuat).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Riwayat Aktivasi */}
                    <div>
                      <span className="text-gray-400 text-[11px] font-medium block">
                        Riwayat Aktivasi
                      </span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">
                        {biro.tanggalAktivasi
                          ? new Date(biro.tanggalAktivasi).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Belum diaktivasi"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Alur Simulasi Multi-Tenant */}
            <div className="md:col-span-2">
              <div className="rounded-3xl border border-purple-200/80 bg-gradient-to-br from-purple-50/60 via-white to-pink-50/20 p-5 shadow-xs space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#561269] text-white flex items-center justify-center shadow-xs shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Alur Multi-Tenant</h4>
                      <p className="text-xs text-gray-500">Konfigurasi hak akses tenant</p>
                    </div>
                  </div>

                  {/* Menunggu Aktivasi */}
                  {biro.statusAktivasi === "Menunggu Aktivasi" && (
                    <div className="space-y-3 pt-1">
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                        Biro ini baru didaftarkan dan belum diaktivasi. Kirimkan tautan di bawah agar admin biro dapat mengaktifkan akun dan mengatur kata sandi.
                      </div>

                      {renderActivationCard(
                        `Klik tombol di bawah untuk langsung mengirimkan tautan aktivasi ini ke WhatsApp mitra${biro.telepon ? ` (${biro.telepon})` : ""}:`
                      )}

                      <button
                        type="button"
                        onClick={() => onSimulateAktivasi(biro)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Simulasikan Aktivasi Langsung
                      </button>
                    </div>
                  )}

                  {/* Aktif */}
                  {biro.statusAktivasi === "Aktif" && (
                    <div className="space-y-3 pt-1">
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Tenant telah aktif dan beroperasi penuh.</span>
                      </div>

                      {/* Link Aktivasi Akun (Menggantikan Dashboard Biro) */}
                      {renderActivationCard(
                        `Tautan aktivasi untuk admin biro. Kirimkan via WhatsApp jika mitra perlu aktivasi ulang atau mengatur kata sandi:`
                      )}

                      {/* Website Biro (Front) */}
                      <div className="p-3 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-800">Website Biro (Front)</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(websiteTenantUrl, "website")}
                            className="text-[10px] font-semibold text-[#561269] hover:underline cursor-pointer"
                          >
                            {copiedType === "website" ? "Tersalin!" : "Salin"}
                          </button>
                        </div>
                        <p className="text-[11px] font-mono text-gray-600 break-all select-all bg-gray-50 p-1.5 rounded-lg">
                          {websiteTenantUrl}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Nonaktif */}
                  {biro.statusAktivasi === "Nonaktif" && (
                    <div className="space-y-3 pt-1">
                      <div className="p-3 rounded-2xl bg-gray-100 border border-gray-300 text-xs text-gray-800">
                        Tenant ini sedang dinonaktifkan.
                      </div>
                      <button
                        type="button"
                        onClick={() => onSimulateAktivasi(biro)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95"
                      >
                        Aktifkan Kembali Tenant
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 sm:px-8 py-3.5 bg-white flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs sm:text-sm font-bold text-gray-950 bg-[#EAB308] hover:bg-[#CA8A04] shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
