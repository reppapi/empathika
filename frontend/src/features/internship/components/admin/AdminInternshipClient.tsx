"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Coins,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react"
import {
  internshipService,
  InternshipPosition,
} from "@/services/internship.service"

export default function AdminInternshipClient() {
  const [positions, setPositions] = useState<InternshipPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // State Modal Hapus
  const [itemToDelete, setItemToDelete] = useState<InternshipPosition | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Muat data langsung dari database
  const fetchPositions = async () => {
    setLoading(true)
    try {
      const data = await internshipService.getAllPositions()
      setPositions(data)
    } catch {
      setPositions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPositions()
  }, [])

  // Filter pencarian
  const filteredPositions = useMemo(() => {
    if (!searchQuery.trim()) return positions
    const q = searchQuery.toLowerCase()
    return positions.filter(
      (p) =>
        p.judul.toLowerCase().includes(q) ||
        (p.divisi && p.divisi.toLowerCase().includes(q)) ||
        p.lokasi.toLowerCase().includes(q) ||
        p.workMode.toLowerCase().includes(q)
    )
  }, [positions, searchQuery])

  // Hitung metrik
  const totalPositions = positions.length
  const openPositions = positions.filter((p) => p.isOpen).length
  const closedPositions = totalPositions - openPositions

  // Handle Toggle Status Buka / Tutup
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await internshipService.toggleStatus(id)
      setPositions(updated)
      showToast(
        currentStatus
          ? "Posisi berhasil DITUTUP (disembunyikan dari halaman klien)"
          : "Posisi berhasil DIBUKA (tampil di halaman klien)"
      )
    } catch (err: any) {
      alert("Gagal mengubah status: " + (err?.message || "Kesalahan server"))
    }
  }

  // Hapus Posisi
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setSubmitting(true)
    try {
      const updated = await internshipService.deletePosition(itemToDelete.id)
      setPositions(updated)
      setItemToDelete(null)
      showToast("Posisi internship berhasil dihapus!")
    } catch (err: any) {
      alert("Gagal menghapus: " + (err?.message || "Kesalahan server"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 font-poppins pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#0f172a] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-gray-700 animate-slideIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-purple-100/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#561269] uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            Manajemen Karir & Magang
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Program Internship Empathika
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola lowongan magang yang ditayangkan ke halaman publik. Buka atau tutup visibilitas
            posisi kapan saja.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/internship"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-purple-200 text-[#561269] hover:bg-purple-50 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <span>Pratinjau Klien</span>
            <ExternalLink className="w-4 h-4" />
          </Link>

          <Link
            href="/admin/internship/tambah"
            className="px-5 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#0f172a]" />
            <span>Tambah Posisi</span>
          </Link>
        </div>
      </div>

      {/* ── 2. STATS OVERVIEW CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Posisi */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Posisi</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalPositions}</h3>
          </div>
        </div>

        {/* Dibuka (Tampil di Klien) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Dibuka (Tampil di Klien)
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{openPositions}</h3>
          </div>
        </div>

        {/* Ditutup (Disembunyikan) */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Ditutup (Disembunyikan)
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{closedPositions}</h3>
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH & TABLE SECTION ── */}
      <div className="bg-white rounded-2xl border border-purple-100/80 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul, divisi, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#561269] focus:bg-white transition-colors"
            />
          </div>

          <span className="text-xs text-gray-500 font-medium">
            Menampilkan <strong className="text-gray-900">{filteredPositions.length}</strong> posisi
          </span>
        </div>

        {/* List / Table */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Memuat data posisi internship...</p>
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="py-16 text-center px-4">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-800">Tidak ada posisi ditemukan</h4>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery ? "Coba gunakan kata kunci pencarian yang lain." : "Belum ada lowongan internship yang ditambahkan."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-x-auto">
            {filteredPositions.map((pos) => (
              <div
                key={pos.id}
                className="p-5 sm:p-6 hover:bg-purple-50/20 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Informasi Posisi */}
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {pos.divisi && (
                      <span className="px-2.5 py-0.5 text-[11px] font-bold bg-purple-100 text-[#561269] rounded-md">
                        {pos.divisi}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-md flex items-center gap-1.5 ${
                        pos.isOpen
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          pos.isOpen ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                        }`}
                      />
                      {pos.isOpen ? "Aktif di Client (Buka)" : "Ditutup (Sembunyi)"}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{pos.judul}</h3>

                  {pos.deskripsi && (
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {pos.deskripsi}
                    </p>
                  )}

                  {/* Pills Info Singkat */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                      <Clock className="w-3.5 h-3.5 text-[#561269]" />
                      {pos.durasi}
                    </span>
                    <span className="flex items-center gap-1 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-[#561269]" />
                      {pos.lokasi}
                    </span>
                    <span className="flex items-center gap-1 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                      <Laptop className="w-3.5 h-3.5 text-[#561269]" />
                      {pos.workMode}
                    </span>
                    <span className="flex items-center gap-1 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                      <Coins className="w-3.5 h-3.5 text-[#561269]" />
                      {pos.kompensasi}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-rose-600 bg-rose-50/60 px-2.5 py-1 rounded-lg border border-rose-100">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      Deadline: {pos.deadline}
                    </span>
                  </div>
                </div>

                {/* Status Toggle & Tombol Aksi */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Tombol Toggle Buka / Tutup */}
                  <button
                    onClick={() => handleToggleStatus(pos.id, pos.isOpen)}
                    title={pos.isOpen ? "Klik untuk Menutup lowongan ini" : "Klik untuk Membuka lowongan ini"}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      pos.isOpen
                        ? "bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {pos.isOpen ? (
                      <>
                        <Eye className="w-4 h-4 text-emerald-700" />
                        <span>Status: BUKA</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-gray-500" />
                        <span>Status: TUTUP</span>
                      </>
                    )}
                  </button>

                  {/* Tombol Edit */}
                  <Link
                    href={`/admin/internship/edit/${pos.id}`}
                    className="p-2 rounded-xl bg-purple-50 text-[#561269] hover:bg-purple-100 transition-colors flex items-center justify-center"
                    title="Ubah Rincian Posisi"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>

                  {/* Tombol Hapus */}
                  <button
                    onClick={() => setItemToDelete(pos)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Hapus Posisi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. MODAL KONFIRMASI HAPUS ── */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Hapus Posisi Internship?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus posisi{" "}
                <strong className="text-gray-900">&ldquo;{itemToDelete.judul}&rdquo;</strong>? Tindakan ini
                tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? "Menghapus..." : "Ya, Hapus Posisi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
