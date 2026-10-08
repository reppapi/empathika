import DashboardAdmin from "@/features/dashboard/admin/DashboardAdmin"

export default function AdminDashboardPage() {
  return <DashboardAdmin />
import { Calendar, ArrowUp, ChevronDown } from "lucide-react"

export default function AdminDashboardPage() {
  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 font-poppins pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Selamat Pagi, Admin!</h1>
          <p className="text-gray-600 mt-1">Berikut adalah ringkasan aktivitas layanan Empathika hari ini.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition-colors">
          <Calendar className="w-4 h-4" />
          {currentDate}
        </button>
      </div>

      {/* Main Revenue Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden w-full md:w-1/3 relative lg:w-[400px]">
        <div className="h-3 w-full bg-[#5D205E]"></div>
        <div className="p-6">
          <p className="text-xs font-semibold text-gray-500 mb-2">Total Pendapatan Bulan Ini:</p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Rp. 12.500.000</h2>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative">
          <div className="h-2 w-full bg-[#5D205E]"></div>
          <div className="p-6 flex flex-col gap-1.5">
            <p className="text-xs font-bold text-gray-900">Total Klien Hari Ini</p>
            <h3 className="text-4xl font-bold text-gray-900 mt-1">1</h3>
            <p className="text-[11px] text-green-600 flex items-center gap-1 mt-1 font-semibold">
              <ArrowUp className="w-3 h-3" strokeWidth={3} />
              +4 % dari kemarin
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative">
          <div className="h-2 w-full bg-[#5D205E]"></div>
          <div className="p-6 flex flex-col gap-1.5">
            <p className="text-xs font-bold text-gray-900">Sesi Selesai</p>
            <h3 className="text-4xl font-bold text-gray-900 mt-1">1</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative">
          <div className="h-2 w-full bg-[#5D205E]"></div>
          <div className="p-6 flex flex-col gap-1.5">
            <p className="text-xs font-bold text-gray-900">Pendaftar Baru Workhsop</p>
            <h3 className="text-4xl font-bold text-gray-900 mt-1">1</h3>
            <p className="text-[11px] text-green-600 flex items-center gap-1 mt-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
              5 Pendaftar Baru
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative">
          <div className="h-2 w-full bg-[#5D205E]"></div>
          <div className="p-6 flex flex-col gap-1.5">
            <p className="text-xs font-bold text-gray-900">Menunggu Pembayaran</p>
            <h3 className="text-4xl font-bold text-gray-900 mt-1">1</h3>
          </div>
        </div>
      </div>

      {/* Bottom Layout: Chart & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-gray-900 text-lg">Grafik Reservasi Sesi (6 Hari)</h3>
            <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Minggu Ini
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 flex items-end justify-between px-2 sm:px-4 gap-4 h-[250px] relative">
            {[
              { day: 'Sen', value: 3, height: '40%' },
              { day: 'Sel', value: 9, height: '90%' },
              { day: 'Rab', value: 2, height: '20%' },
              { day: 'Kam', value: 6, height: '60%' },
              { day: 'Jum', value: 5, height: '50%' },
              { day: 'Sab', value: 7, height: '70%' },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center w-full group relative h-full justify-end">
                <span className="text-gray-700 font-semibold mb-2 text-lg">{item.value}</span>
                <div 
                  className="w-full max-w-[70px] bg-[#BFA3C5] rounded-t-md transition-all duration-300 hover:bg-[#a686ad]" 
                  style={{ height: item.height }}
                ></div>
                <span className="text-xs font-medium text-gray-700 mt-4 absolute -bottom-8 left-0 sm:left-4">{item.day}</span>
              </div>
            ))}
          </div>
          <div className="h-10"></div> {/* Spacer for x-axis labels */}
        </div>

        {/* Agenda */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 flex flex-col lg:h-[420px]">
          <h3 className="font-bold text-gray-900 mb-6 text-lg shrink-0">Agenda & Peringatan</h3>
          <div className="flex flex-col gap-2 overflow-y-auto pr-2 pb-2">
            {[
              { title: "Workshop SEFT Batch 4", type: "Event", time: "Besok, 10:00 WIB", color: "bg-[#5D205E]" },
              { title: "Konseling: Bpk. Andi", type: "Konseling", time: "Besok, 13:00 WIB", color: "bg-[#BFA3C5]" },
              { title: "Batas Pembayaran Klien", type: "Peringatan", time: "Hari Ini, 15:00", color: "bg-red-500" },
              { title: "Webinar Mental Health", type: "Event", time: "Kamis, 19:00", color: "bg-[#5D205E]" },
              { title: "Konseling: Ibu Sarah", type: "Konseling", time: "Jumat, 09:00 WIB", color: "bg-[#BFA3C5]" },
              { title: "Rapat Internal Tim", type: "Internal", time: "Jumat, 14:00 WIB", color: "bg-gray-500" },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-3 border border-transparent border-b-gray-100 last:border-b-transparent shrink-0 group hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${item.color} shrink-0`}></div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.type}</span>
                    <span className="text-[11px] font-semibold text-[#5D205E] bg-[#F9F5FA] px-2 py-0.5 rounded-full">{item.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 leading-snug mt-0.5">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
