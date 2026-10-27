"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { authService } from "@/services/auth.service"

function SetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(Boolean(token))
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [tokenValid, setTokenValid] = useState(false)

  useEffect(() => {
    let active = true

    const verify = async () => {
      if (!token) {
        setIsChecking(false)
        setTokenValid(false)
        setError("Token aktivasi tidak ditemukan pada URL. Silakan periksa kembali tautan yang dikirimkan oleh admin.")
        return
      }

      setIsChecking(true)
      setError("")
      try {
        const res = await authService.checkActivation(token)
        if (!active) return

        if (res?.alreadyActive || res?.reason === "already_active") {
          router.replace("/login?status=already-active")
          return
        }

        if (res?.valid) {
          setTokenValid(true)
          return
        }

        setTokenValid(false)
        setError(
          res?.message ||
            "Tautan aktivasi tidak valid atau sudah tidak berlaku. Silakan hubungi admin untuk tautan baru."
        )
      } catch (err: any) {
        if (!active) return
        const alreadyActive = err.response?.data?.alreadyActive || err.response?.data?.reason === "already_active"
        if (alreadyActive) {
          router.replace("/login?status=already-active")
          return
        }
        setTokenValid(false)
        setError(
          err.response?.data?.message ||
            err.message ||
            "Tautan aktivasi tidak valid atau telah kedaluwarsa. Silakan hubungi admin untuk tautan baru."
        )
      } finally {
        if (active) setIsChecking(false)
      }
    }

    verify()
    return () => {
      active = false
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Token aktivasi tidak ditemukan pada URL. Silakan periksa kembali tautan yang dikirimkan oleh admin.")
      return
    }

    if (password.length < 8) {
      setError("Kata sandi minimal harus 8 karakter.")
      return
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok. Harap periksa kembali.")
      return
    }

    setIsLoading(true)

    try {
      const res = await authService.setPassword({
        token,
        password,
      })

      if (res.success) {
        setSuccessMessage(res.message || "Kata sandi berhasil dibuat dan akun Anda telah aktif!")
        setTimeout(() => {
          router.push("/login?status=activated")
        }, 2500)
      } else {
        setError(res.message || "Gagal mengaktifkan akun. Silakan coba kembali.")
      }
    } catch (err: any) {
      const alreadyActive = err.response?.data?.alreadyActive || err.response?.data?.errorCode === "ACCOUNT_ALREADY_ACTIVE"
      if (alreadyActive) {
        router.replace("/login?status=already-active")
        return
      }
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Tautan aktivasi tidak valid atau telah kedaluwarsa. Silakan hubungi admin untuk tautan baru."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-poppins selection:bg-[#561269]/20 selection:text-[#561269]">

      {/* ── Kiri: Form Aktivasi Bersih (Sama seperti Form Login) ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 bg-white">
        <div className="w-full max-w-md flex flex-col items-center">

          {/* Logo */}
          <div className="w-20 h-20 rounded-full bg-[#561269] shadow-md flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-white">E</span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#561269] mb-3">
              Aktivasi Akun<br />Empathika
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed px-4">
              Silakan buat kata sandi baru Anda<br />untuk mengaktifkan akun dan melanjutkan ke portal.
            </p>
          </div>

          {isChecking && (
            <div className="w-full mb-5 p-3.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-[#561269] border-t-transparent rounded-full animate-spin" />
              <span>Memeriksa tautan aktivasi...</span>
            </div>
          )}

          {/* Token / tautan tidak valid */}
          {!isChecking && error && (
            <div className="w-full mb-5 p-3.5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Tautan aktivasi tidak dapat digunakan</p>
                <p className="text-xs text-amber-700 mt-0.5">{error}</p>
                <Link href="/login" className="inline-block mt-3 text-xs font-bold text-[#561269] hover:underline">
                  Kembali ke halaman masuk
                </Link>
              </div>
            </div>
          )}

          {/* Notifikasi Berhasil */}
          {successMessage ? (
            <div className="w-full text-center py-8">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Aktivasi Berhasil!</h2>
              <p className="text-sm text-gray-600 mt-2 px-4">{successMessage}</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="w-4 h-4 border-2 border-[#561269] border-t-transparent rounded-full animate-spin" />
                <span>Mengalihkan ke halaman masuk...</span>
              </div>
              <div className="mt-6">
                <Link
                  href="/login?status=activated"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#561269] hover:underline"
                >
                  Klik di sini jika tidak beralih otomatis <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : tokenValid && !isChecking ? (
            <form onSubmit={handleSubmit} className="w-full space-y-5">

              {/* Password Baru */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-800">Kata Sandi Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || !token}
                    required
                    minLength={8}
                    className="w-full pl-11 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-400 text-sm"
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#561269] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-800">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || !token}
                    required
                    minLength={8}
                    className="w-full pl-11 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-400 text-sm"
                    placeholder="Ketik ulang kata sandi baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#561269] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-full text-gray-950 font-bold bg-[#EAB308] hover:bg-[#CA8A04] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EAB308] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Mengaktifkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Aktifkan Akun</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Link ke Login */}
              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-gray-500 hover:text-[#561269] transition-colors"
                >
                  Sudah memiliki kata sandi? <span className="font-bold text-[#561269]">Masuk di sini</span>
                </Link>
              </div>

            </form>
          ) : null}

        </div>
      </div>

      {/* ── Kanan: Visual Empathika (Fluid Mesh Gradient - Sama persis dengan Login) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1c0524] flex-col justify-end p-16 overflow-hidden rounded-l-[3rem] shadow-[-20px_0_50px_-15px_rgba(86,18,105,0.15)]">

        {/* --- Organic Mesh Gradient Blobs --- */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-[100%] bg-[#701a8a] opacity-70 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-[100%] bg-[#360842] opacity-90 blur-[100px] pointer-events-none" />
        <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#a347c7] opacity-40 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-20%] w-[70%] h-[70%] rounded-full bg-[#20042b] opacity-80 blur-[100px] pointer-events-none" />

        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#0a000d]/90 pointer-events-none mix-blend-multiply" />

        {/* Quote Card (Glassmorphism) */}
        <div className="relative z-10 w-full max-w-sm ml-auto bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20">
          <div className="text-5xl text-white/30 font-serif leading-none mb-3">&ldquo;</div>
          <p className="text-white font-bold text-lg leading-relaxed mb-6">
            Setiap perjalanan penyembuhan dimulai dengan langkah kecil untuk memahami diri sendiri.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-white/40" />
            <span className="text-white/80 text-xs font-bold tracking-widest uppercase">Empathika Care</span>
          </div>
        </div>

      </div>

    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  )
}
