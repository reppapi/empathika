"use client"

import React from "react"
import { PengajuanKerjaSama } from "../../types"

interface ModalLeadDetailProps {
  selectedLead: PengajuanKerjaSama | null
  onClose: () => void
  onUpdateStatus: (id: string, newStatus: PengajuanKerjaSama["status"]) => void
  onShowToast: (msg: string) => void
}

export default function ModalLeadDetail({
  selectedLead,
  onClose,
  onUpdateStatus,
  onShowToast,
}: ModalLeadDetailProps) {
  if (!selectedLead) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8">
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-5">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-[#561269] font-bold text-[11px] mb-1">
              {selectedLead.formTitle || `Formulir ${selectedLead.kategori}`}
            </span>
            <h3 className="text-xl font-extrabold text-gray-900 leading-tight">
              {selectedLead.namaInstansi}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Tanggal Pengajuan: <strong className="text-gray-700">{selectedLead.tanggal}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Kontak PIC Box */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-gray-800 block text-sm">
              {selectedLead.namaPIC}
            </span>
            <div className="text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                📱 WA: <strong className="text-[#561269]">{selectedLead.telepon}</strong>
              </span>
              <span>
                ✉️ Email: <strong>{selectedLead.email}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLead.status}
              onChange={(e) =>
                onUpdateStatus(selectedLead.id, e.target.value as PengajuanKerjaSama["status"])
              }
              className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
                selectedLead.status === "Menunggu"
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : selectedLead.status === "Dihubungi"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : selectedLead.status === "Disetujui"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-red-50 text-red-700 border-red-300"
              }`}
            >
              <option value="Menunggu">Menunggu</option>
              <option value="Dihubungi">Dihubungi</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            <a
              href={`https://wa.me/${selectedLead.telepon.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Halo ${selectedLead.namaPIC} dari ${selectedLead.namaInstansi}, kami dari tim Empathika telah menerima formulir pengajuan ${
                  selectedLead.formTitle || selectedLead.kategori
                }. Boleh kita diskusikan lebih lanjut?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs"
            >
              <span>Chat WA</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* List Pertanyaan & Jawaban Lengkap */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-[#561269] tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#561269]"></span>
            Rincian Jawaban Formulir Pengunjung:
          </h4>

          {selectedLead.jawabanDetail ? (
            <div className="grid grid-cols-1 gap-2.5">
              {Object.entries(selectedLead.jawabanDetail).map(([pertanyaan, jawaban]) => (
                <div
                  key={pertanyaan}
                  className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs hover:border-purple-200 transition"
                >
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    {pertanyaan}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {Array.isArray(jawaban) ? jawaban.join(", ") : String(jawaban || "-")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800">
              <p className="font-semibold text-gray-500 mb-1">Pesan / Permohonan:</p>
              <p className="whitespace-pre-wrap">{selectedLead.pesan}</p>
            </div>
          )}
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              const ringkasan = selectedLead.jawabanDetail
                ? Object.entries(selectedLead.jawabanDetail)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n")
                : selectedLead.pesan
              navigator.clipboard.writeText(ringkasan)
              onShowToast("Seluruh jawaban formulir berhasil disalin ke clipboard!")
            }}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>📋 Salin Ringkasan Jawaban</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#E8C32A] hover:bg-[#d4b024] text-gray-900 font-bold text-xs transition cursor-pointer shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
