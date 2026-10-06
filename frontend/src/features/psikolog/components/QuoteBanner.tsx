export function QuoteBanner() {
  return (
    <div className="relative my-14 sm:my-20 w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Top-Left Quote Icon */}
      <span className="absolute -top-6 sm:-top-8 left-2 sm:left-4 text-4xl sm:text-6xl text-[#400B4D]/40 font-serif select-none z-10 leading-none">
        “
      </span>

      {/* Banner Container */}
      <div className="bg-gradient-to-r from-[#8E44AD] via-[#7D3C98] to-[#6C3483] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide uppercase text-center md:text-left shrink-0">
          Ruang Cerita & Pendengar
        </div>
        
        {/* Divider Line on Desktop */}
        <div className="hidden md:block h-12 w-[1.5px] bg-white/30" />

        <div className="text-sm sm:text-base md:text-lg text-white/95 font-medium text-center md:text-left leading-relaxed flex-1">
          Tidak perlu menghadapi semuanya sendirian. Langkah kecil untuk bercerita adalah awal dari pemulihan.
        </div>
      </div>

      {/* Bottom-Right Quote Icon */}
      <span className="absolute -bottom-8 sm:-bottom-10 right-2 sm:right-4 text-4xl sm:text-6xl text-[#400B4D]/40 font-serif select-none z-10 leading-none">
        ”
      </span>
    </div>
  )
}
