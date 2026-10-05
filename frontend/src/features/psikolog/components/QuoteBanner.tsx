export function QuoteBanner() {
  return (
    <div className="relative my-14 md:my-20 max-w-4xl mx-auto px-4">
      {/* Top-Left Large Quote Icon */}
      <span className="absolute -top-6 left-1 md:left-0 text-5xl md:text-6xl text-[#400B4D] font-serif select-none z-10 leading-none">
        “
      </span>

      {/* Purple Banner Container */}
      <div className="bg-[#8E44AD] text-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col sm:flex-row items-center justify-center gap-6 relative">
        <div className="text-xl md:text-2xl font-black tracking-widest uppercase">
          TEXTTEXT
        </div>
        
        {/* Divider Line */}
        <div className="hidden sm:block h-10 w-[1.5px] bg-white/50" />

        <div className="text-sm md:text-base text-white/90 font-medium text-center sm:text-left">
          texttext
        </div>
      </div>

      {/* Bottom-Right Large Quote Icon */}
      <span className="absolute -bottom-8 right-1 md:right-0 text-5xl md:text-6xl text-[#400B4D] font-serif select-none z-10 leading-none">
        ”
      </span>
    </div>
  )
}
