/** Pembungkus halaman pembayaran berhasil khusus layanan psikotes. */
"use client"

import PaymentSuccessClient from "@/components/shared/checkout/PaymentSuccessClient"

export default function PsikotesSuccessClient() {
  return <PaymentSuccessClient type="psikotes" />
}
