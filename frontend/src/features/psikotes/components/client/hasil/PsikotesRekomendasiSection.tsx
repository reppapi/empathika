/** Seksi rekomendasi paket psikotes lain yang ditampilkan di bawah halaman hasil tes. */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { ArrowRight } from "lucide-react";

interface PsikotesRekomendasiSectionProps {
  currentTestId: string;
}

export default function PsikotesRekomendasiSection({ currentTestId }: PsikotesRekomendasiSectionProps) {
  const [recommendations, setRecommendations] = useState<PaketPsikotesApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await psikotesService.getList({ status: "PUBLISHED" });
        if (res && res.success && Array.isArray(res.data)) {
          // Filter out current test
          const filtered = res.data.filter((item) => String(item.id) !== String(currentTestId));
          // Take top 2 items
          setRecommendations(filtered.slice(0, 2));
        }
      } catch (err) {
        console.error("Gagal mengambil rekomendasi psikotes dari server:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentTestId]);

  if (isLoading || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8 pt-12 border-t border-gray-200 print:hidden font-sans">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Rekomendasi Tes untuk Kamu
        </h2>
        <p className="text-sm text-gray-600">
          Kenali potensimu lebih dalam melalui pilihan asesmen psikologis resmi lainnya yang tersedia di Empathika.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
        {recommendations.map((pkg) => {
          const bannerImage =
            pkg.banner_url ||
            "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800";

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              {/* Foto Bersih (Tanpa Tulisan Apapun) */}
              <div className="h-44 w-full overflow-hidden relative bg-gray-100">
                <Image
                  src={bannerImage}
                  alt={pkg.judul}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>

              {/* Body Card */}
              <div className="p-6 flex flex-col flex-1 justify-between gap-6">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight line-clamp-2">
                    {pkg.judul}
                  </h3>
                  {/* Deskripsi di bawah judul diambil dari pkg.tentang_tes */}
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {pkg.tentang_tes ||
                      (() => {
                        if (process.env.NODE_ENV === "development") {
                          console.warn(`[DEV WARNING][Rekomendasi] 'tentang_tes' untuk paket '${pkg.id}' kosong di DB.`);
                        }
                        return "Ikuti asesmen psikologis terstandar ini untuk memahami kondisi dirimu secara lebih mendalam.";
                      })()}
                  </p>
                </div>

                <Link
                  href={`/psikotes/${pkg.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  <span>Ikuti Tes Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
