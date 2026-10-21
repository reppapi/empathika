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

export const DETAIL_PSIKOLOG_DUMMY: Record<string, DetailPsikologUI> = {
  '1': {
    id: '1',
    id_spesialisasi: 'spec-4',
    nama_gelar: 'Rizki Putri Dzulqaidah, S.Psi.',
    email: 'putriqoida@empathika.com',
    no_str: null,
    no_sipp: null,
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    videoIntroUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Demo video perkenalan
    videoThumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    videoDuration: '01:30',
    bio: 'Konselor yang memiliki ketertarikan pada bidang kesehatan mental dan pendampingan individu. Saya meyakini bahwa didengarkan dan dipahami merupakan bagian penting dari proses pemulihan dan pertumbuhan diri.',
    quote: 'Setiap manusia adalah cerita yang sedang bertumbuh, layak didengar, dihargai, dan ditemani.',
    instagram: '@putriqoida',
    jenisKelamin: 'Perempuan',
    pendidikanText: 'UIN Sunan Gunung Djati Bandung',
    status: 'ACTIVE',
    jumlah_sesi: 0,
    tarif_per_jam: 120000,
    spesialisasi: { id: 'spec-4', nama: 'Konselor Kesehatan Mental' },
    category: 'konselor',
    experienceYears: '2 - 4 Tahun',
    labelJadwal: 'Jadwal Konsultasi',
    jadwalTersedia: [],
    jadwalAssociate: [],
    profilLengkap: [
      "Konselor yang memiliki ketertarikan pada bidang kesehatan mental dan pendampingan individu. Saya meyakini bahwa didengarkan dan dipahami merupakan bagian penting dari proses pemulihan dan pertumbuhan diri.",
      "Saya hadir untuk menemani setiap individu dalam perjalanan mengenali diri dan menemukan kekuatan dalam dirinya."
    ],
    keahlian: [
      "Hubungan",
      "Romantis",
      "Keluarga",
      "Self-Confidence",
      "Pengembangan Diri",
      "Quarter Life Crisis"
    ],
    pendidikan: [
      "Sarjana Psikologi (S.Psi.) - UIN Sunan Gunung Djati Bandung"
    ],
    pendekatanTerapi: [
      "Person-Centered Counseling",
      "Cognitive & Behavioral Exploration",
      "Empathetic Listening"
    ],
    testimoni: [
      {
        kutipan: "Sesi konseling bersama Kak Putri sangat menenangkan. Beliau mendengarkan dengan penuh penerimaan tanpa menghakimi, sehingga saya bisa memahami emosi saya dengan lebih jernih.",
        pemberi: "Klien Empathika (23 Tahun)"
      }
    ]
  },
  '2': {
    id: '2',
    id_spesialisasi: 'spec-2',
    nama_gelar: 'Galuh Kikiany S., M.Psi., Psikolog',
    email: 'galuh@empathika.com',
    no_str: '190252132-0987654',
    no_sipp: '0823-21-2-1',
    foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    videoIntroUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800',
    videoDuration: '01:45',
    bio: 'Fokus pada konseling hubungan romantis, bimbingan pranikah, dan dinamika keharmonisan keluarga.',
    quote: 'Komunikasi yang sehat dan rasa saling menghargai adalah pondasi utama dari setiap hubungan yang kokoh.',
    instagram: '@galuhkikiany',
    jenisKelamin: 'Perempuan',
    pendidikanText: 'Universitas Gadjah Mada',
    status: 'ACTIVE',
    jumlah_sesi: 0,
    tarif_per_jam: 200000,
    spesialisasi: { id: 'spec-2', nama: 'Psikolog Keluarga & Pasangan' },
    category: 'psikolog',
    experienceYears: '5 - 10 Tahun',
    labelJadwal: 'Jadwal Konsultasi',
    jadwalTersedia: [],
    jadwalAssociate: [],
    profilLengkap: [
      "Galuh Kikiany S., M.Psi., Psikolog merupakan praktisi psikologi keluarga dengan pengalaman lebih dari 7 tahun mendampingi pasangan, suami istri, serta anggota keluarga dalam merajut komunikasi yang sehat dan meredakan ketegangan konflik relasi.",
      "Beliau meyakini bahwa setiap hubungan memiliki dinamika unik. Pendekatan konseling yang diterapkan menekankan empati dua arah, resolusi damai, dan kesepakatan bersama yang konstruktif untuk jangka panjang."
    ],
    keahlian: [
      "Konseling Pra-nikah",
      "Mediasi Konflik Pasangan",
      "Dinamika & Pengasuhan Keluarga",
      "Pemulihan Kepercayaan & Komunikasi Relasi"
    ],
    pendidikan: [
      "Magister Profesi Psikologi - Universitas Gadjah Mada"
    ],
    pendekatanTerapi: [
      "Emotion-Focused Therapy (EFT)",
      "Systemic Family Therapy"
    ],
    testimoni: [
      {
        kutipan: "Ibu Galuh sangat objektif dan hangat dalam membimbing kami menemukan titik terang dari masalah komunikasi yang bertahun-tahun membebani pernikahan kami.",
        pemberi: "Pasangan K. & R."
      }
    ]
  },
  '3': {
    id: '3',
    id_spesialisasi: 'spec-3',
    nama_gelar: 'Dimas Ardiansyah, M.Psi., Psikolog',
    email: 'dimas@empathika.com',
    no_str: '180152144-1122334',
    no_sipp: '0714-20-1-2',
    foto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    videoIntroUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    videoDuration: '02:10',
    bio: 'Membantu remaja dan dewasa muda dalam menghadapi krisis identitas, burnout, dan arah tujuan hidup.',
    quote: 'Menemukan arah hidup dimulai dari keberanian untuk jujur pada diri sendiri tentang apa yang kita rasakan.',
    instagram: '@dimas.ardian',
    jenisKelamin: 'Laki-laki',
    pendidikanText: 'Universitas Indonesia',
    status: 'ACTIVE',
    jumlah_sesi: 0,
    tarif_per_jam: 175000,
    spesialisasi: { id: 'spec-3', nama: 'Psikolog Perkembangan' },
    category: 'psikolog',
    experienceYears: '4 - 7 Tahun',
    labelJadwal: 'Jadwal Konsultasi',
    jadwalTersedia: [],
    jadwalAssociate: [],
    profilLengkap: [
      "Dimas Ardiansyah, M.Psi., Psikolog mendalami psikologi perkembangan dengan spesialisasi transisi masa remaja ke fase dewasa awal (emerging adulthood).",
      "Dengan gaya komunikasi yang santai namun berbasis bukti ilmiah, Dimas membantu klien mengeksplorasi nilai-nilai hidup, mengatasi kecemasan masa depan, dan merancang roadmap hidup yang lebih bermakna."
    ],
    keahlian: [
      "Pencarian Jati Diri & Eksistensial",
      "Karier & Quarter Life Crisis",
      "Manajemen Burnout & Kecanduan Digital",
      "Kecemasan Sosial"
    ],
    pendidikan: [
      "Magister Profesi Psikologi - Universitas Indonesia"
    ],
    pendekatanTerapi: [
      "Acceptance and Commitment Therapy (ACT)",
      "Solution-Focused Brief Therapy (SFBT)"
    ],
    testimoni: [
      {
        kutipan: "Mas Dimas asik banget diajak ngobrol. Gak kerasa kayak lagi dihakimi, tapi bener-bener dibantu nemu akar masalah dan langkah konkrit.",
        pemberi: "F. M. (21 Tahun, Mahasiswa)"
      }
    ]
  }
};

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