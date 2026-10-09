"use client"

import { CloudUpload, X } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { CATEGORIES } from "../../data/layananData"

export default function TambahLayananView() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || ""

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialCategory && !selectedCategory) {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Form Input Layanan</h1>
        <p className="text-sm text-gray-500 mt-1">Isi data layanan dibawah ini dengan lengkap</p>
      </div>

      <div className="w-full h-px bg-gray-200 mb-6"></div>

      <form className="space-y-6">
        {/* Kategori Layanan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori Layanan <span className="text-red-500">*</span>
          </label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white"
          >
            <option value="" disabled>Pilih kategori layanan</option>
            {CATEGORIES.filter(cat => ["02", "03", "05"].includes(cat.id)).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Layanan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Layanan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama layanan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
            />
          </div>

          {/* Metode Pelaksanaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode pelaksanaan <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="metode"
                  value="online"
                  className="w-4 h-4 text-[#561269] border-gray-300 focus:ring-[#561269]"
                />
                <span className="text-sm text-gray-700">Online</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="metode"
                  value="offline"
                  className="w-4 h-4 text-[#561269] border-gray-300 focus:ring-[#561269]"
                />
                <span className="text-sm text-gray-700">Offline</span>
              </label>
            </div>
          </div>
        </div>

        {/* Deskripsi Layanan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Layanan <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Masukkan deskripsi mengenai layanan ini"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] resize-y"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Harga Layanan */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Harga Layanan <span className="text-red-500">*</span>
            </label>
            
            {/* Weekday */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weekday (Senin - Jumat)</label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  placeholder="Masukkan harga"
                  className="flex-1 block w-full px-4 py-2 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                />
              </div>
            </div>

            {/* Weekend */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weekend (Sabtu - Minggu)</label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  placeholder="Masukkan harga"
                  className="flex-1 block w-full px-4 py-2 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                />
              </div>
            </div>
          </div>

          {/* Poster / Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poster / Banner Layanan <span className="text-red-500">*</span>
            </label>
            <div 
              className={`mt-1 flex justify-center border-2 ${imagePreview ? 'border-solid border-gray-200 p-2' : 'border-dashed border-gray-300 px-6 pt-10 pb-10 hover:bg-gray-100'} rounded-lg bg-gray-50 transition-colors cursor-pointer relative overflow-hidden`}
              onClick={handleImageClick}
              style={{ minHeight: '160px' }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg, image/png"
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative w-full h-full min-h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-center my-auto">
                  <CloudUpload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    Upload gambar poster / banner
                  </div>
                  <p className="text-xs text-gray-500">
                    Format: JPG, PNG (Max. 2MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Link href="/admin/layanan">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Kembali
            </button>
          </Link>
          <button
            type="submit"
            className="px-6 py-2 bg-[#561269] hover:bg-[#430b53] text-white rounded-lg text-sm font-medium transition-colors"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  )
}
