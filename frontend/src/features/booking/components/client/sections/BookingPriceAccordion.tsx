"use client"

import { DaftarHargaItem } from "@/features/booking/types/booking.types"

interface BookingPriceAccordionProps {
  daftarHarga: DaftarHargaItem[]
  openAccordion: string | null
  onToggle: (id: string) => void
}

export function BookingPriceAccordion({
  daftarHarga,
  openAccordion,
  onToggle,
}: BookingPriceAccordionProps) {
  return (
    <>
      <h2 className="text-left text-xl font-extrabold text-[#561269] mb-6 drop-shadow-sm">
        Daftar Harga
      </h2>

      <div className="bg-white rounded-[1.5rem] shadow-sm p-6 sm:p-10 mb-16 border border-gray-100">
        {/* Header Table */}
        <div className="grid grid-cols-3 text-center mb-4">
          <div className="text-left font-extrabold text-[#561269] text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
            Konsultasi
          </div>
          <div className="font-extrabold text-[#561269] text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
            Weekday
          </div>
          <div className="font-extrabold text-[#561269] text-[17px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
            Weekend
          </div>
        </div>

        <hr className="border-t-2 border-[#DCD0E1]" />

        {/* Rows */}
        <div className="flex flex-col">
          {daftarHarga.map((item) => {
            const isOpen = openAccordion === item.id
            return (
              <div key={item.id} className="flex flex-col">
                <div
                  className="grid grid-cols-3 items-center py-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onToggle(item.id)}
                >
                  <div className="flex items-center gap-2 font-bold text-[#561269] text-[15px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                    <span className="[text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">{item.title}</span>
                  </div>
                  <div className="text-center font-bold text-[#561269] text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
                    {item.weekday}
                  </div>
                  <div className="text-center font-bold text-[#561269] text-[14px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">
                    {item.weekend}
                  </div>
                </div>

                {/* Accordion Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-20 opacity-100 pb-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pl-6 text-[11px] font-medium text-[#561269] pr-4 sm:w-1/2">
                    {item.description}
                  </div>
                </div>

                <hr className="border-t-2 border-[#DCD0E1]" />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
