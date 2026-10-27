"use client"

import { useEffect, useRef, useState } from "react"
import { Clock } from "lucide-react"
import ActivationWarningModal from "@/components/common/ActivationWarningModal"
import { adminService } from "@/services/admin.service"
import {
  formatExpiryDisplay,
  formatRemainingTime,
  isLinkStillValid,
  toIsoExpiry,
} from "@/lib/activation"

type Props = {
  accountId?: string | null
  accountAktif: boolean
  tokenAktivasi?: string | null
  tokenExpiredAt?: string | null
  compact?: boolean
  onUpdated: (next: {
    tokenAktivasi?: string | null
    tokenExpiredAt?: string | null
    accountAktif?: boolean
    activationUrl?: string | null
  }) => void
  onRefreshFromServer: () => Promise<void>
}

export default function GenerateActivationLinkButton({
  accountId,
  accountAktif,
  tokenAktivasi,
  tokenExpiredAt,
  compact = false,
  onUpdated,
  onRefreshFromServer,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [warningOpen, setWarningOpen] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [warningExpiry, setWarningExpiry] = useState<string | undefined>()
  const [warningRemaining, setWarningRemaining] = useState<string | undefined>()
  const inFlight = useRef(false)

  const expiryIso = toIsoExpiry(tokenExpiredAt)
  const linkActive = Boolean(tokenAktivasi && isLinkStillValid(expiryIso))
  const remainingMs = expiryIso ? new Date(expiryIso).getTime() - nowTick : 0
  const remainingText = linkActive ? formatRemainingTime(remainingMs) : ""

  useEffect(() => {
    if (!linkActive) return
    const timer = setInterval(() => {
      setNowTick(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [linkActive, expiryIso])

  const neverGenerated = !tokenAktivasi
  let label = "Generate Link"
  if (accountAktif) label = "Akun sudah aktif"
  else if (linkActive) label = `Bisa generate ulang dalam ${remainingText}`
  else if (tokenAktivasi) label = "Generate Ulang"

  const isBlocked = isSubmitting || inFlight.current

  const handleGenerate = async () => {
    if (isBlocked) return

    if (accountAktif) {
      setWarningMessage("Akun ini sudah aktif dan kata sandi telah dibuat. Tidak perlu melakukan generate ulang link aktivasi.")
      setWarningExpiry(undefined)
      setWarningRemaining(undefined)
      setWarningOpen(true)
      return
    }

    if (linkActive) {
      const expFormatted = expiryIso ? formatExpiryDisplay(expiryIso) : undefined
      setWarningMessage(
        `Link aktivasi saat ini masih aktif dan berlaku hingga ${expFormatted || "3 hari"}. ` +
        `Generate ulang baru diizinkan setelah masa berlaku habis.`
      )
      setWarningExpiry(expFormatted)
      setWarningRemaining(remainingText)
      setWarningOpen(true)
      return
    }

    if (!accountId) {
      setWarningMessage("ID akun tidak ditemukan. Muat ulang halaman, lalu coba lagi.")
      setWarningOpen(true)
      return
    }

    inFlight.current = true
    setIsSubmitting(true)
    try {
      const data = await adminService.resendActivation(accountId)
      const nextExpiry = toIsoExpiry(data?.tokenExpiredAt || data?.account?.tokenExpiredAt)
      onUpdated({
        tokenAktivasi: data?.token || data?.account?.tokenAktivasi || data?.account?.token_aktivasi,
        tokenExpiredAt: nextExpiry,
        accountAktif: Boolean(data?.account?.accountAktif),
        activationUrl: data?.activationUrl,
      })
      await onRefreshFromServer()
    } catch (err: any) {
      const status = err?.response?.status
      const payload = err?.response?.data || {}
      const msg =
        payload.message ||
        err.message ||
        "Generate ulang link belum diizinkan oleh server."
      setWarningMessage(msg)
      setWarningExpiry(
        payload.tokenExpiredAt ? formatExpiryDisplay(payload.tokenExpiredAt) : expiryIso ? formatExpiryDisplay(expiryIso) : undefined
      )
      setWarningRemaining(payload.remainingFormatted || (linkActive ? remainingText : undefined))
      setWarningOpen(true)
      if (payload.tokenExpiredAt) {
        onUpdated({
          tokenExpiredAt: toIsoExpiry(payload.tokenExpiredAt),
          tokenAktivasi: tokenAktivasi,
        })
      }
      if (status === 409 || status === 429) {
        await onRefreshFromServer()
      }
    } finally {
      inFlight.current = false
      setIsSubmitting(false)
    }
  }

  const title = accountAktif
    ? "Akun sudah aktif"
    : linkActive
      ? `Link masih berlaku hingga ${formatExpiryDisplay(expiryIso)}`
      : neverGenerated
        ? "Buat tautan aktivasi"
        : "Buat ulang tautan aktivasi"

  const isClickable = !isBlocked && !isSubmitting
  const isInactive = accountAktif || linkActive || isSubmitting

  return (
    <>
      <ActivationWarningModal
        isOpen={warningOpen}
        onClose={() => setWarningOpen(false)}
        message={warningMessage}
        expiryDateText={warningExpiry}
        remainingText={warningRemaining}
      />
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!isClickable}
        title={title}
        className={
          compact
            ? `inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border transition ${
                isInactive
                  ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                  : "text-[#561269] bg-white border-purple-200 hover:bg-purple-100/60 cursor-pointer active:scale-95 shadow-2xs"
              }`
            : `px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ${
                isInactive
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200"
                  : "bg-teal-600 hover:bg-teal-700 text-white shadow-sm active:scale-95 cursor-pointer"
              }`
        }
      >
        <Clock className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        {isSubmitting ? "Memproses..." : label}
      </button>
    </>
  )
}
