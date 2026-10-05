export function HeaderSection() {
  return (
    <div className="w-full">
      {/* Curved Purple Hero Banner (Setengah Lingkaran / Arch) */}
      <div 
        className="-mt-36 lg:-mt-24 pt-44 lg:pt-40 pb-28 md:pb-36 lg:pb-44 bg-gradient-to-b from-[#8B3A9C] via-[#651877] to-[#400B4D] shadow-xl text-center px-4 transition-all duration-300 [border-bottom-left-radius:50%_100px] [border-bottom-right-radius:50%_100px] md:[border-bottom-left-radius:50%_160px] md:[border-bottom-right-radius:50%_160px] lg:[border-bottom-left-radius:50%_200px] lg:[border-bottom-right-radius:50%_200px]"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow-sm">
          Psikolog kami
        </h1>
      </div>

      {/* Description Text below the curved banner */}
      <div className="max-w-4xl mx-auto text-center px-4 mt-10 md:mt-14">
        <p className="text-gray-700 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </div>
    </div>
  )
}
