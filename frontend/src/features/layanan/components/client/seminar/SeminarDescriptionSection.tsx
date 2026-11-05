interface SeminarProgramItem {
  name: string
  description: string
}

interface SeminarDescriptionSectionProps {
  intro: string
  programs: SeminarProgramItem[]
  closing: string
}

export function SeminarDescriptionSection({
  intro,
  programs,
  closing,
}: SeminarDescriptionSectionProps) {
  return (
    <section className="w-full pt-14 pb-6 sm:pt-20 sm:pb-8 bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Teks Pengantar Utama */}
        <p className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed font-medium mb-10 text-center sm:text-left">
          {intro}
        </p>

        {/* 2 Program (Seminar & Seminar-Healing) Tersusun Rapi */}
        <div className="space-y-6 sm:space-y-7 my-8">
          {programs.map((prog, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#F8EFFF] to-white border border-purple-100/80 shadow-xs"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#561269] mb-3">
                {prog.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {prog.description}
              </p>
            </div>
          ))}
        </div>

        {/* Teks Penutup */}
        <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center sm:text-left">
            {closing}
          </p>
        </div>
      </div>
    </section>
  )
}
