// File: frontend/src/features/profile/components/psikolog/FormGantiPassword.tsx
"use client"

import React, { useState } from "react"
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { PasswordStrengthMeter } from "./PasswordStrengthMeter"
import { passwordChangeFormSchema } from "@/schemas/account-settings.schema"
import { accountSettingsService } from "@/services/account-settings.service"
import { removeAuthCookie } from "@/lib/cookie"

export function FormGantiPassword() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleLogoutAndRedirect = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("remember_me")
    localStorage.removeItem("empathika-auth")
    sessionStorage.removeItem("access_token")
    removeAuthCookie("access_token")
    removeAuthCookie("remember_me")
    setTimeout(() => {
      window.location.href = "/login?notice=password_changed"
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const validation = passwordChangeFormSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword,
    })

    if (!validation.success) {
      setErrorMessage(validation.error.errors[0]?.message || "Input password tidak valid")
      return
    }

    setLoading(true)
    try {
      const res = await accountSettingsService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      })
      setSuccessMessage(res.message + " Mengarahkan ke halaman login...")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      handleLogoutAndRedirect()
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengubah password"
      setErrorMessage(msg)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 font-poppins">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2.5 rounded-xl bg-purple-50 text-[#561269]">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Perbarui Kata Sandi</h2>
          <p className="text-xs text-gray-500">Pastikan menggunakan kombinasi kata sandi yang aman dan tidak mudah ditebak</p>
        </div>
      </div>

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
        {/* Password Lama */}
        <div>
          <label htmlFor="old-account-password" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Kata Sandi Lama <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="old-account-password"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan kata sandi lama Anda"
              required
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Baru */}
        <div>
          <label htmlFor="new-account-password" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Kata Sandi Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="new-account-password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter unik"
              required
              autoComplete="new-password"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Indikator Kekuatan Password */}
          <PasswordStrengthMeter password={newPassword} />
        </div>

        {/* Konfirmasi Password Baru */}
        <div>
          <label htmlFor="confirm-account-password" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirm-account-password"
              type={showConfirm ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              required
              autoComplete="new-password"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmNewPassword}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#561269] text-white text-xs font-bold hover:bg-[#430e52] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Simpan Perubahan Kata Sandi
          </button>
        </div>
      </form>
    </div>
  )
}
