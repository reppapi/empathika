"use client"

import React from "react"
import { Eye, X, Phone, FileText, ExternalLink, Globe, HelpCircle } from "lucide-react"
import { InternshipApplication } from "@/services/internship.service"

interface ModalApplicationDetailProps {
  selectedApp: InternshipApplication | null
  onClose: () => void
  modalStatus: InternshipApplication["status"]
  setModalStatus: (status: InternshipApplication["status"]) => void
  modalCatatan: string
  setModalCatatan: (catatan: string) => void
  onSaveStatus: () => void
  updatingStatus: boolean
  formatDateTime: (dateStr: string) => string
}

export function ModalApplicationDetail({
  selectedApp,
  onClose,
  modalStatus,
  setModalStatus,
  modalCatatan,
  setModalCatatan,
  onSaveStatus,
  updatingStatus,
  formatDateTime,
}: ModalApplicationDetailProps) {
  if (!selectedApp) return null

  return (
    <div className="fixed inset-0 z-50 !m-0 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-7 shadow-xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Putih Bersih */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{selectedApp.nama}</h3>
            <p className="text-xs text-gray-500">
              Detail Pelamar Magang • {selectedApp.positionTitle} • Dikirim{" "}
              {formatDateTime(selectedApp.createdAt)}
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-sm">
          {/* Profil & Kontak */}
          <div className="p-3.5 bg-gray-50 rounded-xl space-y-2.5">
            <span className="text-xs text-gray-500 font-medium block">
              Informasi Kontak & Pendidikan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block">Email:</span>
                <a
                  href={`mailto:${selectedApp.email}`}
                  className="font-bold text-gray-900 hover:text-[#561269] transition-colors break-all"
                >
                  {selectedApp.email}
                </a>
              </div>
              <div>
                <span className="text-gray-500 block">Nomor WhatsApp:</span>
                <a
                  href={`https://wa.me/${selectedApp.telepon.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedApp.telepon}</span>
                </a>
              </div>
              <div>
                <span className="text-gray-500 block">Universitas / Institusi:</span>
                <span className="font-bold text-gray-900">{selectedApp.universitas}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Jurusan & Semester:</span>
                <span className="font-bold text-gray-900">
                  {selectedApp.jurusan || "-"} {selectedApp.semester ? `(Sem. ${selectedApp.semester})` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Berkas & Portofolio */}
          <div className="p-3.5 bg-gray-50 rounded-xl space-y-2">
            <span className="text-xs text-gray-500 font-medium block">
              Berkas & Portofolio
            </span>
            <div className="flex flex-wrap gap-2.5">
              {selectedApp.cvUrl && (
                <a
                  href={selectedApp.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors"
                >
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Buka CV / Resume</span>
                  <ExternalLink className="w-3 h-3 text-emerald-700" />
                </a>
              )}

              {selectedApp.portfolioUrl && (
                <a
                  href={selectedApp.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 text-[#561269] border border-purple-200 font-bold text-xs hover:bg-purple-100 transition-colors"
                >
                  <Globe className="w-4 h-4 text-[#561269]" />
                  <span>Buka Portofolio / LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-[#561269]" />
                </a>
              )}
            </div>
          </div>

          {/* Jawaban Pertanyaan Seleksi */}
          <div className="p-3.5 bg-gray-50 rounded-xl space-y-2.5">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#561269]" />
              <span>Jawaban Pertanyaan Seleksi</span>
            </span>

            {selectedApp.jawaban && selectedApp.jawaban.length > 0 ? (
              <div className="space-y-2.5">
                {selectedApp.jawaban.map((j, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200/80 rounded-xl p-3 space-y-1"
                  >
                    <p className="text-xs font-bold text-gray-700">
                      {idx + 1}. {j.question}
                    </p>
                    <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {j.answer || "-"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Tidak ada butir pertanyaan khusus.</p>
            )}
          </div>

          {/* Tindakan & Catatan Admin */}
          <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl space-y-3">
            <span className="text-xs text-[#561269] font-bold block">
              Tindakan & Catatan Admin
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Status Lamaran
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) =>
                    setModalStatus(e.target.value as InternshipApplication["status"])
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] bg-white font-bold"
                >
                  <option value="MENUNGGU">Menunggu (Pending)</option>
                  <option value="REVIEW">Di-Review (Dalam Seleksi)</option>
                  <option value="DITERIMA">Diterima (Lolos)</option>
                  <option value="DITOLAK">Ditolak (Tidak Lolos)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Hubungi Pelamar Langsung
                </label>
                <a
                  href={`https://wa.me/${selectedApp.telepon.replace(
                    /\D/g,
                    ""
                  )}?text=${encodeURIComponent(
                    `Halo ${selectedApp.nama}, kami dari tim HR Empathika terkait lamaran magang Anda untuk posisi ${selectedApp.positionTitle}...`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Catatan Internal Admin (Opsional)
              </label>
              <textarea
                rows={2}
                value={modalCatatan}
                onChange={(e) => setModalCatatan(e.target.value)}
                placeholder="Contoh: Jadwal wawancara tanggal 30 Nov, hasil portofolio sangat baik..."
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] bg-white leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors cursor-pointer text-center"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={onSaveStatus}
            disabled={updatingStatus}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer text-center"
          >
            {updatingStatus ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  )
}
