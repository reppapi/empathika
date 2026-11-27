export function formatRp(num: any): string {
  if (!num && num !== 0) return "-"
  const n =
    typeof num === "string"
      ? parseInt(num.replace(/[,.]00$/, "").replace(/[^0-9]/g, "") || "0", 10)
      : num
  return `Rp ${n.toLocaleString("id-ID")}`
}

export function isLayananMatch(itemNama: string, initialLayanan: string): boolean {
  if (!initialLayanan) return false
  const lName = (itemNama || "").toLowerCase().trim()
  const initName = initialLayanan.toLowerCase().trim()
  if (lName === initName || lName.includes(initName) || initName.includes(lName)) {
    return true
  }
  const lClean = lName.replace(/konsultasi/g, "").replace(/[^a-z0-9]/g, "")
  const initClean = initName.replace(/konsultasi/g, "").replace(/[^a-z0-9]/g, "")
  return Boolean(
    lClean &&
      initClean &&
      (lClean === initClean || lClean.includes(initClean) || initClean.includes(lClean))
  )
}
