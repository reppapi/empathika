"use client"

import React, { useState, useEffect } from "react"
import {
  KerjaSamaItem,
  KerjaSamaPageConfig,
  PengajuanKerjaSama,
  FormulirConfigItem,
  FormulirPertanyaan,
} from "../../types"
import {
  getKerjaSamaItems,
  saveKerjaSamaItems,
  getKerjaSamaConfig,
  saveKerjaSamaConfig,
  getPengajuanKerjaSama,
  savePengajuanKerjaSama,
  getFormulirConfigs,
  saveFormulirConfigs,
  INITIAL_KERJASAMA_ITEMS,
  INITIAL_KERJASAMA_CONFIG,
  INITIAL_FORMULIR_CONFIGS,
} from "../../data/initialData"

import TabProgramList from "./TabProgramList"
import TabHeroKontak from "./TabHeroKontak"
import TabKelolaFormulir from "./TabKelolaFormulir"
import TabPengajuanLeads from "./TabPengajuanLeads"
import ModalProgramForm from "./ModalProgramForm"
import ModalLeadDetail from "./ModalLeadDetail"

const COLOR_OPTIONS = [
  { label: "Ungu Indigo", value: "from-purple-500 to-indigo-600" },
  { label: "Biru Samudra", value: "from-blue-400 to-blue-600" },
  { label: "Hijau Zamrud", value: "from-emerald-400 to-teal-500" },
  { label: "Oranye Merah", value: "from-orange-400 to-red-500" },
  { label: "Abu Netral", value: "from-gray-600 to-gray-800" },
  { label: "Pink Mawar", value: "from-pink-400 to-rose-500" },
]

