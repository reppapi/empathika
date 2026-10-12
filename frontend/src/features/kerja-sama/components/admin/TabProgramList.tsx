"use client"

import React from "react"
import Link from "next/link"
import { KerjaSamaItem } from "../../types"

interface TabProgramListProps {
  items: KerjaSamaItem[]
  onOpenAddModal: () => void
  onOpenEditModal: (item: KerjaSamaItem) => void
  onToggleStatus: (id: string) => void
  onDeleteItem: (id: string, name: string) => void
}

export default function TabProgramList({
  items,
  onOpenAddModal,
  onOpenEditModal,
  onToggleStatus,
  onDeleteItem,
}: TabProgramListProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Daftar Pilihan Kolaborasi Web Client</h2>
          <p className="text-xs text-gray-500">
            Pilihan kategori ini tampil di kartu pada halaman{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-[#561269]">/kerja-sama</code>.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="bg-[#E8C32A] hover:bg-[#d4b024] text-gray-900 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <span>+ Tambah Program</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => {
          const isAktif = item.status === "AKTIF"
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isAktif
                  ? "border-gray-200 bg-white hover:shadow-md"
                  : "border-gray-300 bg-gray-50/90 opacity-75 grayscale-[35%]"
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      isAktif
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-200 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {isAktif ? "● Aktif" : "○ Disembunyikan"}
                  </span>

                  <div
                    className={`w-4 h-4 rounded-full ${
                      isAktif ? `bg-gradient-to-r ${item.color}` : "bg-gray-400"
                    }`}
                  />
                </div>

                {/* Title & Slug */}
                <h3
                  className={`text-base font-bold line-clamp-1 ${
                    isAktif ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-xs font-medium mb-2 ${
                    isAktif ? "text-[#561269]" : "text-gray-400"
                  }`}
                >
                  /kerja-sama/{item.slug}
                </p>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Preview Sub-konten */}
                <div
                  className={`rounded-xl p-3 mb-4 space-y-2 text-[11px] border ${
                    isAktif
                      ? "bg-purple-50/50 border-purple-100/80"
                      : "bg-gray-100/80 border-gray-200 text-gray-500"
                  }`}
                >
                  <div>
                    <span
                      className={`font-bold ${isAktif ? "text-[#561269]" : "text-gray-600"}`}
                    >
                      Bentuk Pelatihan:
                    </span>
                    <p className="text-gray-600 line-clamp-1">{item.pelatihanTitle || "-"}</p>
                  </div>
                  <div>
                    <span
                      className={`font-bold ${isAktif ? "text-[#561269]" : "text-gray-600"}`}
                    >
                      Kemitraan Sebelumnya:
                    </span>
                    <p className="text-gray-600 line-clamp-1">{item.mitraTitle || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between border-t border-gray-200/80 pt-3 mt-2">
                {/* Toggle Status */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAktif}
                    onChange={() => onToggleStatus(item.id)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#561269] relative" />
                  <span className={isAktif ? "text-gray-800 font-bold" : "text-gray-500"}>
                    {isAktif ? "Tampil" : "Sembunyi"}
                  </span>
                </label>

                {/* Edit & Link */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/kerja-sama/${item.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#561269] hover:bg-purple-50 transition"
                    title="Buka Halaman Detail Client"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={() => onOpenEditModal(item)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#561269] hover:bg-purple-50 transition"
                    title="Edit Konten"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id, item.title)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Hapus"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
