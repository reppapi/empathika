"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { TenagaAhli, KategoriTenaga, StatusAkses } from "../types"
import { INITIAL_TENAGA_AHLI, LOCAL_STORAGE_KEY_TENAGA } from "../initialData"

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

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* Notifikasi Singkat */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-3 text-white shadow-xl transition-all">
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      {/* Header Halaman */}
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
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#561269] hover:bg-[#6f1b87] px-6 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Tenaga Ahli
        </Link>
      </div>

      {/* Ringkasan Singkat */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Tenaga Terdaftar</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{countTotal} Orang</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Akses Web Aktif</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{countAktif} Aktif</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Akses Dibatasi</p>
          <p className="text-xl font-bold text-gray-600 mt-1">{countTotal - countAktif} Nonaktif</p>
        </div>
      </div>

      {/* Filter Tunggal & Pencarian */}
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, email, atau bidang spesialisasi..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Filter Kategori Tunggal */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium mr-1">Kategori:</span>
          {[
            { id: "semua", label: "Semua" },
            { id: "psikolog", label: "Psikolog" },
            { id: "konselor", label: "Konselor" },
            { id: "peer-konselor", label: "Peer Konselor" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedKategoriFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                selectedKategoriFilter === tab.id
                  ? "bg-[#561269] text-white shadow-sm font-semibold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Daftar Tenaga Ahli */}
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/60 text-xs font-semibold text-gray-600">
                <th className="py-3.5 px-6">Nama & Email</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Legalitas (STR & SIPP)</th>
                <th className="py-3.5 px-4">No. Telepon</th>
                <th className="py-3.5 px-4 text-center">Hak Akses Web</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    Tidak ditemukan data yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isPsikolog = item.kategori === "psikolog"
                  const isAktif = item.statusAkses === "AKTIF"

                  return (
                    <tr key={item.id} className="hover:bg-purple-50/20 transition">
                      {/* Kolom 1: Profil (Bisa diklik menuju detail) */}
                      <td className="py-4 px-6">
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
                            <p className="font-semibold text-gray-900 group-hover:text-[#561269] transition text-sm">
                              {item.nama}
                            </p>
                            <p className="text-xs text-gray-500">{item.spesialisasi}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{item.email}</p>
                          </div>
                        </Link>
                      </td>

                      {/* Kolom 2: Kategori */}
                      <td className="py-4 px-4">
                        <span className="inline-block rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700 capitalize">
                          {item.kategori.replace("-", " ")}
                        </span>
                      </td>

                      {/* Kolom 3: STR & SIPP */}
                      <td className="py-4 px-4">
                        {isPsikolog ? (
                          <div className="space-y-1 text-[11px]">
                            <p>STR: <span className="font-mono text-gray-800">{item.noStr || "-"}</span></p>
                            <p>SIPP: <span className="font-mono text-gray-800">{item.noSipp || "-"}</span></p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">Tidak Perlu STR/SIPP</span>
                        )}
                      </td>

                      {/* Kolom 4: Telepon */}
                      <td className="py-4 px-4">
                        <p className="text-gray-800">{item.noTelepon}</p>
                      </td>

                      {/* Kolom 5: Hak Akses Sederhana (Beri Akses / Hapus Akses) */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isAktif
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isAktif ? "Akses Aktif" : "Nonaktif"}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleAkses(item, isAktif ? "NONAKTIF" : "AKTIF")}
                            className={`text-[11px] font-medium px-3 py-1 rounded-xl transition ${
                              isAktif
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {isAktif ? "Hapus Akses" : "Beri Akses"}
                          </button>
                        </div>
                      </td>

                      {/* Kolom 6: Aksi */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/psikolog/${item.id}`}
                            className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-[#561269] hover:bg-purple-100 transition"
                          >
                            Detail
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(item)}
                            className="rounded-xl border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-red-600 hover:border-red-200 transition"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
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
