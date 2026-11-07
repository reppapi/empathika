import React, { useState } from "react";
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  ColumnDef,
} from "@/components/shared/AdminDataTable";
import { ActionButtonDetail } from "@/components/shared/TableActionButtons";
import { Filter, MessageCircle } from "lucide-react";
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

  // Derivasi paketOptions jika tidak dipass dari parent
  const derivedPaketOptions =
    paketOptions.length > 0
      ? paketOptions
      : Array.from(new Set(pesertaList.map((p) => p.paket).filter(Boolean)));

  // Filter khusus peserta berbayar (non tamu anonim) & filter paket & pencarian
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

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      peserta.nama.toLowerCase().includes(q) ||
      (peserta.paket || "").toLowerCase().includes(q) ||
      (peserta.noHp || "").includes(q)
    );
  });

  const columns: ColumnDef<AdminPsikotesPeserta>[] = [
    {
      key: "peserta",
      header: "Nama Peserta",
      render: (peserta: AdminPsikotesPeserta) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900 leading-tight">
            {peserta.nama}
          </span>
          {peserta.usia ? (
            <span className="text-[11px] text-gray-500 font-medium mt-0.5">
              {peserta.usia} tahun{peserta.jenisKelamin ? ` • ${peserta.jenisKelamin}` : ""}
            </span>
          ) : null}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        {/* Dropdown Filter per Paket Psikotes */}
        <div className="relative w-full sm:w-64">
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

        {/* Kolom Pencarian Nama / No. WA */}
        <div className="w-full sm:w-64">
          <AdminSearchInput
            placeholder="Cari nama atau No. WA..."
            value={searchQuery}
            onChange={onSearchChange}
            className="!w-full lg:!w-full"
          />
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
