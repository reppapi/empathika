"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { BiroKomunitas, StatusAktivasiBiro } from "../types"
import { INITIAL_BIRO_LIST, LOCAL_STORAGE_KEY_BIRO } from "../initialData"
import BiroFormModal from "./BiroFormModal"
import BiroDetailModal from "./BiroDetailModal"
import BiroDeleteModal from "./BiroDeleteModal"
import {
  ActionButtonDetail,
  ActionButtonEdit,
  ActionButtonDelete,
} from "@/components/shared/TableActionButtons"

export default function AdminBiroClient() {
  const [biroList, setBiroList] = useState<BiroKomunitas[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("semua")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBiro, setEditingBiro] = useState<BiroKomunitas | null>(null)

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedDetailBiro, setSelectedDetailBiro] = useState<BiroKomunitas | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingBiro, setDeletingBiro] = useState<BiroKomunitas | null>(null)

  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "info"
  } | null>(null)

  // Inisialisasi Data dari localStorage (Client Side)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BIRO)
      if (saved) {
        setBiroList(JSON.parse(saved))
      } else {
        setBiroList(INITIAL_BIRO_LIST)
        localStorage.setItem(LOCAL_STORAGE_KEY_BIRO, JSON.stringify(INITIAL_BIRO_LIST))
      }
    } catch {
      setBiroList(INITIAL_BIRO_LIST)
    }
  }, [])

  // Simpan perubahan ke state & localStorage
  const persistData = (newList: BiroKomunitas[], msg?: string, type: "success" | "info" = "success") => {
    setBiroList(newList)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_BIRO, JSON.stringify(newList))
    } catch {
      // ignore
    }
    if (msg) {
      setNotification({ message: msg, type })
      setTimeout(() => setNotification(null), 3500)
    }
  }

  // Filter & Search
  const filteredList = useMemo(() => {
    return biroList.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.emailAdmin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === "semua" || item.statusAktivasi === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [biroList, searchQuery, statusFilter])

  // Reset pagination saat search/filter berganti
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Pagination Logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredList.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredList, currentPage, itemsPerPage])

  // Handlers CRUD
  const handleOpenAdd = () => {
    setEditingBiro(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (biro: BiroKomunitas) => {
    setEditingBiro(biro)
    setIsFormOpen(true)
  }

  const handleOpenDetail = (biro: BiroKomunitas) => {
    setSelectedDetailBiro(biro)
    setIsDetailOpen(true)
  }

  const handleOpenDelete = (biro: BiroKomunitas) => {
    setDeletingBiro(biro)
    setIsDeleteOpen(true)
  }

  const handleSaveBiro = (formData: Partial<BiroKomunitas>) => {
    if (editingBiro) {
      // Edit
      const updatedList = biroList.map((item) =>
        item.id === editingBiro.id
          ? {
              ...item,
              ...formData,
            }
          : item
      )
      persistData(updatedList, `Data biro "${formData.nama}" berhasil diperbarui.`)
      // update detail modal jika sedang terbuka
      if (selectedDetailBiro && selectedDetailBiro.id === editingBiro.id) {
        setSelectedDetailBiro({ ...selectedDetailBiro, ...formData } as BiroKomunitas)
      }
    } else {
      // Tambah Baru
      const slug =
        formData.slug?.trim() ||
        (formData.nama || "biro")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

      const newId = `biro-${Date.now().toString().slice(-4)}`
      const today = new Date().toISOString().split("T")[0]
      const randomToken = `act_${Math.random().toString(36).substring(2, 8)}`

      const newBiro: BiroKomunitas = {
        id: newId,
        nama: formData.nama || "Biro Baru",
        slug,
        logo: formData.logo,
        deskripsi: formData.deskripsi || "",
        warnaIdentitas: formData.warnaIdentitas || "#561269",
        emailAdmin: formData.emailAdmin || "",
        telepon: formData.telepon || "",
        alamat: formData.alamat || "",
        tanggalDibuat: today,
        statusAktivasi: "Menunggu Aktivasi",
        websiteUrl: formData.websiteUrl || `https://${slug}.empathika.id`,
        dashboardUrl: formData.dashboardUrl || `https://${slug}.empathika.id/admin`,
        aktivasiToken: randomToken,
      }

      const updatedList = [newBiro, ...biroList]
      persistData(
        updatedList,
        `Biro "${newBiro.nama}" berhasil ditambahkan dengan status Menunggu Aktivasi.`
      )
    }
  }

  const handleConfirmDelete = () => {
    if (!deletingBiro) return
    const updatedList = biroList.filter((item) => item.id !== deletingBiro.id)
    persistData(updatedList, `Biro "${deletingBiro.nama}" telah berhasil dihapus.`)
    setIsDeleteOpen(false)
    setDeletingBiro(null)
  }

  // Simulasi Alur Aktivasi
  const handleSimulateAktivasi = (biro: BiroKomunitas) => {
    const today = new Date().toISOString().split("T")[0]
    const updatedList = biroList.map((item) =>
      item.id === biro.id
        ? {
            ...item,
            statusAktivasi: "Aktif" as StatusAktivasiBiro,
            tanggalAktivasi: today,
          }
        : item
    )
    const updatedItem = {
      ...biro,
      statusAktivasi: "Aktif" as StatusAktivasiBiro,
      tanggalAktivasi: today,
    }
    persistData(
      updatedList,
      `Simulasi aktivasi berhasil! Tenant "${biro.nama}" sekarang aktif.`
    )
    setSelectedDetailBiro(updatedItem)
  }

  // Statistik Counter
  const countTotal = biroList.length
  const countAktif = biroList.filter((b) => b.statusAktivasi === "Aktif").length
  const countMenunggu = biroList.filter((b) => b.statusAktivasi === "Menunggu Aktivasi").length
  const countNonaktif = biroList.filter((b) => b.statusAktivasi === "Nonaktif").length

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* Toast Notifikasi */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-3 text-white shadow-xl transition-all animate-bounce">
          <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-xs sm:text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Header Halaman & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Pengaturan Biro & Komunitas
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola profil tenant mitra, registrasi biro, dan alur aktivasi multi-tenant Empathika.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#561269] hover:bg-[#6f1b87] px-6 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Biro
        </button>
      </div>

      {/* Kartu Ringkasan Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Biro Terdaftar</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{countTotal}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Aktif Beroperasi</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{countAktif}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Menunggu Aktivasi</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{countMenunggu}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Nonaktif / Ditangguhkan</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{countNonaktif}</p>
        </div>
      </div>

      {/* Filter & Bar Pencarian */}
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari biro berdasarkan nama, email admin, atau deskripsi..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Tab Filter Status Aktivasi */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium mr-1">Status Aktivasi:</span>
          {[
            { id: "semua", label: "Semua Status" },
            { id: "Menunggu Aktivasi", label: "Menunggu Aktivasi" },
            { id: "Aktif", label: "Aktif" },
            { id: "Nonaktif", label: "Nonaktif" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                statusFilter === tab.id
                  ? "bg-[#561269] text-white shadow-sm font-semibold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Pengaturan Biro */}
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/60 text-xs font-semibold text-gray-600">
                <th className="py-4 px-6 w-16 text-center">No.</th>
                <th className="py-4 px-6 min-w-[240px]">Logo dan Nama Biro</th>
                <th className="py-4 px-6">Email Admin Biro</th>
                <th className="py-4 px-6">Tanggal Dibuat</th>
                <th className="py-4 px-6 text-center">Status Aktivasi</th>
                <th className="py-4 px-6 text-right min-w-[180px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                        />
                      </svg>
                      <p>Tidak ada biro atau komunitas yang sesuai dengan pencarian / filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((biro, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1
                  return (
                    <tr key={biro.id} className="hover:bg-purple-50/20 transition">
                      {/* No. */}
                      <td className="py-4 px-6 text-center font-medium text-gray-500">
                        {rowNumber}
                      </td>

                      {/* Logo dan Nama Biro */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div
                            className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center bg-gray-50"
                            style={{ borderColor: biro.warnaIdentitas }}
                          >
                            {biro.logo ? (
                              <Image src={biro.logo} alt={biro.nama} fill className="object-cover" />
                            ) : (
                              <span
                                className="font-bold text-xs uppercase"
                                style={{ color: biro.warnaIdentitas }}
                              >
                                {biro.nama.slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p
                              onClick={() => handleOpenDetail(biro)}
                              className="font-bold text-gray-900 hover:text-[#561269] cursor-pointer text-sm transition"
                            >
                              {biro.nama}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: biro.warnaIdentitas }}
                                title={`Warna: ${biro.warnaIdentitas}`}
                              />
                              <span className="text-[11px] text-gray-400 font-mono">
                                {biro.warnaIdentitas}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email Admin Biro */}
                      <td className="py-4 px-6 font-medium text-gray-800">
                        <span className="bg-gray-100/80 px-2.5 py-1 rounded-lg text-[11px] text-gray-700 font-mono">
                          {biro.emailAdmin}
                        </span>
                      </td>

                      {/* Tanggal Dibuat */}
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(biro.tanggalDibuat).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status Aktivasi */}
                      <td className="py-4 px-6 text-center">
                        {biro.statusAktivasi === "Aktif" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Aktif
                          </span>
                        )}
                        {biro.statusAktivasi === "Menunggu Aktivasi" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Menunggu Aktivasi
                          </span>
                        )}
                        {biro.statusAktivasi === "Nonaktif" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Aksi: Detail, Edit, Hapus */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <ActionButtonDetail
                            onClick={() => handleOpenDetail(biro)}
                            title="Lihat Detail & Aktivasi"
                          />
                          <ActionButtonEdit
                            onClick={() => handleOpenEdit(biro)}
                            title="Edit Biro"
                          />
                          <ActionButtonDelete
                            onClick={() => handleOpenDelete(biro)}
                            title="Hapus Biro"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredList.length)} dari{" "}
              {filteredList.length} biro
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
                    currentPage === pageNumber
                      ? "bg-[#561269] text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <BiroFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingBiro(null)
        }}
        onSave={handleSaveBiro}
        initialData={editingBiro}
      />

      <BiroDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedDetailBiro(null)
        }}
        biro={selectedDetailBiro}
        onEdit={(b) => handleOpenEdit(b)}
        onSimulateAktivasi={handleSimulateAktivasi}
      />

      <BiroDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setDeletingBiro(null)
        }}
        onConfirm={handleConfirmDelete}
        biro={deletingBiro}
      />
    </div>
  )
}
