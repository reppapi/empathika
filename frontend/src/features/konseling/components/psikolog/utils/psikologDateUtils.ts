export function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.getFullYear(), date.getMonth(), diff)
}

export function formatDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatFullDateIndonesian(d: Date): string {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

export function isSlotPassed(dateKey?: string, waktu?: string): boolean {
  if (!dateKey) return false
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`
  if (dateKey < todayKey) return true
  if (dateKey > todayKey) return false

  if (waktu) {
    const parts = waktu.split("-").map((s) => s.trim())
    const startTimeStr = parts[0]
    if (startTimeStr) {
      const [h, m] = startTimeStr.split(":").map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        const startMinutes = h * 60 + m
        return currentMinutes >= startMinutes
      }
    }
  }
  return false
}

export function isSessionPastOrCompleted(
  dateKey?: string,
  waktu?: string,
  status?: string
): boolean {
  if (status === "Selesai" || status === "COMPLETED") return true
  if (!dateKey) return false

  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`

  if (dateKey < todayKey) return true
  if (dateKey > todayKey) return false

  if (waktu) {
    const parts = waktu.split("-").map((s) => s.trim())
    const endTimeStr = parts[1] || parts[0]
    if (endTimeStr) {
      const [h, m] = endTimeStr.split(":").map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        const endMinutes = h * 60 + m
        return currentMinutes >= endMinutes
      }
    }
  }

  return false
}

export function cleanRoleOrTitle(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(
      /\b(psikolog|konselor|peer|empathika|tenaga|ahli|admin|dr|dra|drs|m\.psi|s\.psi)\b/gi,
      ""
    )
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

export function matchPsikologSession(
  target: {
    id_psikolog?: string | null
    idPsikolog?: string | null
    namaPsikolog?: string | null
    psikolog?: string | null
    psikologName?: string | null
    nama_psikolog?: string | null
  },
  currentId?: string | null,
  currentName?: string | null,
  currentAccountId?: string | null
): boolean {
  const targetId = target.id_psikolog || target.idPsikolog
  const targetName =
    target.namaPsikolog || target.psikolog || target.psikologName || target.nama_psikolog

  // 1. Jika ada ID di target dan di psikolog login, WAJIB cocok
  if (targetId && targetId !== "0") {
    if (currentId && currentId !== "0" && targetId === currentId) return true
    if (currentAccountId && currentAccountId !== "0" && targetId === currentAccountId) return true
  }

  // 2. Jika nama cocok
  if (currentName && targetName) {
    const cleanCurrent = cleanRoleOrTitle(currentName)
    const cleanTarget = cleanRoleOrTitle(targetName)
    if (cleanCurrent.length >= 3 && cleanTarget.length >= 3) {
      if (
        cleanCurrent === cleanTarget ||
        cleanCurrent.includes(cleanTarget) ||
        cleanTarget.includes(cleanCurrent)
      ) {
        return true
      }
    }
  }

  return false
}
