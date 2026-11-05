"use client"

import React from "react"
import { MessageCircle, ExternalLink, Copy, X } from "lucide-react"
import { PengajuanKerjaSama } from "../../types"

interface ModalLeadDetailProps {
  selectedLead: PengajuanKerjaSama | null
  onClose: () => void
  onUpdateStatus: (id: string, newStatus: PengajuanKerjaSama["status"]) => void
  onShowToast: (msg: string) => void
}

function formatLeadWhatsAppMessage(lead: PengajuanKerjaSama): string {
  if (lead.status === "Disetujui") {
    return `Halo Kak ${lead.namaPIC} dari ${lead.namaInstansi},

Kabar baik! Kami dari Tim Administrasi & Kemitraan Empathika ingin menginformasikan bahwa pengajuan kerja sama yang Anda kirimkan telah *DISETUJUI* oleh pihak Empathika. 🎉

📋 *Detail Pengajuan Kerja Sama:*
• *Instansi/Organisasi:* ${lead.namaInstansi}
• *Nama PIC:* ${lead.namaPIC}
• *Layanan / Program:* ${lead.formTitle || `Kerja Sama ${lead.kategori}`}
• *Kategori Mitra:* ${lead.kategori}
• *Tanggal Pengajuan:* ${lead.tanggal}

Untuk langkah selanjutnya, kami ingin mengundang Kak ${lead.namaPIC} untuk membahas detail teknis pelaksanaan serta koordinasi MoU kerja sama. Apakah Kak ${lead.namaPIC} memiliki waktu luang untuk kita jadwalkan diskusi lebih lanjut? 

Terima kasih atas kepercayaannya bermitra bersama Empathika! 🙏`
  }

  if (lead.status === "Ditolak") {
    return `Halo Kak ${lead.namaPIC} dari ${lead.namaInstansi},

Terima kasih banyak atas inisiatif baik dan ketertarikan Anda untuk mengajukan kerja sama bersama Empathika.

📋 *Detail Pengajuan Kerja Sama:*
• *Instansi/Organisasi:* ${lead.namaInstansi}
• *Nama PIC:* ${lead.namaPIC}
• *Layanan / Program:* ${lead.formTitle || `Kerja Sama ${lead.kategori}`}
• *Tanggal Pengajuan:* ${lead.tanggal}

Setelah ditinjau bersama tim internal, kami mohon maaf saat ini belum dapat mengakomodasi pengajuan kerja sama ini dikarenakan kuota dan jadwal program yang terbatas pada periode ini.

Kami sangat mengapresiasi perhatian Kak ${lead.namaPIC} serta ${lead.namaInstansi}, dan kami sangat terbuka untuk menjajaki kesempatan kolaborasi di periode berikutnya. Terima kasih banyak atas pengertiannya. 🙏`
  }

  return `Halo Kak ${lead.namaPIC} dari ${lead.namaInstansi},

Kami dari Tim Administrasi & Kemitraan Empathika ingin menindaklanjuti formulir pengajuan kerja sama yang Anda kirimkan:

📋 *Detail Pengajuan Kerja Sama:*
• *Instansi/Organisasi:* ${lead.namaInstansi}
• *Nama PIC:* ${lead.namaPIC}
• *Layanan / Program:* ${lead.formTitle || `Kerja Sama ${lead.kategori}`}
• *Kategori Mitra:* ${lead.kategori}
• *Tanggal Pengajuan:* ${lead.tanggal}

Apakah Kak ${lead.namaPIC} memiliki waktu luang agar kita dapat mendiskusikan rencana kerja sama ini lebih lanjut? Jika ada hal yang ingin ditanyakan, silakan membalas pesan ini. Terima kasih! 🙏`
}

function getLeadWhatsAppUrl(lead: PengajuanKerjaSama): string {
  if (!lead.telepon) return "#"
  const clean = lead.telepon.replace(/\D/g, "")
  const waNumber = clean.startsWith("0") ? "62" + clean.slice(1) : clean
  const message = formatLeadWhatsAppMessage(lead)
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}

export default function ModalLeadDetail({
  selectedLead,
  onClose,
  onUpdateStatus,
  onShowToast,
}: ModalLeadDetailProps) {
  if (!selectedLead) return null

  const handleCopyWhatsAppMessage = () => {
    const text = formatLeadWhatsAppMessage(selectedLead)
    navigator.clipboard.writeText(text)
    onShowToast(`Pesan WhatsApp untuk ${selectedLead.namaPIC} (${selectedLead.namaInstansi}) berhasil disalin ke clipboard!`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-all duration-300">
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
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Kontak PIC Box */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
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

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedLead.status}
              onChange={(e) =>
                onUpdateStatus(selectedLead.id, e.target.value as PengajuanKerjaSama["status"])
              }
              className={`h-9 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer outline-none ${
                selectedLead.status === "Menunggu"
                  ? "bg-amber-50 text-amber-700 border-amber-300 hover:border-amber-400"
                  : selectedLead.status === "Dihubungi"
                  ? "bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-400"
                  : selectedLead.status === "Disetujui"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-400"
                  : "bg-red-50 text-red-700 border-red-300 hover:border-red-400"
              }`}
            >
              <option value="Menunggu">Menunggu</option>
              <option value="Dihubungi">Dihubungi</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={getLeadWhatsAppUrl(selectedLead)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3.5 text-xs font-bold rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white inline-flex items-center gap-1.5 transition shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                title="Hubungi PIC via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Chat WA</span>
                <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
              </a>
              <button
                type="button"
                onClick={handleCopyWhatsAppMessage}
                className="h-9 w-9 rounded-xl border border-purple-200 text-gray-600 hover:text-[#561269] hover:bg-purple-100/60 inline-flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
                title="Salin Pesan WA"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
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
            className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>📋 Salin Ringkasan Jawaban</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
