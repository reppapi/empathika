interface SeminarProgramItem {
  name: string
  description: string
}

interface SeminarDescriptionSectionProps {
  intro: string
  programs: SeminarProgramItem[]
  additionalInfo?: string
  closing?: string
}

export function SeminarDescriptionSection({
  intro,
  programs,
  additionalInfo,
  closing,
}: SeminarDescriptionSectionProps) {
  return (
    <section className="w-full pt-14 pb-6 sm:pt-20 sm:pb-8 bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Teks Pengantar Utama (Di atas Program/Manfaat Seminar) */}
        <p className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed font-medium mb-10 text-center sm:text-left whitespace-pre-wrap">
          {intro}
        </p>

        {/* 2 Program (Seminar & Seminar-Healing) Tersusun Rapi */}
        {programs && programs.length > 0 && (
          <div className="space-y-6 sm:space-y-7 my-8">
            {programs.map((prog, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#F8EFFF] to-white border border-purple-100/80 shadow-xs"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-[#561269] mb-3">
                  {prog.name}
                </h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {prog.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Penjelasan Kotak di Bawah Manfaat / Program Seminar (Teks Setelah Enter) */}
        {additionalInfo && (
          <div className="my-6 p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {additionalInfo}
            </p>
          </div>
        )}

        {/* Teks Penutup */}
        {closing && (
          <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center sm:text-left whitespace-pre-wrap">
              {closing}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
