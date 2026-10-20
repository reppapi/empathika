import { PsikologUI, KategoriProfesional } from '@/types/psikolog';

export function mapDbPsikologToUI(item: any): PsikologUI {
  const cat = (item.kategori || '').toLowerCase();
  let category: KategoriProfesional = 'psikolog';
  if (cat.includes('peer')) {
    category = 'peer-konselor';
  } else if (cat.includes('konselor')) {
    category = 'konselor';
  }

  let keahlianList: string[] = [];
  if (Array.isArray(item.keahlian)) {
    keahlianList = item.keahlian;
  } else if (typeof item.keahlian === 'string' && item.keahlian.trim()) {
    keahlianList = item.keahlian.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else {
    keahlianList = [];
  }

  // Format jadwal tersedia dari jadwal_slot jika ada
  let jadwalTersedia: { waktu: string; tipe: 'online' | 'offline' }[] = [];
  if (item.jadwal_slot && Array.isArray(item.jadwal_slot) && item.jadwal_slot.length > 0) {
    jadwalTersedia = item.jadwal_slot.slice(0, 2).map((slot: any) => {
      let jamMulai = '09:00';
      let jamSelesai = '10:00';
      if (typeof slot.jam_mulai === 'string') {
        const match = slot.jam_mulai.match(/(\d{2}:\d{2})/);
        if (match) jamMulai = match[1];
      }
      if (typeof slot.jam_selesai === 'string') {
        const match = slot.jam_selesai.match(/(\d{2}:\d{2})/);
        if (match) jamSelesai = match[1];
      }
      return {
        waktu: `${jamMulai} - ${jamSelesai}`,
        tipe: 'online' as const,
      };
    });
  } else if (item.jadwalTersedia && Array.isArray(item.jadwalTersedia)) {
    jadwalTersedia = item.jadwalTersedia;
  } else {
    jadwalTersedia = [
      { waktu: '09:30 - 10:30', tipe: 'online' },
      { waktu: '14:00 - 15:00', tipe: 'online' },
    ];
  }

  return {
    id: item.id,
    id_spesialisasi: item.id_spesialisasi || 'spec',
    nama_gelar: item.nama_gelar || item.account?.nama || 'Psikolog Empathika',
    email: item.account?.email || item.email || '',
    no_str: item.no_str || null,
    no_sipp: item.no_sipp || null,
    foto: item.foto || '/images/psikolog/default.jpg',
    bio: item.bio || 'Praktisi kesehatan mental profesional yang berdedikasi mendampingi proses pemulihan dan pertumbuhan diri klien.',
    quote: item.quote || 'Setiap perjalanan pemulihan dimulai dari keberanian untuk mendengarkan diri sendiri.',
    instagram: item.instagram || '@empathika.id',
    jenisKelamin: item.jenis_kelamin || 'Perempuan',
    pendidikanText: item.pendidikan || 'Universitas Indonesia',
    keahlian: keahlianList,
    status: item.status || 'ACTIVE',
    jumlah_sesi: item.jumlah_sesi || 50,
    tarif_per_jam: Number(item.tarif_per_jam) || 150000,
    spesialisasi: item.spesialisasi
      ? {
          id: item.spesialisasi.id || 'spec-1',
          nama: item.spesialisasi.nama || item.kategori || 'Psikolog Klinis',
        }
      : {
          id: 'spec-1',
          nama: item.kategori || 'Psikolog Klinis',
        },
    category,
    experienceYears: item.pengalaman_tahun || '3 - 6 Tahun',
    labelJadwal: 'Jadwal Terdekat',
    jadwalTersedia,
  };
}
