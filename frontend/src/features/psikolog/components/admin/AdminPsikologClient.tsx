"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { TenagaAhli, StatusAkses, KategoriTenaga } from "../../types"
import { LOCAL_STORAGE_KEY_TENAGA } from "../../data/initialData"
import { psikologService } from "@/services/psikolog.service"
import {
  ActionButtonDetail,
  ActionButtonEdit,
  ActionButtonDelete,
} from "@/components/shared/TableActionButtons"
import { Users, CheckCircle2, Lock } from "lucide-react"
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  AdminFilterTabItem,
  AdminStatusBadge,
  ColumnDef,
} from "@/components/shared/AdminDataTable"
import PsikologDetailModal from "./PsikologDetailModal"
import { AdminDeleteModal } from "@/components/shared/AdminDeleteModal"

export default function AdminPsikologClient() {
  const router = useRouter()
  const [dataList, setDataList] = useState<TenagaAhli[]>([])
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>("semua")
  const [searchQuery, setSearchQuery] = useState("")

  const [deleteConfirmItem, setDeleteConfirmItem] = useState<TenagaAhli | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedDetailPsikolog, setSelectedDetailPsikolog] = useState<TenagaAhli | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const refreshPsikologList = async () => {
    try {
      const dbList = await psikologService.getList({ status: "ALL" })
      if (Array.isArray(dbList)) {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
        const localList: TenagaAhli[] = saved ? JSON.parse(saved) : []

        const mapped: TenagaAhli[] = dbList.map((p: any) => {
          const matchedLocal = localList.find(
            (loc) =>
              loc.id === p.id ||
              (loc.email && p.account?.email && loc.email.toLowerCase() === p.account.email.toLowerCase())
          )
          const katStr = (p.kategori || "").toLowerCase()
          const kategori: KategoriTenaga = katStr.includes("peer")
            ? "peer-konselor"
            : katStr.includes("konselor")
            ? "konselor"
            : "psikolog"

          const statusAkses: StatusAkses =
            p.status === "INACTIVE"
              ? "NONAKTIF"
              : matchedLocal?.statusAkses || "AKTIF"

          const accountId = p.account?.id || p.id_account || p.accountId || undefined
          const accountAktif = Boolean(
            p.accountAktif ||
            p.account?.accountAktif ||
            p.account?.password ||
            (p.account?.aktif && p.account?.password)
          )

          return {
            id: p.id,
            nama: p.nama_gelar || p.account?.nama || matchedLocal?.nama || "Psikolog Empathika",
            email:
              p.account?.email ||
              matchedLocal?.email ||
              `${(p.nama_gelar || "psikolog").toLowerCase().replace(/[^a-z0-9]/g, "")}@empathika.com`,
            noTelepon: p.account?.no_telepon || matchedLocal?.noTelepon || "081234567890",
            kategori,
            statusAkses,
            spesialisasi: p.spesialisasi?.nama || matchedLocal?.spesialisasi || "Psikologi Klinis",
            noStr: p.no_str || matchedLocal?.noStr || undefined,
            noSipp: p.no_sipp || matchedLocal?.noSipp || undefined,
            noSilp: p.no_silp || matchedLocal?.noSilp || undefined,
            pendidikanText: p.pendidikan || matchedLocal?.pendidikanText || "Universitas Indonesia",
            jumlahSesi: typeof p.jumlah_sesi === "number" ? p.jumlah_sesi : (matchedLocal?.jumlahSesi ?? 0),
            bio: p.bio || matchedLocal?.bio || "",
            quote: p.quote || matchedLocal?.quote || "",
            instagram: p.instagram || matchedLocal?.instagram || "",
            foto: p.foto || matchedLocal?.foto || null,
            keahlian: Array.isArray(p.keahlian)
              ? p.keahlian
              : typeof p.keahlian === "string"
              ? p.keahlian.split(",").map((s: string) => s.trim())
              : matchedLocal?.keahlian || ["Konseling"],
            tanggalBergabung: matchedLocal?.tanggalBergabung || "Terdaftar di DB",
            accountId,
            accountAktif,
            tokenAktivasi: p.tokenAktivasi || p.token_aktivasi || p.account?.token_aktivasi || matchedLocal?.tokenAktivasi || undefined,
            tokenExpiredAt: p.tokenExpiredAt || p.token_expired_at || p.account?.token_aktivasi_exp || matchedLocal?.tokenExpiredAt || undefined,
          }
        })

        setDataList(mapped)
        localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify(mapped))
        return mapped
      }
    } catch {
      // Offline fallback
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const cleaned = Array.isArray(parsed)
          ? parsed.filter((p: any) => !['0', '1', '2', '3', '4'].includes(p.id) && !p.email?.endsWith('@empathika.test'))
          : []
        setDataList(cleaned)
        return cleaned
      } catch {
        setDataList([])
      }
    }
    return []
  }

  useEffect(() => {
    refreshPsikologList()
  }, [])

  const persistData = (newList: TenagaAhli[], notifMsg?: string) => {
    setDataList(newList)
    localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify(newList))
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"))
    }
    if (notifMsg) {
      setNotification(notifMsg)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  // Hak Akses: Beri Akses ("AKTIF") atau Hapus Akses ("NONAKTIF")
  const handleToggleAkses = (item: TenagaAhli, newStatus: StatusAkses) => {
    const updated = dataList.map((d) => (d.id === item.id ? { ...d, statusAkses: newStatus } : d))
    const msg =
      newStatus === "AKTIF"
        ? `Akses web untuk ${item.nama} berhasil diberikan.`
        : `Akses web untuk ${item.nama} telah dinonaktifkan.`
    persistData(updated, msg)
    if (selectedDetailPsikolog && selectedDetailPsikolog.id === item.id) {
      setSelectedDetailPsikolog({ ...selectedDetailPsikolog, statusAkses: newStatus })
    }
    // Sync to backend DB
    psikologService.createPsikologBaru({ ...item, statusAkses: newStatus }).catch(() => {})
  }

  const handleOpenDetail = (item: TenagaAhli) => {
    setSelectedDetailPsikolog(item)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (item: TenagaAhli) => {
    router.push(`/admin/psikolog/edit/${item.id}`)
  }

  // Hapus Data
  const handleDeleteItem = async () => {
    if (!deleteConfirmItem) return
    setIsDeleting(true)
    const idToDelete = deleteConfirmItem.id
    const targetName = deleteConfirmItem.nama

    try {
      await psikologService.deletePsikolog(idToDelete)
      const updated = dataList.filter((d) => d.id !== idToDelete)
      persistData(updated, `Data ${targetName} telah berhasil dihapus.`)
      setDeleteConfirmItem(null)
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        `Gagal menghapus ${targetName} karena sudah memiliki data booking konsultasi dari klien.`
      setNotification(errMsg)
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setIsDeleting(false)
    }
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
        <button
          type="button"
          onClick={() => handleOpenDetail(item)}
          className="flex items-center gap-3 group text-left cursor-pointer"
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
        </button>
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
      header: "Legalitas (STR, SIPP & SILP)",
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
            {item.noSilp && (
              <p>
                SILP: <span className="font-mono text-gray-800 font-medium">{item.noSilp}</span>
              </p>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-gray-400">Tidak Perlu STR/SIPP/SILP</span>
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
          <AdminStatusBadge variant={isAktif ? "success" : "neutral"} className="w-28">
            {isAktif ? "Akses Aktif" : "Nonaktif"}
          </AdminStatusBadge>
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
            onClick={() => handleOpenDetail(item)}
            title="Lihat Detail"
          />
          <ActionButtonEdit
            onClick={() => handleOpenEdit(item)}
            title="Edit Tenaga Ahli"
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

      {/* Top Bar: Summary Cards + Tombol Tambah sejajar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Summary Cards — compact */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-3.5 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm min-w-[170px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 shrink-0">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="leading-tight">
              <p className="text-xs text-gray-400 font-medium">Total Terdaftar</p>
              <p className="text-base font-extrabold text-gray-900">{countTotal} Orang</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm min-w-[160px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="leading-tight">
              <p className="text-xs text-gray-400 font-medium">Akses Aktif</p>
              <p className="text-base font-extrabold text-emerald-600">{countAktif} Aktif</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm min-w-[160px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 shrink-0">
              <Lock className="w-5 h-5 text-gray-500" />
            </div>
            <div className="leading-tight">
              <p className="text-xs text-gray-400 font-medium">Dibatasi</p>
              <p className="text-base font-extrabold text-gray-600">{countTotal - countAktif} Nonaktif</p>
            </div>
          </div>
        </div>

        {/* Tombol Tambah */}
        <Link
          href="/admin/psikolog/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Tenaga Ahli
        </Link>
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
      <AdminDeleteModal
        isOpen={Boolean(deleteConfirmItem)}
        onClose={() => !isDeleting && setDeleteConfirmItem(null)}
        onConfirm={handleDeleteItem}
        itemType="tenaga ahli"
        itemName={deleteConfirmItem?.nama}
        isLoading={isDeleting}
      />
      {/* Modal Detail Tenaga Ahli */}
      <PsikologDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedDetailPsikolog(null)
        }}
        psikolog={selectedDetailPsikolog}
        onEdit={handleOpenEdit}
        onToggleAkses={handleToggleAkses}
        onUpdated={(next) => {
          if (selectedDetailPsikolog) {
            setSelectedDetailPsikolog({
              ...selectedDetailPsikolog,
              tokenAktivasi: next.tokenAktivasi ?? selectedDetailPsikolog.tokenAktivasi,
              tokenExpiredAt: next.tokenExpiredAt ?? selectedDetailPsikolog.tokenExpiredAt,
              accountAktif: next.accountAktif ?? selectedDetailPsikolog.accountAktif,
            })
          }
          setDataList((prev) =>
            prev.map((d) =>
              d.id === selectedDetailPsikolog?.id
                ? {
                    ...d,
                    tokenAktivasi: next.tokenAktivasi ?? d.tokenAktivasi,
                    tokenExpiredAt: next.tokenExpiredAt ?? d.tokenExpiredAt,
                    accountAktif: next.accountAktif ?? d.accountAktif,
                  }
                : d
            )
          )
        }}
        onRefreshFromServer={async () => {
          const freshList = await refreshPsikologList()
          if (selectedDetailPsikolog) {
            const found = freshList.find((x: any) => x.id === selectedDetailPsikolog.id)
            if (found) setSelectedDetailPsikolog(found)
          }
        }}
      />
    </div>
  )
}
