"use client"

// =====================================================================
// ModalInvoice.tsx
// Modal admin untuk pratinjau teks invoice WhatsApp dan kirim ke WA.
// Menampilkan:
//  - Pratinjau teks pesan persis seperti yang diterima klien
//  - Nomor WA tujuan + status validasi
//  - Tombol "Salin Teks" + "Kirim ke WhatsApp"
//  - Badge status pengiriman (Belum Dikirim / Sudah Dikirim / Gagal)
//  - Loading dan error states
// =====================================================================

import { useState, useEffect, useCallback } from "react"
import {
  X,
  FileText,
  Copy,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { invoiceService, type InvoiceApiData } from "@/services/invoice.service"

interface ModalInvoiceProps {
  transaksiId: string | null | undefined
  namaKlien: string
  isPaid: boolean
  onClose: () => void
}

// ── Format status kirim ke label Indonesia ──────────────────────────
function labelStatusKirim(status: InvoiceApiData["status_kirim"] | undefined): {
  label: string
  color: string
} {
  switch (status) {
    case "DIKIRIM":
      return { label: "Sudah Dikirim", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
    case "GAGAL":
      return { label: "Gagal", color: "text-red-700 bg-red-50 border-red-200" }
    default:
      return { label: "Belum Dikirim", color: "text-amber-700 bg-amber-50 border-amber-200" }
  }
}

// ── Format tanggal Indonesia ──────────────────────────────────────────
function formatTglIndo(isoStr: string | null | undefined): string {
  if (!isoStr) return "-"
  const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]
  const date = new Date(isoStr)
  // Konversi ke WIB
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  return `${wib.getUTCDate()} ${MONTHS[wib.getUTCMonth()]} ${wib.getUTCFullYear()}, ${String(wib.getUTCHours()).padStart(2, "0")}:${String(wib.getUTCMinutes()).padStart(2, "0")} WIB`
}

export default function ModalInvoice({
  transaksiId,
  namaKlien,
  isPaid,
  onClose,
}: ModalInvoiceProps) {
  const [invoice, setInvoice] = useState<InvoiceApiData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

  // ── Fetch invoice saat modal dibuka ─────────────────────────────
  const fetchInvoice = useCallback(async () => {
    if (!transaksiId || !isPaid) return
    setLoading(true)
    setError(null)
    try {
      const data = await invoiceService.getOrCreate(transaksiId)
      setInvoice(data)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat invoice. Coba lagi."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [transaksiId, isPaid])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  // ── Salin teks pesan ke clipboard ───────────────────────────────
  const handleCopy = async () => {
    if (!invoice?.pesan_wa) return
    await navigator.clipboard.writeText(invoice.pesan_wa)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ── Kirim ke WhatsApp (opsi A: buka tab baru wa.me) ─────────────
  const handleSendWA = async () => {
    if (!transaksiId || sendLoading) return
    setSendLoading(true)
    setSendError(null)
    try {
      const { url } = await invoiceService.getWaUrl(transaksiId)
      // Buka tab WhatsApp
      window.open(url, "_blank", "noopener,noreferrer")
      // Tandai sudah dikirim di backend
      const updated = await invoiceService.markSent(transaksiId)
      setInvoice((prev) => prev ? { ...prev, ...updated, pesan_wa: prev.pesan_wa, wa_valid: prev.wa_valid, wa_error: prev.wa_error, wa_normalized: prev.wa_normalized } : updated)
      setSendSuccess(true)
      setTimeout(() => setSendSuccess(false), 3000)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengirim invoice ke WhatsApp."
      setSendError(msg)
    } finally {
      setSendLoading(false)
    }
  }

  if (!transaksiId) return null

  const statusInfo = labelStatusKirim(invoice?.status_kirim)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 pb-4 sticky top-0 bg-white z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                Invoice WhatsApp
              </h3>
              <p className="text-xs text-gray-500">{namaKlien}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* ── Jika tidak PAID ── */}
          {!isPaid && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-amber-800">
                Invoice hanya tersedia untuk transaksi yang sudah dibayar.
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Pastikan status pembayaran adalah PAID sebelum menerbitkan invoice.
              </p>
            </div>
          )}

          {/* ── Loading ── */}
          {isPaid && loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-8 h-8 text-[#561269] animate-spin" />
              <p className="text-sm text-gray-500">Memuat invoice...</p>
            </div>
          )}

          {/* ── Error fetch ── */}
          {isPaid && !loading && error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm font-semibold text-red-700 mb-1">
                Gagal memuat invoice
              </p>
              <p className="text-xs text-red-600">{error}</p>
              <button
                type="button"
                onClick={fetchInvoice}
                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-red-700 hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Coba Lagi
              </button>
            </div>
          )}

          {/* ── Invoice tersedia ── */}
          {isPaid && !loading && !error && invoice && (
            <>
              {/* Info nomor & status kirim */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Nomor Invoice
                  </p>
                  <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                    {invoice.nomor}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              {/* Waktu kirim terakhir */}
              {invoice.sent_at && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Dikirim: {formatTglIndo(invoice.sent_at)}
                    {invoice.sent_by_admin && ` oleh ${invoice.sent_by_admin}`}
                  </span>
                </div>
              )}

              {/* Nomor WA tujuan */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  Nomor WhatsApp Tujuan
                </p>
                {invoice.wa_valid ? (
                  <p className="text-sm font-bold text-gray-900">
                    {invoice.no_wa_client}
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      → {invoice.wa_normalized}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-red-600 font-medium">
                    {invoice.wa_error || "Nomor WhatsApp tidak valid atau tidak tersedia."}
                  </p>
                )}
              </div>

              {/* Pratinjau teks pesan */}
              <div className="relative">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Pratinjau Pesan WhatsApp
                </p>
                <div className="bg-[#E5DDD5] rounded-2xl p-4 font-mono text-xs text-gray-900 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto border border-[#d4c8c0]">
                  {/* Render teks dengan *bold* ditampilkan sebagai bold */}
                  {invoice.pesan_wa
                    ? renderWaText(invoice.pesan_wa)
                    : "Teks pesan belum tersedia."}
                </div>
              </div>

              {/* Error kirim */}
              {sendError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {sendError}
                </div>
              )}

              {/* Success kirim */}
              {sendSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Invoice berhasil dibuka di WhatsApp dan status telah diperbarui.
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer Tombol ── */}
        {isPaid && !loading && !error && invoice && (
          <div className="flex items-center justify-between gap-2 p-6 pt-0 border-t border-gray-100 mt-2">
            {/* Salin teks */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!invoice.pesan_wa}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Salin teks pesan invoice ke clipboard"
            >
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Tersalin!" : "Salin Teks"}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
              {/* Kirim ke WhatsApp */}
              <button
                type="button"
                onClick={handleSendWA}
                disabled={!invoice.wa_valid || sendLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                title={
                  !invoice.wa_valid
                    ? invoice.wa_error ?? "Nomor WA tidak valid"
                    : "Kirim invoice ke WhatsApp klien"
                }
              >
                {sendLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5" />
                )}
                Kirim ke WhatsApp
                {!sendLoading && <ExternalLink className="w-3 h-3 opacity-70" />}
              </button>
            </div>
          </div>
        )}

        {/* Footer jika tidak paid atau error */}
        {(!isPaid || error) && (
          <div className="flex justify-end p-6 pt-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Render teks WA dengan *bold* → <strong> ──────────────────────────
function renderWaText(text: string): React.ReactNode {
  const lines = text.split("\n")
  return (
    <>
      {lines.map((line, i) => {
        // Parse *teks* menjadi <strong>
        const parts = line.split(/(\*[^*]+\*)/g)
        return (
          <span key={i}>
            {parts.map((part, j) => {
              if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
                return <strong key={j}>{part.slice(1, -1)}</strong>
              }
              // Parse _teks_ menjadi <em>
              if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
                return <em key={j}>{part.slice(1, -1)}</em>
              }
              return <span key={j}>{part}</span>
            })}
            {i < lines.length - 1 && "\n"}
          </span>
        )
      })}
    </>
  )
}
