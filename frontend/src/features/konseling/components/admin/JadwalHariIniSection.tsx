"use client"

import { ClientSessionToday } from "@/features/konseling/types"
import { getWhatsAppUrl, getWhatsAppPsikologUrl } from "@/features/konseling/data/jadwalAdminData"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import {
  Clock,
  CheckCircle2,
  MoreVertical,
  Eye,
  MessageCircle,
  ExternalLink,
  Copy,
} from "lucide-react"

interface JadwalHariIniSectionProps {
  filteredTodaySessions: ClientSessionToday[]
  todaySessionsCount: number
  nearestSession: ClientSessionToday | null
  selectedLayanan: string
  formattedDate: string
  activeMenuId: string | null
  setActiveMenuId: (id: string | null) => void
  onSelectDetail: (session: ClientSessionToday) => void
  onMarkCompleted: (id: string, namaKlien: string) => void
  onCopyWhatsApp: (session: ClientSessionToday) => void
  onCopyWhatsAppPsikolog?: (session: ClientSessionToday) => void
  onResetFilter: () => void
}

export default function JadwalHariIniSection({
  filteredTodaySessions,
  todaySessionsCount,
  nearestSession,
  selectedLayanan,
  formattedDate,
  activeMenuId,
  setActiveMenuId,
  onSelectDetail,
  onMarkCompleted,
  onCopyWhatsApp,
  onCopyWhatsAppPsikolog,
  onResetFilter,
}: JadwalHariIniSectionProps) {
  return (
    <div className="mt-4 flex flex-col gap-4 font-poppins">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">Sesi Klien Hari Ini</h2>
          <p className="text-sm text-gray-500">
            Jadwal sesi klien dalam satu hari, diutamakan waktu terdekat yang akan datang.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-[#561269] text-xs font-semibold self-start sm:self-auto shadow-xs">
          <Clock className="w-3.5 h-3.5" />
          Hari Ini • {formattedDate}
        </span>
      </div>

      {/* Card Highlight: Sesi Terdekat Berikutnya */}
      {nearestSession ? (
        <div className="bg-gradient-to-r from-purple-50 via-[#FAF4FC] to-purple-50 border-2 border-[#561269]/30 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#561269] text-white flex items-center justify-center shrink-0 shadow-md">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#561269] text-white text-[10px] font-bold uppercase tracking-wider">
                  Sesi Terdekat Berikutnya
                </span>
                <span className="text-xs font-bold text-purple-900">
                  {nearestSession.waktu}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-1">
                {nearestSession.namaKlien}{" "}
                <span className="text-xs font-normal text-gray-500">(ID: {nearestSession.klienId})</span>
              </h3>
              <p className="text-xs text-gray-600">
                {nearestSession.layanan} • {nearestSession.psikolog} •{" "}
                <span className="font-semibold text-[#561269]">{nearestSession.tipe}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <AdminStatusBadge
              variant={
                nearestSession.status === "Selesai"
                  ? "success"
                  : nearestSession.status === "Segera Dimulai"
                  ? "info"
                  : nearestSession.status === "Sedang Berlangsung"
                  ? "danger"
                  : nearestSession.status === "Dibatalkan"
                  ? "neutral"
                  : "warning"
              }
              className="w-44"
            >
              {nearestSession.status}
            </AdminStatusBadge>
            <button
              type="button"
              onClick={() => onSelectDetail(nearestSession)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-200 text-[#561269] hover:bg-purple-100/60 transition cursor-pointer"
            >
              Detail
            </button>
            {nearestSession.kontak && (
              <div className="flex items-center gap-1.5">
                <a
                  href={getWhatsAppUrl(nearestSession)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center gap-1.5 transition shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                  title="Hubungi klien via WhatsApp dengan rincian jadwal"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat WA</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
                <button
                  type="button"
                  onClick={() => onCopyWhatsApp(nearestSession)}
                  className="p-1.5 rounded-lg border border-purple-200 text-gray-600 hover:text-[#561269] hover:bg-purple-100/60 transition cursor-pointer"
                  title="Salin Pesan WA"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Semua sesi klien untuk hari ini telah selesai atau belum ada jadwal mendesak lainnya.</span>
        </div>
      )}

      {/* Tabel Sesi Klien dalam Satu Hari */}
      <div
        className={`overflow-x-auto rounded-2xl border border-gray-200/80 bg-white admin-table-scrollbar ${
          todaySessionsCount > 7 ? "max-h-[480px] overflow-y-auto" : ""
        }`}
      >
        <table className="w-full text-left border-collapse min-w-[880px]">
          <thead className="sticky top-0 z-10 bg-[#D3C4D8]">
            <tr className="bg-[#D3C4D8] text-gray-800 text-xs sm:text-sm font-bold">
              <th className="py-4 px-6 font-bold min-w-[140px] sticky top-0 bg-[#D3C4D8] z-10">Waktu Sesi</th>
              <th className="py-4 px-6 font-bold min-w-[130px] sticky top-0 bg-[#D3C4D8] z-10">Nama Klien</th>
              <th className="py-4 px-6 font-bold min-w-[160px] sticky top-0 bg-[#D3C4D8] z-10">Psikolog</th>
              <th className="py-4 px-6 font-bold min-w-[170px] sticky top-0 bg-[#D3C4D8] z-10">Layanan</th>
              <th className="py-4 px-6 font-bold min-w-[180px] sticky top-0 bg-[#D3C4D8] z-10">Tipe & Status</th>
              <th className="py-4 px-4 font-bold text-center sticky top-0 bg-[#D3C4D8] z-10 w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
            {filteredTodaySessions.length > 0 ? (
              filteredTodaySessions.map((item, index) => {
                const isNearest = nearestSession?.id === item.id
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isNearest ? "bg-purple-50/60 hover:bg-purple-50/90" : "hover:bg-purple-50/40"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {isNearest && (
                          <span className="w-2 h-2 rounded-full bg-[#561269] animate-ping" />
                        )}
                        <p className={`font-bold ${isNearest ? "text-[#561269]" : "text-gray-900"}`}>
                          {item.waktu}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Hari Ini</p>
                    </td>
                    <td className="py-4 px-6 min-w-[130px]">
                      <p className="font-extrabold text-gray-900 whitespace-nowrap">{item.namaKlien}</p>
                      <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">ID: {item.klienId}</p>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-700 min-w-[160px]">
                      <div className="flex flex-col gap-1 items-start">
                        <span>{item.psikolog}</span>
                        {item.status !== "Selesai" && item.status !== "Dibatalkan" && (
                          <a
                            href={getWhatsAppPsikologUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#25D366] hover:bg-[#20ba5a] px-2 py-0.5 rounded-md transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap mt-0.5"
                            title={`Chat WhatsApp ke ${item.psikolog}`}
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>Chat WA</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 capitalize font-medium min-w-[170px]">
                      {(() => {
                        const match = item.layanan.match(/^(.+?)\s+(.+?\([^)]+\))$/)
                        if (match) {
                          return (
                            <div className="flex flex-col leading-snug">
                              <span>{match[1]}</span>
                              <span className="whitespace-nowrap">{match[2]}</span>
                            </div>
                          )
                        }
                        return <span className="leading-snug">{item.layanan.replace(/\s+(\([^)]+\))/g, "\u00A0$1")}</span>
                      })()}
                    </td>
                    <td className="py-4 px-6 min-w-[180px]">
                      <p className="text-gray-900 font-medium mb-1">{item.tipe}</p>
                      <AdminStatusBadge
                        variant={
                          item.status === "Selesai"
                            ? "success"
                            : item.status === "Segera Dimulai"
                            ? "info"
                            : item.status === "Sedang Berlangsung"
                            ? "danger"
                            : item.status === "Dibatalkan"
                            ? "neutral"
                            : "warning"
                        }
                        className="w-44"
                      >
                        {item.status}
                      </AdminStatusBadge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#561269] hover:bg-purple-100/60 transition-colors cursor-pointer"
                          title="Pilihan Aksi"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeMenuId === item.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div
                              className={`absolute right-0 w-52 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-40 text-left transition-all ${
                                index >= filteredTodaySessions.length - 2 ? "bottom-full mb-2" : "top-full mt-2"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectDetail(item)
                                  setActiveMenuId(null)
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#561269] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-purple-600 shrink-0" />
                                Lihat Detail
                              </button>

                              {item.kontak && item.status !== "Selesai" && item.status !== "Dibatalkan" && (
                                <>
                                  <a
                                    href={getWhatsAppUrl(item)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActiveMenuId(null)}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                                    <span>Chat WA Klien</span>
                                    <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onCopyWhatsApp(item)
                                      setActiveMenuId(null)
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <Copy className="w-4 h-4 text-gray-500 shrink-0" />
                                    <span>Salin Pesan WA Klien</span>
                                  </button>
                                </>
                              )}

                              {item.status !== "Selesai" && item.status !== "Dibatalkan" && (
                                <>
                                  <a
                                    href={getWhatsAppPsikologUrl(item)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActiveMenuId(null)}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[#561269] hover:bg-purple-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <MessageCircle className="w-4 h-4 text-[#561269] shrink-0" />
                                    <span>Ingatkan Psikolog (WA)</span>
                                    <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                                  </a>
                                  {onCopyWhatsAppPsikolog && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onCopyWhatsAppPsikolog(item)
                                        setActiveMenuId(null)
                                      }}
                                      className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <Copy className="w-4 h-4 text-gray-500 shrink-0" />
                                      <span>Salin Pengingat Psikolog</span>
                                    </button>
                                  )}
                                </>
                              )}

                              {item.status !== "Selesai" && item.status !== "Dibatalkan" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onMarkCompleted(item.id, item.namaKlien)
                                    setActiveMenuId(null)
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  Tandai Selesai
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <p className="text-sm font-semibold text-gray-600">
                    Tidak ada jadwal sesi hari ini untuk layanan &quot;{selectedLayanan}&quot;.
                  </p>
                  {selectedLayanan !== "Semua Layanan" && (
                    <button
                      type="button"
                      onClick={onResetFilter}
                      className="mt-3 inline-flex items-center text-xs text-[#561269] font-bold hover:underline cursor-pointer"
                    >
                      Tampilkan semua layanan
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
