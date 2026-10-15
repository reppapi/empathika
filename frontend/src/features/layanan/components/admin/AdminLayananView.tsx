"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarClock } from "lucide-react"
import { CATEGORIES } from "../../data/layananData"
import {
  ActionButtonDetail,
  ActionButtonEdit,
  ActionButtonDelete,
} from "@/components/shared/TableActionButtons"
import { AdminSummaryCard } from "@/components/shared/AdminSummaryCard"
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  AdminFilterTabItem,
  AdminStatusBadge,
  ColumnDef,
} from "@/components/shared/AdminDataTable"

interface LayananItem {
  id: number
  layanan: string
  metode: string
  weekday: string
  weekend: string
  status: string
}

export default function AdminLayananView() {
  const [searchQuery, setSearchQuery] = useState("")

  // Hanya ambil kategori Konsultasi, Pelatihan peer helper, dan Asesmen
  const allowedCategories = ["02", "03", "05"]
  const adminCategories = CATEGORIES.filter((cat) => allowedCategories.includes(cat.id))

  const [activeCategory, setActiveCategory] = useState(adminCategories[0]?.id || "")

  // Data Layanan
  const layananData: LayananItem[] = [
    {
      id: 1,
      layanan: "Psikolog",
      metode: "Online/Offline",
      weekday: "Rp 350.000",
      weekend: "Rp 450.000",
      status: "Aktif",
    },
    {
      id: 2,
      layanan: "Peer Konselor",
      metode: "Online/Offline",
      weekday: "Rp 350.000",
      weekend: "Rp 450.000",
      status: "Aktif",
    },
  ]

  const filteredLayanan = layananData.filter((item) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return item.layanan.toLowerCase().includes(q) || item.metode.toLowerCase().includes(q)
  })

  const columns: ColumnDef<LayananItem>[] = [
    {
      key: "no",
      header: "No",
      align: "center",
      width: "70px",
      render: (_: LayananItem, index: number) => (
        <span className="font-semibold text-gray-500">{index + 1}</span>
      ),
    },
    {
      key: "layanan",
      header: "Layanan",
      render: (item: LayananItem) => (
        <span className="font-extrabold text-gray-900 leading-tight">
          {item.layanan}
        </span>
      ),
    },
    {
      key: "metode",
      header: "Metode Pelaksanaan",
      render: (item: LayananItem) => <span className="text-gray-700 font-medium">{item.metode}</span>,
    },
    {
      key: "weekday",
      header: "Weekday",
      render: (item: LayananItem) => <span className="text-gray-700 font-semibold">{item.weekday}</span>,
    },
    {
      key: "weekend",
      header: "Weekend",
      render: (item: LayananItem) => <span className="text-gray-700 font-semibold">{item.weekend}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (item: LayananItem) => (
        <AdminStatusBadge variant="success">
          {item.status}
        </AdminStatusBadge>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (item: LayananItem) => (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <ActionButtonDetail
            onClick={() => alert(`Detail layanan ${item.layanan}`)}
            title="Lihat Detail"
          />
          <ActionButtonEdit
            onClick={() => alert(`Edit layanan ${item.layanan}`)}
            title="Edit"
          />
          <ActionButtonDelete
            onClick={() => {
              if (confirm(`Apakah Anda yakin ingin menghapus layanan ${item.layanan}?`)) {
                alert(`Layanan ${item.layanan} berhasil dihapus.`)
              }
            }}
            title="Hapus"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Bar Action: Tombol Tambah Layanan ── */}
      <div className="flex justify-end">
        <Link
          href={`/admin/layanan/tambah?category=${activeCategory}`}
          className="flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Layanan
        </Link>
      </div>

      {/* ── Metric Card: Total Layanan ── */}
      <div className="w-full max-w-sm">
        <AdminSummaryCard
          label="Total Layanan"
          value={layananData.length}
          icon={<CalendarClock className="w-6 h-6 text-[#561269]" />}
          iconBgColor="bg-purple-50 text-[#561269]"
        />
      </div>

      {/* ── Main Card Table Container ── */}
      <AdminTableContainer>
        {/* Header Bar: Filter Tabs & Search */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          {/* Tabs Kategori */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-transparent overflow-x-auto pb-1 text-sm">
            {adminCategories.map((cat) => (
              <AdminFilterTabItem
                key={cat.id}
                label={cat.title}
                isActive={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </div>

          {/* Search Input */}
          <AdminSearchInput
            placeholder="Cari Layanan..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Tabel Layanan */}
        <AdminDataTable
          columns={columns}
          data={filteredLayanan}
          keyExtractor={(item: LayananItem) => item.id}
          emptyMessage="Tidak ada layanan yang ditemukan."
        />
      </AdminTableContainer>
    </div>
  )
}
