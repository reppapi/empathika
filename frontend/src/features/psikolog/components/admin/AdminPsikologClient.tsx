"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { TenagaAhli, StatusAkses } from "../../types"
import { INITIAL_TENAGA_AHLI, LOCAL_STORAGE_KEY_TENAGA } from "../../data/initialData"
import { ActionButtonDetail, ActionButtonDelete } from "@/components/shared/TableActionButtons"
import { AdminSummaryCard } from "@/components/shared/AdminSummaryCard"
import { Users, CheckCircle2, Lock } from "lucide-react"
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  AdminFilterTabItem,
  AdminStatusBadge,
  ColumnDef,
} from "@/components/shared/AdminDataTable"

export default function AdminPsikologClient() {
  const [dataList, setDataList] = useState<TenagaAhli[]>([])
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>("semua")
  const [searchQuery, setSearchQuery] = useState("")

  const [deleteConfirmItem, setDeleteConfirmItem] = useState<TenagaAhli | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
    if (saved) {
      try {
        setDataList(JSON.parse(saved))
      } catch {
        setDataList(INITIAL_TENAGA_AHLI)
      }
    } else {
      setDataList(INITIAL_TENAGA_AHLI)
      localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify(INITIAL_TENAGA_AHLI))
    }
  }, [])

  const persistData = (newList: TenagaAhli[], notifMsg?: string) => {
    setDataList(newList)
    localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify(newList))
    if (notifMsg) {
      setNotification(notifMsg)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  // Hak Akses sederhana: Beri Akses ("AKTIF") atau Hapus Akses ("NONAKTIF")
  const handleToggleAkses = (item: TenagaAhli, newStatus: StatusAkses) => {
    const updated = dataList.map((d) => (d.id === item.id ? { ...d, statusAkses: newStatus } : d))
    const msg =
      newStatus === "AKTIF"
        ? `Akses web untuk ${item.nama} berhasil diberikan.`
        : `Akses web untuk ${item.nama} telah dinonaktifkan.`
    persistData(updated, msg)
  }

  // Hapus Data
  const handleDeleteItem = () => {
    if (!deleteConfirmItem) return
    const updated = dataList.filter((d) => d.id !== deleteConfirmItem.id)
    persistData(updated, `Data ${deleteConfirmItem.nama} telah dihapus.`)
    setDeleteConfirmItem(null)
  }

  // Filter List tunggal
  const filteredList = dataList.filter((item) => {
    const matchCategory =
      selectedKategoriFilter === "semua" || item.kategori === selectedKategoriFilter
    const matchSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.spesialisasi.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const countTotal = dataList.length
  const countAktif = dataList.filter((d) => d.statusAkses === "AKTIF").length

  const columns: ColumnDef<TenagaAhli>[] = [
    {
      key: "nama",
      header: "Nama & Email",
      render: (item: TenagaAhli) => (
        <Link
          href={`/admin/psikolog/${item.id}`}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-purple-100 shrink-0 border border-purple-200 flex items-center justify-center">
            {item.foto ? (
              <Image src={item.foto} alt={item.nama} fill className="object-cover" />
            ) : (
              <span className="font-bold text-[#561269] text-sm">
                {item.nama.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-extrabold text-gray-900 group-hover:text-[#561269] transition text-sm">
              {item.nama}
            </p>
            <p className="text-xs text-gray-500">{item.spesialisasi}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{item.email}</p>
          </div>
        </Link>
      ),
    },
    {
      key: "kategori",
      header: "Kategori",
      render: (item: TenagaAhli) => (
        <span className="inline-block rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 capitalize">
          {item.kategori.replace("-", " ")}
        </span>
      ),
    },
    {
      key: "legalitas",
      header: "Legalitas (STR & SIPP)",
      render: (item: TenagaAhli) => {
        const isPsikolog = item.kategori === "psikolog"
        return isPsikolog ? (
          <div className="space-y-1 text-[11px]">
            <p>
              STR: <span className="font-mono text-gray-800 font-medium">{item.noStr || "-"}</span>
            </p>
            <p>
              SIPP: <span className="font-mono text-gray-800 font-medium">{item.noSipp || "-"}</span>
            </p>
          </div>
        ) : (
          <span className="text-[11px] text-gray-400">Tidak Perlu STR/SIPP</span>
        )
      },
    },
    {
      key: "telepon",
      header: "No. Telepon",
      render: (item: TenagaAhli) => <p className="text-gray-800 font-medium">{item.noTelepon}</p>,
    },
    {
      key: "statusAkses",
      header: "Hak Akses Web",
      align: "center",
      render: (item: TenagaAhli) => {
        const isAktif = item.statusAkses === "AKTIF"
        return (
          <div className="flex flex-col items-center gap-1.5">
            <AdminStatusBadge variant={isAktif ? "success" : "neutral"} className="w-28">
              {isAktif ? "Akses Aktif" : "Nonaktif"}
            </AdminStatusBadge>

            <button
              type="button"
              onClick={() => handleToggleAkses(item, isAktif ? "NONAKTIF" : "AKTIF")}
              className={`text-[11px] font-medium px-3 py-1 rounded-xl transition cursor-pointer ${
                isAktif
                  ? "border border-red-200 text-red-600 hover:bg-red-50"
                  : "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold shadow-xs"
              }`}
            >
              {isAktif ? "Hapus Akses" : "Beri Akses"}
            </button>
          </div>
        )
      },
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (item: TenagaAhli) => (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <ActionButtonDetail
            href={`/admin/psikolog/${item.id}`}
            title="Lihat Detail"
          />
          <ActionButtonDelete
            onClick={() => setDeleteConfirmItem(item)}
            title="Hapus"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* Notifikasi Singkat */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-3 text-white shadow-xl transition-all">
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      {/* Header Halaman & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Data Psikolog & Tenaga Ahli
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola profil, akun login, dan izin akses web psikolog Empathika.
          </p>
        </div>

        {/* Tombol ke Halaman Tambah Baru */}
        <Link
          href="/admin/psikolog/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Tenaga Ahli
        </Link>
      </div>

      {/* Ringkasan Singkat (Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <AdminSummaryCard
          label="Total Tenaga Terdaftar"
          value={`${countTotal} Orang`}
          icon={<Users className="w-6 h-6 text-blue-500" />}
          iconBgColor="bg-blue-50 text-blue-500"
        />

        <AdminSummaryCard
          label="Akses Web Aktif"
          value={`${countAktif} Aktif`}
          valueClassName="text-emerald-600"
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          iconBgColor="bg-emerald-50 text-emerald-500"
        />

        <AdminSummaryCard
          label="Akses Dibatasi"
          value={`${countTotal - countAktif} Nonaktif`}
          valueClassName="text-gray-600"
          icon={<Lock className="w-6 h-6 text-gray-500" />}
          iconBgColor="bg-gray-100 text-gray-500"
        />
      </div>

      {/* Main Table Container */}
      <AdminTableContainer>
        {/* Header Bar: Filter Tabs & Search */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-transparent overflow-x-auto pb-1 text-sm">
            {[
              { id: "semua", label: "Semua" },
              { id: "psikolog", label: "Psikolog" },
              { id: "konselor", label: "Konselor" },
              { id: "peer-konselor", label: "Peer Konselor" },
            ].map((tab) => (
              <AdminFilterTabItem
                key={tab.id}
                label={tab.label}
                isActive={selectedKategoriFilter === tab.id}
                onClick={() => setSelectedKategoriFilter(tab.id)}
              />
            ))}
          </div>

          {/* Search Input */}
          <AdminSearchInput
            placeholder="Cari nama, email, atau spesialisasi..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Tabel Data Tenaga Ahli */}
        <AdminDataTable
          columns={columns}
          data={filteredList}
          keyExtractor={(item) => item.id}
          emptyMessage="Tidak ditemukan data tenaga ahli yang sesuai."
        />
      </AdminTableContainer>

      {/* Modal Konfirmasi Hapus */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-gray-900">
              Hapus Data Tenaga Ahli?
            </h4>
            <p className="text-xs text-gray-600">
              Apakah Anda yakin ingin menghapus <strong>{deleteConfirmItem.nama}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="rounded-full border border-gray-300 px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
