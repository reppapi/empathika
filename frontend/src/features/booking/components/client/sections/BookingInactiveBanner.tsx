"use client"

interface BookingInactiveBannerProps {
  namaLayanan: string
}

export function BookingInactiveBanner({ namaLayanan }: BookingInactiveBannerProps) {
  return (
    <div className="p-4 sm:p-5 bg-amber-50 border border-amber-300 rounded-[1.2rem] shadow-xs mb-8 flex items-center gap-3.5 animate-in fade-in duration-300">
      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-lg shrink-0">
        ⚠️
      </div>
      <div className="flex-1 text-left">
        <p className="text-xs sm:text-sm font-semibold text-amber-900">
          Layanan &ldquo;{namaLayanan}&rdquo; sedang dinonaktifkan oleh admin. Pendaftaran sesi untuk
          layanan ini sementara ditutup.
        </p>
      </div>
    </div>
  )
}
