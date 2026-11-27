"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import {
  Briefcase,
  Plus,
  ExternalLink,
  Users,
  CheckCircle2,
} from "lucide-react"
import {
  internshipService,
  InternshipPosition,
  InternshipApplication,
} from "@/services/internship.service"
import { TabPositions } from "./tabs/TabPositions"
import { TabApplications } from "./tabs/TabApplications"
import { ModalApplicationDetail } from "./modals/ModalApplicationDetail"
import { ModalDeletePosition } from "./modals/ModalDeletePosition"
import { ModalDeleteApplication } from "./modals/ModalDeleteApplication"

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
  const statusDropdownRef = useRef<HTMLDivElement>(null)
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

  // Quick Update Status Pelamar langsung dari Tabel
  const handleQuickUpdateAppStatus = async (
    id: string,
    newStatus: InternshipApplication["status"]
  ) => {
    try {
      const updated = await internshipService.updateApplicationStatus(id, newStatus)
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      )
      if (selectedApp?.id === id) {
        setSelectedApp(updated)
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("empathika_internship_updated"))
      }
      showToast("Status pelamar berhasil diperbarui!")
    } catch (err: any) {
      alert("Gagal memperbarui status pelamar: " + (err?.message || "Kesalahan server"))
    }
  }

  // Simpan Perubahan Status Pelamar dari Modal
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("empathika_internship_updated"))
      }
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("empathika_internship_updated"))
      }
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
    <div className="flex flex-col gap-6 font-poppins pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 !m-0 flex items-center gap-3 bg-[#0f172a] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-gray-700 animate-slideIn">
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
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Posisi</div>
            <div className="text-2xl font-extrabold text-gray-900 mt-0.5">{totalPositions}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Semua lowongan terdaftar</div>
          </div>
        </div>

        {/* Posisi Terbuka */}
        <div
          onClick={() => setActiveTab("posisi")}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-4 ${
            activeTab === "posisi" ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-emerald-100 hover:border-emerald-200"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Posisi Aktif (Buka)</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">{openPositions}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{closedPositions} posisi ditutup</div>
          </div>
        </div>

        {/* Total Pelamar */}
        <div
          onClick={() => setActiveTab("pelamar")}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-4 ${
            activeTab === "pelamar" ? "border-[#561269] ring-2 ring-[#561269]/10" : "border-purple-100 hover:border-purple-200"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Pelamar Masuk</div>
            <div className="text-2xl font-extrabold text-gray-900 mt-0.5">{totalApplications}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Lamaran magang terdaftar</div>
          </div>
        </div>

        {/* Menunggu Review */}
        <div
          onClick={() => {
            setActiveTab("pelamar")
            setAppStatusFilter("MENUNGGU")
          }}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-4 ${
            activeTab === "pelamar" && appStatusFilter === "MENUNGGU"
              ? "border-amber-500 ring-2 ring-amber-500/10"
              : "border-amber-100 hover:border-amber-200"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Perlu Ditinjau</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5">{pendingApplications}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Status menunggu review</div>
          </div>
        </div>
      </div>

      {/* ── 3. TAB NAVIGASI UTAMA ── */}
      <div className="flex border-b border-gray-200 gap-8">
        <button
          onClick={() => setActiveTab("posisi")}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 -mb-[2px] flex items-center gap-2 cursor-pointer ${
            activeTab === "posisi"
              ? "border-[#561269] text-[#561269]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Daftar Lowongan Posisi</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-[#561269]">
            {totalPositions}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pelamar")}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 -mb-[2px] flex items-center gap-2 cursor-pointer ${
            activeTab === "pelamar"
              ? "border-[#561269] text-[#561269]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Pelamar Magang</span>
          {pendingApplications > 0 ? (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
              {pendingApplications} Baru
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {totalApplications}
            </span>
          )}
        </button>
      </div>

      {/* ── 4. KONTEN TAB ── */}
      {activeTab === "posisi" ? (
        <TabPositions
          positions={filteredPositions}
          loadingPositions={loadingPositions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleStatus={handleToggleStatus}
          onDeletePosition={(pos) => setItemToDelete(pos)}
        />
      ) : (
        <TabApplications
          applications={filteredApplications}
          loadingApps={loadingApps}
          appSearchQuery={appSearchQuery}
          setAppSearchQuery={setAppSearchQuery}
          appStatusFilter={appStatusFilter}
          setAppStatusFilter={setAppStatusFilter}
          isStatusDropdownOpen={isStatusDropdownOpen}
          setIsStatusDropdownOpen={setIsStatusDropdownOpen}
          statusDropdownRef={statusDropdownRef}
          onOpenAppDetail={handleOpenAppDetail}
          onDeleteApp={(app) => setAppToDelete(app)}
          onQuickUpdateStatus={handleQuickUpdateAppStatus}
          formatDateTime={formatDateTime}
        />
      )}

      {/* ── MODAL DETAIL PELAMAR ── */}
      <ModalApplicationDetail
        selectedApp={selectedApp}
        onClose={() => setSelectedApp(null)}
        modalStatus={modalStatus}
        setModalStatus={setModalStatus}
        modalCatatan={modalCatatan}
        setModalCatatan={setModalCatatan}
        onSaveStatus={handleSaveAppStatus}
        updatingStatus={updatingAppStatus}
        formatDateTime={formatDateTime}
      />

      {/* ── MODAL KONFIRMASI HAPUS POSISI ── */}
      <ModalDeletePosition
        itemToDelete={itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDeletePosition}
        submitting={submitting}
      />

      {/* ── MODAL KONFIRMASI HAPUS PELAMAR ── */}
      <ModalDeleteApplication
        appToDelete={appToDelete}
        onClose={() => setAppToDelete(null)}
        onConfirm={handleConfirmDeleteApp}
        submitting={submitting}
      />
    </div>
  )
}
