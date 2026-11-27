"use client"

import React from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Coins,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  Users,
} from "lucide-react"
import { InternshipPosition } from "@/services/internship.service"

interface TabPositionsProps {
  positions: InternshipPosition[]
  loadingPositions: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  onToggleStatus: (id: string, currentStatus: boolean) => void
  onDeletePosition: (pos: InternshipPosition) => void
}

export function TabPositions({
  positions,
  loadingPositions,
  searchQuery,
  setSearchQuery,
  onToggleStatus,
  onDeletePosition,
}: TabPositionsProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lowongan posisi..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors"
          />
        </div>
      </div>

      {/* Konten Posisi */}
      {loadingPositions ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-2xs gap-3">
          <div className="w-8 h-8 border-3 border-[#561269] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Memuat data posisi internship...</p>
        </div>
      ) : positions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 bg-purple-50 text-[#561269] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {searchQuery ? "Tidak Ada Hasil Pencarian" : "Belum Ada Posisi Internship"}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
            {searchQuery
              ? `Tidak ditemukan posisi yang cocok dengan kata kunci "${searchQuery}".`
              : "Mulai buat lowongan posisi magang baru agar calon pendaftar dapat melamar langsung melalui website."}
          </p>
          <Link
            href="/admin/internship/tambah"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#561269] hover:bg-[#6e1885] text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Posisi Sekarang</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {positions.map((pos) => {
            const isExternalApply =
              pos.applyUrl &&
              (pos.applyUrl.startsWith("http://") || pos.applyUrl.startsWith("https://")) &&
              !pos.applyUrl.includes("empathika.id")

            return (
              <div
                key={pos.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-all duration-200 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          pos.isOpen
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            pos.isOpen ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {pos.isOpen ? "BUKA (Aktif di Klien)" : "DITUTUP (Disembunyikan)"}
                      </span>

                      {pos.divisi && (
                        <span className="text-[11px] font-bold text-[#561269] bg-purple-50 px-2 py-0.5 rounded-md">
                          {pos.divisi}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{pos.judul}</h3>

                    {pos.deskripsi && (
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 max-w-3xl">
                        {pos.deskripsi}
                      </p>
                    )}
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(pos.id, pos.isOpen)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        pos.isOpen
                          ? "border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                      title={pos.isOpen ? "Klik untuk tutup posisi" : "Klik untuk buka posisi"}
                    >
                      {pos.isOpen ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span className="hidden md:inline">{pos.isOpen ? "Buka" : "Tutup"}</span>
                    </button>

                    <Link
                      href={`/admin/internship/edit/${pos.id}`}
                      className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:text-[#561269] hover:border-purple-200 hover:bg-purple-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Edit posisi"
                      aria-label="Edit Posisi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold hidden md:inline">Edit</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDeletePosition(pos)}
                      className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus posisi"
                      aria-label="Hapus Posisi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info Baris */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#561269]" />
                    <span>{pos.durasi}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#561269]" />
                    <span>{pos.lokasi}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-[#561269]" />
                    <span>{pos.workMode}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#561269]" />
                    <span>{pos.kompensasi}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-600 font-semibold col-span-2 sm:col-span-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Deadline: {pos.deadline}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
