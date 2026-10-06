import { getDetailPsikolog } from '@/features/psikolog/data/detailDummy';
import { DetailPsikologContent } from '@/features/psikolog/components/DetailPsikologContent';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  const psikolog = getDetailPsikolog(id);

  if (!psikolog) {
    return {
      title: 'Psikolog Tidak Ditemukan - Empathika',
    };
  }

  return {
    title: `${psikolog.nama_gelar} - Profil Psikolog Empathika`,
    description: psikolog.bio || `Profil dan keahlian ${psikolog.nama_gelar} di Empathika.`,
  };
}

export default function DetailPsikologPage({ params }: PageProps) {
  const { id } = params;
  
  // Ambil data berdasarkan ID melalui helper getDetailPsikolog (fallback aman)
  const psikolog = getDetailPsikolog(id);

  if (!psikolog) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-purple-100 text-[#502380] rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
          ?
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profil Psikolog Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6 text-sm max-w-md">
          Maaf, data psikolog atau konselor yang Anda cari tidak tersedia atau ID tidak valid.
        </p>
        <Link 
          href="/psikolog"
          className="bg-[#502380] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3d1a63] transition-colors shadow-sm"
        >
          Kembali ke Daftar Psikolog
        </Link>
      </div>
    );
  }

  return <DetailPsikologContent psikolog={psikolog} />;
}