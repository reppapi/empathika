/** Tab tabel data peserta psikotes berbayar beserta filter paket, pencarian, dan aksi detail. */
import React, { useState } from "react";
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  ColumnDef,
} from "@/components/shared/AdminDataTable";
import { ActionButtonDetail } from "@/components/shared/TableActionButtons";
import { Filter, MessageCircle, Download, Calendar } from "lucide-react";
import type { AdminPsikotesPeserta } from "../../types/adminPsikotes";

export interface TabPesertaPsikotesProps {
  pesertaList: AdminPsikotesPeserta[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedPaket?: string;
  onSelectPaketChange?: (val: string) => void;
  paketOptions?: string[];
  isLoading: boolean;
  onSelectPeserta: (peserta: AdminPsikotesPeserta) => void;
}

export default function TabPesertaPsikotes({
  pesertaList,
  searchQuery,
  onSearchChange,
  selectedPaket: externalSelectedPaket,
  onSelectPaketChange: externalOnSelectPaketChange,
  paketOptions = [],
  isLoading,
  onSelectPeserta,
}: TabPesertaPsikotesProps) {
  // Local state jika prop eksternal tidak dipass
  const [localSelectedPaket, setLocalSelectedPaket] = useState<string>("ALL");
  const selectedPaket = externalSelectedPaket !== undefined ? externalSelectedPaket : localSelectedPaket;
  const handlePaketChange = externalOnSelectPaketChange || setLocalSelectedPaket;

  // State filter rentang tanggal
  const [selectedTimeRange, setSelectedTimeRange] = useState<"ALL" | "TODAY" | "7DAYS" | "30DAYS">("ALL");

  // Derivasi paketOptions jika tidak dipass dari parent
  const derivedPaketOptions =
    paketOptions.length > 0
      ? paketOptions
      : Array.from(new Set(pesertaList.map((p) => p.paket).filter(Boolean)));

  // Filter khusus peserta berbayar (non tamu anonim) & filter paket & tanggal & pencarian
  const filteredPeserta = pesertaList.filter((peserta) => {
    const isBerbayar = peserta.jenisAkses === "Berbayar" && peserta.nama !== "Tamu Anonim";
    if (!isBerbayar) return false;

    // Filter berdasarkan paket psikotes
    if (selectedPaket && selectedPaket !== "ALL") {
      const pNama = (peserta.paket || "").toLowerCase().trim();
      const target = selectedPaket.toLowerCase().trim();
      if (!pNama.includes(target) && !target.includes(pNama)) {
        return false;
      }
    }

    // Filter berdasarkan rentang tanggal
    if (selectedTimeRange !== "ALL") {
      const dateVal = peserta.rawTanggal || peserta.tanggal;
      const parsedTime = new Date(dateVal).getTime();
      if (!isNaN(parsedTime)) {
        const now = Date.now();
        const diffDays = (now - parsedTime) / (1000 * 60 * 60 * 24);
        if (selectedTimeRange === "TODAY") {
          const pDate = new Date(dateVal);
          const nowDate = new Date();
          const isSameDay =
            pDate.getDate() === nowDate.getDate() &&
            pDate.getMonth() === nowDate.getMonth() &&
            pDate.getFullYear() === nowDate.getFullYear();
          if (!isSameDay) return false;
        } else if (selectedTimeRange === "7DAYS") {
          if (diffDays > 7.5 || diffDays < -0.5) return false;
        } else if (selectedTimeRange === "30DAYS") {
          if (diffDays > 30.5 || diffDays < -0.5) return false;
        }
      }
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      peserta.nama.toLowerCase().includes(q) ||
      (peserta.paket || "").toLowerCase().includes(q) ||
      (peserta.noHp || "").includes(q)
    );
  });

  // Handler Export Data Peserta ke CSV
  const handleExportCsv = () => {
    if (filteredPeserta.length === 0) return;

    const headers = [
      "No",
      "Nama Peserta",
      "Kontak WhatsApp",
      "Paket Psikotes",
      "Tanggal Asesmen",
      "Status",
      "Hasil / Grade",
      "Total Skor",
      "Usia",
      "Jenis Kelamin",
      "Tempat, Tanggal Lahir",
      "Status Pernikahan",
      "Pendidikan",
      "Pekerjaan",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredPeserta.map((p, idx) => [
      idx + 1,
      escapeCsv(p.nama),
      escapeCsv(p.noHp ? `'${p.noHp}` : "—"),
      escapeCsv(p.paket),
      escapeCsv(p.tanggal),
      escapeCsv(p.status),
      escapeCsv(p.hasil?.grade || p.skor || "—"),
      escapeCsv(p.totalSkor ?? "—"),
      escapeCsv(p.usia ? `${p.usia} th` : "—"),
      escapeCsv(p.jenisKelamin || p.peserta?.jenis_kelamin || "—"),
      escapeCsv(
        [
          p.peserta?.tempat_lahir,
          p.peserta?.tanggal_lahir
            ? new Date(p.peserta.tanggal_lahir).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null,
        ]
          .filter(Boolean)
          .join(", ") || "—"
      ),
      escapeCsv(p.peserta?.status_pernikahan || "—"),
      escapeCsv(p.peserta?.pendidikan || "—"),
      escapeCsv(p.peserta?.pekerjaan || "—"),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Peserta_Psikotes_Empathika_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<AdminPsikotesPeserta>[] = [
    {
      key: "peserta",
      header: "Nama Peserta",
      render: (peserta: AdminPsikotesPeserta) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900 leading-tight">
            {peserta.nama}
          </span>
          <div className="flex flex-wrap items-center gap-1 text-[11px] text-gray-500 font-medium mt-0.5">
            {peserta.usia ? <span>{peserta.usia} tahun</span> : null}
            {peserta.jenisKelamin ? <span>• {peserta.jenisKelamin}</span> : null}
            {peserta.peserta?.status_pernikahan ? <span>• {peserta.peserta.status_pernikahan}</span> : null}
          </div>
        </div>
      ),
    },
    {
      key: "kontak",
      header: "Kontak WhatsApp",
      render: (peserta: AdminPsikotesPeserta) => {
        if (!peserta.noHp || peserta.noHp === "—") {
          return <span className="text-gray-400 italic text-xs">—</span>;
        }
        return (
          <a
            href={`https://wa.me/${peserta.noHp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition font-semibold text-xs"
            title="Hubungi via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{peserta.noHp}</span>
          </a>
        );
      },
    },
    {
      key: "paket",
      header: "Paket Tes",
      render: (peserta: AdminPsikotesPeserta) => (
        <span className="font-semibold text-gray-800">{peserta.paket}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (peserta: AdminPsikotesPeserta) => {
        const isSelesai = peserta.status === "Selesai";
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isSelesai
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSelesai ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            {isSelesai ? "Selesai" : "Berjalan"}
          </span>
        );
      },
    },
    {
      key: "tanggal",
      header: "Tanggal",
      render: (peserta: AdminPsikotesPeserta) => (
        <span className="text-gray-600 font-medium text-xs sm:text-sm">
          {peserta.tanggal}
        </span>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (peserta: AdminPsikotesPeserta) => (
        <div className="flex items-center justify-center">
          <ActionButtonDetail
            onClick={() => onSelectPeserta(peserta)}
            title="Lihat Detail Peserta"
          />
        </div>
      ),
    },
  ];

  return (
    <AdminTableContainer>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
          {/* Dropdown Filter per Paket Psikotes */}
          <div className="relative w-full sm:w-56">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <select
              value={selectedPaket}
              onChange={(e) => handlePaketChange(e.target.value)}
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] transition shadow-2xs cursor-pointer truncate"
            >
              <option value="ALL">Semua Paket Psikotes</option>
              {derivedPaketOptions.map((pkt) => (
                <option key={pkt} value={pkt}>
                  {pkt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Filter Rentang Tanggal */}
          <div className="relative w-full sm:w-44">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] transition shadow-2xs cursor-pointer truncate"
            >
              <option value="ALL">Semua Waktu</option>
              <option value="TODAY">Hari Ini</option>
              <option value="7DAYS">7 Hari Terakhir</option>
              <option value="30DAYS">30 Hari Terakhir</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          {/* Kolom Pencarian Nama / No. WA */}
          <div className="w-full sm:w-64">
            <AdminSearchInput
              placeholder="Cari nama atau No. WA..."
              value={searchQuery}
              onChange={onSearchChange}
              className="!w-full lg:!w-full"
            />
          </div>

          {/* Tombol Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredPeserta.length === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm transition-all shadow-2xs shrink-0 cursor-pointer ${
              filteredPeserta.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300"
            }`}
            title="Export data peserta ke file Excel / CSV"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={filteredPeserta}
        keyExtractor={(item) => String(item.id)}
        emptyMessage={
          isLoading
            ? "Memuat data peserta..."
            : "Belum ada peserta psikotes berbayar yang terdaftar."
        }
      />
    </AdminTableContainer>
  );
}
