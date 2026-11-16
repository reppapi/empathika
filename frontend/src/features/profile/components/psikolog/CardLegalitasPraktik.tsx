"use client"

import React, { ChangeEvent, useState } from "react"
import { AdminProfileData } from "../../types"
import {
  validateNoStr,
  validateNoSipp,
  validateNoSilp,
} from "@/features/psikolog/utils/tenagaAhliValidation"

interface CardLegalitasPraktikProps {
  form: AdminProfileData
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  touched?: Record<string, boolean>
  setTouched?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

export function CardLegalitasPraktik({
  form,
  onChange,
  touched: externalTouched,
  setTouched: externalSetTouched,
}: CardLegalitasPraktikProps) {
  const [internalTouched, setInternalTouched] = useState<Record<string, boolean>>({})

  const touched = externalTouched || internalTouched
  const setTouched = externalSetTouched || setInternalTouched

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
              placeholder="STR-..."
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
              placeholder="SIPP-..."
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:border-[#561269] focus:outline-none"
            />
          </div>
        </div>
      </div>
    )
  }

  // Derived Error Messages untuk Kategori Psikolog
  const noStrVal = form.noStr || ""
  const noSippVal = form.noSipp || ""
  const noSilpVal = form.noSilp || ""

  const isStrTouched = touched.noStr || Boolean(noStrVal && !noStrVal.toUpperCase().startsWith("STR"))
  const isSippTouched = touched.noSipp || Boolean(noSippVal && !noSippVal.toUpperCase().startsWith("SIPP"))
  const isSilpTouched = touched.noSilp || Boolean(noSilpVal && !noSilpVal.toUpperCase().startsWith("SILP"))

  const noStrError = isStrTouched ? validateNoStr(noStrVal, "psikolog") : null
  const noSippError = isSippTouched ? validateNoSipp(noSippVal, "psikolog", noSilpVal) : null
  const noSilpError = isSilpTouched ? validateNoSilp(noSilpVal, "psikolog", noSippVal) : null

  return (
    <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 sm:p-8 space-y-4">
      <div className="border-b border-purple-100 pb-3">
        <h3 className="text-base font-bold text-[#561269]">
          Legalitas Praktik Psikolog
        </h3>
        <p className="text-xs text-gray-600">
          Karena kategori yang dipilih adalah Psikolog, cantumkan nomor STR, SIPP resmi, serta SILP (Surat Izin Layanan Psikolog).
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
            value={noStrVal}
            onChange={(e) => {
              onChange(e)
              setTouched((prev) => ({ ...prev, noStr: true }))
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, noStr: true }))}
            placeholder="STR-8921-2023"
            className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none ${
              noStrError
                ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                : "border-gray-300 focus:border-[#561269]"
            }`}
          />
          {noStrError ? (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{noStrError}</span>
            </p>
          ) : (
            <p className="text-[11px] text-purple-600/70 mt-1">
              Format resmi wajib diawali dengan &apos;STR&apos;.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nomor SIPP (Surat Izin Praktik Psikologi) {!noSilpVal && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="noSipp"
            value={noSippVal}
            onChange={(e) => {
              onChange(e)
              setTouched((prev) => ({ ...prev, noSipp: true }))
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, noSipp: true }))}
            placeholder="SIPP-1234-JKT"
            className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none ${
              noSippError
                ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                : "border-gray-300 focus:border-[#561269]"
            }`}
          />
          {noSippError ? (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{noSippError}</span>
            </p>
          ) : (
            <p className="text-[11px] text-purple-600/70 mt-1">
              Format diawali &apos;SIPP&apos;. Wajib jika Nomor SILP tidak diisi.
            </p>
          )}
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nomor SILP (Surat Izin Layanan Psikolog) {!noSippVal && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="noSilp"
            value={noSilpVal}
            onChange={(e) => {
              onChange(e)
              setTouched((prev) => ({ ...prev, noSilp: true }))
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, noSilp: true }))}
            placeholder="SILP-2024-001"
            className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none ${
              noSilpError
                ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                : "border-gray-300 focus:border-[#561269]"
            }`}
          />
          {noSilpError ? (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{noSilpError}</span>
            </p>
          ) : (
            <p className="text-[11px] text-purple-600/70 mt-1">
              Format diawali &apos;SILP&apos;. Wajib jika Nomor SIPP tidak diisi.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
