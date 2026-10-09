"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Plus, 
  Clock, 
  Users, 
  CheckCircle2, 
  CalendarClock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Circle
} from "lucide-react"

export default function JadwalAdmin() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("13:00 - 14:00")
  
  const today = new Date()
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

  // Data dinamis untuk 6 hari ke depan (tabel mingguan)
  const daysMap = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const upcomingDays = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      dayName: daysMap[d.getDay()],
      dateStr: `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}`
    };
  });
  const weekRangeTitle = `${upcomingDays[0].dateStr.split(' ')[0]} - ${upcomingDays[5].dateStr} ${today.getFullYear()}`;

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 font-poppins pb-10">

      {/* Top Actions & Filters */}
      <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3 border-t border-gray-200 pt-6">
        <button className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Semua Layanan
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>
        <button className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          {formattedDate}
          <CalendarIcon className="w-4 h-4 ml-1" />
        </button>
        <button className="flex items-center gap-2 bg-[#561269] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-[#430b53] transition-colors">
          <Plus className="w-4 h-4" />
          Sesi Baru
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Total Sesi hari ini</p>
            <p className="text-xl font-bold text-gray-900">12</p>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Sedang Berlangsung</p>
            <p className="text-xl font-bold text-gray-900">1</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Sesi Selesai</p>
            <p className="text-xl font-bold text-gray-900">4</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Menunggu Jadwal</p>
            <p className="text-xl font-bold text-gray-900">7</p>
          </div>
        </div>
      </div>

      {/* Sesi Client Table */}
      <div className="mt-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Sesi Client</h2>
        <p className="text-sm text-gray-500 mb-4">Daftar jadwal sesi klien yang akan datang (mulai hari ini dan seterusnya).</p>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#D9C6DF] text-[#561269] text-sm shadow-[0_1px_0_0_#e5e7eb]">
                  <th className="py-4 px-6 font-semibold min-w-[140px]">Waktu & Tanggal</th>
                  <th className="py-4 px-6 font-semibold">Nama Klien</th>
                  <th className="py-4 px-6 font-semibold">Psikolog</th>
                  <th className="py-4 px-6 font-semibold">Layanan</th>
                  <th className="py-4 px-6 font-semibold">Tipe & Status</th>
                  <th className="py-4 px-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Row 1 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">13:00 - 14:00</p>
                    <p className="text-xs text-gray-500 mt-0.5">Kamis, 7 Sep 2026</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">Karenn Sya</p>
                    <p className="text-xs text-gray-500 mt-0.5">ID: 010198</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">Dr. Dimas</td>
                  <td className="py-4 px-6 text-gray-700 capitalize">psikolog</td>
                  <td className="py-4 px-6">
                    <p className="text-gray-900 font-medium mb-1">Online [Zoom]</p>
                    <span className="inline-block bg-red-100 text-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Sedang Berlangsung
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="text-gray-400 hover:text-gray-700 p-1">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                
                {/* Row 2 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">10:00 - 11:00</p>
                    <p className="text-xs text-gray-500 mt-0.5">Kamis, 7 Sep 2026</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">Karenn Sya</p>
                    <p className="text-xs text-gray-500 mt-0.5">ID: 010198</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">Dr. Dimas</td>
                  <td className="py-4 px-6 text-gray-700 capitalize">konselor</td>
                  <td className="py-4 px-6">
                    <p className="text-gray-900 font-medium mb-1">Online [Zoom]</p>
                    <span className="inline-block bg-green-100 text-green-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Selesai
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="text-gray-400 hover:text-gray-700 p-1">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">13:00 - 14:00</p>
                    <p className="text-xs text-gray-500 mt-0.5">Jumat, 8 Sep 2026</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">Karenn Sya</p>
                    <p className="text-xs text-gray-500 mt-0.5">ID: 010198</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">Dr. Dimas</td>
                  <td className="py-4 px-6 text-gray-700 capitalize">peer konselor</td>
                  <td className="py-4 px-6">
                    <p className="text-gray-900 font-medium mb-1">Online [Zoom]</p>
                    <span className="inline-block bg-yellow-100 text-yellow-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Menunggu Jadwal
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="text-gray-400 hover:text-gray-700 p-1">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">13:00 - 14:00</p>
                    <p className="text-xs text-gray-500 mt-0.5">Jumat, 8 Sep 2026</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">Karenn Sya</p>
                    <p className="text-xs text-gray-500 mt-0.5">ID: 010198</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">Dr. Dimas</td>
                  <td className="py-4 px-6 text-gray-700 capitalize">home visit</td>
                  <td className="py-4 px-6">
                    <p className="text-gray-900 font-medium mb-1">Offline [Klinik]</p>
                    <span className="inline-block bg-red-100 text-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Sedang Berlangsung
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="text-gray-400 hover:text-gray-700 p-1">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Jadwal Asesmen (Calendar + Time Slots) */}
      <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Asesmen</h2>
        <p className="text-gray-500 text-sm mb-8">Atur jadwal Asesmen, Pilih tanggal dan waktu yang tersedia.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 max-w-4xl">
          {/* Left: Date Picker Box */}
          <div className="border border-purple-200 rounded-2xl p-6 shadow-sm flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full max-w-[320px]"
            />
          </div>

          {/* Right: Time Slots Box */}
          <div className="border border-purple-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-gray-900 mb-6 capitalize">Kamis, 4 Agustus 2026</h3>
            
            <div className="flex flex-col gap-3 flex-1">
              {[
                "09:00 - 10:00",
                "10:00 - 11:00",
                "13:00 - 14:00",
                "14:30 - 15:30",
                "15:30 - 16:00",
              ].map((time, i) => {
                const isActive = selectedTime === time;
                return (
                  <button 
                    key={i} 
                    onClick={() => setSelectedTime(time)}
                    className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors w-full text-left ${isActive ? 'border-[#561269] bg-purple-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isActive ? 'border-[#561269]' : 'border-gray-300'}`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-[#561269]" />}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{time}</span>
                  </button>
                );
              })}
            </div>

            <button className="w-full mt-6 bg-gray-200 text-gray-500 font-bold py-3.5 rounded-xl hover:bg-gray-300 transition-colors">
              Pilih Jadwal ini
            </button>
          </div>
        </div>
      </div>

      {/* Jadwal Asesmen Mingguan */}
      <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Asesmen Mingguan</h2>
        <p className="text-gray-500 text-sm mb-6">Lihat ringkasan jadwal asesmen disini</p>

        <div className="flex items-center gap-4 mb-6">
          <button className="text-gray-400 hover:text-[#561269]"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-bold text-gray-900">{weekRangeTitle}</span>
          <button className="text-gray-400 hover:text-[#561269]"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full min-w-[800px] text-center table-fixed border-collapse">
            <thead>
              <tr>
                {upcomingDays.map((d, i) => (
                  <th key={i} className="border-b border-r last:border-r-0 border-gray-200 py-4 font-semibold text-gray-800 text-sm whitespace-pre-line">
                    {d.dayName}{'\n'}{d.dateStr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Senin */}
                <td className="border-r border-gray-200 align-top p-2 h-64">
                  <div className="flex flex-col gap-2">
                    {/* Tersedia */}
                    <div className="flex flex-col items-center border border-gray-200 rounded-lg py-2 gap-1 text-xs font-medium text-gray-600 bg-white">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full border border-gray-400"></span>
                        09:00 - 10:00
                      </div>
                    </div>
                    {/* Booked */}
                    <div className="flex flex-col items-start bg-[#E8F3ED] rounded-lg p-3 text-left">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        <span className="text-xs font-bold text-gray-900">10:30 - 11:30</span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-700 leading-tight">Konseling<br/>[Online]</p>
                    </div>
                  </div>
                </td>
                
                {/* Selasa */}
                <td className="border-r border-gray-200 align-top p-2">
                  <div className="flex flex-col gap-2 mt-16">
                    {/* Booked */}
                    <div className="flex flex-col items-start bg-[#E8F3ED] rounded-lg p-3 text-left">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        <span className="text-xs font-bold text-gray-900">13:00 - 14:00</span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-700 leading-tight">Home Visit<br/>[Offline]</p>
                    </div>
                  </div>
                </td>
                
                {/* Rabu - Sabtu */}
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 ml-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600"></span>
            <span className="text-sm font-semibold text-gray-700">Sudah Dibooking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-gray-400 bg-gray-100"></span>
            <span className="text-sm font-semibold text-gray-700">Tersedia</span>
          </div>
        </div>
      </div>

    </div>
  )
}