export default function AdminKerjaSamaClient() {
  const [activeTab, setActiveTab] = useState<"program" | "hero-kontak" | "formulir" | "pengajuan">(
    "program"
  )

  // State data utama
  const [items, setItems] = useState<KerjaSamaItem[]>([])
  const [config, setConfig] = useState<KerjaSamaPageConfig>(INITIAL_KERJASAMA_CONFIG)
  const [leads, setLeads] = useState<PengajuanKerjaSama[]>([])
  const [formConfigs, setFormConfigs] = useState<FormulirConfigItem[]>(INITIAL_FORMULIR_CONFIGS)
  const [selectedFormIndex, setSelectedFormIndex] = useState<number>(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // State Tambah Pertanyaan Baru Formulir
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [newQuestionLabel, setNewQuestionLabel] = useState("")
  const [newQuestionType, setNewQuestionType] = useState<"radio" | "text">("radio")
  const [newQuestionOptions, setNewQuestionOptions] = useState<string>("Opsi 1, Opsi 2, Opsi 3")

  // Modal State Program Kolaborasi
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KerjaSamaItem | null>(null)
  const [formData, setFormData] = useState<Partial<KerjaSamaItem>>({
    title: "",
    shortName: "",
    slug: "",
    description: "",
    pelatihanTitle: "",
    pelatihanDeskripsi: "",
    pelatihanImage: "",
    mitraTitle: "",
    mitraDeskripsi: "",
    mitraImage: "",
    color: "from-purple-500 to-indigo-600",
    status: "AKTIF",
  })

  // Filter Leads
  const [leadFilter, setLeadFilter] = useState<string>("Semua")
  const [selectedLead, setSelectedLead] = useState<PengajuanKerjaSama | null>(null)

  useEffect(() => {
    setItems(getKerjaSamaItems())
    setConfig(getKerjaSamaConfig())
    setLeads(getPengajuanKerjaSama())
    setFormConfigs(getFormulirConfigs())
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Helper Upload Image Lokal
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 5MB!")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSuccess(reader.result)
        showToast("Foto berhasil dimuat!")
      }
    }
    reader.readAsDataURL(file)
  }

  // ── Handlers Program Kerja Sama ──
  const handleToggleStatus = (id: string) => {
    const updated = items.map((it) => {
      if (it.id === id) {
        const newStatus: "AKTIF" | "NONAKTIF" = it.status === "AKTIF" ? "NONAKTIF" : "AKTIF"
        return { ...it, status: newStatus }
      }
      return it
    })
    setItems(updated)
    saveKerjaSamaItems(updated)
    showToast("Status program berhasil diperbarui untuk web client!")
  }

  const handleOpenAddModal = () => {
    setEditingItem(null)
    setFormData({
      title: "Empathika untuk ",
      shortName: "",
      slug: "",
      description: "",
      pelatihanTitle: "",
      pelatihanDeskripsi: "",
      pelatihanImage:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
      mitraTitle: "",
      mitraDeskripsi: "",
      mitraImage:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
      color: "from-purple-500 to-indigo-600",
      status: "AKTIF",
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: KerjaSamaItem) => {
    setEditingItem(item)
    setFormData({ ...item })
    setIsModalOpen(true)
  }

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.slug) return

    if (editingItem) {
      const updated = items.map((it) =>
        it.id === editingItem.id ? ({ ...it, ...formData } as KerjaSamaItem) : it
      )
      setItems(updated)
      saveKerjaSamaItems(updated)
      showToast(`Program "${formData.title}" berhasil diperbarui!`)
    } else {
      const newItem: KerjaSamaItem = {
        id: `ks_${Date.now()}`,
        slug: formData.slug || "program-baru",
        title: formData.title || "",
        shortName: formData.shortName || formData.title?.replace("Empathika untuk ", "") || "",
        description: formData.description || "",
        pelatihanTitle: formData.pelatihanTitle || "",
        pelatihanDeskripsi: formData.pelatihanDeskripsi || "",
        pelatihanImage:
          formData.pelatihanImage ||
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
        mitraTitle: formData.mitraTitle || "",
        mitraDeskripsi: formData.mitraDeskripsi || "",
        mitraImage:
          formData.mitraImage ||
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
        color: formData.color || "from-purple-500 to-indigo-600",
        status: (formData.status as "AKTIF" | "NONAKTIF") || "AKTIF",
        urutan: items.length + 1,
      }
      const updated = [...items, newItem]
      setItems(updated)
      saveKerjaSamaItems(updated)
      showToast("Program kerja sama baru berhasil ditambahkan!")
    }

    setIsModalOpen(false)
  }

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus program "${name}"?`)) {
      const updated = items.filter((it) => it.id !== id)
      setItems(updated)
      saveKerjaSamaItems(updated)
      showToast("Program kerja sama telah dihapus!")
    }
  }

  // ── Handlers Config Web ──
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    saveKerjaSamaConfig(config)
    showToast("Pengaturan teks & kontak web client berhasil disimpan!")
  }

  // ── Handlers Kelola Formulir ──
  const currentFormConfig = formConfigs[selectedFormIndex]

  const handleUpdateCurrentForm = (fields: Partial<FormulirConfigItem>) => {
    const updated = formConfigs.map((f, idx) =>
      idx === selectedFormIndex ? { ...f, ...fields } : f
    )
    setFormConfigs(updated)
  }

  const handleSaveAllFormConfigs = () => {
    saveFormulirConfigs(formConfigs)
    showToast("Perubahan struktur formulir berhasil disimpan!")
  }

  const handleDeleteQuestion = (qId: string) => {
    if (!currentFormConfig) return
    if (confirm("Hapus pertanyaan ini dari formulir?")) {
      const updatedQuestions = currentFormConfig.pertanyaanKhusus.filter((q) => q.id !== qId)
      const updated = formConfigs.map((f, idx) =>
        idx === selectedFormIndex ? { ...f, pertanyaanKhusus: updatedQuestions } : f
      )
      setFormConfigs(updated)
      saveFormulirConfigs(updated)
      showToast("Pertanyaan berhasil dihapus!")
    }
  }

  const handleAddNewQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentFormConfig || !newQuestionLabel.trim()) return

    const qKey = `pertanyaan_${Date.now()}`
    const newQuestion: FormulirPertanyaan = {
      id: `q_${Date.now()}`,
      label: newQuestionLabel.trim(),
      key: qKey,
      type: newQuestionType,
      options:
        newQuestionType === "radio"
          ? newQuestionOptions
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      required: true,
    }

    const updatedQuestions = [...currentFormConfig.pertanyaanKhusus, newQuestion]
    const updated = formConfigs.map((f, idx) =>
      idx === selectedFormIndex ? { ...f, pertanyaanKhusus: updatedQuestions } : f
    )
    setFormConfigs(updated)
    saveFormulirConfigs(updated)
    setNewQuestionLabel("")
    setIsAddingQuestion(false)
    showToast("Pertanyaan baru berhasil ditambahkan ke formulir!")
  }

  // ── Handlers Leads / Pengajuan ──
  const handleUpdateLeadStatus = (id: string, newStatus: PengajuanKerjaSama["status"]) => {
    const updated = leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    setLeads(updated)
    savePengajuanKerjaSama(updated)
    showToast("Status pengajuan berhasil diubah!")
  }

  const handleDeleteLead = (id: string) => {
    if (confirm("Hapus data pengajuan ini?")) {
      const updated = leads.filter((l) => l.id !== id)
      setLeads(updated)
      savePengajuanKerjaSama(updated)
      showToast("Pengajuan berhasil dihapus.")
    }
  }

  const filteredLeads = leads.filter((l) => {
    if (leadFilter === "Semua") return true
    return l.status === leadFilter
  })

  // Quick stats
  const activeCount = items.filter((it) => it.status === "AKTIF").length
  const waitingLeads = leads.filter((l) => l.status === "Menunggu").length

  return (
    <div className="flex flex-col gap-8 font-poppins pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#561269] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#561269]">
              Kelola Kerja Sama & Kemitraan
            </h1>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-[#561269] text-xs font-bold shrink-0">
              Web Client Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Atur pilihan program kolaborasi, formulir, teks banner, dan pantau pengajuan mitra yang masuk.
          </p>
        </div>
      </div>

      {/* ── Stats Summary Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Program Kolaborasi</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-0.5">{items.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Aktif di Web Client</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{activeCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Pengajuan Masuk (Leads)</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-0.5">{leads.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Menunggu Respon</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{waitingLeads}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex border-b border-gray-200 text-sm font-semibold gap-2 sm:gap-6">
        <button
          onClick={() => setActiveTab("program")}
          className={`pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "program"
              ? "border-[#561269] text-[#561269]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Program Kolaborasi ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("hero-kontak")}
          className={`pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "hero-kontak"
              ? "border-[#561269] text-[#561269]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Pengaturan Teks & Kontak Web
        </button>
        <button
          onClick={() => setActiveTab("formulir")}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "formulir"
              ? "border-[#561269] text-[#561269]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Kelola Isi Formulir</span>
          <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-[#561269] text-[10px] font-bold">
            {formConfigs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("pengajuan")}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "pengajuan"
              ? "border-[#561269] text-[#561269]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Pengajuan Masuk (Leads)</span>
          {waitingLeads > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {waitingLeads}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Program Kolaborasi */}
      {activeTab === "program" && (
        <TabProgramList
          items={items}
          onOpenAddModal={handleOpenAddModal}
          onOpenEditModal={handleOpenEditModal}
          onToggleStatus={handleToggleStatus}
          onDeleteItem={handleDeleteItem}
        />
      )}

      {/* Tab 2: Teks Hero & Kontak */}
      {activeTab === "hero-kontak" && (
        <TabHeroKontak
          config={config}
          setConfig={setConfig}
          onSaveConfig={handleSaveConfig}
          onImageUpload={handleImageUpload}
        />
      )}

      {/* Tab 3: Kelola Isi Formulir */}
      {activeTab === "formulir" && (
        <TabKelolaFormulir
          formConfigs={formConfigs}
          selectedFormIndex={selectedFormIndex}
          setSelectedFormIndex={setSelectedFormIndex}
          currentFormConfig={currentFormConfig}
          handleUpdateCurrentForm={handleUpdateCurrentForm}
          handleSaveAllFormConfigs={handleSaveAllFormConfigs}
          isAddingQuestion={isAddingQuestion}
          setIsAddingQuestion={setIsAddingQuestion}
          newQuestionLabel={newQuestionLabel}
          setNewQuestionLabel={setNewQuestionLabel}
          newQuestionType={newQuestionType}
          setNewQuestionType={setNewQuestionType}
          newQuestionOptions={newQuestionOptions}
          setNewQuestionOptions={setNewQuestionOptions}
          handleAddNewQuestion={handleAddNewQuestion}
          handleDeleteQuestion={handleDeleteQuestion}
        />
      )}

      {/* Tab 4: Pengajuan Masuk (Leads) */}
      {activeTab === "pengajuan" && (
        <TabPengajuanLeads
          filteredLeads={filteredLeads}
          leadFilter={leadFilter}
          setLeadFilter={setLeadFilter}
          onSelectLead={setSelectedLead}
          onUpdateLeadStatus={handleUpdateLeadStatus}
          onDeleteLead={handleDeleteLead}
        />
      )}

      {/* Modal Tambah/Edit Program */}
      <ModalProgramForm
        isOpen={isModalOpen}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        onImageUpload={handleImageUpload}
        colorOptions={COLOR_OPTIONS}
      />

      {/* Modal Detail Jawaban Pengajuan Masuk */}
      <ModalLeadDetail
        selectedLead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={handleUpdateLeadStatus}
        onShowToast={showToast}
      />
    </div>
  )
}
