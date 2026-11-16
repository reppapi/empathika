"use client"

import React from "react"
import { useAdminKerjaSama } from "../../hooks/useAdminKerjaSama"
import TabProgramList from "./TabProgramList"
import TabHeroKontak from "./TabHeroKontak"
import TabKelolaFormulir from "./TabKelolaFormulir"
import TabPengajuanLeads from "./TabPengajuanLeads"
import ModalLeadDetail from "./ModalLeadDetail"
import AdminSummaryCard from "@/components/shared/AdminSummaryCard"
import { AdminDeleteModal } from "@/components/shared/AdminDeleteModal"

export default function AdminKerjaSamaClient() {
  const {
    activeTab,
    handleTabChange,
    items,
    config,
    setConfig,
    leads,
    filteredLeads,
    leadFilter,
    setLeadFilter,
    selectedLead,
    setSelectedLead,
    formConfigs,
    selectedFormIndex,
    setSelectedFormIndex,
    currentFormConfig,
    toastMessage,
    showToast,
    isAddingQuestion,
    setIsAddingQuestion,
    newQuestionLabel,
    setNewQuestionLabel,
    newQuestionType,
    setNewQuestionType,
    newQuestionOptions,
    setNewQuestionOptions,
    handleImageUpload,
    handleToggleStatus,
    handleOpenAddModal,
    handleOpenEditModal,
    handleDeleteItem,
    handleSaveConfig,
    handleUpdateCurrentForm,
    handleSaveAllFormConfigs,
    handleDeleteQuestion,
    handleAddNewQuestion,
    handleUpdateLeadStatus,
    handleDeleteLead,
    activeCount,
    waitingLeads,
  } = useAdminKerjaSama()

  // State Modal Konfirmasi Hapus
  const [programToDelete, setProgramToDelete] = React.useState<{ id: string; name: string } | null>(null)
  const [isDeletingProgram, setIsDeletingProgram] = React.useState(false)

  const [leadIdToDelete, setLeadIdToDelete] = React.useState<string | null>(null)
  const [isDeletingLead, setIsDeletingLead] = React.useState(false)

  const [questionIdToDelete, setQuestionIdToDelete] = React.useState<string | null>(null)

  const handleConfirmDeleteProgram = async () => {
    if (!programToDelete) return
    setIsDeletingProgram(true)
    try {
      await handleDeleteItem(programToDelete.id, programToDelete.name)
      setProgramToDelete(null)
    } finally {
      setIsDeletingProgram(false)
    }
  }

  const handleConfirmDeleteLead = async () => {
    if (!leadIdToDelete) return
    setIsDeletingLead(true)
    try {
      await handleDeleteLead(leadIdToDelete)
      setLeadIdToDelete(null)
    } finally {
      setIsDeletingLead(false)
    }
  }

  const handleConfirmDeleteQuestion = () => {
    if (!questionIdToDelete) return
    handleDeleteQuestion(questionIdToDelete)
    setQuestionIdToDelete(null)
  }

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

      {/* ── Stats Summary Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminSummaryCard
          title="Total Program Kolaborasi"
          value={items.length}
          isActive={activeTab === "program"}
          onClick={() => handleTabChange("program")}
          iconBgColor="bg-purple-50 text-[#561269]"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />

        <AdminSummaryCard
          title="Aktif di Web Client"
          value={activeCount}
          isActive={activeTab === "program"}
          onClick={() => handleTabChange("program")}
          valueClassName="text-emerald-600"
          iconBgColor="bg-emerald-50 text-emerald-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <AdminSummaryCard
          title="Pengajuan Masuk (Leads)"
          value={leads.length}
          isActive={activeTab === "pengajuan"}
          onClick={() => handleTabChange("pengajuan")}
          iconBgColor="bg-blue-50 text-blue-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />

        <AdminSummaryCard
          title="Menunggu Respon"
          value={waitingLeads}
          isActive={activeTab === "pengajuan"}
          onClick={() => handleTabChange("pengajuan")}
          valueClassName="text-amber-600"
          iconBgColor="bg-amber-50 text-amber-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex border-b border-gray-200 text-sm font-semibold gap-2 sm:gap-6">
        <button
          type="button"
          onClick={() => handleTabChange("program")}
          className={`pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "program"
              ? "border-[#561269] text-[#561269]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Program Kolaborasi ({items.length})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("hero-kontak")}
          className={`pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "hero-kontak"
              ? "border-[#561269] text-[#561269]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Pengaturan Teks & Kontak Web
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("formulir")}
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
          type="button"
          onClick={() => handleTabChange("pengajuan")}
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
          onDeleteItem={(id, name) => setProgramToDelete({ id, name })}
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
          handleDeleteQuestion={(qId) => setQuestionIdToDelete(qId)}
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
          onDeleteLead={(id) => setLeadIdToDelete(id)}
        />
      )}

      {/* Modal Detail Jawaban Pengajuan Masuk */}
      <ModalLeadDetail
        selectedLead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={handleUpdateLeadStatus}
        onShowToast={showToast}
      />

      {/* Modal Konfirmasi Hapus Program Kerja Sama */}
      <AdminDeleteModal
        isOpen={Boolean(programToDelete)}
        onClose={() => !isDeletingProgram && setProgramToDelete(null)}
        onConfirm={handleConfirmDeleteProgram}
        itemType="program kerja sama"
        itemName={programToDelete?.name}
        isLoading={isDeletingProgram}
      />

      {/* Modal Konfirmasi Hapus Pengajuan Kerja Sama */}
      <AdminDeleteModal
        isOpen={Boolean(leadIdToDelete)}
        onClose={() => !isDeletingLead && setLeadIdToDelete(null)}
        onConfirm={handleConfirmDeleteLead}
        itemType="data pengajuan kerja sama"
        itemName={
          leads.find((l) => l.id === leadIdToDelete)?.namaInstansi ||
          leads.find((l) => l.id === leadIdToDelete)?.namaPIC ||
          undefined
        }
        isLoading={isDeletingLead}
      />

      {/* Modal Konfirmasi Hapus Pertanyaan Formulir */}
      <AdminDeleteModal
        isOpen={Boolean(questionIdToDelete)}
        onClose={() => setQuestionIdToDelete(null)}
        onConfirm={handleConfirmDeleteQuestion}
        title="Hapus Pertanyaan?"
        description="Apakah Anda yakin ingin menghapus pertanyaan ini dari formulir kerja sama?"
      />
    </div>
  )
}
