"use client"

import { useRouter } from "next/navigation"
import { DUMMY_EVENTS } from "./AdminEventClient"

// Dummy data peserta per event
const DUMMY_PESERTA: Record<
  string,
  {
    no: number
    nama: string
    noWa: string
    email: string
    tanggalDaftar: string
    statusPembayaran: "Lunas" | "Menunggu" | "Gagal"
  }[]
> = {
  "1": [
    {
      no: 1,
      nama: "Budi Yono",
      noWa: "081313787509",
      email: "budiyono15@gmail.com",
      tanggalDaftar: "31 Sept 2026\n13:05",
      statusPembayaran: "Lunas",
    },
    {
      no: 2,
      nama: "Aurelia",
      noWa: "081313787509",
      email: "auurel5@gmail.com",
      tanggalDaftar: "31 Sept 2026\n13:50",
      statusPembayaran: "Lunas",
    },
  ],
  "2": [
    {
      no: 1,
      nama: "Rina Sari",
      noWa: "082211445566",
      email: "rinasari@gmail.com",
      tanggalDaftar: "10 Sept 2026\n09:00",
      statusPembayaran: "Lunas",
    },
    {
      no: 2,
      nama: "Dani Setiawan",
      noWa: "083322556677",
      email: "daniseti@gmail.com",
      tanggalDaftar: "10 Sept 2026\n10:30",
      statusPembayaran: "Menunggu",
    },
  ],
  "3": [],
  "4": [
    {
      no: 1,
      nama: "Mega Putri",
      noWa: "087700112233",
      email: "megaputri@gmail.com",
      tanggalDaftar: "14 Okt 2026\n08:45",
      statusPembayaran: "Lunas",
    },
  ],
}

const getStatusBadge = (status: "Lunas" | "Menunggu" | "Gagal") => {
  switch (status) {
    case "Lunas":
      return (
        <span className="inline-flex items-center justify-center rounded-xl bg-[#A2DCA4] px-4 py-1.5 text-xs font-semibold text-[#1C5E24]">
          Lunas
        </span>
      )
    case "Menunggu":
      return (
        <span className="inline-flex items-center justify-center rounded-xl bg-[#F0C94D] px-4 py-1.5 text-xs font-semibold text-[#5C4505]">
          Menunggu
        </span>
      )
    case "Gagal":
      return (
        <span className="inline-flex items-center justify-center rounded-xl bg-[#E85656] px-4 py-1.5 text-xs font-semibold text-white">
          Gagal
        </span>
      )
  }
}

interface Props {
  eventId: string
}

export default function AdminEventDetailClient({ eventId }: Props) {
  const router = useRouter()
  const event = DUMMY_EVENTS.find((e) => e.id === eventId)
  const pesertaList = DUMMY_PESERTA[eventId] ?? []

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 font-poppins">
        <p className="text-lg font-bold">Event tidak ditemukan.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-[#561269] font-semibold hover:underline"
        >
          ← Kembali
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* Kembali */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:text-[#561269] font-semibold w-fit transition-colors"
      >
        ← Kembali
      </button>

      {/* Judul */}
      <h2 className="text-2xl font-extrabold text-[#561269]">
        Daftar Peserta Event
      </h2>

      {/* Info Card Event */}
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Thumbnail */}
        <div className="h-20 w-24 shrink-0 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 opacity-40"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-base font-extrabold text-gray-900">{event.judul}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600 font-medium">
            {/* Tanggal */}
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-3.5 w-3.5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              {event.tanggal}
            </span>
            {/* Waktu */}
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-3.5 w-3.5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              {event.waktu} WIB
            </span>
            {/* Lokasi */}
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-3.5 w-3.5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              Jica FPMIPA UPI
            </span>
          </div>
          <div className="flex gap-4 text-xs font-medium text-gray-700 mt-1">
            <span>
              <span className="font-semibold text-gray-900">Kuota:</span>{" "}
              {event.totalTiket} peserta
            </span>
            <span>
              Terdaftar:{" "}
              <span className="font-bold text-gray-900">
                {pesertaList.length} peserta
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabel Peserta */}
      <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse text-xs sm:text-sm">
            {/* Head */}
            <thead>
              <tr className="bg-[#D3C4D8] text-gray-800 font-bold">
                <th className="py-4 px-5 w-12">No</th>
                <th className="py-4 px-4">Nama</th>
                <th className="py-4 px-4">No WhatsApp</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Tanggal Daftar</th>
                <th className="py-4 px-5 text-center">Status Pembayaran</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-200">
              {pesertaList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-14 text-center text-gray-400 font-medium"
                  >
                    Belum ada peserta terdaftar.
                  </td>
                </tr>
              ) : (
                pesertaList.map((peserta) => (
                  <tr
                    key={peserta.no}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    <td className="py-4 px-5 text-gray-600 font-medium">
                      {peserta.no}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      {peserta.nama}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{peserta.noWa}</td>
                    <td className="py-4 px-4 text-gray-700">{peserta.email}</td>
                    <td className="py-4 px-4 text-gray-600 whitespace-pre-line leading-snug">
                      {peserta.tanggalDaftar}
                    </td>
                    <td className="py-4 px-5 text-center">
                      {getStatusBadge(peserta.statusPembayaran)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
