export function PendingStepper() {
  return (
    <div className="w-full pt-32 pb-10 flex flex-col items-center bg-white border-b border-gray-100">
      <div className="flex items-center w-full max-w-sm justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-1 text-sm">
            1
          </div>
          <span className="text-[10px] sm:text-xs text-gray-700">paket</span>
        </div>
        <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-4"></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-1 text-sm">
            2
          </div>
          <span className="text-[10px] sm:text-xs text-gray-700">jadwal</span>
        </div>
        <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-4"></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-[#561269] text-white flex items-center justify-center font-medium mb-1 text-sm shadow">
            3
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-[#561269]">Bayar</span>
        </div>
      </div>
    </div>
  )
}
