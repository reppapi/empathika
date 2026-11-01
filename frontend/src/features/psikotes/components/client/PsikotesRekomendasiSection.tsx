"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";

interface PsikotesRekomendasiSectionProps {
  currentTestId: string;
}

const THEME_COLORS = [
  { bg: "bg-[#561269]", text: "text-white", badge: "bg-white/20 text-white" },
  { bg: "bg-[#f48520]", text: "text-white", badge: "bg-white/20 text-white" },
  { bg: "bg-[#1c352d]", text: "text-white", badge: "bg-white/20 text-white" },
  { bg: "bg-[#0f766e]", text: "text-white", badge: "bg-white/20 text-white" },
];

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
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#561269] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Eksplorasi Asesmen Lainnya</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Rekomendasi Tes untuk Kamu
        </h2>
        <p className="text-sm text-gray-600">
          Kenali potensimu lebih dalam melalui pilihan asesmen psikologis resmi lainnya yang tersedia di Empathika.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
        {recommendations.map((pkg, idx) => {
          const theme = THEME_COLORS[idx % THEME_COLORS.length];
          const isGratis = pkg.jenis_akses === "GRATIS" || !pkg.harga || pkg.harga === 0;

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              <div className={`h-44 w-full ${theme.bg} overflow-hidden relative flex flex-col justify-between p-6`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${theme.badge}`}>
                    {isGratis ? "Gratis" : `Rp ${Number(pkg.harga).toLocaleString("id-ID")}`}
                  </span>
                  <BookOpen className="w-5 h-5 text-white/50" />
                </div>
                <div>
                  <h3 className={`${theme.text} font-bold text-xl leading-tight line-clamp-2 drop-shadow-xs`}>
                    {pkg.judul}
                  </h3>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between gap-6">
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {pkg.deskripsi || "Asesmen psikologi terstruktur untuk mengenali kepribadian dan potensi diri."}
                </p>

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
