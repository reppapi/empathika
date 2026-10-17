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

  const dashboardTenantUrl =
    biro.dashboardUrl || `https://${biro.slug}.empathika.id/admin`
  const websiteTenantUrl =
    biro.websiteUrl || `https://${biro.slug}.empathika.id`

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => {
      setCopiedType(null)
    }, 2200)
  }

  const brandColor = biro.warnaIdentitas || "#561269"

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
            {/* Sisi Kiri: Deskripsi, Kontak, Alamat, Kode Warna & Slug/URL */}
            <div className="md:col-span-3 space-y-4">
              {/* Deskripsi */}
              <div className="rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-xs">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Deskripsi Biro / Komunitas
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {biro.deskripsi}
                </p>
              </div>

              {/* Data Detail Lengkap: Slug, Kode Warna, Telepon, Email, Alamat, Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Slug / Subdomain URL */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Slug / Subdomain URL
                  </p>
                  <p className="text-xs font-mono font-bold text-gray-800 mt-1 break-all">
                    {biro.slug}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    https://{biro.slug}.empathika.id
                  </p>
                </div>

                {/* Kode Warna Identitas */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Kode Warna Identitas
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-4 h-4 rounded-md border border-gray-200 shadow-xs"
                      style={{ backgroundColor: brandColor }}
                    />
                    <span className="text-xs font-mono font-bold text-gray-800">
                      {brandColor}
                    </span>
                  </div>
                </div>

                {/* Nomor Telepon */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    No. Telepon
                  </p>
                  <p className="text-xs font-semibold text-gray-900 mt-1">
                    {biro.telepon || "+62 812-3456-7890"}
                  </p>
                </div>

                {/* Email Admin Biro */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Email Admin Biro
                  </p>
                  <p className="text-xs font-semibold text-gray-900 mt-1 break-all">
                    {biro.emailAdmin}
                  </p>
                </div>

                {/* Alamat Kantor / Komunitas (Full Width on sm) */}
                <div className="sm:col-span-2 rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Alamat Kantor / Komunitas
                  </p>
                  <p className="text-xs font-semibold text-gray-800 mt-1 leading-relaxed">
                    {biro.alamat || "Indonesia"}
                  </p>
                </div>

                {/* Tanggal Registrasi */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Tanggal Registrasi
                  </p>
                  <p className="text-xs font-bold text-gray-800 mt-1">
                    {new Date(biro.tanggalDibuat).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Riwayat Aktivasi */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Riwayat Aktivasi
                  </p>
                  <p className="text-xs font-bold text-gray-800 mt-1">
                    {biro.tanggalAktivasi
                      ? new Date(biro.tanggalAktivasi).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Belum diaktivasi"}
                  </p>
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
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Biro ini baru dibuat dan membutuhkan aktivasi oleh admin sebelum tenant siap digunakan.
                      </p>

                      <div className="rounded-2xl bg-white p-3 border border-purple-200/80 shadow-xs space-y-1.5">
                        <p className="text-[11px] font-semibold text-gray-500">
                          Tautan Aktivasi (Simulasi):
                        </p>
                        <p className="text-[11px] font-mono text-purple-900 break-all select-all bg-purple-50/60 p-2 rounded-xl border border-purple-100">
                          {activationUrl}
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(activationUrl, "activation")}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-purple-200 text-[#561269] hover:bg-purple-50 transition active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {copiedType === "activation" ? "Tersalin!" : "Salin Tautan Aktivasi"}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSimulateAktivasi(biro)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Simulasikan Aktivasi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Aktif */}
                  {biro.statusAktivasi === "Aktif" && (
                    <div className="space-y-3 pt-1">
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                        Tenant telah aktif dan beroperasi penuh.
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-800">Dashboard Biro</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(dashboardTenantUrl, "dashboard")}
                              className="text-[10px] font-semibold text-[#561269] hover:underline"
                            >
                              {copiedType === "dashboard" ? "Tersalin!" : "Salin"}
                            </button>
                          </div>
                          <p className="text-[11px] font-mono text-gray-600 break-all select-all bg-gray-50 p-1.5 rounded-lg">
                            {dashboardTenantUrl}
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-800">Website Biro (Front)</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(websiteTenantUrl, "website")}
                              className="text-[10px] font-semibold text-[#561269] hover:underline"
                            >
                              {copiedType === "website" ? "Tersalin!" : "Salin"}
                            </button>
                          </div>
                          <p className="text-[11px] font-mono text-gray-600 break-all select-all bg-gray-50 p-1.5 rounded-lg">
                            {websiteTenantUrl}
                          </p>
                        </div>
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
