"use client"

interface JadwalCustomTimeSectionProps {
  isCustomTime: boolean
  setIsCustomTime: (v: boolean) => void
  customStart: string
  setCustomStart: (v: string) => void
  customEnd: string
  setCustomEnd: (v: string) => void
  onAddCustomTime: () => void
}

export default function JadwalCustomTimeSection({
  isCustomTime,
  setIsCustomTime,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  onAddCustomTime,
}: JadwalCustomTimeSectionProps) {
  return (
    <div
      className={`border rounded-xl px-4 py-2.5 transition-colors cursor-pointer ${
        isCustomTime
          ? "border-[#561269] bg-purple-50/70 shadow-2xs"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
      }`}
    >
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isCustomTime}
          onChange={() => setIsCustomTime(!isCustomTime)}
          className="w-4 h-4 text-[#561269] focus:ring-[#561269] rounded border-gray-300 cursor-pointer"
        />
        <span className="text-[13px] font-medium text-gray-700">
          Tentukan Jam Kustom Sendiri
        </span>
      </label>

      {isCustomTime && (
        <div className="flex flex-col gap-2 pl-7 pt-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                Jam Mulai
              </span>
              <input
                type="time"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full text-xs font-semibold p-1.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
              />
            </div>
            <span className="text-gray-400 mt-4 text-xs font-bold">-</span>
            <div className="flex-1">
              <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                Jam Selesai
              </span>
              <input
                type="time"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full text-xs font-semibold p-1.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddCustomTime()
            }}
            className="text-left text-xs font-semibold text-[#561269] hover:text-[#3d0b4b] hover:underline cursor-pointer pt-0.5"
          >
            + Tambahkan ke Pilihan Jam
          </button>
        </div>
      )}
    </div>
  )
}

