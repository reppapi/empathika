"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminEventData, mapApiToAdminEvent } from "../../data/adminEventData"
import { eventService, EventBookingClientApi } from "@/services/event.service"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import {
  Loader2,
  Video,
  MessageCircle,
  ExternalLink,
  Users,
  Phone,
  Ticket,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  Edit2,
  CheckCheck,
  Copy,
  Check,
} from "lucide-react"
import { formatIndoPhoneWithPrefix } from "@/lib/utils"

// ─── Badge Status Booking ──────────────────────────────────────────────────
const BookingStatusBadge = ({ status }: { status: EventBookingClientApi["status"] }) => {
  const map = {
    CONFIRMED: { label: "Dikonfirmasi", cls: "bg-emerald-100 text-emerald-800", icon: <CheckCircle2 className="w-3 h-3" /> },
    PENDING: { label: "Menunggu", cls: "bg-amber-100 text-amber-800", icon: <Clock className="w-3 h-3" /> },
    CANCELLED: { label: "Dibatalkan", cls: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
    COMPLETED: { label: "Selesai", cls: "bg-blue-100 text-blue-800", icon: <CheckCheck className="w-3 h-3" /> },
  }
  const { label, cls, icon } = map[status] ?? map.PENDING
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}`}>
      {icon}
      {label}
    </span>
  )
}

// ─── Badge Status Pembayaran ───────────────────────────────────────────────
const PaymentStatusBadge = ({ status }: { status: string | undefined }) => {
  if (!status) return <span className="text-xs text-gray-400">-</span>
  const map: Record<string, { label: string; cls: string }> = {
    PAID: { label: "Lunas", cls: "bg-emerald-100 text-emerald-800" },
    PENDING: { label: "Belum Bayar", cls: "bg-amber-100 text-amber-800" },
    FAILED: { label: "Gagal", cls: "bg-red-100 text-red-800" },
    REFUNDED: { label: "Dikembalikan", cls: "bg-blue-100 text-blue-800" },
    EXPIRED: { label: "Kadaluarsa", cls: "bg-gray-100 text-gray-600" },
  }
  const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}`}>
      {label}
    </span>
  )
}

// ─── Komponen copy kode tiket ──────────────────────────────────────────────
function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-mono text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md transition-colors"
      title="Salin kode tiket"
    >
      <span>{code}</span>
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
    </button>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
interface Props {
  eventId: string
}

