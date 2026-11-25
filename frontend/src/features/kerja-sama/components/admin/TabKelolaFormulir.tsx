"use client"

import React, { useState } from "react"
import { FormulirConfigItem, FormulirPertanyaan } from "../../types"
import { isFormulirFileQuestion } from "../../data/initialData"

interface TabKelolaFormulirProps {
  formConfigs: FormulirConfigItem[]
  selectedFormIndex: number
  setSelectedFormIndex: (idx: number) => void
  currentFormConfig?: FormulirConfigItem
  handleUpdateCurrentForm: (fields: Partial<FormulirConfigItem>) => void
  handleSaveAllFormConfigs: () => void
  isAddingQuestion: boolean
  setIsAddingQuestion: (val: boolean) => void
  newQuestionLabel: string
  setNewQuestionLabel: (val: string) => void
  newQuestionType: "radio" | "select" | "text" | "file"
  setNewQuestionType: (val: "radio" | "select" | "text" | "file") => void
  newQuestionOptions: string
  setNewQuestionOptions: (val: string) => void
  newQuestionRequired: boolean
  setNewQuestionRequired: (val: boolean) => void
  handleAddNewQuestion: (e: React.FormEvent) => void
  handleUpdateQuestion: (qId: string, updatedFields: Partial<FormulirPertanyaan>) => void
  handleDeleteQuestion: (qId: string) => void
}

