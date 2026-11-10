"use client"

import React, { useState, useEffect, useMemo } from "react"
import { X, Calendar, Clock, User, UserCheck, Phone, Video, MapPin, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { psikologService, JadwalSlotItem } from "@/services/psikolog.service"

export interface NewSessionData {
  id: string
  namaKlien: string
  kontak: string
  layanan: string
  idLayanan?: string
  psikolog: string
  idPsikolog?: string
  tanggal: string
  waktu: string
  metode: "Online" | "Offline"
  catatan?: string
  status: "Mendatang" | "Sedang Berjalan" | "Selesai"
}

export interface PsikologOption {
  id: string
  nama: string
  kategori?: string
  spesialisasi?: string
  keahlian?: string
  status?: string
}

export type KategoriTenagaOption = "psikolog" | "konselor" | "peer-konselor"

export const normalizeKategori = (kat?: string): KategoriTenagaOption => {
  if (!kat) return "psikolog"
  const k = kat.toLowerCase()
  if (k.includes("peer")) return "peer-konselor"
  if (k.includes("konselor")) return "konselor"
  return "psikolog"
}

export const getSlotTimeLabel = (slot: { label_waktu?: string; jam_mulai: string; jam_selesai: string }) => {
  if (slot.label_waktu) {
    return slot.label_waktu.includes("WIB") ? slot.label_waktu : `${slot.label_waktu} WIB`
  }
  return `${slot.jam_mulai.substring(0, 5)} - ${slot.jam_selesai.substring(0, 5)} WIB`
}

export interface UniqueTimeSlotOption {
  label: string
  allowsOnline: boolean
  allowsOffline: boolean
  metodeLabel: string
}

interface ModalTambahSesiProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newSession: NewSessionData) => void
}

export const getLayananOptionsForPsikolog = (p?: PsikologOption): string[] => {
  if (!p) return ["Konseling Individu"]
  const kat = (p.kategori || "").toLowerCase()
  const spes = p.spesialisasi || ""
  const keahlian = p.keahlian || ""
  const nama = p.nama.toLowerCase()

  const list: string[] = []

  // 1. Peer Konselor
  if (kat.includes("peer")) {
    list.push("Konseling Teman Sebaya (Peer)")
    if (spes) list.push(`Konseling: ${spes}`)
    list.push("Konseling Remaja & Mahasiswa")
  } 
  // 2. Konselor
  else if (kat.includes("konselor")) {
    list.push("Konseling Bersama Konselor")
    list.push("Konseling Individu")
    if (spes) list.push(`Konseling: ${spes}`)
    if (keahlian.toLowerCase().includes("karir") || keahlian.toLowerCase().includes("karier")) {
      list.push("Konseling Karier & Pekerjaan")
    }
    if (keahlian.toLowerCase().includes("hubungan") || keahlian.toLowerCase().includes("romantis")) {
      list.push("Konseling Relasi & Hubungan")
    }
  } 
  // 3. Psikolog / Psikolog Klinis
  else {
    list.push("Konsultasi Psikologi")
    list.push("Konseling Individu Dewasa")
    if (spes) list.push(`Konseling: ${spes}`)
    if (spes.toLowerCase().includes("anak") || spes.toLowerCase().includes("remaja")) {
      list.push("Konseling Anak & Remaja")
      list.push("Konsultasi Parenting")
    }
    if (spes.toLowerCase().includes("pasangan") || spes.toLowerCase().includes("keluarga")) {
      list.push("Konseling Pasangan & Pranikah")
      list.push("Konseling Dinamika Keluarga")
    }
    if (
      spes.toLowerCase().includes("klinis") ||
      keahlian.toLowerCase().includes("kecemasan") ||
      keahlian.toLowerCase().includes("depresi")
    ) {
      list.push("Konseling Regulasi Emosi & Stres")
      list.push("Terapi Kecemasan & Mood")
    }
  }

  // Hipnoterapi jika bersertifikat
  if (nama.includes("c.ht") || keahlian.toLowerCase().includes("hipno")) {
    list.push("Hipnoterapi Klinis")
  }

  // Tambahkan topik keahlian spesifik
  if (keahlian) {
    const parts = keahlian.split(",").map((s) => s.trim()).filter(Boolean)
    parts.slice(0, 3).forEach((topic) => {
      const label = `Konseling: ${topic}`
      if (!list.includes(label)) list.push(label)
    })
  }

  if (list.length === 0) {
    list.push("Konseling Individu")
  }

  return Array.from(new Set(list))
}

