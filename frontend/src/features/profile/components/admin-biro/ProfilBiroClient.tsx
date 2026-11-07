"use client"

import { useState, useEffect } from "react"
import { LOCAL_STORAGE_KEY_BIRO, INITIAL_BIRO_LIST } from "@/features/biro/data/initialData"
import { BiroKomunitas } from "@/features/biro/types"
import { Building2, Mail, Phone, MapPin, Globe, Palette, ShieldCheck } from "lucide-react"
import { getBiroWebsiteUrl } from "@/lib/utils"
import { FormGantiEmail } from "@/features/profile/components/psikolog/FormGantiEmail"
import { FormGantiPassword } from "@/features/profile/components/psikolog/FormGantiPassword"
import { useAuthStore } from "@/store/authStore"
import { biroAdminService } from "@/services/biro.service"

export default function ProfilBiroClient() {
  const { user } = useAuthStore()
  const [biro, setBiro] = useState<BiroKomunitas>(INITIAL_BIRO_LIST[0])

  useEffect(() => {
    let isMounted = true

    // 1. Coba dari backend terlebih dahulu
    biroAdminService
      .getMyAccount()
      .then((res) => {
        if (!isMounted || !res?.data) return
        const beBiro = (res.data as any).owned_biro?.[0] || res.data.biro
        if (beBiro) {
          setBiro({
            id: beBiro.id || res.data.id,
            accountId: res.data.id,
            nama: beBiro.nama_biro || res.data.nama,
            slug: beBiro.slug || "",
            logo: beBiro.logoURI || undefined,
            deskripsi: beBiro.deskripsi || "Biro Mitra Empathika",
            warnaIdentitas: beBiro.warna_tema || "#561269",
            emailAdmin: res.data.email,
            telepon: res.data.no_telepon || beBiro.no_telepon || "-",
            alamat: beBiro.alamat || "-",
            statusAktivasi: res.data.aktif ? "Aktif" : "Menunggu Aktivasi",
            accountAktif: res.data.aktif,
            websiteUrl: beBiro.slug ? getBiroWebsiteUrl(beBiro.slug) : undefined,
            dashboardUrl: "/admin-biro",
          })
          return
        }
      })
      .catch(() => {})

    // 2. Fallback jika offline/local list
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BIRO)
      if (saved) {
        const list: BiroKomunitas[] = JSON.parse(saved)
        const found =
          list.find((b) => b.id === user?.id || b.emailAdmin === user?.email || b.nama === user?.name) ||
          list[0]
        if (found) setBiro(found)
      }
    } catch { }

    return () => {
      isMounted = false
    }
  }, [user])

  return (
    <div className="flex flex-col gap-8 font-poppins pb-16 w-full max-w-6xl">
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
            <a
              href={getBiroWebsiteUrl(biro.slug)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-medium hover:text-[#561269] hover:underline transition-colors"
              title="Buka Website Biro (Front)"
            >
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              {biro.slug}.localhost:3000
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. Informasi Biro & Tenant (Read-Only) ── */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col gap-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Data Identitas Lembaga Biro</h3>
              <p className="text-xs text-gray-400">Dikelola dan diverifikasi oleh Admin Utama Empathika</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">
            Read Only
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-gray-400 font-semibold block mb-1">Nama Lembaga Biro</label>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 font-bold text-gray-800">
              {biro.nama}
            </div>
          </div>

          <div>
            <label className="text-gray-400 font-semibold block mb-1">Subdomain / Slug</label>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 font-mono font-semibold text-gray-800">
              {biro.slug}.localhost:3000
            </div>
          </div>

          <div>
            <label className="text-gray-400 font-semibold block mb-1">Email Resmi Layanan</label>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-gray-800 font-medium">
              {biro.emailAdmin}
            </div>
          </div>

          <div>
            <label className="text-gray-400 font-semibold block mb-1">Nomor WhatsApp Layanan</label>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-gray-800 font-medium">
              {biro.telepon || "Belum diatur"}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-gray-400 font-semibold block mb-1">Alamat Kantor / Operasional</label>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-gray-700 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>{biro.alamat || "Belum diatur"}</span>
            </div>
          </div>

          <div className="md:col-span-2">
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

      {/* ── 3. Bagian Keamanan Akun & Kredensial Login (Langsung di halaman Profil) ── */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-bold text-[#561269]">
            Keamanan Akun & Kredensial Login
          </h3>
          <p className="text-xs text-gray-500">
            Perubahan email login dan kata sandi akun Admin Biro diproteksi dengan verifikasi keamanan ketat (OWASP ASVS).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <FormGantiEmail initialEmail={biro.emailAdmin} />
          <FormGantiPassword />
        </div>
      </div>
    </div>
  )
}
