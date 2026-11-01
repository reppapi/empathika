"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Phone,
  Award,
  Clock,
  CheckCircle2,
  Edit,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react"
import { INITIAL_TENAGA_AHLI } from "@/features/psikolog/data/initialData"
import type { TenagaAhli } from "@/features/psikolog/types"
import ActivationWarningModal from "@/components/common/ActivationWarningModal"
import GenerateActivationLinkButton from "./GenerateActivationLinkButton"
import { psikologService } from "@/services/psikolog.service"
import { pickActivationFromPayload } from "@/lib/activation"

interface Props {
  psikologId?: string
}

export default function AdminDetailPsikologClient({ psikologId }: Props = {}) {
  const params = useParams()
  const router = useRouter()
  const id = psikologId || (params?.id as string)

  const [form, setForm] = useState<TenagaAhli | null>(null)
  // accountId adalah ID dari tabel Account (bukan ID psikolog)
  const [realAccountId, setRealAccountId] = useState<string>("")
  const [activationToken, setActivationToken] = useState<string>("")
  const [tokenExpiredAt, setTokenExpiredAt] = useState<string>("")
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  // State Modal Peringatan
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false)
  const [warningMessage, setWarningMessage] = useState<string>("")

  // State Countdown sisa waktu real-time
  const [remainingTimeText, setRemainingTimeText] = useState<string>("")
  const [isTokenStillActive, setIsTokenStillActive] = useState<boolean>(false)

  const isAccountActive = Boolean(
    (form as any)?.accountAktif ||
    (form as any)?.account?.accountAktif ||
    (form as any)?.account?.password ||
    (form as any)?.aktif === true ||
    form?.statusAkses === "AKTIF" && form?.password
  )

  const fetchPsikologData = async () => {
    if (!id) return
    try {
      const res = await psikologService.getById(id)
      const dbData = res?.data || res
      if (dbData) {
        const katStr = (dbData.kategori || "").toLowerCase()
        const kategori = katStr.includes("peer")
          ? "peer-konselor"
          : katStr.includes("konselor")
          ? "konselor"
          : "psikolog"

        const act = pickActivationFromPayload(dbData)
        const mapped: TenagaAhli = {
          id: dbData.id,
          nama: dbData.nama_gelar || dbData.account?.nama || "Tenaga Ahli",
          email: dbData.account?.email || "",
          noTelepon: dbData.account?.no_telepon || "",
          kategori,
          statusAkses: dbData.status === "INACTIVE" ? "NONAKTIF" : "AKTIF",
          spesialisasi: dbData.spesialisasi?.nama || "Psikologi Klinis",
          noStr: dbData.no_str || undefined,
          noSipp: dbData.no_sipp || undefined,
          noSilp: dbData.no_silp || undefined,
          pendidikanText: dbData.pendidikan || "",
          jumlahSesi: typeof dbData.jumlah_sesi === "number" ? dbData.jumlah_sesi : 0,
          bio: dbData.bio || "",
          quote: dbData.quote || "",
          instagram: dbData.instagram || "",
          foto: dbData.foto || null,
          keahlian: Array.isArray(dbData.keahlian)
            ? dbData.keahlian
            : typeof dbData.keahlian === "string"
            ? dbData.keahlian.split(",").map((s: string) => s.trim())
            : [],
          tanggalBergabung: "Terdaftar di DB",
          accountId: act.accountId || undefined,
          accountAktif: act.accountAktif,
          tokenAktivasi: act.tokenAktivasi || undefined,
          tokenExpiredAt: act.tokenExpiredAt || undefined,
        }

        const accId = act.accountId || dbData.account?.id || dbData.id_account || ""
        if (accId) setRealAccountId(accId)
        setForm(mapped)
        if (act.tokenAktivasi) setActivationToken(act.tokenAktivasi)
        if (act.tokenExpiredAt) setTokenExpiredAt(act.tokenExpiredAt)
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn("Gagal mengambil data dari BE, mencoba fallback lokal:", err)
    }

    const found = INITIAL_TENAGA_AHLI.find((p) => p.id === id)
    if (found) {
      setForm(found)
      if (found.tokenAktivasi) setActivationToken(found.tokenAktivasi)
      if (found.tokenExpiredAt) setTokenExpiredAt(found.tokenExpiredAt)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPsikologData()
  }, [id])

  // Efek interval untuk menghitung sisa waktu countdown
  useEffect(() => {
    if (!tokenExpiredAt || !activationToken) {
      setIsTokenStillActive(false)
      setRemainingTimeText("")
      return
    }

    const calculateRemaining = () => {
      const now = Date.now()
      const expiry = new Date(tokenExpiredAt).getTime()
      const diff = expiry - now

      if (diff <= 0) {
        setIsTokenStillActive(false)
        setRemainingTimeText("Telah kedaluwarsa")
      } else {
        setIsTokenStillActive(true)
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)

        const parts: string[] = []
        if (days > 0) parts.push(`${days} hari`)
        if (hours > 0) parts.push(`${hours} jam`)
        if (minutes > 0 && days === 0) parts.push(`${minutes} menit`)
        setRemainingTimeText(parts.length > 0 ? parts.join(" ") : "kurang dari 1 menit")
      }
    }

    calculateRemaining()
    const timer = setInterval(calculateRemaining, 30000)
    return () => clearInterval(timer)
  }, [tokenExpiredAt, activationToken])

  const getActivationUrl = (tok: string) => {
    return typeof window !== "undefined"
      ? `${window.location.origin}/set-password?token=${tok}`
      : `https://empathika.id/set-password?token=${tok}`
  }

  const currentActivationUrl = activationToken ? getActivationUrl(activationToken) : ""

  const formatExpiryDisplay = (isoStr?: string) => {
    if (!isoStr) return "-"
    try {
      return new Date(isoStr).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return isoStr
    }
  }

  const handleCopyLink = () => {
    if (!currentActivationUrl) return
    navigator.clipboard.writeText(currentActivationUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleKirimWA = () => {
    if (!activationToken) {
      setWarningMessage("Token aktivasi belum tersedia. Silakan klik 'Generate Tautan' terlebih dahulu.")
      setWarningModalOpen(true)
      return
    }

    const finalActivationUrl = getActivationUrl(activationToken)
    const rawPhone = (form?.noTelepon || "").trim().replace(/[^0-9]/g, "")
    const waNumber = rawPhone
      ? rawPhone.startsWith("0")
        ? "62" + rawPhone.slice(1)
        : rawPhone.startsWith("62")
        ? rawPhone
        : "62" + rawPhone
      : ""

    const namaText = form?.nama.trim() || "Tenaga Ahli"
    const katText =
      form?.kategori === "psikolog"
        ? "Psikolog Klinis"
        : form?.kategori === "konselor"
        ? "Konselor Kesehatan Mental"
        : "Peer Konselor"

    const pesan =
      `Halo *${namaText}*, berikut adalah tautan resmi dari Tim Empathika untuk mengatur kata sandi atau mengaktifkan akun Tenaga Ahli (${katText}) Anda: 🌿\n\n` +
      `🔗 ${finalActivationUrl}\n\n` +
      `Catatan: Tautan ini berlaku selama 3 hari demi keamanan akun Anda. Jangan bagikan tautan ini ke siapa pun.\n\n` +
      `Salam hangat,\n*Tim Empathika*`

    const waUrl = waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`
      : `https://wa.me/?text=${encodeURIComponent(pesan)}`

    window.open(waUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Memuat profil psikolog...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Psikolog Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-4">Data psikolog dengan ID tersebut tidak ada.</p>
        <Link
          href="/admin/psikolog"
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
        >
          Kembali ke Daftar
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      {/* Modal Peringatan */}
      <ActivationWarningModal
        isOpen={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        message={warningMessage}
        expiryDateText={tokenExpiredAt ? formatExpiryDisplay(tokenExpiredAt) : undefined}
        remainingText={isTokenStillActive ? remainingTimeText : undefined}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Detail Tenaga Ahli</h1>
              <p className="text-sm text-slate-500">Lihat rincian informasi dan status akun</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/psikolog/edit/${form.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-medium text-sm shadow-sm"
            >
              <Edit className="w-4 h-4" />
              Edit Profil
            </Link>
          </div>
        </div>

        {/* Section Aktivasi Akun (Hanya tampil jika akun belum aktif) */}
        {!isAccountActive ? (
          <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>🔑 Tautan Aktivasi Akun</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Belum Diaktivasi
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Kirim tautan ini ke Tenaga Ahli agar mereka dapat membuat kata sandi pertama kali.
                </p>
              </div>

              {/* Status Sisa Waktu Token */}
              {activationToken && (
                <div className="text-right">
                  {isTokenStillActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Clock className="w-3.5 h-3.5" />
                      Bisa generate ulang dalam {remainingTimeText}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Tautan kedaluwarsa
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                readOnly
                value={currentActivationUrl}
                placeholder="Belum ada link aktivasi"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 select-all focus:outline-none"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={!activationToken}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? "Tersalin!" : "Salin Link"}
                </button>

                {/* Tombol Generate Link dari Server dengan Countdown & Modal Error */}
                <GenerateActivationLinkButton
                  accountId={realAccountId}
                  accountAktif={isAccountActive}
                  tokenAktivasi={activationToken}
                  tokenExpiredAt={tokenExpiredAt}
                  onUpdated={(next) => {
                    if (next.tokenAktivasi !== undefined) setActivationToken(next.tokenAktivasi || "")
                    if (next.tokenExpiredAt !== undefined) setTokenExpiredAt(next.tokenExpiredAt || "")
                    setIsCopied(false)
                  }}
                  onRefreshFromServer={fetchPsikologData}
                />

                <button
                  type="button"
                  onClick={handleKirimWA}
                  disabled={!activationToken}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Kirim WA
                </button>
              </div>
            </div>

            {tokenExpiredAt && (
              <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-2">
                <span>Masa berlaku link: {formatExpiryDisplay(tokenExpiredAt)}</span>
                {isTokenStillActive && (
                  <span className="text-amber-600 font-medium">
                    (Tombol generate ulang dinonaktifkan hingga batas waktu habis)
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Akun Telah Aktif</p>
                <p className="text-xs text-emerald-700">
                  Tenaga ahli ini telah mengatur kata sandi dan dapat langsung masuk ke portal.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-200 text-emerald-900">
              Password Sudah Diatur
            </span>
          </div>
        )}

        {/* Info Profil Utama */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4 border border-slate-100 rounded-xl bg-slate-50/50">
            <img
              src={form.foto || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2"}
              alt={form.nama}
              className="w-28 h-28 rounded-2xl object-cover mb-3 border-2 border-white shadow-md"
            />
            <h3 className="font-bold text-slate-900 text-base">{form.nama}</h3>
            <p className="text-xs text-teal-600 font-medium capitalize mt-0.5">{form.kategori}</p>
            <span
              className={`mt-3 px-3 py-1 text-[11px] font-semibold rounded-full ${
                form.statusAkses === "AKTIF"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {form.statusAkses === "AKTIF" ? "Akses Aktif" : "Nonaktif"}
            </span>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Kontak & Kredensial</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{form.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{form.noTelepon || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Award className="w-4 h-4 text-slate-400" />
                <span>STR: {form.noStr || "-"} | SIPP: {form.noSipp || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-bold text-slate-400 text-xs">💬</span>
                <span>
                  Sesi: {form.jumlahSesi || 0} sesi diselesaikan
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">Perkenalan Profil</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed mb-3">
                {form.bio || "Belum ada perkenalan profil."}
              </p>
            </div>
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">Keahlian & Topik</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {Array.isArray(form.keahlian) ? form.keahlian.join(", ") : form.keahlian || "Belum ada catatan topik keahlian khusus."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