export default function TabKelolaFormulir({
  formConfigs,
  selectedFormIndex,
  setSelectedFormIndex,
  currentFormConfig,
  handleUpdateCurrentForm,
  handleSaveAllFormConfigs,
  isAddingQuestion,
  setIsAddingQuestion,
  newQuestionLabel,
  setNewQuestionLabel,
  newQuestionType,
  setNewQuestionType,
  newQuestionOptions,
  setNewQuestionOptions,
  newQuestionRequired,
  setNewQuestionRequired,
  handleAddNewQuestion,
  handleUpdateQuestion,
  handleDeleteQuestion,
}: TabKelolaFormulirProps) {
  // State Edit Butir Pertanyaan
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editType, setEditType] = useState<"radio" | "select" | "text" | "file">("radio")
  const [editOptions, setEditOptions] = useState("")
  const [editRequired, setEditRequired] = useState<boolean>(true)
  const [addTargetSection, setAddTargetSection] = useState<"section2" | "section3">("section2")

  const startEditQuestion = (q: FormulirPertanyaan) => {
    setEditingQuestionId(q.id)
    setEditLabel(q.label)
    const detectedType: "radio" | "select" | "text" | "file" = isFormulirFileQuestion(q)
      ? "file"
      : q.type === "textarea"
      ? "text"
      : ((q.type as "radio" | "select" | "text" | "file") || "text")
    setEditType(detectedType)
    setEditOptions(q.options ? q.options.join(", ") : "")
    setEditRequired(q.required !== false && !q.label.toLowerCase().includes("opsional"))
    setIsAddingQuestion(false)
  }

  const cancelEditQuestion = () => {
    setEditingQuestionId(null)
    setEditLabel("")
    setEditOptions("")
  }

  const openAddForSection = (section: "section2" | "section3") => {
    cancelEditQuestion()
    setAddTargetSection(section)
    setNewQuestionLabel("")
    if (section === "section3") {
      setNewQuestionType("file")
      setNewQuestionRequired(false)
    } else {
      setNewQuestionType("radio")
      setNewQuestionRequired(true)
    }
    setIsAddingQuestion(true)
  }

  const handleSaveEditQuestion = (e: React.FormEvent, qId: string) => {
    e.preventDefault()
    if (!editLabel.trim()) return

    const parsedOptions =
      editType === "radio" || editType === "select"
        ? editOptions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined

    handleUpdateQuestion(qId, {
      label: editLabel.trim(),
      type: editType,
      options: parsedOptions,
      required: editRequired,
    })

    cancelEditQuestion()
  }

  const section2Questions = currentFormConfig
    ? currentFormConfig.pertanyaanKhusus.filter((q) => !isFormulirFileQuestion(q))
    : []
  const section3Questions = currentFormConfig
    ? currentFormConfig.pertanyaanKhusus.filter((q) => isFormulirFileQuestion(q))
    : []

  const renderAddQuestionForm = (isFileDefault: boolean) => (
    <form
      onSubmit={handleAddNewQuestion}
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
          onClick={() => setIsAddingQuestion(false)}
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

  const renderQuestionItem = (q: FormulirPertanyaan, qIdx: number) => {
    if (editingQuestionId === q.id) {
      return (
        <form
          key={q.id}
          onSubmit={(e) => handleSaveEditQuestion(e, q.id)}
          className="p-4 rounded-xl border-2 border-[#561269]/40 bg-purple-50/50 space-y-3 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#561269] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {qIdx + 1}
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
              onClick={cancelEditQuestion}
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

    const isOptional = q.required === false || q.label.toLowerCase().includes("opsional")

    return (
      <div
        key={q.id}
        className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-200 transition"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-[#561269] text-[10px] font-bold flex items-center justify-center shrink-0">
              {qIdx + 1}
            </span>
            <span className="text-xs font-bold text-gray-800">{q.label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
              {isFormulirFileQuestion(q)
                ? "Upload File"
                : q.type === "radio"
                ? "Pilihan Ganda"
                : q.type === "select"
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
          {q.options && q.options.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
              {q.options.map((opt, oIdx) => (
                <span
                  key={oIdx}
                  className="text-[10px] bg-purple-50 text-[#561269] px-2 py-0.5 rounded-md border border-purple-100"
                >
                  {q.type === "select" ? "▾ " : "○ "} {opt}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => startEditQuestion(q)}
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
            onClick={() => handleDeleteQuestion(q.id)}
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

  return (
    <div className="flex flex-col gap-6">
      {/* Selector Formulir */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          Pilih Jenis Formulir yang Ingin Diatur:
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Pilih salah satu formulir di bawah untuk mengubah judul, deskripsi, serta menambah atau
          menghapus butir pertanyaan. Perubahan otomatis tersinkronisasi ke website client.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {formConfigs.map((fc, idx) => (
            <button
              key={fc.id}
              onClick={() => {
                setSelectedFormIndex(idx)
                setIsAddingQuestion(false)
                cancelEditQuestion()
              }}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                selectedFormIndex === idx
                  ? "border-[#561269] bg-purple-50/70 ring-2 ring-[#561269]/20"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-xs font-bold text-gray-900 line-clamp-1">{fc.title}</span>
              <span className="text-[10px] text-gray-500 mt-1">
                {fc.pertanyaanKhusus.length} Pertanyaan Khusus
              </span>
            </button>
          ))}
        </div>

        {/* Banner Info Khusus Affiliate */}
        <div className="mt-4 p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start sm:items-center gap-3">
          <span className="text-base sm:text-lg shrink-0">💬</span>
          <div className="text-xs text-gray-700">
            <span className="font-bold text-[#561269]">Program Affiliate: </span>
            Calon mitra Affiliate tidak perlu mengisi formulir di web dan langsung diarahkan untuk menghubungi WhatsApp Official Empathika. Nomor kontak dapat disesuaikan di tab <strong>Pengaturan Teks & Kontak Web</strong>.
          </div>
        </div>
      </div>

      {currentFormConfig && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col gap-7">
          {/* Header & Judul Formulir */}
          <div className="border-b border-gray-100 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-[#561269] text-[10px] font-bold">
                  Kategori: {currentFormConfig.categoryDefault || currentFormConfig.slug}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-1">
                  Konfigurasi {currentFormConfig.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleSaveAllFormConfigs}
                className="bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 px-5 py-2.5 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
              >
                Simpan Perubahan Formulir
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Judul Formulir di Website
                </label>
                <input
                  type="text"
                  value={currentFormConfig.title}
                  onChange={(e) => handleUpdateCurrentForm({ title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#561269]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Deskripsi / Petunjuk Pengisian
                </label>
                <textarea
                  rows={2}
                  value={currentFormConfig.description}
                  onChange={(e) => handleUpdateCurrentForm({ description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#561269]"
                />
              </div>
            </div>
          </div>

          {/* ── BAGIAN 1: PERTANYAAN IDENTITAS WAJIB (BAWAAN SISTEM) ── */}
          <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Informasi Pemohon & Institusi (Identitas Wajib - Bawaan Sistem)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Semua formulir selalu menyertakan kolom identitas wajib berikut pada Bagian 1 di website client:
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-11">
              {[
                "Nama Lengkap / PIC",
                "Nama Institusi / Organisasi",
                "Email Aktif PIC",
                "Nomor WhatsApp",
                "Tipe Institusi / Organisasi",
              ].map((col) => (
                <span
                  key={col}
                  className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[11px] rounded-lg font-medium"
                >
                  ✓ {col}
                </span>
              ))}
            </div>
          </div>

          {/* ── BAGIAN 2: KEBUTUHAN & GAMBARAN KEGIATAN (PERTANYAAN KHUSUS) ── */}
          <div className="rounded-2xl p-5 border border-purple-100 bg-[#FAF7FB]/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Kebutuhan & Gambaran Kegiatan (Pertanyaan Khusus)
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Pertanyaan isian, pilihan ganda, atau dropdown yang diatur admin untuk Bagian 2 di website client.
                  </p>
                </div>
              </div>
              {!(isAddingQuestion && addTargetSection === "section2") && (
                <button
                  type="button"
                  onClick={() => openAddForSection("section2")}
                  className="px-3.5 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
                >
                  <span>+ Tambah Pertanyaan</span>
                </button>
              )}
            </div>

            {isAddingQuestion && addTargetSection === "section2" && renderAddQuestionForm(false)}

            <div className="space-y-3">
              {section2Questions.length > 0 ? (
                section2Questions.map((q, qIdx) => renderQuestionItem(q, qIdx))
              ) : (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-white text-gray-400 text-xs">
                  Belum ada pertanyaan khusus pada Bagian 2. Klik tombol{" "}
                  <strong>+ Tambah Pertanyaan</strong> di atas untuk menambah pertanyaan baru.
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-purple-100/70 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg font-medium">
                ✓ Catatan Tambahan / Gambaran Kegiatan (Opsional - Bawaan Sistem)
              </span>
            </div>
          </div>

          {/* ── BAGIAN 3: LAMPIRAN DOKUMEN & PROPOSAL (UPLOAD FILE) ── */}
          <div className="rounded-2xl p-5 border border-purple-100 bg-[#FAF7FB]/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Lampiran Dokumen & Proposal (Upload File)
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Pertanyaan unggah dokumen / proposal (PDF, DOC/DOCX, Gambar) yang tampil di Bagian 3 pada website client.
                  </p>
                </div>
              </div>
              {!(isAddingQuestion && addTargetSection === "section3") && (
                <button
                  type="button"
                  onClick={() => openAddForSection("section3")}
                  className="px-3.5 py-2 rounded-full border border-purple-200 bg-white text-[#561269] hover:bg-purple-50 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
                >
                  <span>+ Tambah Upload File</span>
                </button>
              )}
            </div>

            {isAddingQuestion && addTargetSection === "section3" && renderAddQuestionForm(true)}

            <div className="space-y-3">
              {section3Questions.length > 0 ? (
                section3Questions.map((q, qIdx) => renderQuestionItem(q, qIdx))
              ) : (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-white text-gray-400 text-xs">
                  Belum ada kolom upload proposal/dokumen untuk formulir ini (Bagian 3 tidak akan tampil di client). Klik{" "}
                  <strong>+ Tambah Upload File</strong> di atas untuk menambahkan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
