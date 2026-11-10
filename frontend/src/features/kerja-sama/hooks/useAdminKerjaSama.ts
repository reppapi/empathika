"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  KerjaSamaItem,
  KerjaSamaPageConfig,
  PengajuanKerjaSama,
  FormulirConfigItem,
  FormulirPertanyaan,
} from "../types"
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
  INITIAL_PENGAJUAN_KERJASAMA,
  INITIAL_FORMULIR_CONFIGS,
} from "../data/initialData"
import { kerjaSamaService } from "@/services/kerja-sama.service"
import { processAndUploadImage } from "../utils/imageCompressor"

export function mapBackendStatusToFrontend(status?: string): PengajuanKerjaSama["status"] {
  switch (status?.toUpperCase()) {
    case "DIHUBUNGI":
      return "Dihubungi"
    case "DISETUJUI":
      return "Disetujui"
    case "DITOLAK":
      return "Ditolak"
    case "MENUNGGU":
    default:
      return "Menunggu"
  }
}

export function mapFrontendStatusToBackend(
  status: PengajuanKerjaSama["status"]
): "MENUNGGU" | "DIHUBUNGI" | "DISETUJUI" | "DITOLAK" {
  switch (status) {
    case "Dihubungi":
      return "DIHUBUNGI"
    case "Disetujui":
      return "DISETUJUI"
    case "Ditolak":
      return "DITOLAK"
    case "Menunggu":
    default:
      return "MENUNGGU"
  }
}

export const VALID_TABS = ["program", "hero-kontak", "formulir", "pengajuan"] as const
export type TabType = (typeof VALID_TABS)[number]

