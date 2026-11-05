"use client"

import React, { useState, useMemo } from "react"
import { X, Search, Users, ShieldCheck, ArrowRight, Eye, Phone, Mail } from "lucide-react"
import { BiroClientProfile } from "../../data/biroDashboardData"

interface BiroClientListModalProps {
  isOpen: boolean
  onClose: () => void
  clients: BiroClientProfile[]
  biroName: string
  onSelectClient: (client: BiroClientProfile) => void
}

export default function BiroClientListModal({
  isOpen,
  onClose,
  clients,
  biroName,
  onSelectClient,
}: BiroClientListModalProps) {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("Semua")

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchSearch =
        client.nama.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.clientCode.toLowerCase().includes(search.toLowerCase()) ||
        client.fokusKonseling.toLowerCase().includes(search.toLowerCase())

      const matchStatus = filterStatus === "Semua" ? true : client.status === filterStatus

      return matchSearch && matchStatus
    })
  }, [clients, search, filterStatus])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-poppins animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="p-6 sm:p-7 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-50/60 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#561269] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Daftar Klien Naungan Biro
                </h3>
                <span className="text-xs font-bold bg-[#561269]/10 text-[#561269] px-2.5 py-0.5 rounded-full">
                  Multi-Tenant
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Menampilkan seluruh klien terdaftar di bawah naungan{" "}
                <span className="font-bold text-[#561269]">{biroName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, kode, email..."
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#561269] transition"
            />
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["Semua", "Aktif", "Menunggu Pembayaran", "Selesai"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  filterStatus === st
                    ? "bg-[#561269] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* List Klien Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredClients.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center text-gray-400">
              <Users className="w-12 h-12 stroke-[1.5] mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">Tidak ada data klien yang cocok</p>
              <p className="text-xs text-gray-400 mt-1">Coba ubah kata kunci pencarian atau filter status.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#561269]/30 hover:shadow-sm transition-all group"
                >
                  {/* Sisi Kiri: Profil Singkat */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#561269] to-[#7a2291] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      {client.nama.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#561269] transition-colors">
                          {client.nama}
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {client.clientCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            client.status === "Aktif"
                              ? "bg-emerald-100 text-emerald-800"
                              : client.status === "Menunggu Pembayaran"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {client.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {client.layanan} •{" "}
                        <span className="font-semibold text-gray-700">{client.psikologPendamping}</span>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Fokus: <span className="text-gray-600">{client.fokusKonseling}</span>
                      </p>
                    </div>
                  </div>

                  {/* Sisi Kanan: Kontak & Tombol Detail */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-semibold text-gray-700">{client.telepon}</p>
                      <p className="text-[11px] text-gray-400">{client.totalSesi} Sesi Konseling</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onSelectClient(client)
                      }}
                      className="flex items-center gap-1.5 bg-[#F9F5FA] hover:bg-[#561269] text-[#561269] hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <p>
            Total: <strong>{filteredClients.length} Klien</strong> terdaftar di tenant ini
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