export default function AdminEventDetailClient({ eventId }: Props) {
  const router = useRouter()
  const [event, setEvent] = useState<AdminEventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<EventBookingClientApi[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await eventService.getById(eventId)
        if (res?.data) {
          setEvent(mapApiToAdminEvent(res.data))
        }
      } catch (err) {
        console.error("Gagal memuat event:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [eventId])

  // Load daftar peserta setelah event data ada
  useEffect(() => {
    if (!eventId) return
    const loadBookings = async () => {
      setBookingsLoading(true)
      try {
        const res = await eventService.getEventBookings(eventId)
        setBookings(res?.data ?? [])
      } catch (err) {
        console.error("Gagal memuat peserta event:", err)
        setBookings([])
      } finally {
        setBookingsLoading(false)
      }
    }
    loadBookings()
  }, [eventId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-poppins text-sm gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#561269]" />
        <span>Memuat detail event...</span>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 font-poppins">
        <p className="text-lg font-bold">Event tidak ditemukan di database.</p>
        <button
          onClick={() => router.push("/admin/event")}
          className="mt-4 text-sm text-[#561269] font-semibold hover:underline"
        >
          ← Kembali ke Kelola Event
        </button>
      </div>
    )
  }

  const handleMarkAsCompleted = async () => {
    if (!event) return
    const confirm = window.confirm(`Tandai event "${event.judul}" sebagai Selesai?`)
    if (!confirm) return
    try {
      await eventService.update(event.id, { status: "COMPLETED" })
      setEvent((prev) => (prev ? { ...prev, status: "Selesai" } : null))
      router.push("/admin/event?tab=selesai")
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui status event")
    }
  }

  // Hitung ringkasan pembayaran
  const totalPeserta = bookings.reduce((acc, b) => acc + (b.jumlah_peserta || 1), 0)
  const totalLunas = bookings.filter((b) => b.transaksi?.status_pembayaran === "PAID").length
  const totalBelumBayar = bookings.filter(
    (b) => !b.transaksi || b.transaksi.status_pembayaran !== "PAID"
  ).length

  return (
    <div className="flex flex-col gap-8 font-poppins pb-20 w-full max-w-6xl mx-auto">

      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/event")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#561269] font-semibold transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Event
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarkAsCompleted}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer ${
              event.status === "Selesai"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <CheckCheck className="h-4 w-4" />
            {event.status === "Selesai" ? "Sudah Selesai" : "Tandai Selesai"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/admin/event/edit/${event.id}`)}
            className="inline-flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-4 py-2 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
            Edit Event
          </button>
        </div>
      </div>

      {/* ── Info Card Event ──────────────────────────────────────────── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        {/* Banner penuh di atas */}
        {event.bannerUrl && (
          <div className="w-full h-52 sm:h-64 bg-gray-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.bannerUrl}
              alt={event.judul}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 flex flex-col gap-5">
          {/* Header: badge & status */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block rounded-xl bg-purple-100 px-3 py-1 text-xs font-bold text-[#561269]">
                {event.jenis}
              </span>
              <span
                className={`inline-block rounded-xl px-3 py-1 text-xs font-bold ${
                  event.tipe === "Offline"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {event.tipe}
              </span>
            </div>
            <AdminStatusBadge
              className="w-32"
              variant={
                event.status === "Dipublikasi"
                  ? "success"
                  : event.status === "Draft"
                  ? "warning"
                  : "danger"
              }
            >
              {event.status}
            </AdminStatusBadge>
          </div>

          {/* Judul */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
            {event.judul}
          </h1>

          {/* Deskripsi */}
          {event.deskripsi && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border-l-4 border-purple-100 pl-4">
              {event.deskripsi}
            </p>
          )}

          {/* Grid Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {[
              { label: "Pembicara", value: event.pembicara },
              { label: "Jadwal", value: `${event.tanggal} · ${event.waktu}` },
              {
                label: "Lokasi",
                value:
                  event.lokasi ||
                  (event.tipe === "Online" ? "Google Meet (Online)" : "Sesuai Pengumuman"),
              },
              { label: "Kuota Total", value: `${event.totalTiket} peserta` },
              {
                label: "Terdaftar",
                value: `${event.tiketTerjual} peserta`,
                highlight: true,
              },
              {
                label: "Harga Tiket",
                value:
                  event.harga && event.harga !== "0"
                    ? `Rp ${parseInt(event.harga, 10).toLocaleString("id-ID")}`
                    : "Gratis",
              },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className="flex flex-col gap-1 p-3 rounded-2xl bg-gray-50/80 border border-gray-100"
              >
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {label}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    highlight ? "text-[#561269]" : "text-gray-800"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Paket bundling */}
          {(event.paketBundling && event.paketBundling.length > 0) ||
          (event.hargaBundling && Number(event.hargaBundling) > 0) ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {event.paketBundling && event.paketBundling.length > 0 ? (
                event.paketBundling.map((pkg, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <span className="text-[11px] font-extrabold text-amber-900">
                      {pkg.nama_paket} ({pkg.kuota_tiket} Tiket)
                    </span>
                    <span className="text-xs font-extrabold text-[#561269]">
                      Rp {Number(pkg.harga_paket).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] font-extrabold text-amber-900">
                    {event.namaBundling || `Paket ${event.kuotaTiketBundling || 2} Tiket`}
                  </span>
                  <span className="text-xs font-extrabold text-[#561269]">
                    Rp {parseInt(event.hargaBundling!, 10).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {/* Link Meet & WA */}
          {(event.linkMeet || event.linkWa) && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
              {event.tipe === "Online" && event.linkMeet && (
                <a
                  href={event.linkMeet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition flex-1"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Link Google Meet</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {event.linkWa && (
                <a
                  href={event.linkWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition flex-1"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Grup WhatsApp</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Daftar Peserta ───────────────────────────────────────────── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5 text-[#561269]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Daftar Peserta</h2>
              <p className="text-xs text-gray-400">
                Client yang mendaftar event ini
              </p>
            </div>
          </div>

          {/* Summary pill */}
          {!bookingsLoading && bookings.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                <Ticket className="w-3 h-3" />
                {totalPeserta} tiket
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                {totalLunas} lunas
              </span>
              {totalBelumBayar > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <Clock className="w-3 h-3" />
                  {totalBelumBayar} belum bayar
                </span>
              )}
            </div>
          )}
        </div>

        {/* Konten tabel */}
        <div className="p-6 sm:p-8">
          {bookingsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#561269]" />
              <span className="text-xs">Memuat daftar peserta...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Users className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-500">Belum ada peserta yang mendaftar</p>
              <p className="text-xs text-gray-400">
                Peserta akan muncul di sini setelah mereka melakukan pendaftaran.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50/80 text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">Client</th>
                    <th className="py-3 px-4">Kontak</th>
                    <th className="py-3 px-4 text-center">Tiket</th>
                    <th className="py-3 px-4 text-center">Status Booking</th>
                    <th className="py-3 px-4 text-center">Status Bayar</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-purple-50/20 transition-colors group"
                    >
                      {/* Nama client */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-gray-800 text-sm group-hover:text-[#561269] transition-colors">
                            {b.client.nama}
                          </span>
                          <CopyableCode code={b.kode_tiket} />
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {b.client.no_telepon && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>{formatIndoPhoneWithPrefix(b.client.no_telepon)}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Jumlah tiket */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700">
                          <Ticket className="w-3.5 h-3.5 text-gray-400" />
                          {b.jumlah_peserta}
                        </span>
                      </td>

                      {/* Status booking */}
                      <td className="py-3.5 px-4 text-center">
                        <BookingStatusBadge status={b.status} />
                      </td>

                      {/* Status pembayaran */}
                      <td className="py-3.5 px-4 text-center">
                        <PaymentStatusBadge
                          status={b.transaksi?.status_pembayaran}
                        />
                        {b.transaksi?.tanggal_bayar && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(b.transaksi.tanggal_bayar).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Hubungi via WhatsApp */}
                          {b.client.wa_link ? (
                            <a
                              href={b.client.wa_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Hubungi via WhatsApp"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition-colors"
                            >
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                              WA
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300 px-2">-</span>
                          )}

                          {/* Email client */}
                          {b.client.no_telepon && !b.client.wa_link && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-400 text-[11px] font-medium">
                              <Phone className="w-3.5 h-3.5" />
                              Tidak ada WA
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
