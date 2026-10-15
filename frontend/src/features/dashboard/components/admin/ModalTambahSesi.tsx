"use client"

import React, { useState } from "react"
import { X, Calendar, Clock, User, Phone, Video, MapPin, FileText, CheckCircle2 } from "lucide-react"

export interface NewSessionData {
  id: string
  namaKlien: string
  kontak: string
  layanan: string
  psikolog: string
  tanggal: string
  waktu: string
  metode: "Online" | "Offline"
  catatan?: string
  status: "Mendatang" | "Sedang Berjalan" | "Selesai"
}

interface ModalTambahSesiProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newSession: NewSessionData) => void
}

export default function ModalTambahSesi({ isOpen, onClose, onSuccess }: ModalTambahSesiProps) {
  const todayStr = new Date().toISOString().split("T")[0]

  const [formData, setFormData] = useState({
    namaKlien: "",
    kontak: "",
    layanan: "Konseling Individu",
    psikolog: "Sarah Amalia, M.Psi",
    tanggal: todayStr,
    waktu: "13:00 - 14:00 WIB",
    metode: "Online" as "Online" | "Offline",
    catatan: "",
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.namaKlien.trim()) return

    const newSession: NewSessionData = {
      id: "sesi_" + Date.now(),
      namaKlien: formData.namaKlien.trim(),
      kontak: formData.kontak.trim(),
      layanan: formData.layanan,
      psikolog: formData.psikolog,
      tanggal: formData.tanggal,
      waktu: formData.waktu,
      metode: formData.metode,
      catatan: formData.catatan.trim(),
      status: "Mendatang",
    }

    onSuccess(newSession)
    // Reset form
    setFormData({
      namaKlien: "",
      kontak: "",
      layanan: "Konseling Individu",
      psikolog: "Sarah Amalia, M.Psi",
      tanggal: todayStr,
      waktu: "13:00 - 14:00 WIB",
      metode: "Online",
      catatan: "",
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8C32A]/20 text-[#8a720d] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                Tambah Sesi Konseling Baru
              </h3>
              <p className="text-xs text-gray-500">
                Jadwalkan konsultasi klien langsung ke kalender operasional.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Nama Klien & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#5D205E]" />
                Nama Klien <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="cth: Budi Santoso"
                value={formData.namaKlien}
                onChange={(e) => setFormData({ ...formData, namaKlien: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#5D205E]" />
                No. WhatsApp / Kontak
              </label>
              <input
                type="tel"
                placeholder="cth: 0812-3456-7890"
                value={formData.kontak}
                onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* Jenis Layanan & Psikolog */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Jenis Layanan</label>
              <select
                value={formData.layanan}
                onChange={(e) => setFormData({ ...formData, layanan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium cursor-pointer"
              >
                <option value="Konseling Individu">Konseling Individu</option>
                <option value="Konseling Dewasa">Konseling Dewasa</option>
                <option value="Konseling Karir & Stres">Konseling Karir & Stres</option>
                <option value="Konseling Pasangan">Konseling Pasangan</option>
                <option value="Konseling Remaja">Konseling Remaja</option>
                <option value="Hipnoterapi Klinis">Hipnoterapi Klinis</option>
                <option value="Asesmen Klinis">Asesmen Klinis</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Psikolog / Tenaga Ahli</label>
              <select
                value={formData.psikolog}
                onChange={(e) => setFormData({ ...formData, psikolog: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium cursor-pointer"
              >
                <option value="Sarah Amalia, M.Psi">Sarah Amalia, M.Psi., Psikolog</option>
                <option value="Dr. Dimas Prasetyo">Dr. Dimas Prasetyo, M.Psi</option>
                <option value="Rizki Putri D., M.Psi">Rizki Putri Dzulqaidah, M.Psi</option>
                <option value="Nadia Utami, S.Psi">Nadia Utami, S.Psi (Konselor)</option>
              </select>
            </div>
          </div>

          {/* Tanggal & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5D205E]" />
                Tanggal Konsultasi
              </label>
              <input
                type="date"
                required
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5D205E]" />
                Jam Sesi
              </label>
              <select
                value={formData.waktu}
                onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium cursor-pointer"
              >
                <option value="09:00 - 10:00 WIB">09:00 - 10:00 WIB</option>
                <option value="10:30 - 11:30 WIB">10:30 - 11:30 WIB</option>
                <option value="13:00 - 14:00 WIB">13:00 - 14:00 WIB</option>
                <option value="14:30 - 15:30 WIB">14:30 - 15:30 WIB</option>
                <option value="16:00 - 17:00 WIB">16:00 - 17:00 WIB</option>
                <option value="19:00 - 20:00 WIB">19:00 - 20:00 WIB</option>
              </select>
            </div>
          </div>

          {/* Metode Konseling */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">Metode Konsultasi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, metode: "Online" })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                  formData.metode === "Online"
                    ? "border-[#5D205E] bg-[#5D205E]/10 text-[#5D205E] ring-1 ring-[#5D205E]"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <Video className="w-4 h-4" />
                Online (Zoom Meeting)
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, metode: "Offline" })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                  formData.metode === "Offline"
                    ? "border-[#5D205E] bg-[#5D205E]/10 text-[#5D205E] ring-1 ring-[#5D205E]"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <MapPin className="w-4 h-4" />
                Offline (Klinik Empathika)
              </button>
            </div>
          </div>

          {/* Catatan / Keluhan Awal */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#5D205E]" />
              Catatan / Keluhan Awal (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Tuliskan catatan khusus atau keluhan klien jika ada..."
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium"
            />
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#E8C32A] hover:bg-[#d4b024] text-gray-900 font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Jadwalkan Sesi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
