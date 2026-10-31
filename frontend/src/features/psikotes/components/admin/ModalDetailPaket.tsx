import React from "react";
import { X } from "lucide-react";
import { AdminStatusBadge } from "@/components/shared/AdminDataTable";
import type { JudulPsikotesItem, PaketDetailItem } from "../../types/adminPsikotes";

export interface ModalDetailPaketProps {
  judul: JudulPsikotesItem | null;
  onClose: () => void;
  onToggleStatus: (paket: PaketDetailItem) => void;
}

export default function ModalDetailPaket({
  judul,
  onClose,
  onToggleStatus,
}: ModalDetailPaketProps) {
  if (!judul) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 font-poppins">
        {/* Modal Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 shadow-inner">
              <img src={judul.image} alt={judul.judul} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-snug">{judul.judul}</h3>
              <span className="text-xs font-semibold text-[#561269] bg-purple-50 px-2.5 py-0.5 rounded-md">
                {judul.kategori}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Overview Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Deskripsi Instrumen
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
              {judul.deskripsi}
            </p>
          </div>

          {/* Package Details Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Pengelolaan Status Varian Paket (Gratis &amp; Berbayar)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Paket Gratis */}
              {(() => {
                const paketGratis = judul.paketList.find((p) => p.jenisAkses === "Gratis");
                if (paketGratis) {
                  return (
                    <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            Paket Gratis
                          </span>
                          <AdminStatusBadge
                            variant={paketGratis.status === "Aktif" ? "success" : "warning"}
                            className="w-24 text-[10px]"
                          >
                            {paketGratis.status === "Aktif" ? "Dipublikasi" : "Draf"}
                          </AdminStatusBadge>
                        </div>
                        <h5 className="font-extrabold text-xl text-gray-900 mb-1">Rp 0</h5>
                        <p className="text-xs text-gray-600 mb-3">{paketGratis.deskripsi}</p>
                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 pt-2 border-t border-emerald-100">
                          <span>Soal: {paketGratis.jumlahSoal} butir</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(paketGratis)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          paketGratis.status === "Aktif"
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {paketGratis.status === "Aktif" ? "Nonaktifkan (Jadikan Draf)" : "Publikasikan (Aktifkan)"}
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col justify-center items-center text-center p-6 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-200 px-2.5 py-0.5 rounded-full">
                        Paket Gratis
                      </span>
                      <p className="text-xs text-gray-500">Judul ini tidak memiliki varian paket gratis.</p>
                    </div>
                  );
                }
              })()}

              {/* Card Paket Berbayar */}
              {(() => {
                const paketBerbayar = judul.paketList.find((p) => p.jenisAkses === "Berbayar");
                if (paketBerbayar) {
                  return (
                    <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/20 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#561269] bg-purple-100 px-2.5 py-0.5 rounded-full">
                            Paket Berbayar
                          </span>
                          <AdminStatusBadge
                            variant={paketBerbayar.status === "Aktif" ? "success" : "warning"}
                            className="w-24 text-[10px]"
                          >
                            {paketBerbayar.status === "Aktif" ? "Dipublikasi" : "Draf"}
                          </AdminStatusBadge>
                        </div>
                        <h5 className="font-extrabold text-xl text-[#561269] mb-1">{paketBerbayar.harga}</h5>
                        <p className="text-xs text-gray-600 mb-3">{paketBerbayar.deskripsi}</p>
                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 pt-2 border-t border-purple-100">
                          <span>Soal: {paketBerbayar.jumlahSoal} butir</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(paketBerbayar)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          paketBerbayar.status === "Aktif"
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-[#561269] hover:bg-[#763E8B] text-white"
                        }`}
                      >
                        {paketBerbayar.status === "Aktif" ? "Nonaktifkan (Jadikan Draf)" : "Publikasikan (Aktifkan)"}
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col justify-center items-center text-center p-6 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-200 px-2.5 py-0.5 rounded-full">
                        Paket Berbayar
                      </span>
                      <p className="text-xs text-gray-500">Judul ini tidak memiliki varian paket berbayar.</p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-xs text-gray-500">
            Total {judul.paketList.length} paket terdaftar pada judul ini.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
