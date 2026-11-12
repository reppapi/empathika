// File: frontend/src/app/verifikasi-email/page.tsx
"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react"
import { accountSettingsService } from "@/services/account-settings.service"

function VerifikasiEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("Memverifikasi perubahan email Anda...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Tautan verifikasi tidak lengkap atau token tidak ditemukan.")
      return
    }

    accountSettingsService
      .verifyEmail(token)
      .then((res) => {
        setStatus("success")
        setMessage(res.message || "Email akun Anda berhasil diperbarui.")
      })
      .catch((err) => {
        setStatus("error")
        const errMsg = err.response?.data?.message || "Tautan verifikasi tidak valid atau telah kedaluwarsa."
        setMessage(errMsg)
      })
  }, [token])

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col items-center justify-center px-4 py-12 font-poppins">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl text-center">
        {status === "loading" && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-14 h-14 text-[#561269] animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-gray-900">Sedang Memproses</h2>
            <p className="text-xs text-gray-500">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Verifikasi Berhasil!</h2>
            <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#561269] text-white text-xs font-bold rounded-xl hover:bg-[#430e52] transition shadow-md active:scale-95"
              >
                Masuk ke Akun Anda
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Verifikasi Gagal</h2>
            <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Kembali ke Halaman Login
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Empathika Layanan Psikologi. Seluruh hak cipta dilindungi.
      </p>
    </div>
  )
}

export default function VerifikasiEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center font-poppins">
          <Loader2 className="w-8 h-8 text-[#561269] animate-spin" />
        </div>
      }
    >
      <VerifikasiEmailContent />
    </Suspense>
  )
}
