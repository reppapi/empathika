"use client"

import { useState, useEffect } from "react"
import { LOCAL_STORAGE_KEY_BIRO, INITIAL_BIRO_LIST } from "@/features/biro/data/initialData"
import { BiroKomunitas } from "@/features/biro/types"
import { Building2, Mail, Phone, MapPin, Globe, Palette, ShieldCheck, Lock, CheckCircle2, AlertCircle } from "lucide-react"

export default function ProfilBiroClient() {
  const [biro, setBiro] = useState<BiroKomunitas>(INITIAL_BIRO_LIST[0])
  
  // State untuk form ganti password / keamanan akun
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BIRO)
      if (saved) {
        const list: BiroKomunitas[] = JSON.parse(saved)
        // Default akun biro cendekia muda (id biro-01)
        const found = list.find((b) => b.id === "biro-01") || list[0]
        if (found) setBiro(found)
      }
    } catch {}
  }, [])

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword || !confirmPassword) {
      setToastType("error")
      setToastMessage("Harap lengkapi semua kolom kata sandi.")
      return
    }

    if (newPassword !== confirmPassword) {
      setToastType("error")
      setToastMessage("Kata sandi baru dan konfirmasi tidak cocok.")
      return
    }

    if (newPassword.length < 6) {
      setToastType("error")
      setToastMessage("Kata sandi baru minimal 6 karakter.")
      return
    }

    setToastType("success")
    setToastMessage("Kata sandi akun biro berhasil diperbarui!")
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")

    setTimeout(() => {
      setToastMessage("")
    }, 3500)
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-semibold transition-all ${
            toastType === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toastType === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Header Profil Biro ── */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-md overflow-hidden"
            style={{ backgroundColor: biro.warnaIdentitas || "#561269" }}
          >
            {biro.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={biro.logo}
                alt={biro.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              biro.nama.slice(0, 2).toUpperCase()
            )}
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
            {biro.statusAktivasi}
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              {biro.nama}
            </h2>
            <span className="rounded-full bg-purple-100 text-[#561269] text-xs font-semibold px-3 py-1">
              Mitra Resmi Empathika
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed max-w-2xl">
            {biro.deskripsi}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {biro.emailAdmin}
            </span>
            {biro.telepon && (
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {biro.telepon}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              {biro.slug}.empathika.id
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── 2. Informasi Biro & Tenant (Read-Only) ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Data Identitas Biro</h3>
                  <p className="text-[11px] text-gray-400">Dikelola dan diverifikasi oleh Admin Utama Empathika</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">
                Read Only
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 font-semibold block mb-1">Nama Biro / Komunitas</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 font-bold text-gray-800">
                  {biro.nama}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Subdomain / Slug</label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 font-semibold text-gray-800">
                    {biro.slug}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    Warna Identitas Template
                  </label>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-lg border border-black/10 shrink-0"
                      style={{ backgroundColor: biro.warnaIdentitas || "#561269" }}
                    />
                    <span className="font-mono font-bold text-gray-800">{biro.warnaIdentitas || "#561269"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Alamat Kantor / Operasional</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-gray-700 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{biro.alamat || "Belum diatur"}</span>
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Deskripsi Profil Lembaga</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-gray-700 leading-relaxed">
                  {biro.deskripsi}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Untuk mengajukan perubahan nama biro, logo, atau warna template identitas, silakan menghubungi tim <strong>Admin Pusat Empathika</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Pengaturan Keamanan Akun Biro (Editable) ── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Keamanan & Sandi</h3>
                <p className="text-[11px] text-gray-400">Kelola kata sandi akun portal admin biro Anda</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-700 font-semibold block mb-1">Email Login</label>
                <input
                  type="email"
                  disabled
                  value={biro.emailAdmin}
                  className="w-full p-3 bg-gray-100/80 text-gray-500 rounded-xl border border-gray-200 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi lama"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:border-[#561269] focus:ring-1 focus:ring-[#561269] transition"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:border-[#561269] focus:ring-1 focus:ring-[#561269] transition"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:border-[#561269] focus:ring-1 focus:ring-[#561269] transition"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#561269] hover:bg-[#6c1784] text-white font-bold text-xs shadow-md transition-transform active:scale-98"
              >
                Simpan Kata Sandi
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