export function useAdminKerjaSama() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Ambil tab dari URL (?tab=pengajuan, ?tab=formulir, dll), default ke 'program'
  const initialQueryTab = searchParams ? (searchParams.get("tab") as TabType | null) : null
  const [activeTab, setActiveTab] = useState<TabType>(
    initialQueryTab && VALID_TABS.includes(initialQueryTab) ? initialQueryTab : "program"
  )

  // Sinkronkan tab saat query param URL berubah (misal tombol Back / Forward browser)
  useEffect(() => {
    const q = searchParams ? (searchParams.get("tab") as TabType | null) : null
    if (q && VALID_TABS.includes(q)) {
      setActiveTab(q)
    } else if (!q) {
      setActiveTab("program")
    }
  }, [searchParams])

  // Ganti tab sekaligus update URL query param tanpa reload halaman
  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab)
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    if (newTab === "program") {
      params.delete("tab")
    } else {
      params.set("tab", newTab)
    }
    const basePath = pathname || "/admin/kerja-sama"
    const qs = params.toString()
    const targetUrl = qs ? `${basePath}?${qs}` : basePath
    router.replace(targetUrl as any, { scroll: false })
  }

  // State data utama
  const [items, setItems] = useState<KerjaSamaItem[]>(INITIAL_KERJASAMA_ITEMS)
  const [config, setConfig] = useState<KerjaSamaPageConfig>(INITIAL_KERJASAMA_CONFIG)
  const [leads, setLeads] = useState<PengajuanKerjaSama[]>(INITIAL_PENGAJUAN_KERJASAMA)
  const [formConfigs, setFormConfigs] = useState<FormulirConfigItem[]>(INITIAL_FORMULIR_CONFIGS)
  const [selectedFormIndex, setSelectedFormIndex] = useState<number>(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // State Tambah Pertanyaan Baru Formulir
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [newQuestionLabel, setNewQuestionLabel] = useState("")
  const [newQuestionType, setNewQuestionType] = useState<"radio" | "text">("radio")
  const [newQuestionOptions, setNewQuestionOptions] = useState<string>("Opsi 1, Opsi 2, Opsi 3")

  // Filter Leads
  const [leadFilter, setLeadFilter] = useState<string>("Semua")
  const [selectedLead, setSelectedLead] = useState<PengajuanKerjaSama | null>(null)

  useEffect(() => {
    setIsMounted(true)
    const localItems = getKerjaSamaItems()
    const localLeads = getPengajuanKerjaSama()
    setItems(localItems)
    setConfig(getKerjaSamaConfig())
    setLeads(localLeads)
    setFormConfigs(getFormulirConfigs())

    // Fungsi ambil dan sinkronkan data leads dari backend API & cache lokal
    const fetchLeads = () => {
      const localLeads = getPengajuanKerjaSama()
      kerjaSamaService
        .getPengajuanList()
        .then((res: any) => {
          if (res?.data && Array.isArray(res.data)) {
            const mappedFromBackend: PengajuanKerjaSama[] = res.data.map((item: any) => {
              const dateObj = item.createdAt ? new Date(item.createdAt) : new Date()
              const months = [
                "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
                "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
              ]
              const tanggalStr = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`

              // Tentukan judul formulir yang rapi
              let title = item.jawaban_detail?.["Tipe Formulir"]
              if (!title) {
                if (item.tipe_formulir === "asesmen") {
                  title = "Formulir Kerjasama Asesmen dan Tes"
                } else if (item.tipe_formulir === "in-house-training") {
                  title = "Formulir In House Training"
                } else if (item.tipe_formulir === "affiliate") {
                  title = "Program Affiliate"
                } else {
                  title = `Formulir Kerjasama ${item.kategori || "Lainnya"}`
                }
              }

              return {
                id: item.id,
                tanggal: tanggalStr,
                namaInstansi: item.nama_instansi || "Instansi Mitra",
                kategori: item.kategori || "Lainnya",
                namaPIC: item.nama_pic || "PIC Mitra",
                email: item.email || "",
                telepon: item.no_telepon || "",
                pesan: item.pesan || "",
                status: mapBackendStatusToFrontend(item.status),
                tipeFormulir: item.tipe_formulir || "lainnya",
                formTitle: title,
                jawabanDetail: item.jawaban_detail || {},
              }
            })

            // Gabungkan data backend dengan cache lokal jika ada item baru di lokal
            const combined = [...mappedFromBackend]
            localLeads.forEach((ll) => {
              if (!combined.some((c) => c.id === ll.id)) {
                combined.push(ll)
              }
            })
            setLeads(combined)
            savePengajuanKerjaSama(combined)
          }
        })
        .catch((err) => {
          console.warn("Notice: Fetching backend pengajuan kerja sama:", err?.message || err)
        })
    }

    fetchLeads()

    // Real-time synchronization saat tab admin aktif kembali atau ada pengajuan baru
    const handleSync = () => {
      fetchLeads()
      setConfig(getKerjaSamaConfig())
    }

    window.addEventListener("focus", handleSync)
    window.addEventListener("storage", handleSync)
    window.addEventListener("empathika_admin_profile_updated", handleSync)

    // 2. Ambil Program Kerja Sama dari Backend API
    kerjaSamaService
      .getProgramList()
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mappedPrograms: KerjaSamaItem[] = res.data.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            shortName: p.short_name,
            description: p.deskripsi,
            pelatihanTitle: p.pelatihan_title || "",
            pelatihanDeskripsi: p.pelatihan_deskripsi || "",
            pelatihanImage: p.pelatihan_image || "",
            mitraTitle: p.mitra_title || "",
            mitraDeskripsi: p.mitra_deskripsi || "",
            mitraImage: p.mitra_image || "",
            color: p.warna_tema || "from-purple-500 to-indigo-600",
            status: p.status === "NONAKTIF" ? "NONAKTIF" : "AKTIF",
            urutan: p.urutan || 1,
          }))
          setItems(mappedPrograms)
          saveKerjaSamaItems(mappedPrograms)
        }
      })
      .catch(() => {})

    return () => {
      window.removeEventListener("focus", handleSync)
      window.removeEventListener("storage", handleSync)
      window.removeEventListener("empathika_admin_profile_updated", handleSync)
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Helper Upload & Kompresi Gambar
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { url, infoText } = await processAndUploadImage(file, (msg) => showToast(msg))
      onSuccess(url)
      showToast(`Foto berhasil dioptimalkan! (${infoText})`)
    } catch (err: any) {
      showToast(err?.message || "Gagal memproses foto!")
    } finally {
      e.target.value = ""
    }
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

    // Sinkronkan ke Backend API
    const target = items.find((it) => it.id === id)
    if (target) {
      const newStatus = target.status === "AKTIF" ? "NONAKTIF" : "AKTIF"
      kerjaSamaService.updateProgram(id, { status: newStatus }).catch(() => {})
    }

    showToast("Status program berhasil diperbarui untuk web client!")
  }

  const handleOpenAddModal = () => {
    router.push("/admin/kerja-sama/tambah")
  }

  const handleOpenEditModal = (item: KerjaSamaItem) => {
    router.push(`/admin/kerja-sama/edit/${item.id}` as any)
  }

  const handleDeleteItem = async (id: string, name?: string) => {
    const updated = items.filter((it) => it.id !== id)
    setItems(updated)
    saveKerjaSamaItems(updated)

    // Sinkronkan ke Backend API
    try {
      await kerjaSamaService.deleteProgram(id)
    } catch {}
    showToast(`Program kerja sama "${name || "terpilih"}" telah dihapus!`)
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
    // Sinkronkan ke Backend API jika formulir aktif
    if (currentFormConfig) {
      kerjaSamaService
        .updateFormulir(currentFormConfig.slug, {
          title: currentFormConfig.title,
          kategori_default: currentFormConfig.categoryDefault,
          deskripsi: currentFormConfig.description,
          pertanyaan_khusus: currentFormConfig.pertanyaanKhusus,
        })
        .catch(() => {})
    }
    showToast("Perubahan struktur formulir berhasil disimpan!")
  }

  const handleDeleteQuestion = (qId: string) => {
    if (!currentFormConfig) return
    const updatedQuestions = currentFormConfig.pertanyaanKhusus.filter((q) => q.id !== qId)
    const updated = formConfigs.map((f, idx) =>
      idx === selectedFormIndex ? { ...f, pertanyaanKhusus: updatedQuestions } : f
    )
    setFormConfigs(updated)
    saveFormulirConfigs(updated)
    showToast("Pertanyaan berhasil dihapus!")
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

    // Sinkronkan ke Backend API (PATCH /kerja-sama/pengajuan/:id/status)
    const backendStatus = mapFrontendStatusToBackend(newStatus)
    kerjaSamaService.updatePengajuanStatus(id, { status: backendStatus }).catch((err) => {
      console.warn("Backend update status pengajuan error:", err)
    })

    showToast(`Status pengajuan berhasil diubah menjadi ${newStatus}!`)
  }

  const handleDeleteLead = async (id: string) => {
    const updated = leads.filter((l) => l.id !== id)
    setLeads(updated)
    savePengajuanKerjaSama(updated)

    // Sinkronkan ke Backend API (DELETE /kerja-sama/pengajuan/:id)
    try {
      await kerjaSamaService.deletePengajuan(id)
    } catch (err) {
      console.warn("Backend delete pengajuan error:", err)
    }

    showToast("Pengajuan berhasil dihapus.")
  }

  const filteredLeads = leads.filter((l) => {
    if (leadFilter === "Semua") return true
    return l.status === leadFilter
  })

  // Quick stats
  const activeCount = items.filter((it) => it.status === "AKTIF").length
  const waitingLeads = leads.filter((l) => l.status === "Menunggu").length

  return {
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
    isMounted,
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
  }
}

