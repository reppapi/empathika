"use client"

import React from "react"
import { AlertCircle } from "lucide-react"
import { FormulirPertanyaan } from "../../../types"
import FormProposalUpload from "./FormProposalUpload"

export interface FormulirProposalSectionProps {
  questions: FormulirPertanyaan[]
  jawabanKhusus: Record<string, string>
  handleKhususChange: (key: string, value: string) => void
  hasAttemptedSubmit: boolean
  formErrors: Record<string, string>
  isQuestionOptional: (q: FormulirPertanyaan) => boolean
}

export default function FormulirProposalSection({
  questions,
  jawabanKhusus,
  handleKhususChange,
  hasAttemptedSubmit,
  formErrors,
  isQuestionOptional,
}: FormulirProposalSectionProps) {
  if (questions.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
          3
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Lampiran Dokumen & Proposal</h2>
          <p className="text-xs text-gray-500">
            Unggah berkas dokumen atau proposal kerja sama sesuai kebutuhan formulir di bawah ini.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q) => {
          const isOptional = isQuestionOptional(q)
          return (
            <div key={q.key} id={`field-${q.key}`}>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                {q.label}
                {!isOptional && <span className="text-rose-500 font-bold ml-1">*</span>}
              </label>
              <FormProposalUpload
                value={jawabanKhusus[q.key] || ""}
                onChange={(val) => handleKhususChange(q.key, val)}
              />
              {!isOptional && hasAttemptedSubmit && formErrors[q.key] && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{formErrors[q.key]}</span>
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
