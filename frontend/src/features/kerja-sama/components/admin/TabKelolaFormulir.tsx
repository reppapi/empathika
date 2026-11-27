"use client"

import React, { useState } from "react"
import { FormulirConfigItem, FormulirPertanyaan } from "../../types"
import { isFormulirFileQuestion } from "../../data/initialData"
import FormulirTypeSelector from "./kelola-formulir/FormulirTypeSelector"
import QuestionAddForm from "./kelola-formulir/QuestionAddForm"
import QuestionItemRow from "./kelola-formulir/QuestionItemRow"

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
  const [addTargetSection, setAddTargetSection] = useState<"section2" | "section3">("section2")

  const openAddForSection = (section: "section2" | "section3") => {
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

  const section2Questions = currentFormConfig
    ? currentFormConfig.pertanyaanKhusus.filter((q) => !isFormulirFileQuestion(q))
    : []
  const section3Questions = currentFormConfig
    ? currentFormConfig.pertanyaanKhusus.filter((q) => isFormulirFileQuestion(q))
    : []

  return (
    <div className="flex flex-col gap-6">
      {/* Selector Formulir */}
      <FormulirTypeSelector
        formConfigs={formConfigs}
        selectedFormIndex={selectedFormIndex}
        onSelectIndex={(idx) => {
          setSelectedFormIndex(idx)
          setIsAddingQuestion(false)
        }}
      />

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

            {isAddingQuestion && addTargetSection === "section2" && (
              <QuestionAddForm
                isFileDefault={false}
                newQuestionLabel={newQuestionLabel}
                setNewQuestionLabel={setNewQuestionLabel}
                newQuestionType={newQuestionType}
                setNewQuestionType={setNewQuestionType}
                newQuestionOptions={newQuestionOptions}
                setNewQuestionOptions={setNewQuestionOptions}
                newQuestionRequired={newQuestionRequired}
                setNewQuestionRequired={setNewQuestionRequired}
                onSubmit={handleAddNewQuestion}
                onCancel={() => setIsAddingQuestion(false)}
              />
            )}

            <div className="space-y-3">
              {section2Questions.length > 0 ? (
                section2Questions.map((q, qIdx) => (
                  <QuestionItemRow
                    key={q.id}
                    question={q}
                    index={qIdx}
                    onUpdate={handleUpdateQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                ))
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

            {isAddingQuestion && addTargetSection === "section3" && (
              <QuestionAddForm
                isFileDefault={true}
                newQuestionLabel={newQuestionLabel}
                setNewQuestionLabel={setNewQuestionLabel}
                newQuestionType={newQuestionType}
                setNewQuestionType={setNewQuestionType}
                newQuestionOptions={newQuestionOptions}
                setNewQuestionOptions={setNewQuestionOptions}
                newQuestionRequired={newQuestionRequired}
                setNewQuestionRequired={setNewQuestionRequired}
                onSubmit={handleAddNewQuestion}
                onCancel={() => setIsAddingQuestion(false)}
              />
            )}

            <div className="space-y-3">
              {section3Questions.length > 0 ? (
                section3Questions.map((q, qIdx) => (
                  <QuestionItemRow
                    key={q.id}
                    question={q}
                    index={qIdx}
                    onUpdate={handleUpdateQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                ))
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
