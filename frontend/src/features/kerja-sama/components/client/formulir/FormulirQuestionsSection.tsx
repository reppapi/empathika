"use client"

import React from "react"
import { AlertCircle } from "lucide-react"
import { FormulirPertanyaan } from "../../../types"
import FormSelectDropdown from "./FormSelectDropdown"

export interface FormulirQuestionsSectionProps {
  questions: FormulirPertanyaan[]
  jawabanKhusus: Record<string, string>
  handleKhususChange: (key: string, value: string) => void
  catatanKebutuhan: string
  setCatatanKebutuhan: (val: string) => void
  hasAttemptedSubmit: boolean
  formErrors: Record<string, string>
  isQuestionOptional: (q: FormulirPertanyaan) => boolean
}

export default function FormulirQuestionsSection({
  questions,
  jawabanKhusus,
  handleKhususChange,
  catatanKebutuhan,
  setCatatanKebutuhan,
  hasAttemptedSubmit,
  formErrors,
  isQuestionOptional,
}: FormulirQuestionsSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
          2
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Kebutuhan & Gambaran Kegiatan</h2>
          <p className="text-xs text-gray-500">
            Spesifikasi program, target peserta, dan estimasi waktu pelaksanaan kegiatan.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const isOptional = isQuestionOptional(q)
          const isBudgetOrSelect =
            q.type === "select" ||
            (q as any).type === "dropdown" ||
            (q.options && q.label.toLowerCase().includes("budget")) ||
            q.key.toLowerCase().includes("budget")

          const effectiveOptions = q.options && q.options.length > 0 ? q.options : []

          return (
            <div key={q.key} id={`field-${q.key}`} className="bg-[#FAF7FB] rounded-2xl p-5 border border-purple-100/70">
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2.5">
                {idx + 1}. {q.label}
                {!isOptional && <span className="text-rose-500 font-bold ml-1">*</span>}
              </label>

              {isBudgetOrSelect ? (
                <FormSelectDropdown
                  value={jawabanKhusus[q.key] || effectiveOptions[0] || ""}
                  onChange={(val) => handleKhususChange(q.key, val)}
                  options={effectiveOptions}
                  placeholder="Pilih rentang estimasi budget..."
                />
              ) : q.type === "radio" && q.options ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt) => {
                    const isSelected = (jawabanKhusus[q.key] || q.options![0]) === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleKhususChange(q.key, opt)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm transition-all text-left ${
                          isSelected
                            ? "border-[#561269] bg-white text-[#561269] font-bold shadow-xs ring-1 ring-[#561269]"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 font-medium"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              ) : q.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={jawabanKhusus[q.key] || ""}
                  onChange={(e) => handleKhususChange(q.key, e.target.value)}
                  placeholder={q.placeholder || "Tuliskan jawaban Anda..."}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                    !isOptional && hasAttemptedSubmit && formErrors[q.key]
                      ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                      : "border-gray-300"
                  }`}
                />
              ) : (
                <input
                  type="text"
                  value={jawabanKhusus[q.key] || ""}
                  onChange={(e) => handleKhususChange(q.key, e.target.value)}
                  placeholder={q.placeholder || "Tuliskan jawaban Anda..."}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                    !isOptional && hasAttemptedSubmit && formErrors[q.key]
                      ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                      : "border-gray-300"
                  }`}
                />
              )}

              {!isOptional && hasAttemptedSubmit && formErrors[q.key] && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{formErrors[q.key]}</span>
                </p>
              )}
            </div>
          )
        })}

        {/* Catatan / Gambaran Kegiatan Tambahan */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            CATATAN TAMBAHAN / GAMBARAN KEGIATAN (OPSIONAL)
          </label>
          <textarea
            rows={3}
            value={catatanKebutuhan}
            onChange={(e) => setCatatanKebutuhan(e.target.value)}
            placeholder="Tuliskan jika ada kebutuhan khusus, topik bahasan spesifik, atau informasi penting lainnya..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
          />
        </div>
      </div>
    </div>
  )
}
