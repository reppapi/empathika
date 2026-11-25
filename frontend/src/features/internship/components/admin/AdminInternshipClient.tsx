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
  AlertCircle,
  Users,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  Globe,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  X,
  HelpCircle,
  Filter,
  ChevronDown,
  Check,
} from "lucide-react"
import {
  internshipService,
  InternshipPosition,
  InternshipApplication,
} from "@/services/internship.service"

export default function AdminInternshipClient() {
  // Tab State: "posisi" | "pelamar"
  const [activeTab, setActiveTab] = useState<"posisi" | "pelamar">("posisi")

  // State Posisi
  const [positions, setPositions] = useState<InternshipPosition[]>([])
  const [loadingPositions, setLoadingPositions] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [itemToDelete, setItemToDelete] = useState<InternshipPosition | null>(null)

  // State Pelamar
  const [applications, setApplications] = useState<InternshipApplication[]>([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [appSearchQuery, setAppSearchQuery] = useState("")
  const [appStatusFilter, setAppStatusFilter] = useState("Semua")
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const statusDropdownRef = React.useRef<HTMLDivElement>(null)
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null)
  const [appToDelete, setAppToDelete] = useState<InternshipApplication | null>(null)
  const [updatingAppStatus, setUpdatingAppStatus] = useState(false)
  const [modalStatus, setModalStatus] = useState<InternshipApplication["status"]>("MENUNGGU")
  const [modalCatatan, setModalCatatan] = useState("")

  // Global State
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Muat data Posisi langsung dari database
  const fetchPositions = async () => {
    setLoadingPositions(true)
    try {
      const data = await internshipService.getAllPositions()
      setPositions(data)
    } catch {
      setPositions([])
    } finally {
      setLoadingPositions(false)
    }
  }

  // Muat data Pelamar langsung dari database
  const fetchApplications = async () => {
    setLoadingApps(true)
    try {
      const data = await internshipService.getApplications()
      setApplications(data)
    } catch {
      setApplications([])
    } finally {
      setLoadingApps(false)
    }
  }

  useEffect(() => {
    fetchPositions()
    fetchApplications()

    const handleSync = () => {
      fetchPositions()
      fetchApplications()
    }

    window.addEventListener("empathika_internship_updated", handleSync)
    window.addEventListener("storage", handleSync)
    window.addEventListener("focus", handleSync)

    return () => {
      window.removeEventListener("empathika_internship_updated", handleSync)
      window.removeEventListener("storage", handleSync)
      window.removeEventListener("focus", handleSync)
    }
  }, [])

  // Tutup dropdown status saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false)
      }
    }
    if (isStatusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isStatusDropdownOpen])

  // Filter pencarian Posisi
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

  // Filter pencarian & status Pelamar
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesFilter =
        appStatusFilter === "Semua" ? true : app.status === appStatusFilter
      if (!matchesFilter) return false

      if (!appSearchQuery.trim()) return true
      const q = appSearchQuery.toLowerCase()
      return (
        app.nama.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.telepon.toLowerCase().includes(q) ||
        app.universitas.toLowerCase().includes(q) ||
        app.positionTitle.toLowerCase().includes(q) ||
        (app.jurusan && app.jurusan.toLowerCase().includes(q))
      )
    })
  }, [applications, appStatusFilter, appSearchQuery])

  // Hitung metrik
  const totalPositions = positions.length
  const openPositions = positions.filter((p) => p.isOpen).length
  const closedPositions = totalPositions - openPositions
  const totalApplications = applications.length
  const pendingApplications = applications.filter((a) => a.status === "MENUNGGU").length

  // Handle Toggle Status Buka / Tutup Posisi
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
  const handleConfirmDeletePosition = async () => {
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

  // Buka Modal Detail Pelamar
  const handleOpenAppDetail = (app: InternshipApplication) => {
    setSelectedApp(app)
    setModalStatus(app.status)
    setModalCatatan(app.catatanAdmin || "")
  }

  // Simpan Perubahan Status Pelamar
  const handleSaveAppStatus = async () => {
    if (!selectedApp) return
    setUpdatingAppStatus(true)
    try {
      const updated = await internshipService.updateApplicationStatus(
        selectedApp.id,
        modalStatus,
        modalCatatan.trim() || undefined
      )
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      setSelectedApp(updated)
      showToast("Status pelamar berhasil diperbarui!")
    } catch (err: any) {
      alert("Gagal memperbarui status pelamar: " + (err?.message || "Kesalahan server"))
    } finally {
      setUpdatingAppStatus(false)
    }
  }

  // Hapus Data Pelamar
  const handleConfirmDeleteApp = async () => {
    if (!appToDelete) return
    setSubmitting(true)
    try {
      await internshipService.deleteApplication(appToDelete.id)
      setApplications((prev) => prev.filter((a) => a.id !== appToDelete.id))
      if (selectedApp?.id === appToDelete.id) {
        setSelectedApp(null)
      }
      setAppToDelete(null)
      showToast("Data pelamar berhasil dihapus!")
    } catch (err: any) {
      alert("Gagal menghapus pelamar: " + (err?.message || "Kesalahan server"))
    } finally {
      setSubmitting(false)
    }
  }

  // Format Helper Tanggal
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
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
            Kelola lowongan magang, atur butir pertanyaan kustom, dan tinjau berkas lamaran yang masuk dari klien.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Posisi */}
        <div
          onClick={() => setActiveTab("posisi")}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-4 ${
            activeTab === "posisi" ? "border-[#561269] ring-2 ring-[#561269]/10" : "border-purple-100 hover:border-purple-200"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Posisi</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalPositions}</h3>
          </div>
        </div>

        {/* Dibuka (Aktif) */}
        <div
          onClick={() => setActiveTab("posisi")}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-4 cursor-pointer hover:border-emerald-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Aktif di Klien (Buka)
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{openPositions}</h3>
          </div>
        </div>

        {/* Total Pelamar Masuk */}
        <div
          onClick={() => setActiveTab("pelamar")}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-4 ${
            activeTab === "pelamar" ? "border-[#561269] ring-2 ring-[#561269]/10" : "border-blue-100 hover:border-blue-200"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Pelamar Masuk
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalApplications}</h3>
          </div>
        </div>

        {/* Menunggu Review */}
        <div
          onClick={() => {
            setActiveTab("pelamar")
            setAppStatusFilter("MENUNGGU")
          }}
          className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Menunggu Review
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{pendingApplications}</h3>
          </div>
        </div>
      </div>

      {/* ── 3. TABS NAVIGATION ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("posisi")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "posisi"
              ? "bg-[#EAB308] text-[#0f172a] shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Daftar Posisi Magang</span>
          <span
            className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
              activeTab === "posisi"
                ? "bg-[#561269] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {totalPositions}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pelamar")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "pelamar"
              ? "bg-[#EAB308] text-[#0f172a] shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Hasil Pelamar Masuk</span>
          <span
            className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
              activeTab === "pelamar"
                ? "bg-[#561269] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {totalApplications}
          </span>
        </button>
      </div>

      {/* ── TAB CONTENT 1: DAFTAR POSISI ── */}
      {activeTab === "posisi" && (
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
          {loadingPositions ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-9 h-9 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 font-medium">Memuat data posisi internship...</p>
            </div>
          ) : filteredPositions.length === 0 ? (
            <div className="py-16 text-center px-4">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-800">Tidak ada posisi ditemukan</h4>
              <p className="text-xs text-gray-500 mt-1">
                {searchQuery
                  ? "Coba gunakan kata kunci pencarian yang lain."
                  : "Belum ada lowongan internship yang ditambahkan."}
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

                      {pos.questions && pos.questions.length > 0 && (
                        <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                          {pos.questions.length} Pertanyaan Khusus
                        </span>
                      )}
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
                    {/* Link ke formulir apply */}
                    <Link
                      href={`/internship/apply/${pos.id}`}
                      target="_blank"
                      className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                      title="Buka form pendaftaran posisi ini"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                      <span>Form Apply</span>
                    </Link>

                    {/* Tombol Toggle Buka / Tutup */}
                    <button
                      onClick={() => handleToggleStatus(pos.id, pos.isOpen)}
                      title={
                        pos.isOpen
                          ? "Klik untuk Menutup lowongan ini"
                          : "Klik untuk Membuka lowongan ini"
                      }
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
                      title="Ubah Rincian & Pertanyaan Posisi"
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
      )}

      {/* ── TAB CONTENT 2: HASIL PELAMAR MASUK ── */}
      {activeTab === "pelamar" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          {/* Header Filter & Search */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Daftar Pelamar Internship Masuk
              </h2>
              <p className="text-xs text-gray-500">
                Data lamaran dan jawaban kualifikasi yang dikirimkan oleh klien / mahasiswa dari halaman web.
              </p>
            </div>

            {/* Tombol Filter Status Dropdown (Sesuai Gaya Filter Topik Event Workshop) */}
            <div ref={statusDropdownRef} className="relative self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                className="flex items-center justify-between gap-2 w-48 sm:w-52 h-10 rounded-full border border-gray-200/90 bg-white px-3.5 text-xs sm:text-sm font-bold text-gray-800 shadow-xs hover:border-[#561269] hover:bg-gray-50/80 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1 text-left">
                  <Filter className="w-3.5 h-3.5 text-[#561269] shrink-0" />
                  <span className="text-gray-400 font-medium text-xs shrink-0">Status:</span>
                  <span
                    className="text-[#561269] font-bold text-xs sm:text-sm truncate min-w-0"
                    title={
                      appStatusFilter === "MENUNGGU"
                        ? "Menunggu"
                        : appStatusFilter === "REVIEW"
                        ? "Di-Review"
                        : appStatusFilter === "DITERIMA"
                        ? "Diterima"
                        : appStatusFilter === "DITOLAK"
                        ? "Ditolak"
                        : "Semua"
                    }
                  >
                    {appStatusFilter === "MENUNGGU"
                      ? "Menunggu"
                      : appStatusFilter === "REVIEW"
                      ? "Di-Review"
                      : appStatusFilter === "DITERIMA"
                      ? "Diterima"
                      : appStatusFilter === "DITOLAK"
                      ? "Ditolak"
                      : "Semua"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                    isStatusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Floating di Atas Table Sesuai Desain Event Workshop */}
              {isStatusDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 z-20 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 text-left text-xs font-semibold animate-in fade-in zoom-in-95 duration-150">
                  <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    Pilih Status Pelamar
                  </p>
                  <div className="space-y-0.5">
                    {[
                      { id: "Semua", label: "Semua Status" },
                      { id: "MENUNGGU", label: "Menunggu" },
                      { id: "REVIEW", label: "Di-Review" },
                      { id: "DITERIMA", label: "Diterima" },
                      { id: "DITOLAK", label: "Ditolak" },
                    ].map((item) => {
                      const isSelected = appStatusFilter === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setAppStatusFilter(item.id)
                            setIsStatusDropdownOpen(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-purple-50 text-[#561269] font-bold"
                              : "text-gray-700 hover:bg-gray-50 font-semibold"
                          }`}
                        >
                          <span
                            className={
                              isSelected
                                ? "font-bold text-[#561269]"
                                : "font-semibold text-gray-800"
                            }
                          >
                            {item.label}
                          </span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-[#561269] shrink-0 ml-2" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pelamar, email, universitas, atau posisi..."
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#561269] transition-colors"
              />
            </div>

            <span className="text-xs text-gray-500 font-medium">
              Menampilkan <strong className="text-gray-900">{filteredApplications.length}</strong> pelamar
            </span>
          </div>

          {/* Table Pelamar */}
          {loadingApps ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-9 h-9 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 font-medium">Memuat data pelamar...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-16 text-center px-4">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-800">Belum ada pelamar ditemukan</h4>
              <p className="text-xs text-gray-500 mt-1">
                {appSearchQuery
                  ? "Coba gunakan kata kunci pencarian yang lain."
                  : "Belum ada calon peserta magang yang mengirimkan formulir lamaran."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto admin-table-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7FB] border-b border-gray-200">
                  <tr className="text-gray-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 min-w-[100px]">Tanggal</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Nama Pelamar</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Posisi Dilamar</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Kontak</th>
                    <th className="py-3.5 px-4 min-w-[120px]">Status</th>
                    <th className="py-3.5 px-4 text-center min-w-[140px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-purple-50/20 transition">
                      {/* Tanggal */}
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {formatDateTime(app.createdAt)}
                      </td>

                      {/* Nama & Universitas */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900 text-sm">{app.nama}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">{app.universitas}</p>
                        {app.jurusan && (
                          <span className="text-[10px] text-purple-700 font-medium">
                            {app.jurusan} {app.semester ? `(Sem. ${app.semester})` : ""}
                          </span>
                        )}
                      </td>

                      {/* Posisi Dilamar */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-900 block text-xs">
                          {app.positionTitle}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          {app.cvUrl && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                              📎 Ada CV
                            </span>
                          )}
                          {app.portfolioUrl && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-purple-50 text-[#561269] font-bold text-[10px] border border-purple-200">
                              🌐 Portofolio
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-gray-800">{app.email}</p>
                        <a
                          href={`https://wa.me/${app.telepon.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{app.telepon}</span>
                        </a>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            app.status === "MENUNGGU"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : app.status === "REVIEW"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : app.status === "DITERIMA"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenAppDetail(app)}
                            className="p-1.5 rounded-lg text-[#561269] hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Lihat profil lengkap dan jawaban pelamar"
                            aria-label="Lihat Detail Pelamar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setAppToDelete(app)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus data pelamar"
                            aria-label="Hapus Data Pelamar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL DETAIL PELAMAR (Desain Seragam dengan Detail Layanan) ── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedApp(null)}
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
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleSaveAppStatus}
                disabled={updatingAppStatus}
                className="px-5 py-2 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {updatingAppStatus ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS POSISI ── */}
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
                onClick={handleConfirmDeletePosition}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? "Menghapus..." : "Ya, Hapus Posisi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS PELAMAR ── */}
      {appToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Hapus Data Pelamar?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus data lamaran dari{" "}
                <strong className="text-gray-900">&ldquo;{appToDelete.nama}&rdquo;</strong> untuk posisi{" "}
                <strong className="text-gray-900">{appToDelete.positionTitle}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setAppToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmDeleteApp}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? "Menghapus..." : "Ya, Hapus Pelamar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
