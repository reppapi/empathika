"use client"

import React from "react"
import { FormulirConfigItem } from "../../types"

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
  newQuestionType: "radio" | "text"
  setNewQuestionType: (val: "radio" | "text") => void
  newQuestionOptions: string
  setNewQuestionOptions: (val: string) => void
  handleAddNewQuestion: (e: React.FormEvent) => void
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
  handleAddNewQuestion,
  handleDeleteQuestion,
}: TabKelolaFormulirProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Selector Formulir */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          Pilih Jenis Formulir yang Ingin Diatur:
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Pilih salah satu formulir di bawah untuk mengubah judul, deskripsi, serta menambah atau
          menghapus butir pertanyaan.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {formConfigs.map((fc, idx) => (
            <button
              key={fc.id}
              onClick={() => {
                setSelectedFormIndex(idx)
                setIsAddingQuestion(false)
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col gap-6">
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

          {/* Data Wajib Standard (Informasi Saja) */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="text-xs font-bold text-gray-700 mb-1">
              Pertanyaan Identitas Wajib (Bawaan Sistem)
            </h4>
            <p className="text-[11px] text-gray-500 mb-3">
              Semua formulir selalu menyertakan kolom identitas pengaju ini secara otomatis:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Nama Instansi / Perusahaan",
                "Nama PIC (Narahubung)",
                "Jabatan PIC",
                "Nomor WhatsApp",
                "Email Resmi",
                "Catatan Tambahan",
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

          {/* Pertanyaan Spesifik / Khusus */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Pertanyaan Khusus Formulir Ini</h3>
                <p className="text-[11px] text-gray-500">
                  Admin dapat menambah atau menghapus pertanyaan khusus sesuai kebutuhan program ini.
                </p>
              </div>
              {!isAddingQuestion && (
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(true)}
                  className="px-3.5 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>+ Tambah Pertanyaan</span>
                </button>
              )}
            </div>

            {/* Form Tambah Pertanyaan */}
            {isAddingQuestion && (
              <form
                onSubmit={handleAddNewQuestion}
                className="bg-purple-50/50 rounded-xl border border-purple-200 p-4 mb-4 space-y-3"
              >
                <h4 className="text-xs font-bold text-[#561269]">Tambah Pertanyaan Baru</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Pertanyaan / Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Berapa estimasi jumlah peserta yang akan ikut?"
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
                      onChange={(e) => setNewQuestionType(e.target.value as "radio" | "text")}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
                    >
                      <option value="radio">Pilihan Ganda (Radio Button)</option>
                      <option value="text">Teks Bebas / Isian Singkat</option>
                    </select>
                  </div>
                  {newQuestionType === "radio" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Pilihan Jawaban (Pisahkan dengan koma)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Opsi 1, Opsi 2, Opsi 3"
                        value={newQuestionOptions}
                        onChange={(e) => setNewQuestionOptions(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>
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
            )}

            {/* List Pertanyaan Khusus */}
            <div className="space-y-3">
              {currentFormConfig.pertanyaanKhusus.length > 0 ? (
                currentFormConfig.pertanyaanKhusus.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-200 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-[#561269] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {qIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-gray-800">{q.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                          {q.type === "radio" ? "Pilihan Ganda" : "Isian Teks"}
                        </span>
                      </div>
                      {q.options && q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
                          {q.options.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="text-[10px] bg-purple-50 text-[#561269] px-2 py-0.5 rounded-md border border-purple-100"
                            >
                              ○ {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-full transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Hapus Pertanyaan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                ))
              ) : (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                  Belum ada pertanyaan khusus untuk formulir ini. Klik tombol{" "}
                  <strong>+ Tambah Pertanyaan</strong> di atas untuk menambah pertanyaan baru.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
