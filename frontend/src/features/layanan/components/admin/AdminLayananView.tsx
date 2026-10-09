"use client"

import { Plus, Search, Filter, MoreVertical, CalendarClock } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { CATEGORIES } from "../../data/layananData"

export default function AdminLayananView() {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  
  // Hanya ambil kategori Asesmen (05), Konsultasi (02), Pelatihan Peer Helper (03)
  const allowedCategories = ["05", "02", "03"]
  const [activeCategory, setActiveCategory] = useState("02")

  const toggleDropdown = (index: number) => {
    if (openDropdown === index) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown(index)
    }
  }

  const layananData = [
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

  return (
    <div className="flex flex-col gap-6">
      
      {/* Tombol Tambah Layanan di Atas Kategori */}
      <div className="flex justify-end mb-2">
        <Link href={`/admin/layanan/tambah?category=${activeCategory}`}>
          <button className="bg-[#561269] hover:bg-[#430b53] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Tambah Layanan
          </button>
        </Link>
      </div>

      {/* Kategori Tabs */}
      <div className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-1 overflow-x-auto hide-scrollbar">
        {CATEGORIES.filter(c => allowedCategories.includes(c.id)).map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-semibold transition-colors border-b-2 
              ${activeCategory === cat.id 
                ? 'border-[#561269] text-[#561269]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
        {/* Card Total Layanan */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 min-w-[240px]">
          <div className="bg-[#A4C4E7] p-3 rounded-full text-[#462270]">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Layanan</div>
            <div className="text-lg font-bold text-gray-800">{layananData.length}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari Layanan" 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]" 
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shrink-0">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#D1C6E1] text-[#462270] font-semibold text-sm">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl w-16">No</th>
                <th className="px-6 py-4">Layanan</th>
                <th className="px-6 py-4">Metode Pelaksanaan</th>
                <th className="px-6 py-4">Weekday</th>
                <th className="px-6 py-4">Weekend</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 rounded-tr-xl w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {layananData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 text-gray-800">{item.layanan}</td>
                  <td className="px-6 py-4 text-gray-600">{item.metode}</td>
                  <td className="px-6 py-4 text-gray-600">{item.weekday}</td>
                  <td className="px-6 py-4 text-gray-600">{item.weekend}</td>
                  <td className="px-6 py-4">
                    <span className="bg-[#BCE6C9] text-[#1c6c39] px-4 py-1.5 rounded-md text-xs font-semibold inline-block">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center relative">
                    <button 
                      onClick={() => toggleDropdown(index)}
                      className="p-1 rounded-md text-gray-600 hover:text-[#561269] hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === index && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenDropdown(null)}
                        ></div>
                        <div className="absolute right-8 top-10 w-36 bg-white rounded-lg shadow-md border border-gray-100 z-20 py-2 text-left">
                          <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors">
                            Lihat Detail
                          </button>
                          <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors">
                            Edit
                          </button>
                          <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors">
                            Hapus
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
