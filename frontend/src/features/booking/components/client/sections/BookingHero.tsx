"use client"

import HeroStarryOverlay from "@/components/shared/HeroStarryOverlay"

interface BookingHeroProps {
  isBiro: boolean
  biroName?: string | null
}

export function BookingHero({ isBiro, biroName }: BookingHeroProps) {
  return (
    <div className="w-full overflow-hidden">
      <div
        className="curved-hero-banner relative w-full pt-28 sm:pt-32 pb-16 sm:pb-20 bg-gradient-to-b from-[#8B3A9C] via-[#651877] to-[#400B4D] shadow-md text-center px-4 sm:px-6 lg:px-8 transition-all duration-300 [border-bottom-left-radius:50%_60px] [border-bottom-right-radius:50%_60px] sm:[border-bottom-left-radius:50%_80px] sm:[border-bottom-right-radius:50%_80px] lg:[border-bottom-left-radius:50%_120px] lg:[border-bottom-right-radius:50%_120px] overflow-hidden"
        style={
          isBiro
            ? {
                backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, var(--biro-theme-color, #561269) 82%, white) 0%, var(--biro-theme-color, #561269) 50%, color-mix(in srgb, var(--biro-theme-color, #561269) 55%, black) 100%)`,
              }
            : undefined
        }
      >
        <HeroStarryOverlay />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-tight">
            Jadwalkan Sesi Konsultasi Anda
          </h1>
          <p
            className={`mt-2 ${
              isBiro ? "text-white/80" : "text-purple-200"
            } text-xs sm:text-sm lg:text-base max-w-xl mx-auto font-light`}
          >
            Temukan profesional yang tepat dan mulai perjalanan pemulihan Anda bersama{" "}
            {isBiro ? biroName || "Biro" : "Empathika"}.
          </p>
        </div>
      </div>
    </div>
  )
}
