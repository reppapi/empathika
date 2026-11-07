// File: frontend/src/features/profile/components/CredentialAccordion.tsx
"use client"

import { useState } from "react"
import { FormGantiEmail } from "@/features/profile/components/psikolog/FormGantiEmail"
import { FormGantiPassword } from "@/features/profile/components/psikolog/FormGantiPassword"

interface CredentialAccordionProps {
  email?: string
}

export function CredentialAccordion({ email }: CredentialAccordionProps) {
  const [openEmail, setOpenEmail] = useState(false)
  const [openPassword, setOpenPassword] = useState(false)

  return (
    <div className="space-y-2.5">
      {/* Panel: Ganti Email */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenEmail((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-[#561269] group-hover:bg-purple-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Ganti Email</p>
              <p className="text-xs text-gray-400">Ubah alamat email login akun Anda</p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openEmail ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openEmail ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-5 pb-5 pt-1 border-t border-gray-100">
            <FormGantiEmail initialEmail={email} hideHeader />
          </div>
        </div>
      </div>

      {/* Panel: Ganti Password */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenPassword((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-[#561269] group-hover:bg-purple-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Ganti Password</p>
              <p className="text-xs text-gray-400">Perbarui kata sandi login akun Anda</p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openPassword ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openPassword ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-5 pb-5 pt-1 border-t border-gray-100">
            <FormGantiPassword hideHeader />
          </div>
        </div>
      </div>
    </div>
  )
}
