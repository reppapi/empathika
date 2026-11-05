"use client"

import { useState } from "react"
import { FormGantiEmail } from "@/features/profile/components/psikolog/FormGantiEmail"
import { FormGantiPassword } from "@/features/profile/components/psikolog/FormGantiPassword"

interface AdminCredentialSectionProps {
  email?: string
}

export function AdminCredentialSection({ email }: AdminCredentialSectionProps) {
  const [openEmail, setOpenEmail] = useState(false)
  const [openPassword, setOpenPassword] = useState(false)

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-bold text-[#561269]">
          Keamanan Akun &amp; Kredensial Login
        </h3>
        <p className="text-xs text-gray-500">
          Perubahan email login dan kata sandi akun Admin Utama diproteksi dengan verifikasi keamanan ketat (OWASP ASVS).
        </p>
      </div>

      {/* Panel Ganti Email */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Trigger Row */}
        <button
          type="button"
          onClick={() => setOpenEmail((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-[#561269] group-hover:bg-purple-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Ganti Alamat Email</p>
              <p className="text-xs text-gray-400">Ubah email login akun Admin Utama</p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              openEmail ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Collapsible Content */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            openEmail ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-5 pb-5 pt-1 border-t border-gray-100">
            <FormGantiEmail initialEmail={email} />
          </div>
        </div>
      </div>

      {/* Panel Ganti Password */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Trigger Row */}
        <button
          type="button"
          onClick={() => setOpenPassword((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-[#561269] group-hover:bg-purple-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Ganti Kata Sandi</p>
              <p className="text-xs text-gray-400">Perbarui password login akun Admin Utama</p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              openPassword ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Collapsible Content */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            openPassword ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-5 pb-5 pt-1 border-t border-gray-100">
            <FormGantiPassword />
          </div>
        </div>
      </div>
    </div>
  )
}