export default function ModalTambahSesi({ isOpen, onClose, onSuccess }: ModalTambahSesiProps) {
  const todayStr = new Date().toISOString().split("T")[0]

  const [formData, setFormData] = useState({
    namaKlien: "",
    kontak: "",
    layanan: "Konseling Individu",
    psikolog: "",
    idPsikolog: "",
    tanggal: todayStr,
    waktu: "",
    metode: "Online" as "Online" | "Offline",
    catatan: "",
  })

  const [psikologList, setPsikologList] = useState<PsikologOption[]>([])
  const [isLoadingPsikolog, setIsLoadingPsikolog] = useState(false)
  const [selectedKategori, setSelectedKategori] = useState<KategoriTenagaOption>("psikolog")

  const [availableSlots, setAvailableSlots] = useState<JadwalSlotItem[]>([])
  const [allPsikologSlots, setAllPsikologSlots] = useState<JadwalSlotItem[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const formatPsikologLabel = (p: { nama: string; kategori?: string; status?: string }) => {
    let label = p.nama
    if (p.kategori) {
      const k = p.kategori.toLowerCase()
      let roleLabel = ""
      if (k.includes("peer")) roleLabel = "Peer Konselor"
      else if (k.includes("konselor")) roleLabel = "Konselor"
      else if (k.includes("psikolog")) roleLabel = "Psikolog"
      else roleLabel = p.kategori

      if (roleLabel && !p.nama.toLowerCase().includes(roleLabel.toLowerCase())) {
        label += ` (${roleLabel})`
      }
    }
    if (p.status === "INACTIVE") {
      label += " - Nonaktif"
    }
    return label
  }

  // Muat seluruh psikolog terdaftar langsung dari database & cache lokal
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const loadPsikologs = async () => {
      setIsLoadingPsikolog(true)
      try {
        const dbList = await psikologService.getList({ status: "ALL" })
        const rawLocal = typeof window !== "undefined" ? localStorage.getItem("empathika_tenaga_ahli_data") : null
        const localList = rawLocal ? JSON.parse(rawLocal) : []

        const map = new Map<string, PsikologOption>()

        if (Array.isArray(dbList) && dbList.length > 0) {
          dbList.forEach((p: any) => {
            const nama = p.nama_gelar || p.account?.nama || p.nama || "Psikolog Empathika"
            map.set(p.id, {
              id: p.id,
              nama,
              kategori: p.kategori,
              spesialisasi: p.spesialisasi?.nama || p.spesialisasi || "",
              keahlian: p.keahlian || "",
              status: p.status,
            })
          })
        }

        if (Array.isArray(localList)) {
          localList.forEach((p: any) => {
            if (['0', '1', '2', '3', '4'].includes(p.id) || p.email?.endsWith('@empathika.test')) return
            const nama = p.nama_gelar || p.nama || p.account?.nama
            if (nama && !Array.from(map.values()).some((item) => item.nama.toLowerCase() === nama.toLowerCase())) {
              map.set(p.id || nama, {
                id: p.id || nama,
                nama,
                kategori: p.kategori,
                spesialisasi: p.spesialisasi || "",
                keahlian: Array.isArray(p.keahlian) ? p.keahlian.join(", ") : p.keahlian || "",
                status: p.statusAkses === "NONAKTIF" ? "INACTIVE" : "ACTIVE",
              })
            }
          })
        }

        const list = Array.from(map.values())
        if (isMounted) {
          setPsikologList(list)
          if (list.length > 0) {
            setFormData((prev) => {
              const currentMatch = list.find(
                (item) => item.id === prev.idPsikolog || item.nama.toLowerCase() === prev.psikolog.toLowerCase()
              )
              const defaultFiltered = list.filter((p) => normalizeKategori(p.kategori) === selectedKategori)
              const chosen = currentMatch || defaultFiltered[0] || list[0]
              if (chosen) {
                setSelectedKategori(normalizeKategori(chosen.kategori))
              }
              return {
                ...prev,
                idPsikolog: chosen ? chosen.id : list[0].id,
                psikolog: chosen ? chosen.nama : list[0].nama,
              }
            })
          }
        }
      } catch (err) {
        console.warn("Gagal mengambil data psikolog:", err)
        if (isMounted) {
          setPsikologList([])
        }
      } finally {
        if (isMounted) setIsLoadingPsikolog(false)
      }
    }

    loadPsikologs()
    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Tenaga Ahli yang difilter berdasarkan kategori profesi
  const filteredPsikologList = useMemo(() => {
    return psikologList.filter((p) => normalizeKategori(p.kategori) === selectedKategori)
  }, [psikologList, selectedKategori])

  // Hitung jumlah tiap kategori untuk badge
  const categoryCounts = useMemo(() => {
    return {
      psikolog: psikologList.filter((p) => normalizeKategori(p.kategori) === "psikolog").length,
      konselor: psikologList.filter((p) => normalizeKategori(p.kategori) === "konselor").length,
      "peer-konselor": psikologList.filter((p) => normalizeKategori(p.kategori) === "peer-konselor").length,
    }
  }, [psikologList])

  // Sinkronkan pilihan saat kategori profesi diganti
  const handleSelectKategori = (kat: KategoriTenagaOption) => {
    setSelectedKategori(kat)
    const filtered = psikologList.filter((p) => normalizeKategori(p.kategori) === kat)
    if (filtered.length > 0) {
      setFormData((prev) => ({
        ...prev,
        idPsikolog: filtered[0].id,
        psikolog: filtered[0].nama,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        idPsikolog: "",
        psikolog: "",
      }))
    }
  }

  // Tenaga Ahli yang sedang dipilih saat ini
  const currentPsikolog = useMemo(() => {
    return (
      filteredPsikologList.find((p) => p.id === formData.idPsikolog) ||
      filteredPsikologList[0] ||
      psikologList.find((p) => p.id === formData.idPsikolog)
    )
  }, [filteredPsikologList, psikologList, formData.idPsikolog])

  // Jenis Layanan dinamis sesuai kategori & keahlian psikolog
  const layananOptions = useMemo(() => {
    return getLayananOptionsForPsikolog(currentPsikolog)
  }, [currentPsikolog])

  // Sinkronkan pilihan layanan jika belum ada atau tidak valid
  useEffect(() => {
    if (layananOptions.length > 0 && !layananOptions.includes(formData.layanan)) {
      setFormData((prev) => ({ ...prev, layanan: layananOptions[0] }))
    }
  }, [layananOptions, formData.layanan])

  // Ambil slot jadwal resmi yang dibuka oleh psikolog terpilih
  useEffect(() => {
    if (!isOpen || !formData.idPsikolog) return

    let isMounted = true
    const fetchSlots = async () => {
      setIsLoadingSlots(true)
      try {
        const [slotsForDate, allSlots] = await Promise.all([
          psikologService.getJadwalTersedia({
            id_psikolog: formData.idPsikolog,
            tanggal: formData.tanggal,
            tipe_jadwal: "KONSULTASI",
          }),
          psikologService.getJadwalTersedia({
            id_psikolog: formData.idPsikolog,
            tipe_jadwal: "KONSULTASI",
          }),
        ])

        if (!isMounted) return

        const activeDateSlots = Array.isArray(slotsForDate) ? slotsForDate : []
        setAvailableSlots(activeDateSlots)
        setAllPsikologSlots(Array.isArray(allSlots) ? allSlots : [])

        // Jika slot tersedia untuk tanggal tersebut, pilih slot pertama atau pertahankan slot terpilih
        if (activeDateSlots.length > 0) {
          setFormData((prev) => {
            const currentMatching = activeDateSlots.find((s) => getSlotTimeLabel(s) === prev.waktu)
            const targetSlot = currentMatching || activeDateSlots[0]
            const timeLabel = getSlotTimeLabel(targetSlot)

            const m = (targetSlot.metode || "").toUpperCase()
            let newMetode: "Online" | "Offline" = "Online"
            if (m.includes("OFFLINE") && !m.includes("ONLINE") && !m.includes("KEDUANYA")) {
              newMetode = "Offline"
            } else if (m.includes("ONLINE") && !m.includes("OFFLINE") && !m.includes("KEDUANYA")) {
              newMetode = "Online"
            } else {
              newMetode = prev.metode || "Online"
            }

            return {
              ...prev,
              waktu: timeLabel,
              metode: newMetode,
            }
          })
        } else {
          setFormData((prev) => ({ ...prev, waktu: "" }))
        }
      } catch (err) {
        console.warn("Gagal mengambil slot psikolog:", err)
        if (isMounted) {
          setAvailableSlots([])
          setAllPsikologSlots([])
        }
      } finally {
        if (isMounted) setIsLoadingSlots(false)
      }
    }

    fetchSlots()
    return () => {
      isMounted = false
    }
  }, [isOpen, formData.idPsikolog, formData.tanggal])

  // Gabungkan slot jam unik dan tentukan ketersediaan metode untuk setiap jam
  const timeSlotOptions = useMemo<UniqueTimeSlotOption[]>(() => {
    const map = new Map<string, { allowsOnline: boolean; allowsOffline: boolean }>()

    availableSlots.forEach((slot) => {
      const label = getSlotTimeLabel(slot)
      const current = map.get(label) || { allowsOnline: false, allowsOffline: false }

      const m = (slot.metode || "").toUpperCase()
      if (m.includes("KEDUANYA") || (m.includes("ONLINE") && m.includes("OFFLINE")) || m === "SEMUA") {
        current.allowsOnline = true
        current.allowsOffline = true
      } else if (m.includes("OFFLINE")) {
        current.allowsOffline = true
      } else {
        current.allowsOnline = true
      }

      map.set(label, current)
    })

    return Array.from(map.entries()).map(([label, opts]) => {
      let metodeLabel = ""
      if (opts.allowsOnline && opts.allowsOffline) {
        metodeLabel = "[Online & Offline]"
      } else if (opts.allowsOffline) {
        metodeLabel = "[Offline]"
      } else {
        metodeLabel = "[Online]"
      }
      return {
        label,
        allowsOnline: opts.allowsOnline,
        allowsOffline: opts.allowsOffline,
        metodeLabel,
      }
    })
  }, [availableSlots])

  // Opsi slot jam yang sedang dipilih saat ini
  const currentSlotOption = useMemo(() => {
    if (!formData.waktu || timeSlotOptions.length === 0) return null
    return timeSlotOptions.find((opt) => opt.label === formData.waktu) || null
  }, [formData.waktu, timeSlotOptions])

  const allowsOnline = currentSlotOption ? currentSlotOption.allowsOnline : true
  const allowsOffline = currentSlotOption ? currentSlotOption.allowsOffline : true

  // Sinkronkan otomatis pilihan metode jika slot jam hanya mengizinkan 1 metode tertentu
  useEffect(() => {
    if (!currentSlotOption) return

    if (currentSlotOption.allowsOnline && !currentSlotOption.allowsOffline) {
      if (formData.metode !== "Online") {
        setFormData((prev) => ({ ...prev, metode: "Online" }))
      }
    } else if (currentSlotOption.allowsOffline && !currentSlotOption.allowsOnline) {
      if (formData.metode !== "Offline") {
        setFormData((prev) => ({ ...prev, metode: "Offline" }))
      }
    }
  }, [currentSlotOption, formData.metode])

  // Daftar tanggal yang memiliki slot dibuka oleh psikolog ini
  const datesWithSlots = useMemo(() => {
    const dates = allPsikologSlots
      .map((s) => s.tanggal)
      .filter((t): t is string => Boolean(t))
    return Array.from(new Set(dates)).sort()
  }, [allPsikologSlots])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.namaKlien.trim()) return

    if (!formData.waktu || availableSlots.length === 0) {
      alert("Tidak dapat menjadwalkan sesi: Jam sesi hanya dapat dipilih dari slot resmi yang telah dibuka oleh psikolog pada tanggal tersebut.")
      return
    }

    const selectedPsikolog = psikologList.find((p) => p.id === formData.idPsikolog) || psikologList[0]
    const finalIdPsikolog = formData.idPsikolog || selectedPsikolog?.id || ""
    const finalNamaPsikolog = formData.psikolog || selectedPsikolog?.nama || ""

    let finalMetode: "Online" | "Offline" = formData.metode
    if (allowsOnline && !allowsOffline) finalMetode = "Online"
    else if (!allowsOnline && allowsOffline) finalMetode = "Offline"

    const newSession: NewSessionData = {
      id: "sesi_" + Date.now(),
      namaKlien: formData.namaKlien.trim(),
      kontak: formData.kontak.trim(),
      layanan: formData.layanan,
      psikolog: finalNamaPsikolog,
      idPsikolog: finalIdPsikolog,
      tanggal: formData.tanggal,
      waktu: formData.waktu,
      metode: finalMetode,
      catatan: formData.catatan.trim(),
      status: "Mendatang",
    }

    onSuccess(newSession)
    // Reset form
    setFormData({
      namaKlien: "",
      kontak: "",
      layanan: layananOptions[0] || "Konseling Individu",
      psikolog: psikologList.length > 0 ? psikologList[0].nama : "",
      idPsikolog: psikologList.length > 0 ? psikologList[0].id : "",
      tanggal: todayStr,
      waktu: "",
      metode: "Online",
      catatan: "",
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8C32A]/20 text-[#8a720d] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                Tambah Sesi Konseling Baru
              </h3>
              <p className="text-xs text-gray-500">
                Jadwalkan konsultasi klien langsung ke kalender operasional.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Nama Klien & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#5D205E]" />
                Nama Klien <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="cth: Budi Santoso"
                value={formData.namaKlien}
                onChange={(e) => setFormData({ ...formData, namaKlien: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#5D205E]" />
                No. WhatsApp / Kontak
              </label>
              <input
                type="tel"
                placeholder="cth: 0812-3456-7890"
                value={formData.kontak}
                onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* Baris 2: Pemilihan Tenaga Ahli (2 Kolom Dropdown Berpasangan: Kategori & Nama) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-gray-700 mb-1.5 flex items-center gap-1.5 whitespace-nowrap">
                <UserCheck className="w-3.5 h-3.5 text-[#5D205E] shrink-0" />
                <span>Kategori Tenaga Ahli <span className="text-red-500">*</span></span>
              </label>
              <select
                value={selectedKategori}
                onChange={(e) => handleSelectKategori(e.target.value as KategoriTenagaOption)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium cursor-pointer"
              >
                <option value="psikolog">Psikolog ({categoryCounts.psikolog})</option>
                <option value="konselor">Konselor ({categoryCounts.konselor})</option>
                <option value="peer-konselor">Peer Konselor ({categoryCounts["peer-konselor"]})</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 mb-1.5 flex items-center gap-1.5 whitespace-nowrap">
                <User className="w-3.5 h-3.5 text-[#5D205E] shrink-0" />
                <span>Nama {selectedKategori === "psikolog" ? "Psikolog" : selectedKategori === "konselor" ? "Konselor" : "Peer Konselor"} <span className="text-red-500">*</span></span>
              </label>

              <select
                value={formData.idPsikolog || formData.psikolog}
                onChange={(e) => {
                  const val = e.target.value
                  const found = filteredPsikologList.find((p) => p.id === val || p.nama === val)
                  setFormData((prev) => ({
                    ...prev,
                    idPsikolog: found ? found.id : val,
                    psikolog: found ? found.nama : val,
                  }))
                }}
                disabled={isLoadingPsikolog && filteredPsikologList.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium cursor-pointer disabled:opacity-60"
              >
                {filteredPsikologList.length === 0 ? (
                  <option value="">
                    {isLoadingPsikolog
                      ? "Memuat data tenaga ahli..."
                      : `Belum ada ${selectedKategori === "psikolog" ? "psikolog" : selectedKategori === "konselor" ? "konselor" : "peer konselor"} terdaftar`}
                  </option>
                ) : (
                  filteredPsikologList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Baris 3: Jenis Layanan Konseling */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span>Jenis Layanan <span className="text-red-500">*</span></span>
            </label>
            <select
              value={formData.layanan}
              onChange={(e) => setFormData({ ...formData, layanan: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium cursor-pointer"
            >
              {layananOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal & Waktu (Wajib Slot Terbuka dari Psikolog) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5D205E]" />
                Tanggal Konsultasi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5D205E]" />
                  Jam Sesi <span className="text-red-500">*</span>
                </span>
                {isLoadingSlots && (
                  <span className="text-[10px] text-gray-400 font-normal">Memeriksa slot...</span>
                )}
              </label>

              <select
                value={formData.waktu}
                onChange={(e) => {
                  const selectedVal = e.target.value
                  const matchingOpt = timeSlotOptions.find((opt) => opt.label === selectedVal)

                  let newMetode: "Online" | "Offline" = formData.metode
                  if (matchingOpt) {
                    if (matchingOpt.allowsOnline && !matchingOpt.allowsOffline) {
                      newMetode = "Online"
                    } else if (matchingOpt.allowsOffline && !matchingOpt.allowsOnline) {
                      newMetode = "Offline"
                    }
                  }

                  setFormData((prev) => ({
                    ...prev,
                    waktu: selectedVal,
                    metode: newMetode,
                  }))
                }}
                disabled={isLoadingSlots || timeSlotOptions.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium cursor-pointer disabled:opacity-60"
              >
                {isLoadingSlots ? (
                  <option value="">Memeriksa slot dibuka psikolog...</option>
                ) : timeSlotOptions.length === 0 ? (
                  <option value="">Tidak ada slot dibuka oleh psikolog pada tanggal ini</option>
                ) : (
                  timeSlotOptions.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Kotak Peringatan jika Psikolog Belum Buka Slot pada Tanggal Tersebut */}
          {availableSlots.length === 0 && !isLoadingSlots && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Slot Belum Dibuka Oleh Psikolog</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {currentPsikolog?.nama || "Psikolog ini"} belum membuka jadwal slot ketersediaan pada tanggal{" "}
                <strong>{formData.tanggal}</strong>. Admin tidak dapat membuka jam sendiri jika psikolog belum membukanya.
              </p>
              {datesWithSlots.length > 0 ? (
                <div className="mt-2 text-[11px]">
                  <span className="font-semibold text-gray-700">Pilih tanggal lain yang telah dibuka oleh psikolog ini: </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {datesWithSlots.slice(0, 5).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, tanggal: d }))}
                        className="px-2.5 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-950 font-bold transition cursor-pointer text-[10px]"
                      >
                        📅 {d}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-gray-500 italic">
                  (Psikolog ini belum membuka slot konsultasi apapun di kalender portalnya)
                </p>
              )}
            </div>
          )}

          {/* Metode Konseling Dinamis Sesuai Slot Psikolog */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-bold text-gray-700">
                Metode Konsultasi <span className="text-red-500">*</span>
              </label>
              {currentSlotOption && (
                <span className="text-[11px] font-semibold text-[#5D205E]">
                  {currentSlotOption.allowsOnline && currentSlotOption.allowsOffline
                    ? "Tersedia Online & Offline"
                    : currentSlotOption.allowsOnline
                    ? "Tersedia Online Saja"
                    : "Tersedia Offline Saja"}
                </span>
              )}
            </div>

            {/* Skenario 1: Jika KEDUA metode (Online & Offline) dibuka oleh psikolog */}
            {allowsOnline && allowsOffline && (
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, metode: "Online" })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      formData.metode === "Online"
                        ? "border-[#5D205E] bg-[#5D205E]/10 text-[#5D205E] ring-1 ring-[#5D205E]"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Online (Zoom Meeting)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, metode: "Offline" })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      formData.metode === "Offline"
                        ? "border-[#5D205E] bg-[#5D205E]/10 text-[#5D205E] ring-1 ring-[#5D205E]"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Offline (Klinik Empathika)
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500">
                  Psikolog membuka kedua metode untuk slot jam ini. Silakan pilih metode yang diinginkan klien.
                </p>
              </div>
            )}

            {/* Skenario 2: Jika HANYA Online yang dibuka oleh psikolog */}
            {allowsOnline && !allowsOffline && (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#5D205E]/30 bg-[#5D205E]/5 text-[#5D205E]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#5D205E]/15 flex items-center justify-center text-[#5D205E] shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900">Online (Zoom Meeting)</div>
                    <div className="text-[11px] text-gray-500">
                      Tautan video konferensi otomatis disediakan untuk sesi ini
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#5D205E]/10 text-[#5D205E] text-[10px] font-bold shrink-0">
                  Khusus Online
                </span>
              </div>
            )}

            {/* Skenario 3: Jika HANYA Offline yang dibuka oleh psikolog */}
            {!allowsOnline && allowsOffline && (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/60 text-emerald-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900">Offline (Klinik Empathika)</div>
                    <div className="text-[11px] text-gray-500">
                      Sesi tatap muka di ruang konseling Klinik Empathika
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                  Khusus Offline
                </span>
              </div>
            )}

            {/* Skenario 4: Jika belum ada slot jam yang dibuka */}
            {!currentSlotOption && availableSlots.length === 0 && (
              <div className="py-3 px-3 rounded-xl border border-dashed border-gray-200 text-gray-400 text-center text-xs bg-gray-50/50">
                Metode konsultasi akan otomatis mengikuti slot jam yang dibuka oleh psikolog.
              </div>
            )}
          </div>

          {/* Catatan / Keluhan Awal */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#5D205E]" />
              Catatan / Keluhan Awal (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Tuliskan catatan khusus atau keluhan klien jika ada..."
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8C32A] transition text-gray-900 font-medium"
            />
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={availableSlots.length === 0 || !formData.waktu || isLoadingSlots}
              className="flex items-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              Jadwalkan Sesi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
