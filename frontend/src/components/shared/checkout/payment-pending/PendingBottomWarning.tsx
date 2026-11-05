interface PendingBottomWarningProps {
  warningText: string
  seconds: number
  onCancel: (reason?: string) => void
}

export function PendingBottomWarning({
  warningText,
  seconds,
  onCancel,
}: PendingBottomWarningProps) {
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4">
      {/* Warning Box */}
      <div className="w-full rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex gap-2.5 items-start">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="#D97706"
          className="w-5 h-5 shrink-0 mt-0.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <p className="text-xs text-amber-800 font-medium">{warningText}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8B3A9C] to-[#651877] rounded-full transition-all duration-1000"
            style={{ width: `${((300 - seconds) / 300) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-gray-400">0:00</span>
          <span className="text-[10px] text-gray-400">5:00</span>
        </div>
      </div>

      {/* Tombol Batal */}
      <button
        onClick={() => onCancel("Pembayaran dibatalkan oleh pengguna.")}
        className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors mt-2 cursor-pointer"
      >
        Batalkan &amp; kembali ke pembayaran
      </button>
    </div>
  )
}
