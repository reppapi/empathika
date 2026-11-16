/** Pembungkus halaman status pembayaran pending khusus layanan psikotes. */
"use client"

import PaymentPendingClient from "@/components/shared/checkout/PaymentPendingClient"

export default function PsikotesPendingClient() {
  return <PaymentPendingClient type="psikotes" />
}
