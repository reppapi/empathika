import React, { useState } from "react"
import { FormulirPertanyaan } from "../../../types"
import { isFormulirFileQuestion } from "../../../data/initialData"

export interface QuestionItemRowProps {
  question: FormulirPertanyaan
  index: number
  onUpdate: (qId: string, updatedFields: Partial<FormulirPertanyaan>) => void
  onDelete: (qId: string) => void
}

export default function QuestionItemRow({
  question,
  index,
  onUpdate,
  onDelete,
}: QuestionItemRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(question.label)
  const detectedType: "radio" | "select" | "text" | "file" = isFormulirFileQuestion(question)
    ? "file"
    : question.type === "textarea"
    ? "text"
    : ((question.type as "radio" | "select" | "text" | "file") || "text")
  const [editType, setEditType] = useState<"radio" | "select" | "text" | "file">(detectedType)
  const [editOptions, setEditOptions] = useState(question.options ? question.options.join(", ") : "")
  const [editRequired, setEditRequired] = useState<boolean>(
    question.required !== false && !question.label.toLowerCase().includes("opsional")
  )

  const handleStartEdit = () => {
    setEditLabel(question.label)
    setEditType(
      isFormulirFileQuestion(question)
        ? "file"
        : question.type === "textarea"
        ? "text"
        : ((question.type as "radio" | "select" | "text" | "file") || "text")
    )
    setEditOptions(question.options ? question.options.join(", ") : "")
    setEditRequired(question.required !== false && !question.label.toLowerCase().includes("opsional"))
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editLabel.trim()) return

    const parsedOptions =
      editType === "radio" || editType === "select"
        ? editOptions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined

    onUpdate(question.id, {
      label: editLabel.trim(),
      type: editType,
      options: parsedOptions,
      required: editRequired,
    })

    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSaveEdit}
        className="p-4 rounded-xl border-2 border-[#561269]/40 bg-purple-50/50 space-y-3 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#561269] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <h4 className="text-xs font-bold text-[#561269]">Edit Butir Pertanyaan</h4>
          </div>
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            Mode Edit
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Pertanyaan / Label
          </label>
          <input
            type="text"
            required
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#561269]"
            placeholder="Pertanyaan / label..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Tipe Input
            </label>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as "radio" | "select" | "text" | "file")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#561269]"
            >
              <option value="radio">Pilihan Ganda (Radio Button)</option>
              <option value="select">Dropdown Menu (Pilihan Dropdown)</option>
              <option value="text">Teks Bebas / Isian Singkat</option>
              <option value="file">Upload File / Dokumen (Proposal/Lampiran)</option>
            </select>
          </div>

          {(editType === "radio" || editType === "select") && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Pilihan Jawaban (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                required
                value={editOptions}
                onChange={(e) => setEditOptions(e.target.value)}
                placeholder="Contoh: < Rp 5 juta, Rp 5–10 juta, Rp 10–25 juta"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#561269]"
              />
            </div>
          )}
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={editRequired}
            onChange={(e) => setEditRequired(e.target.checked)}
            className="rounded border-gray-300 text-[#561269] focus:ring-[#561269]"
          />
          <span className="font-medium">Wajib diisi oleh pengaju (tanda bintang merah *)</span>
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-3.5 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    )
  }

  const isOptional = question.required === false || question.label.toLowerCase().includes("opsional")

  return (
    <div className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-200 transition">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-full bg-purple-100 text-[#561269] text-[10px] font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-gray-800">{question.label}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
            {isFormulirFileQuestion(question)
              ? "Upload File"
              : question.type === "radio"
              ? "Pilihan Ganda"
              : question.type === "select"
              ? "Dropdown Menu"
              : "Isian Teks"}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
              isOptional
                ? "bg-gray-100 text-gray-500"
                : "bg-rose-50 text-rose-600 border border-rose-100"
            }`}
          >
            {isOptional ? "Opsional" : "Wajib"}
          </span>
        </div>
        {question.options && question.options.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
            {question.options.map((opt, oIdx) => (
              <span
                key={oIdx}
                className="text-[10px] bg-purple-50 text-[#561269] px-2 py-0.5 rounded-md border border-purple-100"
              >
                {question.type === "select" ? "▾ " : "○ "} {opt}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={handleStartEdit}
          className="px-2.5 py-1 text-[#561269] hover:bg-purple-50 border border-purple-100 rounded-full transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
          title="Edit Pertanyaan"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span className="text-[11px]">Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(question.id)}
          className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-full transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
          title="Hapus Pertanyaan"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span className="text-[11px]">Hapus</span>
        </button>
      </div>
    </div>
  )
}
