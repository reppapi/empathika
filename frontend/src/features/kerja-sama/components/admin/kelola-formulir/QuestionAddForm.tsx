import React from "react"

export interface QuestionAddFormProps {
  isFileDefault: boolean
  newQuestionLabel: string
  setNewQuestionLabel: (val: string) => void
  newQuestionType: "radio" | "select" | "text" | "file"
  setNewQuestionType: (val: "radio" | "select" | "text" | "file") => void
  newQuestionOptions: string
  setNewQuestionOptions: (val: string) => void
  newQuestionRequired: boolean
  setNewQuestionRequired: (val: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export default function QuestionAddForm({
  isFileDefault,
  newQuestionLabel,
  setNewQuestionLabel,
  newQuestionType,
  setNewQuestionType,
  newQuestionOptions,
  setNewQuestionOptions,
  newQuestionRequired,
  setNewQuestionRequired,
  onSubmit,
  onCancel,
}: QuestionAddFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-purple-50/50 rounded-xl border border-purple-200 p-4 mb-4 space-y-3"
    >
      <h4 className="text-xs font-bold text-[#561269]">
        {isFileDefault ? "Tambah Pertanyaan Upload File / Dokumen Baru" : "Tambah Pertanyaan Baru"}
      </h4>
      <div>
        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
          Pertanyaan / Label
        </label>
        <input
          type="text"
          required
          placeholder={
            isFileDefault
              ? "Contoh: Upload Proposal Kerja Sama / TOR"
              : "Contoh: Berapa estimasi jumlah peserta yang akan ikut?"
          }
          value={newQuestionLabel}
          onChange={(e) => setNewQuestionLabel(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Tipe Input
          </label>
          <select
            value={newQuestionType}
            onChange={(e) => {
              const nextType = e.target.value as "radio" | "select" | "text" | "file"
              setNewQuestionType(nextType)
              if (nextType === "file") {
                setNewQuestionRequired(false)
              }
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
          >
            <option value="radio">Pilihan Ganda (Radio Button)</option>
            <option value="select">Dropdown Menu (Pilihan Dropdown)</option>
            <option value="text">Teks Bebas / Isian Singkat</option>
            <option value="file">Upload File / Dokumen (Proposal/Lampiran)</option>
          </select>
        </div>
        {(newQuestionType === "radio" || newQuestionType === "select") && (
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Pilihan Jawaban (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: < Rp 5 juta, Rp 5–10 juta, Rp 10–25 juta"
              value={newQuestionOptions}
              onChange={(e) => setNewQuestionOptions(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
            />
          </div>
        )}
      </div>
      <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none pt-1">
        <input
          type="checkbox"
          checked={newQuestionRequired}
          onChange={(e) => setNewQuestionRequired(e.target.checked)}
          className="rounded border-gray-300 text-[#561269] focus:ring-[#561269]"
        />
        <span className="font-medium">Wajib diisi oleh pengaju (tanda bintang merah *)</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          className="bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Simpan Pertanyaan
        </button>
      </div>
    </form>
  )
}
