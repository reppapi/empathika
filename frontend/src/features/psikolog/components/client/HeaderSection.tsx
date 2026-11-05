interface HeaderSectionProps {
  kategoriAktif?: string
}

export function HeaderSection({ kategoriAktif = "semua" }: HeaderSectionProps) {
  const isPeer = kategoriAktif === "peer-konselor"
  const isKonselor = kategoriAktif === "konselor"

  const title = isPeer
    ? "Peer Konselor kami"
    : isKonselor
      ? "Konselor kami"
      : "Psikolog kami"

  return (
    <div className="w-full overflow-hidden">
      {/* Curved Purple Hero Banner (Menyatu dari tepi atas 0px ke bawah arch) */}
      <div 
        className="w-full pt-28 sm:pt-32 pb-16 sm:pb-20 bg-gradient-to-b from-[#8B3A9C] via-[#651877] to-[#400B4D] shadow-md text-center px-4 sm:px-6 lg:px-8 transition-all duration-300 [border-bottom-left-radius:50%_60px] [border-bottom-right-radius:50%_60px] sm:[border-bottom-left-radius:50%_80px] sm:[border-bottom-right-radius:50%_80px] lg:[border-bottom-left-radius:50%_120px] lg:[border-bottom-right-radius:50%_120px]"
      >
        <div className="max-w-4xl mx-auto overflow-hidden">
          <h1 
            key={title}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-tight transition-all duration-500 ease-out animate-fade-in"
          >
            {title}
          </h1>
          <p className="mt-2 text-purple-200 text-xs sm:text-sm lg:text-base max-w-xl mx-auto font-light transition-all duration-500 ease-out">
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
