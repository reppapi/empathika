"use client"

import { useState, useRef, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { psikologService } from "@/services/psikolog.service"

const AGENDA_HARI_INI = [
  {
    id: "a1",
    waktuMulai: "08:00",
    waktuSelesai: "09:00",
    metode: "Offline",
    namaKlien: "Karen Sya",
    keluhan: '"Stress terhadap pekerjaan yang gaada beresnya"',
    layanan: "Konseling Pribadi",
  },
  {
    id: "a2",
    waktuMulai: "09:00",
    waktuSelesai: "10:00",
    metode: "Offline",
    namaKlien: "Karen Sya",
    keluhan: '"Stress terhadap pekerjaan yang gaada beresnya"',
    layanan: "Konseling Pribadi",
  },
]

const AGENDA_BERIKUTNYA = [
  {
    tanggal: "03-09-2026",
    sesi: [
      {
        id: "b1",
        waktuMulai: "08:00",
        waktuSelesai: "09:00",
        metode: "Online",
        namaKlien: "Karen Sya",
        keluhan: '"Stress terhadap pekerjaan yang gaada beresnya"',
        layanan: "Konseling Pribadi",
      },
    ],
  },
  {
    tanggal: "05-09-2026",
    sesi: [
      {
        id: "b2",
        waktuMulai: "13:00",
        waktuSelesai: "14:00",
        metode: "Offline",
        namaKlien: "Karen Sya",
        keluhan: '"Stress terhadap pekerjaan yang gaada beresnya"',
        layanan: "Konseling Pribadi",
      },
    ],
  },
]

function SesiCard({ waktuMulai, waktuSelesai, metode, namaKlien, keluhan, layanan }: {
  waktuMulai: string
  waktuSelesai: string
  metode: string
  namaKlien: string
  keluhan: string
  layanan: string
}) {
  return (
    <div className="relative flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 pl-5 overflow-hidden">
      {/* Garis ungu kiri */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#561269]" />

      {/* Baris Waktu + Metode */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
        <span>{waktuMulai} - {waktuSelesai}</span>
        <span>{metode}</span>
      </div>

      {/* Nama Klien */}
      <p className="text-lg font-bold text-gray-900 leading-tight">{namaKlien}</p>

      {/* Keluhan italic */}
      <p className="text-xs italic text-gray-500">{keluhan}</p>

      {/* Garis pemisah */}
      <div className="h-[1px] w-full bg-gray-100 mt-1" />

      {/* Layanan */}
      <p className="text-xs italic text-gray-500 text-right">{layanan}</p>
    </div>
  )
}

export default function PsikologBerandaClient() {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [selectedDate, setSelectedDate] = useState("2026-09-01")

  const { user } = useAuthStore()
  const [psikologName, setPsikologName] = useState<string>("Psikolog Empathika")

  useEffect(() => {
    const resolveName = () => {
      const savedName = localStorage.getItem("active_psikolog_name")
      if (savedName) {
        setPsikologName(savedName)
        return
      }

      if (user?.name) {
        setPsikologName(user.name)
        return
      }

      const savedId = localStorage.getItem("active_psikolog_id") || user?.id
      psikologService
        .getList()
        .then((list: any[]) => {
          if (list && list.length > 0) {
            const matched =
              (savedId ? list.find((p) => p.id === savedId || p.account?.id === savedId) : null) ||
              list.find((p) => p.nama_gelar?.includes("Rizki") || p.account?.email?.includes("putriqoida")) ||
              list[0]

            if (matched) {
              const name = matched.nama_gelar || matched.account?.nama || "Psikolog Empathika"
              setPsikologName(name)
              localStorage.setItem("active_psikolog_id", matched.id)
              localStorage.setItem("active_psikolog_name", name)
            }
          }
        })
        .catch(() => {})
    }

    resolveName()

    window.addEventListener("storage", resolveName)
    return () => window.removeEventListener("storage", resolveName)
  }, [user])

  const displayDate = selectedDate
    ? selectedDate.split("-").reverse().join("/")
    : ""

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">

      {/* ── Header: Date Picker + Profil + Total Sesi ── */}
      <div className="flex flex-col gap-3">

        {/* Date picker pojok kanan */}
        <div className="flex justify-end">
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-10 text-xs font-semibold text-gray-700 hover:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <button
              type="button"
              onClick={() => {
                try { dateInputRef.current?.showPicker?.() }
                catch { dateInputRef.current?.focus() }
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#561269] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profil + Card Total Sesi */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#561269]">Selamat Datang!</p>
            <h2 suppressHydrationWarning className="text-2xl font-bold text-gray-900 mt-0.5">
              {psikologName}
            </h2>
          </div>

          {/* Card kecil Total Sesi Hari Ini */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#561269] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-gray-500 font-medium">Total Sesi Hari Ini</span>
              <span className="text-xl font-extrabold text-gray-900">12</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Judul Daftar Klien ── */}
      <h3 className="text-base font-bold text-[#561269] -mb-2">Daftar Klien</h3>

      {/* ── Agenda Hari Ini ── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-gray-700">Agenda Hari Ini</h4>
        {AGENDA_HARI_INI.map((sesi) => (
          <SesiCard key={sesi.id} {...sesi} />
        ))}
      </div>

      {/* ── Agenda Berikutnya ── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-gray-700">Agenda Berikutnya</h4>
        {AGENDA_BERIKUTNYA.map((grup) => (
          <div key={grup.tanggal} className="flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-500">{grup.tanggal}</p>
            {grup.sesi.map((sesi) => (
              <SesiCard key={sesi.id} {...sesi} />
            ))}
          </div>
        ))}
      </div>

    </div>
  )
}
