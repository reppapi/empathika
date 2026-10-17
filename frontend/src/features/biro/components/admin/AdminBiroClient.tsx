"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { BiroKomunitas, StatusAktivasiBiro } from "../../types"
import { INITIAL_BIRO_LIST, LOCAL_STORAGE_KEY_BIRO } from "../../data/initialData"
import BiroDetailModal from "./BiroDetailModal"
import BiroDeleteModal from "./BiroDeleteModal"
import {
  ActionButtonDetail,
  ActionButtonEdit,
  ActionButtonDelete,
} from "@/components/shared/TableActionButtons"
import { AdminSummaryCard } from "@/components/shared/AdminSummaryCard"
import { Building2, CheckCircle2, Clock, Ban } from "lucide-react"
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  AdminFilterTabItem,
  AdminStatusBadge,
  ColumnDef,
} from "@/components/shared/AdminDataTable"

export default function AdminBiroClient() {
  const router = useRouter()
  const [biroList, setBiroList] = useState<BiroKomunitas[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("semua")

  // Modal States
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


  // Handlers CRUD
  const handleOpenAdd = () => {
    router.push("/admin/biro/tambah")
  }

  const handleOpenEdit = (biro: BiroKomunitas) => {
    router.push(`/admin/biro/edit/${biro.id}`)
  }

  const handleOpenDetail = (biro: BiroKomunitas) => {
    setSelectedDetailBiro(biro)
    setIsDetailOpen(true)
  }

  const handleOpenDelete = (biro: BiroKomunitas) => {
    setDeletingBiro(biro)
    setIsDeleteOpen(true)
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

  const columns: ColumnDef<BiroKomunitas>[] = [
    {
      key: "no",
      header: "No.",
      align: "center",
      width: "70px",
      render: (_, index: number) => {
        return <span className="font-semibold text-gray-500">{index + 1}</span>
      },
    },
    {
      key: "biro",
      header: "Logo dan Nama Biro",
      render: (biro: BiroKomunitas) => (
        <div className="flex items-center gap-3.5">
          <div
            className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border flex items-center justify-center bg-gray-50 shadow-inner"
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
              className="font-extrabold text-gray-900 hover:text-[#561269] cursor-pointer text-sm transition"
            >
              {biro.nama}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: biro.warnaIdentitas }}
                title={`Warna: ${biro.warnaIdentitas}`}
              />
              <span className="text-[11px] text-gray-400 font-mono font-medium">
                {biro.warnaIdentitas}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email Admin Biro",
      render: (biro: BiroKomunitas) => (
        <span className="bg-gray-100/80 px-2.5 py-1 rounded-lg text-[11px] text-gray-700 font-mono font-medium">
          {biro.emailAdmin}
        </span>
      ),
    },
    {
      key: "tanggal",
      header: "Tanggal Dibuat",
      render: (biro: BiroKomunitas) => (
        <span className="text-gray-600 font-medium">
          {new Date(biro.tanggalDibuat).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status Aktivasi",
      align: "center",
      render: (biro: BiroKomunitas) => {
        if (biro.statusAktivasi === "Aktif") {
          return <AdminStatusBadge variant="success" className="w-44">Aktif</AdminStatusBadge>
        }
        if (biro.statusAktivasi === "Menunggu Aktivasi") {
          return <AdminStatusBadge variant="warning" className="w-44">Menunggu Aktivasi</AdminStatusBadge>
        }
        return <AdminStatusBadge variant="neutral" className="w-44">Nonaktif</AdminStatusBadge>
      },
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (biro: BiroKomunitas) => (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
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
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* Toast Notifikasi */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-3 text-white shadow-xl transition-all">
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
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Biro
        </button>
      </div>

      {/* Kartu Ringkasan Status (Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <AdminSummaryCard
          label="Total Biro Terdaftar"
          value={countTotal}
          icon={<Building2 className="w-6 h-6 text-blue-500" />}
          iconBgColor="bg-blue-50 text-blue-500"
        />

        <AdminSummaryCard
          label="Aktif Beroperasi"
          value={countAktif}
          valueClassName="text-emerald-600"
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          iconBgColor="bg-emerald-50 text-emerald-500"
        />

        <AdminSummaryCard
          label="Menunggu Aktivasi"
          value={countMenunggu}
          valueClassName="text-amber-600"
          icon={<Clock className="w-6 h-6 text-amber-500" />}
          iconBgColor="bg-amber-50 text-amber-500"
        />

        <AdminSummaryCard
          label="Nonaktif / Ditangguhkan"
          value={countNonaktif}
          valueClassName="text-gray-600"
          icon={<Ban className="w-6 h-6 text-red-500" />}
          iconBgColor="bg-red-50 text-red-500"
        />
      </div>

      {/* Main Table Container */}
      <AdminTableContainer>
        {/* Header Bar: Filter Tabs & Search */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-transparent overflow-x-auto pb-1 text-sm">
            {[
              { id: "semua", label: "Semua Status" },
              { id: "Menunggu Aktivasi", label: "Menunggu Aktivasi" },
              { id: "Aktif", label: "Aktif" },
              { id: "Nonaktif", label: "Nonaktif" },
            ].map((tab) => (
              <AdminFilterTabItem
                key={tab.id}
                label={tab.label}
                isActive={statusFilter === tab.id}
                onClick={() => setStatusFilter(tab.id)}
              />
            ))}
          </div>

          {/* Search Input */}
          <AdminSearchInput
            placeholder="Cari biro, email, atau deskripsi..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Tabel Data Biro */}
        <AdminDataTable
          columns={columns}
          data={filteredList}
          keyExtractor={(item) => item.id}
          emptyMessage="Tidak ada biro atau komunitas yang sesuai dengan pencarian / filter."
        />
      </AdminTableContainer>

      {/* Modals */}

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
