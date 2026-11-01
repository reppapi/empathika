"use client"

import React, { ChangeEvent } from "react"
import { AdminProfileData } from "../../types"

interface CardLegalitasPraktikProps {
  form: AdminProfileData
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function CardLegalitasPraktik({ form, onChange }: CardLegalitasPraktikProps) {
  if (form.kategoriProfesi === "peer-konselor") {
    return (
      <div className="rounded-3xl border border-purple-200 bg-purple-50/50 p-6 sm:p-8 space-y-2">
        <h3 className="text-base font-bold text-[#561269]">
          Legalitas & Status Profesi
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Sebagai <strong>Peer Konselor (Teman Cerita Sebaya)</strong>, Anda berfokus pada pendampingan suportif dan ruang cerita yang aman tanpa penghakiman. Anda tidak diwajibkan menyertakan nomor STR dan SIPP klinis.
        </p>
      </div>
    )
  }

  if (form.kategoriProfesi === "konselor") {
    return (
      <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 sm:p-8 space-y-4">
        <div className="border-b border-purple-100 pb-3">
          <h3 className="text-base font-bold text-[#561269]">
            Legalitas & Sertifikasi Konselor
          </h3>
          <p className="text-xs text-gray-600">
            Sebagai <strong>Konselor</strong>, nomor STR dan izin praktik bersifat opsional dan dapat diisi jika Anda memiliki sertifikasi konseling resmi.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nomor STR / Sertifikasi Konselor (Opsional)
            </label>
            <input
              type="text"
              name="noStr"
              value={form.noStr || ""}
              onChange={onChange}
              placeholder="Contoh: STR-8921-2023"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nomor SIPP / Izin Praktik (Opsional)
            </label>
            <input
              type="text"
              name="noSipp"
              value={form.noSipp || ""}
              onChange={onChange}
              placeholder="Contoh: SIPP-1049-2024"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 sm:p-8 space-y-4">
      <div className="border-b border-purple-100 pb-3">
        <h3 className="text-base font-bold text-[#561269]">
          Legalitas Praktik
        </h3>
        <p className="text-xs text-gray-600">
          Cantumkan nomor STR, SIPP resmi, serta SILP (Surat Izin Layanan Psikolog) untuk kredibilitas Anda di hadapan klien.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nomor STR (Surat Tanda Registrasi) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="noStr"
            value={form.noStr || ""}
            onChange={onChange}
            placeholder="Contoh: STR-8921-2023"
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
          />
          <p className="text-[11px] text-purple-600/70 mt-1">
            Format resmi diawali dengan &apos;STR&apos; (contoh: STR-8921-2023).
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nomor SIPP (Surat Izin Praktik Psikologi) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="noSipp"
            value={form.noSipp || ""}
            onChange={onChange}
            placeholder="Contoh: SIPP-1049-2024"
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
          />
          <p className="text-[11px] text-purple-600/70 mt-1">
            Format resmi diawali dengan &apos;SIPP&apos; (contoh: SIPP-1049-2024).
          </p>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nomor SILP (Surat Izin Layanan Psikolog)
          </label>
          <input
            type="text"
            name="noSilp"
            value={form.noSilp || ""}
            onChange={onChange}
            placeholder="Contoh: SILP-2024-001"
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
          />
          <p className="text-[11px] text-purple-600/70 mt-1">
            Format resmi diawali dengan &apos;SILP&apos; (contoh: SILP-2024-001).
          </p>
        </div>
      </div>
    </div>
  )
}

