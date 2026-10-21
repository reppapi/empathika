"use client"

import { useState } from "react"
import Image from "next/image"
import { TenagaAhli, StatusAkses } from "../../types"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import {
  X,
  Mail,
  Phone,
  AtSign,
  Award,
  BookOpen,
  Quote,
  Calendar,
  CheckCircle2,
  Lock,
  Edit,
  ShieldCheck,
  UserCheck,
} from "lucide-react"

interface PsikologDetailModalProps {
  isOpen: boolean
  onClose: () => void
  psikolog: TenagaAhli | null
  onEdit: (psikolog: TenagaAhli) => void
  onToggleAkses: (psikolog: TenagaAhli, newStatus: StatusAkses) => void
}

export default function PsikologDetailModal({
  isOpen,
  onClose,
  psikolog,
  onEdit,
  onToggleAkses,
}: PsikologDetailModalProps) {
  if (!isOpen || !psikolog) return null

  const isAktif = psikolog.statusAkses === "AKTIF"
  const isPsikolog = psikolog.kategori === "psikolog"

  const [isCopied, setIsCopied] = useState(false)

  const isTokenExpired = Boolean(
    psikolog.tokenExpiredAt && new Date(psikolog.tokenExpiredAt).getTime() < Date.now()
  )

  const formatExpiryDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return null
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return null
    }
  }

  const activationUrl = psikolog.tokenAktivasi
    ? typeof window !== "undefined"
      ? `${window.location.origin}/set-password?token=${psikolog.tokenAktivasi}`
      : `https://empathika.id/set-password?token=${psikolog.tokenAktivasi}`
    : ""

  const handleCopyLink = () => {
    if (!activationUrl) return
    navigator.clipboard.writeText(activationUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const initials = psikolog.nama
    ? psikolog.nama
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "PS"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md transition-all duration-300"
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
                Detail Tenaga Ahli
              </h3>
              <p className="text-xs text-gray-500">
                Informasi profil lengkap, kredensial legalitas, dan status hak akses web
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

        {/* Konten Modal (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 bg-[#FBFBFC]">
          {/* 1. Baris Profil Utama */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-purple-100 border border-purple-200 shrink-0 flex items-center justify-center shadow-xs">
                {psikolog.foto ? (
                  <Image src={psikolog.foto} alt={psikolog.nama} fill className="object-cover" />
                ) : (
                  <span className="text-xl sm:text-2xl font-black text-[#561269]">
                    {initials}
                  </span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                    {psikolog.nama}
                  </h4>
                  <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-[#561269] capitalize">
                    {psikolog.kategori.replace("-", " ")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  {psikolog.spesialisasi}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>Bergabung: {psikolog.tanggalBergabung || "Terdaftar"}</span>
                  <span>•</span>
                  <span>{psikolog.jumlahSesi || 0} Sesi Selesai</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit(psikolog)
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white hover:bg-purple-50 hover:text-[#561269] hover:border-purple-200 px-4 py-2 text-xs font-bold text-gray-700 shadow-2xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Profil
            </button>
          </div>

          {/* 2. Kartu Pengaturan Hak Akses Web (Pemindahan tombol dari tabel) */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50/70 to-white border border-purple-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#561269]" />
                  <h5 className="text-sm font-bold text-gray-900">
                    Status Hak Akses Web Psikolog
                  </h5>
                  <AdminStatusBadge variant={isAktif ? "success" : "neutral"} className="ml-1">
                    {isAktif ? "Akses Aktif" : "Akses Nonaktif"}
                  </AdminStatusBadge>
                </div>
                <p className="text-xs text-gray-500">
                  {isAktif
                    ? "Tenaga ahli saat ini diizinkan login ke portal web psikolog Empathika menggunakan kredensial email terdaftar."
                    : "Izin login web ditangguhkan. Tenaga ahli tidak dapat masuk ke sistem sampai akses diaktifkan kembali."}
                </p>
              </div>

              {/* Tombol Beri / Hapus Akses */}
              <button
                type="button"
                onClick={() => onToggleAkses(psikolog, isAktif ? "NONAKTIF" : "AKTIF")}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 ${
                  isAktif
                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 shadow-sm hover:shadow-md"
                }`}
              >
                {isAktif ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Hapus Akses Web
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    Beri Hak Akses Web
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Grid Informasi Kontak & Kredensial Akun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Informasi Kontak
              </p>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#561269] shrink-0" />
                  <span className="font-medium text-gray-900">{psikolog.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-gray-900">{psikolog.noTelepon || "-"}</span>
                </div>
                {psikolog.instagram && (
                  <div className="flex items-center gap-2.5">
                    <AtSign className="w-4 h-4 text-pink-600 shrink-0" />
                    <span className="font-medium text-gray-900">{psikolog.instagram}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs space-y-2.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Akun Login & Tautan Aktivasi
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Email Akun:</span>
                  <span className="font-semibold text-gray-800">{psikolog.email}</span>
                </div>

                {activationUrl ? (
                  <div className="space-y-1.5 pt-1.5 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="text-gray-500 text-[11px]">Tautan Aktivasi Akun:</span>
                      {isTokenExpired ? (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          ⚠️ Kedaluwarsa{psikolog.tokenExpiredAt ? ` (${formatExpiryDate(psikolog.tokenExpiredAt)})` : ""}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Aktif s/d {formatExpiryDate(psikolog.tokenExpiredAt) || "7 hari"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={activationUrl}
                        className="flex-1 rounded-xl border border-purple-200 bg-purple-50/40 px-2.5 py-1.5 text-[11px] font-mono text-purple-950 focus:outline-none select-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="shrink-0 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-purple-200 bg-white text-[#561269] hover:bg-purple-50 active:scale-95 transition shadow-2xs cursor-pointer"
                      >
                        {isCopied ? "✓ Tersalin!" : "Salin"}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 pt-0.5">
                      Tenaga ahli mengatur kata sandi secara mandiri melalui tautan ini.
                    </p>
                  </div>
                ) : (
                  <div className="pt-1.5 border-t border-gray-100">
                    <p className="text-[11px] text-gray-400">
                      Tautan aktivasi belum dibuat. Anda dapat membuatnya di menu <span className="font-semibold text-[#561269]">Edit Profil</span>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Legalitas & Pendidikan */}
          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-3">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Legalitas & Riwayat Pendidikan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-500 text-[11px] mb-1">Surat Tanda Registrasi (STR):</p>
                <p className="font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200/70">
                  {isPsikolog ? psikolog.noStr || "Belum diisi" : "Tidak memerlukan STR"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] mb-1">Surat Izin Praktik Psikologi (SIPP):</p>
                <p className="font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200/70">
                  {isPsikolog ? psikolog.noSipp || "Belum diisi" : "Tidak memerlukan SIPP"}
                </p>
              </div>
            </div>

            {psikolog.pendidikanText && (
              <div className="pt-2 border-t border-gray-100 flex items-start gap-2 text-xs">
                <BookOpen className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-800">Riwayat Pendidikan: </span>
                  <span className="text-gray-600">{psikolog.pendidikanText}</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Bio & Quote */}
          {(psikolog.bio || psikolog.quote) && (
            <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-3">
              {psikolog.quote && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs italic text-gray-700">
                  <Quote className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
                  <p>&ldquo;{psikolog.quote}&rdquo;</p>
                </div>
              )}

              {psikolog.bio && (
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Bio / Profil Ringkas:</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{psikolog.bio}</p>
                </div>
              )}
            </div>
          )}

          {/* 6. Daftar Keahlian */}
          {psikolog.keahlian && psikolog.keahlian.length > 0 && (
            <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#561269]" />
                <p className="text-xs font-bold text-gray-900">
                  Bidang Keahlian & Topik Konseling
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {psikolog.keahlian.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-xl bg-purple-50 border border-purple-200/80 px-3 py-1 text-xs font-medium text-[#561269]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition active:scale-95 cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              onEdit(psikolog)
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-xs sm:text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Edit Data Tenaga Ahli
          </button>
        </div>
      </div>
    </div>
  )
}
