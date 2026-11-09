import { PsikologUI } from '@/types/psikolog';
import { DATA_PSIKOLOG_DUMMY } from '../dummy';

export interface DetailPsikologUI extends PsikologUI {
  profilLengkap: string[];
  keahlian: string[];
  pendidikan?: string[];
  pendekatanTerapi?: string[];
  videoIntroUrl?: string;       // URL video perkenalan
  videoThumbnail?: string;      // Thumbnail video
  videoDuration?: string;       // Durasi video
  jadwalAssociate?: {
    tipe: string;
    waktu: string;
  }[];
  testimoni: {
    kutipan: string;
    pemberi: string;
  }[];
}

export const DETAIL_PSIKOLOG_DUMMY: Record<string, DetailPsikologUI> = {};

export function getDetailPsikolog(id: string): DetailPsikologUI | null {
  if (DETAIL_PSIKOLOG_DUMMY[id]) {
    return DETAIL_PSIKOLOG_DUMMY[id];
  }

  const basePsikolog = DATA_PSIKOLOG_DUMMY.find((p) => p.id === id);
  if (!basePsikolog) return null;

  return {
    ...basePsikolog,
    profilLengkap: [
      basePsikolog.bio || 'Konselor dan tenaga ahli profesional di Empathika yang berfokus mendampingi pemulihan serta pertumbuhan mental klien.',
      'Hadir dengan pendekatan empatik dan bebas stigma untuk membantu menemukan jalan keluar terbaik.'
    ],
    keahlian: basePsikolog.keahlian || [
      'Hubungan Interpersonal',
      'Pengembangan Diri & Self-Esteem',
      'Manajemen Emosi & Stres',
      'Quarter Life Crisis'
    ],
    pendidikan: basePsikolog.pendidikanText ? [basePsikolog.pendidikanText] : ['Pendidikan Profesi Psikologi / Konseling'],
    testimoni: [
      {
        kutipan: `Sesi konseling bersama ${basePsikolog.nama_gelar} sangat nyaman, terarah, dan memberikan solusi yang nyata.`,
        pemberi: 'Klien Empathika'
      }
    ]
  };
}
