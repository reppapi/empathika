"use client"

import React from "react"
import { HelpCircle, Plus, Trash2 } from "lucide-react"
import { InternshipQuestion } from "@/services/internship.service"

interface FormPositionQuestionsSectionProps {
  questions: InternshipQuestion[]
  setQuestions: React.Dispatch<React.SetStateAction<InternshipQuestion[]>>
  isAddingQuestion: boolean
  setIsAddingQuestion: (val: boolean) => void
  newQuestionLabel: string
  setNewQuestionLabel: (val: string) => void
  newQuestionType: "text" | "textarea"
  setNewQuestionType: (val: "text" | "textarea") => void
  newQuestionRequired: boolean
  setNewQuestionRequired: (val: boolean) => void
}

export function FormPositionQuestionsSection({
  questions,
  setQuestions,
  isAddingQuestion,
  setIsAddingQuestion,
  newQuestionLabel,
  setNewQuestionLabel,
  newQuestionType,
  setNewQuestionType,
  newQuestionRequired,
  setNewQuestionRequired,
}: FormPositionQuestionsSectionProps) {
  const handleAddQuestion = () => {
    if (!newQuestionLabel.trim()) return
    const item: InternshipQuestion = {
      id: `q-${Date.now()}`,
      label: newQuestionLabel.trim(),
      type: newQuestionType,
      required: newQuestionRequired,
    }
    setQuestions((prev) => [...prev, item])
    setNewQuestionLabel("")
    setNewQuestionType("textarea")
    setNewQuestionRequired(true)
    setIsAddingQuestion(false)
  }

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div className="pt-6 border-t border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#561269]" />
            <span>Pertanyaan Khusus untuk Posisi Ini (Opsional)</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Calon pelamar akan diminta menjawab butir pertanyaan ini saat mengisi formulir lamaran.
          </p>
        </div>

        {!isAddingQuestion && (
          <button
            type="button"
            onClick={() => setIsAddingQuestion(true)}
            className="px-3.5 py-1.5 rounded-xl border border-purple-200 text-[#561269] hover:bg-purple-50 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pertanyaan</span>
          </button>
        )}
      </div>

      {/* Daftar Pertanyaan yang sudah dibuat */}
      {questions.length > 0 && (
        <div className="space-y-2.5">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-[#FAF7FB] border border-purple-100/70"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#561269]">{idx + 1}.</span>
                  <span className="text-xs font-bold text-gray-900">{q.label}</span>
                  {q.required ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      Wajib
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      Opsional
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 pl-4">
                  Tipe Jawaban:{" "}
                  {q.type === "textarea" ? "Teks Paragraf Panjang" : "Teks Singkat (1 Baris)"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteQuestion(q.id)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Hapus pertanyaan ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form Tambah Pertanyaan Baru */}
      {isAddingQuestion && (
        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Kalimat Pertanyaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Mengapa Anda tertarik bergabung sebagai intern di Empathika?"
              value={newQuestionLabel}
              onChange={(e) => setNewQuestionLabel(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#561269]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tipe Input</label>
              <select
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value as "text" | "textarea")}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#561269] cursor-pointer"
              >
                <option value="textarea">Teks Paragraf (Jawaban Panjang)</option>
                <option value="text">Teks Singkat (Jawaban 1 Baris)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={newQuestionRequired}
                  onChange={(e) => setNewQuestionRequired(e.target.checked)}
                  className="rounded text-[#561269] focus:ring-[#561269]"
                />
                <span>Wajib dijawab oleh pelamar</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddingQuestion(false)
                setNewQuestionLabel("")
              }}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-1.5 rounded-xl bg-[#561269] hover:bg-[#6e1885] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Simpan Pertanyaan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
