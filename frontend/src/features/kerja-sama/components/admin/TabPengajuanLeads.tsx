"use client"

import React from "react"
import { PengajuanKerjaSama } from "../../types"

interface TabPengajuanLeadsProps {
  filteredLeads: PengajuanKerjaSama[]
  leadFilter: string
  setLeadFilter: (filter: string) => void
  onSelectLead: (lead: PengajuanKerjaSama) => void
  onUpdateLeadStatus: (id: string, newStatus: PengajuanKerjaSama["status"]) => void
  onDeleteLead: (id: string) => void
}

export default function TabPengajuanLeads({
  filteredLeads,
  leadFilter,
  setLeadFilter,
  onSelectLead,
  onUpdateLeadStatus,
  onDeleteLead,
}: TabPengajuanLeadsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Daftar Pengajuan Masuk</h2>
          <p className="text-xs text-gray-500">
            Data permohonan kerjasama yang dikirimkan oleh institusi / mitra dari website client.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full text-xs font-semibold self-start sm:self-auto">
          {["Semua", "Menunggu", "Dihubungi", "Disetujui"].map((status) => (
            <button
              key={status}
              onClick={() => setLeadFilter(status)}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                leadFilter === status
                  ? "bg-[#EAB308] text-gray-950 font-bold shadow-sm"
                  : "text-gray-600 hover:text-gray-900 font-medium"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`overflow-x-auto rounded-2xl border border-gray-200/80 bg-white admin-table-scrollbar ${
          filteredLeads.length > 7 ? "max-h-[480px] overflow-y-auto" : ""
        }`}
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-[#D9C6DF]">
            <tr className="bg-[#D9C6DF] text-[#561269] font-bold">
              <th className="py-3 px-4 min-w-[100px] sticky top-0 bg-[#D9C6DF] z-10">Tanggal</th>
              <th className="py-3 px-4 min-w-[150px] sticky top-0 bg-[#D9C6DF] z-10">Nama Instansi</th>
              <th className="py-3 px-4 min-w-[170px] sticky top-0 bg-[#D9C6DF] z-10">Jenis Formulir</th>
              <th className="py-3 px-4 min-w-[140px] sticky top-0 bg-[#D9C6DF] z-10">PIC & Kontak</th>
              <th className="py-3 px-4 sticky top-0 bg-[#D9C6DF] z-10">Status</th>
              <th className="py-3 px-4 text-center min-w-[160px] sticky top-0 bg-[#D9C6DF] z-10">Aksi & Jawaban</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">{lead.tanggal}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{lead.namaInstansi}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-gray-800 block text-xs">
                      {lead.formTitle || `Formulir ${lead.kategori}`}
                    </span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-purple-50 text-[#561269] font-medium text-[10px]">
                      {lead.kategori}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-gray-800">{lead.namaPIC}</p>
                    <p className="text-[10px] text-gray-500">{lead.telepon}</p>
                    <p className="text-[10px] text-gray-500">{lead.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        onUpdateLeadStatus(lead.id, e.target.value as PengajuanKerjaSama["status"])
                      }
                      className={`rounded-lg px-2 py-1 text-xs font-semibold border ${
                        lead.status === "Menunggu"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : lead.status === "Dihubungi"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : lead.status === "Disetujui"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Dihubungi">Dihubungi</option>
                      <option value="Disetujui">Disetujui</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="px-3 py-1 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>Lihat Jawaban</span>
                      </button>
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title="Hapus"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  Tidak ada pengajuan dengan filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
