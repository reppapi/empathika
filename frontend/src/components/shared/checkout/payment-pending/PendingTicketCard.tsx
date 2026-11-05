import { PendingConfig } from "./payment-pending.config"

interface PendingTicketCardProps {
  judul: string
  subjudul?: string
  tanggal: string
  tahun: string
  waktu: string
  nama: string
  orderId: string
  metodeLabel: string
  harga: string
  config: PendingConfig
}

export function PendingTicketCard({
  judul,
  subjudul,
  tanggal,
  tahun,
  waktu,
  nama,
  orderId,
  metodeLabel,
  harga,
  config,
}: PendingTicketCardProps) {
  return (
    <div className="w-full max-w-md rounded-xl border border-dashed border-[#C3A4CE] bg-[#FCFAFD] p-6 mb-6">
      {/* Header Tiket */}
      <div className="border-b border-dashed border-[#C3A4CE] pb-5 mb-5">
        <h3 className="text-xl font-extrabold text-[#2F2F2F]">{judul}</h3>
        {subjudul && <p className="text-xs text-gray-500 mt-1">{subjudul}</p>}
      </div>

      {/* Tanggal & Waktu */}
      <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-dashed border-[#C3A4CE]">
        <div>
          <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
            {config.tanggalLabel}
          </div>
          <div className="text-2xl font-extrabold text-[#2F2F2F]">{tanggal}</div>
          <div className="text-[8px] font-bold text-gray-500 uppercase">TAHUN {tahun}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
            {config.waktuLabel}
          </div>
          <div className="text-2xl font-extrabold text-[#2F2F2F]">{waktu}</div>
          <div className="text-[8px] font-bold text-gray-500 uppercase">WIB - SELESAI</div>
        </div>
      </div>

      {/* Nama & Order ID */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-[#C3A4CE]">
        <div>
          <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
            NAMA PEMESAN
          </div>
          <div className="text-sm font-extrabold text-[#2F2F2F]">{nama}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
            ORDER ID
          </div>
          <div className="text-xs font-bold text-[#2F2F2F]">{orderId}</div>
        </div>
      </div>

      {/* Keterangan Metode Pembayaran & Total */}
      <div className="pt-3 flex items-center justify-between">
        <div>
          <div className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
            METODE PEMBAYARAN
          </div>
          <div className="text-xs font-extrabold text-[#561269]">{metodeLabel}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
            {config.totalLabel}
          </div>
          <div className="text-sm font-extrabold text-[#561269]">{harga}</div>
        </div>
      </div>
    </div>
  )
}
