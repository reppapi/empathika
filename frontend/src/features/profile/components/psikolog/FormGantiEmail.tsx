// File: frontend/src/features/profile/components/psikolog/FormGantiEmail.tsx
"use client"

import React, { useState, useEffect } from "react"
import { Mail, AlertCircle, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react"
import { accountSettingsService, PendingEmailResponse } from "@/services/account-settings.service"
import { emailChangeFormSchema } from "@/schemas/account-settings.schema"

interface FormGantiEmailProps {
  initialEmail?: string
  hideHeader?: boolean
}

export function FormGantiEmail({ initialEmail = "", hideHeader = false }: FormGantiEmailProps) {
  const [currentEmail, setCurrentEmail] = useState(initialEmail)
  const [newEmail, setNewEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [pendingData, setPendingData] = useState<PendingEmailResponse["pendingRequest"] | null>(null)

  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (initialEmail && initialEmail.trim()) {
      setCurrentEmail(initialEmail.trim())
    }
  }, [initialEmail])

  const fetchStatus = async () => {
    try {
      const data = await accountSettingsService.getPendingEmailChange()
      if (data?.currentEmail) {
        if (!initialEmail || initialEmail.trim() === "") {
          setCurrentEmail(data.currentEmail)
        }
      }
      setPendingData(data?.pendingRequest || null)
    } catch (err: any) {
      console.warn("Gagal memuat status email:", err?.message)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const validation = emailChangeFormSchema.safeParse({ newEmail, currentPassword })
    if (!validation.success) {
      setErrorMessage(validation.error.errors[0]?.message || "Input tidak valid")
      return
    }

    setLoading(true)
    try {
      const res = await accountSettingsService.requestEmailChange({ newEmail, currentPassword })
      setSuccessMessage(res.message)
      setNewEmail("")
      setCurrentPassword("")
      fetchStatus()
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengajukan perubahan email"
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPending = async () => {
    setCancelling(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const res = await accountSettingsService.cancelEmailChange()
      setSuccessMessage(res.message)
      setPendingData(null)
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Gagal membatalkan permohonan")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className={hideHeader ? "font-poppins" : "bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 font-poppins"}>
      {!hideHeader && (
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-50 text-[#561269]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pengaturan Alamat Email</h2>
            <p className="text-xs text-gray-500">Perbarui alamat email akun login Psikolog Anda</p>
          </div>
        </div>
      )}

      {/* Status Pending Banner */}
      {pendingData && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <p className="font-semibold text-sm">Menunggu Verifikasi Email Baru</p>
              <p className="mt-0.5">
                Tautan konfirmasi telah dikirim ke: <strong className="font-bold">{pendingData.newEmail}</strong>
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                Email Anda belum berganti sampai link tersebut diklik. Berlaku hingga:{" "}
                {new Date(pendingData.expiresAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelPending}
            disabled={cancelling}
            className="self-end sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
          >
            {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Batalkan
          </button>
        </div>
      )}

      {/* Alert Notifikasi */}
      {errorMessage && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Saat Ini (Read Only) */}
        <div>
          <label htmlFor="current-registered-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Email Saat Ini
          </label>
          <div className="relative">
            <input
              id="current-registered-email"
              type="email"
              value={currentEmail}
              disabled
              autoComplete="email"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed select-none"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Alamat email yang aktif saat ini untuk masuk ke akun Anda.</p>
        </div>

        {/* Input Email Baru */}
        <div>
          <label htmlFor="new-account-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Alamat Email Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="new-account-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nama@emailbaru.com"
              required
              autoComplete="email"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
          </div>
        </div>

        {/* Re-autentikasi: Password Saat Ini */}
        <div>
          <label htmlFor="current-account-password" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Kata Sandi Saat Ini <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="current-account-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password Anda saat ini"
              required
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Dibutuhkan untuk memverifikasi kepemilikan akun (OWASP ASVS).</p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !newEmail || !currentPassword}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#561269] text-white text-xs font-bold hover:bg-[#430e52] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Kirim Verifikasi ke Email Baru
          </button>
        </div>
      </form>
    </div>
  )
}
