"use client"

import React from "react"
import { HelpCircle } from "lucide-react"
import { InternshipQuestion } from "@/services/internship.service"

interface ApplyQuestionsSectionProps {
  questions: InternshipQuestion[]
  answers: Record<string, string>
  onAnswerChange: (questionId: string, val: string) => void
}

export function ApplyQuestionsSection({
  questions,
  answers,
  onAnswerChange,
}: ApplyQuestionsSectionProps) {
  if (questions.length === 0) return null

  return (
    <div className="pt-6 border-t border-gray-100">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
          2
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Pertanyaan Tambahan</h2>
          <p className="text-xs text-gray-500">
            Jawab beberapa pertanyaan khusus terkait posisi yang Anda lamar.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const qKey = q.id || `q-${idx}`
          return (
            <div key={qKey} className="bg-[#FAF7FB] p-5 rounded-2xl border border-purple-50">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 leading-relaxed">
                <span className="text-[#561269] mr-1.5">{idx + 1}.</span>
                {q.label} {q.required && <span className="text-rose-500">*</span>}
              </label>

              {q.type === "textarea" ? (
                <textarea
                  required={q.required}
                  rows={4}
                  value={answers[qKey] || ""}
                  onChange={(e) => onAnswerChange(qKey, e.target.value)}
                  placeholder="Tuliskan jawaban Anda di sini..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] bg-white resize-none"
                />
              ) : (
                <input
                  type={q.type === "url" ? "url" : "text"}
                  required={q.required}
                  value={answers[qKey] || ""}
                  onChange={(e) => onAnswerChange(qKey, e.target.value)}
                  placeholder={
                    q.type === "url"
                      ? "https://..."
                      : "Tuliskan jawaban Anda..."
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] bg-white"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
