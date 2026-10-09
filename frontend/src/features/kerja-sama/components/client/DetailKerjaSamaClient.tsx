import React from 'react';
import Link from 'next/link';

// Mock data untuk konten tiap kategori
const categoryData: Record<string, { title: string }> = {
  'mahasiswa': { title: 'Empathika untuk Mahasiswa' },
  'sekolah': { title: 'Empathika untuk Sekolah' },
  'komunitas': { title: 'Empathika untuk Komunitas' },
  'perusahaan': { title: 'Empathika untuk Perusahaan' },
  'pemerintah': { title: 'Empathika untuk Pemerintah' },
  'rumah-sakit': { title: 'Empathika untuk Rumah Sakit' },
};

interface DetailKerjaSamaClientProps {
  category: string;
}

export default function DetailKerjaSamaClient({ category }: DetailKerjaSamaClientProps) {
  const data = categoryData[category] || { title: 'Kerja Sama Empathika' };

  return (
    <div className="w-full min-h-screen bg-[#fbfbfb] font-sans pb-20 pt-32 lg:pt-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col gap-6">
          
          {/* Elegant & Clean Title Section */}
          <div className="flex flex-col items-center justify-center mb-2 mt-4">
            <h1 className="text-3xl md:text-5xl font-black text-[#561269] text-center tracking-tight leading-tight">
              {data.title}
            </h1>
            <div className="w-12 h-1.5 bg-[#561269] rounded-full mt-6 opacity-90"></div>
          </div>
          
          <p className="text-gray-800 text-sm md:text-base leading-relaxed text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          
          <h2 className="text-xl md:text-2xl font-bold text-[#561269] text-center mt-4">
            Jenis Kolaborasi
          </h2>
          
          <div>
            <h3 className="text-lg font-semibold text-[#561269] mb-3">Pelatihan {data.title.replace('Empathika untuk ', '')}</h3>
            <div className="w-full h-48 md:h-80 bg-gray-300 mb-4 rounded-xl shadow-sm border border-gray-100"></div>
            <p className="text-gray-800 text-sm md:text-base leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-[#561269] text-center mt-6">
            Kemitraan Kami Sebelumnya
          </h2>
          
          <div>
            <h3 className="text-lg font-semibold text-[#561269] mb-3">Empathika x Unibi misalnya</h3>
            <div className="w-full h-48 md:h-80 bg-gray-300 mb-4 rounded-xl shadow-sm border border-gray-100"></div>
            <p className="text-gray-800 text-sm md:text-base leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          
          <hr className="my-6 border-gray-200" />
          
          <p className="text-gray-800 text-sm md:text-base leading-relaxed">
            Silakan hubungi contact person Empathika atau isi formulir tertera untuk mengajukan ide kolaborasimu. Bersama Empathika, mari ciptakan masyarakat yang dapat
          </p>

          <div className="mt-2">
            <h4 className="text-[#561269] font-bold mb-2">KONTAK KAMI:</h4>
            <ul className="text-sm md:text-base text-gray-800 space-y-1">
              <li>Email:</li>
              <li>Whatsapp:</li>
              <li>Formulir In House Training:</li>
              <li>Formulir Kerjasama Asesmen dan Tes Psikologi:</li>
              <li>Formulir Kerjasama Lainnya:</li>
              <li>Formulir Affiliate: (Langsung ke WA)</li>
            </ul>
          </div>
          
        </div>

      </div>
    </div>
  );
}
