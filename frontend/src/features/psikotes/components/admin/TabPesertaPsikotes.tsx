import React from "react";
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  ColumnDef,
} from "@/components/shared/AdminDataTable";
import { ActionButtonDetail } from "@/components/shared/TableActionButtons";
import type { AdminPsikotesPeserta } from "../../types/adminPsikotes";

export interface TabPesertaPsikotesProps {
  pesertaList: AdminPsikotesPeserta[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  isLoading: boolean;
  onSelectPeserta: (peserta: AdminPsikotesPeserta) => void;
}

export default function TabPesertaPsikotes({
  pesertaList,
  searchQuery,
  onSearchChange,
  isLoading,
  onSelectPeserta,
}: TabPesertaPsikotesProps) {
  // Filter khusus peserta berbayar (non tamu anonim) & pencarian
  const filteredPeserta = pesertaList.filter((peserta) => {
    const isBerbayar = peserta.jenisAkses === "Berbayar" && peserta.nama !== "Tamu Anonim";
    if (!isBerbayar) return false;
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
        <span className="font-extrabold text-gray-900 leading-tight block">
          {peserta.nama}
        </span>
      ),
    },
    {
      key: "kontak",
      header: "Kontak",
      render: (peserta: AdminPsikotesPeserta) => {
        if (!peserta.noHp || peserta.noHp === "—") {
          return <span className="text-gray-400 italic text-xs">—</span>;
        }
        return (
          <a
            href={`https://wa.me/${peserta.noHp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold text-xs sm:text-sm"
          >
            {peserta.noHp}
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
      key: "skor",
      header: "Hasil Asesmen",
      render: (peserta: AdminPsikotesPeserta) => {
        if (peserta.status === "Berjalan" || !peserta.skor || peserta.skor === "—") {
          return (
            <span className="text-xs font-medium text-gray-400 italic">
              — (Sedang dikerjakan)
            </span>
          );
        }
        return (
          <span className="text-xs font-bold text-[#561269] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            {peserta.skor}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Daftar Klien Psikotes Berbayar
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftar klien yang menyelesaikan asesmen berbayar beserta kontak WhatsApp untuk ditindaklanjuti.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <AdminSearchInput
            placeholder="Cari nama peserta atau paket..."
            value={searchQuery}
            onChange={onSearchChange}
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
