"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { CATEGORIES } from "../../data/layananData"

export default function TambahLayananView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultCategory = searchParams.get("category") || "02"
  
  // Hanya ambil kategori Asesmen (05), Konsultasi (02), Pelatihan Peer Helper (03)
  const allowedCategories = ["05", "02", "03"]
  
  const [formData, setFormData] = useState({
    kategori_layanan_id: defaultCategory,
    nama_layanan: "",
    metode_pelaksanaan: "Online/Offline",
    harga_weekday: "",
    harga_weekend: "",
    deskripsi: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementasi simpan data ke backend
    console.log(formData)
    router.push("/admin/layanan")
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto font-poppins pb-10">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/admin/layanan">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Layanan</h1>
          <p className="text-sm text-gray-500 mt-1">Tambahkan layanan baru ke dalam sistem Empathika.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Kategori Layanan (Select) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Kategori Layanan <span className="text-red-500">*</span></label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all bg-white"
              value={formData.kategori_layanan_id}
              onChange={(e) => setFormData({...formData, kategori_layanan_id: e.target.value})}
              required
            >
              <option value="" disabled>Pilih Kategori Layanan</option>
              {CATEGORIES.filter(c => allowedCategories.includes(c.id)).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* Grid for Name & Metode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Nama Layanan <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="Contoh: Konseling Individu" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all"
                value={formData.nama_layanan}
                onChange={(e) => setFormData({...formData, nama_layanan: e.target.value})}
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Metode Pelaksanaan <span className="text-red-500">*</span></label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all bg-white"
                value={formData.metode_pelaksanaan}
                onChange={(e) => setFormData({...formData, metode_pelaksanaan: e.target.value})}
                required
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Online/Offline">Online & Offline</option>
              </select>
            </div>
          </div>

          {/* Grid for Harga */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Harga Weekday (Rp) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                <input 
                  type="number" 
                  placeholder="350000" 
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all"
                  value={formData.harga_weekday}
                  onChange={(e) => setFormData({...formData, harga_weekday: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Harga Weekend (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                <input 
                  type="number" 
                  placeholder="450000" 
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all"
                  value={formData.harga_weekend}
                  onChange={(e) => setFormData({...formData, harga_weekend: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Deskripsi Layanan</label>
            <textarea 
              rows={4}
              placeholder="Tuliskan deskripsi singkat mengenai layanan ini..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all resize-y"
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Link href="/admin/layanan">
              <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Batal
              </button>
            </Link>
            <button type="submit" className="px-6 py-2.5 bg-[#561269] text-white font-medium rounded-lg text-sm hover:bg-[#430b53] transition-colors shadow-sm">
              Simpan Layanan
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}
