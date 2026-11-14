/** Tab tabel daftar instrumen dan paket tes psikotes beserta filter, pencarian, dan hapus paket. */
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  AdminStatusBadge,
  ColumnDef,
} from "@/components/shared/AdminDataTable";
import {
  ActionButtonDetail,
  ActionButtonDelete,
} from "@/components/shared/TableActionButtons";
import { Filter } from "lucide-react";
import type { JudulPsikotesItem } from "../../types/adminPsikotes";

export interface TabPaketPsikotesProps {
  judulList: JudulPsikotesItem[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSelectJudul: (judul: JudulPsikotesItem) => void;
  onDeleteJudul: (judul: JudulPsikotesItem) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export default function TabPaketPsikotes({
  judulList,
  searchQuery,
  onSearchChange,
  onSelectJudul,
  onDeleteJudul,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: TabPaketPsikotesProps) {
  const router = useRouter();
  const [selectedJenisAkses, setSelectedJenisAkses] = useState<"ALL" | "GRATIS" | "BERBAYAR">("ALL");

  const filteredJudul = judulList.filter((item) => {
    // Filter Jenis Akses (Semua, Gratis, Berbayar)
    if (selectedJenisAkses === "GRATIS") {
      const hasGratis = item.paketList.some((p) => p.jenisAkses === "Gratis");
      if (!hasGratis) return false;
    } else if (selectedJenisAkses === "BERBAYAR") {
      const hasBerbayar = item.paketList.some((p) => p.jenisAkses === "Berbayar");
      if (!hasBerbayar) return false;
    }

    // Filter Kata Kunci Pencarian
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.judul.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q) ||
      item.deskripsi.toLowerCase().includes(q)
    );
  });

  const columns: ColumnDef<JudulPsikotesItem>[] = [
    {
      key: "judul",
      header: "Judul Psikotes",
      render: (item: JudulPsikotesItem) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-gray-200/90 shadow-inner flex items-center justify-center">
            <img src={item.image} alt={item.judul} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col">
            <Link
              href={`/admin/psikotes/${item.paketList[0]?.id || item.id}`}
              className="font-extrabold text-gray-900 leading-tight hover:text-[#561269] transition-colors cursor-pointer"
            >
              {item.judul}
            </Link>
          </div>
        </div>
      ),
    },
    {
      key: "paketTersedia",
      header: "Paket & Akses",
      render: (item: JudulPsikotesItem) => {
        const gratis = item.paketList.find((p) => p.jenisAkses === "Gratis");
        const berbayar = item.paketList.find((p) => p.jenisAkses === "Berbayar");

        return (
          <div className="flex items-center gap-2 text-xs">
            {gratis && (
              <span className="font-semibold text-gray-700">
                Gratis
                {gratis.status === "Draf" && (
                  <span className="text-[10px] text-amber-600 font-medium ml-1">(Draf)</span>
                )}
              </span>
            )}
            {gratis && berbayar && <span className="text-gray-300">•</span>}
            {berbayar && (
              <span className="font-semibold text-[#561269]">
                Berbayar
                {berbayar.status === "Draf" && (
                  <span className="text-[10px] text-amber-600 font-medium ml-1">(Draf)</span>
                )}
              </span>
            )}
            {!gratis && !berbayar && (
              <span className="text-xs text-gray-400 italic">Belum ada paket</span>
            )}
          </div>
        );
      },
    },
    {
      key: "harga",
      header: "Harga",
      render: (item: JudulPsikotesItem) => {
        const berbayar = item.paketList.find((p) => p.jenisAkses === "Berbayar");
        if (berbayar && berbayar.harga) {
          return (
            <span className="text-sm font-semibold text-gray-900">
              {berbayar.harga}
            </span>
          );
        }
        return <span className="text-sm text-gray-400 font-medium">—</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (item: JudulPsikotesItem) => {
        const hasDraft = item.paketList.some((p) => p.status === "Draf");
        const hasAktif = item.paketList.some((p) => p.status === "Aktif");

        if (hasDraft && hasAktif) {
          return (
            <AdminStatusBadge variant="warning" className="w-32">
              Aktif &amp; Draf
            </AdminStatusBadge>
          );
        }
        if (hasDraft) {
          return (
            <AdminStatusBadge variant="warning" className="w-28">
              Draf (Nonaktif)
            </AdminStatusBadge>
          );
        }
        return (
          <AdminStatusBadge variant="success" className="w-28">
            Dipublikasi
          </AdminStatusBadge>
        );
      },
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (item: JudulPsikotesItem) => {
        const targetId = item.paketList[0]?.id || item.id;
        return (
          <div
            className="flex items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionButtonDetail
              href={`/admin/psikotes/${targetId}`}
              title="Buka Halaman Detail Paket"
            />
            <ActionButtonDelete
              onClick={() => onDeleteJudul(item)}
              title="Hapus Judul"
            />
          </div>
        );
      },
    },
  ];

  return (
    <AdminTableContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        {/* Dropdown Filter Akses Paket (Persis gaya filter di Peserta) */}
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <select
            value={selectedJenisAkses}
            onChange={(e) => setSelectedJenisAkses(e.target.value as "ALL" | "GRATIS" | "BERBAYAR")}
            className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] transition shadow-2xs cursor-pointer truncate"
          >
            <option value="ALL">Semua Akses Paket</option>
            <option value="GRATIS">Paket Gratis</option>
            <option value="BERBAYAR">Paket Berbayar</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Kolom Pencarian */}
        <div className="w-full sm:w-64">
          <AdminSearchInput
            placeholder="Cari judul psikotes..."
            value={searchQuery}
            onChange={onSearchChange}
            className="!w-full lg:!w-full"
          />
        </div>
      </div>

      {errorMessage ? (
        <div className="p-8 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-3">
          <p className="text-sm text-amber-800 font-medium">{errorMessage}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-5 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              Coba Muat Ulang
            </button>
          )}
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={filteredJudul}
          keyExtractor={(item) => String(item.id)}
          onRowClick={(item) => {
            const targetId = item.paketList[0]?.id || item.id;
            router.push(`/admin/psikotes/${targetId}`);
          }}
          isLoading={isLoading}
          loadingMessage="Memuat daftar paket psikotes..."
          emptyMessage="Tidak ada paket psikotes yang ditemukan. Pastikan seeder database telah dijalankan."
        />
      )}
    </AdminTableContainer>
  );
}
