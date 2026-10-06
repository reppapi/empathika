export function HeaderSection() {
  return (
    <div className="w-full overflow-hidden">
      {/* Curved Purple Hero Banner (Menyatu dari tepi atas 0px ke bawah arch) */}
      <div 
        className="w-full pt-28 sm:pt-36 md:pt-40 lg:pt-44 pb-20 sm:pb-28 md:pb-32 lg:pb-36 bg-gradient-to-b from-[#8B3A9C] via-[#651877] to-[#400B4D] shadow-xl text-center px-4 sm:px-6 lg:px-8 transition-all duration-300 [border-bottom-left-radius:50%_80px] [border-bottom-right-radius:50%_80px] sm:[border-bottom-left-radius:50%_120px] sm:[border-bottom-right-radius:50%_120px] md:[border-bottom-left-radius:50%_160px] md:[border-bottom-right-radius:50%_160px] lg:[border-bottom-left-radius:50%_200px] lg:[border-bottom-right-radius:50%_200px]"
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-wide drop-shadow-sm leading-tight">
            Psikolog kami
          </h1>
          <p className="mt-3 text-purple-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light">
            Temukan tenaga profesional berlisensi yang siap mendengarkan dan mendampingi perjalanan kesehatan mental Anda.
          </p>
        </div>
      </div>

      {/* Description Text below the curved banner */}
      <div className="w-full max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 md:mt-14">
        <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
          Setiap psikolog dan konselor di Empathika telah melewati proses verifikasi kualifikasi profesional serta berkomitmen memberikan ruang yang aman, rahasia, dan bebas stigma.
        </p>
      </div>
    </div>
  )
}
