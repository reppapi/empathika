"use client"

import React, { useState, useMemo } from "react"
import { X, Calendar, Clock, User, Phone, Video, MapPin, FileText, CheckCircle2, ShieldCheck } from "lucide-react"
import { NewSessionData, formatIndoPhoneChunks } from "../admin/ModalTambahSesi"
import { BiroClientProfile } from "../../data/biroDashboardData"

interface BiroModalTambahSesiProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newSession: NewSessionData) => void
  biroName: string
  existingClients: BiroClientProfile[]
}

export default function BiroModalTambahSesi({
  isOpen,
  onClose,
  onSuccess,
  biroName,
  existingClients,
}: BiroModalTambahSesiProps) {
  const todayStr = new Date().toISOString().split("T")[0]

  const [formData, setFormData] = useState({
    namaKlien: "",
    kontak: "",
    layanan: "Konseling Individu (Mahasiswa)",
    psikolog: "Sarah Amalia, M.Psi",
    tanggal: todayStr,
    waktu: "13:00 - 14:00 WIB",
    metode: "Online" as "Online" | "Offline",
    catatan: "",
  })

  const phoneDigits = useMemo(() => {
    let cleaned = (formData.kontak || "").replace(/\D/g, "")
    if (cleaned.startsWith("62")) cleaned = cleaned.slice(2)
    else if (cleaned.startsWith("0")) cleaned = cleaned.slice(1)
    return cleaned.slice(0, 13)
  }, [formData.kontak])

  const phoneDisplay = useMemo(() => {
    return formatIndoPhoneChunks(phoneDigits)
  }, [phoneDigits])

  if (!isOpen) return null

  const handleSelectExistingClient = (clientId: string) => {
    const selected = existingClients.find((c) => c.id === clientId)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        namaKlien: selected.nama,
        kontak: selected.telepon,
        layanan: selected.layanan,
        psikolog: selected.psikologPendamping,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.namaKlien.trim()) return

    const newSession: NewSessionData = {
      id: "sesi_biro_" + Date.now(),
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
      layanan: "Konseling Individu (Mahasiswa)",
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
        <div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8C32A]/20 text-[#8a720d] flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  Tambah Sesi Konseling Biro
                </h3>
                <p className="text-xs text-gray-500">
                  Jadwalkan sesi konsultasi untuk klien binaan{" "}
                  <span className="font-semibold text-[#561269]">{biroName}</span>
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

          {/* Banner Tenant Verification */}
          <div className="mb-5 flex items-center gap-2 p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-[#561269]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#561269]" />
            <p>
              Sesi konseling ini otomatis terikat ke tenant <strong>{biroName}</strong> dan hanya dapat diakses oleh admin biro ini.
            </p>
          </div>

          {/* Form */}
          <form id="tambah-sesi-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Quick Pick: Pilih dari Klien Terdaftar */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Pilih Cepat dari Klien Terdaftar Biro (Opsional)
              </label>
              <select
                onChange={(e) => handleSelectExistingClient(e.target.value)}
                defaultValue=""
                className="w-full rounded-xl border border-gray-200 p-2.5 bg-gray-50 text-gray-700 focus:outline-none focus:border-[#561269]"
              >
                <option value="">-- Ketik manual atau pilih klien binaan --</option>
                {existingClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama} ({c.clientCode}) - {c.fokusKonseling}
                  </option>
                ))}
              </select>
            </div>

            {/* Nama Klien & Kontak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap Klien *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.namaKlien}
                    onChange={(e) => setFormData({ ...formData, namaKlien: e.target.value })}
                    placeholder="Contoh: Karen Sya"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#561269]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Nomor Kontak / WhatsApp</span>
                  {phoneDigits.length > 0 && (
                    <span
                      className={`text-[10px] font-bold ${
                        phoneDigits.length >= 10 && phoneDigits.length <= 13
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {phoneDigits.length} digit
                    </span>
                  )}
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50 focus-within:bg-white focus-within:border-[#561269] focus-within:ring-2 focus-within:ring-[#561269] transition-all">
                  <span className="inline-flex items-center px-3 bg-purple-50/70 border-r border-gray-200 text-[#561269] text-xs font-bold select-none">
                    +62
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="812-3456-7890"
                    value={phoneDisplay}
                    onChange={(e) => {
                      const val = e.target.value
                      const digits = val.replace(/\D/g, "")
                      let cleaned = digits
                      if (cleaned.startsWith("62")) cleaned = cleaned.slice(2)
                      else if (cleaned.startsWith("0")) cleaned = cleaned.slice(1)
                      cleaned = cleaned.slice(0, 13)
                      setFormData((prev) => ({
                        ...prev,
                        kontak: cleaned ? `+62 ${formatIndoPhoneChunks(cleaned)}` : "",
                      }))
                    }}
                    className="flex-1 block w-full px-3 py-2.5 text-xs font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                  <span className="inline-flex items-center px-2.5 bg-gray-50 border-l border-gray-200 text-gray-400 text-[10px] font-semibold select-none">
                    {phoneDigits.length > 0 ? `${phoneDigits.length} digit` : "10-13 digit"}
                  </span>
                </div>
              </div>
            </div>

            {/* Layanan & Psikolog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Jenis Layanan</label>
                <select
                  value={formData.layanan}
                  onChange={(e) => setFormData({ ...formData, layanan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#561269]"
                >
                  <option value="Konseling Individu (Mahasiswa)">Konseling Individu (Mahasiswa)</option>
                  <option value="Konseling Remaja & Peer Helper">Konseling Remaja & Peer Helper</option>
                  <option value="Konseling Karir & Passion">Konseling Karir & Passion</option>
                  <option value="Konseling Pasangan / Pranikah">Konseling Pasangan / Pranikah</option>
                  <option value="Psikotes Minat & Bakat">Psikotes Minat & Bakat</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Psikolog Pendamping</label>
                <select
                  value={formData.psikolog}
                  onChange={(e) => setFormData({ ...formData, psikolog: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#561269]"
                >
                  <option value="Sarah Amalia, M.Psi">Sarah Amalia, M.Psi</option>
                  <option value="Dr. Dimas Prasetyo">Dr. Dimas Prasetyo</option>
                  <option value="Rizki Putri D., M.Psi">Rizki Putri D., M.Psi</option>
                  <option value="Nadira Larasati, M.Psi">Nadira Larasati, M.Psi</option>
                </select>
              </div>
            </div>

            {/* Tanggal, Jam & Metode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#561269]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Waktu Sesi</label>
                <select
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#561269]"
                >
                  <option value="09:00 - 10:00 WIB">09:00 - 10:00 WIB</option>
                  <option value="11:00 - 12:00 WIB">11:00 - 12:00 WIB</option>
                  <option value="13:00 - 14:00 WIB">13:00 - 14:00 WIB</option>
                  <option value="14:00 - 15:00 WIB">14:00 - 15:00 WIB</option>
                  <option value="16:00 - 17:00 WIB">16:00 - 17:00 WIB</option>
                  <option value="16:30 - 17:30 WIB">16:30 - 17:30 WIB</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Metode</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, metode: "Online" })}
                    className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                      formData.metode === "Online"
                        ? "bg-[#561269] text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, metode: "Offline" })}
                    className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                      formData.metode === "Offline"
                        ? "bg-[#561269] text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Offline
                  </button>
                </div>
              </div>
            </div>

            {/* Catatan Sesi */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Catatan Tambahan untuk Biro</label>
              <textarea
                rows={2}
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Catatan kebutuhan klien atau tindak lanjut..."
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#561269]"
              />
            </div>
          </form>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="tambah-sesi-form"
            className="px-6 py-2.5 rounded-xl bg-[#E8C32A] hover:bg-[#d4b024] text-gray-900 text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Jadwalkan Sesi Klien
          </button>
        </div>
      </div>
    </div>
  )
}
