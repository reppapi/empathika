"use client"

import React from "react"
import {
  Search,
  Filter,
  ChevronDown,
  Check,
  Eye,
  Trash2,
  Users,
} from "lucide-react"
import { InternshipApplication } from "@/services/internship.service"

interface TabApplicationsProps {
  applications: InternshipApplication[]
  loadingApps: boolean
  appSearchQuery: string
  setAppSearchQuery: (q: string) => void
  appStatusFilter: string
  setAppStatusFilter: (status: string) => void
  isStatusDropdownOpen: boolean
  setIsStatusDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  statusDropdownRef: React.RefObject<any>
  onOpenAppDetail: (app: InternshipApplication) => void
  onDeleteApp: (app: InternshipApplication) => void
  onQuickUpdateStatus: (id: string, newStatus: InternshipApplication["status"]) => void
  formatDateTime: (dateStr: string) => string
}

export function TabApplications({
  applications,
  loadingApps,
  appSearchQuery,
  setAppSearchQuery,
  appStatusFilter,
  setAppStatusFilter,
  isStatusDropdownOpen,
  setIsStatusDropdownOpen,
  statusDropdownRef,
  onOpenAppDetail,
  onDeleteApp,
  onQuickUpdateStatus,
  formatDateTime,
}: TabApplicationsProps) {
  const statusFilterOptions = [
    { label: "Semua Status", value: "Semua" },
    { label: "Menunggu", value: "MENUNGGU" },
    { label: "Review", value: "REVIEW" },
    { label: "Diterima", value: "DITERIMA" },
    { label: "Ditolak", value: "DITOLAK" },
  ]

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={appSearchQuery}
            onChange={(e) => setAppSearchQuery(e.target.value)}
            placeholder="Cari nama, email, universitas, posisi..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors"
          />
        </div>

        {/* Custom Status Dropdown */}
        <div className="relative w-full sm:w-auto" ref={statusDropdownRef}>
          <button
            type="button"
            onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
            className="w-full sm:w-48 px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl text-gray-700 flex items-center justify-between shadow-2xs hover:border-[#561269] focus:outline-none transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">
                {statusFilterOptions.find((opt) => opt.value === appStatusFilter)?.label ||
                  "Semua Status"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                isStatusDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isStatusDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-full sm:w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-fadeIn">
              {statusFilterOptions.map((opt) => {
                const isSelected = appStatusFilter === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setAppStatusFilter(opt.value)
                      setIsStatusDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-purple-50 text-[#561269] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#561269]" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabel Data Pelamar */}
      {loadingApps ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-2xs gap-3">
          <div className="w-8 h-8 border-3 border-[#561269] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Memuat data pelamar internship...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 bg-purple-50 text-[#561269] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {appSearchQuery || appStatusFilter !== "Semua"
              ? "Tidak Ada Hasil Pencarian"
              : "Belum Ada Lamaran Masuk"}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {appSearchQuery || appStatusFilter !== "Semua"
              ? "Coba ubah kata kunci pencarian atau reset filter status."
              : "Lamaran yang dikirimkan oleh calon peserta magang melalui formulir website akan muncul secara rapi di sini."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-[#FAF7FB] border-b border-gray-100 text-gray-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Pelamar</th>
                  <th className="py-3 px-4">Posisi Magang</th>
                  <th className="py-3 px-4">Universitas / Jurusan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-purple-50/30 transition-colors">
                    {/* Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-500">
                      {formatDateTime(app.createdAt)}
                    </td>

                    {/* Pelamar */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{app.nama}</div>
                      <div className="text-[11px] text-gray-400">{app.email}</div>
                    </td>

                    {/* Posisi */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800">{app.positionTitle}</span>
                    </td>

                    {/* Universitas */}
                    <td className="py-3.5 px-4">
                      <div className="text-gray-900 font-medium">{app.universitas}</div>
                      <div className="text-[11px] text-gray-400">
                        {app.jurusan || "-"} {app.semester ? `(Sem. ${app.semester})` : ""}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          onQuickUpdateStatus(
                            app.id,
                            e.target.value as InternshipApplication["status"]
                          )
                        }
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold border cursor-pointer transition-colors ${
                          app.status === "MENUNGGU"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : app.status === "REVIEW"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : app.status === "DITERIMA"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <option value="MENUNGGU">Menunggu</option>
                        <option value="REVIEW">Review</option>
                        <option value="DITERIMA">Diterima</option>
                        <option value="DITOLAK">Ditolak</option>
                      </select>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenAppDetail(app)}
                          className="p-1.5 rounded-lg text-[#561269] hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Lihat profil lengkap dan jawaban pelamar"
                          aria-label="Lihat Detail Pelamar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteApp(app)}
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
        </div>
      )}
    </div>
  )
}
