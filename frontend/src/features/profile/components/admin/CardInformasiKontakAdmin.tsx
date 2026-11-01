"use client"

import React from "react"
import { AdminProfileData, RoleType } from "../../types"

interface CardInformasiKontakAdminProps {
  role?: RoleType
  form: AdminProfileData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export function CardInformasiKontakAdmin({
  role = "admin",
  form,
  onChange,
}: CardInformasiKontakAdminProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
          Informasi Umum &amp; Kontak
        </h3>
        <p className="text-xs text-gray-400">
          Data dasar akun untuk kebutuhan identitas internal dan korespondensi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama"
            value={form.nama || ""}
            onChange={onChange}
            required
            placeholder="Contoh: dr. John Doe, M.Psi."
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Alamat Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email || ""}
            onChange={onChange}
            required
            placeholder="nama@empathika.com"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Nomor WhatsApp / Telepon
          </label>
          <input
            type="text"
            name="noTelepon"
            value={form.noTelepon || ""}
            onChange={onChange}
            placeholder="0812xxxxxxxx"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
          />
        </div>

        {role === "psikolog" && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Akun Instagram
            </label>
            <input
              type="text"
              name="instagram"
              value={form.instagram || ""}
              onChange={onChange}
              placeholder="@username"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
          </div>
        )}

        {role === "admin" && (
          <>
            <div className="md:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                <svg className="w-4 h-4 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Alamat</span>
              </label>
              <input
                type="text"
                name="alamat"
                value={form.alamat || ""}
                onChange={onChange}
                placeholder="Contoh: Jl. Cikutra No.312, Neglasari, Kec. Cibeunying Kaler, Kota Bandung, Jawa Barat 41024"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Alamat fisik kantor / klinik utama Empathika yang tampil pada informasi kontak &amp; footer.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                <svg className="w-4 h-4 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span>Link Maps</span>
              </label>
              <input
                type="url"
                name="linkMaps"
                value={form.linkMaps || ""}
                onChange={onChange}
                placeholder="Contoh: https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tautan Google Maps / petunjuk arah ke lokasi klinik Empathika (tombol &quot;Dapatkan Petunjuk Arah&quot; di beranda klien).
              </p>
            </div>

            {/* Section Tautan Sosial Media Resmi */}
            <div className="md:col-span-2 border-t border-gray-100 pt-5 mt-2">
              <h4 className="text-sm font-bold text-[#561269] mb-1">
                Tautan Media Sosial Resmi
              </h4>
              <p className="text-xs text-gray-400 mb-4">
                Tautan akun media sosial resmi Empathika yang akan otomatis tampil pada footer website.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagram"
                value={form.instagram || ""}
                onChange={onChange}
                placeholder="https://www.instagram.com/empathika_psikologi"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                TikTok URL
              </label>
              <input
                type="url"
                name="tiktok"
                value={form.tiktok || ""}
                onChange={onChange}
                placeholder="https://www.tiktok.com/@empathika_psikologi"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedin"
                value={form.linkedin || ""}
                onChange={onChange}
                placeholder="https://www.linkedin.com/company/empathika"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                YouTube URL
              </label>
              <input
                type="url"
                name="youtube"
                value={form.youtube || ""}
                onChange={onChange}
                placeholder="https://www.youtube.com/@empathika"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Bio Singkat
          </label>
          <textarea
            name="bio"
            rows={3}
            value={form.bio || ""}
            onChange={onChange}
            placeholder="Tuliskan gambaran singkat mengenai peran dan fokus keahlian Anda..."
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition resize-none"
          />
        </div>
      </div>
    </div>
  )
}

