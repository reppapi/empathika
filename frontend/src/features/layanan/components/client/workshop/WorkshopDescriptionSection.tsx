import { CheckCircle2 } from "lucide-react"

interface WorkshopDescriptionSectionProps {
  intro: string
  benefits?: string[]
  additionalInfo?: string
  closing: string
}

export function WorkshopDescriptionSection({
  intro,
  benefits,
  additionalInfo,
  closing,
}: WorkshopDescriptionSectionProps) {
  return (
    <section className="w-full pt-14 pb-6 sm:pt-20 sm:pb-8 bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Teks Pengantar Utama (Di atas Manfaat) */}
        <p className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed font-medium mb-10 text-center sm:text-left whitespace-pre-wrap">
          {intro}
        </p>

        {/* Manfaat Workshop */}
        {benefits && benefits.length > 0 && (
          <div className="my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#F8EFFF] to-white border border-purple-100/80 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-[#561269] mb-4">
              Manfaat Workshop
            </h2>
            <ul className="space-y-3">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#EAB308] shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Penjelasan Kotak di Bawah Penjelasan Manfaat Workshop (Teks setelah Enter) */}
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

