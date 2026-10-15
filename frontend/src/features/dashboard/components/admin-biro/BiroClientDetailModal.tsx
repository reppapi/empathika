"use client"

import React from "react"
import { X, User, Mail, Phone, Calendar, HeartHandshake, ShieldCheck, Clock, FileText, CheckCircle2 } from "lucide-react"
import { BiroClientProfile } from "../../data/biroDashboardData"

interface BiroClientDetailModalProps {
  isOpen: boolean
  onClose: () => void
  client: BiroClientProfile | null
}

export default function BiroClientDetailModal({ isOpen, onClose, client }: BiroClientDetailModalProps) {
  if (!isOpen || !client) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 sm:p-7 flex flex-col justify-between">
        {/* Header Modal */}
        <div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#561269]/10 text-[#561269] flex items-center justify-center font-bold text-lg shrink-0">
                {client.nama.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                    {client.nama}
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                    {client.clientCode}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Klien Terdaftar di <span className="font-semibold text-[#561269]">{client.biroName}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Badge & Tenant Verification */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-gray-700">Status Akun Klien:</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
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

          {/* Grid Informasi Kontak & Identitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5 text-xs">
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="font-medium text-[11px]">Email</span>
              </div>
              <p className="font-bold text-gray-800 truncate">{client.email}</p>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Phone className="w-3.5 h-3.5" />
                <span className="font-medium text-[11px]">Nomor Telepon</span>
              </div>
              <p className="font-bold text-gray-800">{client.telepon}</p>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-medium text-[11px]">Tanggal Terdaftar</span>
              </div>
              <p className="font-bold text-gray-800">{client.tanggalBergabung}</p>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium text-[11px]">Total Sesi Selesai</span>
              </div>
              <p className="font-bold text-gray-800">{client.totalSesi} Sesi Konseling</p>
            </div>
          </div>

          {/* Rincian Layanan & Fokus Pendampingan */}
          <div className="flex flex-col gap-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100/70 mb-5 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider">
                Fokus Keluhan / Pendampingan
              </span>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{client.fokusKonseling}</p>
            </div>

            <div className="pt-2 border-t border-purple-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] text-gray-500">Layanan:</span>
                <p className="font-bold text-gray-800">{client.layanan}</p>
              </div>
              <div>
                <span className="text-[11px] text-gray-500">Psikolog / Konselor:</span>
                <p className="font-bold text-[#561269]">{client.psikologPendamping}</p>
              </div>
            </div>

            {client.catatanKhusus && (
              <div className="pt-2 border-t border-purple-100/60">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#561269]" />
                  Catatan Progres Biro:
                </span>
                <p className="text-gray-700 mt-0.5 leading-relaxed italic bg-white p-2.5 rounded-xl border border-purple-100">
                  &ldquo;{client.catatanKhusus}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Tombol Tutup */}
        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
