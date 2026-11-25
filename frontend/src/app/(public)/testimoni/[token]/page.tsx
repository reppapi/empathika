"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, CheckCircle2, AlertCircle, HeartHandshake, Loader2, ArrowLeft } from "lucide-react"
import { testimoniService, TestimoniDetail } from "@/services/testimoni.service"

interface PageProps {
  params: { token: string }
}

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
      <div className="min-h-screen bg-[#FDFBFD] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#561269] animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-500">Memuat formulir testimoni...</p>
      </div>
    )
  }

  if (fetchError || !detail) {
    return (
      <div className="min-h-screen bg-[#FDFBFD] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-7 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tautan Tidak Valid</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
            {fetchError || "Tautan testimoni ini tidak ditemukan atau sudah kedaluwarsa."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#561269] text-white text-xs font-semibold hover:bg-[#430c52] transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF5FD] via-[#FDFBFD] to-white flex flex-col items-center justify-center p-4 sm:p-6 font-poppins">
      <div className="w-full max-w-lg bg-white border border-purple-100/80 rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(86,18,105,0.06)]">
        {submitSuccess ? (
          <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#561269] tracking-tight">
                Terima Kasih Banyak!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                Testimoni Anda sangat berarti bagi perkembangan layanan konseling Empathika serta membantu klien lain menemukan kenyamanan yang sama.
              </p>
            </div>

            {/* Rekap ulasan */}
            <div className="bg-[#FAF5FD] border border-purple-100 rounded-2xl p-4 text-left space-y-2.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#561269]">Ulasan Terkirim</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                &ldquo;{isi}&rdquo;
              </p>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-purple-100/60 flex items-center justify-between">
                <span>Konseling bersama: {detail.psikolog.nama}</span>
                <span className="text-emerald-700 font-medium">✓ Terverifikasi</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#561269] text-white text-xs font-semibold hover:bg-[#430c52] transition shadow-md cursor-pointer"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Form */}
            <div className="text-center space-y-2 pb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5FD] border border-purple-200 text-[#561269] text-xs font-semibold mb-1">
                <HeartHandshake className="w-3.5 h-3.5 text-[#561269]" />
                Layanan Konseling Selesai
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Berikan Testimoni Anda
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Ceritakan pengalaman konseling Anda bersama{" "}
                <span className="font-semibold text-gray-800">{detail.psikolog.nama}</span>
              </p>
            </div>

            {/* Info Singkat Psikolog */}
            <div className="flex items-center gap-3.5 bg-[#FAF5FD] border border-purple-100/80 rounded-2xl p-3.5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-purple-100 shrink-0 border border-purple-200">
                <Image
                  src={detail.psikolog.foto || "/images/psikolog/default.jpg"}
                  alt={detail.psikolog.nama}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                  {detail.psikolog.nama}
                </h3>
                <p className="text-[11px] text-gray-500 truncate">
                  {detail.layanan} • {detail.psikolog.kategori}
                </p>
              </div>
            </div>

            {/* Rating Bintang 1-5 */}
            <div className="space-y-2 text-center">
              <label className="text-xs font-semibold text-gray-700">
                Tingkat Kepuasan Sesi Konseling
              </label>
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-hidden"
                      title={`${star} Bintang`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          active
                            ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                            : "text-gray-200 hover:text-gray-300"
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-amber-700 font-medium">
                {rating === 5 && "Luar Biasa Membantu ★★★★★"}
                {rating === 4 && "Sangat Baik ★★★★☆"}
                {rating === 3 && "Cukup Baik ★★★☆☆"}
                {rating === 2 && "Kurang Memuaskan ★★☆☆☆"}
                {rating === 1 && "Perlu Banyak Perbaikan ★☆☆☆☆"}
              </p>
            </div>

            {/* Kolom Isi Testimoni */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="isi" className="text-xs font-semibold text-gray-700">
                  Ulasan & Cerita Pengalaman Anda <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-gray-400">{isi.length} / 1000 karakter</span>
              </div>
              <textarea
                id="isi"
                rows={4}
                maxLength={1000}
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                placeholder="Bagikan apa yang Anda rasakan setelah sesi konseling, kenyamanan saat bercerita, atau hal positif yang Anda dapatkan..."
                className="w-full text-xs sm:text-sm rounded-2xl border border-gray-200 p-3.5 focus:border-[#561269] focus:ring-2 focus:ring-purple-200/50 outline-hidden transition resize-none leading-relaxed text-gray-800 placeholder:text-gray-400"
              />
              <p className="text-[10px] text-gray-400">
                Nama Anda akan disamarkan secara otomatis demi menjaga privasi dan kenyamanan.
              </p>
            </div>

            {/* Pesan Error */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={isSubmitting || !isi.trim()}
              className="w-full py-3.5 rounded-full bg-[#561269] hover:bg-[#430c52] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan...</span>
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
