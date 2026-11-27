"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { layananService } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import { DEFAULT_LAYANAN_KONSULTASI, MetodeKonsultasi } from "../../components/psikolog/types"

export function usePsikologProfileAndServices(user: any) {
  const resolveActivePsikolog = useCallback(() => {
    if (typeof window === "undefined") {
      return { id: "0", nama_gelar: user?.name || "Psikolog Empathika", kategori: "psikolog" }
    }
    const savedName = localStorage.getItem("active_psikolog_name")
    const savedId = localStorage.getItem("active_psikolog_id")
    const isInvalid = !savedName || savedName.toLowerCase().includes("admin")

    const savedKat = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_kategori") : null

    if (user?.role === "PSIKOLOG" && user?.name && !user.name.toLowerCase().includes("admin")) {
      return { id: user.id || "0", nama_gelar: user.name, kategori: savedKat || "psikolog" }
    }
    if (!isInvalid && savedName) {
      return { id: savedId || "0", nama_gelar: savedName, kategori: savedKat || "psikolog" }
    }
    return { id: "0", nama_gelar: user?.name || "Psikolog Empathika", kategori: savedKat || "psikolog" }
  }, [user])

  const [activePsikolog, setActivePsikolog] = useState<{
    id: string
    nama_gelar: string
    kategori?: string
    account?: any
  } | null>(resolveActivePsikolog)

  const currentPsi = resolveActivePsikolog()
  const resolvedPsikologId =
    activePsikolog?.id && activePsikolog.id !== "0"
      ? activePsikolog.id
      : currentPsi?.id && currentPsi.id !== "0"
      ? currentPsi.id
      : typeof window !== "undefined"
      ? localStorage.getItem("active_psikolog_id") || "0"
      : "0"

  const resolvedPsikologName =
    activePsikolog?.nama_gelar ||
    activePsikolog?.account?.nama ||
    currentPsi?.nama_gelar ||
    (currentPsi as any)?.account?.nama ||
    (typeof window !== "undefined" ? localStorage.getItem("active_psikolog_name") || "" : "") ||
    user?.name ||
    ""

  const resolvedAccountId =
    (activePsikolog as any)?.id_account ||
    (activePsikolog as any)?.account?.id ||
    user?.id ||
    (typeof window !== "undefined" ? localStorage.getItem("active_psikolog_account_id") || "" : "")

  const [selectedLayanan, setSelectedLayanan] = useState<string>("Semua Layanan Konsultasi")
  const [layananOptions, setLayananOptions] = useState<string[]>(DEFAULT_LAYANAN_KONSULTASI)
  const [serviceItems, setServiceItems] = useState<any[]>([])
  const [selectedMetode, setSelectedMetode] = useState<MetodeKonsultasi>("Online")

  // Menentukan metode konsultasi yang diperbolehkan berdasarkan pengaturan layanan
  const allowedMetode = useMemo(() => {
    let targetServices = serviceItems
    if (selectedLayanan && selectedLayanan !== "Semua Layanan Konsultasi") {
      const found = serviceItems.filter(
        (s) => (s.nama || s.layanan || "").trim().toLowerCase() === selectedLayanan.trim().toLowerCase()
      )
      if (found.length > 0) {
        targetServices = found
      }
    }

    if (targetServices.length === 0) {
      return { online: true, offline: true, both: true }
    }

    let hasOnline = false
    let hasOffline = false

    targetServices.forEach((s) => {
      const m = (s.metode || "Online/Offline").toLowerCase()
      if (m.includes("online") || m.includes("keduanya") || m === "semua") {
        hasOnline = true
      }
      if (m.includes("offline") || m.includes("keduanya") || m === "semua") {
        hasOffline = true
      }
    })

    return {
      online: hasOnline,
      offline: hasOffline,
      both: hasOnline && hasOffline,
    }
  }, [selectedLayanan, serviceItems])

  // Sinkronkan metode otomatis jika metode aktif tidak didukung
  useEffect(() => {
    if (allowedMetode.both) return
    if (allowedMetode.online && !allowedMetode.offline) {
      if (selectedMetode !== "Online") setSelectedMetode("Online")
    } else if (!allowedMetode.online && allowedMetode.offline) {
      if (selectedMetode !== "Offline") setSelectedMetode("Offline")
    }
  }, [allowedMetode, selectedMetode])

  // Fetch daftar layanan konsultasi yang aktif
  useEffect(() => {
    let isMounted = true
    const myRole = (activePsikolog?.kategori || "").toLowerCase()
    const cleanRole = myRole.includes("peer") ? "peer" : myRole.includes("konselor") ? "konselor" : "psikolog"

    layananService
      .getAll({ kategori: "KONSULTASI", kategori_tenaga: cleanRole })
      .then((res: any) => {
        if (!isMounted) return
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        const activeServices: any[] = []
        const activeNames: string[] = []

        raw.forEach((l: any) => {
          if (l.aktif === false || l.status === "Nonaktif") return
          const profs: string[] = l.profesi_tersedia || []
          let matchProf = true
          if (profs.length > 0) {
            matchProf = profs.includes(cleanRole)
          } else {
            const t = l.tarif_tenaga_ahli
            if (cleanRole === "psikolog") {
              matchProf = Boolean(
                (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) ||
                  (!t && (Number(l.harga_weekday) > 0 || Number(l.harga_weekend) > 0))
              )
            } else if (cleanRole === "konselor") {
              matchProf = Boolean(t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0))
            } else if (cleanRole === "peer") {
              matchProf = Boolean(t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0))
            }
          }
          if (matchProf) {
            activeServices.push(l)
            if (l.nama) activeNames.push(l.nama.trim())
          }
        })

        try {
          const stored = getStoredLayanan().filter(
            (item: any) =>
              (item.kategoriId === "01" || (item.kategori || "").toUpperCase() === "KONSULTASI") &&
              item.status !== "Nonaktif"
          )
          stored.forEach((item: any) => {
            const itemTitle = (item.layanan || item.nama || "").trim()
            if (!itemTitle) return
            const alreadyExists = activeServices.some(
              (s) => (s.nama || s.layanan || "").trim().toLowerCase() === itemTitle.toLowerCase()
            )
            if (!alreadyExists) {
              const t = item.tarif_tenaga_ahli
              let isMatch = true
              if (t && typeof t === "object") {
                if (cleanRole === "psikolog")
                  isMatch = Boolean(t.psikolog && (t.psikolog.weekday || t.psikolog.weekend))
                else if (cleanRole === "konselor")
                  isMatch = Boolean(t.konselor && (t.konselor.weekday || t.konselor.weekend))
                else if (cleanRole === "peer")
                  isMatch = Boolean(t.peer && (t.peer.weekday || t.peer.weekend))
              }
              if (isMatch) {
                activeServices.push(item)
                activeNames.push(itemTitle)
              }
            }
          })
        } catch { }

        if (activeServices.length === 0) {
          activeServices.push({
            id: "konsultasi-individu-01",
            nama: "Konsultasi Individu",
            layanan: "Konsultasi Individu",
            metode: "Online/Offline",
            status: "Aktif",
          })
          activeNames.push("Konsultasi Individu")
        }

        setServiceItems(activeServices)

        const uniqueNames: string[] = Array.from(new Set<string>(activeNames))
        if (uniqueNames.length > 0) {
          setLayananOptions(["Semua Layanan Konsultasi", ...uniqueNames])
        } else {
          setLayananOptions(["Semua Layanan Konsultasi"])
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat layanan konsultasi:", err?.message)
      })

    return () => {
      isMounted = false
    }
  }, [activePsikolog?.kategori])

  return {
    activePsikolog,
    setActivePsikolog,
    resolveActivePsikolog,
    resolvedPsikologId,
    resolvedPsikologName,
    resolvedAccountId,
    selectedLayanan,
    setSelectedLayanan,
    layananOptions,
    setLayananOptions,
    serviceItems,
    selectedMetode,
    setSelectedMetode,
    allowedMetode,
  }
}
