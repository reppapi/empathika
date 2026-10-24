"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getKerjaSamaItems, getKerjaSamaConfig, getCleanWhatsAppNumber, INITIAL_KERJASAMA_ITEMS, INITIAL_KERJASAMA_CONFIG } from '../../data/initialData';
import { KerjaSamaItem, KerjaSamaPageConfig } from '../../types';
import { kerjaSamaService } from '@/services/kerja-sama.service';

interface DetailKerjaSamaClientProps {
  category: string;
}

export default function DetailKerjaSamaClient({ category }: DetailKerjaSamaClientProps) {
  const [items, setItems] = useState<KerjaSamaItem[]>(INITIAL_KERJASAMA_ITEMS);
  const [config, setConfig] = useState<KerjaSamaPageConfig>(INITIAL_KERJASAMA_CONFIG);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setItems(getKerjaSamaItems());
    setConfig(getKerjaSamaConfig());

    kerjaSamaService
      .getProgramList()
      .then((res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: KerjaSamaItem[] = res.data.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            shortName: p.short_name,
            description: p.deskripsi,
            pelatihanTitle: p.pelatihan_title || "",
            pelatihanDeskripsi: p.pelatihan_deskripsi || "",
            pelatihanImage: p.pelatihan_image || "",
            mitraTitle: p.mitra_title || "",
            mitraDeskripsi: p.mitra_deskripsi || "",
            mitraImage: p.mitra_image || "",
            color: p.warna_tema || "from-purple-500 to-indigo-600",
            status: p.status === "NONAKTIF" ? "NONAKTIF" : "AKTIF",
            urutan: p.urutan || 1,
          }));
          setItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const activeItems = isMounted ? items : INITIAL_KERJASAMA_ITEMS;
  const currentConfig = isMounted ? config : INITIAL_KERJASAMA_CONFIG;

  // Temukan item berdasarkan slug category (misal: "mahasiswa", "sekolah", dll.)
  const item = activeItems.find((it) => it.slug === category);

  // Jika item di-nonaktifkan atau tidak ditemukan, kita tampilkan fallback title
  const title = item ? item.title : `Empathika untuk ${category}`;
  const shortTitle = item?.shortName || title.replace('Empathika untuk ', '');
  const description = item?.description || "Empathika membuka ruang sinergi dan kolaborasi profesional untuk menciptakan dampak nyata bagi kesehatan psikologis.";
  const pelatihanTitle = item?.pelatihanTitle || `Pelatihan ${shortTitle}`;
  const pelatihanDeskripsi = item?.pelatihanDeskripsi || "Membekali peserta dengan keterampilan kesehatan mental, resiliensi, dan pendampingan psikologis terstruktur.";
  const pelatihanImage = item?.pelatihanImage;
  const mitraTitle = item?.mitraTitle || "Empathika x Mitra";
  const mitraDeskripsi = item?.mitraDeskripsi || "Sinergi berkelanjutan untuk mendukung ekosistem kesehatan mental dan program komprehensif.";
  const mitraImage = item?.mitraImage;

  return (
    <div className="w-full min-h-screen bg-[#fbfbfb] font-sans pb-20 pt-32 lg:pt-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col gap-6">
          
          {/* Elegant & Clean Title Section with Gradient Accent */}
          <div className="flex flex-col items-center justify-center mb-2 mt-4 text-center">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              <span className="text-[#561269]">Empathika untuk </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#561269] via-[#8e4a9e] to-[#ba68c8]">
                {shortTitle}
              </span>
            </h1>
            <div className="w-16 h-1.5 bg-gradient-to-r from-[#561269] via-[#8e4a9e] to-[#ba68c8] rounded-full mt-5"></div>
          </div>
          
          <p className="text-gray-800 text-sm md:text-base leading-relaxed text-center">
            {description}
          </p>
          
          <h2 className="text-xl md:text-2xl font-bold text-[#561269] text-center mt-4">
            Jenis Kolaborasi
          </h2>
          
          <div>
            <h3 className="text-lg font-semibold text-[#561269] mb-3">{pelatihanTitle}</h3>
            {pelatihanImage ? (
              <div className="w-full h-48 md:h-80 mb-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden bg-gray-100">
                <img
                  src={pelatihanImage}
                  alt={pelatihanTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 md:h-80 bg-gray-300 mb-4 rounded-xl shadow-sm border border-gray-100"></div>
            )}
            <p className="text-gray-800 text-sm md:text-base leading-relaxed">
              {pelatihanDeskripsi}
            </p>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-[#561269] text-center mt-6">
            Kemitraan Kami Sebelumnya
          </h2>
          
          <div>
            <h3 className="text-lg font-semibold text-[#561269] mb-3">{mitraTitle}</h3>
            {mitraImage ? (
              <div className="w-full h-48 md:h-80 mb-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden bg-gray-100">
                <img
                  src={mitraImage}
                  alt={mitraTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 md:h-80 bg-gray-300 mb-4 rounded-xl shadow-sm border border-gray-100"></div>
            )}
            <p className="text-gray-800 text-sm md:text-base leading-relaxed">
              {mitraDeskripsi}
            </p>
          </div>
          
          <hr className="my-6 border-gray-200" />
          
          <p className="text-gray-800 text-sm md:text-base leading-relaxed">
            Silakan hubungi contact person Empathika atau isi formulir tertera untuk mengajukan ide kolaborasimu. Bersama Empathika, mari ciptakan masyarakat yang dapat
          </p>

          <div className="mt-2">
            <h4 className="text-[#561269] font-bold mb-2">KONTAK KAMI:</h4>
            <ul className="text-sm md:text-base text-gray-800 space-y-1.5">
              <li>
                Email:{" "}
                <a
                  href={`mailto:${currentConfig.kontak?.email || "partnership@empathika.com"}`}
                  className="text-[#561269] hover:underline font-medium"
                >
                  {currentConfig.kontak?.email || "partnership@empathika.com"}
                </a>
              </li>
              <li>
                Whatsapp:{" "}
                <a
                  href={`https://wa.me/${getCleanWhatsAppNumber(currentConfig.kontak?.whatsapp)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#561269] hover:underline font-medium"
                >
                  {currentConfig.kontak?.whatsapp && !currentConfig.kontak.whatsapp.includes("821-2345")
                    ? currentConfig.kontak.whatsapp
                    : "+62 878-7878-5498"}
                </a>
              </li>
              <li>
                <Link href="/kerja-sama/formulir/in-house-training" className="hover:text-[#561269] hover:underline group inline-flex items-center gap-1">
                  <span>Formulir In House Training:</span>
                  <span className="text-[#561269] underline font-medium">Isi Formulir</span>
                </Link>
              </li>
              <li>
                <Link href="/kerja-sama/formulir/asesmen" className="hover:text-[#561269] hover:underline group inline-flex items-center gap-1">
                  <span>Formulir Kerjasama Asesmen dan Tes Psikologi:</span>
                  <span className="text-[#561269] underline font-medium">Isi Formulir</span>
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${getCleanWhatsAppNumber(currentConfig.kontak?.whatsapp)}?text=${encodeURIComponent(
                    "Halo Tim Partnership Empathika, saya tertarik untuk bermitra dan berdiskusi seputar Program Affiliate Empathika."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#561269] hover:underline group inline-flex items-center gap-1"
                >
                  <span>Affiliate: (Langsung Hubungi Kontak WhatsApp)</span>
                  <span className="text-emerald-700 font-semibold underline inline-flex items-center gap-0.5">
                    Chat WhatsApp ↗
                  </span>
                </a>
              </li>
              <li>
                <Link href="/kerja-sama/formulir/lainnya" className="hover:text-[#561269] hover:underline group inline-flex items-center gap-1">
                  <span>Formulir Kerjasama Lainnya:</span>
                  <span className="text-[#561269] underline font-medium">Isi Formulir</span>
                </Link>
              </li>
            </ul>
          </div>
          
        </div>

      </div>
    </div>
  );
}
