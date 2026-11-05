import React from "react";
import {
  AdminDataTable,
  AdminSearchInput,
  AdminStatusBadge,
  ColumnDef,
} from "@/components/shared/AdminDataTable";
import {
  ActionButtonDetail,
  ActionButtonDelete,
} from "@/components/shared/TableActionButtons";
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
  const filteredJudul = judulList.filter((item) => {
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
            <span
              onClick={() => onSelectJudul(item)}
              className="font-extrabold text-gray-900 leading-tight hover:text-[#561269] transition-colors cursor-pointer"
            >
              {item.judul}
            </span>
            <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.deskripsi}</span>
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
          <div className="flex items-center gap-2">
            {gratis && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  gratis.status === "Aktif"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    gratis.status === "Aktif" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                Gratis
                {gratis.status === "Draf" && (
                  <span className="text-[10px] text-amber-600 font-medium">(Draf)</span>
                )}
              </span>
            )}
            {berbayar && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  berbayar.status === "Aktif"
                    ? "bg-purple-50 text-[#561269] border border-purple-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    berbayar.status === "Aktif" ? "bg-[#561269]" : "bg-amber-500"
                  }`}
                />
                Berbayar
                {berbayar.status === "Draf" && (
                  <span className="text-[10px] text-amber-600 font-medium">(Draf)</span>
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
        return (
          <div className="flex items-center justify-center gap-2">
            <ActionButtonDetail
              onClick={() => onSelectJudul(item)}
              title="Lihat Detail & Kelola Status"
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Daftar Paket Psikotes
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Seluruh instrumen asesmen yang tersedia di sistem Empathika.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <AdminSearchInput
            placeholder="Cari judul psikotes..."
            value={searchQuery}
            onChange={onSearchChange}
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
              className="px-4 py-2 rounded-xl bg-[#561269] text-white text-xs font-bold hover:bg-[#763E8B] transition shadow-xs cursor-pointer"
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
          isLoading={isLoading}
          loadingMessage="Memuat daftar paket psikotes..."
          emptyMessage="Tidak ada paket psikotes yang ditemukan. Pastikan seeder database telah dijalankan."
        />
      )}
    </div>
  );
}
