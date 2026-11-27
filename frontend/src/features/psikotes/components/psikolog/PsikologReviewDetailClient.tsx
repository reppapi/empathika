/** Komponen halaman penuh review & telaah klinis psikolog (Dedicated Full Page). */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { psikotesService, type ReviewPsikotesItem } from "@/services/psikotes.service";
import ModalReviewPsikotes from "./ModalReviewPsikotes";

interface PsikologReviewDetailClientProps {
  bookingId: string;
}

export default function PsikologReviewDetailClient({
  bookingId,
}: PsikologReviewDetailClientProps) {
  const router = useRouter();

  // 1. Ambil data awal langsung dari sessionStorage agar halaman tampil INSTAN (0 ms) tanpa menunggu loading
  const [item, setItem] = useState<ReviewPsikotesItem | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = sessionStorage.getItem(`empathika_active_review_${bookingId}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [fullDetail, setFullDetail] = useState<any>(null);
  // Jika item sudah ada dari cache, tidak perlu tampilkan loading spinner (langsung render editor)
  const [isLoading, setIsLoading] = useState(!item);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const hasInitialCache = Boolean(
      typeof window !== "undefined" && sessionStorage.getItem(`empathika_active_review_${bookingId}`)
    );
    if (!hasInitialCache) {
      setIsLoading(true);
    }
    setErrorMessage(null);

    psikotesService
      .getHasilByBooking(bookingId)
      .then((res) => {
        if (!isMounted) return;
        if (res?.data) {
          const d = res.data;
          setFullDetail(d);

          const mapped: ReviewPsikotesItem = {
            id: d.id_booking,
            id_paket: d.id_paket,
            id_psikolog: d.psikolog?.id || null,
            kode_akses: d.kode_akses,
            nama_paket: d.paket?.judul || "Asesmen Psikotes",
            jenis_akses: d.paket?.jenis_akses || "BERBAYAR",
            nama_peserta: d.peserta?.nama_lengkap || d.client?.nama || "Peserta Asesmen",
            no_hp: d.peserta?.no_telepon || d.client?.no_telepon || "-",
            usia: d.peserta?.usia ?? d.client?.usia ?? null,
            jenis_kelamin: d.peserta?.jenis_kelamin || d.client?.jenis_kelamin || null,
            tanggal_pengerjaan: d.hasil?.tanggal_selesai || "-",
            status_pengerjaan: d.status_pengerjaan as any,
            perlu_review_psikolog: true,
            catatan_psikolog: d.hasil?.catatan_psikolog || null,
            rekomendasi_psikolog: d.hasil?.rekomendasi_psikolog || null,
            file_laporan_url: (d as any).file_laporan_url || (d.hasil as any)?.file_laporan_url || null,
            tanggal_review: d.hasil?.tanggal_review,
            psikolog: d.psikolog ? { id: d.psikolog.id, nama: d.psikolog.nama_gelar } : null,
            total_skor: d.hasil?.total_skor,
            detail_skor: d.hasil?.detail_skor,
            is_claimed: Boolean(d.psikolog?.id),
          };

          setItem(mapped);
          try {
            if (d.hasil?.catatan_psikolog || (d as any).file_laporan_url || (d.hasil as any)?.file_laporan_url) {
              sessionStorage.setItem(`empathika_active_review_${bookingId}`, JSON.stringify(mapped));
            } else {
              sessionStorage.removeItem(`empathika_active_review_${bookingId}`);
            }
          } catch {}
        } else {
          setItem((prev) => {
            if (!prev) setErrorMessage("Data asesmen tidak ditemukan.");
            return prev;
          });
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setItem((prev) => {
          if (!prev) {
            console.error("Gagal memuat detail pengerjaan asesmen:", err);
            setErrorMessage(
              err?.response?.data?.message || err.message || "Gagal memuat data asesmen pasien."
            );
          }
          return prev;
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#F3F4F6] flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="flex items-center gap-2 mb-6 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-[#561269] text-white flex items-center justify-center text-sm font-extrabold shadow-sm">
            E
          </div>
          <span className="text-base font-extrabold tracking-wide text-[#561269] uppercase">
            EMPATHIKA CLINICAL STUDIO
          </span>
        </div>
        <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
        <p className="text-sm text-gray-800 font-bold">Menyiapkan Ruang Kerja Telaah Klinis...</p>
        <p className="text-xs text-gray-400 mt-1">Mengambil rekap lembar jawaban dan kalkulasi skor psikometri pasien</p>
      </div>
    );
  }

  if (errorMessage || !item) {
    return (
      <div className="h-screen w-screen bg-[#F3F4F6] flex flex-col items-center justify-center font-sans p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Gagal Membuka Lembar Telaah</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {errorMessage || "Data asesmen tidak dapat diakses atau sudah dipindahkan."}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push("/psikolog-web/review-asesmen")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Antrean</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModalReviewPsikotes
      item={item}
      initialDetail={fullDetail}
      isStandalonePage={true}
      onClose={() => router.push("/psikolog-web/review-asesmen")}
      onSuccess={(updatedItem) => {
        setItem(updatedItem);
        try {
          sessionStorage.setItem(`empathika_active_review_${bookingId}`, JSON.stringify(updatedItem));
        } catch {}
        // Hanya kembali ke daftar antrean jika telaah telah selesai diterbitkan
        if (updatedItem.status_pengerjaan === "SELESAI") {
          router.push("/psikolog-web/review-asesmen");
        }
      }}
    />
  );
}

