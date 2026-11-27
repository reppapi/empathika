"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { testimoniService, TestimoniDetail } from "@/services/testimoni.service"

interface PageProps {
  params: { token: string }
}

const MAX_CHARS = 250

export default function TestimoniClientPage({ params }: PageProps) {
  const { token } = params

  const [detail, setDetail] = useState<TestimoniDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [isi, setIsi] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    testimoniService
      .getByToken(token)
      .then((res) => {
        if (!mounted) return
        setDetail(res.data)
        if (res.data.is_submitted) {
          setSubmitSuccess(true)
          if (res.data.isi) setIsi(res.data.isi)
          if (res.data.rating) setRating(res.data.rating)
        }
      })
      .catch((err) => {
        if (!mounted) return
        setFetchError(
          err?.response?.data?.message || "Tautan testimoni tidak ditemukan atau sudah tidak berlaku."
        )
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isi.trim()) {
      setErrorMessage("Silakan tuliskan ulasan testimoni Anda.")
      return
    }
    if (isi.trim().length < 5) {
      setErrorMessage("Testimoni minimal 5 karakter.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      await testimoniService.submitTestimoni(token, {
        rating,
        isi: isi.trim(),
      })
      setSubmitSuccess(true)
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Gagal mengirimkan testimoni. Silakan coba lagi."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-7 h-7 text-[#561269] animate-spin mb-2.5" />
        <p className="text-sm text-gray-500">Memuat formulir...</p>
      </div>
    )
  }

  if (fetchError || !detail) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md border border-gray-200 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1.5">Tautan Tidak Valid</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {fetchError || "Tautan testimoni ini tidak ditemukan atau sudah kedaluwarsa."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 font-poppins">
      <div className="w-full max-w-md bg-white border border-purple-100 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(86,18,105,0.06)]">
        {submitSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-[#561269] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Terima Kasih!</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Testimoni Anda telah tersimpan dan sangat berarti bagi kami.
            </p>
            <div className="pt-2 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            {isi && (
              <p className="text-xs text-gray-600 bg-purple-50/50 border border-purple-100 rounded-xl p-3 italic">
                &ldquo;{isi}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-1">
              <span className="inline-block text-[11px] font-semibold tracking-wide uppercase text-[#561269] bg-purple-50 px-3 py-1 rounded-full">
                Form Testimoni
              </span>
              <h1 className="text-xl font-bold text-gray-900 pt-1">
                Bagaimana Sesi Anda?
              </h1>
            </div>

            {/* Info Psikolog */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/40 border border-purple-100/80">
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-purple-100 shrink-0">
                <Image
                  src={detail.psikolog.foto || "/images/psikolog/default.jpg"}
                  alt={detail.psikolog.nama}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {detail.psikolog.nama}
                </p>
                <p className="text-xs text-gray-500 truncate">{detail.layanan}</p>
              </div>
            </div>

            {/* Rating Bintang */}
            <div className="text-center space-y-2">
              <p className="text-xs font-medium text-gray-600">Penilaian Anda</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Input Ulasan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">
                  Ulasan Anda <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400">
                  {isi.length} / {MAX_CHARS}
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={MAX_CHARS}
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                placeholder="Ceritakan pengalaman konseling Anda secara singkat..."
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/15 resize-none transition"
              />
              <p className="text-[11px] text-gray-400">
                Identitas Anda bersifat rahasia sehingga privacy Anda akan tetap terjaga.
              </p>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-[#561269] hover:bg-[#430c52] text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <span>Kirim Testimoni</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
